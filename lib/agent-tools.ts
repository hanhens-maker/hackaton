import { actionSummaryForAgent, describeDraft, parseDemoActionDraft, resolveConfirmation, spokenEuro } from "@/lib/demo-actions";
import { groundDashboard } from "@/lib/grounding";
import {
  ComposeResultSchema,
  MAX_DEMO_ACTIONS,
  applyCrisisRules,
  type Dashboard,
  type DemoAction,
  type DemoActionDraft,
} from "@/lib/schema";
import { writeSaved } from "@/lib/storage";
import type { SeedUser } from "@/data/seed-users";

export type AgentLiveState = {
  user: SeedUser;
  dashboard: Dashboard;
  actions: DemoAction[];
  pending: DemoActionDraft | null;
  setPending: (draft: DemoActionDraft | null) => void;
  setBusy: (busy: boolean) => void;
};

/** Spoken greeting for the agent's default first_message in ElevenLabs. Not sent as a client override. */
export function agentFirstMessage(name: string, addressForm: "je" | "u"): string {
  return addressForm === "u"
    ? `Goedendag ${name}, ik ben uw KBC-assistent. Ik help u met uw app en met fictieve demo-acties. Er gaat geen echt geld mee gemoeid. Waarmee kan ik u helpen?`
    : `Hallo ${name}, ik ben je KBC-assistent. Ik help je met je app en met fictieve demo-acties. Er gaat geen echt geld mee gemoeid. Waar kan ik je mee helpen?`;
}

export function defaultCopilotLine(name: string, addressForm: "je" | "u"): string {
  return addressForm === "u"
    ? `Hallo ${name}. Start een gesprek in het linkerpaneel. Ik praat met u en u mag ook typen.`
    : `Hallo ${name}. Start een gesprek in het linkerpaneel. Ik praat met je en je mag ook typen.`;
}

export function accountSnapshot(user: SeedUser, dashboard: Dashboard, actions: DemoAction[], pending: DemoActionDraft | null) {
  const seedLayout = user.dashboard.layout;
  const accounts = seedLayout.flatMap((m) => (m.type === "Balance" ? m.accounts : []));
  const goals = seedLayout.filter((m) => m.type === "Goals");
  const housing = seedLayout.find((m) => m.type === "Housing");
  const family = seedLayout.find((m) => m.type === "Family");
  const crisis = dashboard.layout.find((m) => m.type === "Crisis") ?? seedLayout.find((m) => m.type === "Crisis");
  return {
    customer: {
      id: user.id,
      name: user.name,
      age: user.age,
      addressForm: user.addressForm,
      lifeMoment: dashboard.lifeMoment,
      tone: dashboard.tone,
    },
    accounts: accounts.map((a) => ({ label: a.label, balanceEuro: a.balance, balanceSpoken: spokenEuro(a.balance) })),
    goals: goals.map((g) => ({
      title: g.title,
      targetEuro: g.target,
      targetSpoken: spokenEuro(g.target),
      currentEuro: g.current,
      currentSpoken: spokenEuro(g.current),
      progressPct: g.progressPct,
    })),
    housing: housing
      ? { status: housing.status, monthlyCostEuro: housing.monthlyCost, monthlyCostSpoken: spokenEuro(housing.monthlyCost) }
      : null,
    familyCosts: family
      ? family.monthlyCosts.map((c) => ({ label: c.label, amountEuro: c.amount, amountSpoken: spokenEuro(c.amount) }))
      : [],
    bufferMonths: crisis && "bufferMonths" in crisis ? crisis.bufferMonths : null,
    confirmedDemoActions: actions.map(actionSummaryForAgent),
    pendingDemoAction: pending ? describeDraft(pending) : null,
    visibleModules: dashboard.layout.map((m) => m.type),
    note: "Demo fixtures only. Speak amounts as Dutch words from *Spoken fields. Never invent a number.",
  };
}

