# CODEX BRIEF — StreamWage (Celo Proof of Ship, WIN-tier)

> Build this app end-to-end, autonomously, to the Definition of Done below. Obey `../ORCHESTRATION.md` (shared standards + Autonomy Protocol). **Never ask the user a question** — if blocked, append to `BLOCKERS.md` and keep going. Finish only when every box is checked and you have self-verified, then write `TEST_ME.md`.

## 1. What StreamWage is
**Real-time salary streaming in cUSD on Celo, claimable in MiniPay.** An employer funds a payroll vault with Mento **cUSD** and creates per-employee streams that accrue by the second. Employees **claim their accrued pay anytime from MiniPay** on their phone. Employee onboarding is gated by **Self Protocol** identity verification.

**Why Celo:** stablecoin payroll for gig/remittance/emerging-market workers is Celo's bullseye — mobile-first (MiniPay), stablecoin-native (Mento cUSD), real-world impact. Track: **Stablecoin Payments + MiniApp**.

## 2. Source to port FROM
`/Users/gabrielantonyxaviour/Documents/hackathons/mezo-hackathon/execution/2026-05-21T00-46-20Z-sat-salary-btc-collateral-payroll-streams`

It's a Vite + React + TS + wagmi + viem + RainbowKit + Foundry app. **Reuse the streaming engine, throw away the Bitcoin half.**

| Reuse (keep + adapt) | Drop entirely | Replace |
|---|---|---|
| `contracts/SatSalaryVault.sol` streaming core: `Stream` struct, `createStream`, `pauseStream`, `resumeStream`, `withdrawAccrued` (the claim), `pending`, `fundPayroll`, `repay`, `_accrue` | `contracts/SatSalaryTrove.sol`, `contracts/interfaces/IMezo.sol`, `contracts/MockMUSD.sol`, all Mezo BorrowerOperations / PriceFeed / trove / BTC-collateral / auto-rebalance logic, `script/DeployTrove.s.sol`, `keeper/rebalance-keeper.mjs` collateral logic | MUSD token → **Mento cUSD**; Mezo Testnet → **Celo Sepolia**; `script/DeployMezo.s.sol` → `DeployStreamWage.s.sol` |
| Frontend `src/` (App.tsx, components, pages, lib), Vite, Tailwind | BTC collateral / health-factor / trove UI screens | RainbowKit stays, **add MiniPay connector + hook** |
| `foundry.toml`, `vitest.config.ts`, `playwright.config.ts` | — | — |

## 3. Architecture (target)
- **Contract `StreamWageVault.sol`** (renamed from SatSalaryVault, cUSD-denominated):
  - Employer (owner) funds with cUSD via ERC-20 `approve` + `fundPayroll(amount)`.
  - `createStream(worker, ratePerSecond)` — **only for Self-verified workers** (see §4).
  - `pauseStream` / `resumeStream` (owner).
  - `withdrawAccrued(streamId)` — worker claims accrued cUSD (transfers cUSD to worker). Mobile-first claim is the MiniPay flow.
  - `pending(streamId)` view; `_accrue` time-based accrual.
  - Use **OpenZeppelin** `Ownable` + `ReentrancyGuard` + `SafeERC20`. No raw ecrecover. No hardcoded secrets.
- **Frontend** (Vite+React+TS+Tailwind+shadcn, mobile-first, → Cloudflare Pages):
  - **Employer dashboard:** fund payroll (cUSD approve+fund), add employee (triggers Self verify), create/pause/resume streams, see live accrual.
  - **Worker view (MiniPay-first):** see my stream accruing by the second, big **Claim** button → `withdrawAccrued`, claimed cUSD lands in MiniPay wallet.
- **Optional keeper** (`keeper/`): an auto-claim cron the worker can opt into. Nice-to-have; stub if time-constrained (log to BLOCKERS.md).

