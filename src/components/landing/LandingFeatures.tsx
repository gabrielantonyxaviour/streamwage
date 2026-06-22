import { motion } from "framer-motion";
import { BadgeCheck, Smartphone, Zap } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Per-second cUSD streams",
    desc: "Fund a payroll vault in Mento cUSD and stream wages to each worker by the second. Pause, resume, or add streams independently — accrual is tracked on-chain.",
  },
  {
    icon: Smartphone,
    title: "Claim in MiniPay",
    desc: "Workers open StreamWage inside MiniPay, see their wages tick up live, and claim accrued cUSD to their wallet in one tap. Mobile-first, built for the next billion.",
  },
  {
    icon: BadgeCheck,
    title: "Self-verified workers",
    desc: "Streams can only be created for workers who pass Self Protocol identity verification — enforced on-chain by the vault before any payroll begins.",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

export function LandingFeatures() {
  return (
    <section className="landing-features" id="features">
      <div className="landing-features-header">
        <p className="eyebrow">Built on Celo</p>
        <h2>Funded once. Paid every second.</h2>
        <p>Stablecoin payroll that lives in your pocket.</p>
      </div>
      <div className="features-grid">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            className="feature-card"
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={cardVariants}
          >
            <div className="feature-icon">
              <f.icon size={22} />
            </div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
