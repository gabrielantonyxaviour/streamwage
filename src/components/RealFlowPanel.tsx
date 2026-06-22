import { useMemo, useState } from "react";
import {
  useAccount,
  useReadContracts,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { ArrowUpRight, Pause, Play, Wallet } from "lucide-react";
import { STREAMWAGE_ABI, STREAMWAGE_VAULT_ADDRESS } from "../lib/satSalary";
import { CELO_EXPLORER } from "../lib/wagmi";
import { fmtUnits, ratePerSecondToMonthly, toNumber } from "../lib/format";
import { lookupName } from "../lib/profileApi";
import { TxStepsDialog, type StepStatus, type TxStep } from "./TxStepsDialog";
import { TreasuryGauge } from "./TreasuryGauge";

const VAULT = {
  address: STREAMWAGE_VAULT_ADDRESS,
  abi: STREAMWAGE_ABI,
} as const;

interface StreamRow {
  id: number;
  payee: `0x${string}`;
  ratePerSecond: bigint;
  paused: boolean;
  pending: bigint;
}

interface RealFlowPanelProps {
  view?: "dashboard" | "treasury" | "team" | "earnings";
  isOwner?: boolean;
  gasBlocked?: boolean;
}

export function RealFlowPanel({
  view = "dashboard",
  isOwner = false,
  gasBlocked = false,
}: RealFlowPanelProps) {
  const { address } = useAccount();

  // --- Live vault reads ---
  const { data: core, refetch: refetchCore } = useReadContracts({
    contracts: [
      { ...VAULT, functionName: "payrollReserve" },
      { ...VAULT, functionName: "totalFunded" },
      { ...VAULT, functionName: "totalStreamRate" },
      { ...VAULT, functionName: "nextStreamId" },
    ],
    query: { refetchInterval: 12000 },
  });

  const reserve = core?.[0]?.result as bigint | undefined;
  const funded = core?.[1]?.result as bigint | undefined;
  const totalRate = core?.[2]?.result as bigint | undefined;
  const streamCount = Number((core?.[3]?.result as bigint | undefined) ?? 0n);

  const reserveCusd = toNumber(reserve);
  const fundedCusd = toNumber(funded);
  const claimedCusd = Math.max(0, fundedCusd - reserveCusd);
  const ratePerSec = toNumber(totalRate);
  const monthlyOutflow = ratePerSec * 2592000;
  const dailyOutflow = ratePerSec * 86400;
  const runwayDays = ratePerSec > 0 ? reserveCusd / dailyOutflow : null;

  // --- Stream rows: streams(i) + pending(i) ---
  const streamContracts = useMemo(() => {
    const c = [];
    for (let i = 0; i < streamCount; i++) {
      c.push({ ...VAULT, functionName: "streams", args: [BigInt(i)] } as const);
      c.push({ ...VAULT, functionName: "pending", args: [BigInt(i)] } as const);
    }
    return c;
  }, [streamCount]);

  const { data: streamData, refetch: refetchStreams } = useReadContracts({
    contracts: streamContracts,
    query: { enabled: streamCount > 0, refetchInterval: 8000 },
  });

  const streams: StreamRow[] = useMemo(() => {
    if (!streamData) return [];
    const rows: StreamRow[] = [];
    for (let i = 0; i < streamCount; i++) {
      const s = streamData[i * 2]?.result as
        | readonly [`0x${string}`, bigint, bigint, bigint, boolean, boolean]
        | undefined;
      const pending =
        (streamData[i * 2 + 1]?.result as bigint | undefined) ?? 0n;
      if (!s || !s[5]) continue;
      rows.push({
        id: i,
        payee: s[0],
        ratePerSecond: s[1],
        paused: s[4],
        pending,
      });
    }
    return rows;
  }, [streamData, streamCount]);

  // --- Tx plumbing ---
  const { writeContractAsync } = useWriteContract();
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [dialog, setDialog] = useState<{
    title: string;
    steps: TxStep[];
  } | null>(null);
  const [statuses, setStatuses] = useState<Record<string, StepStatus>>({});
  const [txError, setTxError] = useState<string | null>(null);
  useWaitForTransactionReceipt({ hash: txHash ?? undefined });

  async function runTx(
    title: string,
    stepId: string,
    label: string,
    send: () => Promise<`0x${string}`>,
  ) {
    setDialog({ title, steps: [{ id: stepId, label }] });
    setStatuses({ [stepId]: "active" });
    setTxError(null);
    setTxHash(null);
    try {
      const hash = await send();
      setTxHash(hash);
      setStatuses({ [stepId]: "done" });
      refetchCore();
      refetchStreams();
    } catch (err) {
      setStatuses({ [stepId]: "error" });
      setTxError(
        err instanceof Error ? err.message.slice(0, 160) : "Transaction failed",
      );
    }
  }

  function claim(streamId: number) {
    runTx(
      "Claim streamed cUSD",
      "claim",
      "Transferring cUSD to your wallet",
      () =>
        writeContractAsync({
          ...VAULT,
          functionName: "withdrawAccrued",
          args: [BigInt(streamId)],
        }),
    );
  }

  function pause(streamId: number) {
    runTx("Pause stream", "pause", "Pausing accrual on-chain", () =>
      writeContractAsync({
        ...VAULT,
        functionName: "pauseStream",
        args: [BigInt(streamId)],
      }),
    );
  }

  function resume(streamId: number) {
    runTx("Resume stream", "resume", "Resuming accrual on-chain", () =>
      writeContractAsync({
        ...VAULT,
        functionName: "resumeStream",
        args: [BigInt(streamId)],
      }),
    );
  }

  const showTreasury = view === "dashboard" || view === "treasury";
  const showStreams =
    view === "dashboard" || view === "team" || view === "earnings";
  const showOnlyMine = view === "earnings";

  const headings: Record<string, string> = {
    dashboard: "Payroll Overview",
    treasury: "Treasury",
    team: "Team Management",
    earnings: "My Earnings",
  };

  const displayStreams = showOnlyMine
    ? streams.filter(
        (s) => !!address && s.payee.toLowerCase() === address.toLowerCase(),
      )
    : streams;

  return (
    <section className="real-flow">
      <div className="real-flow__header">
        <div>
          <p className="eyebrow">Live on Celo Sepolia</p>
          <h3>{headings[view] ?? "Overview"}</h3>
        </div>
        <a
          className="real-flow__contract"
          href={`${CELO_EXPLORER}/address/${STREAMWAGE_VAULT_ADDRESS}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {STREAMWAGE_VAULT_ADDRESS.slice(0, 6)}…
          {STREAMWAGE_VAULT_ADDRESS.slice(-4)}
          <ArrowUpRight size={13} />
        </a>
      </div>

      {showTreasury && (
        <>
          <div className="real-flow__treasury">
            <TreasuryGauge runwayDays={runwayDays} />
            <div className="real-flow__valuation">
              <div className="real-flow__bigval">
                <span>Payroll reserve</span>
                <strong>
                  {fmtUnits(reserve, 2)}{" "}
                  <em style={{ fontWeight: 500 }}>cUSD</em>
                </strong>
                <em>{fmtUnits(funded, 0)} cUSD funded all-time</em>
              </div>
              <div className="real-flow__valgrid">
                <div>
                  <span>Monthly outflow</span>
                  <strong>
                    {monthlyOutflow.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}
                  </strong>
                </div>
                <div>
                  <span>Claimed to date</span>
                  <strong>
                    {claimedCusd.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </strong>
                </div>
                <div>
                  <span>Payroll runway</span>
                  <strong>
                    {runwayDays !== null
                      ? `${runwayDays.toFixed(0)} days`
                      : "∞"}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          <div className="real-flow__metrics">
            <div>
              <span>Active streams</span>
              <strong>{streams.length}</strong>
            </div>
            <div>
              <span>Total rate</span>
              <strong>{(ratePerSec * 3600).toFixed(2)} /hr</strong>
            </div>
            <div>
              <span>Reserve</span>
              <strong>{fmtUnits(reserve, 0)} cUSD</strong>
            </div>
            <div>
              <span>Funded</span>
              <strong>{fmtUnits(funded, 0)} cUSD</strong>
            </div>
          </div>
        </>
      )}

      {showStreams && (
        <div className="real-flow__streams">
          <h4>
            {showOnlyMine ? "Your salary streams" : "All payroll streams"}{" "}
            <span>
              {showOnlyMine
                ? `${displayStreams.length} stream${displayStreams.length !== 1 ? "s" : ""}`
                : `${streams.length} active · ${monthlyOutflow.toFixed(0)} cUSD/mo`}
            </span>
          </h4>
          {displayStreams.length === 0 && (
            <p className="real-flow__empty">
              {showOnlyMine
                ? "No salary streams for your wallet yet. Share your address with your employer to get added."
                : isOwner
                  ? "No streams yet. Verify a worker and create one from the Team tab."
                  : "No active streams on this vault yet."}
            </p>
          )}
          {displayStreams.map((s) => {
            const mine =
              !!address && s.payee.toLowerCase() === address.toLowerCase();
            const profile = lookupName(s.payee);
            return (
              <div
                key={s.id}
                className={`real-flow__stream ${mine ? "is-mine" : ""}`}
              >
                <div>
                  <span className="real-flow__payee">
                    {profile?.name ||
                      `${s.payee.slice(0, 6)}…${s.payee.slice(-4)}`}
                    {profile?.role && (
                      <em
                        style={{ color: "var(--text-muted)", fontWeight: 400 }}
                      >
                        {" · "}
                        {profile.role}
                      </em>
                    )}
                    {mine && <em> (you)</em>}
                  </span>
                  <span className="real-flow__rate">
                    {ratePerSecondToMonthly(s.ratePerSecond).toLocaleString(
                      undefined,
                      { maximumFractionDigits: 0 },
                    )}{" "}
                    cUSD/mo{s.paused && " · paused"}
                  </span>
                </div>
                <div className="real-flow__claimable">
                  <span>{fmtUnits(s.pending, 4)} cUSD</span>
                  {mine && (
                    <button
                      className="action-btn action-btn--primary"
                      onClick={() => claim(s.id)}
                      disabled={s.pending === 0n || gasBlocked}
                    >
                      <Wallet size={14} /> Claim
                    </button>
                  )}
                  {isOwner && !mine && (
                    <button
                      className="action-btn action-btn--secondary"
                      onClick={() => (s.paused ? resume(s.id) : pause(s.id))}
                      disabled={gasBlocked}
                    >
                      {s.paused ? <Play size={14} /> : <Pause size={14} />}
                      {s.paused ? "Resume" : "Pause"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <TxStepsDialog
        open={!!dialog}
        title={dialog?.title ?? ""}
        steps={dialog?.steps ?? []}
        statuses={statuses}
        error={txError}
        txHash={txHash}
        explorerBase={CELO_EXPLORER}
        onClose={() => setDialog(null)}
      />
    </section>
  );
}
