import { useState } from "react";
import { Coins } from "lucide-react";
import { parseUnits } from "viem";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import {
  STREAMWAGE_ABI,
  STREAMWAGE_VAULT_ADDRESS,
  CUSD_ADDRESS,
  ERC20_ABI,
} from "../../lib/satSalary";
import { CELO_EXPLORER } from "../../lib/wagmi";
import { fmtUnits } from "../../lib/format";
import { TxStepsDialog, type StepStatus, type TxStep } from "../TxStepsDialog";

const STEPS: TxStep[] = [
  { id: "approve", label: "Approving cUSD spend" },
  { id: "fund", label: "Funding payroll reserve" },
];

export function FundPayrollForm({ onSuccess }: { onSuccess?: () => void }) {
  const { address } = useAccount();
  const [amount, setAmount] = useState("");
  const [open, setOpen] = useState(false);
  const [statuses, setStatuses] = useState<Record<string, StepStatus>>({});
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { writeContractAsync } = useWriteContract();
  useWaitForTransactionReceipt({ hash: txHash ?? undefined });

  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: CUSD_ADDRESS,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 12000 },
  });

  const amountNum = Number(amount) || 0;
  const canSubmit = amountNum > 0;

  async function handleFund() {
    if (!canSubmit) return;
    const wei = parseUnits(amount, 18);
    setOpen(true);
    setError(null);
    setTxHash(null);
    setStatuses({ approve: "active", fund: "idle" });
    try {
      const approveHash = await writeContractAsync({
        address: CUSD_ADDRESS,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [STREAMWAGE_VAULT_ADDRESS, wei],
      });
      setTxHash(approveHash);
      setStatuses({ approve: "done", fund: "active" });

      const fundHash = await writeContractAsync({
        address: STREAMWAGE_VAULT_ADDRESS,
        abi: STREAMWAGE_ABI,
        functionName: "fundPayroll",
        args: [wei],
      });
      setTxHash(fundHash);
      setStatuses({ approve: "done", fund: "done" });
      setAmount("");
      refetchBalance();
      onSuccess?.();
    } catch (err) {
      setStatuses((s) => ({
        approve: s.approve === "done" ? "done" : "error",
        fund: s.approve === "done" ? "error" : "idle",
      }));
      setError(
        err instanceof Error ? err.message.slice(0, 160) : "Transaction failed",
      );
    }
  }

  return (
    <div className="fund-form">
      <div className="fund-form__head">
        <Coins size={18} />
        <div>
          <h4>Fund payroll</h4>
          <span>Deposit Mento cUSD into the streaming vault.</span>
        </div>
      </div>
      <div className="fund-form__row">
        <div className="trove-form__input-row">
          <input
            type="text"
            inputMode="decimal"
            placeholder="1000"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
          />
          <span className="trove-form__unit">cUSD</span>
        </div>
        <button
          className="action-btn action-btn--primary"
          onClick={handleFund}
          disabled={!canSubmit}
        >
          Fund vault
        </button>
      </div>
      <span className="fund-form__hint">
        Your balance: {fmtUnits(balance as bigint | undefined, 2)} cUSD
      </span>

      <TxStepsDialog
        open={open}
        title="Fund payroll vault"
        steps={STEPS}
        statuses={statuses}
        error={error}
        txHash={txHash}
        explorerBase={CELO_EXPLORER}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}