export async function toolGetDemoAccountData(s: AgentLiveState): Promise<string> {
  return JSON.stringify(accountSnapshot(s.user, s.dashboard, s.actions, s.pending));
}

export async function toolComposeDashboard(s: AgentLiveState, params: Record<string, unknown>): Promise<string> {
  const message = String(params.message ?? params.need ?? params.text ?? "").trim();
  if (!message) return JSON.stringify({ ok: false, error: "empty_message" });
  s.setBusy(true);
  try {
    const res = await fetch("/api/compose", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId: s.user.id,
        message,
        dashboard: s.dashboard,
        confirmedActions: s.actions,
      }),
    });
    const parsed = ComposeResultSchema.safeParse(await res.json().catch(() => null));
    if (!res.ok || !parsed.success) return JSON.stringify({ ok: false, error: "compose_failed" });
    writeSaved(s.user.id, { dashboard: parsed.data.dashboard, actions: s.actions });
    return JSON.stringify({
      ok: true,
      crisisDetected: parsed.data.crisisDetected,
      lifeMoment: parsed.data.dashboard.lifeMoment,
      tone: parsed.data.dashboard.tone,
      modules: parsed.data.dashboard.layout.map((m) => m.type),
      source: parsed.data.source,
      speak: parsed.data.crisisDetected
        ? "Crisismodus staat aan. Spreek rustig, geen productaanbod. Zeg kort dat de app is aangepast. Noem geen verzonnen bedragen."
        : "Dashboard aangepast. Bevestig kort. Roep getDemoAccountData aan als je een bedrag noemt.",
    });
  } catch {
    return JSON.stringify({ ok: false, error: "network" });
  } finally {
    s.setBusy(false);
  }
}

export async function toolProposeDemoAction(s: AgentLiveState, params: Record<string, unknown>): Promise<string> {
  const draft = parseDemoActionDraft(params);
  if (!draft) return JSON.stringify({ ok: false, error: "invalid_draft" });
  if (s.actions.length >= MAX_DEMO_ACTIONS) {
    return JSON.stringify({ ok: false, error: "limit_reached" });
  }
  s.setPending(draft);
  return JSON.stringify({
    ok: true,
    pending: true,
    summarySpoken: describeDraft(draft),
    instruction:
      "Lees de samenvatting voor. Zeg duidelijk dat het fictief is. Vraag om een expliciet ja. Roep daarna confirmDemoAction aan met de letterlijke klantzin in userText. Voer niets uit zelf.",
  });
}

export async function toolConfirmDemoAction(s: AgentLiveState, params: Record<string, unknown>): Promise<string> {
  const userText = String(params.userText ?? params.text ?? params.utterance ?? "").trim();
  const result = resolveConfirmation(s.pending, userText);
  if (result.outcome === "none_pending") return JSON.stringify({ ok: false, error: "none_pending" });
  if (result.outcome === "declined") {
    s.setPending(null);
    return JSON.stringify({ ok: false, error: "declined", pending: false });
  }
  if (result.outcome === "not_confirmed") {
    return JSON.stringify({
      ok: false,
      error: "not_confirmed",
      pending: true,
      instruction: "Nog geen expliciet ja. Vraag opnieuw, of annuleer bij nee.",
    });
  }
  if (s.actions.length >= MAX_DEMO_ACTIONS) {
    s.setPending(null);
    return JSON.stringify({ ok: false, error: "limit_reached" });
  }
  const actions = [...s.actions, result.action];
  const dashboard = applyCrisisRules(groundDashboard(s.dashboard, s.user.dashboard, actions));
  writeSaved(s.user.id, { dashboard, actions });
  s.setPending(null);
  return JSON.stringify({
    ok: true,
    confirmed: true,
    action: actionSummaryForAgent(result.action),
    speak: "Bevestig dat het als demo is bewaard. Er is geen geld verplaatst en niemand is gecontacteerd.",
  });
}
