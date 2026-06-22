# DECISIONS — StreamWage

- **2026-06-22:** Used Mento StableTokenUSD on Celo Sepolia as cUSD: `0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b`, verified from Mento Protocol deployment docs.
- **2026-06-22:** Implemented Self Protocol gate as owner-set on-chain attestation (`setWorkerVerification`) so the contract enforces verified-worker creation even while the Self callback service remains deploy-pending.
- **2026-06-22:** Kept `MockCUSD` only for tests and fallback demos; production deploy script defaults to canonical Celo Sepolia cUSD.
- **2026-06-22:** UI direction is Swiss operational, mobile-first claim surface, restrained Celo green accent, no stat-card hero.
- **2026-06-22:** Deployed and verified `StreamWageVault` on Celo Sepolia at `0xe539898822e5842477D288D2e66758fe5CE69e47`; frontend deployed to Cloudflare Pages at `https://streamwage.pages.dev`.
- **2026-06-22:** Did not run breaking `npm audit fix --force`; it would upgrade core wallet/Self packages across breaking major versions. Remaining audit risk is recorded in `QUALITY_GATE.md`.

