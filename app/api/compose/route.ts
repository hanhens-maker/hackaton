import { ComposeRequestSchema, applyCrisisRules, type ComposeResponse } from "@/lib/schema";
import { DEFAULT_SEED_USER_ID, getSeedUser, seedUsers } from "@/data/seed-users";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = ComposeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
  const { userId, message } = parsed.data;

  // TODO: call Gemini (JSON mode, schema = ComposeResponseSchema), validate with
  // ComposeResponseSchema.safeParse, and only fall back on error/timeout/invalid output.
  const result: ComposeResponse = closestSeedUser(message, userId).compose;

  // Crisis rule is enforced here regardless of what the model returned.
  return Response.json(applyCrisisRules(result));
}

/** Fallback: keyword match on message, else requested userId, else default persona. */
function closestSeedUser(message: string, userId?: string) {
  const text = message.toLowerCase();
  let best = { user: undefined as (typeof seedUsers)[number] | undefined, hits: 0 };
  for (const user of seedUsers) {
    const hits = user.keywords.filter((k) => text.includes(k)).length;
    if (hits > best.hits) best = { user, hits };
  }
  return best.user ?? getSeedUser(userId) ?? getSeedUser(DEFAULT_SEED_USER_ID)!;
}
