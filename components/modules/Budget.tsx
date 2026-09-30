import { motion } from "framer-motion";
import type { BudgetModule } from "@/lib/schema";
import { formatEur } from "@/lib/format";
import { useTone } from "@/lib/tone";

export default function Budget({ title, categories, leftThisMonth }: BudgetModule) {
  const t = useTone();
  return (
    <section className={t.card}>
      <p className={t.eyebrow}>{t.emoji ? "📊 " : ""}Budget</p>
      <h3 className={`${t.title} mt-1`}>{title}</h3>

      <div className="mt-2">
        <p className={t.muted}>Nog over deze maand</p>
        <p className={`${t.big} ${leftThisMonth < 0 ? "!text-rose-600" : ""}`}>{formatEur(leftThisMonth)}</p>
      </div>

      <ul className="mt-3 space-y-3">
        {categories.map((c) => {
          const over = c.spent > c.planned;
          const pct = c.planned > 0 ? Math.min(100, (c.spent / c.planned) * 100) : 100;
          return (
            <li key={c.label}>
              <div className="flex items-baseline justify-between">
                <span className={t.body}>{c.label}</span>
                <span className={`${t.muted} tabular-nums ${over ? "!text-rose-600 font-semibold" : ""}`}>
                  {formatEur(c.spent)} / {formatEur(c.planned)}
                </span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full" style={{ background: t.accentSoft }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: over ? "#E11D48" : t.accent }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
