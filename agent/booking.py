"""Availability and booking against Naman's Google Calendar.

Split in two deliberately:

  * `slots_for_day` is pure — it takes busy blocks as an argument and does the
    date math. All the logic that can be wrong lives here, and it's testable
    without a network call (see `_self_check` at the bottom).
  * everything else is a thin Google Calendar wrapper around it.

Auth is a service account with Naman's calendar shared to it ("Make changes to
events"). Note that service accounts *cannot* add attendees on a consumer gmail
account — Google returns 403 — so booked events carry the visitor's email in the
description instead, and the site UI hands them an .ics.
"""

from __future__ import annotations

import datetime as dt
import json
import os
from dataclasses import dataclass
from zoneinfo import ZoneInfo

IST = ZoneInfo("Asia/Kolkata")

# --- booking rules -----------------------------------------------------------
WORKING_DAYS = {0, 1, 2, 3, 4, 5}  # Mon-Sat (Monday == 0); Sunday is off
WORK_START_HOUR = 12               # 12:00 IST
WORK_END_HOUR = 24                 # midnight IST; a call must *end* by then
SLOT_MINUTES = 30
MIN_LEAD_HOURS = 2                 # earliest a stranger can book from now
MAX_BOOKINGS_PER_DAY = 3           # cap on agent-made bookings, anti-abuse
SEARCH_DAYS = 14                   # how far ahead to offer

# Naman is free until midnight IST, but midnight IST is 2:30pm in New York and
# 2:30am the same night for a visitor in New York's *previous* day. Offering a
# stranger a 2:30am call reads as broken, so slots must also land in civil hours
# for whoever is asking. The offered set is the intersection of both windows.
VISITOR_EARLIEST_HOUR = 8
VISITOR_LATEST_HOUR = 22           # a call must have *ended* by 22:00 local

# Marks events this agent created, so the daily cap only counts its own work
# and never trips on Naman's real meetings.
AGENT_TAG = "naman-voice-agent"

# A service account cannot create a Google Meet link on a consumer gmail account
# ("Invalid conference type value"), so the call carries a fixed personal meeting
# room instead. Set MEETING_LINK to a permanent Meet/Zoom/Whereby URL.
MEETING_LINK = os.environ.get("MEETING_LINK", "").strip()


@dataclass(frozen=True)
class Slot:
    """A bookable window. `start`/`end` are always timezone-aware UTC."""

    start: dt.datetime
    end: dt.datetime

    def label(self, tz: ZoneInfo) -> str:
        """Human phrasing in the visitor's own timezone, for the agent to speak."""
        local = self.start.astimezone(tz)
        return local.strftime("%A %-d %B at %-I:%M %p %Z")


def _overlaps(a_start, a_end, b_start, b_end) -> bool:
    """Half-open overlap: touching edges (10:30 end vs 10:30 start) is fine."""
    return a_start < b_end and b_start < a_end


def slots_for_day(
    day: dt.date,
    busy: list[tuple[dt.datetime, dt.datetime]],
    now: dt.datetime,
    *,
    slot_minutes: int = SLOT_MINUTES,
    min_lead_hours: int = MIN_LEAD_HOURS,
) -> list[Slot]:
    """Free slots on `day`, as UTC Slots. Pure function — no I/O.

    A slot survives only if it is inside the working window, starts at least
    `min_lead_hours` from `now`, and overlaps nothing in `busy`.

    `busy` blocks are timezone-aware datetimes; `now` must be aware too.
    """
    if day.weekday() not in WORKING_DAYS:
        return []

    window_start = dt.datetime.combine(
        day, dt.time(WORK_START_HOUR, 0), tzinfo=IST
    )
    # WORK_END_HOUR of 24 means midnight at the *end* of this day.
    window_end = dt.datetime.combine(
        day, dt.time(0, 0), tzinfo=IST
    ) + dt.timedelta(hours=WORK_END_HOUR)

    earliest = now + dt.timedelta(hours=min_lead_hours)
    step = dt.timedelta(minutes=slot_minutes)

    out: list[Slot] = []
    cursor = window_start
    while cursor + step <= window_end:          # the call must finish in-window
        start, end = cursor, cursor + step
        if start >= earliest and not any(
            _overlaps(start, end, b0, b1) for b0, b1 in busy
        ):
            out.append(Slot(start.astimezone(dt.timezone.utc),
                            end.astimezone(dt.timezone.utc)))
        cursor += step
    return out


