"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { motion } from "motion/react";
import { config } from "@/lib/config";
import { downloadIcs } from "@/lib/agent/ics";
import {
  bookingStore,
  EMPTY_SLOTS,
  EMPTY_TRANSCRIPT,
  sendRef,
  slotsStore,
  transcriptStore,
  uiRequestStore,
} from "@/lib/agent/store";

/** Shared layout id, so motion morphs the panel between dock and section. */
export const CONVERSATION_LAYOUT_ID = "agent-conversation";

/** One spring for every part of the handoff, so nothing arrives out of step. */
export const HANDOFF = { type: "spring", bounce: 0.12, duration: 0.42 } as const;

/**
 * The whole exchange — transcript, offered slots, the details form and the
 * confirmation — as one scrolling thread.
 *
 * It renders in exactly one place at a time: inside the floating dock while the
 * contact console is off screen, and inside the console once it scrolls into
 * view. Both mount it with the same layoutId, so motion animates the handoff
 * instead of the panel popping between the two.
 */
export function Conversation({ compact = false }: { compact?: boolean }) {
  const transcript = useSyncExternalStore(
    transcriptStore.subscribe,
    transcriptStore.get,
    () => EMPTY_TRANSCRIPT,
  );
  const slots = useSyncExternalStore(
    slotsStore.subscribe,
    slotsStore.get,
    () => EMPTY_SLOTS,
  );
  const booking = useSyncExternalStore(
    bookingStore.subscribe,
    bookingStore.get,
    () => null,
  );
  const uiRequest = useSyncExternalStore(
    uiRequestStore.subscribe,
    uiRequestStore.get,
    () => null,
  );
  const [draft, setDraft] = useState({ name: "", email: "" });
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [transcript, slots, uiRequest, booking]);

  if (
    transcript.length === 0 &&
    slots.length === 0 &&
    !uiRequest &&
    !booking
  ) {
    return null;
  }

  return (
    // The scroller is a child, not this element: animating layout on a box
    // that is itself scrolling makes the content jitter as the height springs.
    // `layout="position"` keeps the text still and moves the frame instead.
    <motion.div
      layoutId={CONVERSATION_LAYOUT_ID}
      layout="position"
      transition={HANDOFF}
      className={`border border-line bg-surface-2 ${compact ? "" : "mt-4"}`}
    >
      <div
        ref={logRef}
        className={`flex flex-col gap-3 overflow-y-auto p-5 ${
          compact ? "max-h-[15rem]" : "max-h-[26rem]"
        }`}
      >
        {transcript.map((line) => (
          <div key={line.id} className="flex gap-3">
            <span
              className={`mt-0.5 w-16 shrink-0 font-mono text-[10px] font-bold tracking-[0.06em] ${
                line.role === "agent" ? "text-green" : "text-muted"
              }`}
            >
              {line.role === "agent" ? "NAMAN.AI" : "YOU"}
            </span>
            <p className="text-[14px] leading-relaxed text-cream">
              {line.text}
            </p>
          </div>
        ))}

        {/* times the agent just offered — tapping one is a turn in the chat */}
        {slots.length > 0 && !booking && !uiRequest && (
          <div className="flex gap-3">
            <span className="mt-0.5 w-16 shrink-0 font-mono text-[10px] font-bold tracking-[0.06em] text-green">
              PICK ONE
            </span>
            <div className="flex flex-wrap gap-2">
              {slots.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => {
                    slotsStore.clear();
                    sendRef.current?.(`I'll take ${slot.label}.`);
                  }}
                  className="rounded-full border border-line-3 px-3.5 py-2 font-mono text-[11px] text-cream transition-colors hover:border-green hover:text-green"
                >
                  {slot.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* the agent asked for details. Typed beats dictated: STT mangles both
            names and addresses, and confirming either aloud costs a turn. */}
        {uiRequest && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const name = draft.name.trim();
              const email = draft.email.trim();
              if (!email) return;
              setDraft({ name: "", email: "" });
              transcriptStore.addTyped(`${name || "I"} — ${email}`);
              uiRequestStore.submit({ name, email });
            }}
            className="flex gap-3"
          >
            <span className="mt-0.5 w-16 shrink-0 font-mono text-[10px] font-bold tracking-[0.06em] text-green">
              DETAILS
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <input
                aria-label="Your name"
                autoFocus
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                placeholder="Your name"
                autoComplete="name"
                className="border border-line-3 bg-surface px-3.5 py-2 font-mono text-[13px] text-cream outline-none placeholder:text-faint focus:border-green"
              />
              <input
                aria-label="Your email"
                type="email"
                required
                value={draft.email}
                onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
                placeholder="you@company.com"
                autoComplete="email"
                className="border border-line-3 bg-surface px-3.5 py-2 font-mono text-[13px] text-cream outline-none placeholder:text-faint focus:border-green"
              />
              <div className="flex flex-wrap gap-2 pt-0.5">
                <button
                  type="submit"
                  className="rounded-full bg-green px-4 py-2 font-mono text-[11px] font-bold text-green-deep transition-opacity hover:opacity-90"
                >
                  Confirm booking
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDraft({ name: "", email: "" });
                    uiRequestStore.cancel();
                  }}
                  className="rounded-full border border-line-3 px-4 py-2 font-mono text-[11px] text-muted-2 transition-colors hover:border-green/50 hover:text-cream"
                >
                  I&apos;ll say it
                </button>
              </div>
            </div>
          </form>
        )}

        {/* the booked call. Outlives the call itself — the visitor gets no
            confirmation email, so this is their only record. */}
        {booking && (
          <div className="flex gap-3">
            <span className="mt-0.5 w-16 shrink-0 font-mono text-[10px] font-bold tracking-[0.06em] text-green">
              BOOKED
            </span>
            <div className="min-w-0 flex-1 border border-green/40 p-4">
              <p className="text-[15px] font-semibold leading-snug text-cream">
                {booking.label}
              </p>
              <p className="pt-1 font-mono text-[11px] text-muted">
                {booking.minutes} min
                {booking.email ? ` · ${booking.email}` : ""}
                {booking.invited ? " · invite sent" : ""}
              </p>
              <div className="flex flex-wrap gap-2 pt-3">
                {booking.joinUrl && (
                  <a
                    href={booking.joinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-green px-4 py-2 font-mono text-[11px] font-bold text-green-deep transition-opacity hover:opacity-90"
                  >
                    Join link ↗
                  </a>
                )}
                {!booking.invited && (
                <button
                  onClick={() => downloadIcs(booking, config.email)}
                  className="rounded-full border border-line-3 px-4 py-2 font-mono text-[11px] text-cream transition-colors hover:border-green hover:text-green"
                >
                  Add to calendar
                </button>
                )}
                <button
                  onClick={() => bookingStore.clear()}
                  className="rounded-full border border-line-3 px-4 py-2 font-mono text-[11px] text-muted-2 transition-colors hover:border-green/50 hover:text-cream"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
