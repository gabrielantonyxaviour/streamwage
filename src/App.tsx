import { useMemo, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ArrowDownToLine, BadgeCheck, CircleDollarSign, Smartphone, UserRoundCheck } from "lucide-react";
import { formatUnits, parseUnits } from "viem";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { useMiniPay } from "./hooks/useMiniPay";
import {
  CELO_SEPOLIA_CHAIN_ID,
  CELO_SEPOLIA_EXPLORER,
  CUSD_ADDRESS,
  SELF_VERIFIED_ADDRESS,
  STREAMWAGE_VAULT_ADDRESS,
  erc20Abi,
  streamWageAbi,
} from "./lib/contracts";
import { formatShortAddress, hourlyCusdToRatePerSecond } from "./lib/money";

const configuredVault = !STREAMWAGE_VAULT_ADDRESS.endsWith("0000000000000000000000000000000000000000");

function App() {
  const { address, isConnected, chainId } = useAccount();
  const { isMiniPay } = useMiniPay();
  const { writeContractAsync, isPending } = useWriteContract();

  const [worker, setWorker] = useState(SELF_VERIFIED_ADDRESS);
  const [fundAmount, setFundAmount] = useState("100");
  const [hourlyRate, setHourlyRate] = useState("2.50");
  const [streamId, setStreamId] = useState("0");
  const [lastAction, setLastAction] = useState(
    configuredVault
      ? "Verified vault deployed on Celo Sepolia. Connect a wallet to start payroll."
      : "Waiting for wallet and contract deployment.",
  );

  const parsedStreamId = streamId.trim() === "" ? 0n : BigInt(streamId.replace(/[^0-9]/g, "") || "0");

  const pendingQuery = useReadContract({
    address: STREAMWAGE_VAULT_ADDRESS,
    abi: streamWageAbi,
    functionName: "pending",
    args: [parsedStreamId],
    chainId: CELO_SEPOLIA_CHAIN_ID,
    query: { enabled: configuredVault && isConnected },
  });

  const pendingCusd = useMemo(() => {
    const value = pendingQuery.data ?? 0n;
    return Number(formatUnits(value, 18)).toLocaleString(undefined, {
      maximumFractionDigits: 4,
    });
  }, [pendingQuery.data]);

  const connectedToCelo = chainId === CELO_SEPOLIA_CHAIN_ID;

  async function approveAndFund() {
    const amount = parseUnits(fundAmount || "0", 18);
    await writeContractAsync({
      address: CUSD_ADDRESS,
      abi: erc20Abi,
      functionName: "approve",
      args: [STREAMWAGE_VAULT_ADDRESS, amount],
    });
    await writeContractAsync({
      address: STREAMWAGE_VAULT_ADDRESS,
      abi: streamWageAbi,
      functionName: "fundPayroll",
      args: [amount],
    });
    setLastAction(`Funded payroll with ${fundAmount} cUSD.`);
  }

  async function verifyWorker() {
    await writeContractAsync({
      address: STREAMWAGE_VAULT_ADDRESS,
      abi: streamWageAbi,
      functionName: "setWorkerVerification",
      args: [worker as `0x${string}`, true],
    });
    setLastAction(`Marked ${formatShortAddress(worker)} as Self verified.`);
  }

  async function createStream() {
    const ratePerSecond = hourlyCusdToRatePerSecond(hourlyRate);
    await writeContractAsync({
      address: STREAMWAGE_VAULT_ADDRESS,
      abi: streamWageAbi,
      functionName: "createStream",
      args: [worker as `0x${string}`, ratePerSecond],
    });
    setLastAction(`Created stream for ${formatShortAddress(worker)} at ${hourlyRate} cUSD/hour.`);
  }

  async function claim() {
    await writeContractAsync({
      address: STREAMWAGE_VAULT_ADDRESS,
      abi: streamWageAbi,
      functionName: "withdrawAccrued",
      args: [parsedStreamId],
    });
    setLastAction(`Claim submitted for stream #${parsedStreamId.toString()}.`);
  }

  const actionDisabled = !configuredVault || !isConnected || !connectedToCelo || isPending;

  return (
    <main className="app-shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Celo Sepolia · Mento cUSD · MiniPay</p>
          <h1>StreamWage</h1>
          <p className="lede">
            Real-time payroll streams for verified workers. Employers fund one cUSD vault;
            workers claim earned pay from MiniPay the moment it accrues.
          </p>
          <div className="proof-row" aria-label="integration status">
            <span><CircleDollarSign size={16} /> cUSD wired</span>
            <span><Smartphone size={16} /> {isMiniPay ? "MiniPay detected" : "MiniPay ready"}</span>
            <span><BadgeCheck size={16} /> Self gate</span>
          </div>
        </div>
        <div className="wallet-panel">
          {isMiniPay ? <p className="minipay-pill">MiniPay auto-connect active</p> : <ConnectButton />}
          <dl>
            <div><dt>Wallet</dt><dd>{formatShortAddress(address)}</dd></div>
            <div><dt>Network</dt><dd>{connectedToCelo ? "Celo Sepolia" : "Switch to Celo Sepolia"}</dd></div>
            <div><dt>Vault</dt><dd>{configuredVault ? formatShortAddress(STREAMWAGE_VAULT_ADDRESS) : "Deploy pending"}</dd></div>
          </dl>
        </div>
      </section>

      <section className="workspace">
        <div className="operator-panel">
          <div className="panel-heading">
            <UserRoundCheck size={20} />
            <div>
              <h2>Employer console</h2>
              <p>Fund the vault, attest a Self-verified worker, then start their stream.</p>
            </div>
          </div>
          <label>
            Worker address
            <input value={worker} onChange={(event) => setWorker(event.target.value)} placeholder="0x worker wallet" />
          </label>
          <label>
            Fund amount, cUSD
            <input inputMode="decimal" value={fundAmount} onChange={(event) => setFundAmount(event.target.value)} />
          </label>
          <button disabled={actionDisabled} onClick={approveAndFund}>
            Approve and fund payroll
          </button>
          <button disabled={actionDisabled || !worker} onClick={verifyWorker}>
            Record Self verification
          </button>
          <label>
            Wage rate, cUSD per hour
            <input inputMode="decimal" value={hourlyRate} onChange={(event) => setHourlyRate(event.target.value)} />
          </label>
          <button disabled={actionDisabled || !worker} onClick={createStream}>
            Create wage stream
          </button>
        </div>

        <div className="claim-panel">
          <div className="panel-heading">
            <ArrowDownToLine size={20} />
            <div>
              <h2>Worker claim</h2>
              <p>MiniPay-first claim flow for the worker wallet.</p>
            </div>
          </div>
          <label>
            Stream ID
            <input inputMode="numeric" value={streamId} onChange={(event) => setStreamId(event.target.value.replace(/[^0-9]/g, ""))} />
          </label>
          <div className="accrual-meter">
            <span>Claimable now</span>
            <strong>{pendingCusd} cUSD</strong>
          </div>
          <button className="claim-button" disabled={actionDisabled} onClick={claim}>
            Claim accrued cUSD
          </button>
          <p className="hint">
            {configuredVault
              ? "Use the worker wallet for MiniPay claims; employer actions require the vault owner."
              : "Contract calls require a deployed vault address in `VITE_STREAMWAGE_VAULT_ADDRESS`."}
          </p>
        </div>
      </section>

      <section className="status-strip">
        <p>{lastAction}</p>
        <a href={`${CELO_SEPOLIA_EXPLORER}/address/${CUSD_ADDRESS}`} target="_blank" rel="noreferrer">
          cUSD token
        </a>
      </section>
    </main>
  );
}

export default App;
