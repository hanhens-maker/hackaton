"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MAX_MESSAGE_LENGTH } from "@/lib/schema";

type Props = {
  reply: string;
  lastUserMessage?: string;
  chips: string[];
  pending: boolean;
  onSend: (message: string) => void;
};

export default function Copilot({ reply, lastUserMessage, chips, pending, onSend }: Props) {
  const [draft, setDraft] = useState("");

  function send(text: string) {
    const message = text.trim();
    if (!message || pending) return;
    onSend(message);
    setDraft("");
  }

  return (
    <div className="mb-4">
      {/* Latest user message, small, so the reply has context */}
      <AnimatePresence initial={false}>
        {lastUserMessage && (
          <motion.p
            key={lastUserMessage}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-2 ml-auto w-fit max-w-[80%] rounded-2xl rounded-br-md bg-white px-3 py-2 text-[13px] leading-snug text-slate-700 shadow-sm ring-1 ring-slate-200/70"
          >
            {lastUserMessage}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="flex items-start gap-2">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-kbc to-kbc-dark text-[13px] text-white">
          ✦
        </span>
        <motion.div layout className="min-h-[52px] flex-1 rounded-2xl rounded-tl-md bg-kbc-dark px-4 py-3 text-[14px] leading-snug text-white shadow-sm">
          <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-sky-300">Copilot</p>
          <AnimatePresence mode="wait" initial={false}>
            {pending ? (
              <motion.span key="dots" className="flex h-5 items-center gap-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-sky-200"
                    animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </motion.span>
            ) : (
              <motion.p key={reply} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }}>
                {reply}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <form
        className="mt-3 flex items-center gap-2 rounded-full bg-white p-1 pl-4 shadow-sm ring-1 ring-slate-200"
        onSubmit={(e) => {
          e.preventDefault();
          send(draft);
        }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={MAX_MESSAGE_LENGTH}
          disabled={pending}
          placeholder="Vertel de copilot wat er speelt..."
          className="min-w-0 flex-1 bg-transparent text-[14px] text-slate-800 placeholder:text-slate-400 focus:outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={pending || !draft.trim()}
          aria-label="Verstuur"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-kbc text-white transition-opacity disabled:opacity-40"
        >
          ↑
        </button>
      </form>

      <div className="no-scrollbar mt-2 flex gap-1.5 overflow-x-auto">
        {chips.map((chip) => (
          <button
            key={chip}
            type="button"
            disabled={pending}
            onClick={() => send(chip)}
            className="shrink-0 rounded-full bg-sky-50 px-3 py-1.5 text-[12px] font-medium text-kbc-dark ring-1 ring-sky-100 transition-colors hover:bg-sky-100 disabled:opacity-50"
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  );
}
