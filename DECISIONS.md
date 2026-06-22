# DECISIONS — StreamWage

- **2026-06-22:** Used Mento StableTokenUSD on Celo Sepolia as cUSD: `0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b`, verified from Mento Protocol deployment docs.
- **2026-06-22:** Implemented Self Protocol gate as owner-set on-chain attestation (`setWorkerVerification`) so the contract enforces verified-worker creation even while the Self callback service remains deploy-pending.
- **2026-06-22:** Kept `MockCUSD` only for tests and fallback demos; production deploy script defaults to canonical Celo Sepolia cUSD.
- **2026-06-22:** UI direction is Swiss operational, mobile-first claim surface, restrained Celo green accent, no stat-card hero.
- **2026-06-22:** Deployed and verified `StreamWageVault` on Celo Sepolia at `0x5eAfDC8D612c8c2860cE8002516737e413B07c67`; frontend deployed to Cloudflare Pages at `https://streamwage.pages.dev`.
- **2026-06-22:** Did not run breaking `npm audit fix --force`; it would upgrade core wallet/Self packages across breaking major versions. Remaining audit risk is recorded in `QUALITY_GATE.md`.
- **2026-06-22:** Reworked contract public surface for the frontend ABI: renamed `worker`→`payee` in `Stream`, `payrollLiquidity`→`payrollReserve`, event `WorkerPaid`→`Claimed`; added `totalFunded` (cumulative) and `totalStreamRate` (sum of active rates). 7 Foundry tests pass; `forge build`/`forge fmt` clean.
- **2026-06-22:** Re-deployed to Celo Sepolia (chainId 11142220). Final addresses — `StreamWageVault`: `0x5eAfDC8D612c8c2860cE8002516737e413B07c67`; cUSD (mintable mock): `0x5127B7B034Cf9798c58948B64359a2Bf6285518d`. Both verified on Blockscout.
- **2026-06-22:** Deployed a mintable cUSD mock (`ERC20 "Celo Dollar (Test)"`) for the testnet end-to-end flow because the deployer held 0 real Mento USDm on Celo Sepolia and there is no faucet. Real Mento USDm `0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b` is kept as the mainnet/production token (documented in the deploy script). The `realCusdMainnetCandidate` lives in `outputs/deployment.json`.
- **2026-06-22:** Ran the full on-chain flow (approve → fundPayroll 1000 cUSD → setWorkerVerification → createStream 0.1 cUSD/s → 45s accrual → withdrawAccrued) with the deployer as both employer and worker. Worker cUSD balance grew by 6.4 cUSD on the claim; reserve dropped 1000→993.6. Tx hashes recorded in `outputs/deployment.json`.
