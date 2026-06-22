# INTEGRATION MATRIX — StreamWage

| Integration | Real access path | Env / address | Proof command | Status |
|---|---|---|---|---|
| Celo Sepolia RPC | Forno | `https://forno.celo-sepolia.celo-testnet.org`, chain `11142220` | `npm run rpc:check` | pass |
| Mento cUSD | Official Mento StableTokenUSD on Celo Sepolia | `0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b` | explorer + deploy constructor | wired |
| StreamWageVault | Foundry deployment | `0xe539898822e5842477D288D2e66758fe5CE69e47` | `forge script ... --broadcast`; `forge verify-contract ... --watch` | deployed + verified |
| MiniPay | Injected provider in MiniPay browser | `window.ethereum.isMiniPay` | mobile/MiniPay browser proof | implemented, not externally proven |
| Self Protocol | Owner attestation after Self verification callback/QR | `VITE_SELF_VERIFIED_ADDRESS`, scope `streamwage` | human Self QR scan + `setWorkerVerification` tx | app flow scaffolded; QR callback not live |
| WalletConnect/RainbowKit | RainbowKit default connectors | `VITE_WALLETCONNECT_PROJECT_ID` optional | browser wallet modal | pending browser proof |
| Cloudflare Pages | Wrangler Pages deploy | `https://streamwage.pages.dev` | `wrangler pages deploy dist` | deployed |
