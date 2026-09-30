"use client";

import { useState } from "react";
import Renderer from "@/components/Renderer";
import { seedUsers } from "@/data/seed-users";
import type { ComposeResponse, Tone } from "@/lib/schema";

const TONE_BG: Record<Tone, string> = {
  speels: "bg-amber-50",
  neutraal: "bg-slate-50",
  rustig: "bg-sky-50",
};

export default function Home() {
  const [userId, setUserId] = useState<string>("starter");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<ComposeResponse | null>(null);
  const [sent, setSent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setLoading(true);
    setError(null);
    setSent(trimmed);
    setMessage("");
    try {
      const res = await fetch("/api/compose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, message: trimmed }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setResult((await res.json()) as ComposeResponse);
    } catch {
      setError("Er ging iets mis. Probeer het zo nog eens.");
    } finally {
      setLoading(false);
    }
  }

  const bg = result ? TONE_BG[result.tone] : "bg-slate-50";

  return (
    <div className={`min-h-screen transition-colors duration-500 ${bg}`}>
      <main className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-8">
        <header>
          <h1 className="text-2xl font-semibold text-slate-900">KBC Adapt</h1>
          <p className="text-sm text-slate-500">Vertel wat er in je leven gebeurt, en je app past zich aan.</p>
        </header>

        <div className="flex flex-wrap gap-2">
          {seedUsers.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => setUserId(u.id)}
              className={`rounded-full border px-3 py-1 text-sm ${
                userId === u.id
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-300 bg-white text-slate-700"
              }`}
            >
              {u.name}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send(message);
          }}
          className="flex gap-2"
        >
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={1000}
            placeholder="Bv. “Ik ben net ontslagen” of “We verwachten een baby”"
            className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-slate-900"
          />
          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="rounded-xl bg-slate-900 px-5 py-3 text-white disabled:opacity-40"
          >
            {loading ? "…" : "Stuur"}
          </button>
        </form>

        {sent && (
          <div className="self-end rounded-2xl rounded-br-sm bg-slate-900 px-4 py-2 text-sm text-white">{sent}</div>
        )}
        {loading && <p className="text-sm text-slate-500">Je app wordt aangepast…</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {result && !loading && (
          <div className="self-start rounded-2xl rounded-bl-sm bg-white px-4 py-2 text-sm text-slate-800 shadow-sm">
            {result.reply}
          </div>
        )}

        {result && <Renderer layout={result.layout} />}
      </main>
    </div>
  );
}
