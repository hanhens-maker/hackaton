import type { AdvisorModule } from "@/lib/schema";
import { useTone } from "@/lib/tone";

export default function Advisor({ title, message, cta }: AdvisorModule) {
  const t = useTone();
  return (
    <section className={t.card}>
      <div className="flex items-start gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg font-semibold text-white"
          style={{ background: t.accent }}
          aria-hidden
        >
          💬
        </div>
        <div>
          <h3 className={t.title}>{title}</h3>
          <p className={`${t.body} mt-1`}>{message}</p>
        </div>
      </div>
      <button className={`${t.button} mt-4 w-full`}>{cta}</button>
    </section>
  );
}
