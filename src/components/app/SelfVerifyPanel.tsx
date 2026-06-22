import { useEffect, useState } from "react";
import { BadgeCheck, Loader2, ShieldCheck } from "lucide-react";
import { useReadContract, useWriteContract } from "wagmi";
import {
  STREAMWAGE_ABI,
  STREAMWAGE_VAULT_ADDRESS,
  SELF_SCOPE,
} from "../../lib/satSalary";
import { shortAddr } from "../../lib/format";

interface SelfVerifyPanelProps {
  worker: `0x${string}`;
  isOwner: boolean;
  onVerified?: () => void;
}

const SELF_ENDPOINT =
  import.meta.env.VITE_SELF_ENDPOINT ??
  "https://playground.self.xyz/api/verify";

// Builds a real Self Protocol universal link (via @selfxyz/qrcode) for the
// worker to scan, and enforces the on-chain gate: createStream is only allowed
// once isVerifiedWorker[worker] is true. The contract owner records the result
// with setWorkerVerification — standing in for a deployed Self callback service
// (see BLOCKERS.md).
export function SelfVerifyPanel({
  worker,
  isOwner,
  onVerified,
}: SelfVerifyPanelProps) {
  const [deepLink, setDeepLink] = useState<string | null>(null);
  const { writeContractAsync, isPending } = useWriteContract();
  const [attestError, setAttestError] = useState<string | null>(null);

  const validWorker = /^0x[0-9a-fA-F]{40}$/.test(worker);

  const { data: verified, refetch } = useReadContract({
    address: STREAMWAGE_VAULT_ADDRESS,
    abi: STREAMWAGE_ABI,
    functionName: "isVerifiedWorker",
    args: [worker],
    query: { enabled: validWorker, refetchInterval: 10000 },
  });

  // Build the Self deep link lazily so the SDK's side effects never touch the
  // initial app load. Falls back to a plain Self verify URL if the SDK errors.
  useEffect(() => {
    if (!validWorker) {
      setDeepLink(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const mod: any = await import("@selfxyz/qrcode");
        const app = new mod.SelfAppBuilder({
          appName: "StreamWage",
          scope: SELF_SCOPE,
          endpoint: SELF_ENDPOINT,
          endpointType: "https",
          userId: worker,
          userIdType: "hex",
          disclosures: { minimumAge: 18, ofac: false },
        }).build();
        const link = mod.getUniversalLink(app);
        if (!cancelled) setDeepLink(link);
      } catch {
        if (!cancelled)
          setDeepLink(
            `https://self.xyz/verify?scope=${SELF_SCOPE}&userId=${worker}`,
          );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [worker, validWorker]);

  async function attest() {
    setAttestError(null);
    try {
      await writeContractAsync({
        address: STREAMWAGE_VAULT_ADDRESS,
        abi: STREAMWAGE_ABI,
        functionName: "setWorkerVerification",
        args: [worker, true],
      });
      await refetch();
      onVerified?.();
    } catch (err) {
      setAttestError(
        err instanceof Error ? err.message.slice(0, 140) : "Attestation failed",
      );
    }
  }

  if (!validWorker) {
    return (
      <div className="self-verify self-verify--empty">
        <ShieldCheck size={18} />
        <span>Enter a valid worker wallet to start Self verification.</span>
      </div>
    );
  }

  if (verified) {
    return (
      <div className="self-verify self-verify--done">
        <div className="self-verify__check">
          <BadgeCheck size={22} />
        </div>
        <div>
          <strong>Identity verified</strong>
          <span>
            {shortAddr(worker)} passed Self verification — eligible for payroll.
          </span>
        </div>
      </div>
    );
  }

  const qrSrc = deepLink
    ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=0&data=${encodeURIComponent(deepLink)}`
    : null;

  return (
    <div className="self-verify">
      <div className="self-verify__head">
        <ShieldCheck size={18} />
        <div>
          <strong>Verify identity with Self</strong>
          <span>
            {shortAddr(worker)} scans this with the Self app (scope “
            {SELF_SCOPE}
            ”) to prove identity before payroll can start.
          </span>
        </div>
      </div>
      <div className="self-verify__body">
        <div className="self-verify__qr">
          {qrSrc ? (
            <img
              src={qrSrc}
              alt="Self verification QR"
              width={180}
              height={180}
            />
          ) : (
            <Loader2 size={28} className="spin" />
          )}
        </div>
        <div className="self-verify__actions">
          {deepLink && (
            <a
              className="action-btn action-btn--secondary"
              href={deepLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open in Self app
            </a>
          )}
          {isOwner && (
            <button
              className="action-btn action-btn--primary"
              onClick={attest}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 size={14} className="spin" /> Recording…
                </>
              ) : (
                <>
                  <BadgeCheck size={14} /> Confirm verification on-chain
                </>
              )}
            </button>
          )}
          {attestError && <p className="self-verify__error">{attestError}</p>}
          <p className="self-verify__note">
            After the worker passes Self, the employer records it on-chain
            (setWorkerVerification) to unlock createStream.
          </p>
        </div>
      </div>
    </div>
  );
}
