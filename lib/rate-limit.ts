// In-memory fixed window per IP. Per serverless instance on Vercel, which is enough for a demo.
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;

const hits = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || entry.resetAt < now) {
    if (hits.size > 5000) hits.clear(); // cheap bound on memory
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  entry.count += 1;
  return entry.count <= MAX_REQUESTS;
}

export function clientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0].trim() || request.headers.get("x-real-ip") || "local";
}
