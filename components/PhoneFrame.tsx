"use client";

import { AnimatePresence, motion } from "framer-motion";
import { formatDraftForCard } from "@/lib/demo-actions";
import type { Dashboard, DemoActionDraft } from "@/lib/schema";
import { toneScreen } from "@/lib/tone";
import Renderer from "./Renderer";

export type VoiceStatus = "idle" | "connecting" | "listening" | "speaking" | "error";

export default function PhoneFrame({
  userKey,
  name,
  dashboard,
  loading = false,
  agentMessage,
  userHeard,
  pending,
  voiceStatus = "idle",
  onConfirmPending,
  onCancelPending,
}: {
  userKey: string;
  name: string;
  dashboard: Dashboard;
  loading?: boolean;
  agentMessage: string;
  userHeard?: string;
  pending?: DemoActionDraft | null;
  voiceStatus?: VoiceStatus;
  onConfirmPending?: () => void;
  onCancelPending?: () => void;
}) {
  const pendingCard = pending ? formatDraftForCard(pending) : null;
  return (
    <div className="relative h-[844px] max-h-[calc(100vh-48px)] w-[390px] shrink-0 rounded-[56px] bg-slate-900 p-3 shadow-[0_40px_80px_-20px_rgba(0,54,101,0.45)]">
      <div className={`relative flex h-full flex-col overflow-hidden rounded-[44px] transition-colors duration-700 ${toneScreen[dashboard.tone]}`}>
        <div className="relative flex h-12 shrink-0 items-center justify-between px-8 text-[13px] font-semibold text-slate-900">
          <span>9:41</span>
          <span className="absolute left-1/2 top-2.5 h-7 w-28 -translate-x-1/2 rounded-full bg-slate-900" />
          <span className="flex items-center gap-1.5">
            <span className="flex items-end gap-0.5">
              {[4, 6, 8, 10].map((h) => (
                <span key={h} className="w-[3px] rounded-sm bg-slate-900" style={{ height: h }} />
              ))}
            </span>
            <span className="h-3 w-6 rounded-[4px] border-2 border-slate-900 p-px">
              <span className="block h-full w-3/4 rounded-[1px] bg-slate-900" />
            </span>
          </span>
        </div>

        <div className="flex shrink-0 items-center justify-between px-5 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-kbc text-sm font-black text-white">K</span>
            <span className="text-sm font-bold text-kbc-dark">KBC Adapt</span>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={userKey}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-kbc-dark text-xs font-bold text-white"
            >
              {name[0]}
            </motion.span>
          </AnimatePresence>
        </div>

        <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-10">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${name}-copilot`}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="mb-4 flex items-start gap-2"
            >
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-kbc to-kbc-dark text-[13px] text-white">
                ✦
              </span>
              <div className="min-w-0 flex-1 rounded-2xl rounded-tl-md bg-kbc-dark px-4 py-3 text-[14px] leading-snug text-white shadow-sm">
                <p className="mb-0.5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-sky-300">
                  Copilot
                  {voiceStatus !== "idle" && (
                    <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] font-semibold normal-case tracking-normal text-sky-100">
                      {voiceStatus === "connecting"
                        ? "verbindt…"
                        : voiceStatus === "speaking"
                          ? "spreekt"
                          : voiceStatus === "listening"
                            ? "luistert"
                            : "fout"}
                    </span>
                  )}
                </p>
                {userHeard && <p className="mb-2 text-[11px] text-sky-200/80">Jij: {userHeard}</p>}
                {agentMessage}
              </div>
            </motion.div>
          </AnimatePresence>

          {pendingCard && (
            <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-amber-200">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-700">Bevestigen?</p>
              <p className="mt-1 text-sm font-semibold text-kbc-dark">{pendingCard.title}</p>
              {pendingCard.lines.map((line) => (
                <p key={line} className="text-xs text-slate-500">
                  {line}
                </p>
              ))}
              <p className="mt-2 text-[11px] text-slate-400">Fictief. Zeg ja, of tik bevestigen.</p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={onConfirmPending}
                  className="flex-1 rounded-xl bg-kbc px-3 py-2 text-xs font-semibold text-white"
                >
                  Bevestigen
                </button>
                <button
                  type="button"
                  onClick={onCancelPending}
                  className="flex-1 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600"
                >
                  Annuleren
                </button>
              </div>
            </div>
          )}

          <Renderer key={userKey} layout={dashboard.layout} tone={dashboard.tone} />
        </div>

        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-x-0 top-24 z-10 flex justify-center"
            >
              <span className="flex items-center gap-2 rounded-full bg-kbc-dark px-4 py-2 text-xs font-semibold text-white shadow-lg">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                  className="inline-block"
                >
                  ✦
                </motion.span>
                Je app wordt aangepast…
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <span className="pointer-events-none absolute bottom-2 left-1/2 h-1.5 w-32 -translate-x-1/2 rounded-full bg-slate-900/80" />
      </div>
    </div>
  );
}
