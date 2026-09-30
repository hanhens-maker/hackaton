import type { CrisisModule } from "@/lib/schema";

// TODO: real design. Stub renders the module type + title only.
export default function Crisis(props: CrisisModule) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">Crisis</p>
      <h2 className="text-lg font-semibold">{props.title}</h2>
    </section>
  );
}
