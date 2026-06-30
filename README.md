# naman ▌

Personal portfolio for Naman Parashar — a day-zero engineer building AI-first web products.

A single-page editorial site with a live "talk to my agent" console: the idle state
renders a GitHub-style contribution grid that morphs into a real voice waveform when you
start a call. Voice and chat, powered by a RinggAI agent over LiveKit.

## Stack

- Next.js (App Router) + React 19
- TypeScript
- Tailwind CSS v4
- Framer Motion
- LiveKit (real-time voice + live transcript)

## Develop

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000.

## Structure

- `app/` — routes, layout, theme tokens, the webcall token route
- `components/` — sections (hero, work, projects, about, contact) + the agent console
- `components/agent/` — LiveKit call engine and visualizer
- `lib/config.ts` — all editable content (work, projects, socials)
