import type { InfoCardModule } from "@/lib/schema";
import { infoVariantLabel } from "@/lib/labels";
import { useTone } from "@/lib/tone";

export default function InfoCard({ variant, title, body, cta }: InfoCardModule) {
  const t = useTone();
  const v = infoVariantLabel[variant];
  return (
    <section className={`${t.card} relative overflow-hidden`}>
      <span className="absolute inset-y-0 left-0 w-1.5" style={{ background: v.color }} />
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full text-base" style={{ background: v.soft }}>
          {v.emoji}
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: v.color }}>
          {v.label}
        </span>
      </div>
      <h3 className={`${t.title} mt-2`}>{title}</h3>
      <p className={`${t.body} mt-1`}>{body}</p>
      {cta && (
        <button className="mt-3 text-sm font-semibold" style={{ color: v.color }}>
          {cta} →
        </button>
      )}
    </section>
  );
}
