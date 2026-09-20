"""Probe: does our LLM actually call the agent's tools?

Not a unit test - it hits the Sarvam API and costs money. Run it when changing
model or tool schemas. It exists because the model choice rests on the answer.

Findings on 2026-09-21 with livekit-agents 1.8.2:
  * sarvam-105b-conversations  -> reliable tool selection, 3/3 on book_call
  * sarvam-105b                -> 400, endpoint in beta and not enabled
  * it mangles spoken email ("rahul at acme dot com") -> use GetEmailTask
  * it hallucinates the YEAR in timestamps -> book_call takes a slot id,
    never an ISO string

Run: uv run python tools_probe.py
"""

import asyncio, os, pathlib, re, sys
from livekit.agents import function_tool
from livekit.agents import llm as L
from livekit.plugins import sarvam

# SARVAM_API_KEY lives in the portfolio root .env
env = pathlib.Path("../.env").read_text()
os.environ["SARVAM_API_KEY"] = re.search(r"SARVAM_API_KEY=(\S+)", env).group(1).strip("'\"")

SCHEMAS = [
 ("check_availability", "Find open 30-minute call slots on Naman's calendar. Call this when the user wants to book, schedule, or asks what times are free.",
  {"type":"object","properties":{"date_hint":{"type":"string","description":"Any timing preference the user mentioned, e.g. 'next week', 'Saturday afternoon'. Empty string if none."}},"required":["date_hint"]}),
 ("book_call", "Confirm a 30-minute call in a specific slot. Only call after check_availability and after you have their email.",
  {"type":"object","properties":{"slot_start":{"type":"string","description":"ISO 8601 start time of the chosen slot"},"name":{"type":"string"},"email":{"type":"string"},"brief":{"type":"string","description":"Short summary of what they want to discuss"}},"required":["slot_start","name","email","brief"]}),
 ("save_lead", "Record a visitor's contact details so Naman can reach out. Call this whenever the user gives an email, phone number, or social handle, or asks for a callback instead of booking now.",
  {"type":"object","properties":{"name":{"type":"string"},"method":{"type":"string","enum":["email","phone","instagram","twitter","linkedin","other"]},"handle":{"type":"string","description":"The address, number or handle itself"},"brief":{"type":"string"},"when":{"type":"string","description":"When they want to be contacted, verbatim. Empty string if unspecified."}},"required":["name","method","handle","brief","when"]}),
]

def build_tools():
    tools = []
    for name, desc, params in SCHEMAS:
        async def h(raw_arguments, context, _n=name): return None
        tools.append(function_tool(h, raw_schema={
            "type":"function","name":name,"description":desc,"parameters":params}))
    return tools

SYSTEM = ("You are the voice of Naman Parashar's portfolio site. You speak for him. "
  "Keep answers short and spoken-friendly. You have tools to check his calendar, book a "
  "30-minute call, and record contact details. Use them whenever relevant. Never invent "
  "availability - always call check_availability first.")

CASES = [
 ("yeah I'd like to book a call with him",                              "check_availability"),
 ("what times does he have free next week?",                            "check_availability"),
 ("book me the Saturday three pm one, I'm Rahul, rahul at acme dot com, want to talk about a contract", "book_call"),
 ("just email me, it's priya at example dot com",                       "save_lead"),
 ("call me back Tuesday evening, my number is nine eight seven six five four three two one zero", "save_lead"),
 ("just DM me on instagram, at rahul underscore builds",                "save_lead"),
 ("tell me about his experience with voice AI",                         None),
 ("who is Naman?",                                                      None),
]

async def run(model, tools, passes=2):
    llm = sarvam.LLM(model=model)
    rows, ok = [], 0
    for utt, want in CASES:
        got_any = []
        for _ in range(passes):
            ctx = L.ChatContext.empty()
            ctx.add_message(role="system", content=SYSTEM)
            ctx.add_message(role="user", content=utt)
            called = []
            try:
                async with llm.chat(chat_ctx=ctx, tools=tools) as stream:
                    async for ch in stream:
                        for tc in (ch.delta.tool_calls or []) if ch.delta else []:
                            n = getattr(tc, "name", None) or getattr(tc, "function_name", None)
                            if n: called.append(n)
            except Exception as e:
                called.append(f"ERROR:{type(e).__name__}:{str(e)[:60]}")
            got_any.append(called[0] if called else None)
        hit = all(g == want for g in got_any)
        ok += hit
        rows.append((("PASS" if hit else "FAIL"), utt[:46], want or "(no tool)", got_any))
    print(f"\n=== {model} ===")
    for st, u, w, g in rows:
        print(f"  {st}  {u:<48} want={w:<19} got={g}")
    print(f"  --> {ok}/{len(CASES)} consistent across {passes} passes")
    return ok, len(CASES)

async def main():
    tools = build_tools()
    print("tools:", [getattr(t,"id",None) or t.__name__ for t in tools])
    total = []
    for m in ["sarvam-105b-conversations"]:
        try:
            total.append(await run(m, tools))
        except Exception as e:
            print(f"\n=== {m} === FAILED TO RUN: {type(e).__name__}: {e}")
    return total

asyncio.run(main())
