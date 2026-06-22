import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Coins } from "lucide-react";

const HERO_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260511_230229_7c9bc431-46cf-489a-948d-e8144d8eb5d4.mp4";

interface LandingHeroProps {
  totalFunded: number | null;
  activeStreams: number | null;
  onConnect: () => void;
  connecting: boolean;
}

const marqueeItems = [
  "Mento cUSD",
  "Per-second accrual",
  "Claim in MiniPay",
  "Self-verified workers",
  "On-chain payroll",
  "Pause / resume streams",
  "Mobile-first",
  "Celo Sepolia",
];

const blurUp = (delay: number) => ({
  initial: { opacity: 0, filter: "blur(20px)", y: 40 },
  animate: { opacity: 1, filter: "blur(0px)", y: 0 },
  transition: {
    duration: 1,
    ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    delay,
  },
});

export function LandingHero({
  totalFunded,
  activeStreams,
  onConnect,
  connecting,
}: LandingHeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    videoRef.current?.play().catch(() => {});
  }, []);

  return (
    <section className="landing-hero">
      <div className="hero-video-wrap">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="hero-video"
        >
          <source src={HERO_VIDEO} type="video/mp4" />
        </video>
      </div>

      <div className="hero-blur-mask" />
      <div className="hero-center-blob" />
      <div className="hero-grain" />

      <div className="hero-content">
        <motion.div className="hero-badge" {...blurUp(0.1)}>
          <span className="hero-badge-dot" />
          Celo Sepolia — Live
        </motion.div>

        <motion.h1 {...blurUp(0.25)}>
          Stream salaries in <em>cUSD</em>, claimable in MiniPay.
        </motion.h1>

        <motion.p className="hero-sub" {...blurUp(0.4)}>
          Fund a payroll vault with Mento cUSD and pay your team by the second.
          Workers verify once with Self and claim accrued wages anytime —
          straight to their MiniPay wallet.
        </motion.p>

        <motion.div className="hero-cta-row" {...blurUp(0.55)}>
          <button
            className="hero-cta liquid-glass-btn"
            onClick={onConnect}
            disabled={connecting}
          >
            {connecting ? "Connecting…" : "Launch app"}
            <ArrowRight size={18} />
          </button>
        </motion.div>

        <motion.div className="hero-oracle" {...blurUp(0.7)}>
          <span>
            <Coins size={14} style={{ verticalAlign: "middle" }} /> Total
            funded:{" "}
            <strong>
              {totalFunded !== null
                ? `${totalFunded.toLocaleString(undefined, { maximumFractionDigits: 0 })} cUSD`
                : "—"}
            </strong>
          </span>
          <span className="hero-oracle-divider" />
          <span>
            Active streams:{" "}
            <strong>{activeStreams !== null ? activeStreams : "—"}</strong>
          </span>
          <span className="hero-oracle-divider" />
          <span>
            Chain: <strong>Celo Sepolia (11142220)</strong>
          </span>
        </motion.div>
      </div>

      <motion.div className="landing-marquee" {...blurUp(0.85)}>
        <div className="marquee-inner">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i}>{item}</span>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
