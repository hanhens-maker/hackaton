const eur = new Intl.NumberFormat("nl-BE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

export function formatEur(n: number): string {
  return eur.format(n);
}