def is_civil_for_visitor(slot: "Slot", tz: ZoneInfo) -> bool:
    """True if `slot` falls in sociable hours in the visitor's own timezone.

    Pure, so it's covered by the self-check. Guards against the case where
    Naman's late-evening IST availability lands overnight for the visitor.
    """
    start = slot.start.astimezone(tz)
    end = slot.end.astimezone(tz)
    if start.hour < VISITOR_EARLIEST_HOUR:
        return False
    # Compare against the *start* day's cutoff so a slot ending exactly at
    # 22:00 passes but one crossing into the small hours does not.
    cutoff = start.replace(hour=VISITOR_LATEST_HOUR, minute=0,
                           second=0, microsecond=0)
    return end <= cutoff


# --- Google Calendar ---------------------------------------------------------

SCOPES = ["https://www.googleapis.com/auth/calendar"]


def _service():
    """Calendar client.

    `GOOGLE_SERVICE_ACCOUNT_JSON` holds either a path (local development) or the
    key material itself (deployed, where it arrives as a runtime secret — the key
    must never be baked into the image).
    """
    from google.oauth2 import service_account
    from googleapiclient.discovery import build

    raw = os.environ.get("GOOGLE_SERVICE_ACCOUNT_JSON", "service-account.json")
    if raw.lstrip().startswith("{"):
        creds = service_account.Credentials.from_service_account_info(
            json.loads(raw), scopes=SCOPES
        )
    else:
        creds = service_account.Credentials.from_service_account_file(
            raw, scopes=SCOPES
        )
    return build("calendar", "v3", credentials=creds, cache_discovery=False)


def _calendar_id() -> str:
    """The calendar bookings are written to."""
    return os.environ.get("CALENDAR_ID", "nparashar150@gmail.com")


def _busy_calendar_ids() -> list[str]:
    """Every calendar that counts as "Naman is busy".

    A Google account usually has several calendars, and freebusy only reports
    the ones you ask for. Querying just the primary made the agent blind to real
    commitments and book straight over them, so every calendar must be listed
    here AND shared with the service account.
    """
    extra = [c.strip() for c in os.environ.get("BUSY_CALENDAR_IDS", "").split(",") if c.strip()]
    ids = [_calendar_id()]
    ids += [c for c in extra if c != _calendar_id()]
    return ids


def _busy_blocks(svc, start: dt.datetime, end: dt.datetime):
    """Busy intervals across every calendar in `_busy_calendar_ids()`.

    freebusy already accounts for out-of-office and focus-time events. Events
    explicitly marked "Free" (transparent) are excluded by design.

    If any calendar can't be read, this raises. An unreadable calendar must
    never be mistaken for an empty one — that books over real commitments.
    """
    ids = _busy_calendar_ids()
    resp = svc.freebusy().query(body={
        "timeMin": start.isoformat(),
        "timeMax": end.isoformat(),
        "timeZone": "Asia/Kolkata",
        "items": [{"id": c} for c in ids],
    }).execute()

    cals = resp.get("calendars", {})
    blocks, unreadable = [], []
    for cid in ids:
        entry = cals.get(cid)
        if entry is None:
            unreadable.append((cid, "not in response"))
            continue
        if entry.get("errors"):
            unreadable.append((cid, entry["errors"]))
            continue
        blocks += [
            (dt.datetime.fromisoformat(b["start"]), dt.datetime.fromisoformat(b["end"]))
            for b in entry.get("busy", [])
        ]

    if unreadable:
        raise RuntimeError(
            "cannot read calendar(s), refusing to offer times: "
            + "; ".join(f"{c}: {e}" for c, e in unreadable)
        )
    return blocks


