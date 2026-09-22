# naman ▌

Personal portfolio for Naman Parashar — an engineer building AI-first web products.

A single-page editorial site with a voice agent that does real work. The idle state
renders a GitHub-style contribution grid that morphs into a live waveform when you start
a call. The agent answers from this repo's own content, checks a real calendar, books a
call with a Google Meet link, and emails a summary of the conversation.

## How it fits together

```
browser
  │
  ├─ POST /api/webcall ─────────► Vercel        mints a LiveKit JWT, dispatches the agent
  │
  └─ WebRTC ────────────────────► LiveKit Cloud
                                       │
                                       └─ agent worker   Python, deployed to ap-south
                                              ├─► Sarvam            STT · LLM · TTS
                                              └─► Google Calendar   free/busy + booking
```

No database. Site content is the agent's source of truth, and the calendar is the
booking system.

## Stack

**Site** — Next.js (App Router), React 19, TypeScript, Tailwind CSS v4, Motion

**Agent** — LiveKit Agents (Python), Sarvam (`saaras:v4` STT, `sarvam-105b-conversations`,
`bulbul:v3` TTS), Silero VAD, Google Calendar + Gmail

## Develop

```bash
pnpm install
pnpm dev                 # http://localhost:3000
```

The agent runs separately:

```bash
cd agent
uv sync
uv run python agent.py dev          # connects to LiveKit
uv run python booking.py            # slot-logic self-check, no network
uv run python booking.py access     # verify calendar read AND write
```

`agent/.env.local` holds the credentials; `authorize.py` performs the one-time Google
sign-in and `--push` copies the result to the deployed worker.

## Structure

```
app/                     routes, layout, theme tokens
  api/webcall/           mints the LiveKit token and dispatches the agent
components/              hero, work, projects, about, contact
  AgentConsole.tsx       the in-page console
  TalkDock.tsx           floating dock; expands into a call when scrolled away
  agent/
    CallEngine.tsx       LiveKit room, transcript, slots, booking, RPC
    Conversation.tsx     one thread — speech, slot chips, form, confirmation
lib/
  config.ts              all editable content (work, projects, rates, socials)
  content.ts             long-form pages (about, contact, privacy)
  agent-markdown.ts      renders the site as Markdown for agents
  agent/                 client-side stores, .ics generation
agent/
  agent.py               the worker: prompt, tools, session lifecycle
  booking.py             availability, conflicts, booking — with a self-check
  notify.py              emails the post-call summary
  content.py             builds the system prompt from the site snapshot
```

## Things that are deliberate

**Content lives in one place.** `lib/config.ts` feeds the site, the Markdown rendering
and the agent's prompt. Editing the site edits what the agent knows.

**The agent never handles a date or an address.** `check_availability` returns opaque
slot ids and `book_call` takes one — given ISO timestamps, the model got the year wrong
every time. Emails and phone numbers are typed into a form over RPC, because spoken ones
transcribe badly ("double nine" arrives as "two nine nine").

**Reads and writes use different Google identities.** A service account reads free/busy
across every calendar; writes go through OAuth as the owner, because a service account on
a consumer Gmail account can create neither a Meet link nor an attendee invite.

**An unreadable calendar is never treated as free.** It raises instead, so a sharing
mistake can't quietly book over real commitments.

## Agent-readable

The site serves Markdown to anything sending `Accept: text/markdown`, alongside
`llms.txt`, JSON-LD and the usual sitemap.

```bash
curl -H 'Accept: text/markdown' https://www.nparashar150.com/
pnpm test:agents          # 32 checks, needs the dev server running
```
