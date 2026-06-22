import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { LandingPage } from "./pages/LandingPage";
import { AppShell } from "./pages/AppShell";
import { useMiniPay } from "./hooks/useMiniPay";

export default function App() {
  const { address, isConnected, isConnecting, isReconnecting } = useAccount();
  const { openConnectModal } = useConnectModal();
  // Detect MiniPay and auto-connect its injected provider.
  useMiniPay();

  const [connectTimeout, setConnectTimeout] = useState(false);

  useEffect(() => {
    if (!isConnecting && !isReconnecting) {
      setConnectTimeout(false);
      return;
    }
    const timer = setTimeout(() => setConnectTimeout(true), 4000);
    return () => clearTimeout(timer);
  }, [isConnecting, isReconnecting]);

  const showConnecting = (isConnecting || isReconnecting) && !connectTimeout;

  function handleConnect() {
    setConnectTimeout(false);
    openConnectModal?.();
  }

  return (
    <AnimatePresence mode="wait">
      {isConnected && address ? (
        <motion.div
          key="app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <AppShell />
        </motion.div>
      ) : (
        <motion.div
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <LandingPage onConnect={handleConnect} connecting={showConnecting} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
