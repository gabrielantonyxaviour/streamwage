interface TreasuryGaugeProps {
  runwayDays: number | null; // payroll reserve ÷ daily outflow
}

// Semicircular gauge mapping payroll runway (0–90 days) onto a 180° arc, with
// danger (<7d) / warning (<30d) / safe (≥30d) zones and a needle at the live
// runway. Replaces the source's collateral-health gauge — StreamWage has no
// collateral, so "how long can payroll last" is the meaningful risk metric.
export function TreasuryGauge({ runwayDays }: TreasuryGaugeProps) {
  const MIN = 0;
  const MAX = 90;
  const DANGER = 7;
  const WARN = 30;
  const clamp = (v: number) => Math.max(MIN, Math.min(MAX, v));
  const toAngle = (v: number) => 180 - ((clamp(v) - MIN) / (MAX - MIN)) * 180;
  const polar = (cx: number, cy: number, r: number, deg: number) => {
    const rad = (deg * Math.PI) / 180;
    return [cx + r * Math.cos(rad), cy - r * Math.sin(rad)] as const;
  };
  const arc = (start: number, end: number, r = 80) => {
    const [x1, y1] = polar(100, 100, r, start);
    const [x2, y2] = polar(100, 100, r, end);
    const large = Math.abs(start - end) > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  };

  const dangerEnd = toAngle(DANGER);
  const warnEnd = toAngle(WARN);
  const needle = runwayDays !== null ? toAngle(clamp(runwayDays)) : null;
  const safe = runwayDays !== null && runwayDays >= WARN;
  const warn = runwayDays !== null && runwayDays >= DANGER && runwayDays < WARN;
  const infinite = runwayDays === null;

  const readout =
    runwayDays === null
      ? "∞"
      : runwayDays >= MAX
        ? "90+ d"
        : `${runwayDays.toFixed(0)} d`;

  return (
    <div className="gauge">
      <svg viewBox="0 0 200 116" className="gauge__svg" aria-hidden="true">
        <path
          d={arc(180, dangerEnd)}
          className="gauge__zone gauge__zone--danger"
        />
        <path
          d={arc(dangerEnd, warnEnd)}
          className="gauge__zone gauge__zone--warn"
        />
        <path d={arc(warnEnd, 0)} className="gauge__zone gauge__zone--safe" />
        {needle !== null && (
          <>
            <line
              x1="100"
              y1="100"
              x2={polar(100, 100, 72, needle)[0]}
              y2={polar(100, 100, 72, needle)[1]}
              className="gauge__needle"
            />
            <circle cx="100" cy="100" r="5" className="gauge__hub" />
          </>
        )}
      </svg>
      <div className="gauge__readout">
        <strong
          className={
            infinite
              ? "is-safe"
              : safe
                ? "is-safe"
                : warn
                  ? "is-warn"
                  : "is-danger"
          }
        >
          {readout}
        </strong>
        <span>payroll runway</span>
      </div>
      <div className="gauge__legend">
        <span>
          <i className="gauge__dot gauge__dot--danger" /> &lt;7d
        </span>
        <span>
          <i className="gauge__dot gauge__dot--warn" /> &lt;30d
        </span>
        <span>
          <i className="gauge__dot gauge__dot--safe" /> 30d+
        </span>
      </div>
    </div>
  );
}
