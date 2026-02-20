import { Connection, PublicKey } from "@solana/web3.js";

const BACKLOT_MINT_ADDRESS =
  process.env.NEXT_PUBLIC_BACKLOT_TOKEN_MINT || "DSL6XbjPfhXjD9YYhzxo5Dv2VRt7VSeXRkTefEu5pump";

const TOKEN_PROGRAM_ADDRESS = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";

export async function getBacklotBalance(
  connection: Connection,
  walletAddress: PublicKey
): Promise<number> {
  try {
    const mint = new PublicKey(BACKLOT_MINT_ADDRESS);
    const programId = new PublicKey(TOKEN_PROGRAM_ADDRESS);

    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      walletAddress,
      { mint, programId }
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
