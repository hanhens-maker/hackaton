"use client";

import { AnimatePresence, motion } from "framer-motion";
import { isCrisis, type Dashboard, type Module } from "@/lib/schema";
import { infoVariantLabel, lifeMomentLabel, moduleLabel, toneDescription, toneLabel } from "@/lib/labels";
import type { SeedWhy } from "@/data/seed-why";

function moduleName(m: Module): string {
  return m.type === "InfoCard" ? `Info · ${infoVariantLabel[m.variant].label}` : moduleLabel[m.type];
}

export default function WhyPanel({
  userKey,
  dashboard,
  why,
  adapted,
}: {
  userKey: string;
  dashboard: Dashboard;
  why?: SeedWhy;
  adapted?: boolean;
}) {
  const crisis = isCrisis(dashboard.lifeMoment);
  return (
    <aside className="flex h-full flex-col overflow-hidden rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-kbc">Uitleg</p>
      <h2 className="mt-1 text-xl font-bold text-kbc-dark">Waarom ziet deze klant dit?</h2>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={userKey}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
          className="no-scrollbar mt-5 flex-1 space-y-5 overflow-y-auto"
        >
          <section>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Levensmoment</span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${crisis ? "bg-emerald-100 text-emerald-800" : "bg-sky-100 text-kbc-dark"}`}>
                {lifeMomentLabel[dashboard.lifeMoment]}
              </span>
            </div>
            {why && <p className="mt-2 text-sm leading-relaxed text-slate-700">{why.lifeMoment}</p>}
            {adapted && !why && (
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                Deze layout is in de demo aangepast en bewaard in deze browser, per klant.
              </p>
            )}
          </section>

          <section>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Toon</span>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">{toneLabel[dashboard.tone]}</span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">{why?.tone}</p>
            <p className="mt-1 text-xs text-slate-400">{toneDescription[dashboard.tone]}</p>
          </section>

          {crisis && (
            <section className="rounded-2xl bg-emerald-50 p-4 text-sm leading-relaxed text-emerald-900 ring-1 ring-emerald-100">
              <p className="font-semibold">Crisismodus actief</p>
              <p className="mt-1 text-emerald-800">
                Productaanbod (Wonen, Beleggen) wordt in de code weggefilterd. Het steunblok staat altijd bovenaan.
              </p>
            </section>
          )}

          <section>
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Gekozen modules</span>
            <ol className="mt-2 space-y-2">
              {dashboard.layout.map((m, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.06 }}
                  className="flex gap-3 rounded-2xl bg-slate-50 p-3"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-kbc text-xs font-bold text-white">{i + 1}</span>
                  <div>
                    <p className="text-sm font-semibold text-kbc-dark">{moduleName(m)}</p>
                    {why?.modules[i] && <p className="mt-0.5 text-sm leading-snug text-slate-600">{why.modules[i]}</p>}
                  </div>
                </motion.li>
              ))}
            </ol>
          </section>
        </motion.div>
      </AnimatePresence>
    </aside>
  );
}
