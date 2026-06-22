import { STREAMWAGE_VAULT_ADDRESS, CUSD_ADDRESS } from "../../lib/satSalary";
import { CELO_EXPLORER } from "../../lib/wagmi";

const GITHUB_URL = "https://github.com/gabrielantonyxaviour/streamwage";

export function LandingFooter() {
  return (
    <footer className="landing-footer">
      <div className="landing-footer-inner">
        <div className="footer-brand">
          <img
            src="/logo-mark.png"
            alt="StreamWage logo"
            className="footer-logo"
          />
          <span>StreamWage</span>
          <span className="footer-chain-badge">
            <span className="footer-chain-dot" />
            Celo Sepolia
          </span>
        </div>
        <div className="footer-links">
          <a
            href={`${CELO_EXPLORER}/address/${STREAMWAGE_VAULT_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            StreamWageVault
          </a>
          <a
            href={`${CELO_EXPLORER}/address/${CUSD_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            cUSD Token
          </a>
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
