"use client";

import { useEffect, useRef, useState } from "react";
import { ConversationProvider, useConversation, useConversationClientTool, type DisconnectionDetails } from "@elevenlabs/react";
import { motion } from "framer-motion";
import { applyCrisisRules, MAX_DEMO_ACTIONS, type DemoActionDraft } from "@/lib/schema";
import { lifeMomentLabel } from "@/lib/labels";
import { DEFAULT_SEED_USER_ID, seedUsers, type SeedUser } from "@/data/seed-users";
import { seedWhy } from "@/data/seed-why";
import {
  defaultCopilotLine,
  toolComposeDashboard,
  toolConfirmDemoAction,
  toolGetDemoAccountData,
  toolProposeDemoAction,
} from "@/lib/agent-tools";
import { describeDraft, resolveConfirmation } from "@/lib/demo-actions";
import { groundDashboard } from "@/lib/grounding";
import { clearSaved, useSaved, writeSaved, writeVoiceIntroAccepted } from "@/lib/storage";
import PhoneFrame, { type VoiceStatus } from "./PhoneFrame";
import WhyPanel from "./WhyPanel";

const OVERRIDE_REJECTED =
  "De assistent weigerde de sessie. Controleer in ElevenLabs of overrides (first_message, language, dynamic variables) zijn toegestaan.";

function looksLikeOverrideRejection(text: string, closeCode?: number): boolean {
  if (closeCode === 1008) return true;
  const t = text.toLowerCase();
  return t.includes("override") || t.includes("not allowed by config");
}

function dutchDisconnectError(details: DisconnectionDetails): string | null {
  if (details.reason === "user") return null;
  const closeCode = details.closeCode ?? details.context?.code;
  const blob =
    details.reason === "error"
      ? `${details.message} ${details.closeReason ?? ""} ${details.context.reason ?? ""}`
      : `${details.closeReason ?? ""} ${details.context?.reason ?? ""}`;
  if (looksLikeOverrideRejection(blob, closeCode)) return OVERRIDE_REJECTED;
  if (details.reason === "error") return "De verbinding met de assistent is verbroken. Probeer opnieuw.";
  return null;
}

const personaEmoji: Record<string, string> = {
  baby: "👶",
  "job-loss": "🫂",
  starter: "🚀",
  "self-employed": "💼",
  retiree: "🌅",
};

export default function Demo() {
  return (
    <ConversationProvider>
      <DemoApp />
    </ConversationProvider>
  );
}

