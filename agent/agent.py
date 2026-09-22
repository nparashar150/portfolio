"""The voice agent behind nparashar150.com.

Talks about Naman, books 30-minute calls against his real calendar, and records
contact details as calendar entries so he can follow up.

Two hard-won constraints shape the tool design (see tools_probe.py):

  * The LLM gets the *year* wrong when composing timestamps, so `book_call` takes
    an opaque slot id. It never sees or constructs a date.
  * The LLM passes spoken email through raw ("rahul at acme dot com"), so email
    is only ever collected by GetEmailTask, never as a tool argument.
"""

from __future__ import annotations

import asyncio
import json
import logging
import os
from dataclasses import dataclass, field

from dotenv import load_dotenv
from livekit import agents
from livekit.agents import (
    Agent,
    AgentServer,
    AgentSession,
    RunContext,
    ToolError,
    function_tool,
    room_io,
)
from livekit.agents.beta.tools import EndCallTool
from livekit.agents.voice.background_audio import (
    AudioConfig,
    BackgroundAudioPlayer,
    BuiltinAudioClip,
)
from livekit.agents.beta.workflows import GetEmailTask, GetPhoneNumberTask
from livekit import rtc
from livekit.plugins import sarvam, silero

# Before importing anything that reads the environment.
load_dotenv(".env.local")

import booking  # noqa: E402
import content  # noqa: E402
logger = logging.getLogger("naman-agent")

# The daemon detaches, so its stdout is lost. Set AGENT_LOG_FILE to keep tracebacks.
if os.environ.get("AGENT_LOG_FILE"):
    _h = logging.FileHandler(os.environ["AGENT_LOG_FILE"])
    _h.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(name)s %(message)s"))
    logging.getLogger().addHandler(_h)
    logging.getLogger().setLevel(logging.INFO)

VOICE = os.environ.get("AGENT_VOICE", "shubh")          # bulbul:v3 preset
# Legacy STT + silero VAD by default. Sarvam's realtime API raises a *fatal*
# inactivity_timeout after 60s of silence and does not reconnect (it bills per
# connection), which kills the session for a visitor who starts a call and then
# just reads the page. Silero gates the audio so the socket only opens on speech.
USE_REALTIME_STT = os.environ.get("SARVAM_REALTIME_STT", "0") == "1"
BOOKING_TOPIC = "booking.confirmed"                      # read by AgentConsole.tsx
SLOTS_TOPIC = "slots.offered"                            # ditto — renders as chips
DETAILS_RPC = "ui.collectDetails"                        # typed name + email in the browser

# Hang up on a silent visitor. Someone who clicked play and wandered off would
# otherwise hold an open session (and keep billing) indefinitely.
IDLE_SECONDS = float(os.environ.get("AGENT_IDLE_SECONDS", "30"))

# The idle timeout only fires on silence, so it does nothing against someone
# holding a session open with continuous audio — a podcast into the mic keeps
# STT, the LLM and TTS billing indefinitely. This is the ceiling regardless.
MAX_SESSION_SECONDS = float(os.environ.get("AGENT_MAX_SESSION_SECONDS", "600"))

# check_availability queries three calendars and book_call re-validates before
# writing. Both are silent seconds mid-conversation, which reads as a dropped
# call rather than as thinking. A faint keyboard fills them.
THINKING_VOLUME = float(os.environ.get("AGENT_THINKING_VOLUME", "0.5"))


@dataclass
class Visitor:
    """Per-session state. `offered` is the slot-id map the LLM books against."""

    tz: str = "Asia/Kolkata"
    referrer: str = ""
    offered: dict[str, str] = field(default_factory=dict)  # "s1" -> ISO start
    email: str | None = None
    pending_slot: str | None = None   # slot id held while we collect an email
    name: str = ""
    contacted: bool = False       # already logged a lead; don't duplicate
    # AgentSession exposes room_io, not room, so keep an explicit handle for
    # publishing to the browser.
    room: "rtc.Room | None" = None


# Names and product words the STT otherwise mangles ("Naman" -> "Laman").
STT_PROMPT = (
    "Naman Parashar, nparashar150, Sylva, Ringg AI, DesiVocal, QuikRun, Pixio, "
    "Antler, CareFi, LiveKit, Sarvam, voice AI, Next.js, TypeScript"
)


