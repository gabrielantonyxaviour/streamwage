# BLOCKERS — StreamWage

## Pending external proof

- **Self Protocol production callback/QR**
  - Why: the contract supports owner attestation after Self verification, and the frontend has the worker address handoff, but no deployed Self backend/callback service exists in this repo yet.
  - Workaround: use `setWorkerVerification(worker, true)` after human Self QR verification for scope `streamwage`.
  - Human action: scan the Self QR once a callback app is deployed, or provide the verified worker address via `VITE_SELF_VERIFIED_ADDRESS`.

- **MiniPay device proof**
  - Why: MiniPay proof requires the app to be opened inside MiniPay's mobile in-app browser.
  - Workaround: code detects `window.ethereum.isMiniPay` and auto-connects injected provider; desktop wallets can test the same claim call.
  - Human action: after live URL exists, open it in MiniPay and approve a claim.

## Resolved

- **Canonical cUSD funding (RESOLVED 2026-06-22)**
  - The deployer holds `0` real Mento USDm on Celo Sepolia and there is no faucet, so a mintable
    cUSD mock (`0x5127B7B034Cf9798c58948B64359a2Bf6285518d`) was deployed and 1,000,000 cUSD minted
    to the deployer. The full on-chain flow (fund → verify → stream → claim) was executed and the
    worker balance increased by 6.4 cUSD. Real Mento USDm is kept as the mainnet/production token.

## Pending deployment proof

- **Formal polish**
  - Why: `PLAYWRIGHT_CLI_REMOTE=m2worker` is set, but `tailscale status` returns `Tailscale is stopped`.
  - Workaround: local fallback screenshots captured at 375/768/1440 and recorded in `QUALITY_GATE.md`.
  - Human action: start Tailscale/M2 worker to run formal `/polish`.
