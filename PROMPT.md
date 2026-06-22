# PASTE THIS INTO YOUR CODEX SESSION (run from the `streamwage` repo root)

You are building **StreamWage**, a Celo dApp, end-to-end and autonomously. Read these two files in this repo FIRST and follow them exactly: `CODEX_BRIEF.md` (full spec + checklist + Definition of Done) and `ORCHESTRATION.md` (shared standards + Autonomy Protocol). The brief is the source of truth.

## ⛔ CRITICAL — this is a PORT of a complete product, NOT a from-scratch build

There must be a **full multi-screen product**: a **landing page, wallet connect + onboarding, an app shell/nav, an employer dashboard, and a worker claim view** — like a real product, not a single-page playground with a couple of forms. **A minimal one-pager is a FAILED build.**

To get this, **copy the source app's entire `src/` into this repo and keep its design system AS-IS**, then rewire it for Celo. Source: `/Users/gabrielantonyxaviour/Documents/hackathons/mezo-hackathon/execution/2026-05-21T00-46-20Z-sat-salary-btc-collateral-payroll-streams`. It already has `pages/LandingPage.tsx`, `pages/AppShell.tsx`, `pages/Dashboard.tsx`, rich `components/` (ActivityFeed, ExplorerTransactions, RealFlowPanel, TreasuryGauge, TxStepsDialog, WorkerCard, app/, landing/) and a **hand-rolled CSS design system in `src/styles/*.css`**. KEEP all of it. **Do NOT introduce Tailwind or shadcn. Do NOT redesign.** Only: drop the Mezo/BTC-collateral/trove code, swap MUSD → Mento cUSD, point the chain at Celo Sepolia, swap the BTC-collateral screens for a cUSD funding screen, rewire data to the new `StreamWageVault` contract, and add the MiniPay hook + Self verification.

## Hard rules

- **Chain:** Celo Sepolia — chainId `11142220`, RPC `https://forno.celo-sepolia.celo-testnet.org`, explorer `https://celo-sepolia.blockscout.com`. Mainnet `42220` only if I later say promote.
- **Deployer key:** `~/.claude/vault/inject.sh get CELO_DEPLOYER_PRIVATE_KEY CELO_SEPOLIA_RPC --dir .` (address `0xd5E79f200cbe03141F81566dc213a46135f83062`).
- **Stablecoin:** use the **REAL** Mento cUSD on Celo Sepolia (resolve canonical address). A mintable mock cUSD is a last-resort testnet fallback only — flag it in DECISIONS.md and replace at mainnet.
- **Stack:** keep the source's React + TS + Vite + viem + wagmi + RainbowKit + **custom CSS** (`src/styles/*.css`). Deploy frontend to **Cloudflare Pages** (`CLOUDFLARE_API_TOKEN`/`CLOUDFLARE_ACCOUNT_ID` in vault).
- **MiniPay hook mandatory:** detect `window.ethereum.isMiniPay`, auto-connect, worker claim works inside MiniPay.
- **Self Protocol:** gate `createStream` on a verified worker; wire to config var `SELF_VERIFIED_ADDRESS` (scope `streamwage`).
- **Contracts:** Foundry, OZ Ownable + ReentrancyGuard + SafeERC20, ≥3 meaningful passing tests, deploy script, **verify on Blockscout**.
- **Hygiene (graded):** README (overview + architecture + **screenshots** + Celo deploy section w/ verified contract links + setup), GitHub Actions CI (build + `forge test` + format), MIT LICENSE.
- **Git:** per-repo `git config user.name/user.email` = gabrielantonyxaviour; several meaningful conventional commits.

## AUTONOMY — do NOT interrupt me

Never ask me a question. If blocked (missing secret/address, ambiguity, external login): append to `BLOCKERS.md`, stub/skip with a TODO, and CONTINUE. Log non-obvious choices in `DECISIONS.md`. **Self-verify before finishing:** `forge test` green, `npm run build` green, contract verified on Celo Sepolia, live Cloudflare URL loads, and the FULL product flow works (landing → connect → employer dashboard → fund payroll → create stream → accrual ticks → worker claims cUSD).

## When done, do EXACTLY this

1. Fill the real `[LIVE_URL]`/`[CONTRACT_ADDR]` in `TEST_ME.md`.
2. Print: live URL, verified contract link, `forge test` result, screenshots path, anything stubbed (from BLOCKERS.md), the human steps left (Self QR scan + how to get test cUSD), and a **Submission Data Sources block** (GitHub repo URL + each verified contract as `chain + address` + live website URL — paste-ready for talent.app).
3. Stop only when the Definition of Done in `CODEX_BRIEF.md` is fully met — including the full multi-screen product, not a one-pager.

Begin now. Work to completion without pausing for me.
