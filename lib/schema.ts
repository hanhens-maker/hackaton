import { z } from "zod";

// ---------- Caps ----------
// Hard limits on everything the model can return. Anything outside → validation fails → fallback.

export const MAX_MODULES = 8;
export const MAX_AMOUNT = 10_000_000;
export const MAX_DEMO_ACTIONS = 10;

const shortText = z.string().trim().min(1).max(80);
const mediumText = z.string().trim().min(1).max(200);
const longText = z.string().trim().min(1).max(500);
const amount = z.number().finite().min(0).max(MAX_AMOUNT);
const signedAmount = z.number().finite().min(-MAX_AMOUNT).max(MAX_AMOUNT);
const percent = z.number().finite().min(0).max(100);

// ---------- Enums ----------

export const LifeMomentSchema = z.enum([
  "new_baby",
  "job_loss",
  "first_job",
  "self_employed",
  "retirement",
  "bereavement",
  "other",
]);

export const ToneSchema = z.enum(["speels", "neutraal", "rustig"]);

export const InfoVariantSchema = z.enum(["pension", "selfEmployed", "study", "investing"]);

export const HousingStatusSchema = z.enum(["owner", "mortgage", "rent", "living_with_family"]);

// ---------- Modules ----------

export const BalanceSchema = z.object({
  type: z.literal("Balance"),
  title: shortText,
  accounts: z
    .array(
      z.object({
        label: shortText,
        balance: signedAmount,
      }),
    )
    .min(1)
    .max(4),
});

export const GoalsSchema = z.object({
  type: z.literal("Goals"),
  title: shortText,
  target: amount,
  current: amount,
  progressPct: percent,
  monthlyContribution: amount.optional(),
  note: mediumText.optional(),
});

export const StepPlanSchema = z.object({
  type: z.literal("StepPlan"),
  title: shortText,
  steps: z
    .array(
      z.object({
        label: mediumText,
        done: z.boolean(),
      }),
    )
    .min(1)
    .max(6),
});

export const FamilySchema = z.object({
  type: z.literal("Family"),
  title: shortText,
  situation: mediumText,
  monthlyCosts: z
    .array(
      z.object({
        label: shortText,
        amount: amount,
      }),
    )
    .max(5),
  upcomingEvents: z
    .array(
      z.object({
        label: shortText,
        when: z.string().trim().min(1).max(40), // free text, e.g. "over 2 maanden", "september 2027"
      }),
    )
    .max(4),
});

// Carries product offers (mortgage, home insurance) → stripped in crisis mode.
export const HousingSchema = z.object({
  type: z.literal("Housing"),
  title: shortText,
  status: HousingStatusSchema,
  monthlyCost: amount,
  remainingMortgage: amount.optional(),
  plan: mediumText.optional(),
  cta: shortText.optional(),
});

export const CrisisSchema = z.object({
  type: z.literal("Crisis"),
  title: shortText,
  message: longText,
  nowSteps: z.array(mediumText).min(1).max(4),
  bufferMonths: z.number().finite().min(0).max(120),
});

export const AdvisorSchema = z.object({
  type: z.literal("Advisor"),
  title: shortText,
  message: mediumText,
  cta: shortText,
});

// variant "investing" carries product offers → stripped in crisis mode.
export const InfoCardSchema = z.object({
  type: z.literal("InfoCard"),
  variant: InfoVariantSchema,
  title: shortText,
  body: longText,
  cta: shortText.optional(),
});

export const ModuleSchema = z.discriminatedUnion("type", [
  BalanceSchema,
  GoalsSchema,
  StepPlanSchema,
  FamilySchema,
  HousingSchema,
  CrisisSchema,
  AdvisorSchema,
  InfoCardSchema,
]);

// ---------- Dashboard ----------

export const LayoutSchema = z.array(ModuleSchema).min(1).max(MAX_MODULES);

/** What the phone renders. Gemini returns exactly this shape; it never writes chat text. */
export const DashboardSchema = z.object({
  lifeMoment: LifeMomentSchema,
  tone: ToneSchema,
  layout: LayoutSchema,
});

// ---------- Demo actions (simulated, never real banking) ----------

export const SavingsGoalDraftSchema = z.object({
  kind: z.literal("savings_goal"),
  goalName: shortText,
  targetAmountEuro: z.number().finite().min(1).max(1_000_000),
  monthlyAmountEuro: z.number().finite().min(0).max(100_000).optional(),
});

export const AdvisorAppointmentDraftSchema = z.object({
  kind: z.literal("advisor_appointment"),
  topic: shortText,
  preferredMoment: z.string().trim().min(1).max(60),
});

