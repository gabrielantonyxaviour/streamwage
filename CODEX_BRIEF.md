# CODEX BRIEF — StreamWage (Celo Proof of Ship, WIN-tier)

> Build this app end-to-end, autonomously, to the Definition of Done below. Obey `./ORCHESTRATION.md` (shared standards + Autonomy Protocol). **Never ask the user a question** — if blocked, append to `BLOCKERS.md` and keep going. Finish only when every box is checked and you have self-verified, then write `TEST_ME.md`.

## 0. ⛔ READ THIS FIRST — this is a PORT, not a rebuild

You are porting a **complete, polished, multi-screen product** to Celo. You are **NOT** building a new UI from scratch. A from-scratch one-page app is an explicit **FAILURE** of this task.

**Copy the source app's entire `src/` into this repo and keep its design system, pages, components, and CSS AS-IS.** Then surgically rewire it for Celo. The source is a real product with a landing page, an app shell, a dashboard, activity feeds, an on-chain explorer panel, a multi-step transaction dialog, and worker cards — all of that must survive the port. You change data wiring and chain-specific screens; you do **not** redesign.

## 1. What StreamWage is

**Real-time salary streaming in Mento cUSD on Celo, claimable in MiniPay.** An employer funds a payroll vault with cUSD and creates per-employee streams that accrue by the second; employees **claim accrued pay anytime from MiniPay**. Employee onboarding is gated by **Self Protocol** identity verification. Track: **Stablecoin Payments + MiniApp**. Why Celo: mobile-first stablecoin payroll for the next billion workers.

## 2. Source to port FROM (copy its `src/` wholesale)

`/Users/gabrielantonyxaviour/Documents/hackathons/mezo-hackathon/execution/2026-05-21T00-46-20Z-sat-salary-btc-collateral-payroll-streams`

Stack you MUST KEEP (do NOT introduce Tailwind/shadcn — the source uses hand-rolled CSS): **React + TS + Vite + viem + wagmi + RainbowKit + custom CSS design system in `src/styles/*.css`**.

| KEEP & adapt (port wholesale)                                                                                                                                   | DROP entirely                                                                                                           | REWIRE                                                                                         |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `src/pages/LandingPage.tsx`, `src/pages/AppShell.tsx`, `src/pages/Dashboard.tsx`                                                                                | Mezo BTC-collateral / trove / health-factor screens & copy                                                              | adapt copy + chain to Celo                                                                     |
| `src/components/` ALL: `ActivityFeed`, `ExplorerTransactions`, `RealFlowPanel`, `TreasuryGauge`, `TxStepsDialog`, `WorkerCard`, `app/`, `landing/`              | trove/rebalance-specific panels inside them                                                                             | point at StreamWageVault + cUSD + Celo explorer                                                |
| `src/styles/*.css` (base, landing, hero, dashboard, app-shell, panels, responsive, sections) — **the whole design system**                                      | —                                                                                                                       | keep as-is; only retheme tokens if you want a Celo accent                                      |
| `src/lib/` `format.ts`, `wagmi.ts`, `satSalary.ts` (contract calls), `demoState.ts`, `profileApi.ts`                                                            | `src/lib/mezo.ts` (Mezo chain)                                                                                          | `wagmi.ts` → Celo Sepolia + MiniPay connector; `satSalary.ts` → new contract ABI/address       |
| `contracts/SatSalaryVault.sol` streaming core (`Stream`, `createStream`, `pauseStream`, `resumeStream`, `withdrawAccrued`, `pending`, `fundPayroll`, `_accrue`) | `SatSalaryTrove.sol`, `interfaces/IMezo.sol`, `MockMUSD.sol`, all trove/BTC/rebalance logic, `script/DeployTrove.s.sol` | MUSD → **cUSD**; rename → `StreamWageVault.sol`; `DeployMezo.s.sol` → `DeployStreamWage.s.sol` |

## 3. The complete product (what the user must see — NOT a one-pager)

Preserve the source's full flow:

- **Landing page** (`LandingPage.tsx`) — marketing hero, how-it-works, the existing `landing/` components. Retheme copy for Celo/cUSD/MiniPay. Has a "Launch app / Connect" CTA.
- **Connect + onboarding** — wallet connect (RainbowKit + MiniPay auto-connect), role routing (employer vs worker). Keep the EIP-1193 auth gate pattern.
- **App shell** (`AppShell.tsx`) — nav/layout wrapping the app, wallet pill, network badge.
- **Employer dashboard** (`Dashboard.tsx`) — fund payroll (cUSD approve+fund), Self-verify a worker, create/pause/resume streams, `WorkerCard` list, `TreasuryGauge`, `ActivityFeed`, `ExplorerTransactions` (live on Celo), `TxStepsDialog` for multi-step txs.
- **Worker view (MiniPay-first)** — accrual ticking live, big **Claim** button → `withdrawAccrued`, claimed cUSD to MiniPay. Mobile-first; works inside MiniPay's in-app browser.

## 4. Celo-native integrations (the score differentiators)

