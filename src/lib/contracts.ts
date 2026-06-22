export const CELO_SEPOLIA_CHAIN_ID = 11142220;
export const CELO_SEPOLIA_EXPLORER = "https://celo-sepolia.blockscout.com";
export const CUSD_ADDRESS = "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b" as const;
export const STREAMWAGE_VAULT_ADDRESS = (import.meta.env.VITE_STREAMWAGE_VAULT_ADDRESS ??
  "0x0000000000000000000000000000000000000000") as `0x${string}`;
export const SELF_VERIFIED_ADDRESS = import.meta.env.VITE_SELF_VERIFIED_ADDRESS ?? "";

export const erc20Abi = [
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

export const streamWageAbi = [
  {
    type: "function",
    name: "fundPayroll",
    stateMutability: "nonpayable",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "setWorkerVerification",
    stateMutability: "nonpayable",
    inputs: [
      { name: "worker", type: "address" },
      { name: "verified", type: "bool" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "createStream",
    stateMutability: "nonpayable",
    inputs: [
      { name: "worker", type: "address" },
      { name: "ratePerSecond", type: "uint256" },
    ],
    outputs: [{ name: "streamId", type: "uint256" }],
  },
  {
    type: "function",
    name: "withdrawAccrued",
    stateMutability: "nonpayable",
    inputs: [{ name: "streamId", type: "uint256" }],
    outputs: [{ name: "amount", type: "uint256" }],
  },
  {
    type: "function",
    name: "pending",
    stateMutability: "view",
    inputs: [{ name: "streamId", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;
