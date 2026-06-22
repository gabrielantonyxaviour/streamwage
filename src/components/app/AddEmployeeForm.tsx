import { useState } from "react";
import { ArrowRight, Check, UserPlus } from "lucide-react";
import { useReadContract, useWriteContract } from "wagmi";
import { STREAMWAGE_ABI, STREAMWAGE_VAULT_ADDRESS } from "../../lib/satSalary";
import { monthlyToRatePerSecond } from "../../lib/format";
import { saveProfileRemote } from "../../lib/profileApi";
import { SelfVerifyPanel } from "./SelfVerifyPanel";

interface AddEmployeeFormProps {
  isOwner: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AddEmployeeForm({
  isOwner,
  onSuccess,
  onCancel,
}: AddEmployeeFormProps) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [address, setAddress] = useState("");
  const [monthly, setMonthly] = useState("");
  const [txState, setTxState] = useState<
    "idle" | "pending" | "success" | "error"
  >("idle");
  const [txError, setTxError] = useState<string | null>(null);

  const { writeContractAsync } = useWriteContract();

  const monthlyNum = Number(monthly) || 0;
  const isValidAddr = /^0x[0-9a-fA-F]{40}$/.test(address);
  const worker = (isValidAddr ? address : "0x") as `0x${string}`;

  const { data: verified } = useReadContract({
    address: STREAMWAGE_VAULT_ADDRESS,
    abi: STREAMWAGE_ABI,
    functionName: "isVerifiedWorker",
    args: [worker],
    query: { enabled: isValidAddr, refetchInterval: 8000 },
  });

  const canSubmit =
    name.trim() && isValidAddr && monthlyNum > 0 && Boolean(verified);

  async function handleSubmit() {
    if (!canSubmit) return;
    setTxState("pending");
    setTxError(null);
    try {
      const rate = monthlyToRatePerSecond(monthlyNum);
      await writeContractAsync({
        address: STREAMWAGE_VAULT_ADDRESS,
        abi: STREAMWAGE_ABI,
        functionName: "createStream",
        args: [worker, rate],
      });
      await saveProfileRemote(address, {
        role: "employee",
        personName: name.trim(),
        jobTitle: role.trim(),
      });
      setTxState("success");
      setTimeout(onSuccess, 1600);
    } catch (err) {
      setTxState("error");
      setTxError(
        err instanceof Error ? err.message.slice(0, 140) : "Transaction failed",
      );
    }
  }

  if (txState === "success") {
    return (
      <div className="add-employee">
        <div className="onboarding__welcome-icon">
          <Check size={28} />
        </div>
        <h3>Employee added!</h3>
        <p>
          {name} is now receiving {monthlyNum.toLocaleString()} cUSD/month via a
          real-time payroll stream.
        </p>
      </div>
    );
  }

  return (
    <div className="add-employee">
      <div className="add-employee__header">
        <UserPlus size={20} />
        <h3>Add team member</h3>
      </div>

      <div className="add-employee__form">
        <div className="add-employee__row">
          <div className="onboarding__field">
            <label>Name</label>
            <input
              type="text"
              placeholder="Jordan Lee"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="onboarding__field">
            <label>Role / Title</label>
            <input
              type="text"
              placeholder="Frontend Engineer"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>
        </div>

        <div className="onboarding__field">
          <label>Wallet address</label>
          <input
            type="text"
            placeholder="0x…"
            value={address}
            onChange={(e) => setAddress(e.target.value.trim())}
            style={{ fontFamily: "'SF Mono', monospace" }}
          />
        </div>

        <div className="onboarding__field">
          <label>Monthly salary (cUSD)</label>
          <div className="trove-form__input-row">
            <input
              type="text"
              inputMode="decimal"
              placeholder="3000"
              value={monthly}
              onChange={(e) =>
                setMonthly(e.target.value.replace(/[^0-9.]/g, ""))
              }
            />
            <span className="trove-form__unit">cUSD/mo</span>
          </div>
        </div>

        {isValidAddr && <SelfVerifyPanel worker={worker} isOwner={isOwner} />}

        {txError && <div className="trove-form__error">{txError}</div>}

        <div className="add-employee__actions">
          <button
            className="onboarding__back"
            onClick={onCancel}
            disabled={txState === "pending"}
          >
            Cancel
          </button>
          <button
            className="onboarding__next"
            onClick={handleSubmit}
            disabled={!canSubmit || txState === "pending"}
            title={
              isValidAddr && !verified
                ? "Worker must pass Self verification first."
                : undefined
            }
          >
            {txState === "pending" ? "Creating stream…" : "Create stream"}
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
