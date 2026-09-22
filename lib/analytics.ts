// Conversion events for the OpenAI (ChatGPT Ads) measurement pixel.
//
// The pixel itself is loaded in app/layout.tsx. This wrapper exists so call
// sites don't repeat the argument order or the `type` discriminator, both of
// which are easy to get subtly wrong and fail silently — a rejected event looks
// exactly like an event nobody triggered.
//
// Every call is a no-op when the pixel is absent: ad blockers, privacy modes
// and SSR all mean `window.oaiq` may simply not be there. Measurement must
// never be able to break the page.

type Oaiq = (...args: unknown[]) => void;

declare global {
  interface Window {
    oaiq?: Oaiq;
  }
}

/** Shapes the pixel accepts, per developers.openai.com/ads/supported-events. */
type CustomerAction = { type: "customer_action"; amount?: number; currency?: string };
type CustomAction = { type: "custom"; amount?: number; currency?: string };

type MeasureOptions = {
  /** Stable id so the same conversion sent from browser AND server dedupes. */
  event_id?: string;
  /** Required when the event name is "custom". */
  custom_event_name?: string;
};

function measure(
  event: string,
  data: CustomerAction | CustomAction,
  options?: MeasureOptions,
): void {
  if (typeof window === "undefined") return;
  const oaiq = window.oaiq;
  if (typeof oaiq !== "function") return;
  try {
    oaiq("measure", event, data, options);
  } catch {
    // A measurement failure is never worth a broken interaction.
  }
}

/** Someone actually started talking to the agent. */
export function trackCallStarted(): void {
  measure(
    "custom",
    { type: "custom" },
    { custom_event_name: "voice_call_started" },
  );
}

/**
 * Someone booked a call — the conversion that matters.
 *
 * `eventId` is derived from the booking itself rather than random, so if this
 * is ever also sent server-side from the agent, both land with the same id and
 * the pixel counts one conversion instead of two.
 */
export function trackCallBooked(startIso: string, email: string | null): void {
  measure(
    "appointment_scheduled",
    { type: "customer_action" },
    { event_id: `booking:${startIso}:${email ?? "anon"}` },
  );
}
