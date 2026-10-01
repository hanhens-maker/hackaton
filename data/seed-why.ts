/**
 * Dutch explanations for the "Waarom ziet deze klant dit?" panel.
 * `modules[i]` explains `seedUser.dashboard.layout[i]`.
 */
export type SeedWhy = {
  lifeMoment: string;
  tone: string;
  modules: string[];
};

export const seedWhy: Record<string, SeedWhy> = {
  baby: {
    lifeMoment: "Sofie verwacht over 2 maanden haar eerste kindje. Haar uitgaven aan babyspullen stijgen en ze zocht info over het Groeipakket.",
    tone: "Een blij moment, dus de app mag vrolijk en compact zijn.",
    modules: [
      "Gezin staat bovenaan: de nieuwe kosten en de uitgerekende datum zijn nu het belangrijkst.",
      "Een geboorte brengt veel administratie mee. Het stappenplan toont wat nog moet.",
      "Ze spaart al voor een babybuffer. De voortgang motiveert om door te gaan.",
      "Een snel overzicht van de gezamenlijke rekeningen.",
      "Ze huren een klein appartement. Een groter gezin denkt vaak aan verhuizen of kopen.",
    ],
  },
  "job-loss": {
    lifeMoment: "Marc verloor zijn job na 15 jaar. Zijn inkomen valt weg, maar de woonlening en de kosten voor zijn tieners lopen door.",
    tone: "Een crisismoment. De app wordt rustig en toont geen productaanbod.",
    modules: [
      "Het steunblok staat altijd eerst in een crisis: wat nu te doen, en hoelang zijn buffer volstaat.",
      "Overzicht geeft rust: hij ziet meteen hoeveel hij heeft.",
      "Concrete stappen na ontslag, met wat hij al deed afgevinkt.",
      "Een mens om mee te praten over zijn lening en budget, gratis en vrijblijvend.",
    ],
  },
  starter: {
    lifeMoment: "Lotte is net afgestudeerd en kreeg haar eerste loon. Ze heeft nog geen spaarbuffer.",
    tone: "Jong en enthousiast: felle kleuren en een energieke toon.",
    modules: [
      "Haar eerste loon is binnen. Dat verdient een plek bovenaan.",
      "Een noodbuffer is de eerste stap naar financiële gezondheid.",
      "Kleine, haalbare acties om slim te starten.",
      "Met een klein bedrag leren beleggen past bij haar lange horizon.",
      "Studieleningen eerst aflossen is vaak slimmer dan meteen beleggen.",
    ],
  },
  "self-employed": {
    lifeMoment: "Youssef is freelancer in zijn tweede jaar. Zijn inkomen schommelt en de btw- en belastingdeadlines lopen elk kwartaal terug.",
    tone: "Een ondernemer wil overzicht zonder franjes: zakelijke standaardstijl.",
    modules: [
      "Zakelijk en privé naast elkaar, met een aparte reserve voor btw en belastingen.",
      "De deadlines van dit kwartaal, zodat hij niets mist.",
      "De belangrijkste vuistregel voor zelfstandigen: houd genoeg opzij.",
      "Zelfstandigen bouwen weinig wettelijk pensioen op. Een VAPZ vult dat aan en levert fiscaal voordeel op.",
      "Hij huurt en wil kopen. Als zelfstandige heeft hij daarvoor meer voorbereiding nodig.",
    ],
  },
  retiree: {
    lifeMoment: "Jeanine is net met pensioen. Ze heeft een afbetaald huis en een mooie spaarpot, en wil vooral eenvoud en zekerheid.",
    tone: "Grote letters, veel rust en de beleefdheidsvorm \"u\".",
    modules: [
      "Haar eerste pensioen is net gestort. Dat is het moment van nu, dus het staat bovenaan.",
      "Daarna haar rekeningen, zodat ze meteen ziet dat alles klopt.",
      "Haar woning is afbetaald. Aanpassingen om er lang te blijven wonen worden relevant.",
      "Ze vertrouwt op haar vaste adviseur, bijvoorbeeld voor een schenking aan haar kleinkinderen.",
    ],
  },
};
