import { NextResponse } from "next/server";

// Mirrors the DesiVocal agents-cdn webcall flow (dv-frontend-v2/apps/agents-cdn).
// POST {base}/calling/webcall  ->  { user_token }, then connect LiveKit with it.
const RINGG_BASE = "https://prod-api.ringg.ai/ca/api/v0";
const AGENT_ID = "2e8a2e7f-fc18-4c3f-93f4-46f49f53ad1a";
// pk_live_* publishable embed key for Naman's agent
const AUTHORIZATION = "Bearer pk_live_GrklnEd1n3gUX5RS0XzfJ552LnEHYEh7";

export async function POST(req: Request) {
  let mediaType: "audio" | "text" = "audio";
  try {
    const body = await req.json();
    if (body?.media_type === "text") mediaType = "text";
  } catch {
    // no body -> default to audio
  }

  try {
    const res = await fetch(`${RINGG_BASE}/calling/webcall`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: AUTHORIZATION,
        // RinggAI validates Origin against its allowlist
        Origin: "https://www.ringg.ai",
      },
      // exact body shape the official widget sends (no is_demo)
      body: JSON.stringify({
        agent_id: AGENT_ID,
        custom_args_values: {},
        media_type: mediaType,
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return NextResponse.json(
        { error: `upstream_${res.status}`, detail: detail.slice(0, 200) },
        { status: 502 },
      );
    }

    const data = (await res.json()) as { user_token?: string };
    if (!data?.user_token) {
      return NextResponse.json({ error: "no_token" }, { status: 502 });
    }
    return NextResponse.json({ user_token: data.user_token });
  } catch {
    return NextResponse.json({ error: "request_failed" }, { status: 500 });
  }
}
