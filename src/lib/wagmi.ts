import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { defineChain, http } from "viem";

// Celo Sepolia testnet — the StreamWage deployment target.
export const celoSepolia = defineChain({
  id: 11142220,
  name: "Celo Sepolia",
  nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://forno.celo-sepolia.celo-testnet.org"] },
  },
  blockExplorers: {
    default: {
      name: "Celo Sepolia Blockscout",
      url: "https://celo-sepolia.blockscout.com",
    },
  },
  testnet: true,
});

const projectId =
  import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ??
  "07386577a7711651c83f5ef08c19e7e8";

// getDefaultConfig wires RainbowKit's default wallet list, which includes an
// injected connector (id "injected"). MiniPay injects window.ethereum, so the
// useMiniPay hook auto-connects through that injected connector.
export const wagmiConfig = getDefaultConfig({
  appName: "StreamWage",
  appDescription: "Real-time cUSD payroll streams on Celo, claimable in MiniPay",
  projectId,
  chains: [celoSepolia],
  transports: {
    [celoSepolia.id]: http("https://forno.celo-sepolia.celo-testnet.org"),
  },
  ssr: false,
});

export const CELO_EXPLORER = celoSepolia.blockExplorers.default.url;
