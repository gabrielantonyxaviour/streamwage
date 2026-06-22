import { useEffect, useState } from "react";
import { useReadContracts } from "wagmi";
import { LandingHero } from "../components/landing/LandingHero";
import { LandingFeatures } from "../components/landing/LandingFeatures";
import { LandingHowItWorks } from "../components/landing/LandingHowItWorks";
import { LandingFooter } from "../components/landing/LandingFooter";
import {
  STREAMWAGE_ABI,
  STREAMWAGE_VAULT_ADDRESS,
  CONTRACTS_CONFIGURED,
} from "../lib/satSalary";
import { toNumber } from "../lib/format";

const GITHUB_URL = "https://github.com/gabrielantonyxaviour/streamwage";

interface LandingPageProps {
  onConnect: () => void;
  connecting: boolean;
}

const VAULT = {
  address: STREAMWAGE_VAULT_ADDRESS,
  abi: STREAMWAGE_ABI,
} as const;

export function LandingPage({ onConnect, connecting }: LandingPageProps) {
  const [scrolled, setScrolled] = useState(false);

  // Live vault stats — readable on the landing page before connecting.
  const { data } = useReadContracts({
    contracts: [
      { ...VAULT, functionName: "totalFunded" },
      { ...VAULT, functionName: "nextStreamId" },
    ],
    query: { enabled: CONTRACTS_CONFIGURED, refetchInterval: 20000 },
  });

  const totalFunded =
    data?.[0]?.result !== undefined ? toNumber(data[0].result as bigint) : null;
  const activeStreams =
    data?.[1]?.result !== undefined ? Number(data[1].result as bigint) : null;

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 40);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div>
      <nav className={`landing-nav ${scrolled ? "landing-nav--scrolled" : ""}`}>
        <div className="landing-brand">
          <div className="landing-brand-mark">
            <img src="/logo-mark.png" alt="StreamWage logo" />
          </div>
          StreamWage
        </div>
        <div className="landing-nav-links">
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </div>
        <button className="nav-connect-btn" onClick={onConnect}>
          {connecting ? "Connecting…" : "Launch app"}
        </button>
      </nav>
      <LandingHero
        totalFunded={totalFunded}
        activeStreams={activeStreams}
        onConnect={onConnect}
        connecting={connecting}
      />
      <LandingFeatures />
      <LandingHowItWorks />
      <LandingFooter />
    </div>
  );
}
