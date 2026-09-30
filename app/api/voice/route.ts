export const runtime = "nodejs";

const DEFAULT_AGENT_ID = "agent_5301m3svjba4ek6bkq9b9947gkv8";

/**
 * Returns how the browser should connect to the ElevenLabs voice agent.
 * With ELEVENLABS_API_KEY set (private agent) we mint a short-lived WebRTC token
 * server-side so the key never reaches the client; otherwise the public agent id.
 */
export async function GET() {
  const agentId = process.env.ELEVENLABS_AGENT_ID || DEFAULT_AGENT_ID;
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return Response.json({ agentId });

  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${encodeURIComponent(agentId)}`,
      { headers: { "xi-api-key": apiKey }, cache: "no-store" },
    );
    if (!res.ok) throw new Error(String(res.status));
    const { token } = (await res.json()) as { token?: string };
    if (!token) throw new Error("no token");
    return Response.json({ conversationToken: token });
  } catch {
    // Fall back to the public agent id so the demo keeps working.
    return Response.json({ agentId });
  }
}
