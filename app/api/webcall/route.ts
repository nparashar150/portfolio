import { RoomAgentDispatch, RoomConfiguration } from "@livekit/protocol";
import { AccessToken } from "livekit-server-sdk";
import { NextResponse } from "next/server";

// Mints a LiveKit token for a visitor and dispatches the `naman` agent into a
// fresh room. Replaces the old Ringg-hosted agent.
//
// Two things here are load-bearing:
//
//  * A NEW room name per visitor. Agent dispatch carried on a token only fires
//    when the room is first created, so reusing a name means the agent silently
//    never joins. It also keeps two visitors out of each other's call.
//  * The visitor's IANA timezone travels as job metadata, so the agent can offer
//    slots in their local time and never has to do date math (which the LLM
//    reliably gets wrong).

const AGENT_NAME = "naman";
const TOKEN_TTL = "15m";

export async function POST(req: Request) {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  if (!apiKey || !apiSecret) {
    console.error("webcall: LIVEKIT_API_KEY / LIVEKIT_API_SECRET not set");
    return NextResponse.json({ error: "not_configured" }, { status: 500 });
  }

  let tz = "Asia/Kolkata";
  let referrer = "";
  try {
    const body = await req.json();
    // Only accept a plausible IANA name; this ends up in the agent's prompt.
    if (typeof body?.tz === "string" && /^[\w+\-]+\/[\w+\-/]+$/.test(body.tz)) {
      tz = body.tz;
    }
    if (typeof body?.referrer === "string") referrer = body.referrer.slice(0, 200);
  } catch {
    // no body is fine — the defaults stand
  }

  const room = `site-${crypto.randomUUID()}`;

  try {
    const at = new AccessToken(apiKey, apiSecret, {
      identity: `visitor-${crypto.randomUUID().slice(0, 8)}`,
      ttl: TOKEN_TTL,
    });
    at.addGrant({ roomJoin: true, room, canPublish: true, canSubscribe: true });
    at.roomConfig = new RoomConfiguration({
      agents: [
        new RoomAgentDispatch({
          agentName: AGENT_NAME,
          metadata: JSON.stringify({ tz, referrer }),
        }),
      ],
    });

    return NextResponse.json({ user_token: await at.toJwt() });
  } catch (err) {
    console.error("webcall: token mint failed", err);
    return NextResponse.json({ error: "token_failed" }, { status: 500 });
  }
}
