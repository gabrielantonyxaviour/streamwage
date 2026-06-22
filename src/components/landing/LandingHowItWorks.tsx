import { motion } from "framer-motion";

const steps = [
  {
    num: "1",
    title: "Fund payroll",
    desc: "The employer approves and deposits Mento cUSD into the StreamWage vault — the reserve every stream draws from.",
  },
  {
    num: "2",
    title: "Verify & stream",
    desc: "Each worker verifies with Self Protocol, then the employer opens a per-second cUSD stream to their wallet.",
  },
  {
    num: "3",
    title: "Claim in MiniPay",
    desc: "Workers watch wages accrue live and claim accrued cUSD to MiniPay anytime — no payday, no waiting.",
  },
];

export function LandingHowItWorks() {
  return (
    <section className="landing-how" id="how">
      <div className="landing-how-header">
        <p className="eyebrow">How it works</p>
        <h2>Three steps to payroll.</h2>
      </div>
      <div className="how-steps">
        {steps.map((s, i) => (
          <motion.div
            key={s.num}
            className="how-step"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{
              delay: i * 0.12,
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <div className="step-number">{s.num}</div>
            <h3>{s.title}</h3>
            <p>{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
