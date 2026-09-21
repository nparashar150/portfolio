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
from livekit.agents.beta.workflows import GetEmailTask, GetPhoneNumberTask
from livekit import rtc
from livekit.plugins import sarvam, silero

import booking
import content

load_dotenv(".env.local")
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


class Assistant(Agent):
    def __init__(self, visitor_tz: str) -> None:
        super().__init__(instructions=content.instructions(visitor_tz))

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
        logger.info("offered %d slots (hint=%r)", len(slots), date_hint)
        return json.dumps([
            {"id": f"s{i+1}", "label": s["label"]} for i, s in enumerate(slots)
        ])

    # --- booking -----------------------------------------------------------

    @function_tool()
    async def book_call(
        self, context: RunContext, slot_id: str, name: str, brief: str
    ) -> str:
        """Book a 30-minute call in a slot that check_availability offered.

        Only call this after check_availability, using one of the ids it returned.
        If you don't have the visitor's email yet, this will ask for it.

        Args:
            slot_id: The id of the chosen slot, e.g. "s1". Never a date.
            name: The visitor's name.
            brief: One or two sentences on what they want to discuss, so Naman
                can prepare. Summarise it from the conversation.
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
            return ("NOT BOOKED YET - no email on file. Call collect_email now, "
                    f"then call book_call again with slot_id {slot_id}. "
                    "Do not tell them it is booked yet.")

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
        return f"Booked {res['label']}. Tell them it's confirmed and he'll see it."

    # --- contact capture ---------------------------------------------------

    @function_tool()
    async def collect_email(self, context: RunContext) -> str:
        """Ask for and confirm the visitor's email address.

        Call this when book_call tells you an email is needed, or before booking
        if you don't have one. Do not ask for the address in your own words —
        this reads it back to confirm it, which spoken addresses need.
        """
        v: Visitor = context.session.userdata
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
    import asyncio
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


async def _publish_booking(context: RunContext, res: dict, v: Visitor) -> None:  # noqa: ARG001
    """Tell the browser, so the site can render a card with an .ics link."""
    room = getattr(v, "room", None)
    if room is None:
        logger.warning("no room handle; skipping %s", BOOKING_TOPIC)
        return
    try:
        await room.local_participant.send_text(
            json.dumps({
                "start": res["start"],
                "label": res["label"],
                "minutes": booking.SLOT_MINUTES,
                "email": v.email,
                "tz": v.tz,
            }),
            topic=BOOKING_TOPIC,
        )
        logger.info("published %s", BOOKING_TOPIC)
    except Exception:
        # The booking is already real; a missing card is cosmetic.
        logger.warning("could not publish %s", BOOKING_TOPIC, exc_info=True)


def _build_stt():
    if USE_REALTIME_STT:
        # Sarvam's realtime API brings its own VAD, so no silero needed.
        return sarvam.STTRealtime(language="en-IN", stream_type="balanced"), None
    return sarvam.STT(language="en-IN", model="saaras:v4",
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
    logger.info("session start tz=%s referrer=%s", visitor.tz, visitor.referrer)

    stt, vad = _build_stt()
    session = AgentSession[Visitor](
        userdata=visitor,
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

    await session.start(
        room=ctx.room,
        agent=Assistant(visitor.tz),
        room_options=room_io.RoomOptions(close_on_disconnect=True),
    )

    await session.generate_reply(instructions=(
        "Greet them in one short sentence. Say you're Naman's site agent and "
        "they can ask about his work, or book a call. Don't list anything."
    ))


if __name__ == "__main__":
    agents.cli.run_app(server)
