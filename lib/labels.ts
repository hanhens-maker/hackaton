import type { HousingStatus, InfoVariant, LifeMoment, ModuleType, Tone } from "@/lib/schema";

export const lifeMomentLabel: Record<LifeMoment, string> = {
  new_baby: "Baby op komst",
  job_loss: "Job verloren",
  first_job: "Eerste job",
  self_employed: "Zelfstandige",
  retirement: "Met pensioen",
  bereavement: "Overlijden naaste",
  other: "Ander moment",
};

export const toneLabel: Record<Tone, string> = {
  speels: "Speels",
  neutraal: "Neutraal",
  rustig: "Rustig",
};

export const toneDescription: Record<Tone, string> = {
  speels: "Felle kleuren, compacte kaarten, energieke taal.",
  neutraal: "Standaard KBC-stijl: helder, zakelijk, overzichtelijk.",
  rustig: "Grotere tekst, veel witruimte, zachte kleuren.",
};

export const moduleLabel: Record<ModuleType, string> = {
  Balance: "Saldo",
  Goals: "Spaardoel",
  StepPlan: "Stappenplan",
  Family: "Gezin",
  Housing: "Wonen",
  Crisis: "Steun",
  Advisor: "Adviseur",
  InfoCard: "Info",
};

export const housingStatusLabel: Record<HousingStatus, string> = {
  owner: "Eigenaar",
  mortgage: "Woonlening",
  rent: "Huurder",
  living_with_family: "Inwonend",
};

export const infoVariantLabel: Record<InfoVariant, { label: string; emoji: string; color: string; soft: string }> = {
  pension: { label: "Pensioen", emoji: "🌅", color: "#7C5CFA", soft: "#F1EDFF" },
  selfEmployed: { label: "Zelfstandig", emoji: "🧾", color: "#F59E0B", soft: "#FEF5E6" },
  study: { label: "Studie", emoji: "🎓", color: "#10B981", soft: "#E8F8F1" },
  investing: { label: "Beleggen", emoji: "📈", color: "#00AEEF", soft: "#E6F7FD" },
};