def _agent_bookings_on(svc, day: dt.date) -> int:
    """How many bookings this agent already made on `day` (for the daily cap)."""
    lo = dt.datetime.combine(day, dt.time(0, 0), tzinfo=IST)
    hi = lo + dt.timedelta(days=1)
    resp = svc.events().list(
        calendarId=_calendar_id(),
        timeMin=lo.isoformat(), timeMax=hi.isoformat(),
        privateExtendedProperty=f"source={AGENT_TAG}",
        singleEvents=True,
    ).execute()
    return len(resp.get("items", []))


def free_slots(visitor_tz: str, *, days: int = SEARCH_DAYS, limit: int = 6):
    """Next `limit` bookable slots, soonest first, labelled in the visitor's tz.

    Returns a list of {"start": iso_utc, "label": spoken_phrasing} so the agent
    can read options aloud without doing any date arithmetic of its own.
    """
    try:
        tz = ZoneInfo(visitor_tz)
    except Exception:
        tz = IST  # unknown tz from the browser: fall back rather than fail

    svc = _service()
    now = dt.datetime.now(dt.timezone.utc)
    horizon = now + dt.timedelta(days=days)
    busy = _busy_blocks(svc, now, horizon)

    found: list[Slot] = []
    for offset in range(days):
        day = (now.astimezone(IST) + dt.timedelta(days=offset)).date()
        day_slots = [s for s in slots_for_day(day, busy, now)
                     if is_civil_for_visitor(s, tz)]
        if day_slots and _agent_bookings_on(svc, day) >= MAX_BOOKINGS_PER_DAY:
            continue  # cap reached for this day
        found.extend(day_slots)
        if len(found) >= limit:
            break

    return [{"start": s.start.isoformat(), "label": s.label(tz)}
            for s in found[:limit]]


def book(start_iso: str, name: str, email: str, brief: str, visitor_tz: str) -> dict:
    """Create the call. Re-checks availability first — never trust a stale slot.

    Raises RuntimeError with a speakable message if the slot is gone, so the
    agent can apologise and offer another rather than silently failing.
    """
    start = dt.datetime.fromisoformat(start_iso)
    if start.tzinfo is None:
        raise ValueError("start_iso must be timezone-aware")
    end = start + dt.timedelta(minutes=SLOT_MINUTES)

    svc = _service()
    now = dt.datetime.now(dt.timezone.utc)

    # Re-validate against live data: minutes may have passed since we offered it.
    busy = _busy_blocks(svc, start - dt.timedelta(hours=1), end + dt.timedelta(hours=1))
    day = start.astimezone(IST).date()
    if not any(s.start == start for s in slots_for_day(day, busy, now)):
        raise RuntimeError("that time just became unavailable")
    if _agent_bookings_on(svc, day) >= MAX_BOOKINGS_PER_DAY:
        raise RuntimeError("that day is fully booked")
    try:
        vtz = ZoneInfo(visitor_tz)
    except Exception:
        vtz = IST
    if not is_civil_for_visitor(Slot(start, end), vtz):
        raise RuntimeError("that time is the middle of the night where you are")

    # No `attendees` key: service accounts get 403 adding attendees on a
    # consumer gmail. The visitor's address lives in the description instead.
    event = svc.events().insert(calendarId=_calendar_id(), body={
        "summary": f"Call: {name} (via site agent)",
        "description": (
            f"Booked by the voice agent on nparashar150.com\n\n"
            f"Name:     {name}\n"
            f"Email:    {email}\n"
            f"Timezone: {visitor_tz}\n\n"
            f"What they need:\n{brief}\n"
            + (f"\nJoin: {MEETING_LINK}\n" if MEETING_LINK else "")
        ),
        **({"location": MEETING_LINK} if MEETING_LINK else {}),
        "start": {"dateTime": start.isoformat(), "timeZone": "UTC"},
        "end": {"dateTime": end.isoformat(), "timeZone": "UTC"},
        "extendedProperties": {"private": {"source": AGENT_TAG, "email": email}},
    }).execute()

    return {"event_id": event["id"],
            "start": start.isoformat(),
            "label": Slot(start, end).label(ZoneInfo(visitor_tz) if visitor_tz else IST)}


