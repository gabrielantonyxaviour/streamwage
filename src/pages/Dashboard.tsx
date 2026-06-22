import { Coins, LogOut } from "lucide-react";
import { useBalance } from "wagmi";
import { RealFlowPanel } from "../components/RealFlowPanel";
import { ActivityFeed } from "../components/ActivityFeed";

interface DashboardProps {
  account: string;
  isOwner?: boolean;
  onDisconnect: () => void;
}

function shortAddr(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function formatCelo(wei: bigint): string {
  const whole = wei / 10n ** 18n;
  const frac = (wei % 10n ** 18n).toString().padStart(18, "0").slice(0, 4);
  return `${whole}.${frac}`;
}

// Compact single-column dashboard variant (the AppShell is the primary layout).
export function Dashboard({
  account,
  isOwner = false,
  onDisconnect,
}: DashboardProps) {
  const { data: balance, isLoading } = useBalance({
    address: account as `0x${string}`,
  });
  const gasWei = balance?.value ?? 0n;

  return (
    <div>
      <nav className="dash-nav">
        <div className="dash-brand">
          <div className="dash-brand-mark">
            <img src="/logo-mark.png" alt="StreamWage logo" />
          </div>
          StreamWage
        </div>
        <div className="dash-wallet-area">
          {!isLoading && balance !== undefined && (
            <div className="dash-balance-pill">
              <Coins size={14} />
              <span>{formatCelo(gasWei)} CELO</span>
            </div>
          )}
          <div className="dash-wallet-pill">
            <span className="dash-wallet-addr">{shortAddr(account)}</span>
            <button className="dash-disconnect" onClick={onDisconnect}>
              <LogOut size={12} /> Disconnect
            </button>
          </div>
        </div>
      </nav>

      <div className="dash-container">
        <RealFlowPanel view="dashboard" isOwner={isOwner} />
        <ActivityFeed />
      </div>
    </div>
  );
}
