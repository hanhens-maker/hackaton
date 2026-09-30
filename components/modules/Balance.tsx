import type { BalanceModule } from "@/lib/schema";
import { formatEur } from "@/lib/format";
import { useTone } from "@/lib/tone";

export default function Balance({ title, accounts }: BalanceModule) {
  const t = useTone();
  const total = accounts.reduce((sum, a) => sum + a.balance, 0);
  return (
    <section className={t.card}>
      <p className={t.eyebrow}>{title}</p>
      <p className={`${t.big} mt-1`}>{formatEur(total)}</p>
      <p className={t.muted}>Totaal op {accounts.length} rekening{accounts.length > 1 ? "en" : ""}</p>
      <ul className="mt-3 divide-y divide-slate-100">
        {accounts.map((a) => (
          <li key={a.label} className={`flex items-center justify-between ${t.row}`}>
            <span className={t.body}>{a.label}</span>
            <span className={`${t.body} font-semibold tabular-nums ${a.balance < 0 ? "text-rose-600" : "text-kbc-dark"}`}>
              {formatEur(a.balance)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
