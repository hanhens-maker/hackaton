import { motion } from "framer-motion";
import type { TravelPlannerModule } from "@/lib/schema";
import { formatEur } from "@/lib/format";
import { useTone } from "@/lib/tone";

export default function TravelPlanner({ title, destination, departure, items, saved, monthlySaving, tip }: TravelPlannerModule) {
  const t = useTone();
  const total = items.reduce((sum, i) => sum + i.amount, 0);
  const pct = total > 0 ? Math.min(100, (saved / total) * 100) : 0;
  return (
    <section className={t.card}>
      <div className="flex items-center justify-between">
        <p className={t.eyebrow}>{t.emoji ? "✈️ " : ""}Reisplanner</p>
        <span className={t.chip}>{departure}</span>
      </div>
      <h3 className={`${t.title} mt-1`}>{title}</h3>
      <p className={t.muted}>Bestemming: {destination}</p>

      <div className="mt-3 flex items-baseline justify-between">
        <span className={t.big}>{formatEur(total)}</span>
        <span className={`${t.muted} tabular-nums`}>{formatEur(saved)} gespaard</span>
      </div>
      <div className="mt-2 h-2.5 overflow-hidden rounded-full" style={{ background: t.accentSoft }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: t.accent }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        />
      </div>

      <ul className="mt-3 divide-y divide-slate-100">
        {items.map((i) => (
          <li key={i.label} className={`flex justify-between ${t.row}`}>
            <span className={t.body}>{i.label}</span>
            <span className={`${t.body} font-semibold tabular-nums text-kbc-dark`}>{formatEur(i.amount)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-3 rounded-2xl p-3" style={{ background: t.accentSoft }}>
        <p className={t.muted}>Nodig per maand</p>
        <p className={`${t.body} font-bold tabular-nums text-kbc-dark`}>{formatEur(monthlySaving)}/mnd</p>
      </div>
      {tip && <p className={`${t.body} mt-3`}>💡 {tip}</p>}
    </section>
  );
}