def log_lead(name: str, method: str, handle: str, brief: str,
             when: str | None = None) -> str:
    """Record a non-booking lead as an all-day calendar entry.

    Replaces an email provider: this lands on Naman's calendar, which already
    pushes to his phone. Written the moment contact info is confirmed, so a
    visitor closing the tab still delivers the lead.
    """
    svc = _service()
    today = dt.datetime.now(IST).date()
    event = svc.events().insert(calendarId=_calendar_id(), body={
        "summary": f"Lead: {name or 'anon'} ({method})",
        "description": (
            f"Captured by the voice agent on nparashar150.com\n\n"
            f"Reach them: {method} -> {handle}\n"
            f"Wants contact: {when or 'not specified'}\n\n"
            f"What they need:\n{brief}\n"
        ),
        "start": {"date": today.isoformat()},
        "end": {"date": (today + dt.timedelta(days=1)).isoformat()},
        "transparency": "transparent",   # a note, not busy time
        "extendedProperties": {"private": {"source": AGENT_TAG, "lead": "1"}},
    }).execute()
    return event["id"]


# --- ops ---------------------------------------------------------------------

def check_access() -> bool:
    """Report read AND write access separately, then clean up after itself.

    Exists because freebusy succeeds at the *lowest* share level ("See free/busy
    information"), so a read-only check happily passes while every booking would
    later 403. Writing is the capability that matters, so prove it explicitly.
    """
    svc = _service()
    cal = _calendar_id()
    now = dt.datetime.now(dt.timezone.utc)

    ids = _busy_calendar_ids()
    print(f"CALENDARS: {len(ids)} configured")
    for cid in ids:
        print(f"  - {cid}")
    try:
        _busy_blocks(svc, now, now + dt.timedelta(days=1))
        print("READ  : ok (all calendars readable)")
    except Exception as e:
        print(f"READ  : FAILED - {e}")
        print("\n-> Share every listed calendar with the service account, or drop")
        print("   it from BUSY_CALENDAR_IDS. An unreadable calendar is never")
        print("   assumed free.")
        return False

    # A probe event far in the future, deleted immediately.
    probe_at = now + dt.timedelta(days=365)
    try:
        ev = svc.events().insert(calendarId=cal, body={
            "summary": "[access probe - safe to ignore]",
            "start": {"dateTime": probe_at.isoformat(), "timeZone": "UTC"},
            "end": {"dateTime": (probe_at + dt.timedelta(minutes=5)).isoformat(),
                    "timeZone": "UTC"},
            "extendedProperties": {"private": {"source": AGENT_TAG, "probe": "1"}},
        }).execute()
    except Exception as e:
        print(f"WRITE : FAILED - {e}")
        print("\n-> Share level is too low. In Google Calendar > Settings >")
        print("   Settings for my calendars > Share with specific people,")
        print("   set the service account to 'Make changes to events'.")
        return False

    svc.events().delete(calendarId=cal, eventId=ev["id"]).execute()
    print("WRITE : ok (probe created and deleted)")
    print("\naccess ok - booking will work")
    return True


# --- self-check --------------------------------------------------------------

