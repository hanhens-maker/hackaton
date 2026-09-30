import OpenAI from "openai";
import {
  applyCrisisRules,
  ComposeRequestSchema,
  LlmResponseSchema,
  type ComposeRequest,
  type ComposeResponse,
  type Layout,
} from "@/lib/schema";
import { clipToSchema, openAiResponseSchema, stripNulls } from "@/lib/llm-schema";
import { buildMessages } from "@/lib/prompt";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { getSeedUser, type SeedUser } from "@/data/seed-users";

export const runtime = "nodejs";

const TIMEOUT_MS = 8000;
const FALLBACK_REPLY = "Sorry, dat lukte even niet. Kan je het nog eens proberen?";

export async function POST(request: Request) {
  if (!rateLimit(clientIp(request))) {
    return Response.json({ error: "Te veel berichten. Wacht even en probeer opnieuw." }, { status: 429 });
  }

  const parsed = ComposeRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
  const req = parsed.data;
  const user = getSeedUser(req.userId);
  if (!user) {
    return Response.json({ error: "Unknown user" }, { status: 400 });
  }

  try {
    const result = await compose(req, user);
    return Response.json(result);
  } catch (err) {
    console.error("[compose] fallback:", err instanceof Error ? err.message : err);
    const fallback: ComposeResponse = { lifeMoment: req.lifeMoment, tone: req.tone, layout: req.layout, reply: FALLBACK_REPLY };
    return Response.json(applyCrisisRules(fallback), { headers: { "x-compose-fallback": "1" } });
  }
}

async function compose(req: ComposeRequest, user: SeedUser): Promise<ComposeResponse> {
  const model = process.env.OPENAI_MODEL;
  if (!process.env.OPENAI_API_KEY || !model) throw new Error("OPENAI_API_KEY / OPENAI_MODEL not set");

  const client = new OpenAI({ timeout: TIMEOUT_MS, maxRetries: 0 });
  const completion = await client.chat.completions.create({
    model,
    messages: buildMessages(req, user),
    temperature: 0.4,
    response_format: {
      type: "json_schema",
      json_schema: { name: "compose_response", strict: true, schema: openAiResponseSchema },
    },
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("empty completion");

  const validated = LlmResponseSchema.safeParse(clipToSchema(stripNulls(JSON.parse(raw))));
  if (!validated.success) throw new Error(`invalid output: ${validated.error.message}`);

  const { layout, signals, ...rest } = validated.data;
  const next: ComposeResponse = {
    ...rest,
    layout: withRealBalances(layout ?? req.layout, user),
    ...(signals?.length ? { signals } : {}),
  };
  return applyCrisisRules(next);
}

/** Account numbers come from our data, never from the model. */
function withRealBalances(layout: Layout, user: SeedUser): Layout {
  const accounts = user.compose.layout.flatMap((m) => (m.type === "Balance" ? m.accounts : []));
  if (accounts.length === 0) return layout;
  return layout.map((m) => (m.type === "Balance" ? { ...m, accounts: accounts.slice(0, 4) } : m));
}
