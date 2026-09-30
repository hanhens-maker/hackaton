import type { StepPlanModule } from "@/lib/schema";
import { useTone } from "@/lib/tone";

export default function StepPlan({ title, steps }: StepPlanModule) {
  const t = useTone();
  const done = steps.filter((s) => s.done).length;
  return (
    <section className={t.card}>
      <div className="flex items-baseline justify-between">
        <h3 className={t.title}>{title}</h3>
        <span className={t.chip}>
          {done}/{steps.length}
        </span>
      </div>
      <ul className="mt-2">
        {steps.map((s) => (
          <li key={s.label} className={`flex items-start gap-3 ${t.row}`}>
            <span
              className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 text-[11px] font-bold text-white"
              style={s.done ? { background: t.accent, borderColor: t.accent } : { borderColor: "#CBD5E1" }}
            >
              {s.done ? "✓" : ""}
            </span>
            <span className={`${t.body} ${s.done ? "text-slate-400 line-through" : ""}`}>{s.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