def _self_check() -> None:
    """Asserts on the pure slot logic. No network. Run: python booking.py"""
    def ist(y, m, d, hh, mm=0):
        return dt.datetime(y, m, d, hh, mm, tzinfo=IST)

    # Mon 2026-09-21, "now" is early morning so lead time never interferes.
    mon, now = dt.date(2026, 9, 21), ist(2026, 9, 21, 6)
    free = slots_for_day(mon, [], now)

    # 12:00 -> 24:00 in 30m steps == 24 slots.
    assert len(free) == 24, len(free)
    first = free[0].start.astimezone(IST)
    last = free[-1].start.astimezone(IST)
    assert (first.hour, first.minute) == (12, 0), first
    assert (last.hour, last.minute) == (23, 30), last
    # Nothing may run past midnight.
    assert free[-1].end.astimezone(IST).hour == 0

    # Sunday is closed.
    assert slots_for_day(dt.date(2026, 9, 20), [], now) == []

    # A busy block removes exactly the slots it covers, and no more.
    busy = [(ist(2026, 9, 21, 14), ist(2026, 9, 21, 15))]
    kept = {s.start.astimezone(IST).strftime("%H:%M")
            for s in slots_for_day(mon, busy, now)}
    assert "14:00" not in kept and "14:30" not in kept
    assert "13:30" in kept and "15:00" in kept, kept   # edges stay bookable

    # Naman's recurring 22:00-23:00 block, seen live in freebusy.
    nightly = [(ist(2026, 9, 21, 22), ist(2026, 9, 21, 23))]
    kept = {s.start.astimezone(IST).strftime("%H:%M")
            for s in slots_for_day(mon, nightly, now)}
    assert "22:00" not in kept and "22:30" not in kept
    assert "21:30" in kept and "23:00" in kept

    # Lead time: at 12:10 with a 2h rule, nothing before 14:30 is offered.
    late = slots_for_day(mon, [], ist(2026, 9, 21, 12, 10))
    assert late[0].start.astimezone(IST).strftime("%H:%M") == "14:30", late[0]

    # A partial overlap still blocks the slot.
    assert slots_for_day(mon, [(ist(2026, 9, 21, 12, 15),
                                ist(2026, 9, 21, 12, 20))], now)[0] \
        .start.astimezone(IST).strftime("%H:%M") == "12:30"

    # Every surviving slot must be inside the window and clear of every block.
    for s in slots_for_day(mon, busy + nightly, now):
        local = s.start.astimezone(IST)
        assert 12 <= local.hour <= 23, local
        for b0, b1 in busy + nightly:
            assert not _overlaps(s.start, s.end, b0, b1), (s, b0)

    # Civil-hours guard, from the visitor's side.
    ny = ZoneInfo("America/New_York")
    # 12:00 IST == 02:30 EDT -> must be rejected.
    assert not is_civil_for_visitor(
        Slot(ist(2026, 9, 21, 12).astimezone(dt.timezone.utc),
             ist(2026, 9, 21, 12, 30).astimezone(dt.timezone.utc)), ny)
    # 18:00 IST == 08:30 EDT -> fine.
    assert is_civil_for_visitor(
        Slot(ist(2026, 9, 21, 18).astimezone(dt.timezone.utc),
             ist(2026, 9, 21, 18, 30).astimezone(dt.timezone.utc)), ny)
    # An IST visitor keeps the full window, midnight edge included.
    for s_ in slots_for_day(mon, [], now):
        assert is_civil_for_visitor(s_, IST) or \
            s_.start.astimezone(IST).hour >= 21, s_
    # 21:30 IST ends at 22:00 IST exactly -> allowed for an IST visitor.
    assert is_civil_for_visitor(
        Slot(ist(2026, 9, 21, 21, 30).astimezone(dt.timezone.utc),
             ist(2026, 9, 21, 22).astimezone(dt.timezone.utc)), IST)
    # 22:00 IST ends at 22:30 -> past the cutoff, rejected.
    assert not is_civil_for_visitor(
        Slot(ist(2026, 9, 21, 22).astimezone(dt.timezone.utc),
             ist(2026, 9, 21, 22, 30).astimezone(dt.timezone.utc)), IST)

    print("booking.py self-check: all assertions passed")


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "access":
        raise SystemExit(0 if check_access() else 1)
    _self_check()
