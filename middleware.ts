import { NextRequest, NextResponse } from "next/server";

// Simple in-memory rate limiter — resets on deploy/restart
// For production, replace with Redis-backed solution (e.g., @upstash/ratelimit)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMITS: Record<string, { max: number; windowMs: number }> = {
  "/api/actions/vote": { max: 10, windowMs: 60_000 },
  "/api/mint-vote-receipt": { max: 5, windowMs: 60_000 },
  "/api/fund-milestone": { max: 10, windowMs: 60_000 },
  "/api/leaderboard": { max: 20, windowMs: 60_000 },
  "/api/token-stats": { max: 30, windowMs: 60_000 },
};

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function isRateLimited(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  entry.count++;
  return entry.count > max;
}

// Clean up stale entries periodically (prevent memory leak)
setInterval(() => {
  const now = Date.now();
  Array.from(rateLimitMap.entries()).forEach(([key, entry]) => {
    if (now > entry.resetAt) {
      rateLimitMap.delete(key);
    }
  });
}, 60_000);

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only rate-limit API routes
  const limit = RATE_LIMITS[pathname];
  if (!limit) return NextResponse.next();

  const ip = getClientIp(req);
  const key = `${ip}:${pathname}`;

  if (isRateLimited(key, limit.max, limit.windowMs)) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
