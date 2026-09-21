"use client";

import {
  RoomAudioRenderer,
  RoomContext,
  useChat,
  useLocalParticipant,
  useMultibandTrackVolume,
  useRemoteParticipants,
  useTranscriptions,
} from "@livekit/components-react";
import {
  type LocalAudioTrack,
  type RemoteAudioTrack,
  Room,
  RoomEvent,
  Track,
} from "livekit-client";
import { useContext, useEffect, useMemo, useRef } from "react";
import {
  agentStatus,
  bandsRef,
  type Booking,
  bookingStore,
  LIVEKIT_URL,
  sendRef,
  transcriptStore,
  type TranscriptLine,
} from "@/lib/agent/store";

export function CallEngine({
  token,
  onEnd,
}: {
  token: string;
  onEnd: () => void;
}) {
  const room = useMemo(
    () => new Room({ adaptiveStream: true, dynacast: true }),
    [],
  );
  const startedRef = useRef(false);
  const disconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Connect exactly once (survives StrictMode's double-invoke via startedRef).
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    (async () => {
      try {
        await room.connect(LIVEKIT_URL, token);
        await room.localParticipant.setMicrophoneEnabled(true);
        agentStatus.set("live");
      } catch {
        agentStatus.set("error");
        onEnd();
      }
    })();
  }, [room, token, onEnd]);

  // Listener + deferred teardown. The StrictMode remount clears the pending
  // disconnect, so we don't tear down a real connection; real unmounts still fire it.
  useEffect(() => {
    if (disconnectTimer.current) clearTimeout(disconnectTimer.current);
    const onDisconnected = () => {
      agentStatus.set("idle");
      onEnd();
    };
    room.on(RoomEvent.Disconnected, onDisconnected);
    return () => {
      room.off(RoomEvent.Disconnected, onDisconnected);
      disconnectTimer.current = setTimeout(() => {
        room.disconnect();
        bandsRef.current = [];
      }, 0);
    };
  }, [room, onEnd]);

  return (
    <RoomContext.Provider value={room}>
      <RoomAudioRenderer />
      <BandReader />
      <TranscriptReader />
      <BookingReader />
      <ChatBridge />
    </RoomContext.Provider>
  );
}

// reads BOTH the user's mic and the agent's audio into per-band volumes
// (max per band) so the visualizer reacts to whoever is speaking
function BandReader() {
  const { localParticipant } = useLocalParticipant();
  const remotes = useRemoteParticipants();

  const localTrack = localParticipant?.getTrackPublication(
    Track.Source.Microphone,
  )?.track as LocalAudioTrack | undefined;
  const remoteTrack = remotes[0]?.getTrackPublication(Track.Source.Microphone)
    ?.track as RemoteAudioTrack | undefined;

  const localVols = useMultibandTrackVolume(localTrack, { bands: 34 });
  const remoteVols = useMultibandTrackVolume(remoteTrack, { bands: 34 });

  bandsRef.current = localVols.map((v, i) => Math.max(v, remoteVols[i] ?? 0));
  return null;
}

// streams the live transcript (user STT + agent) into the store
function TranscriptReader() {
  // useTranscriptions returns TextStreamData[]; shape is loosely typed across versions
  const lines = useTranscriptions() as Array<{
    text?: string;
    participantInfo?: { identity?: string };
    streamInfo?: { id?: string };
  }>;
  const { localParticipant } = useLocalParticipant();

  useEffect(() => {
    const localId = localParticipant?.identity;
    const mapped: TranscriptLine[] = lines
      .filter((t) => (t?.text ?? "").trim().length > 0)
      .map((t, i) => ({
        id: String(t?.streamInfo?.id ?? i),
        role:
          t?.participantInfo?.identity && t.participantInfo.identity === localId
            ? "you"
            : "agent",
        text: (t.text ?? "").trim(),
      }));
    transcriptStore.set(mapped);
  }, [lines, localParticipant?.identity]);

  return null;
}

// the agent announces a booked call on its own text-stream topic, separate from
// the transcript, so the UI can render a card rather than parse speech for a date
function BookingReader() {
  const room = useContext(RoomContext);

  useEffect(() => {
    if (!room) return;
    const topic = "booking.confirmed";
    room.registerTextStreamHandler(topic, async (reader) => {
      try {
        const parsed = JSON.parse(await reader.readAll()) as Partial<Booking>;
        // Trust nothing: a malformed payload must not blank the card or throw.
        if (typeof parsed.start !== "string" || typeof parsed.label !== "string") {
          return;
        }
        bookingStore.set({
          start: parsed.start,
          label: parsed.label,
          minutes: typeof parsed.minutes === "number" ? parsed.minutes : 30,
          email: typeof parsed.email === "string" ? parsed.email : null,
          tz: typeof parsed.tz === "string" ? parsed.tz : "Asia/Kolkata",
        });
      } catch {
        // ignore: the booking is already on the calendar, the card is cosmetic
      }
    });
    return () => room.unregisterTextStreamHandler(topic);
  }, [room]);

  return null;
}

// exposes the chat send fn so the console input can message the agent mid-call
function ChatBridge() {
  const { send } = useChat();
  useEffect(() => {
    sendRef.current = (text: string) => {
      void send(text);
    };
    return () => {
      sendRef.current = null;
    };
  }, [send]);
  return null;
}
