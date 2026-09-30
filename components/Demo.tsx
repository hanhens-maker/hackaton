"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { applyCrisisRules, ComposeResponseSchema, MAX_HISTORY, type ChatMessage, type ComposeResponse, type Signal } from "@/lib/schema";
import { lifeMomentLabel } from "@/lib/labels";
import { quickReplies } from "@/lib/chips";
import { DEFAULT_SEED_USER_ID, seedUsers, type SeedUser } from "@/data/seed-users";
import { seedWhy } from "@/data/seed-why";
import Copilot from "./Copilot";
import PhoneFrame from "./PhoneFrame";
import Signals, { type LiveSignal } from "./Signals";
import WhyPanel from "./WhyPanel";

const personaEmoji: Record<string, string> = {
  baby: "👶",
  "job-loss": "🫂",
  starter: "🚀",
  "self-employed": "💼",
  retiree: "🌅",
};

export default function Demo() {
  const [userId, setUserId] = useState(DEFAULT_SEED_USER_ID);
  const user = seedUsers.find((u) => u.id === userId) ?? seedUsers[0];
  const seedCompose = applyCrisisRules(user.compose);

  // Live copilot state. Reset to the seed layout + opening message when switching customer.
  const [compose, setCompose] = useState<ComposeResponse>(seedCompose);
  const [history, setHistory] = useState<ChatMessage[]>(() => opening(user));
  const [pending, setPending] = useState(false);
  const [liveSignals, setLiveSignals] = useState<LiveSignal[]>([]);
  const requestId = useRef(0);

  function selectUser(next: SeedUser) {
    requestId.current++; // drop any in-flight response for the previous customer
    setUserId(next.id);
    setCompose(applyCrisisRules(next.compose));
    setHistory(opening(next));
    setLiveSignals([]);
    setPending(false);
  }

  async function send(message: string) {
    const id = ++requestId.current;
    const priorHistory = history.slice(-MAX_HISTORY);
    setHistory((h) => [...h, { role: "user", content: message }]);
    setPending(true);

    let next: ComposeResponse;
    try {
      const res = await fetch("/api/compose", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ userId: user.id, lifeMoment: compose.lifeMoment, tone: compose.tone, layout: compose.layout, history: priorHistory, signals: liveSignals.map(({ type, label }) => ({ type, label })).slice(0, 12), message }),
      });
      const body = await res.json().catch(() => null);
      const parsed = ComposeResponseSchema.safeParse(body);
      next = parsed.success
        ? parsed.data
        : { ...compose, reply: body?.error ?? "Sorry, dat lukte even niet. Kan je het nog eens proberen?" };
    } catch {
      next = { ...compose, reply: "Sorry, ik ben even niet bereikbaar. Probeer het zo nog eens." };
    }

    if (id !== requestId.current) return;
    setCompose(next);
    setHistory((h) => [...h, { role: "assistant", content: next.reply }]);
    if (next.signals?.length) setLiveSignals((prev) => addSignals(prev, next.signals!, user, id));
    setPending(false);
  }

  const lastUserMessage = [...history].reverse().find((m) => m.role === "user")?.content;

  return (
    <main className="grid h-full min-h-screen grid-cols-[300px_1fr_400px] gap-6 p-6">
      {/* Left: persona picker */}
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
                onClick={() => selectUser(u)}
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
                  <span className={`block text-xs ${active ? "text-sky-200" : "text-slate-500"}`}>{lifeMomentLabel[u.compose.lifeMoment]}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Placeholder for free-text persona input (later). */}
        <div className="mt-auto rounded-2xl border-2 border-dashed border-slate-200 p-4">
          <p className="text-sm font-semibold text-slate-500">Eigen klant beschrijven</p>
          <p className="mt-1 text-xs text-slate-400">Binnenkort: typ een situatie en de app bouwt zich live op.</p>
        </div>
      </aside>

      {/* Center: phone */}
      <section className="flex items-center justify-center">
        <PhoneFrame
          userKey={user.id}
          name={user.name}
          compose={compose}
          copilot={
            <Copilot
              reply={compose.reply}
              lastUserMessage={lastUserMessage}
              chips={quickReplies[compose.lifeMoment]}
              pending={pending}
              onSend={send}
            />
          }
        />
      </section>

      {/* Right: why panel. Explains the seed starting point; seedWhy is index-aligned with the seed layout. */}
      <WhyPanel
        userKey={user.id}
        compose={seedCompose}
        why={seedWhy[user.id]}
        signals={<Signals seed={user.signals} live={liveSignals} />}
      />
    </main>
  );
}

function opening(user: SeedUser): ChatMessage[] {
  return [{ role: "assistant", content: user.compose.reply }];
}

/** Newest first, skipping labels we already show. */
function addSignals(prev: LiveSignal[], incoming: Signal[], user: SeedUser, requestId: number): LiveSignal[] {
  const known = new Set([...user.signals, ...prev].map((s) => s.label.toLowerCase()));
  const fresh = incoming
    .filter((s) => !known.has(s.label.toLowerCase()))
    .map((s, i) => ({ ...s, id: `${requestId}-${i}` }));
  return [...fresh, ...prev];
}
