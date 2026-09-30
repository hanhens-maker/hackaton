"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { applyCrisisRules, type ComposeResponse } from "@/lib/schema";
import { lifeMomentLabel } from "@/lib/labels";
import { DEFAULT_SEED_USER_ID, seedUsers } from "@/data/seed-users";
import { seedWhy } from "@/data/seed-why";
import PhoneFrame from "./PhoneFrame";
import WhyPanel from "./WhyPanel";
import VoiceAgent from "./VoiceAgent";

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
  const [live, setLive] = useState<{ compose: ComposeResponse; n: number } | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const compose = live ? applyCrisisRules(live.compose) : applyCrisisRules(user.compose);

  async function send(text = input) {
    const message = text.trim();
    if (!message || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/compose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, message }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as ComposeResponse;
      setLive((prev) => ({ compose: data, n: (prev?.n ?? 0) + 1 }));
      setInput("");
    } catch {
      // Demo must never show an error screen: keep the current layout.
    } finally {
      setLoading(false);
    }
  }

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
            const active = !live && u.id === userId;
            return (
              <button
                key={u.id}
                onClick={() => {
                  setUserId(u.id);
                  setLive(null);
                }}
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

        {/* Free-text input: the AI rebuilds the app live via /api/compose. */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send();
          }}
          className="mt-auto rounded-2xl border border-slate-200 p-4"
        >
          <p className="text-sm font-semibold text-kbc-dark">Vertel wat er speelt</p>
          <p className="mt-1 text-xs text-slate-400">De app bouwt zich live om.</p>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
            maxLength={1000}
            rows={3}
            placeholder="Bv. “Ik ben mijn job kwijt” of “Ahmed, 45, zelfstandige loodgieter, 2 tieners”"
            className="mt-3 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-kbc"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="mt-2 w-full rounded-xl bg-kbc px-4 py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
          >
            {loading ? "App wordt aangepast…" : "Pas mijn app aan"}
          </button>
          {/* Voice: each spoken turn rebuilds the app through the same /api/compose path. */}
          <VoiceAgent
            onUserSaid={(text) => void send(text)}
            context={live ? `De app toont nu: ${live.compose.layout.map((m) => m.type).join(", ")}. ${live.compose.reply}` : undefined}
          />
        </form>
      </aside>

      {/* Center: phone */}
      <section className="flex items-center justify-center">
        <PhoneFrame
          userKey={live ? `live-${live.n}` : user.id}
          name={live ? "Jij" : user.name}
          compose={compose}
          loading={loading}
        />
      </section>

      {/* Right: why panel */}
      <WhyPanel userKey={live ? `live-${live.n}` : user.id} compose={compose} why={live ? undefined : seedWhy[user.id]} />
    </main>
  );
}