function DemoApp() {
  const [userId, setUserId] = useState(DEFAULT_SEED_USER_ID);
  const user = seedUsers.find((u) => u.id === userId) ?? seedUsers[0];
  const saved = useSaved(user.id);
  const dashboard = applyCrisisRules(saved?.dashboard ?? user.dashboard);
  const actions = saved?.actions ?? [];
  const [pending, setPending] = useState<DemoActionDraft | null>(null);
  const [busy, setBusy] = useState(false);
  const [typed, setTyped] = useState("");
  const [agentMessage, setAgentMessage] = useState(() => defaultCopilotLine(user.name, user.addressForm));
  const [userHeard, setUserHeard] = useState<string | undefined>();
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [personaId, setPersonaId] = useState(userId);
  if (personaId !== userId) {
    setPersonaId(userId);
    setPending(null);
    setTyped("");
    setUserHeard(undefined);
    setSessionError(null);
    setStarting(false);
    setAgentMessage(defaultCopilotLine(user.name, user.addressForm));
  }
  const live = { user, dashboard, actions, pending, setPending, setBusy };

  useConversationClientTool("getDemoAccountData", () => toolGetDemoAccountData(live));
  useConversationClientTool("composeDashboard", (params: Record<string, unknown>) => toolComposeDashboard(live, params));
  useConversationClientTool("proposeDemoAction", (params: Record<string, unknown>) => toolProposeDemoAction(live, params));
  useConversationClientTool("confirmDemoAction", (params: Record<string, unknown>) => toolConfirmDemoAction(live, params));

  const startGen = useRef(0);
  const conversation = useConversation({
    onMessage: (payload) => {
      const text = payload.message.trim();
      if (!text) return;
      if (payload.role === "agent") setAgentMessage(text);
      if (payload.role === "user") setUserHeard(text);
    },
    onConnect: () => {
      startGen.current += 1;
      setStarting(false);
    },
    onError: (message) => {
      startGen.current += 1;
      setStarting(false);
      setSessionError(looksLikeOverrideRejection(message) ? OVERRIDE_REJECTED : "Er ging iets mis met de assistent. Probeer opnieuw.");
      setAgentMessage(defaultCopilotLine(user.name, user.addressForm));
    },
    onDisconnect: (details) => {
      startGen.current += 1;
      setStarting(false);
      const error = dutchDisconnectError(details);
      if (!error) return;
      setSessionError(error);
      setAgentMessage(defaultCopilotLine(user.name, user.addressForm));
    },
  });

  const connected = conversation.status === "connected";
  const connecting = conversation.status === "connecting" || starting;

  function safeEndSession() {
    try {
      if (conversation.status === "connected" || conversation.status === "connecting") {
        conversation.endSession();
      }
    } catch {
      // No live session to close.
    }
  }

  useEffect(() => {
    return () => safeEndSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- close the previous customer's session
  }, [userId]);

  async function startVoice() {
    if (connecting || connected) return;
    writeVoiceIntroAccepted();
    const gen = ++startGen.current;
    setSessionError(null);
    setStarting(true);
    setAgentMessage("Even geduld, ik zeg hallo…");
    const stale = () => startGen.current !== gen;
    try {
      const res = await fetch("/api/agent-session", { method: "POST" });
      const data = (await res.json().catch(() => null)) as { signedUrl?: unknown; error?: unknown } | null;
      if (stale()) return;
      if (res.status === 503) {
        setStarting(false);
        setSessionError("Stem is niet geconfigureerd. Zet ELEVENLABS_API_KEY en ELEVENLABS_AGENT_ID in .env.local.");
        setAgentMessage(defaultCopilotLine(user.name, user.addressForm));
        return;
      }
      if (!res.ok || typeof data?.signedUrl !== "string") {
        setStarting(false);
        setSessionError("De assistent is even niet bereikbaar. Probeer opnieuw.");
        setAgentMessage(defaultCopilotLine(user.name, user.addressForm));
        return;
      }
      conversation.startSession({
        signedUrl: data.signedUrl,
        connectionType: "websocket",
        dynamicVariables: {
          customer_name: user.name,
          customer_age: user.age,
          address_form: user.addressForm,
          life_moment: dashboard.lifeMoment,
          customer_id: user.id,
        },
      });
      window.setTimeout(() => {
        if (stale()) return;
        setStarting(false);
        setSessionError("Geen microfoon of de verbinding duurt te lang. Sta de microfoon toe en probeer opnieuw.");
        safeEndSession();
      }, 20_000);
    } catch {
      if (stale()) return;
      setStarting(false);
      setSessionError("Geen verbinding. Probeer opnieuw.");
      setAgentMessage(defaultCopilotLine(user.name, user.addressForm));
    }
  }

  function sendTyped() {
    const message = typed.trim();
    if (!message || !connected) return;
    setUserHeard(message);
    conversation.sendUserMessage(message);
    setTyped("");
  }

  function applyPendingOutcome(userText: string) {
    const result = resolveConfirmation(pending, userText);
    if (result.outcome === "declined" || result.outcome === "none_pending") {
      setPending(null);
      if (connected) conversation.sendContextualUpdate("De klant heeft de demo-actie geannuleerd.");
      return;
    }
    if (result.outcome !== "confirmed") return;
    if (actions.length >= MAX_DEMO_ACTIONS) {
      setPending(null);
      return;
    }
    const nextActions = [...actions, result.action];
    writeSaved(user.id, {
      dashboard: applyCrisisRules(groundDashboard(dashboard, user.dashboard, nextActions)),
      actions: nextActions,
    });
    setPending(null);
    if (connected) {
      conversation.sendContextualUpdate("De klant heeft de demo-actie op het scherm bevestigd. Die is bewaard. Roep confirmDemoAction niet opnieuw aan.");
    }
  }

  const voiceStatus: VoiceStatus = sessionError
    ? "error"
    : connecting
      ? "connecting"
      : connected
        ? conversation.isSpeaking
          ? "speaking"
          : "listening"
        : "idle";

  const userKey = `${user.id}-${dashboard.lifeMoment}-${dashboard.layout.map((m) => m.type).join(",")}-${actions.length}`;

  return (
    <main className="grid h-full min-h-screen grid-cols-[300px_1fr_400px] gap-6 p-6">
      <aside className="flex flex-col rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-kbc text-base font-black text-white">K</span>
          <div>
            <p className="text-base font-bold leading-tight text-kbc-dark">KBC Adapt</p>
            <p className="text-xs text-slate-500">De app die zich aanpast</p>
          </div>
        </div>

        <p className="mt-8 text-[11px] font-semibold uppercase tracking-widest text-slate-400">Kies een klant</p>
        <div className="mt-3 flex flex-col gap-2">
          {seedUsers.map((u) => {
            const active = u.id === userId;
            return (
              <button
                key={u.id}
                onClick={() => setUserId(u.id)}
                className={`relative flex items-center gap-3 rounded-2xl p-3 text-left transition-colors ${active ? "text-white" : "hover:bg-slate-50"}`}
              >
                {active && (
                  <motion.span
                    layoutId="persona-active"
                    className="absolute inset-0 rounded-2xl bg-kbc-dark"
                    transition={{ type: "spring", stiffness: 400, damping: 34 }}
                  />
                )}
                <span className={`relative flex h-10 w-10 items-center justify-center rounded-full text-lg ${active ? "bg-white/15" : "bg-sky-50"}`}>
                  {personaEmoji[u.id]}
                </span>
                <span className="relative">
                  <span className="block text-sm font-semibold">
                    {u.name}, {u.age}
                  </span>
                  <span className={`block text-xs ${active ? "text-sky-200" : "text-slate-500"}`}>{lifeMomentLabel[u.dashboard.lifeMoment]}</span>
                </span>
              </button>
            );
          })}
        </div>

        <AgentDock
          user={user}
          connected={connected}
          connecting={connecting}
          muted={conversation.isMuted}
          pendingSummary={pending ? describeDraft(pending) : null}
          error={sessionError}
          typed={typed}
          onTyped={setTyped}
          onStart={() => void startVoice()}
          onStop={() => conversation.endSession()}
          onMute={() => conversation.setMuted(!conversation.isMuted)}
          onSendTyped={sendTyped}
          onReset={() => {
            clearSaved(user.id);
            setPending(null);
            setAgentMessage(defaultCopilotLine(user.name, user.addressForm));
          }}
          hasSaved={Boolean(saved)}
        />
      </aside>

      <section className="flex items-center justify-center">
        <PhoneFrame
          userKey={userKey}
          name={user.name}
          dashboard={dashboard}
          loading={busy}
          agentMessage={agentMessage}
          userHeard={userHeard}
          pending={pending}
          voiceStatus={voiceStatus}
          onConfirmPending={() => applyPendingOutcome("ja")}
          onCancelPending={() => applyPendingOutcome("nee")}
        />
      </section>

      <WhyPanel userKey={userKey} dashboard={dashboard} why={saved ? undefined : seedWhy[user.id]} adapted={Boolean(saved)} />
    </main>
  );
}

