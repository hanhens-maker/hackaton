import { motion } from "framer-motion";
import type { GoalsModule } from "@/lib/schema";
import { formatEur } from "@/lib/format";
import { useTone } from "@/lib/tone";

export default function Goals({ title, target, current, progressPct, monthlyContribution, note }: GoalsModule) {
  const t = useTone();
  return (
    <section className={t.card}>
      <div className="flex items-baseline justify-between">
        <p className={t.eyebrow}>{t.emoji ? "🎯 " : ""}Spaardoel</p>
        <span className={t.chip}>{Math.round(progressPct)}%</span>
      </div>
      <h3 className={`${t.title} mt-1`}>{title}</h3>
      <div className="mt-3 h-2.5 overflow-hidden rounded-full" style={{ background: t.accentSoft }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: t.accent }}
          initial={{ width: 0 }}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        />
      </div>
      <div className="mt-2 flex justify-between">
        <span className={`${t.body} font-semibold text-kbc-dark tabular-nums`}>{formatEur(current)}</span>
        <span className={`${t.muted} tabular-nums`}>van {formatEur(target)}</span>
      </div>
      {monthlyContribution !== undefined && (
        <p className={`${t.muted} mt-2`}>Je spaart {formatEur(monthlyContribution)} per maand</p>
      )}
      {note && <p className={`${t.body} mt-2`}>{note}</p>}
    </section>
  );
}
