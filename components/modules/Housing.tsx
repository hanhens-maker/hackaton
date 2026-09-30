import type { HousingModule } from "@/lib/schema";
import { formatEur } from "@/lib/format";
import { housingStatusLabel } from "@/lib/labels";
import { useTone } from "@/lib/tone";

export default function Housing({ title, status, monthlyCost, remainingMortgage, plan, cta }: HousingModule) {
  const t = useTone();
  return (
    <section className={t.card}>
      <div className="flex items-center justify-between">
        <p className={t.eyebrow}>{t.emoji ? "🏠 " : ""}Wonen</p>
        <span className={t.chip}>{housingStatusLabel[status]}</span>
      </div>
      <h3 className={`${t.title} mt-1`}>{title}</h3>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-2xl p-3" style={{ background: t.accentSoft }}>
          <p className={t.muted}>Woonkost</p>
          <p className={`${t.body} font-bold text-kbc-dark tabular-nums`}>{formatEur(monthlyCost)}/mnd</p>
        </div>
        {remainingMortgage !== undefined && (
          <div className="rounded-2xl p-3" style={{ background: t.accentSoft }}>
            <p className={t.muted}>Nog af te lossen</p>
            <p className={`${t.body} font-bold text-kbc-dark tabular-nums`}>{formatEur(remainingMortgage)}</p>
          </div>
        )}
      </div>
      {plan && <p className={`${t.body} mt-3`}>{plan}</p>}
      {cta && <button className={`${t.button} mt-4 w-full`}>{cta}</button>}
    </section>
  );
}
