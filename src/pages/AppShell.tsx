import { useEffect, useState } from "react";
import {
  ArrowRight,
  Coins,
  Compass,
  Droplet,
  LayoutDashboard,
  LogOut,
  Activity as ActivityIcon,
  Plus,
  Users,
  Wallet,
} from "lucide-react";
import { useAccount, useBalance, useDisconnect, useReadContract } from "wagmi";
import { RealFlowPanel } from "../components/RealFlowPanel";
import { ActivityFeed } from "../components/ActivityFeed";
import { ExplorerTransactions } from "../components/ExplorerTransactions";
import { AddEmployeeForm } from "../components/app/AddEmployeeForm";
import { FundPayrollForm } from "../components/app/FundPayrollForm";
import { OnboardingFlow } from "../components/app/OnboardingFlow";
import { useMiniPay } from "../hooks/useMiniPay";
import {
  STREAMWAGE_ABI,
  STREAMWAGE_VAULT_ADDRESS,
  CUSD_ADDRESS,
  MENTO_CUSD_MAINNET_CANDIDATE,
} from "../lib/satSalary";
import { CELO_EXPLORER } from "../lib/wagmi";
import { fetchProfile, saveProfileRemote } from "../lib/profileApi";
import type { UserProfile } from "../lib/profileApi";

type Tab = "dashboard" | "team" | "earnings" | "explorer" | "activity";

const FAUCET_URL = "https://faucet.celo.org/celo-sepolia";
const MIN_GAS_WEI = 1_000_000_000_000_000n; // 0.001 CELO

