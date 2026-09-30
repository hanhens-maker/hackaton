import { z } from "zod";

// ---------- Caps ----------
// Hard limits on everything the model can return. Anything outside → validation fails → fallback.

export const MAX_MODULES = 8;
export const MAX_AMOUNT = 10_000_000;

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

export const InsuranceStatusSchema = z.enum(["have", "missing", "review"]);

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

const whenText = z.string().trim().min(1).max(40); // free text, e.g. "april 2027", "over 2 maanden"

// Carries a product/spending offer → stripped in crisis mode.
export const TravelPlannerSchema = z.object({
  type: z.literal("TravelPlanner"),
  title: shortText,
  destination: shortText,
  departure: whenText,
  items: z
    .array(
      z.object({
        label: shortText, // e.g. "Vlucht", "Verblijf", "Zakgeld"
        amount: amount,
      }),
    )
    .min(1)
    .max(4),
  saved: amount,
  monthlySaving: amount,
  tip: mediumText.optional(),
});

export const BudgetSchema = z.object({
  type: z.literal("Budget"),
  title: shortText,
  categories: z
    .array(
      z.object({
        label: shortText,
        planned: amount,
        spent: amount,
      }),
    )
    .min(1)
    .max(6),
  leftThisMonth: signedAmount,
});

// cta is stripped in crisis mode; the check itself stays.
export const InsuranceCheckSchema = z.object({
  type: z.literal("InsuranceCheck"),
  title: shortText,
  items: z
    .array(
      z.object({
        name: shortText,
        status: InsuranceStatusSchema,
        reason: mediumText,
      }),
    )
    .min(1)
    .max(6),
  cta: shortText.optional(),
});

export const TimelineSchema = z.object({
  type: z.literal("Timeline"),
  title: shortText,
  events: z
    .array(
      z.object({
        label: shortText,
        when: whenText,
      }),
    )
    .min(2)
    .max(5),
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
  TravelPlannerSchema,
  BudgetSchema,
  InsuranceCheckSchema,
  TimelineSchema,
]);

// ---------- Signals ("Wat KBC opmerkte") ----------

export const SignalTypeSchema = z.enum(["situatie", "gedrag", "intentie"]);
export const MAX_NEW_SIGNALS = 3;

export const SignalSchema = z.object({
  type: SignalTypeSchema,
  label: z.string().trim().min(1).max(70),
});

// ---------- Compose ----------

export const LayoutSchema = z.array(ModuleSchema).min(1).max(MAX_MODULES);

export const ComposeResponseSchema = z.object({
  lifeMoment: LifeMomentSchema,
  tone: ToneSchema,
  layout: LayoutSchema,
  reply: longText,
  /** New signals detected in the latest message. Absent for seeds and fallbacks. */
  signals: z.array(SignalSchema).max(MAX_NEW_SIGNALS).optional(),
});

export const MAX_MESSAGE_LENGTH = 500;
export const MAX_HISTORY = 6;

export const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(MAX_MESSAGE_LENGTH),
});

/** Client → /api/compose. Everything here is untrusted and re-validated server-side. */
export const ComposeRequestSchema = z.object({
  userId: z.string().trim().max(64),
  lifeMoment: LifeMomentSchema,
  tone: ToneSchema,
  layout: LayoutSchema,
  history: z.array(ChatMessageSchema).max(MAX_HISTORY),
  /** Signals already detected in this chat, so the model doesn't repeat them. */
  signals: z.array(SignalSchema).max(12),
  message: z.string().trim().min(1).max(MAX_MESSAGE_LENGTH),
});

/** What the model returns. `layout: null` = keep the current layout (question without a new life moment). */
export const LlmResponseSchema = ComposeResponseSchema.extend({
  layout: LayoutSchema.nullable(),
  signals: z.array(SignalSchema).max(MAX_NEW_SIGNALS).nullable(),
});

// ---------- Crisis rules (enforced in code, not by prompt) ----------

export const CRISIS_MOMENTS: ReadonlySet<LifeMoment> = new Set(["job_loss", "bereavement"]);

export function isCrisis(lifeMoment: LifeMoment): boolean {
  return CRISIS_MOMENTS.has(lifeMoment);
}

/** Modules that carry product offers. Never shown in a crisis. */
export function isProductModule(m: Module): boolean {
  return m.type === "Housing" || m.type === "TravelPlanner" || (m.type === "InfoCard" && m.variant === "investing");
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
 * In a crisis moment: tone becomes rustig, product modules are dropped, CTAs are removed
 * from modules that stay (InsuranceCheck), and exactly one Crisis block is put first. No-op otherwise.
 */
export function applyCrisisRules(res: ComposeResponse): ComposeResponse {
  if (!isCrisis(res.lifeMoment)) return res;
  const crisis = res.layout.find((m): m is CrisisModule => m.type === "Crisis") ?? DEFAULT_CRISIS_MODULE;
  const rest = res.layout
    .filter((m) => m.type !== "Crisis" && !isProductModule(m))
    .map((m) => (m.type === "InsuranceCheck" ? withoutCta(m) : m));
  return { ...res, tone: "rustig", layout: [crisis, ...rest].slice(0, MAX_MODULES) };
}

function withoutCta(m: InsuranceCheckModule): InsuranceCheckModule {
  const { cta: _cta, ...rest } = m; // eslint-disable-line @typescript-eslint/no-unused-vars
  return rest;
}

// ---------- Types ----------

export type LifeMoment = z.infer<typeof LifeMomentSchema>;
export type Tone = z.infer<typeof ToneSchema>;
export type SignalType = z.infer<typeof SignalTypeSchema>;
export type Signal = z.infer<typeof SignalSchema>;
export type InfoVariant = z.infer<typeof InfoVariantSchema>;
export type HousingStatus = z.infer<typeof HousingStatusSchema>;
export type InsuranceStatus = z.infer<typeof InsuranceStatusSchema>;

export type BalanceModule = z.infer<typeof BalanceSchema>;
export type GoalsModule = z.infer<typeof GoalsSchema>;
export type StepPlanModule = z.infer<typeof StepPlanSchema>;
export type FamilyModule = z.infer<typeof FamilySchema>;
export type HousingModule = z.infer<typeof HousingSchema>;
export type CrisisModule = z.infer<typeof CrisisSchema>;
export type AdvisorModule = z.infer<typeof AdvisorSchema>;
export type InfoCardModule = z.infer<typeof InfoCardSchema>;
export type TravelPlannerModule = z.infer<typeof TravelPlannerSchema>;
export type BudgetModule = z.infer<typeof BudgetSchema>;
export type InsuranceCheckModule = z.infer<typeof InsuranceCheckSchema>;
export type TimelineModule = z.infer<typeof TimelineSchema>;

export type Module = z.infer<typeof ModuleSchema>;
export type ModuleType = Module["type"];
export type Layout = z.infer<typeof LayoutSchema>;
export type ComposeResponse = z.infer<typeof ComposeResponseSchema>;
export type ComposeRequest = z.infer<typeof ComposeRequestSchema>;
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type LlmResponse = z.infer<typeof LlmResponseSchema>;
