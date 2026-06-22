import { Check, Loader2, X } from "lucide-react";

export type StepStatus = "idle" | "active" | "done" | "error";

export interface TxStep {
  id: string;
  label: string;
}

interface TxStepsDialogProps {
  open: boolean;
  title: string;
  steps: TxStep[];
  statuses: Record<string, StepStatus>;
  error?: string | null;
  txHash?: string | null;
  explorerBase: string;
  onClose: () => void;
  onRetry?: () => void;
}

export function TxStepsDialog({
  open,
  title,
  steps,
  statuses,
  error,
  txHash,
  explorerBase,
  onClose,
  onRetry,
}: TxStepsDialogProps) {
  if (!open) return null;
  const inProgress = steps.some((s) => statuses[s.id] === "active");
  const failed = steps.some((s) => statuses[s.id] === "error");

  return (
    // pointer-events-none on overlay so Privy/wallet modals (higher z-index)
    // stay clickable while a signature is requested.
    <div className="tx-dialog-overlay">
      <div className="tx-dialog">
        <div className="tx-dialog__header">
          <h3>{title}</h3>
          {!inProgress && (
            <button
              className="tx-dialog__close"
              onClick={onClose}
              aria-label="Close"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <ul className="tx-steps">
          {steps.map((s) => {
            const st = statuses[s.id] ?? "idle";
            return (
              <li key={s.id} className={`tx-step tx-step--${st}`}>
                <span className="tx-step__icon">
                  {st === "active" && <Loader2 size={16} className="tx-spin" />}
                  {st === "done" && <Check size={16} />}
                  {st === "error" && <X size={16} />}
                  {st === "idle" && <span className="tx-step__dot" />}
                </span>
                <span className="tx-step__label">{s.label}</span>
              </li>
            );
          })}
        </ul>
        {error && <p className="tx-dialog__error">{error}</p>}
        {txHash && (
          <a
            className="tx-dialog__link"
            href={`${explorerBase}/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on explorer ↗
          </a>
        )}
        {failed && (
          <div className="tx-dialog__actions">
            {onRetry && (
              <button
                className="action-btn action-btn--primary"
                onClick={onRetry}
              >
                Try again
              </button>
            )}
            <button
              className="action-btn action-btn--secondary"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
