import { NextRequest, NextResponse } from "next/server";
import { createServerUmi } from "@/lib/umi";
import { mintV1 } from "@metaplex-foundation/mpl-bubblegum";
import {
  createSignerFromKeypair,
  publicKey,
} from "@metaplex-foundation/umi";
import { supabaseAdmin } from "@/lib/supabase-admin";

const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET || "";

export async function POST(req: NextRequest) {
  try {
    // Only allow calls from our own server (vote handler)
    if (INTERNAL_SECRET && req.headers.get("x-internal-secret") !== INTERNAL_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { voteId, walletAddress, pollTitle } = await req.json();

    if (!voteId || !walletAddress || !pollTitle) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const treeAddress = process.env.BUBBLEGUM_TREE_ADDRESS;
    const treeAuthorityKey = process.env.BUBBLEGUM_TREE_AUTHORITY_SECRET;

    // If no tree is configured, record as pending and return
    if (!treeAddress || !treeAuthorityKey) {
      await supabaseAdmin
        .from("vote_receipts")
        .update({ mint_address: "pending_tree_setup" })
        .eq("vote_id", voteId);

      return NextResponse.json({
        success: true,
        status: "pending",
        message: "cNFT minting pending — Merkle tree not configured yet",
      });
    }

    const umi = createServerUmi();

    // Import tree authority keypair
    const secretKey = Uint8Array.from(JSON.parse(treeAuthorityKey));
    const treeAuthorityKeypair = umi.eddsa.createKeypairFromSecretKey(secretKey);
    const treeAuthority = createSignerFromKeypair(umi, treeAuthorityKeypair);
    umi.use({ install(umi) { umi.identity = treeAuthority; umi.payer = treeAuthority; } });

    const metadata = {
      name: `BACKLOT Vote: ${pollTitle.slice(0, 20)}`,
      symbol: "BVOTE",
      uri: "",
      sellerFeeBasisPoints: 0,
      collection: null,
      creators: [
        {
          address: treeAuthority.publicKey,
          verified: true,
          share: 100,
        },
      ],
    };

    const { signature } = await mintV1(umi, {
      leafOwner: publicKey(walletAddress),
      merkleTree: publicKey(treeAddress),
      metadata,
    }).sendAndConfirm(umi);

    const mintSig = Buffer.from(signature).toString("base64");

    // Update the vote receipt with mint info
    await supabaseAdmin
      .from("vote_receipts")
      .update({ mint_address: mintSig })
      .eq("vote_id", voteId);

    return NextResponse.json({
      success: true,
      status: "minted",
      signature: mintSig,
    });
  } catch (error) {
    console.error("cNFT mint error:", error);
    return NextResponse.json(
      { error: "Minting failed" },
      { status: 500 }
    );
  }
}
