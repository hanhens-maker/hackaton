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

const TALK_TO_URL = "https://elevenlabs.io/app/talk-to?agent_id=agent_5301m3svjba4ek6bkq9b9947gkv8";

function VoiceButton({ onUserSaid, context }: Props) {
  const [failed, setFailed] = useState<string | null>(null);
  const conversation = useConversation({
    onMessage: ({ message, role }) => {
      if (role === "user" && message.trim()) onUserSaid(message.trim().slice(0, 1000));
    },
    onError: (message) => setFailed(String(message || "verbinding mislukt")),
  });
  const { status, isSpeaking, sendContextualUpdate } = conversation;
  const connected = status === "connected";
  const busy = status === "connecting";

  useEffect(() => {
    if (connected && context) sendContextualUpdate(context);
  }, [connected, context, sendContextualUpdate]);

  async function start() {
    setFailed(null);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setFailed("geen toegang tot de microfoon");
      return;
    }
    try {
      const res = await fetch("/api/voice");
      const auth = (await res.json()) as { agentId?: string; conversationToken?: string };
      if (auth.conversationToken) {
        conversation.startSession({ conversationToken: auth.conversationToken, connectionType: "webrtc" });
      } else if (auth.agentId) {
        // Public agent: plain websocket straight to ElevenLabs, fewest moving parts.
        conversation.startSession({ agentId: auth.agentId, connectionType: "websocket" });
      } else {
        setFailed("geen agent geconfigureerd");
      }
    } catch (e) {
      // Network issue: the text input keeps working.
      setFailed(e instanceof Error ? e.message : "verbinding mislukt");
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
        <p className="mt-1 text-center text-xs text-slate-400">
          Spraak lukt nu niet ({failed}) — typ gerust je vraag, of{" "}
          <a href={TALK_TO_URL} target="_blank" rel="noreferrer" className="underline">
            praat via ElevenLabs
          </a>
          .
        </p>
      )}
    </div>
  );
}
