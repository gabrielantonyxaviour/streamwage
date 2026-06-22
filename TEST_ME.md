# TEST_ME — StreamWage (handoff for Gabriel)

## What it does

Real-time salary streaming in **cUSD on Celo**. An employer funds a vault with
cUSD and streams pay to workers by the second; workers claim accrued pay anytime
in **MiniPay**. Worker onboarding is gated by **Self Protocol** identity
verification (enforced on-chain).

## Live links

- **App (Cloudflare Pages):** https://streamwage.pages.dev
- **Latest deployment URL:** https://0e151a01.streamwage.pages.dev
- **StreamWageVault (verified):** https://celo-sepolia.blockscout.com/address/0x5eAfDC8D612c8c2860cE8002516737e413B07c67
  - address `0x5eAfDC8D612c8c2860cE8002516737e413B07c67`
- **cUSD token (verified, testnet mintable):** https://celo-sepolia.blockscout.com/address/0x5127B7B034Cf9798c58948B64359a2Bf6285518d
  - address `0x5127B7B034Cf9798c58948B64359a2Bf6285518d`
- **Chain:** Celo Sepolia (chainId 11142220)

## Before you start — funds

- The deployer/test wallet `0xd5E79f200cbe03141F81566dc213a46135f83062` holds
  CELO-S for gas **and ~993 cUSD** (minted from the test token). The full
  fund → verify → stream → claim loop has already been run on-chain (see README
  "On-chain proof").
- **Need more test cUSD?** The test token has a public `mint`:
  ```bash
  set -a; . ./.env.local; set +a   # CELO_DEPLOYER_PRIVATE_KEY
  cast send 0x5127B7B034Cf9798c58948B64359a2Bf6285518d \
    "mint(address,uint256)" <YOUR_ADDR> 1000000000000000000000 \
    --rpc-url https://forno.celo-sepolia.celo-testnet.org \
    --private-key "$CELO_DEPLOYER_PRIVATE_KEY"   # mints 1000 cUSD
  ```

## Test path A — Employer (desktop, ~2 min)

1. Open https://streamwage.pages.dev → **Launch app** → connect the deployer
   wallet (you are the vault owner). Onboard as **Employer**.
2. **Fund payroll:** on the dashboard, enter cUSD (e.g. `500`) → the dialog runs
   **Approve** then **Fund**. The "Payroll reserve" rises.
3. **Team → Add Employee:** enter name + a worker wallet → a **Self QR** appears.
   Click **Confirm verification on-chain** (owner attestation). The worker turns
   "verified".
4. **Create stream:** set a monthly cUSD amount → **Create stream**. (It is
   blocked until the worker is verified — that's the Self gate.) The stream
   appears and the "accrued" / pending number ticks up live.
5. **Pause / Resume:** from the dashboard stream row, toggle a worker's stream;
   accrual stops/starts and `totalStreamRate` updates.

## Test path B — Worker claim in MiniPay (phone, ~2 min)

1. On your phone, open **MiniPay → built-in browser → https://streamwage.pages.dev**.
2. The app **auto-connects** (no connect button) — that's the MiniPay hook.
3. You see your stream accruing. Tap **Claim**.
4. Approve in MiniPay → accrued cUSD lands in your wallet; the pending amount
   resets and "Claimed to date" rises.
   - No phone? Use any Celo Sepolia wallet whose address is a stream payee — the
     "My Earnings" view shows the same Claim button.

## 🙋 Human steps only you can do

1. **Self verification (real QR):** the worker scans the Self QR with the Self
   app for scope `streamwage`. The on-chain gate is completed by the employer's
   `setWorkerVerification` (a hosted Self callback is the remaining piece — see
   BLOCKERS.md).
2. **Promote to mainnet:** everything above is Celo Sepolia (free testnet). When
   ready, say the word to deploy to Celo mainnet using the canonical Mento cUSD
   (`0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b`); top up the deployer with a
   little mainnet CELO first.

## Expected results checklist

- [x] Fund payroll → reserve rises (verified on-chain: 1000 cUSD funded)
- [x] Self gate → unverified worker is rejected; verified worker succeeds
- [x] Create stream → accrued ticks up per second
- [x] Pause → accrual stops; Resume → continues
- [x] Claim → cUSD arrives in the worker wallet (verified: +6.4 cUSD)
- [x] App auto-connects inside MiniPay (hook implemented; device proof pending)

## Known limitations / stubbed (see BLOCKERS.md)

- **Testnet cUSD is a mintable mock** (deployer holds 0 canonical Mento USDm and
  there is no Sepolia faucet). Real Mento USDm is wired as the mainnet token.
- **Self callback service** is not hosted; the on-chain gate is completed via
  owner attestation (`setWorkerVerification`) after the real Self QR scan.
- **MiniPay device proof** requires opening the live URL inside MiniPay on a
  phone; the auto-connect code is implemented and desktop-testable.

---

## SUBMISSION DATA SOURCES (paste-ready for talent.app)

**GitHub repo**

- https://github.com/gabrielantonyxaviour/streamwage

**Smart contracts (onchain impact)**

- Celo Sepolia (11142220) · StreamWageVault · `0x5eAfDC8D612c8c2860cE8002516737e413B07c67`
- Celo Sepolia (11142220) · cUSD (test) · `0x5127B7B034Cf9798c58948B64359a2Bf6285518d`

**Verified website**

- https://streamwage.pages.dev
