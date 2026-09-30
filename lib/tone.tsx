"use client";

import { createContext, useContext } from "react";
import type { Tone } from "@/lib/schema";

/** Class sets per tone. Modules read these via useTone() so the same module looks different per customer. */
export type ToneStyle = {
  stack: string; // gap between modules
  card: string; // card surface, radius, padding
  eyebrow: string; // small label above a title
  title: string;
  body: string;
  muted: string;
  big: string; // headline numbers
  row: string; // list row spacing
  button: string;
  chip: string;
  accent: string; // hex, for bars and icons
  accentSoft: string; // hex, soft backgrounds
  emoji: boolean;
};

export const toneStyles: Record<Tone, ToneStyle> = {
  speels: {
    stack: "gap-3",
    card: "rounded-3xl bg-white p-4 shadow-[0_6px_20px_-8px_rgba(0,174,239,0.45)] ring-1 ring-sky-100",
    eyebrow: "text-[11px] font-bold uppercase tracking-wider text-fuchsia-500",
    title: "text-[17px] font-extrabold text-kbc-dark",
    body: "text-[13px] leading-snug text-slate-700",
    muted: "text-[12px] text-slate-500",
    big: "text-3xl font-black tracking-tight text-kbc-dark",
    row: "py-1.5",
    button: "rounded-full bg-gradient-to-r from-kbc to-fuchsia-500 px-4 py-2 text-[13px] font-bold text-white",
    chip: "rounded-full bg-fuchsia-100 px-2.5 py-0.5 text-[11px] font-bold text-fuchsia-700",
    accent: "#00AEEF",
    accentSoft: "#E0F6FE",
    emoji: true,
  },
  neutraal: {
    stack: "gap-4",
    card: "rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70",
    eyebrow: "text-[11px] font-semibold uppercase tracking-wide text-kbc",
    title: "text-base font-semibold text-kbc-dark",
    body: "text-sm leading-relaxed text-slate-700",
    muted: "text-xs text-slate-500",
    big: "text-3xl font-bold tracking-tight text-kbc-dark",
    row: "py-2.5",
    button: "rounded-xl bg-kbc px-4 py-2.5 text-sm font-semibold text-white",
    chip: "rounded-md bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-kbc-dark",
    accent: "#00AEEF",
    accentSoft: "#E6F7FD",
    emoji: false,
  },
  rustig: {
    stack: "gap-6",
    card: "rounded-3xl bg-white/90 p-7 ring-1 ring-slate-100",
    eyebrow: "text-xs font-medium uppercase tracking-widest text-slate-400",
    title: "text-xl font-medium text-slate-800",
    body: "text-[17px] leading-relaxed text-slate-600",
    muted: "text-sm text-slate-400",
    big: "text-4xl font-light tracking-tight text-slate-800",
    row: "py-3.5",
    button: "rounded-2xl bg-sky-100 px-5 py-3.5 text-base font-medium text-kbc-dark",
    chip: "rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600",
    accent: "#7CC6E4",
    accentSoft: "#F1F8FB",
    emoji: false,
  },
};

/** Phone screen background per tone. */
export const toneScreen: Record<Tone, string> = {
  speels: "bg-gradient-to-b from-sky-50 via-white to-fuchsia-50",
  neutraal: "bg-slate-50",
  rustig: "bg-[#F7FAFB]",
};

const ToneContext = createContext<ToneStyle>(toneStyles.neutraal);

export function ToneProvider({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return <ToneContext.Provider value={toneStyles[tone]}>{children}</ToneContext.Provider>;
}

export function useTone(): ToneStyle {
  return useContext(ToneContext);
}
