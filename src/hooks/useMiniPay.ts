import { useEffect, useMemo } from "react";
import { useConnect } from "wagmi";

export function useMiniPay() {
  const { connect, connectors } = useConnect();

  const isMiniPay = useMemo(() => {
    if (typeof window === "undefined") return false;
    const ethereum = window.ethereum as { isMiniPay?: boolean } | undefined;
    return Boolean(ethereum?.isMiniPay);
  }, []);

  useEffect(() => {
    if (!isMiniPay) return;
    const injected = connectors.find((connector) => connector.id === "injected");
    if (injected) connect({ connector: injected });
  }, [connect, connectors, isMiniPay]);

  return { isMiniPay };
}