function shortAddr(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function formatCelo(wei: bigint): string {
  const whole = wei / 10n ** 18n;
  const frac = (wei % 10n ** 18n).toString().padStart(18, "0").slice(0, 4);
  return `${whole}.${frac}`;
}

export function AppShell() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { isMiniPay } = useMiniPay();
  const { data: balance, isLoading: balanceLoading } = useBalance({
    address,
  });

  const { data: ownerAddr } = useReadContract({
    address: STREAMWAGE_VAULT_ADDRESS,
    abi: STREAMWAGE_ABI,
    functionName: "owner",
    query: { refetchInterval: 30000 },
  });
  const isOwner =
    !!address &&
    !!ownerAddr &&
    (ownerAddr as string).toLowerCase() === address.toLowerCase();

  const gasWei = balance?.value ?? 0n;
  const gasChecked = !balanceLoading && balance !== undefined;
  const insufficientGas = gasChecked && gasWei < MIN_GAS_WEI;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(!!address);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  useEffect(() => {
    if (!address) return;
    if (profile) {
      setProfileLoading(false);
      return;
    }
    setProfileLoading(true);
    fetchProfile(address).then((remote) => {
      if (remote) setProfile(remote);
      setProfileLoading(false);
    });
  }, [address, profile]);

  function handleOnboardingComplete(p: UserProfile) {
    setProfile(p);
    if (address) saveProfileRemote(address, p);
    setActiveTab("dashboard");
  }

  if (profileLoading) {
    return (
      <div
        className="app-shell"
        style={{ display: "grid", placeItems: "center" }}
      >
        <span style={{ color: "#999" }}>Loading profile…</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <OnboardingFlow
        walletAddress={address ?? "0x"}
        isOwner={isOwner}
        onComplete={handleOnboardingComplete}
      />
    );
  }

  const role = profile.role;
  const displayName =
    profile.role === "employer" ? profile.orgName : profile.personName;

  const employerTabs: { id: Tab; label: string; icon: typeof Coins }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "team", label: "Team", icon: Users },
    { id: "explorer", label: "Explorer", icon: Compass },
    { id: "activity", label: "Activity", icon: ActivityIcon },
  ];

  const employeeTabs: { id: Tab; label: string; icon: typeof Coins }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "earnings", label: "My Earnings", icon: Wallet },
    { id: "explorer", label: "Explorer", icon: Compass },
    { id: "activity", label: "Activity", icon: ActivityIcon },
  ];

  const tabs = role === "employer" ? employerTabs : employeeTabs;

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="app-sidebar__top">
          <div className="app-sidebar__brand">
            <img
              src="/logo-mark.png"
              alt="StreamWage"
              className="app-sidebar__logo"
            />
            <span>StreamWage</span>
          </div>

          <div className="app-sidebar__profile">
            <span className="app-sidebar__name">{displayName}</span>
            <span className="app-sidebar__role-badge">
              {role === "employer" ? "Employer" : "Worker"}
              {role === "employer" && !isOwner ? " · read-only" : ""}
            </span>
          </div>

          <nav className="app-sidebar__nav">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`app-sidebar__tab ${activeTab === tab.id ? "is-active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="app-sidebar__bottom">
          {gasChecked && (
            <div className="app-sidebar__balance">
              <Coins size={12} />
              <span>{formatCelo(gasWei)} CELO</span>
            </div>
          )}
          {address && (
            <div className="app-sidebar__addr">
              <span>{shortAddr(address)}</span>
            </div>
          )}
          {!isMiniPay && (
            <button
              className="app-sidebar__disconnect"
              onClick={() => disconnect()}
            >
              <LogOut size={12} /> Disconnect
            </button>
          )}
        </div>
      </aside>

      <main className="app-content">
        {insufficientGas && (
          <div className="dash-faucet-banner">
            <div className="dash-faucet-banner__icon">
              <Droplet size={18} />
            </div>
            <div className="dash-faucet-banner__body">
              <strong>You need testnet CELO for gas</strong>
              <span>
                Your wallet holds {formatCelo(gasWei)} CELO. Claim free testnet
                CELO before sending any transaction.
              </span>
            </div>
            <a
              className="dash-faucet-btn"
              href={FAUCET_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Claim CELO
              <ArrowRight size={15} />
            </a>
          </div>
        )}

        {activeTab === "dashboard" && role === "employer" && (
          <>
            {isOwner && <FundPayrollForm />}
            <RealFlowPanel
              view="dashboard"
              isOwner={isOwner}
              gasBlocked={insufficientGas}
            />
          </>
        )}

        {activeTab === "dashboard" && role === "employee" && (
          <RealFlowPanel view="earnings" gasBlocked={insufficientGas} />
        )}

        {activeTab === "team" && (
          <>
            {!showAddEmployee && (
              <>
                <RealFlowPanel
                  view="team"
                  isOwner={isOwner}
                  gasBlocked={insufficientGas}
                />
                {isOwner && (
                  <button
                    className="add-employee-cta"
                    onClick={() => setShowAddEmployee(true)}
                  >
                    <Plus size={16} /> Add Employee
                  </button>
                )}
              </>
            )}
            {showAddEmployee && isOwner && (
              <AddEmployeeForm
                isOwner={isOwner}
                onSuccess={() => setShowAddEmployee(false)}
                onCancel={() => setShowAddEmployee(false)}
              />
            )}
          </>
        )}

        {activeTab === "earnings" && (
          <RealFlowPanel view="earnings" gasBlocked={insufficientGas} />
        )}

        {activeTab === "explorer" && (
          <div className="protocol-explorer">
            <h3>StreamWage on Celo</h3>
            <p className="protocol-explorer__sub">
              Live data from Celo Sepolia (chain 11142220)
            </p>
            <div className="protocol-explorer__grid">
              <div className="protocol-explorer__card">
                <span>Network</span>
                <strong>Celo Sepolia</strong>
                <em>Chain ID 11142220</em>
              </div>
              <div className="protocol-explorer__card">
                <span>Stablecoin</span>
                <strong>Mento cUSD</strong>
                <em>Per-second salary streams</em>
              </div>
              <div className="protocol-explorer__card">
                <span>Identity</span>
                <strong>Self Protocol</strong>
                <em>On-chain worker gate</em>
              </div>
              <div className="protocol-explorer__card">
                <span>Claim surface</span>
                <strong>MiniPay</strong>
                <em>Mobile-first wallet</em>
              </div>
            </div>
            <div className="protocol-explorer__links">
              <h4>Deployed contracts</h4>
              <a
                href={`${CELO_EXPLORER}/address/${STREAMWAGE_VAULT_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                StreamWageVault →
              </a>
              <a
                href={`${CELO_EXPLORER}/address/${CUSD_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                cUSD Token (testnet) →
              </a>
              <a
                href={`${CELO_EXPLORER}/address/${MENTO_CUSD_MAINNET_CANDIDATE}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Mento USDm (mainnet candidate) →
              </a>
            </div>
            <ExplorerTransactions />
          </div>
        )}

        {activeTab === "activity" && <ActivityFeed />}
      </main>
    </div>
  );
}