class Assistant(Agent):
    def __init__(self, visitor_tz: str) -> None:
        super().__init__(
            instructions=content.instructions(visitor_tz),
            # Lets the agent hang up itself rather than leaving the line open
            # (and billing) after the visitor is done.
            tools=[EndCallTool(
                extra_description=(
                    "Use this once the visitor is finished — they've said goodbye, "
                    "or the booking is done and they have nothing else to ask."
                ),
                # Returning an instruction makes the model read the call as
                # unfinished and fire it again — it looped four times in a real
                # session. End immediately; the prompt says goodbye first.
                end_instructions=None,
            )],
        )

    # --- availability ------------------------------------------------------

    @function_tool()
    async def check_availability(self, context: RunContext, date_hint: str = "") -> str:
        """Find open 30-minute call slots on Naman's calendar.

        Call this whenever the visitor wants to book, schedule, or asks what times
        are free. Read back two or three of the labels exactly as given, then use
        the matching id with book_call.

        Args:
            date_hint: Any timing preference they mentioned, e.g. "next week".
                Free text, may be empty. Used only for logging.
        """
        v: Visitor = context.session.userdata
        try:
            slots = await asyncio_to_thread(booking.free_slots, v.tz, limit=6)
        except Exception as e:
            logger.exception("availability lookup failed")
            raise ToolError("I couldn't reach his calendar just then.") from e

        if not slots:
            return ("No open slots in the next two weeks. Offer to take their "
                    "contact details instead.")

        v.offered = {f"s{i+1}": s["start"] for i, s in enumerate(slots)}
        listed = [{"id": f"s{i+1}", "label": s["label"]} for i, s in enumerate(slots)]

        # Reading six times aloud is unusable; the browser renders them as chips
        # the visitor can just tap. Speech and UI stay in sync because both come
        # from this one list.
        await _publish(v, SLOTS_TOPIC, {"slots": listed, "tz": v.tz})

        logger.info("offered %d slots (hint=%r)", len(slots), date_hint)
        return json.dumps(listed)

    # --- booking -----------------------------------------------------------

    @function_tool()
    async def book_call(
        self, context: RunContext, slot_id: str, brief: str, name: str = ""
    ) -> str:
        """Book a 30-minute call in a slot that check_availability offered.

        Call this as soon as they pick a time. Do NOT ask for their name or
        email first — collect_details gathers both on screen, and asking for
        them by voice only makes the visitor say it twice.

        Args:
            slot_id: The id of the chosen slot, e.g. "s1". Never a date.
            brief: One or two sentences on what they want to discuss, so Naman
                can prepare. Summarise it from the conversation; if they haven't
                said, put what you can infer.
            name: Only if they already volunteered it. Leave empty otherwise.
        """
        v: Visitor = context.session.userdata

        start = v.offered.get(slot_id)
        if start is None:
            raise ToolError(
                "I've lost track of those times. Check availability again."
            )

        v.name = name or v.name

        # An email is required, but it CANNOT be collected here: GetEmailTask
        # hands control away, this invocation ends, and the booking is lost.
        # So bail out, let the model collect the email, and have it call again.
        if not v.email:
            v.pending_slot = slot_id
            return ("FAILED: nothing was booked. The slot is still free and is "
                    "NOT held. Do NOT say booked, confirmed, all set, or "
                    "'you're in'. Tell them you just need a couple of details, "
                    "then call collect_details, then call book_call again with "
                    f"slot_id {slot_id}.")

        # Writing to the calendar can't be half-done, so hold the turn.
        context.disallow_interruptions()
        try:
            res = await asyncio_to_thread(
                booking.book, start, v.name or "Visitor", v.email, brief, v.tz
            )
        except RuntimeError as e:
            raise ToolError(f"{e}. Offer one of the other times.") from e
        except Exception as e:
            logger.exception("booking failed")
            raise ToolError("Something went wrong writing to his calendar.") from e

        v.contacted = True
        v.pending_slot = None
        await _publish_booking(context, res, v)
        logger.info("booked %s for %s", res["label"], v.email)
        return (f"Booked {res['label']}. Tell them it's confirmed, that the join "
                "link is on screen and in the calendar invite, and that Naman "
                "will see it. Do not read the link out loud.")

    # --- contact capture ---------------------------------------------------

    @function_tool()
    async def collect_details(self, context: RunContext) -> str:
        """Ask for the visitor's name and email so a call can be booked.

        Call this when book_call says details are needed. Don't ask for a name
        or an address in your own words — this puts a short form on screen and
        falls back to asking aloud if there's no browser.
        """
        v: Visitor = context.session.userdata

        typed = await _ask_browser_for_details(v)
        if typed:
            v.name = typed.get("name") or v.name
            v.email = typed.get("email") or v.email
            logger.info("details captured via UI form")
            if v.email:
                if v.pending_slot:
                    return (f"Got {v.name} at {v.email}. Now call book_call again "
                            f"with slot_id {v.pending_slot}. It is NOT booked "
                            "until that succeeds.")
                return f"Got {v.name} at {v.email}."

        result = await GetEmailTask(chat_ctx=self.chat_ctx)
        v.email = getattr(result, "email_address", None)
        if not v.email:
            return ("No email given. Offer leave_other_contact instead, or drop "
                    "the booking.")
        if v.pending_slot:
            return (f"Email is {v.email}. Now call book_call again with slot_id "
                    f"{v.pending_slot}. It is NOT booked until that succeeds.")
        return f"Email is {v.email}."

    @function_tool()
    async def leave_contact(
        self, context: RunContext, brief: str, when: str = ""
    ) -> str:
        """Take the visitor's email so Naman can reach out.

        Call this when they'd rather be contacted than book now, or when they
        offer an email address. Do not ask for the address yourself — this
        collects and confirms it.

        Args:
            brief: One or two sentences on what they want. Summarise it.
            when: When they'd like to be contacted, in their words. May be empty.
        """
        v: Visitor = context.session.userdata
        email = v.email
        if not email:
            result = await GetEmailTask(chat_ctx=self.chat_ctx)
            email = getattr(result, "email_address", None)
        if not email:
            return ("They didn't give an email. Offer to take a phone number or a "
                    "social handle via leave_other_contact.")

        v.email = email
        return await _log(context, v, "email", email, brief, when)

    @function_tool()
    async def leave_other_contact(
        self,
        context: RunContext,
        method: str,
        handle: str,
        brief: str,
        when: str = "",
    ) -> str:
        """Take a phone number or social handle instead of an email.

        Args:
            method: One of "phone", "instagram", "twitter", "linkedin", "other".
            handle: The handle as they gave it. For a phone number, pass anything
                and it will be confirmed properly.
            brief: One or two sentences on what they want.
            when: When they'd like to be contacted, in their words.
        """
        v: Visitor = context.session.userdata
        method = (method or "other").lower().strip()

        if method == "phone":
            # Spoken digits are as unreliable as spoken email; confirm them.
            result = await GetPhoneNumberTask(chat_ctx=self.chat_ctx)
            handle = getattr(result, "phone_number", None) or handle
            if not handle:
                return "They didn't give a usable number. Offer another way."

        return await _log(context, v, method, handle, brief, when)


