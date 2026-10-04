import React, { useState } from 'react';
import { VaultAsset, RecoveryCase, Guardian, AppSection } from '../types/heirloom';
import { ArchivalStamp } from './ArchivalSeal';
import { CheckCircle2, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';

interface OverviewViewProps {
  assets: VaultAsset[];
  recoveryCase: RecoveryCase;
  guardians: Guardian[];
  lastOwnerCheckIn: string;
  onNavigate: (section: AppSection) => void;
  onSelectAsset: (assetId: string) => void;
  onOwnerCheckIn: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  assets,
  recoveryCase,
  guardians,
  lastOwnerCheckIn,
  onNavigate,
  onSelectAsset,
  onOwnerCheckIn
}) => {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [justCheckedIn, setJustCheckedIn] = useState(false);

  const isRecoveryActive =
    recoveryCase.state !== 'INACTIVE' && recoveryCase.state !== 'CANCELLED_RESEALED';

  const approvedCount = guardians.filter((g) => g.decision === 'APPROVED').length;

  const handleCheckIn = () => {
    onOwnerCheckIn();
    setJustCheckedIn(true);
    setTimeout(() => setJustCheckedIn(false), 4500);
  };

  return (
    <div className="space-y-14">
      {/* PRIMARY FOCUS: "Is my digital legacy safe?" */}
      <section className="border-b border-[#DED9CE] pb-10 space-y-6">
        <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-[0.14em] text-[#77736A]">
          <span>Vault Status</span>
          <span>·</span>
          <ArchivalStamp
            state={isRecoveryActive ? recoveryCase.state : 'SEALED'}
            size="sm"
          />
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <h1
              className="font-serif text-4xl sm:text-5xl font-normal text-[#242421] leading-tight"
              style={{ textWrap: 'balance' }}
            >
              {isRecoveryActive
                ? `Your records remain sealed, with Recovery Case #${recoveryCase.epochNumber} in its safety window.`
                : 'Your digital legacy is quietly sealed and protected.'}
            </h1>
            <p className="text-base text-[#77736A] leading-relaxed">
              {isRecoveryActive
                ? `A recovery petition for "${recoveryCase.assetTitle}" is currently active. Because Heirloom enforces a mandatory challenge window, no contents have been released. Checking in now immediately closes this case and re-seals the vault.`
                : `All ${assets.length} preserved records are encrypted in your browser under a 2-of-3 guardian policy. Your check-in is current and no recovery cases are active.`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleCheckIn}
              className="px-6 py-3.5 bg-[#30483B] text-[#F7F4ED] text-xs font-medium uppercase tracking-[0.14em] hover:bg-[#242421] transition-colors cursor-pointer whitespace-nowrap"
            >
              {isRecoveryActive ? 'Check In & Cancel Recovery' : 'Confirm Owner Check-In'}
            </button>

            {isRecoveryActive ? (
              <button
                onClick={() => onNavigate('recovery')}
                className="px-5 py-3.5 border border-[#242421] text-[#242421] text-xs font-medium uppercase tracking-[0.14em] hover:bg-[#242421] hover:text-[#F7F4ED] transition-colors cursor-pointer whitespace-nowrap"
              >
                Review Case #{recoveryCase.epochNumber}
              </button>
            ) : (
              <button
                onClick={() => onNavigate('vault')}
                className="px-5 py-3.5 border border-[#242421] text-[#242421] text-xs font-medium uppercase tracking-[0.14em] hover:bg-[#242421] hover:text-[#F7F4ED] transition-colors cursor-pointer whitespace-nowrap"
              >
                Preserve a Record
              </button>
            )}
          </div>
        </div>

        {justCheckedIn && (
          <div className="p-4 border border-[#30483B] bg-[#E8EFEA] flex items-center justify-between gap-4 text-xs text-[#30483B]">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>
                <strong>Check-In Confirmed ({lastOwnerCheckIn}):</strong> Any active recovery case has been closed, prior guardian approvals have been invalidated, and your vault is safely re-sealed under Nonce #{recoveryCase.epochNumber}.
              </span>
            </div>
            <ArchivalStamp state="SEALED" size="sm" />
          </div>
        )}
      </section>

      {/* CALM FOUR-PILLAR SUMMARY STRIP */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-b border-[#DED9CE] pb-10 gap-8">
        <div className="space-y-1">
          <div className="text-xs font-mono uppercase tracking-wider text-[#77736A]">
            Preserved Records
          </div>
          <div className="font-serif text-3xl text-[#242421] tabular-nums">
            {assets.length} Sealed
          </div>
          <button
            onClick={() => onNavigate('vault')}
            className="text-xs text-[#30483B] hover:underline inline-flex items-center gap-1 cursor-pointer pt-1"
          >
            <span>Browse My Vault</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-1">
          <div className="text-xs font-mono uppercase tracking-wider text-[#77736A]">
            Owner Check-In
          </div>
          <div className="font-serif text-3xl text-[#30483B]">Current</div>
          <div className="text-xs text-[#77736A] tabular-nums pt-1">
            Verified {lastOwnerCheckIn}
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-xs font-mono uppercase tracking-wider text-[#77736A]">
            Active Recovery
          </div>
          <div className="font-serif text-3xl text-[#242421]">
            {isRecoveryActive ? `Case #${recoveryCase.epochNumber}` : 'None'}
          </div>
          <button
            onClick={() => onNavigate('recovery')}
            className="text-xs text-[#9C6B30] hover:underline inline-flex items-center gap-1 cursor-pointer pt-1"
          >
            <span>
              {isRecoveryActive
                ? `${approvedCount}/3 approved · ${recoveryCase.challengeRemainingHours}h left`
                : 'View Case File History'}
            </span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-1">
          <div className="text-xs font-mono uppercase tracking-wider text-[#77736A]">
            Guardian Network
          </div>
          <div className="font-serif text-3xl text-[#242421] tabular-nums">
            2-of-3 Quorum
          </div>
          <button
            onClick={() => onNavigate('guardians')}
            className="text-xs text-[#77736A] hover:text-[#242421] inline-flex items-center gap-1 cursor-pointer pt-1"
          >
            <span>3 Guardians Verified</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </section>

      {/* CLEAN ARCHIVE LIST PREVIEW */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl text-[#242421]">Preserved Records</h2>
          <button
            onClick={() => onNavigate('vault')}
            className="text-xs font-mono uppercase tracking-wider text-[#242421] hover:text-[#30483B] inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span>Open Full Vault</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="border-t border-b border-[#DED9CE] divide-y divide-[#DED9CE]">
          {assets.map((asset) => (
            <div
              key={asset.id}
              onClick={() => onSelectAsset(asset.id)}
              className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#EFECE4]/50 px-3 -mx-3 transition-colors cursor-pointer group"
            >
              <div className="space-y-1">
                <div className="text-xs font-mono text-[#77736A]">
                  {asset.accessionNumber} · {asset.category}
                </div>
                <h3 className="font-serif text-2xl text-[#242421] group-hover:text-[#30483B] transition-colors">
                  {asset.title}
                </h3>
                <p className="text-xs text-[#77736A]">
                  Beneficiary: {asset.beneficiaryName} · Preserved {asset.createdDate}
                </p>
              </div>

              <div className="flex items-center gap-4 self-start sm:self-center shrink-0">
                <ArchivalStamp state={asset.protectionState} size="sm" />
                <span className="text-xs font-mono uppercase tracking-wider text-[#77736A] group-hover:text-[#242421]">
                  Open →
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PROGRESSIVE DISCLOSURE: TECHNICAL PARAMETERS */}
      <section className="pt-2">
        <button
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="text-xs font-mono uppercase tracking-wider text-[#77736A] hover:text-[#242421] inline-flex items-center gap-2 cursor-pointer"
        >
          <span>
            {showTechnicalDetails ? 'Hide' : 'Show'} Cryptographic & Policy Parameters
          </span>
          {showTechnicalDetails ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>

        {showTechnicalDetails && (
          <div className="mt-4 p-6 border border-[#DED9CE] bg-[#EFECE4]/40 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs font-mono text-[#77736A]">
            <div>
              <div className="text-[10px] uppercase">Client-Side Cipher</div>
              <div className="text-[#242421] mt-1">WebCrypto AES-256-GCM + 2-of-3 Threshold Split</div>
            </div>
            <div>
              <div className="text-[10px] uppercase">Active Recovery Nonce</div>
              <div className="text-[#242421] mt-1 tabular-nums">
                Epoch #{recoveryCase.epochNumber} (Prior Epochs #{recoveryCase.previousInvalidatedEpochs.join(', #')} Invalidated)
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase">Persistence Layer</div>
              <div className="text-[#242421] mt-1">Browser Local Archive Storage (Zero Plaintext Stored)</div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
