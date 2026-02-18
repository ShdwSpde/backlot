interface JupiterTerminal {
  init: (config: {
    displayMode?: "integrated" | "modal" | "widget";
    integratedTargetId?: string;
    endpoint?: string;
    formProps?: {
      initialInputMint?: string;
      initialOutputMint?: string;
      fixedOutputMint?: boolean;
    };
    enableWalletPassthrough?: boolean;
    passthroughWalletContextState?: unknown;
    onSuccess?: (data: { txid: string }) => void;
    onSwapError?: (error: unknown) => void;
  }) => void;
  close: () => void;
  resume: () => void;
}

interface Window {
  Jupiter?: JupiterTerminal;
}
