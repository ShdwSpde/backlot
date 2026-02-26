import { Connection, PublicKey } from "@solana/web3.js";
import {
  getAssociatedTokenAddressSync,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";

const BACKLOT_MINT_ADDRESS =
  process.env.NEXT_PUBLIC_BACKLOT_TOKEN_MINT || "DSL6XbjPfhXjD9YYhzxo5Dv2VRt7VSeXRkTefEu5pump";

export async function getBacklotBalance(
  connection: Connection,
  walletAddress: PublicKey
): Promise<number> {
  try {
    const mint = new PublicKey(BACKLOT_MINT_ADDRESS);

    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      walletAddress,
      { mint }
    );

    if (tokenAccounts.value.length === 0) return 0;

    const balance =
      tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
    return balance ?? 0;
  } catch (error) {
    console.error("Error fetching BACKLOT balance:", error);
    return 0;
  }
}

/**
 * Find the oldest transaction on the wallet's $BACKLOT ATA.
 * Paginates `getSignaturesForAddress` backwards to find the first-ever tx.
 */
export async function getHoldingSince(
  connection: Connection,
  walletAddress: PublicKey
): Promise<Date | null> {
  try {
    const mint = new PublicKey(BACKLOT_MINT_ADDRESS);
    const ata = getAssociatedTokenAddressSync(
      mint,
      walletAddress,
      false,
      TOKEN_2022_PROGRAM_ID
    );

    let oldestBlockTime: number | null = null;
    let before: string | undefined;

    for (;;) {
      const signatures = await connection.getSignaturesForAddress(ata, {
        before,
        limit: 1000,
      });
      if (signatures.length === 0) break;

      const last = signatures[signatures.length - 1];
      if (last.blockTime) {
        oldestBlockTime = last.blockTime;
      }
      before = last.signature;

      if (signatures.length < 1000) break;
    }

    return oldestBlockTime ? new Date(oldestBlockTime * 1000) : null;
  } catch (error) {
    console.error("Error fetching holding since:", error);
    return null;
  }
}

/**
 * Pure function: holding days → multiplier (1.0–4.0).
 * Day 0 = 1x, Day 30 = 2x, Day 60 = 3x, Day 90+ = 4x (cap).
 */
export function getHoldingMultiplier(holdingSince: Date | null): number {
  if (!holdingSince) return 1;
  const holdingDays = (Date.now() - holdingSince.getTime()) / (86400 * 1000);
  return 1 + Math.min(holdingDays / 30, 3);
}
