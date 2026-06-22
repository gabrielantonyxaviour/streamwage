# FEATURE MATRIX — StreamWage

| Feature | Source | Implementation | Test / proof | Status |
|---|---|---|---|---|
| cUSD payroll vault funding | CODEX_BRIEF §3 | `contracts/StreamWageVault.sol`, `fundPayroll` | `forge test` `testFundPayrollPullsCusdFromOwner` | implemented, local tested |
| Self-gated worker eligibility | CODEX_BRIEF §4 | `isVerifiedWorker`, `setWorkerVerification`, `createStream` gate | `forge test` `testCreateStreamRequiresSelfVerifiedWorker` | implemented, local tested |
| Per-second wage streams | CODEX_BRIEF §3 | `Stream`, `_accrue`, `pending` | `forge test` accrual and pause/resume tests | implemented, local tested |
| Worker cUSD claim | CODEX_BRIEF §3 | `withdrawAccrued` pull payment | `forge test` `testWorkerWithdrawsStreamedCusd` | implemented, local tested |
| MiniPay auto-connect | CODEX_BRIEF §4 | `src/hooks/useMiniPay.ts` detects `window.ethereum.isMiniPay` | local screenshot proof; MiniPay device proof pending | implemented, needs device proof |
| Employer dashboard | CODEX_BRIEF §3 | `src/App.tsx` employer console | `npm run build`, E2E, local visual QA | implemented |
| Worker claim screen | CODEX_BRIEF §3 | `src/App.tsx` claim panel | `npm run build`, E2E, local visual QA | implemented |
| Celo Sepolia deploy script | CODEX_BRIEF §5 | `script/DeployStreamWage.s.sol` | deployed + Blockscout verified | implemented |
| Cloudflare Pages frontend | CODEX_BRIEF §5 | Vite build output `dist/` | `https://streamwage.pages.dev` | deployed |
| README / CI / LICENSE | CODEX_BRIEF §5 | root docs and `.github/workflows/ci.yml` | local checks pass; CI not run remotely | implemented locally |
