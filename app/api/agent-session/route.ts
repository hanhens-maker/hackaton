export const runtime = "nodejs";

/** Signed URL for a private ElevenLabs agent. The API key never leaves the server. */
export async function POST() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const agentId = process.env.ELEVENLABS_AGENT_ID;
  if (!apiKey || !agentId) {
    return Response.json({ error: "not_configured" }, { status: 503 });
  }

  const url = new URL("https://api.elevenlabs.io/v1/convai/conversation/get-signed-url");
  url.searchParams.set("agent_id", agentId);
  const branchId = process.env.ELEVENLABS_BRANCH_ID;
  if (branchId) url.searchParams.set("branch_id", branchId);

  try {
    const res = await fetch(url, {
      headers: { "xi-api-key": apiKey },
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
    const data = (await res.json().catch(() => null)) as { signed_url?: unknown } | null;
    if (!res.ok || typeof data?.signed_url !== "string") {
      console.error("ElevenLabs signed URL failed:", res.status);
      return Response.json({ error: "upstream_failed" }, { status: 502 });
    }
    return Response.json({ signedUrl: data.signed_url }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("ElevenLabs signed URL failed:", err instanceof Error ? err.message : err);
    return Response.json({ error: "upstream_failed" }, { status: 502 });
  }
}
