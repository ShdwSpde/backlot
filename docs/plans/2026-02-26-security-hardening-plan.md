# Security Hardening Plan

Date: 2026-02-26
Status: Planned
Priority: Critical — must complete before public launch

## Phase 1: Supabase RLS (blocks C3, H1, H2, H3)

The single highest-impact fix. With RLS enabled, the anon key can no longer insert/update/delete freely.

### SQL Migration

```sql
-- Enable RLS on all tables
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vote_receipts ENABLE ROW LEVEL SECURITY;

-- Polls: public read, no public write
CREATE POLICY "polls_select" ON polls FOR SELECT USING (true);

-- Poll options: public read, no public write (server-side only via service role)
CREATE POLICY "poll_options_select" ON poll_options FOR SELECT USING (true);

-- Votes: public read, no public insert/update/delete
CREATE POLICY "votes_select" ON votes FOR SELECT USING (true);

-- Vote receipts: public read only
CREATE POLICY "vote_receipts_select" ON vote_receipts FOR SELECT USING (true);
```

Service role key bypasses RLS, so all server-side API routes continue to work. Client-side becomes read-only.

### Files to modify
- None — this is a Supabase migration only

---

## Phase 2: Server-Side Vote API (blocks C2, C3, H2, H3)

Move all vote recording behind a server-side API route that verifies the on-chain TX before recording.

### New file: `app/api/vote/route.ts`

```
POST /api/vote
Body: { pollId, optionId, txSignature }
```

Flow:
1. Parse and validate `pollId`, `optionId`, `txSignature`
2. Fetch TX from chain via `connection.getParsedTransaction(txSignature)`
3. Verify TX contains a `createTransferInstruction` sending exactly 10 * 10^6 raw tokens of $BACKLOT mint to treasury ATA
4. Verify the signer matches the wallet claiming the vote
5. Fetch on-chain balance for tier/weight (server-side, not client-provided)
6. Insert vote via `supabaseAdmin`
7. Increment vote count via `supabaseAdmin.rpc("increment_vote_count")`
8. Insert vote receipt
9. Trigger cNFT mint

### Files to modify
- **Create** `app/api/vote/route.ts` — new server-side vote handler
- **Modify** `components/vote/PollCard.tsx` — after TX confirmation, POST to `/api/vote` instead of direct Supabase insert
- **Modify** `app/api/actions/vote/route.ts` — remove pre-confirmation vote insert; add webhook or use same `/api/vote` endpoint after TX lands

### PollCard changes
```typescript
// After TX confirmed:
const res = await fetch("/api/vote", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ pollId: poll.id, optionId, txSignature: signature }),
});
```

### Blinks route changes
Remove the vote insert from POST handler. Two options:
- **Option A**: Return TX only, rely on client-side confirmation + `/api/vote` call (simpler)
- **Option B**: Add a webhook/cron that scans for confirmed TXs with the Backlot vote memo and records them (more robust, no client trust)

Recommend Option A for now, Option B as a future enhancement.

---

## Phase 3: RPC Proxy (blocks C1)

Stop exposing the Helius API key in the client bundle.

### New file: `app/api/rpc/route.ts`

```typescript
export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetch(process.env.SOLANA_RPC_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return NextResponse.json(await res.json());
}
```

### Files to modify
- **Create** `app/api/rpc/route.ts`
- **Modify** `components/providers/WalletProvider.tsx` — change endpoint to `/api/rpc`
- **Modify** `.env.local` — change `NEXT_PUBLIC_SOLANA_RPC_URL` to `/api/rpc` or remove it
- **Vercel** — remove `NEXT_PUBLIC_SOLANA_RPC_URL` env var

Trade-off: Adds latency (extra hop through Vercel) and Vercel function invocations. Could rate-limit this endpoint to prevent abuse.

Alternative: Create a dedicated Helius key with lower rate limits for client use and accept the exposure. Helius keys are free to rotate.

---

## Phase 4: Smaller Fixes

### Poll expiry check (M4)
- Add `is_active`, `starts_at`, `ends_at` checks in both `PollCard.tsx` (client guard) and `app/api/vote/route.ts` (server enforcement)

### Mint endpoint auth (H4)
- Add a shared secret header between the vote handler and mint endpoint
- Or move minting inline into the vote API route

### Supabase admin fallback (L2)
- Throw at startup if `SUPABASE_SERVICE_ROLE_KEY` is missing in production
- `if (!process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NODE_ENV === 'production') throw new Error(...)`

### Upstash Redis (M3)
- Configure `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` on Vercel
- The middleware already supports it, just needs the env vars

---

## Implementation Order

| Priority | Phase | Effort | Blocks |
|----------|-------|--------|--------|
| 1 | Phase 1: RLS | 10 min (SQL only) | C3, H1, H2, H3 |
| 2 | Phase 2: Server-side vote | 1-2 hours | C2, C3, H2, H3 |
| 3 | Phase 4: Poll expiry + mint auth | 30 min | M4, H4 |
| 4 | Phase 3: RPC proxy | 30 min | C1 |
| 5 | Phase 4: Upstash + admin fallback | 15 min | M3, L2 |

Phase 1 (RLS) is the single biggest security win and can be done immediately as a SQL migration with zero code changes.