export const DemoActionDraftSchema = z.discriminatedUnion("kind", [SavingsGoalDraftSchema, AdvisorAppointmentDraftSchema]);

export const DemoActionSchema = z.intersection(
  DemoActionDraftSchema,
  z.object({ id: z.string().min(1).max(64), confirmedAt: z.string().max(40) }),
);

// ---------- Compose endpoint ----------

export const ComposeRequestSchema = z.object({
  customerId: z.string().trim().min(1).max(64),
  message: z.string().trim().min(1).max(1000),
  dashboard: DashboardSchema,
  confirmedActions: z.array(DemoActionSchema).max(MAX_DEMO_ACTIONS).default([]),
});

export const ComposeResultSchema = z.object({
  dashboard: DashboardSchema,
  source: z.enum(["gemini", "fallback"]),
  crisisDetected: z.boolean(),
});

// ---------- Crisis rules (enforced in code, not by prompt) ----------

export const CRISIS_MOMENTS: ReadonlySet<LifeMoment> = new Set(["job_loss", "bereavement"]);

export function isCrisis(lifeMoment: LifeMoment): boolean {
  return CRISIS_MOMENTS.has(lifeMoment);
}

/** Modules that carry product offers. Never shown in a crisis. */
export function isProductModule(m: Module): boolean {
  return m.type === "Housing" || (m.type === "InfoCard" && m.variant === "investing");
}

const CRISIS_PHRASES: ReadonlyArray<readonly [LifeMoment, readonly string[]]> = [
  [
    "job_loss",
    ["job kwijt", "werk kwijt", "baan kwijt", "job verloren", "werk verloren", "baan verloren", "ontslag", "ontslagen", "werkloos", "c4 gekregen", "herstructurering"],
  ],
  ["bereavement", ["overleden", "overlijden", "gestorven", "begrafenis", "weduwe", "weduwnaar", "in de rouw"]],
];

/** Keyword check on what the customer said, so a crisis never depends on the model's classification. */
export function detectCrisisMoment(text: string): LifeMoment | null {
  const normalized = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  for (const [moment, phrases] of CRISIS_PHRASES) {
    if (phrases.some((p) => normalized.includes(p))) return moment;
  }
  return null;
}

/** Used when the model forgets the Crisis block in a crisis moment. */
export const DEFAULT_CRISIS_MODULE: CrisisModule = {
  type: "Crisis",
  title: "We zijn er voor je",
  message: "Neem even de tijd. Je hoeft nu niet alles tegelijk te regelen. We helpen je stap voor stap.",
  nowSteps: ["Bekijk je vaste kosten van deze maand", "Praat met een adviseur, gratis en vrijblijvend"],
  bufferMonths: 0,
};

/**
 * In a crisis moment: calm tone, drop product modules, keep one Crisis block and put it first.
 * No-op otherwise.
 */
export function applyCrisisRules(d: Dashboard): Dashboard {
  if (!isCrisis(d.lifeMoment)) return d;
  const crisis = d.layout.find((m): m is CrisisModule => m.type === "Crisis") ?? DEFAULT_CRISIS_MODULE;
  const rest = d.layout.filter((m) => m.type !== "Crisis" && !isProductModule(m));
  return { ...d, tone: "rustig", layout: [crisis, ...rest].slice(0, MAX_MODULES) };
}

// ---------- Types ----------

export type LifeMoment = z.infer<typeof LifeMomentSchema>;
export type Tone = z.infer<typeof ToneSchema>;
export type InfoVariant = z.infer<typeof InfoVariantSchema>;
export type HousingStatus = z.infer<typeof HousingStatusSchema>;

export type BalanceModule = z.infer<typeof BalanceSchema>;
export type GoalsModule = z.infer<typeof GoalsSchema>;
export type StepPlanModule = z.infer<typeof StepPlanSchema>;
export type FamilyModule = z.infer<typeof FamilySchema>;
export type HousingModule = z.infer<typeof HousingSchema>;
export type CrisisModule = z.infer<typeof CrisisSchema>;
export type AdvisorModule = z.infer<typeof AdvisorSchema>;
export type InfoCardModule = z.infer<typeof InfoCardSchema>;

export type Module = z.infer<typeof ModuleSchema>;
export type ModuleType = Module["type"];
export type Layout = z.infer<typeof LayoutSchema>;
export type Dashboard = z.infer<typeof DashboardSchema>;
export type DemoActionDraft = z.infer<typeof DemoActionDraftSchema>;
export type DemoAction = z.infer<typeof DemoActionSchema>;
export type ComposeRequest = z.infer<typeof ComposeRequestSchema>;
export type ComposeResult = z.infer<typeof ComposeResultSchema>;
