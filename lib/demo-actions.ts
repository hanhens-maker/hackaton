import { formatEur } from "@/lib/format";
import {
  AdvisorAppointmentDraftSchema,
  SavingsGoalDraftSchema,
  type AdvisorModule,
  type DemoAction,
  type DemoActionDraft,
  type GoalsModule,
} from "@/lib/schema";

const spokenNumber = new Intl.NumberFormat("nl-BE", { maximumFractionDigits: 2 });

/** "62.000 euro": what the voice should say, so TTS never reads "€" or guesses separators. */
export function spokenEuro(n: number): string {
  return `${spokenNumber.format(n)} euro`;
}

export function describeDraft(d: DemoActionDraft): string {
  if (d.kind === "savings_goal") {
    const monthly = d.monthlyAmountEuro ? `, ${spokenEuro(d.monthlyAmountEuro)} per maand` : "";
    return `Fictief spaardoel "${d.goalName}": doel ${spokenEuro(d.targetAmountEuro)}${monthly}.`;
  }
  return `Fictieve afspraak met een adviseur over "${d.topic}", voorkeur: ${d.preferredMoment}.`;
}

export function appointmentTitle(topic: string): string {
  return `Demo-afspraak: ${topic}`.slice(0, 80);
}

export function actionModule(a: DemoAction): GoalsModule | AdvisorModule {
  if (a.kind === "savings_goal") {
    return {
      type: "Goals",
      title: a.goalName,
      target: a.targetAmountEuro,
      current: 0,
      progressPct: 0,
      monthlyContribution: a.monthlyAmountEuro,
      note: "Fictief demo-spaardoel. Er is geen geld verplaatst.",
    };
  }
  return {
    type: "Advisor",
    title: appointmentTitle(a.topic),
    message: `Voorkeur: ${a.preferredMoment}. Dit is een simulatie: er wordt niemand gecontacteerd.`.slice(0, 200),
    cta: "Bewaard als demo",
  };
}

export function actionSummaryForAgent(a: DemoAction) {
  return a.kind === "savings_goal"
    ? { type: a.kind, goalName: a.goalName, targetEuro: a.targetAmountEuro, targetSpoken: spokenEuro(a.targetAmountEuro), monthlyEuro: a.monthlyAmountEuro ?? null }
    : { type: a.kind, topic: a.topic, preferredMoment: a.preferredMoment };
}

export function formatDraftForCard(d: DemoActionDraft): { title: string; lines: string[] } {
  if (d.kind === "savings_goal") {
    return {
      title: `Spaardoel: ${d.goalName}`,
      lines: [`Doel ${formatEur(d.targetAmountEuro)}`, ...(d.monthlyAmountEuro ? [`${formatEur(d.monthlyAmountEuro)} per maand`] : [])],
    };
  }
  return { title: `Afspraak: ${d.topic}`, lines: [`Voorkeur: ${d.preferredMoment}`] };
}

const AFFIRM = /\b(ja|jawel|jazeker|ok|oke|okay|akkoord|bevestig|bevestigd|bevestigen|doe maar|prima|graag|zeker|in orde|klopt|dat is goed)\b/;
const NEGATE = /\b(nee|neen|niet|geen|stop|annuleer|wacht|later)\b/;

function normalizeReply(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/** A plain "ja" without hesitation. Anything with a negation counts as no. */
export function isExplicitConfirmation(text: string): boolean {
  const t = normalizeReply(text);
  return AFFIRM.test(t) && !NEGATE.test(t);
}

export function isExplicitDecline(text: string): boolean {
  return NEGATE.test(normalizeReply(text));
}

export function parseDemoActionDraft(raw: Record<string, unknown>): DemoActionDraft | null {
  if (raw.kind === "savings_goal") {
    const parsed = SavingsGoalDraftSchema.safeParse({
      kind: "savings_goal",
      goalName: raw.goalName,
      targetAmountEuro: coerceNumber(raw.targetAmountEuro),
      monthlyAmountEuro: raw.monthlyAmountEuro == null || raw.monthlyAmountEuro === "" ? undefined : coerceNumber(raw.monthlyAmountEuro),
    });
    return parsed.success ? parsed.data : null;
  }
  if (raw.kind === "advisor_appointment") {
    const parsed = AdvisorAppointmentDraftSchema.safeParse({
      kind: "advisor_appointment",
      topic: raw.topic,
      preferredMoment: raw.preferredMoment,
    });
    return parsed.success ? parsed.data : null;
  }
  return null;
}

export function resolveConfirmation(
  pending: DemoActionDraft | null,
  userText: string,
): { outcome: "confirmed"; action: DemoAction } | { outcome: "declined" } | { outcome: "not_confirmed" } | { outcome: "none_pending" } {
  if (!pending) return { outcome: "none_pending" };
  if (isExplicitDecline(userText) && !isExplicitConfirmation(userText)) return { outcome: "declined" };
  if (!isExplicitConfirmation(userText)) return { outcome: "not_confirmed" };
  return {
    outcome: "confirmed",
    action: { ...pending, id: crypto.randomUUID(), confirmedAt: new Date().toISOString() },
  };
}

function coerceNumber(value: unknown): unknown {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const n = Number(value.replace(/\s/g, "").replace(",", "."));
    return Number.isFinite(n) ? n : value;
  }
  return value;
}
