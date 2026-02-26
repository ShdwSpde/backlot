import { NextRequest, NextResponse } from "next/server";

// Per-route rate limit configs
const RATE_LIMITS: Record<string, { max: number; windowMs: number }> = {
  "/api/actions/vote": { max: 10, windowMs: 60_000 },
  "/api/mint-vote-receipt": { max: 5, windowMs: 60_000 },
  "/api/vote": { max: 5, windowMs: 60_000 },
  "/api/rpc": { max: 60, windowMs: 60_000 },
  "/api/fund-milestone": { max: 10, windowMs: 60_000 },
  "/api/leaderboard": { max: 20, windowMs: 60_000 },
  "/api/token-stats": { max: 30, windowMs: 60_000 },
  "/api/treasury": { max: 20, windowMs: 60_000 },
  "/api/shiplog": { max: 20, windowMs: 60_000 },
  "/api/card": { max: 15, windowMs: 60_000 },
};

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

// Upstash Redis rate limiting (survives deploys)
let upstashLimiter: {
  limit: (id: string, opts?: { rate: number; window: string }) => Promise<{ success: boolean; limit: number; remaining: number; reset: number }>;
} | null = null;

async function getUpstashLimiter() {
  if (upstashLimiter !== undefined && upstashLimiter !== null) return upstashLimiter;
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    upstashLimiter = null;
    return null;
  }
  try {
    const { Ratelimit } = await import("@upstash/ratelimit");
    const { Redis } = await import("@upstash/redis");
    const redis = Redis.fromEnv();
    const rl = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "60 s"),
      prefix: "@backlot/ratelimit",
      ephemeralCache: new Map(),
    });
    upstashLimiter = rl;
    return rl;
  } catch {
    upstashLimiter = null;
    return null;
  }
}

// Fallback: in-memory rate limiter
const memoryMap = new Map<string, { count: number; resetAt: number }>();

function memoryLimit(key: string, max: number, windowMs: number): { success: boolean; limit: number; remaining: number; reset: number } {
  const now = Date.now();
  const entry = memoryMap.get(key);

  if (!entry || now > entry.resetAt) {
    memoryMap.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, limit: max, remaining: max - 1, reset: now + windowMs };
  }

  entry.count++;
  const remaining = Math.max(0, max - entry.count);
  return { success: entry.count <= max, limit: max, remaining, reset: entry.resetAt };
}

// Clean stale in-memory entries
if (typeof globalThis !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    Array.from(memoryMap.entries()).forEach(([key, entry]) => {
      if (now > entry.resetAt) memoryMap.delete(key);
    });
  }, 60_000);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const cfg = RATE_LIMITS[pathname];
  if (!cfg) return NextResponse.next();

  const ip = getClientIp(req);
  const key = `${ip}:${pathname}`;

  // Try Upstash first, fall back to in-memory
  const limiter = await getUpstashLimiter();
  const result = limiter
    ? await limiter.limit(key)
    : memoryLimit(key, cfg.max, cfg.windowMs);

  if (!result.success) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(result.limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(result.reset),
          "Retry-After": String(Math.ceil((result.reset - Date.now()) / 1000)),
        },
      }
    );
  }

  const res = NextResponse.next();
  res.headers.set("X-RateLimit-Limit", String(result.limit));
  res.headers.set("X-RateLimit-Remaining", String(result.remaining));
  res.headers.set("X-RateLimit-Reset", String(result.reset));
  return res;
}

export const config = {
  matcher: "/api/:path*",
};
