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

## Pending deployment proof

- **Canonical cUSD funding**
  - Why: deployer `0xd5E79f200cbe03141F81566dc213a46135f83062` has `0` Mento cUSD on Celo Sepolia.
  - Workaround: app and verified vault are live; fund/claim can proceed once cUSD is acquired.
  - Human action: acquire test cUSD for the deployer or provide a funded worker/employer wallet.

- **Formal polish**
  - Why: `PLAYWRIGHT_CLI_REMOTE=m2worker` is set, but `tailscale status` returns `Tailscale is stopped`.
  - Workaround: local fallback screenshots captured at 375/768/1440 and recorded in `QUALITY_GATE.md`.
  - Human action: start Tailscale/M2 worker to run formal `/polish`.