function AgentDock({
  user,
  connected,
  connecting,
  muted,
  pendingSummary,
  error,
  typed,
  onTyped,
  onStart,
  onStop,
  onMute,
  onSendTyped,
  onReset,
  hasSaved,
}: {
  user: SeedUser;
  connected: boolean;
  connecting: boolean;
  muted: boolean;
  pendingSummary: string | null;
  error: string | null;
  typed: string;
  onTyped: (value: string) => void;
  onStart: () => void;
  onStop: () => void;
  onMute: () => void;
  onSendTyped: () => void;
  onReset: () => void;
  hasSaved: boolean;
}) {
  return (
    <div className="mt-auto rounded-2xl border border-slate-200 p-4">
      <p className="text-sm font-semibold text-kbc-dark">Je assistent</p>
      {!connected && (
        <>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Eén assistent voor stem en tekst. Lees dit vóór je microfoon toestaat:
          </p>
          <ul className="mt-2 space-y-1 text-xs leading-relaxed text-slate-500">
            <li>— De browser vraagt daarna om je microfoon.</li>
            <li>— Je hoort eerst een begroeting, daarna mag je praten of typen.</li>
            <li>— Dit is een demo: geen echte betalingen of afspraken.</li>
          </ul>
          <button
            type="button"
            onClick={onStart}
            disabled={connecting}
            className="mt-3 w-full rounded-xl bg-kbc px-4 py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
          >
            {connecting ? "Verbinden…" : "Start gesprek"}
          </button>
        </>
      )}
      {connected && (
        <>
          <p className="mt-1 text-xs text-slate-500">
            Verbonden met {user.name}. Spreek of typ — het is hetzelfde gesprek.
          </p>
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={onMute} className="flex-1 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">
              {muted ? "Microfoon aan" : "Microfoon uit"}
            </button>
            <button type="button" onClick={onStop} className="flex-1 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">
              Stop
            </button>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSendTyped();
            }}
            className="mt-3"
          >
            <textarea
              value={typed}
              onChange={(e) => onTyped(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSendTyped();
                }
              }}
              maxLength={1000}
              rows={3}
              placeholder="Typ hier, of spreek gewoon…"
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-kbc"
            />
            <button
              type="submit"
              disabled={!typed.trim()}
              className="mt-2 w-full rounded-xl bg-kbc px-4 py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
            >
              Verstuur
            </button>
          </form>
        </>
      )}
      {pendingSummary && <p className="mt-3 text-[11px] leading-relaxed text-amber-700">Wacht op bevestiging: {pendingSummary}</p>}
      {error && <p className="mt-3 text-xs leading-relaxed text-rose-600">{error}</p>}
      {hasSaved && (
        <button type="button" onClick={onReset} className="mt-3 text-[11px] font-semibold text-slate-400 hover:text-kbc-dark">
          Herstel demo van deze klant
        </button>
      )}
    </div>
  );
}