# --- helpers -----------------------------------------------------------------

async def asyncio_to_thread(fn, *args, **kwargs):
    """Google's client is blocking; keep it off the event loop."""
    import functools

    return await asyncio.to_thread(functools.partial(fn, *args, **kwargs))


async def _log(context: RunContext, v: Visitor, method: str, handle: str,
               brief: str, when: str) -> str:
    """Write the lead immediately — a closed tab must still deliver it."""
    try:
        await asyncio_to_thread(
            booking.log_lead, v.name or "anon", method, handle, brief, when or None
        )
    except Exception as e:
        logger.exception("lead logging failed")
        raise ToolError("I couldn't save that just now.") from e

    v.contacted = True
    logger.info("lead logged: %s -> %s", method, handle)
    return f"Saved. Tell them Naman will reach out via {method}."


async def _ask_browser_for_details(v: Visitor) -> dict | None:
    """Ask the page for a typed name and email. None if it can't or won't.

    Typing beats dictation: STT mangles both names ("Naman" -> "Laman") and
    addresses, and reading either back to confirm costs a whole turn. But a
    caller may have no UI at all (SIP, the Agent Console) and may dismiss the
    form, so every failure falls back to asking aloud rather than dead-ending.
    """
    room = v.room
    if room is None:
        return None
    try:
        identity = next(iter(room.remote_participants))
    except StopIteration:
        return None

    try:
        raw = await room.local_participant.perform_rpc(
            destination_identity=identity,
            method=DETAILS_RPC,
            payload=json.dumps({"prompt": "Your details"}),
            response_timeout=120.0,   # a human has to type two fields
        )
        got = json.loads(raw) or {}
        email = (got.get("email") or "").strip()
        if not email:
            return None
        return {"name": (got.get("name") or "").strip(), "email": email}
    except Exception as e:
        logger.info("no typed details (%s: %s); asking by voice",
                    type(e).__name__, str(e)[:200])
        return None


async def _publish(v: Visitor, topic: str, payload: dict) -> None:
    """Push structured state to the browser. Never fatal — the UI is a bonus."""
    if v.room is None:
        logger.warning("no room handle; skipping %s", topic)
        return
    try:
        await v.room.local_participant.send_text(json.dumps(payload), topic=topic)
        logger.info("published %s", topic)
    except Exception:
        logger.warning("could not publish %s", topic, exc_info=True)


