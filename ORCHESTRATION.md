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
- **Stablecoin:** Mento **cUSD** on Celo Sepolia (resolve canonical addr from Mento broker/registry; record in DECISIONS.md).
- **Frontend:** Vite + React + Tailwind + shadcn → **Cloudflare Pages**. Mobile-first (MiniPay is mobile).
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

## Order & staggering
Win-tier first: `streamwage` → `agent-bazaar` → `paymate`. Then presence `4–11`. **Stagger commits/deploys across days** — activity-over-time is scored and it looks organic.
