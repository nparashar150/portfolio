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
import { type RemoteAudioTrack, Room, RoomEvent, Track } from "livekit-client";
import { useEffect, useMemo, useRef } from "react";
import {
  agentStatus,
  bandsRef,
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
      <ChatBridge />
    </RoomContext.Provider>
  );
