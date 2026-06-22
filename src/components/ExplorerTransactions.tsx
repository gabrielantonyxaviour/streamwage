import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { formatUnits } from "viem";
import { ArrowUpRight } from "lucide-react";
import { STREAMWAGE_ABI, STREAMWAGE_VAULT_ADDRESS } from "../lib/satSalary";
import { CELO_EXPLORER } from "../lib/wagmi";

const FROM_BLOCK = 28861000n;
const CHUNK = 9000n;

type TxType = "payroll" | "salary" | "stream" | "identity";

interface TxItem {
  key: string;
  type: TxType;
  label: string;
  detail: string;
  txHash: string;
  block: bigint;
}

const TYPE_META: Record<TxType, { badge: string; color: string }> = {
  payroll: { badge: "Payroll", color: "#35D07F" },
  salary: { badge: "Salary", color: "#60a5fa" },
  stream: { badge: "Stream", color: "#34d399" },
  identity: { badge: "Identity", color: "#FBCC5C" },
};

function short(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}
function cusd(v: bigint, d = 2) {
  return `${Number(formatUnits(v, 18)).toFixed(d)} cUSD`;
}

function classify(
  name: string,
  args: Record<string, unknown>,
): [TxType, string, string] {
  switch (name) {
    case "PayrollFunded":
      return [
        "payroll",
        "Funded payroll reserve",
        `${cusd(args.amount as bigint, 0)} · reserve ${cusd(args.reserve as bigint, 0)}`,
      ];
    case "WorkerVerificationSet":
      return [
        "identity",
        (args.verified as boolean)
          ? "Worker verified (Self)"
          : "Worker verification revoked",
        short(args.worker as string),
      ];
    case "StreamCreated":
      return [
        "stream",
        "Created salary stream",
        `Worker ${short(args.worker as string)}`,
      ];
    case "Claimed":
      return [
        "salary",
        "Salary payout claimed",
        `${cusd(args.amount as bigint)} → ${short(args.worker as string)}`,
      ];
    case "StreamPaused":
      return ["stream", "Paused stream", `Stream #${args.streamId}`];
    case "StreamResumed":
      return ["stream", "Resumed stream", `Stream #${args.streamId}`];
    default:
      return ["payroll", name, ""];
  }
}

const ALL_TYPES: TxType[] = ["payroll", "salary", "stream", "identity"];

export function ExplorerTransactions() {
  const client = usePublicClient();
  const [items, setItems] = useState<TxItem[]>([]);
  const [filter, setFilter] = useState<TxType | "all">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!client) return;
    let cancelled = false;
    async function load() {
      try {
        const latest = await client!.getBlockNumber();
        let from = FROM_BLOCK;
        const all: Array<Record<string, any>> = [];
        while (from <= latest) {
          const to = from + CHUNK > latest ? latest : from + CHUNK;
          const part = await client!.getContractEvents({
            address: STREAMWAGE_VAULT_ADDRESS,
            abi: STREAMWAGE_ABI,
            fromBlock: from,
            toBlock: to,
          });
          all.push(...part);
          from = to + 1n;
        }
        if (cancelled) return;
        const mapped: TxItem[] = all
          .map((l, i) => {
            const eventName = (l as { eventName: string }).eventName;
            const args = (l as { args?: Record<string, unknown> }).args ?? {};
            const [type, label, detail] = classify(eventName, args);
            return {
              key: `${l.transactionHash}-${l.logIndex ?? i}`,
              type,
              label,
              detail,
              txHash: l.transactionHash!,
              block: l.blockNumber!,
            };
          })
          .sort((a, b) => Number(b.block - a.block));
        setItems(mapped);
      } catch {
        /* transient RPC error */
      }
      setLoading(false);
    }
    load();
    const t = setInterval(load, 15000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [client]);

  const filtered =
    filter === "all" ? items : items.filter((i) => i.type === filter);

  const typeCounts = items.reduce(
    (acc, i) => {
      acc[i.type] = (acc[i.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div className="explorer-txs">
      <div className="explorer-txs__header">
        <h4>Transaction history</h4>
        <span className="explorer-txs__count">
          {items.length} on-chain events
        </span>
      </div>

      <div className="explorer-txs__filters">
        <button
          className={`explorer-txs__filter ${filter === "all" ? "is-active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All ({items.length})
        </button>
        {ALL_TYPES.filter((t) => typeCounts[t]).map((t) => (
          <button
            key={t}
            className={`explorer-txs__filter ${filter === t ? "is-active" : ""}`}
            onClick={() => setFilter(t)}
            style={
              { "--filter-color": TYPE_META[t].color } as React.CSSProperties
            }
          >
            {TYPE_META[t].badge} ({typeCounts[t]})
          </button>
        ))}
      </div>

      {loading && (
        <p className="explorer-txs__empty">Loading on-chain events…</p>
      )}
      {!loading && filtered.length === 0 && (
        <p className="explorer-txs__empty">No transactions found.</p>
      )}

      <div className="explorer-txs__list">
        {filtered.map((it) => (
          <a
            key={it.key}
            className="explorer-tx-row"
            href={`${CELO_EXPLORER}/tx/${it.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span
              className="explorer-tx-row__badge"
              style={{ background: TYPE_META[it.type].color }}
            >
              {TYPE_META[it.type].badge}
            </span>
            <div className="explorer-tx-row__main">
              <span className="explorer-tx-row__label">{it.label}</span>
              <span className="explorer-tx-row__detail">{it.detail}</span>
            </div>
            <div className="explorer-tx-row__meta">
              <span>#{it.block.toString()}</span>
              <ArrowUpRight size={12} />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
