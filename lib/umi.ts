import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplBubblegum } from "@metaplex-foundation/mpl-bubblegum";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";

export function createServerUmi() {
  const endpoint =
    process.env.SOLANA_RPC_URL ||
    "https://api.mainnet-beta.solana.com";

  return createUmi(endpoint)
    .use(mplBubblegum())
    .use(mplTokenMetadata());
}
