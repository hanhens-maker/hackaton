import type { Dashboard, LifeMoment } from "@/lib/schema";

export type SeedUser = {
  id: string;
  name: string;
  age: number;
  /** Short English description, fed to the model as customer context. */
  profile: string;
  /** How the assistant and the dashboard address this customer. Chosen per customer, never inferred from age. */
  addressForm: "je" | "u";
  /** Copilot greeting shown above the seed dashboard. */
  greeting: string;
  dashboard: Dashboard;
};

export const DEFAULT_SEED_USER_ID = "starter";

export const seedUsers: SeedUser[] = [
  {
    id: "baby",
    name: "Sofie",
    addressForm: "je",
    age: 32,
    profile: "Employed nurse, partner, first baby due in 2 months. Joint account, modest savings, rents an apartment.",
    greeting: "Proficiat, Sofie! We hebben je app aangepast zodat je alles voor de komst van je kindje op één plek hebt.",
    dashboard: {
      lifeMoment: "new_baby",
      tone: "speels",
      layout: [
        {
          type: "Family",
          title: "Jullie gezin groeit 👶",
          situation: "Samenwonend, eerste kindje verwacht over 2 maanden.",
          monthlyCosts: [
            { label: "Kinderopvang (geschat)", amount: 450 },
            { label: "Luiers & verzorging", amount: 90 },
          ],
          upcomingEvents: [
            { label: "Uitgerekende datum", when: "over 2 maanden" },
            { label: "Start ouderschapsverlof", when: "over 5 maanden" },
          ],
        },
        {
          type: "StepPlan",
          title: "Checklist voor de geboorte",
          steps: [
            { label: "Groeipakket aanvragen", done: false },
            { label: "Ouderschapsverlof plannen", done: false },
            { label: "Hospitalisatieverzekering uitbreiden naar je kindje", done: false },
            { label: "Spaarrekening voor je kindje openen", done: true },
          ],
        },
        { type: "Goals", title: "Babybuffer", target: 5000, current: 3200, progressPct: 64, monthlyContribution: 250, note: "Voor kinderwagen, kamertje en de eerste maanden." },
        {
          type: "Balance",
          title: "Jullie rekeningen",
          accounts: [
            { label: "Gezamenlijke zichtrekening", balance: 3450 },
            { label: "Spaarrekening", balance: 8200 },
          ],
        },
        { type: "Housing", title: "Plaats voor drie?", status: "rent", monthlyCost: 950, plan: "Jullie huren nu een appartement met één slaapkamer.", cta: "Bekijk wat je kan lenen" },
      ],
    },
  },
  {
    id: "job-loss",
    name: "Marc",
    addressForm: "je",
    age: 47,
    profile: "Just lost his job in logistics after 15 years. Mortgage, two teenagers, some savings.",
    greeting: "Dat is een zware klap, Marc. We hebben je app rustiger gemaakt en tonen alleen wat je nu echt nodig hebt.",
    dashboard: {
      lifeMoment: "job_loss",
      tone: "rustig",
      layout: [
        {
          type: "Crisis",
          title: "Eén stap tegelijk",
          message: "Je hebt een buffer. Je hoeft vandaag niets overhaast te beslissen.",
          nowSteps: ["Schrijf je in bij VDAB", "Vraag je werkloosheidsuitkering aan", "Bekijk je vaste kosten"],
          bufferMonths: 6,
        },
        {
          type: "Balance",
          title: "Je rekeningen",
          accounts: [
            { label: "Zichtrekening", balance: 2350 },
            { label: "Spaarrekening", balance: 14800 },
          ],
        },
        {
          type: "StepPlan",
          title: "Wat je al deed",
          steps: [
            { label: "C4 opvragen bij je werkgever", done: true },
            { label: "Inschrijven bij VDAB", done: false },
            { label: "Werkloosheidsuitkering aanvragen via je vakbond of HVW", done: false },
            { label: "Uitstel van aflossing woonlening bespreken", done: false },
          ],
        },
        { type: "Advisor", title: "Praat met iemand", message: "Een adviseur kijkt samen met jou naar je lening en je budget. Gratis en vrijblijvend.", cta: "Plan een gesprek" },
      ],
    },
  },
  {
    id: "starter",
    name: "Lotte",
    addressForm: "je",
    age: 23,
    profile: "Just graduated, first full-time job in marketing. Lives in a rented studio, no savings yet.",
    greeting: "Welkom in de wereld van het eerste loon, Lotte! Hier is een app die met je meegroeit.",
    dashboard: {
      lifeMoment: "first_job",
      tone: "speels",
      layout: [
        {
          type: "Balance",
          title: "Je eerste loon is binnen 🚀",
          accounts: [
            { label: "Zichtrekening", balance: 2100 },
            { label: "Spaarrekening", balance: 150 },
          ],
        },
        { type: "Goals", title: "Noodbuffer", target: 3000, current: 150, progressPct: 5, monthlyContribution: 200, note: "Drie maanden huur als buffer is een goed begin." },
        {
          type: "StepPlan",
          title: "Slim starten",
          steps: [
            { label: "Automatische spaaropdracht op loondag instellen", done: false },
            { label: "Studentenrekening omzetten naar gewone rekening", done: true },
            { label: "Budget per maand vastleggen", done: false },
          ],
        },
        { type: "InfoCard", variant: "investing", title: "Beleggen vanaf €25", body: "Met een maandelijks beleggingsplan start je klein en spreid je je risico over de tijd.", cta: "Ontdek hoe" },
        { type: "InfoCard", variant: "study", title: "Nog een studieschuld?", body: "Los eerst leningen met hoge rente af voor je begint te beleggen." },
      ],
    },
  },
  {
    id: "self-employed",
    name: "Youssef",
    addressForm: "je",
    age: 36,
    profile: "Freelance web developer, 2nd year as self-employed. Irregular income, quarterly social contributions and VAT. Rents, wants to buy.",
    greeting: "Hier is je ondernemersoverzicht, Youssef: cashflow, reserves en wat er binnenkort vervalt.",
    dashboard: {
      lifeMoment: "self_employed",
      tone: "neutraal",
      layout: [
        {
          type: "Balance",
          title: "Zakelijk en privé",
          accounts: [
            { label: "Zakelijke rekening", balance: 18400 },
            { label: "Reserve btw & belastingen", balance: 6200 },
            { label: "Privérekening", balance: 3100 },
          ],
        },
        {
          type: "StepPlan",
          title: "Deadlines dit kwartaal",
          steps: [
            { label: "Btw-aangifte Q3 indienen vóór 20 oktober", done: false },
            { label: "Sociale bijdragen betalen", done: false },
            { label: "Openstaande facturen opvolgen (2)", done: false },
          ],
        },
        { type: "InfoCard", variant: "selfEmployed", title: "Houd 50% opzij", body: "Zet van elke betaalde factuur ongeveer de helft opzij voor btw, belastingen en sociale bijdragen." },
        { type: "InfoCard", variant: "pension", title: "Vrij Aanvullend Pensioen", body: "Als zelfstandige bouw je weinig wettelijk pensioen op. Met een VAPZ bouw je extra op en verlaag je je sociale bijdragen.", cta: "Simuleer je voordeel" },
        { type: "Housing", title: "Een eigen huis kopen", status: "rent", monthlyCost: 1050, plan: "Als zelfstandige vraagt de bank meestal 3 jaar jaarrekeningen voor een woonlening.", cta: "Bereken je leencapaciteit" },
      ],
    },
  },
  {
    id: "retiree",
    name: "Jeanine",
    addressForm: "u",
    age: 67,
    profile: "Just retired teacher. Owns her home, pension income, solid savings. Wants simplicity and security.",
    greeting: "Geniet van uw pensioen, Jeanine. We hebben uw app eenvoudig en overzichtelijk gemaakt.",
    dashboard: {
      lifeMoment: "retirement",
      tone: "rustig",
      layout: [
        { type: "InfoCard", variant: "pension", title: "Uw eerste pensioen is gestort", body: "Uw pensioen komt voortaan elke maand rond de 25e binnen op uw zichtrekening." },
        {
          type: "Balance",
          title: "Uw rekeningen",
          accounts: [
            { label: "Zichtrekening", balance: 4200 },
            { label: "Spaarrekening", balance: 62000 },
          ],
        },
        { type: "Housing", title: "Uw woning", status: "owner", monthlyCost: 180, plan: "Uw woning is afbetaald. Denkt u aan aanpassingen om er lang comfortabel te blijven wonen?" },
        { type: "Advisor", title: "Liever persoonlijk?", message: "Uw vaste adviseur in het kantoor helpt u graag verder, bijvoorbeeld over schenken aan uw kleinkinderen.", cta: "Maak een afspraak" },
      ],
    },
  },
];

export function getSeedUser(id: string | undefined): SeedUser | undefined {
  return seedUsers.find((u) => u.id === id);
}

export function getSeedUserByMoment(moment: LifeMoment): SeedUser | undefined {
  return seedUsers.find((u) => u.dashboard.lifeMoment === moment);
}
