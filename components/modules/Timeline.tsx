import type { TimelineModule } from "@/lib/schema";
import { useTone } from "@/lib/tone";

export default function Timeline({ title, events }: TimelineModule) {
  const t = useTone();
  return (
    <section className={t.card}>
      <p className={t.eyebrow}>{t.emoji ? "🗓️ " : ""}Tijdlijn</p>
      <h3 className={`${t.title} mt-1`}>{title}</h3>
      <ol className="relative mt-3 ml-1.5 border-l-2 pl-5" style={{ borderColor: t.accentSoft }}>
        {events.map((e, i) => (
          <li key={e.label} className={`relative ${t.row}`}>
            <span
              className="absolute -left-[27px] top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full ring-4 ring-white"
              style={{ background: i === 0 ? t.accent : "#CBD5E1" }}
            />
            <p className={t.muted}>{e.when}</p>
            <p className={`${t.body} font-medium text-kbc-dark`}>{e.label}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
