# TEST_ME — StreamWage (handoff for Gabriel)

> Codex fills the `[BRACKET]` placeholders at the end of the build. Once filled, these are your exact, copy-paste steps to test and use the app.

## What it does
Real-time salary streaming in cUSD on Celo. An employer funds a vault with cUSD and streams pay to employees by the second; employees claim accrued pay anytime in **MiniPay**. Employee onboarding is gated by **Self Protocol** identity verification.

## Live links
- **App (Cloudflare Pages):** `https://streamwage.pages.dev`
- **Latest deployment URL:** `https://cb751143.streamwage.pages.dev`
- **StreamWageVault (verified):** `https://celo-sepolia.blockscout.com/address/0xe539898822e5842477d288d2e66758fe5ce69e47`
- **Contract address:** `0xe539898822e5842477D288D2e66758fe5CE69e47`
- **cUSD token used:** `0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b`
- **Chain:** Celo Sepolia (chainId 11142220)

## Before you start — get test funds
1. Your deployer/test wallet `0xd5E79f200cbe03141F81566dc213a46135f83062` already holds CELO-S for gas.
2. **Test cUSD:** the deployer currently has `0` Celo Sepolia cUSD. You need to acquire test cUSD before the employer fund step can succeed. CELO-S gas is funded; cUSD payroll liquidity is the remaining blocker.

## Test path A — Employer (desktop, ~2 min)
1. Open `https://streamwage.pages.dev`, connect the deployer wallet (you are the vault owner).
2. **Fund payroll:** enter an amount of cUSD → Approve → Fund. Confirm the vault cUSD balance updates.
3. **Add an employee:** paste a worker address → click **Verify with Self** → (see "Human step" below) → once verified, the address is eligible.
4. **Create a stream:** worker address + a rate (e.g. `0.0001 cUSD/sec`) → Create. You should see the stream appear and the "accrued" number tick up live.
5. **Pause / Resume:** toggle the stream; accrual stops/starts.

## Test path B — Worker claim in MiniPay (phone, ~2 min)
1. On your phone, open the MiniPay app → built-in browser → go to `https://streamwage.pages.dev`.
2. The app should **auto-connect** (no connect button) — that's the MiniPay hook working.
3. You see your stream accruing. Tap **Claim**.
4. Approve in MiniPay. The accrued cUSD lands in your MiniPay balance. Confirm balance increased.
   - (No phone handy? Use the worker view in a desktop wallet on Celo Sepolia — same flow, just not the MiniPay auto-connect.)

## 🙋 Human steps only you can do
1. **Self verification (once):** when you click "Verify with Self", scan the QR with the **Self app** on your phone. Since your identity is already verified, this is a re-scan for this app's scope (`streamwage`) — ~30 sec, no re-KYC. After this, `createStream` is unlocked for that worker.
2. **Promote to mainnet:** everything above is on Celo Sepolia (testnet, free). When you're happy, tell me/Codex to deploy to Celo mainnet — I'll need you to top up the deployer with a little mainnet CELO first.

## Expected results checklist
- [ ] Fund payroll → vault cUSD balance rises
- [ ] Self verify → worker becomes eligible (unverified worker is rejected)
- [ ] Create stream → accrued amount ticks up by the second
- [ ] Pause → accrual stops; Resume → continues
- [ ] Claim in MiniPay → cUSD arrives in the worker wallet
- [ ] App auto-connects inside MiniPay (no connect button)

## Known limitations / stubbed (Codex fills from BLOCKERS.md)
- Deployer has `0` Mento cUSD on Celo Sepolia, so the live fund → stream → claim transaction loop is not completed yet.
- Self Protocol is enforced on-chain as owner attestation after verification, but a production Self QR callback service is not deployed in this repo.
- MiniPay auto-connect code is implemented, but in-app MiniPay device proof is still pending.
- Formal `/polish` was blocked because Tailscale/M2 worker was stopped; local fallback screenshots were captured at 375/768/1440.
