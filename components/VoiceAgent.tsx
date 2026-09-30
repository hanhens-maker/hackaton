"use client";

import { useEffect, useState } from "react";
import { ConversationProvider, useConversation } from "@elevenlabs/react";

type Props = {
  /** Called with each final user transcript, so the app can rebuild via /api/compose. */
  onUserSaid: (text: string) => void;
  /** What the app just showed; sent to the agent as silent context when it changes. */
  context?: string;
};

export default function VoiceAgent(props: Props) {
  return (
    <ConversationProvider>
      <VoiceButton {...props} />
    </ConversationProvider>
  );
}

function VoiceButton({ onUserSaid, context }: Props) {
  const [failed, setFailed] = useState(false);
  const conversation = useConversation({
    onMessage: ({ message, role }) => {
      if (role === "user" && message.trim()) onUserSaid(message.trim().slice(0, 1000));
    },
    onError: () => setFailed(true),
  });
  const { status, isSpeaking, sendContextualUpdate } = conversation;
  const connected = status === "connected";
  const busy = status === "connecting";

  useEffect(() => {
    if (connected && context) sendContextualUpdate(context);
  }, [connected, context, sendContextualUpdate]);

  async function start() {
    setFailed(false);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const res = await fetch("/api/voice");
      const auth = (await res.json()) as { agentId?: string; conversationToken?: string };
      if (auth.conversationToken) {
        conversation.startSession({ conversationToken: auth.conversationToken, connectionType: "webrtc" });
      } else if (auth.agentId) {
        conversation.startSession({ agentId: auth.agentId, connectionType: "webrtc" });
      } else {
        setFailed(true);
      }
    } catch {
      // No mic permission or network issue: the text input keeps working.
      setFailed(true);
    }
  }

  const label = connected ? (isSpeaking ? "Adapt spreekt…" : "Ik luister…") : busy ? "Verbinden…" : "Praat met Adapt";

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => (connected ? conversation.endSession() : void start())}
        disabled={busy}
        className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60 ${
          connected ? "bg-kbc-dark text-white" : "border border-kbc text-kbc hover:bg-sky-50"
        }`}
      >
        <span className={`h-2.5 w-2.5 rounded-full ${connected ? "animate-pulse bg-emerald-400" : "bg-kbc"}`} />
        {label}
      </button>
      {connected && <p className="mt-1 text-center text-xs text-slate-400">Klik opnieuw om te stoppen</p>}
      {failed && !connected && (
        <p className="mt-1 text-center text-xs text-slate-400">Spraak lukt nu niet — typ gerust je vraag.</p>
      )}
    </div>
  );
}
