"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import CRTIntro from "./CRTIntro";
import CRTOverlay from "./CRTOverlay";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [introComplete, setIntroComplete] = useState(false);

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true);
  }, []);

  return (
    <>
      {!introComplete && <CRTIntro onComplete={handleIntroComplete} />}
      <CRTOverlay />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: introComplete ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.div>
    </>
  );
}
