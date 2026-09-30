import type { CrisisModule } from "@/lib/schema";
import { useTone } from "@/lib/tone";

// Always calm, whatever the tone: this block must feel safe.
export default function Crisis({ title, message, nowSteps, bufferMonths }: CrisisModule) {
  const t = useTone();
  return (
    <section className="rounded-3xl bg-gradient-to-br from-sky-50 to-emerald-50 p-6 ring-1 ring-sky-100">
      <p className="text-xs font-medium uppercase tracking-widest text-emerald-700/70">We zijn er voor je</p>
      <h3 className="mt-1 text-xl font-medium text-slate-800">{title}</h3>
      <p className={`${t.body} mt-2`}>{message}</p>

      {bufferMonths > 0 && (
        <div className="mt-5 flex items-baseline gap-2 rounded-2xl bg-white/80 p-4">
          <span className="text-4xl font-light tabular-nums text-slate-800">{bufferMonths}</span>
          <span className="text-sm text-slate-500">
            maand{bufferMonths === 1 ? "" : "en"} buffer
            <br />
            met je huidige spaargeld
          </span>
        </div>
      )}

      <p className="mt-5 text-sm font-medium text-slate-600">Wat je nu kan doen</p>
      <ol className="mt-2 space-y-2">
        {nowSteps.map((s, i) => (
          <li key={s} className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-medium text-emerald-700 ring-1 ring-emerald-100">
              {i + 1}
            </span>
            <span className={t.body}>{s}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
