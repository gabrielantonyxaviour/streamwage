import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { formatUnits } from "viem";
import { ArrowUpRight } from "lucide-react";
import { STREAMWAGE_ABI, STREAMWAGE_VAULT_ADDRESS } from "../lib/satSalary";
import { CELO_EXPLORER } from "../lib/wagmi";

// StreamWageVault deployed on Celo Sepolia around this block — start scanning
// here so we never sweep the whole chain.
const FROM_BLOCK = 28861000n;
const CHUNK = 9000n;

interface FeedItem {
  key: string;
  label: string;
  detail: string;
  txHash: string;
  block: bigint;
}

function short(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}
function cusd(v: bigint, d = 2) {
  return `${Number(formatUnits(v, 18)).toFixed(d)} cUSD`;
}

function describe(
  name: string,
  args: Record<string, unknown>,
): [string, string] {
  switch (name) {
    case "PayrollFunded":
      return ["Payroll funded", cusd(args.amount as bigint, 0)];
    case "WorkerVerificationSet":
      return [
        (args.verified as boolean) ? "Worker verified" : "Worker unverified",
        short(args.worker as string),
      ];
    case "StreamCreated":
      return ["Stream created", `→ ${short(args.worker as string)}`];
    case "Claimed":
      return [
        "Salary claimed",
        `${cusd(args.amount as bigint)} by ${short(args.worker as string)}`,
      ];
    case "StreamPaused":
      return ["Stream paused", `#${args.streamId}`];
    case "StreamResumed":
      return ["Stream resumed", `#${args.streamId}`];
    default:
      return [name, ""];
  }
}

export function ActivityFeed() {
  const client = usePublicClient();
  const [items, setItems] = useState<FeedItem[]>([]);

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
        const mapped: FeedItem[] = all
          .map((l, i) => {
            const [label, detail] = describe(
              (l as { eventName: string }).eventName,
              (l as { args?: Record<string, unknown> }).args ?? {},
            );
            return {
              key: `${l.transactionHash}-${l.logIndex ?? i}`,
              label,
              detail,
              txHash: l.transactionHash!,
              block: l.blockNumber!,
            };
          })
          .sort((a, b) => Number(b.block - a.block));
        setItems(mapped);
      } catch {
        // transient RPC error — keep last good state
      }
    }
    load();
    const t = setInterval(load, 15000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [client]);

  return (
    <div className="activity-feed">
      <div className="activity-feed__header">
        <h3>On-chain activity</h3>
        <span>{items.length} events · live from Celo Sepolia</span>
      </div>
      {items.length === 0 && (
        <p className="activity-feed__empty">Loading on-chain events…</p>
      )}
      <div className="activity-feed__list">
        {items.map((it) => (
          <a
            key={it.key}
            className="activity-row"
            href={`${CELO_EXPLORER}/tx/${it.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="activity-row__main">
              <span className="activity-row__label">{it.label}</span>
              <span className="activity-row__detail">{it.detail}</span>
            </div>
            <div className="activity-row__meta">
              <span>#{it.block.toString()}</span>
              <ArrowUpRight size={12} />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
