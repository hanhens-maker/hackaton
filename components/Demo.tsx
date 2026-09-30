"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { applyCrisisRules } from "@/lib/schema";
import { lifeMomentLabel } from "@/lib/labels";
import { DEFAULT_SEED_USER_ID, seedUsers } from "@/data/seed-users";
import { seedWhy } from "@/data/seed-why";
import PhoneFrame from "./PhoneFrame";
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
  const compose = applyCrisisRules(user.compose);

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
                  <span className={`block text-xs ${active ? "text-sky-200" : "text-slate-500"}`}>{lifeMomentLabel[u.compose.lifeMoment]}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Placeholder for free-text persona input (next step: Gemini). */}
        <div className="mt-auto rounded-2xl border-2 border-dashed border-slate-200 p-4">
          <p className="text-sm font-semibold text-slate-500">Eigen klant beschrijven</p>
          <p className="mt-1 text-xs text-slate-400">Binnenkort: typ een situatie en de app bouwt zich live op.</p>
        </div>
      </aside>

      {/* Center: phone */}
      <section className="flex items-center justify-center">
        <PhoneFrame userKey={user.id} name={user.name} compose={compose} />
      </section>

      {/* Right: why panel */}
      <WhyPanel userKey={user.id} compose={compose} why={seedWhy[user.id]} />
    </main>
  );
}
