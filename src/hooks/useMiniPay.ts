import { useEffect, useMemo } from "react";
import { useAccount, useConnect } from "wagmi";

// Detects MiniPay's in-app browser and auto-connects its injected provider, so
// workers can claim wages without seeing a wallet-connect UI inside MiniPay.
export function useMiniPay() {
  const { connect, connectors } = useConnect();
  const { isConnected } = useAccount();

  const isMiniPay = useMemo(() => {
    if (typeof window === "undefined") return false;
    const ethereum = window.ethereum as { isMiniPay?: boolean } | undefined;
    return Boolean(ethereum?.isMiniPay);
  }, []);

  useEffect(() => {
    if (!isMiniPay || isConnected) return;
    const injected = connectors.find(
      (c) => c.id === "injected" || c.type === "injected",
    );
    if (injected) connect({ connector: injected });
  }, [connect, connectors, isMiniPay, isConnected]);

  return { isMiniPay };
}
