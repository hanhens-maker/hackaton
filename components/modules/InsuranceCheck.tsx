import type { InsuranceCheckModule } from "@/lib/schema";
import { insuranceStatusLabel } from "@/lib/labels";
import { useTone } from "@/lib/tone";

export default function InsuranceCheck({ title, items, cta }: InsuranceCheckModule) {
  const t = useTone();
  return (
    <section className={t.card}>
      <p className={t.eyebrow}>{t.emoji ? "🛡️ " : ""}Verzekeringscheck</p>
      <h3 className={`${t.title} mt-1`}>{title}</h3>
      <ul className="mt-2 divide-y divide-slate-100">
        {items.map((i) => {
          const s = insuranceStatusLabel[i.status];
          return (
            <li key={i.name} className={`flex items-start gap-3 ${t.row}`}>
              <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${s.className}`}>{s.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className={`${t.body} font-semibold text-kbc-dark`}>{i.name}</span>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${s.className}`}>{s.label}</span>
                </div>
                <p className={`${t.muted} mt-0.5`}>{i.reason}</p>
              </div>
            </li>
          );
        })}
      </ul>
      {cta && <button className={`${t.button} mt-4 w-full`}>{cta}</button>}
    </section>
  );
}
