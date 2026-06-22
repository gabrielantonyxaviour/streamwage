// StreamWageVault — payroll streaming in Mento cUSD on Celo Sepolia.
// Addresses are env-driven (VITE_*) with deployed fallbacks so the app renders
// even before a fresh .env is supplied. The deploy lane fills these in.

const env = import.meta.env;

export const STREAMWAGE_VAULT_ADDRESS = (env.VITE_VAULT_ADDRESS ??
  "0x5eAfDC8D612c8c2860cE8002516737e413B07c67") as `0x${string}`;

// The cUSD used by the deployed vault. A mintable test cUSD backs the live
// testnet end-to-end flow (the deployer holds 0 canonical USDm and there is no
// faucet); the canonical Mento token below is the production/mainnet candidate.
export const CUSD_ADDRESS = (env.VITE_CUSD_ADDRESS ??
  "0x5127B7B034Cf9798c58948B64359a2Bf6285518d") as `0x${string}`;

// Canonical Mento "Mento Dollar" (USDm) on Celo Sepolia — used at mainnet.
export const MENTO_CUSD_MAINNET_CANDIDATE =
  "0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b" as const;

// Self Protocol: a worker address attested as identity-verified. Pre-fills the
// verification panel; the on-chain gate is isVerifiedWorker(worker).
export const SELF_VERIFIED_ADDRESS = (env.VITE_SELF_VERIFIED_ADDRESS ??
  "0xd5E79f200cbe03141F81566dc213a46135f83062") as `0x${string}`;

export const SELF_SCOPE = "streamwage";

export const CONTRACTS_CONFIGURED =
  STREAMWAGE_VAULT_ADDRESS !== "0x0000000000000000000000000000000000000000" &&
  CUSD_ADDRESS !== "0x0000000000000000000000000000000000000000";

export const STREAMWAGE_ABI = [
  {
    type: "constructor",
    stateMutability: "nonpayable",
    inputs: [
      { name: "cUSD_", type: "address" },
      { name: "initialOwner", type: "address" },
    ],
  },
  {
    type: "function",
    name: "cUSD",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },
  {
    type: "function",
    name: "owner",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },
  {
    type: "function",
    name: "nextStreamId",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "payrollReserve",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "totalFunded",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "totalStreamRate",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "isVerifiedWorker",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "streams",
    stateMutability: "view",
    inputs: [{ name: "", type: "uint256" }],
    outputs: [
      { name: "payee", type: "address" },
      { name: "ratePerSecond", type: "uint256" },
      { name: "accrued", type: "uint256" },
      { name: "lastUpdated", type: "uint256" },
      { name: "paused", type: "bool" },
      { name: "exists", type: "bool" },
    ],
  },
  {
    type: "function",
    name: "pending",
    stateMutability: "view",
    inputs: [{ name: "streamId", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
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
      { name: "payee", type: "address" },
      { name: "ratePerSecond", type: "uint256" },
    ],
    outputs: [{ name: "streamId", type: "uint256" }],
  },
  {
    type: "function",
    name: "pauseStream",
    stateMutability: "nonpayable",
    inputs: [{ name: "streamId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "resumeStream",
    stateMutability: "nonpayable",
    inputs: [{ name: "streamId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "withdrawAccrued",
    stateMutability: "nonpayable",
    inputs: [{ name: "streamId", type: "uint256" }],
    outputs: [{ name: "amount", type: "uint256" }],
  },
  {
    type: "event",
    name: "PayrollFunded",
    inputs: [
      { name: "amount", type: "uint256", indexed: false },
      { name: "reserve", type: "uint256", indexed: false },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "WorkerVerificationSet",
    inputs: [
      { name: "worker", type: "address", indexed: true },
      { name: "verified", type: "bool", indexed: false },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "StreamCreated",
    inputs: [
      { name: "streamId", type: "uint256", indexed: true },
      { name: "worker", type: "address", indexed: true },
      { name: "ratePerSecond", type: "uint256", indexed: false },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "StreamPaused",
    inputs: [{ name: "streamId", type: "uint256", indexed: true }],
    anonymous: false,
  },
  {
    type: "event",
    name: "StreamResumed",
    inputs: [{ name: "streamId", type: "uint256", indexed: true }],
    anonymous: false,
  },
  {
    type: "event",
    name: "Claimed",
    inputs: [
      { name: "streamId", type: "uint256", indexed: true },
      { name: "worker", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
    anonymous: false,
  },
] as const;

export const ERC20_ABI = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "allowance",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
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
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
  {
    type: "function",
    name: "symbol",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
] as const;
