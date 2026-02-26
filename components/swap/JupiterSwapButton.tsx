"use client";

import { useEffect, useState, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

const BACKLOT_MINT = "DSL6XbjPfhXjD9YYhzxo5Dv2VRt7VSeXRkTefEu5pump";
const SOL_MINT = "So11111111111111111111111111111111111111112";

export default function JupiterSwapButton({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const [loaded, setLoaded] = useState(false);
  const wallet = useWallet();

  useEffect(() => {
    if (document.getElementById("jupiter-terminal-script")) {
      setLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "jupiter-terminal-script";
    script.src = "https://terminal.jup.ag/main-v3.js";
    script.async = true;
    script.onload = () => setLoaded(true);
    document.head.appendChild(script);
  }, []);

  const openSwap = useCallback(() => {
    if (!window.Jupiter || !loaded) return;
    window.Jupiter.init({
      displayMode: "modal",
      endpoint: `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.backlotsocial.xyz"}/api/rpc`,
      formProps: {
        initialInputMint: SOL_MINT,
        initialOutputMint: BACKLOT_MINT,
        fixedOutputMint: true,
      },
      enableWalletPassthrough: true,
      passthroughWalletContextState: wallet,
    });
  }, [loaded, wallet]);

  return (
    <button onClick={openSwap} className={className} disabled={!loaded}>
      {children}
    </button>
  );
}
