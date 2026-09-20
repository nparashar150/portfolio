# Voice agent rebuild — build checklist

Replacing the Ringg-hosted agent with a self-built LiveKit Agents worker that talks about
Naman, books calls, and captures leads.

**Ground rule:** Ringg keeps serving the site until Phase 4. Nothing here breaks the live
agent until the very last step.

**No email provider.** Leads land as entries on Naman's own Google Calendar (already
authenticated, already pushes to his phone). Visitors get their confirmation in the site UI
with an `.ics` download. Email can be added later without rebuilding anything.

---

## Phase 0 — Accounts & credentials (blocks everything)

### 0.1 Voice clone  ⏳ processing wait — start this first
> Sarvam TTS has no cloning (fixed roster of ~30 preset speakers). LiveKit's built-in
> cloning needs the Ship plan ($50/mo). A provider plugin with your own key avoids both.

- [ ] Pick Fish Audio or ElevenLabs (~$5/mo)
- [ ] Record 15–30s of clean speech — quiet room, mic close, normal pace, no whispering.
      Read your own About section; that's the register it'll be speaking in
- [ ] Create the clone, note the voice ID
- [ ] Play a test sentence back. If it sounds off, re-record — everything downstream
      inherits this

### 0.2 LiveKit Cloud
- [x] Create a project at https://cloud.livekit.io
- [x] Set the project region to **India** (Mumbai / South India)
- [x] Copy from Settings → Keys: `LIVEKIT_URL` (`wss://…`), `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`
- [x] Install the CLI (`brew install livekit-cli`, or see
      https://docs.livekit.io/reference/developer-tools/livekit-cli)
- [x] `lk cloud auth` — links the CLI to the project

### 0.3 Google Calendar (service account — NOT OAuth)
> OAuth refresh tokens expire every 7 days while the consent screen is in "Testing".
> The service account route has no token that rots.

- [x] New project at https://console.cloud.google.com
- [x] APIs & Services → Library → **Google Calendar API** → Enable
- [x] IAM & Admin → Service Accounts → Create service account (no roles needed)
- [x] On the service account → Keys → Add key → **JSON** → download
- [x] Copy the service account's email (`…@….iam.gserviceaccount.com`)
- [x] **The step people miss:** Google Calendar → Settings → *Settings for my calendars* →
      your calendar → **Share with specific people** → add that email → permission
      **"Make changes to events"**
- [x] Note the `CALENDAR_ID` (your gmail address, for the primary calendar)
- [x] **Verify with `cd agent && uv run python booking.py access`** — must print
      `READ: ok` *and* `WRITE: ok`. freebusy succeeds at the lowest share level, so a
      read-only check passes while every booking 403s. Only the write probe proves it

### 0.4 Sarvam
- [ ] `SARVAM_API_KEY` already exists in `.env` — confirm it's still valid
- [ ] **Confirm the plan includes realtime streaming STT access.** The `STTRealtime` class
      requires it; without it we fall back to the legacy `STT` class (one-line difference)

---

## Phase 0.5 — Decisions needed before code

- [x] Working hours — **Mon–Sat, 12:00–24:00 IST**, plus an 08:00–22:00 civil-hours guard in the visitor's own timezone
- [x] Call length (30 min?)
- [x] Minimum lead time before a booking — **2h** (default, changeable)
- [x] Max agent-made bookings per day — **3** (default, changeable)
- [x] Bookings land **confirmed instantly** (default, changeable)
- [x] Agent's first line — *drafted in Phase 2, pending your sign-off*

---

## Phase 1 — Calendar logic (no voice involved)

The riskiest code, so it ships first and standalone, with a test.

- [x] `agent/calendar.py`: authenticate with the service account JSON
- [x] freebusy query against `CALENDAR_ID`
- [x] slot generation — working hours ∩ free time ∩ lead time, returned in the **visitor's** tz
- [x] `create_event(...)` with the visitor's details + topic in the description
- [x] `log_lead(...)` — writes a non-booking lead as a calendar entry
      ("Lead: rahul@acme.com — wants a callback Tue evening IST, asked about voice AI")
- [x] Guards: max/day, min lead time, no double-booking
- [x] **One runnable assert check** — must fail if a busy slot is ever offered or a slot
      falls outside working hours
- [x] Verify a real event lands on the calendar and shows up on your phone
- [ ] Manually mark yourself **out of office** tomorrow afternoon and confirm those slots
      vanish from `free_slots` (freebusy should cover OOO; unverified). Anything marked
      **"Free"** won't block, by design

---

## Phase 2 — The worker

- [ ] `lk agent init agent --template agent-starter-python`
- [ ] **Verify Sarvam 105B reliably calls tools.** ⚠️ Highest-risk unknown — if it fails,
      swap the LLM here and nothing else changes. Do this before building the tools out
- [ ] `AgentServer` + `@server.rtc_session(agent_name="naman")`
- [ ] STT: Sarvam `STTRealtime` (`saaras:v3-realtime`, `en-IN`)
- [ ] TTS: Fish/ElevenLabs plugin with the cloned voice
- [ ] System prompt generated from the real `lib/config.ts` + `lib/content.ts` —
      not hand-copied, so it can't drift from the site
- [ ] Read visitor tz + referrer off `ctx.job.metadata`
- [ ] `save_lead(name, method, handle, when?, topic)` — writes the calendar entry
      **immediately**, not at session end, so a closed tab still delivers the lead
- [ ] `check_availability(...)` — read-only, interruptible
- [ ] `book_call(...)` — `context.disallow_interruptions()` first (mutating), `ToolError` on failure
- [ ] On successful booking, publish the details to the frontend on a custom text-stream
      topic (e.g. `booking.confirmed`) so the UI can render a confirmation card
- [ ] `GetEmailTask` with a fallback tool so "just DM me @handle" still counts as a capture
- [ ] `GetPhoneNumberTask` for the callback path
- [ ] Resolve vague callback windows ("Tuesday evening") to IST before they hit the calendar
- [ ] Test all five exits — book now / callback / email / social handle / just browsing.
      Use `lk agent daemon` (text mode, start/say/stop) to drive these programmatically
      with no mic, then `lk agent console` to hear it once the logic is right

---

## Phase 3 — Confirmation in the UI

Replaces the email confirmation. This is the one place the frontend gains new code rather
than just changing a line.

- [ ] `AgentConsole.tsx`: register a handler for the `booking.confirmed` topic
- [ ] Render a confirmation card — date, time in the visitor's tz, duration, who with
- [ ] "Add to calendar" → client-generated `.ics` blob download
- [ ] Verify it survives the visitor reloading mid-session (or accept that it doesn't —
      the booking is already on the calendar either way)

---

## Phase 4 — Cutover

- [ ] `app/api/webcall/route.ts` — rewrite: mint JWT, **random room name per visitor**
      (token dispatch only fires on room creation), dispatch `naman` with
      `metadata: { tz, locale, referrer }`
- [ ] `components/AgentConsole.tsx` — send `Intl.DateTimeFormat().resolvedOptions().timeZone`
- [ ] `lib/agent/store.ts:1` — new `LIVEKIT_URL`
- [ ] Verify against the dev worker: audio, transcript, **and** text chat
- [ ] Check whether interim transcripts double-render — `useTranscriptions` emits both
      interim and final streams per segment; filter on `lk.transcription_final` if so
- [ ] `lib/content.ts` — privacy paragraph: you now collect strangers' emails and phone
      numbers by voice, and what you do with them
- [ ] Remove the hardcoded `pk_live_…` Ringg key
- [ ] `lk agent create` — deploy to `ap-south` (Mumbai)
- [ ] Smoke test on the live site from a phone on mobile data
- [ ] Delete the Ringg code path

---

## Secrets inventory

Set via LiveKit Cloud secrets management — never in the image, never in git.

| Key | Used by |
|---|---|
| `GOOGLE_SERVICE_ACCOUNT_JSON` | worker |
| `CALENDAR_ID` | worker |
| `SARVAM_API_KEY` | worker |
| `FISH_API_KEY` / `ELEVEN_API_KEY` | worker |
| `VOICE_ID` | worker |
| `LIVEKIT_API_KEY` / `LIVEKIT_API_SECRET` | portfolio token route only |

`LIVEKIT_URL` / `LIVEKIT_API_KEY` / `LIVEKIT_API_SECRET` are injected automatically into
deployed workers — do **not** set them in the Dockerfile.

---

## Known ceilings (accepted, not bugs)

- **Cold start.** Free plan has no cold-start prevention — the first visitor after an idle
  period waits a few seconds. Only fix is Ship ($50/mo), which is ~6× the running cost.
- **No email to the visitor.** Confirmation lives in the UI only, so a visitor who closes
  the tab has no record of the time. Mitigation: you have their contact info and the
  booking is on your calendar. Add an email provider later if no-shows become real.
- **Slot generation is hand-rolled.** Going direct to Google instead of Cal.com means we own
  working-hours math and double-booking. Hence the Phase 1 test.

## Running cost

~₹700/mo — LiveKit ₹0 (free tier, and no LiveKit Inference since every model is on our own
key), Sarvam ~₹250, voice provider ~₹450, Google Calendar ₹0.

Optional later: a Telegram bot (via @BotFather) for push notifications instead of calendar
entries — 2 minutes, free, one `fetch`, no domain or DNS.