## 4. Celo-native integrations (the score differentiators)
- **Mento cUSD:** resolve the canonical Celo **Sepolia** cUSD token address (from Mento broker/registry; if unresolvable, deploy a faucet-mintable mock cUSD and note it in `DECISIONS.md`). All payroll denominated in cUSD.
- **MiniPay hook (mandatory):** `useMiniPay()` — detect `window.ethereum?.isMiniPay`, auto-connect, hide the connect button inside MiniPay, ensure viem/wagmi uses the injected MiniPay provider. The worker claim screen must work cleanly inside MiniPay's in-app browser (mobile viewport).
- **Self Protocol (WIN-tier):** employer can only `createStream` for a worker whose identity is verified. Integrate `@selfxyz` SDK: a "Verify employee" QR step; on success, gate stream creation. On-chain: extend with `SelfVerificationRoot` OR verify off-chain and store an on-chain `isVerified[worker]` attestation set by owner after Self callback. Wire the verifier to config var `SELF_VERIFIED_ADDRESS` / scope `streamwage`. If the user's verified address isn't provided yet, build the full flow and leave it as an env var + note in `BLOCKERS.md`.

## 5. Task checklist (in order)
1. [ ] `git init`, set per-repo `git config user.name/user.email` = gabrielantonyxaviour. Scaffold Foundry + Vite.
2. [ ] Write `StreamWageVault.sol` (port the streaming core, cUSD via SafeERC20, OZ Ownable+ReentrancyGuard, Self gate on `createStream`).
3. [ ] Foundry tests (`forge test`) — ≥ cover: fund, createStream (verified vs unverified worker), accrual over time, claim transfers cUSD, pause/resume. Make them pass.
4. [ ] `DeployStreamWage.s.sol` → deploy to **Celo Sepolia** (RPC `https://forno.celo-sepolia.celo-testnet.org`, deployer key from `~/.claude/vault/inject.sh get CELO_DEPLOYER_PRIVATE_KEY`). **Verify on Blockscout** (`https://celo-sepolia.blockscout.com`).
5. [ ] Frontend: employer dashboard + worker claim view, wagmi/viem wired to Celo Sepolia + deployed contract + cUSD.
6. [ ] MiniPay hook + mobile-first worker claim.
7. [ ] Self Protocol verify flow gating `createStream`.
8. [ ] README (overview, architecture diagram, **Celo deploy section w/ verified contract links**, setup, usage), GitHub Actions CI (build + `forge test` + lint/format), MIT LICENSE.
9. [ ] Deploy frontend to **Cloudflare Pages**.
10. [ ] **Self-verify:** `forge test` green, `npm run build` green, contract verified on Sepolia, live URL loads, and you can fund → create stream → see accrual → claim cUSD using the deployer wallet. Record evidence.
11. [ ] Write `BLOCKERS.md`, `DECISIONS.md`, and **`TEST_ME.md`** (fill the real [LIVE_URL] and [CONTRACT_ADDR]).
12. [ ] Make several meaningful conventional commits along the way (not one dump).

## 6. Definition of Done
- StreamWageVault deployed + **verified** on Celo Sepolia (link in README) · `forge test` green · frontend builds + live on Cloudflare Pages · MiniPay claim works on mobile viewport · cUSD wired · Self gate wired · README + CI + LICENSE present · BLOCKERS.md + DECISIONS.md + **TEST_ME.md** written · core flow (fund→stream→accrue→claim) verified end-to-end.

## 7. Scoring notes (optimize for the AI rubric)
- **Security:** OZ Ownable/ReentrancyGuard/SafeERC20, checks-effects-interactions in `withdrawAccrued`, no hardcoded keys (read from env/vault). 
- **Functionality:** the fund→stream→claim path must actually work on-chain.
- **Readability:** clean README + NatSpec on the contract + inline comments.
- **Dependencies/Setup:** clean `package.json`, `.env.example`, one-command setup.
- **Evidence of Technical Usage:** real Mento cUSD + MiniPay + Self integration, verified deploy, passing tests, CI. This is what pushes 8.5+.
