# Celo Proof of Ship — Codex Build Orchestration

How to build all 11 apps autonomously. One Codex session per app, built from that app's `CODEX_BRIEF.md`, finishing with a `TEST_ME.md` handoff. **No session interrupts the user** — each follows the Autonomy Protocol below.

## Launch (per app)

1. Create repo: `gh repo create gabrielantonyxaviour/<app> --public` (done just-in-time by Claude).
2. From the app working dir, launch Codex with its brief, e.g.:
   `/codex:rescue Build <app> exactly per ./CODEX_BRIEF.md. Follow the Autonomy Protocol in ../ORCHESTRATION.md — never ask me anything; log blockers to BLOCKERS.md and keep going. Finish only when Definition of Done is met and TEST_ME.md is written.`

## Shared standards (every app obeys)

- **Chain (test):** Celo Sepolia — chainId `11142220`, RPC `https://forno.celo-sepolia.celo-testnet.org`, explorer `https://celo-sepolia.blockscout.com`. Mainnet (`42220`) only after user OK.
- **Deployer:** `~/.claude/vault/inject.sh get CELO_DEPLOYER_PRIVATE_KEY CELO_SEPOLIA_RPC --dir <app>` → address `0xd5E79f200cbe03141F81566dc213a46135f83062`.
- **Contracts:** Foundry. Deploy script + Blockscout verify. ≥1 meaningful test. ReentrancyGuard/AccessControl where relevant; no raw `ecrecover`; no hardcoded secrets.
- **Contract read surface (prevents thin UIs):** the contract MUST expose enough public getters + events for the ported UI to render its full product (lists, feeds, status panels) — e.g. counters, per-item struct getters, totals, and an event for every state change. A minimal write-only contract forces a one-pager regardless of the frontend prompt. Mirror the read surface of the SOURCE build's contract for the screens you're keeping.
- **Stablecoin:** Mento **cUSD** on Celo Sepolia (resolve canonical addr from Mento broker/registry; record in DECISIONS.md).
- **Frontend — REUSE the source app's UI/design system; do NOT regenerate.** Port the source `src/` wholesale: its CSS/design tokens, components, landing page, dashboard, layout — keep its stack and styling approach **as-is** (do NOT swap in a different CSS framework). Adapt copy/labels for Celo and swap ONLY chain-specific screens (e.g. a BTC-collateral form → cUSD funding); rewire data to the new contract; add the MiniPay hook. The source UIs are mature hackathon builds — **regenerating a minimal from-scratch UI is a FAILURE MODE** that discards polish and wastes time. Deploy to **Cloudflare Pages**, mobile-first.
- **MiniPay hook (mandatory):** detect `window.ethereum.isMiniPay`, auto-connect, hide connect UI inside MiniPay, MiniPay-compatible viem/wagmi config. Eligibility + scoring booster.
- **DB (if needed):** Cloudflare D1. **LLM (agent apps):** Sarvam (`SARVAM_API_KEY`), OpenAI fallback.
- **Scoring hygiene (REQUIRED — what the AI grades):** root README (overview, architecture, **Celo deploy section with verified contract links**, setup, usage), GitHub Actions CI (build+test+format), MIT LICENSE, clean structure, inline docs. A clean+tested+documented app scores ~8; missing README/tests caps you near ~6.5.
- **Self Protocol (WIN-tier only):** integrate `SelfVerificationRoot`; wire to config var `SELF_VERIFIED_ADDRESS` (if not yet provided, build the full flow and leave it as an env var + note in BLOCKERS.md).
- **Git:** per-repo `git config user.name/user.email` = gabrielantonyxaviour. Conventional commits, **several meaningful commits**, not one dump.

## AUTONOMY PROTOCOL — do NOT interrupt the user

1. **Never ask the user a question mid-build.**
2. If blocked (missing secret, ambiguous spec, external login): append a structured entry to `BLOCKERS.md` (what, why, what you stubbed, what the user must do), then **work around it** (stub/mock with TODO, or skip the sub-feature) and **continue**.
3. Make sensible defaults; log non-obvious choices in `DECISIONS.md`.
4. **Self-verify before done:** `forge test` green, frontend `build` green, Sepolia deploy + verify OK, live URL loads and the core flow works with the deployer wallet.
5. Finish only at Definition of Done.

## Definition of Done (per app)

- [ ] Contracts deployed + **verified** on Celo Sepolia (links in README)
- [ ] `forge test` green (≥1 meaningful test); frontend builds clean
- [ ] Frontend **live on Cloudflare Pages** (URL); MiniPay hook present; mobile-responsive
- [ ] Mento cUSD wired; (win) Self flow wired
- [ ] README + CI + LICENSE present
- [ ] BLOCKERS.md + DECISIONS.md written
- [ ] **TEST_ME.md** written (user handoff)
- [ ] (win) DEMO_SCRIPT.md + PITCH_DECK.md ready

## TEST_ME.md format (the user handoff — copy-paste exact)

1. What the app does (2 lines)
2. Live URL + verified contract links
3. **Exactly how to test:** which wallet, how to get test cUSD, step-by-step clicks, expected result at each step
4. Human-gated items (Self QR scan steps for win-tier; "promote to mainnet when ready")
5. Known limitations / what's stubbed (from BLOCKERS.md)

## Submission & leaderboard requirements (bake into EVERY app)

The talent.app project form scores you via three tracked data sources — build for all three:

- **Verified website** = the live Cloudflare URL. Be ready to add talent.app's website-verification token (a `<meta>` tag in `index.html` or a `public/.well-known/` file) the moment Gabriel provides it.
- **Smart contracts (onchain impact)** — deploy + **verify** the meaningful contracts (the form accepts up to 5). Onchain score is tracked on these, so design the core flow so real user transactions actually hit them. Register on **Celo mainnet** for the scored season (testnet for dev). More _meaningful_ contracts/functions = more tracked surface; don't pad artificially.
- **GitHub repos (building activity)** — up to 5 public repos. One well-structured repo is fine; what's scored is **commit activity over time + README + tests + CI**. Make several meaningful conventional commits across the build window (stagger), not one dump.

**Use REAL Celo-native primitives, not mocks** — resolve and use **real Mento cUSD** (Sepolia + mainnet) and real Self Protocol. A mock token (e.g. `USDm`) is a last-resort _testnet_ fallback only and MUST be replaced with real cUSD at mainnet — mocks score weak on "Evidence of Technical Usage."

**End-of-build SUBMISSION DATA SOURCES block** (print it AND put it in `TEST_ME.md`): the GitHub repo URL(s) + every verified contract as `chain + address`, paste-ready into talent.app → Data Sources, plus the live website URL.

## Maturity bar for top-of-leaderboard (Definition of Done+)

Beyond the base DoD, aim for the 8.5+ band (top ~6%): real (not mock) cUSD on mainnet · ≥3 meaningful contract functions exercised by real transactions · ≥3 passing tests · README with architecture + screenshots + verified-contract links · UI passing `/polish` · several commits · verified website.

## Order & staggering

Win-tier first: `streamwage` → `agent-bazaar` → `paymate`. Then presence `4–11`. **Stagger commits/deploys across days** — activity-over-time is scored and it looks organic.
