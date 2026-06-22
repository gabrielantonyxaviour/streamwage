import { CirclePause, CirclePlay, WalletCards } from "lucide-react";
import { formatCusd } from "../lib/format";
import type { WorkerStream } from "../types";

// Presentational card for a single on-chain payroll stream. Employer view wires
// pause/resume; worker view sees their own accrual.
export function WorkerCard({
  worker,
  onPause,
  onResume,
  canControl = false,
  gasBlocked = false,
}: {
  worker: WorkerStream;
  onPause: () => void;
  onResume: () => void;
  canControl?: boolean;
  gasBlocked?: boolean;
}) {
  const status = worker.paused ? "paused" : "streaming";
  const buttonLabel = gasBlocked
    ? "Insufficient gas"
    : worker.paused
      ? "Resume stream"
      : "Pause stream";

  return (
    <article className="worker-card" data-testid={`worker-${worker.id}`}>
      <div className="worker-card__top">
        <div>
          <p className="eyebrow">{worker.mine ? "You" : "Team member"}</p>
          <h3>{worker.name}</h3>
          <span>{worker.role ?? "Worker"}</span>
        </div>
        <span className={`status-chip status-chip--${status}`}>{status}</span>
      </div>
      <div className="stream-meter">
        <div style={{ transform: `scaleX(${worker.paused ? 0.46 : 0.82})` }} />
      </div>
      <div className="worker-stats">
        <div>
          <span>Accrued</span>
          <strong>{formatCusd(worker.accruedCusd, 4)}</strong>
        </div>
        <div>
          <span>Rate</span>
          <strong>{formatCusd(worker.monthlyCusd, 0)}/mo</strong>
        </div>
      </div>
      <div className="worker-wallet">
        <WalletCards size={14} />
        <span>{worker.wallet}</span>
      </div>
      {canControl && (
        <button
          className="worker-action-btn"
          type="button"
          onClick={worker.paused ? onResume : onPause}
          disabled={gasBlocked}
          title={gasBlocked ? "Claim testnet CELO for gas first." : undefined}
        >
          {worker.paused ? <CirclePlay size={16} /> : <CirclePause size={16} />}
          {buttonLabel}
        </button>
      )}
    </article>
  );
}
