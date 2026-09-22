// Minimal RFC 5545 calendar file for a booked call.
//
// The agent writes the event to Naman's calendar, but it can't invite the
// visitor: a Google service account cannot add attendees on a consumer gmail
// account without domain-wide delegation. So the browser hands them an .ics
// instead, which every calendar app understands.
import type { Booking } from "./store";

/** RFC 5545 wants UTC basic-format timestamps: 20260926T093000Z */
function stamp(d: Date): string {
  return `${d.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`;
}

/** Escape per RFC 5545 §3.3.11 — backslash first, or it double-escapes. */
function esc(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

export function bookingToIcs(b: Booking, organiser: string): string {
  const start = new Date(b.start);
  const end = new Date(start.getTime() + b.minutes * 60_000);
  const uid = `${start.getTime()}-${(b.email ?? "guest").replace(/[^\w.@-]/g, "")}@nparashar150.com`;

  // CRLF is mandatory; some clients reject LF-only files.
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//nparashar150.com//voice agent//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    "SUMMARY:Call with Naman Parashar",
    `DESCRIPTION:${esc(
      `A ${b.minutes}-minute call booked through nparashar150.com.` +
        (b.joinUrl ? `\nJoin: ${b.joinUrl}` : "") +
        `\nOrganiser: ${organiser}`,
    )}`,
    // LOCATION is what calendar apps turn into a join button.
    ...(b.joinUrl ? [`LOCATION:${esc(b.joinUrl)}`] : []),
    `ORGANIZER;CN=Naman Parashar:mailto:${organiser}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}

/** Hand the file to the visitor. Same-origin blob, so no CSP surprises. */
export function downloadIcs(b: Booking, organiser: string): void {
  const url = URL.createObjectURL(
    new Blob([bookingToIcs(b, organiser)], {
      type: "text/calendar;charset=utf-8",
    }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = "call-with-naman.ics";
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoke on the next tick; revoking synchronously can cancel the download.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
