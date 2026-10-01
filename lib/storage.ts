import { useSyncExternalStore } from "react";
import { z } from "zod";
import { DashboardSchema, DemoActionSchema, MAX_DEMO_ACTIONS } from "@/lib/schema";

/** Simulated demo state per customer. Only the adapted dashboard and fictional demo actions, never keys. */
const SavedSchema = z.object({
  dashboard: DashboardSchema,
  actions: z.array(DemoActionSchema).max(MAX_DEMO_ACTIONS),
});

export type Saved = z.infer<typeof SavedSchema>;

const PREFIX = "kbc-adapt-demo:v1:";
const INTRO_KEY = `${PREFIX}voice-intro`;
const listeners = new Set<() => void>();
const cache = new Map<string, { raw: string | null; value: Saved | null }>();

export function readVoiceIntroAccepted(): boolean {
  try {
    return window.localStorage.getItem(INTRO_KEY) === "1";
  } catch {
    return false;
  }
}

export function writeVoiceIntroAccepted() {
  try {
    window.localStorage.setItem(INTRO_KEY, "1");
  } catch {
    // Blocked storage: the intro can show again next time.
  }
}

export function readSaved(customerId: string): Saved | null {
  const key = PREFIX + customerId;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(key);
  } catch {
    return null;
  }
  const hit = cache.get(key);
  if (hit && hit.raw === raw) return hit.value;
  let value: Saved | null = null;
  if (raw) {
    try {
      const parsed = SavedSchema.safeParse(JSON.parse(raw));
      value = parsed.success ? parsed.data : null;
    } catch {
      value = null;
    }
  }
  cache.set(key, { raw, value });
  return value;
}

export function writeSaved(customerId: string, saved: Saved) {
  try {
    window.localStorage.setItem(PREFIX + customerId, JSON.stringify(SavedSchema.parse(saved)));
  } catch {
    // Storage full or blocked: the demo keeps working without persistence.
  }
  listeners.forEach((l) => l());
}

export function clearSaved(customerId: string) {
  try {
    window.localStorage.removeItem(PREFIX + customerId);
  } catch {}
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

/** `null` on the server and during hydration, so the first client render matches the seed markup. */
export function useSaved(customerId: string): Saved | null {
  return useSyncExternalStore(
    subscribe,
    () => readSaved(customerId),
    () => null,
  );
}
