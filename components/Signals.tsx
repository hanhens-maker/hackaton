"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Signal, SignalType } from "@/lib/schema";

export type LiveSignal = Signal & { id: string };

const groups: { type: SignalType; label: string; className: string }[] = [
  { type: "situatie", label: "Situatie", className: "bg-sky-100 text-kbc-dark" },
  { type: "gedrag", label: "Gedrag", className: "bg-amber-100 text-amber-800" },
  { type: "intentie", label: "Intentie", className: "bg-fuchsia-100 text-fuchsia-800" },
];

/** "Wat KBC opmerkte": seed signals plus live ones from the copilot, newest on top of each group. */
export default function Signals({ seed, live }: { seed: Signal[]; live: LiveSignal[] }) {
  return (
    <section>
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Wat KBC opmerkte</span>
      <div className="mt-2 space-y-3">
        {groups.map((g) => {
          const liveItems = live.filter((s) => s.type === g.type);
          const seedItems = seed.filter((s) => s.type === g.type);
          if (liveItems.length + seedItems.length === 0) return null;
          return (
            <div key={g.type}>
              <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${g.className}`}>{g.label}</span>
              <ul className="mt-1.5 space-y-1">
                <AnimatePresence initial={false}>
                  {liveItems.map((s) => (
                    <motion.li
                      key={s.id}
                      layout
                      initial={{ opacity: 0, x: 16, backgroundColor: "#FEF3C7" }}
                      animate={{ opacity: 1, x: 0, backgroundColor: ["#FEF3C7", "#FEF3C7", "#F8FAFC"] }}
                      transition={{ duration: 2.2, times: [0, 0.5, 1], opacity: { duration: 0.3 }, x: { duration: 0.3 } }}
                      className="flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm text-slate-700"
                    >
                      <span>{s.label}</span>
                      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-amber-600">Nieuw</span>
                    </motion.li>
                  ))}
                </AnimatePresence>
                {seedItems.map((s) => (
                  <motion.li key={s.label} layout className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
                    {s.label}
                  </motion.li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
