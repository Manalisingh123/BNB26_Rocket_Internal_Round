import React from 'react';
import { Guardian, RecoveryCase, AppSection } from '../types/heirloom';
import { ArchivalStamp } from './ArchivalSeal';
import { ArrowRight } from 'lucide-react';

interface GuardiansViewProps {
  guardians: Guardian[];
  recoveryCase: RecoveryCase;
  onSimulateGuardianDecision: (
    guardianId: string,
    decision: 'APPROVED' | 'REJECTED' | 'OBJECTED'
  ) => void;
  onGuardianReleaseShare: (guardianId: string) => void;
  onNavigate: (section: AppSection) => void;
}

export const GuardiansView: React.FC<GuardiansViewProps> = ({
  guardians,
  recoveryCase,
  onSimulateGuardianDecision,
  onGuardianReleaseShare,
  onNavigate
}) => {
  const approvedCount = guardians.filter((g) => g.decision === 'APPROVED').length;
  const isAuthorizedOrReleased =
    recoveryCase.state === 'AUTHORIZED' || recoveryCase.state === 'RELEASED';

  return (
    <div className="space-y-12">
      {/* Calm Header */}
      <div className="border-b border-[#DED9CE] pb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="text-xs font-mono uppercase tracking-[0.14em] text-[#77736A]">
            2-of-3 Independent Quorum
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-normal text-[#242421]">
            Trusted Guardians
          </h1>
          <p className="text-base text-[#77736A] leading-relaxed">
            Your three guardians verify recovery requests and hold threshold key shares, but never have access to your unencrypted records. Any two must concur before recovery can proceed.
          </p>
        </div>

        <button
          onClick={() => onNavigate('recovery')}
          className="px-5 py-3 border border-[#242421] text-[#242421] text-xs font-mono uppercase tracking-wider hover:bg-[#242421] hover:text-[#F7F4ED] transition-colors inline-flex items-center gap-2 self-start lg:self-auto cursor-pointer whitespace-nowrap"
        >
          <span>Inspect Active Case #{recoveryCase.epochNumber}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Clean Trust Network Relationship Strip */}
      <section className="border border-[#DED9CE] bg-[#EFECE4]/50 p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#DED9CE] pb-4">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-[#77736A]">
              Trust Network Topology
            </div>
            <h2 className="font-serif text-2xl text-[#242421] mt-0.5">
              Owner → 2-of-3 Guardian Quorum → Beneficiary
            </h2>
          </div>
          <span className="text-xs font-mono text-[#30483B]">
            {approvedCount} of 2 Required Approvals Recorded
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 bg-[#F7F4ED] border border-[#DED9CE] space-y-1.5">
            <div className="text-[11px] font-mono uppercase text-[#30483B]">01. Vault Owner</div>
            <div className="font-serif text-2xl text-[#242421]">Julian Vance-Sterling</div>
            <p className="text-xs text-[#77736A] leading-relaxed">
              Seals records and retains absolute veto power to cancel any active recovery via Owner Check-In.
            </p>
          </div>

          <div className="p-5 bg-[#F7F4ED] border border-[#242421]/40 space-y-1.5">
            <div className="text-[11px] font-mono uppercase text-[#242421]">02. Guardian Quorum</div>
            <div className="font-serif text-2xl text-[#242421]">3 Independent Witnesses</div>
            <p className="text-xs text-[#77736A] leading-relaxed">
              Hold encrypted threshold key shares (#1, #2, #3). Cannot view vault contents; 2 of 3 must approve recovery.
            </p>
          </div>

          <div className="p-5 bg-[#F7F4ED] border border-[#DED9CE] space-y-1.5">
            <div className="text-[11px] font-mono uppercase text-[#B0925A]">03. Beneficiary</div>
            <div className="font-serif text-2xl text-[#242421]">Hannah Vance</div>
            <p className="text-xs text-[#77736A] leading-relaxed">
              Can reconstruct the decryption key only after 2-of-3 quorum and the 72-hour challenge period complete.
            </p>
          </div>
        </div>
      </section>

      {/* Three Guardian Dossier Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {guardians.map((g) => (
          <div
            key={g.id}
            className="border border-[#DED9CE] bg-[#F7F4ED] p-6 flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#DED9CE] pb-3">
                <span className="text-xs font-mono text-[#77736A] uppercase">
                  Guardian #{g.index}
                </span>
                <ArchivalStamp
                  state={
                    g.shareReleased
                      ? 'SHARE RELEASED'
                      : g.decision === 'APPROVED'
                      ? 'VERIFIED'
                      : g.decision
                  }
                  size="sm"
                />
              </div>

              <div>
                <h3 className="font-serif text-2xl text-[#242421]">{g.name}</h3>
                <div className="text-xs text-[#77736A] mt-0.5">{g.roleTitle}</div>
                <div className="text-xs text-[#77736A]">{g.location}</div>
              </div>

              <div className="pt-2 border-t border-[#DED9CE] space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#77736A]">Public Key Reference</span>
                  <span className="font-mono text-[#242421]">{g.publicKeyRef}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#77736A]">Case #{recoveryCase.epochNumber} Decision</span>
                  <span className="font-mono font-medium text-[#242421]">{g.decision}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#77736A]">Key Share #{g.index}</span>
                  <span className="font-mono text-[#30483B]">
                    {g.shareReleased ? 'Released to Beneficiary' : 'Locked in Custody'}
                  </span>
                </div>
              </div>
            </div>

            {/* Direct Guardian Actions */}
            <div className="pt-4 border-t border-[#DED9CE] space-y-2.5">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#77736A]">
                Case #{recoveryCase.epochNumber} Actions
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => onSimulateGuardianDecision(g.id, 'APPROVED')}
                  className={`py-2 text-[11px] font-mono uppercase tracking-wider border transition-colors cursor-pointer ${
                    g.decision === 'APPROVED'
                      ? 'bg-[#30483B] text-[#F7F4ED] border-[#30483B]'
                      : 'border-[#DED9CE] text-[#242421] hover:border-[#30483B]'
                  }`}
                >
                  Approve
                </button>
                <button
                  onClick={() => onSimulateGuardianDecision(g.id, 'REJECTED')}
                  className={`py-2 text-[11px] font-mono uppercase tracking-wider border transition-colors cursor-pointer ${
                    g.decision === 'REJECTED'
                      ? 'bg-[#242421] text-[#F7F4ED] border-[#242421]'
                      : 'border-[#DED9CE] text-[#242421] hover:border-[#242421]'
                  }`}
                >
                  Reject
                </button>
                <button
                  onClick={() => onSimulateGuardianDecision(g.id, 'OBJECTED')}
                  className={`py-2 text-[11px] font-mono uppercase tracking-wider border transition-colors cursor-pointer ${
                    g.decision === 'OBJECTED'
                      ? 'bg-[#7A3236] text-[#F7F4ED] border-[#7A3236]'
                      : 'border-[#DED9CE] text-[#7A3236] hover:border-[#7A3236]'
                  }`}
                >
                  Object
                </button>
              </div>

              {isAuthorizedOrReleased && (
                <button
                  disabled={g.shareReleased}
                  onClick={() => onGuardianReleaseShare(g.id)}
                  className={`w-full py-2 text-[11px] font-mono uppercase tracking-wider transition-colors ${
                    g.shareReleased
                      ? 'bg-[#E8EFEA] text-[#30483B] border border-[#30483B]/40 cursor-default'
                      : 'bg-[#242421] text-[#F7F4ED] hover:bg-[#30483B] cursor-pointer'
                  }`}
                >
                  {g.shareReleased ? `Share #${g.index} Released ✓` : `Release Key Share #${g.index}`}
                </button>
              )}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};