async def _publish_booking(context: RunContext, res: dict, v: Visitor) -> None:  # noqa: ARG001
    """Tell the browser, so the site can render a card with an .ics link."""
    await _publish(v, BOOKING_TOPIC, {
        "start": res["start"],
        "label": res["label"],
        "minutes": booking.SLOT_MINUTES,
        "email": v.email,
        "tz": v.tz,
        "joinUrl": res.get("join_url"),
        # True when Google emailed a real invite, so the UI can drop the .ics
        "invited": bool(res.get("invited")),
    })
    # The offer is spent; clear the chips so a stale list can't be tapped.
    await _publish(v, SLOTS_TOPIC, {"slots": [], "tz": v.tz})


def _build_stt():
    if USE_REALTIME_STT:
        # Sarvam's realtime API brings its own VAD, so no silero needed.
        return sarvam.STTRealtime(language="en-IN", stream_type="balanced"), None
    return sarvam.STT(language="en-IN", model="saaras:v4",
                      prompt=STT_PROMPT,
                      high_vad_sensitivity=True), silero.VAD.load()


# --- entrypoint --------------------------------------------------------------

server = AgentServer()


@server.rtc_session(agent_name="naman")
async def entrypoint(ctx: agents.JobContext):
    meta: dict = {}
    if ctx.job.metadata:
        try:
            meta = json.loads(ctx.job.metadata)
        except ValueError:
            logger.warning("unparseable job metadata: %r", ctx.job.metadata)

    visitor = Visitor(
        tz=meta.get("tz") or "Asia/Kolkata",
        referrer=meta.get("referrer", ""),
        room=ctx.room,
    )
    # Whether writes go out as Naman (real Meet + invite) or fall back to the
    # service account (no conferencing). Logged every session because the
    # difference is invisible until someone books.
    logger.info(
        "session start tz=%s referrer=%s oauth=%s",
        visitor.tz, visitor.referrer,
        "on" if booking._oauth_service() is not None else "OFF-fallback",
    )

    stt, vad = _build_stt()
    session = AgentSession[Visitor](
        userdata=visitor,
        user_away_timeout=IDLE_SECONDS,
        stt=stt,
        vad=vad,
        # Sarvam's realtime API detects turns itself; the default TurnDetector
        # would need a separate VAD model we don't otherwise load.
        turn_detection=None if USE_REALTIME_STT else agents.NOT_GIVEN,
        llm=sarvam.LLM(model="sarvam-105b-conversations"),
        tts=sarvam.TTS(
            target_language_code="en-IN",
            model="bulbul:v3",
            speaker=VOICE,
            speech_sample_rate=22050,
            pace=1.0,
        ),
    )

    async def _hard_stop() -> None:
        await asyncio.sleep(MAX_SESSION_SECONDS)
        logger.info("session hit the %.0fs ceiling; closing", MAX_SESSION_SECONDS)
        try:
            await session.generate_reply(instructions=(
                "Say one short line that you have to wrap up there, and they can "
                "start again any time. Do not ask a question."
            ))
        except Exception:
            logger.debug("wrap-up line failed", exc_info=True)
        finally:
            await session.aclose()

    ceiling = asyncio.create_task(_hard_stop())

    async def _cancel_ceiling() -> None:
        # Must be a coroutine: add_shutdown_callback awaits what it's given.
        ceiling.cancel()

    ctx.add_shutdown_callback(_cancel_ceiling)

    @session.on("user_state_changed")
    def _on_user_state(ev) -> None:
        # Fires once the visitor has been silent for IDLE_SECONDS.
        if getattr(ev, "new_state", None) != "away":
            return
        logger.info("visitor idle for %.0fs; closing", IDLE_SECONDS)

        async def _wrap_up() -> None:
            try:
                await session.generate_reply(instructions=(
                    "Say one short line that you'll let them go, and that they "
                    "can start again any time. Do not ask a question."
                ))
            except Exception:
                logger.debug("idle goodbye failed", exc_info=True)
            finally:
                await session.aclose()

        asyncio.create_task(_wrap_up())

    await session.start(
        room=ctx.room,
        agent=Assistant(visitor.tz),
        room_options=room_io.RoomOptions(close_on_disconnect=True),
    )

    # Published as a separate track, so it never mixes into the agent's speech.
    background = BackgroundAudioPlayer(
        thinking_sound=[
            AudioConfig(BuiltinAudioClip.KEYBOARD_TYPING, volume=THINKING_VOLUME),
            AudioConfig(BuiltinAudioClip.KEYBOARD_TYPING2, volume=THINKING_VOLUME),
        ],
    )
    try:
        await background.start(room=ctx.room, agent_session=session)
    except Exception:
        # Cosmetic: a silent pause is worse than no pause, but not fatal.
        logger.warning("background audio unavailable", exc_info=True)

    await session.generate_reply(instructions=(
        "Greet them in one short sentence. Say you're Naman's site agent and "
        "they can ask about his work, or book a call right now. Don't list anything."
    ))


if __name__ == "__main__":
    agents.cli.run_app(server)
