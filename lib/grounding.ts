import { actionModule } from "@/lib/demo-actions";
import { MAX_MODULES, type Dashboard, type DemoAction, type GoalsModule, type Module } from "@/lib/schema";

const MONEY_IN_TEXT = /€\s?\d|\d[\d.,\s]*\s?(€|euro\b|eur\b)/i;

/**
 * Every financial number on screen comes from the customer's fixture or a confirmed demo action.
 * Numeric fields are overwritten; modules whose text invents euro amounts are replaced by the
 * fixture module of the same kind, or dropped.
 */
export function groundDashboard(d: Dashboard, seed: Dashboard, actions: DemoAction[]): Dashboard {
  const actionModules = actions.map(actionModule);
  const fixture: Module[] = [...seed.layout, ...actionModules];
  const fixtureText = new Set(fixture.flatMap(stringsOf));
  const goals = fixture.filter((m): m is GoalsModule => m.type === "Goals");
  const usedGoals = new Set<GoalsModule>();
  const seedBalance = seed.layout.find((m) => m.type === "Balance");
  const seedFamily = seed.layout.find((m) => m.type === "Family");
  const seedHousing = seed.layout.find((m) => m.type === "Housing");
  const seedCrisis = seed.layout.find((m) => m.type === "Crisis");
  let balanceShown = false;

  function ground(m: Module): Module | null {
    switch (m.type) {
      case "Balance":
        if (balanceShown || !seedBalance) return null;
        balanceShown = true;
        return { ...m, accounts: seedBalance.accounts };
      case "Goals": {
        const goal = goals.find((g) => !usedGoals.has(g) && g.title === m.title) ?? goals.find((g) => !usedGoals.has(g));
        if (!goal) return null;
        usedGoals.add(goal);
        return goal;
      }
      case "Family":
        return { ...m, monthlyCosts: seedFamily?.monthlyCosts ?? [] };
      case "Housing":
        if (!seedHousing) return null;
        return { ...m, status: seedHousing.status, monthlyCost: seedHousing.monthlyCost, remainingMortgage: seedHousing.remainingMortgage };
      case "Crisis":
        return { ...m, bufferMonths: seedCrisis?.bufferMonths ?? 0 };
      case "Advisor":
        return actionModules.find((a) => a.type === "Advisor" && a.title === m.title) ?? m;
      default:
        return m;
    }
  }

  const layout: Module[] = [];
  for (const raw of d.layout) {
    const safe = inventsMoney(raw, fixtureText) ? sameKind(raw, fixture) : raw;
    const grounded = safe && ground(safe);
    if (grounded) layout.push(grounded);
  }
  for (const a of actionModules) {
    const shown = a.type === "Goals" ? usedGoals.has(a) : layout.some((m) => m.type === "Advisor" && m.title === a.title);
    if (!shown) layout.push(a);
  }

  return { ...d, layout: layout.length ? layout.slice(0, MAX_MODULES) : seed.layout };
}

function inventsMoney(m: Module, fixtureText: Set<string>): boolean {
  return stringsOf(m).some((s) => MONEY_IN_TEXT.test(s) && !fixtureText.has(s));
}

function sameKind(m: Module, fixture: Module[]): Module | null {
  return fixture.find((f) => f.type === m.type && (f.type !== "InfoCard" || m.type !== "InfoCard" || f.variant === m.variant)) ?? null;
}

function stringsOf(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(stringsOf);
  if (value && typeof value === "object") return Object.values(value).flatMap(stringsOf);
  return [];
}