- **Mento cUSD — use the REAL token, not a mock.** Resolve canonical Celo **Sepolia** cUSD (Mento broker/registry / Celo token registry). A mintable mock cUSD is a **last-resort testnet fallback ONLY** and must be flagged in `DECISIONS.md` + replaced with real cUSD at mainnet (mocks score weak on "Evidence of Technical Usage").
- **MiniPay hook (mandatory):** `useMiniPay()` — detect `window.ethereum?.isMiniPay`, auto-connect, hide connect UI in MiniPay, viem/wagmi uses the injected provider. Worker claim must work in MiniPay's in-app browser.
- **Self Protocol (WIN-tier):** `createStream` only for a Self-verified worker. Integrate `@selfxyz` SDK (verify QR step) + on-chain gate (`SelfVerificationRoot`, or owner attestation `isVerified[worker]` after Self callback). Wire to config var `SELF_VERIFIED_ADDRESS` / scope `streamwage`; if not provided, build the full flow and note in `BLOCKERS.md`.

## 5. Task checklist (in order)

1. [ ] `git init`; set per-repo `git config user.name/user.email` = gabrielantonyxaviour. **Copy the source `src/`, `contracts/`, `foundry.toml`, configs into this repo** as the starting point.
2. [ ] Strip the dropped files (trove/BTC/mezo); rename Vault → `StreamWageVault.sol`, denominate in cUSD (SafeERC20, OZ Ownable + ReentrancyGuard), add the Self gate on `createStream`.
   - ⚠️ **Expose a FULL read surface so the dashboard can be rich** (a minimal contract is WHY the first build had a minimal one-pager UI): `nextStreamId`, a `streams(id)` getter returning `(payee, ratePerSecond, accrued, lastUpdated, paused, exists)`, `payrollReserve`/`totalFunded`, `totalStreamRate`, `pending(id)`. Emit events: `StreamCreated(id, worker, rate)`, `PayrollFunded(amount)`, `Claimed(id, worker, amount)`, `StreamPaused(id)`, `StreamResumed(id)`. The UI (worker list, activity feed, treasury panel, explorer) reads these — without them the product cannot render and you fall back to a one-pager.
3. [ ] Foundry tests (`forge test`), ≥3 meaningful: fund, createStream (verified vs unverified), accrual over time, claim transfers cUSD, pause/resume. Make them pass.
4. [ ] `DeployStreamWage.s.sol` → deploy to **Celo Sepolia** (RPC `https://forno.celo-sepolia.celo-testnet.org`, key from `~/.claude/vault/inject.sh get CELO_DEPLOYER_PRIVATE_KEY`). **Verify on Blockscout.**
5. [ ] **Port the full UI:** rewire `lib/wagmi.ts` → Celo Sepolia + MiniPay; `lib/satSalary.ts` → new ABI/address; delete `lib/mezo.ts`. Keep LandingPage + AppShell + Dashboard + all components + all `styles/*.css`. Swap BTC-collateral screens → cUSD funding. Retheme copy for Celo.
6. [ ] MiniPay hook + mobile-first worker claim.
7. [ ] Self verify flow gating `createStream`.
8. [ ] README (overview, architecture, **screenshots**, **Celo deploy section w/ verified contract links**, setup, usage), GitHub Actions CI (build + `forge test` + format), MIT LICENSE.
9. [ ] Deploy frontend to **Cloudflare Pages**.
10. [ ] **Self-verify:** `forge test` green, `npm run build` green, contract verified, live URL loads, full product (landing → connect → dashboard → fund → create stream → accrue → claim) works with the deployer wallet.
11. [ ] Write `BLOCKERS.md`, `DECISIONS.md`, **`TEST_ME.md`** (fill real `[LIVE_URL]`/`[CONTRACT_ADDR]`), and print the **Submission Data Sources block** (GitHub repo URL + each verified contract as `chain + address` + live website URL — paste-ready for talent.app).
12. [ ] Several meaningful conventional commits (not one dump).

## 6. Definition of Done

Full multi-screen product (landing + app shell + dashboard + worker view) ported from source, NOT regenerated · StreamWageVault deployed + **verified** on Celo Sepolia · `forge test` green (≥3 tests) · frontend builds + live on Cloudflare Pages · MiniPay claim works on mobile · **real** cUSD wired (mock only as flagged fallback) · Self gate wired · README (w/ screenshots) + CI + LICENSE · BLOCKERS.md + DECISIONS.md + TEST_ME.md + Submission Data Sources block · core flow verified end-to-end.

## 7. Maturity bar for top-of-leaderboard (8.5+, top ~6%)

Real cUSD · ≥3 meaningful contract functions hit by real txns · ≥3 passing tests · README w/ architecture + screenshots + verified-contract links · complete polished UI (the ported product, not a one-pager) · several commits · verified website. Optimize the 5 AI criteria: Security (OZ, CEI in withdraw, no hardcoded keys), Functionality (the flow works on-chain), Readability (README + NatSpec), Dependencies/Setup (clean, `.env.example`), Evidence of Technical Usage (real Mento cUSD + MiniPay + Self + verified deploy + CI).
