import type { FamilyModule } from "@/lib/schema";
import { formatEur } from "@/lib/format";
import { useTone } from "@/lib/tone";

export default function Family({ title, situation, monthlyCosts, upcomingEvents }: FamilyModule) {
  const t = useTone();
  const total = monthlyCosts.reduce((sum, c) => sum + c.amount, 0);
  return (
    <section className={t.card}>
      <p className={t.eyebrow}>Gezin</p>
      <h3 className={`${t.title} mt-1`}>{title}</h3>
      <p className={`${t.body} mt-1`}>{situation}</p>

      {monthlyCosts.length > 0 && (
        <div className="mt-4 rounded-2xl p-3" style={{ background: t.accentSoft }}>
          <div className="flex items-baseline justify-between">
            <span className={t.muted}>Extra gezinskosten</span>
            <span className={`${t.body} font-bold text-kbc-dark tabular-nums`}>{formatEur(total)}/mnd</span>
          </div>
          <ul className="mt-1">
            {monthlyCosts.map((c) => (
              <li key={c.label} className="flex justify-between py-0.5">
                <span className={t.muted}>{c.label}</span>
                <span className={`${t.muted} tabular-nums`}>{formatEur(c.amount)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {upcomingEvents.length > 0 && (
        <ol className="mt-4 border-l-2 pl-4" style={{ borderColor: t.accentSoft }}>
          {upcomingEvents.map((e) => (
            <li key={e.label} className={`relative ${t.row}`}>
              <span className="absolute -left-[23px] top-1/2 h-3 w-3 -translate-y-1/2 rounded-full ring-4 ring-white" style={{ background: t.accent }} />
              <p className={`${t.body} font-medium`}>{e.label}</p>
              <p className={t.muted}>{e.when}</p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
