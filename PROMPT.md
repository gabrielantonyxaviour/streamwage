# PASTE THIS INTO YOUR CODEX SESSION (run from the `streamwage` repo root)

You are building **StreamWage**, a Celo dApp, end-to-end and autonomously. Two reference files are in this repo — **read them first and follow them exactly**: `CODEX_BRIEF.md` (the full spec + task checklist + Definition of Done) and `ORCHESTRATION.md` (shared standards + Autonomy Protocol). The brief is the source of truth; this prompt embeds the essentials so you can start immediately.

## Your mandate
Build **real-time salary streaming in Mento cUSD on Celo, claimable in MiniPay**, with **Self Protocol** employee verification. Port the streaming engine from the source build at `/Users/gabrielantonyxaviour/Documents/hackathons/mezo-hackathon/execution/2026-05-21T00-46-20Z-sat-salary-btc-collateral-payroll-streams` — REUSE its `contracts/SatSalaryVault.sol` streaming core (`Stream`, `createStream`, `pauseStream`, `resumeStream`, `withdrawAccrued`, `pending`, `fundPayroll`, `_accrue`) and its Vite/React/wagmi/viem frontend; DROP all Bitcoin/Mezo-trove/collateral code; REPLACE MUSD with cUSD and Mezo testnet with Celo Sepolia.

## Hard rules
- **Chain:** Celo Sepolia — chainId `11142220`, RPC `https://forno.celo-sepolia.celo-testnet.org`, explorer `https://celo-sepolia.blockscout.com`. (Mainnet `42220` ONLY if I later tell you to promote.)
- **Deployer key:** `~/.claude/vault/inject.sh get CELO_DEPLOYER_PRIVATE_KEY CELO_SEPOLIA_RPC --dir .` (address `0xd5E79f200cbe03141F81566dc213a46135f83062`).
- **Stablecoin:** Mento cUSD on Celo Sepolia (resolve canonical address; if not resolvable, deploy a faucet-mintable mock cUSD and note in DECISIONS.md).
- **Frontend:** Vite+React+TS+Tailwind+shadcn, mobile-first, deploy to **Cloudflare Pages** (`CLOUDFLARE_API_TOKEN`/`CLOUDFLARE_ACCOUNT_ID` in vault).
- **MiniPay hook mandatory:** detect `window.ethereum.isMiniPay`, auto-connect, mobile claim screen works in MiniPay.
- **Self Protocol:** gate `createStream` on a verified worker; wire to config var `SELF_VERIFIED_ADDRESS` (scope `streamwage`).
- **Contracts:** Foundry, OpenZeppelin Ownable + ReentrancyGuard + SafeERC20, ≥1 meaningful passing test, deploy script, **verify on Blockscout**.
- **Hygiene (REQUIRED — graded):** README with a Celo deploy section + verified contract links, GitHub Actions CI (build + `forge test` + format), MIT LICENSE.
- **Git:** set per-repo `git config user.name/user.email` to gabrielantonyxaviour; make several meaningful conventional commits.

## AUTONOMY — do NOT interrupt me
- Never ask me a question. If blocked (missing secret/address, ambiguity, external login), append a structured entry to `BLOCKERS.md`, stub/skip with a clear TODO, and CONTINUE.
- Log non-obvious choices in `DECISIONS.md`.
- **Self-verify before finishing:** `forge test` green, `npm run build` green, contract verified on Celo Sepolia, live Cloudflare URL loads, and you can fund payroll → create a stream → watch it accrue → claim cUSD with the deployer wallet.

## When done, do EXACTLY this
1. Fill in the real `[LIVE_URL]` and `[CONTRACT_ADDR]` in `TEST_ME.md` (already scaffolded in this repo) so I have copy-paste-exact steps to test + use it.
2. Print a final report containing: the live URL, the verified contract link, `forge test` result, anything you stubbed (from BLOCKERS.md), and the exact human steps I still need to do (the Self QR scan + how to get test cUSD). 
3. Stop only when the Definition of Done in `CODEX_BRIEF.md` is fully met.

Begin now. Work to completion without pausing for me.
