import { Connection, PublicKey } from "@solana/web3.js";

const BACKLOT_MINT = new PublicKey(
  process.env.NEXT_PUBLIC_BACKLOT_TOKEN_MINT || "DSL6XbjPfhXjD9YYhzxo5Dv2VRt7VSeXRkTefEu5pump"
);

const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");

export async function getBacklotBalance(
  connection: Connection,
  walletAddress: PublicKey
): Promise<number> {
  try {
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      walletAddress,
      { mint: BACKLOT_MINT, programId: TOKEN_PROGRAM_ID }
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
