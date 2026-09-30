"use client";

import { ConversationProvider, useConversation } from "@elevenlabs/react";

const AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;

type Props = {
  disabled: boolean;
  onTranscript: (text: string) => void;
};

/** Mic button backed by the ElevenLabs agent workflow. The customer's speech becomes a normal copilot message. */
export default function VoiceInput(props: Props) {
  if (!AGENT_ID) return null;
  return (
    <ConversationProvider>
      <MicButton {...props} agentId={AGENT_ID} />
    </ConversationProvider>
  );
}

function MicButton({ disabled, onTranscript, agentId }: Props & { agentId: string }) {
  const conversation = useConversation({
    volume: 0, // the copilot reply is shown by /api/compose; the agent only listens
    onMessage: ({ source, message }) => {
      if (source === "user" && message.trim()) onTranscript(message);
    },
  });
  const live = conversation.status === "connected" || conversation.status === "connecting";

  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={live ? "Stop spraak" : "Spreek met de copilot"}
      onClick={() => (live ? conversation.endSession() : conversation.startSession({ agentId, connectionType: "webrtc" }))}
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm transition-colors disabled:opacity-40 ${
        live ? "animate-pulse bg-red-500 text-white" : "bg-sky-50 text-kbc-dark ring-1 ring-sky-100"
      }`}
    >
      {live ? "■" : "🎤"}
    </button>
  );
}
