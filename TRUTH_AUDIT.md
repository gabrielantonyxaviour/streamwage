# TRUTH AUDIT — StreamWage

## Real

- `StreamWageVault.sol` exists and uses OpenZeppelin `Ownable`, `ReentrancyGuard`, and `SafeERC20`.
- Foundry tests cover cUSD funding, Self-gated stream creation, accrual, pause/resume, claim transfers, and worker-only claim.
- Frontend builds against Celo Sepolia, Mento cUSD, and a deploy-time vault address variable.
- Mento cUSD Celo Sepolia address was verified from Mento's official deployment docs on 2026-06-22.
- `StreamWageVault` is deployed and verified on Celo Sepolia at `0x5eAfDC8D612c8c2860cE8002516737e413B07c67`.
- Cloudflare Pages app is live at `https://streamwage.pages.dev`.

## Fixture / local only

- `MockCUSD.sol` is used only in tests and as a fallback if testnet cUSD access blocks live proof.

## Blocked or not yet proven

- Deployer has `0` canonical cUSD on Celo Sepolia, so live payroll funding and claim proof are blocked.
- MiniPay in-app browser proof is pending.
- Self Protocol QR/callback is scaffolded as owner attestation, but a production Self callback service is not deployed yet.
- `npm audit --audit-level=moderate` still fails after non-breaking `npm audit fix` with 35 transitive vulnerabilities; remaining automated fixes are breaking upgrades.

## Removed claims

- All Mezo, MUSD, BTC collateral, trove, and auto-rebalance claims from the source app were removed from active code.
