import type { LifeMoment } from "@/lib/schema";

/** Quick replies under the copilot input, per current life moment. */
export const quickReplies: Record<LifeMoment, string[]> = {
  new_baby: ["Wat kost kinderopvang?", "We willen groter wonen", "Ik ben mijn job kwijt"],
  job_loss: ["Hoelang kan ik rondkomen?", "Kan ik mijn lening uitstellen?", "Ik heb een nieuwe job"],
  first_job: ["Hoeveel staat er op mijn spaarrekening?", "We verwachten een baby", "Ik wil een huis kopen"],
  self_employed: ["Hoeveel moet ik opzijzetten?", "Ik wil een huis kopen", "We verwachten een baby"],
  retirement: ["Hoeveel staat er op mijn spaarrekening?", "Ik wil schenken aan mijn kleinkinderen", "Ik wil mijn huis aanpassen"],
  bereavement: ["Wat moet ik nu regelen?", "Hoe zit het met de erfenis?", "Ik wil met iemand praten"],
  other: ["We verwachten een baby", "Ik ben mijn job kwijt", "Ik wil een huis kopen"],
};
