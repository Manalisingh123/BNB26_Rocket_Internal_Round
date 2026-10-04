import React, { useState } from 'react';
import { RecoveryCase, Guardian, UserPerspective, VaultAsset } from '../types/heirloom';
import { ArchivalStamp } from './ArchivalSeal';
import { verifyAndDecryptRecord } from '../utils/cryptoVault';
import {
  Clock,
  CheckCircle2,
  RotateCcw,
  ShieldAlert,
  KeyRound,
  Unlock,
  ChevronDown,
  ChevronUp,
  AlertTriangle
} from 'lucide-react';

interface RecoveryCaseViewProps {
  recoveryCase: RecoveryCase;
  asset: VaultAsset;
  guardians: Guardian[];
  perspective: UserPerspective;
  onChangePerspective: (p: UserPerspective) => void;
  onGuardianAction: (
    guardianId: string,
    decision: 'APPROVED' | 'REJECTED' | 'OBJECTED',
    reason?: string
  ) => void;
  onGuardianReleaseShare: (guardianId: string) => void;
  onOwnerCancelAndReseal: () => void;
  onBeneficiaryRequestNewRecovery: (evidenceNote: string) => void;
  onAdvanceChallengeClock: (hours: number) => void;
  onToggleTamperAsset: (assetId: string) => void;
  onRecordDecrypted: (asset: VaultAsset) => void;
}

export const RecoveryCaseView: React.FC<RecoveryCaseViewProps> = ({
  recoveryCase,
  asset,
  guardians,
  perspective,
  onChangePerspective,
  onGuardianAction,
  onGuardianReleaseShare,
  onOwnerCancelAndReseal,
  onBeneficiaryRequestNewRecovery,
  onAdvanceChallengeClock,
  onToggleTamperAsset,
  onRecordDecrypted
}) => {
  const [selectedGuardianId, setSelectedGuardianId] = useState<string>('g-3');
  const [decisionNote, setDecisionNote] = useState<string>('');
  const [newPetitionNote, setNewPetitionNote] = useState<string>(
    'Updated notarized petition for recovery following statutory waiting period.'
  );
  const [showTechnicalProof, setShowTechnicalProof] = useState(false);

  // Local decryption state for Beneficiary
  const [decryptedPlaintext, setDecryptedPlaintext] = useState<string | null>(null);
  const [decryptError, setDecryptError] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);

  const approvedCount = guardians.filter((g) => g.decision === 'APPROVED').length;
  const objectedGuardian = guardians.find((g) => g.decision === 'OBJECTED');
  const activeGuardian = guardians.find((g) => g.id === selectedGuardianId) || guardians[0];
  const releasedShareCount = recoveryCase.releasedShareGuardianIds.length;

  const isAuthorizedOrReleased =
    recoveryCase.state === 'AUTHORIZED' || recoveryCase.state === 'RELEASED';

  // Determine the 5 clear stages of the case
  const stages = [
    { id: 1, label: '01. Requested' },
    { id: 2, label: `02. Quorum (${approvedCount}/3)` },
    { id: 3, label: '03. 72h Challenge' },
    { id: 4, label: '04. Authorized' },
    { id: 5, label: `05. Released (${releasedShareCount}/2)` }
  ];

  const getCurrentStageNumber = () => {
    switch (recoveryCase.state) {
      case 'INACTIVE':
      case 'CANCELLED_RESEALED':
        return 0;
      case 'REQUESTED':
      case 'GUARDIAN_REVIEW':
        return 2;
      case 'CHALLENGE_PERIOD':
      case 'OBJECTED':
        return 3;
      case 'AUTHORIZED':
        return 4;
      case 'RELEASED':
        return 5;
      default:
        return 1;
    }
  };

  const currentStageNum = getCurrentStageNumber();

  const handleBeneficiaryDecrypt = async () => {
    setIsDecrypting(true);
    setDecryptError(null);
    try {
      const releasedShares = recoveryCase.releasedShareGuardianIds.map(
        (gId) => asset.guardianKeyShares[gId as 'g-1' | 'g-2' | 'g-3']
      );

      const res = await verifyAndDecryptRecord({
        ciphertextBase64: asset.ciphertextBase64,
        ivBase64: asset.ivBase64,
        expectedCiphertextSha256: asset.ciphertextHash,
        expectedContentSha256: asset.contentHash.replace('sha256:', ''),
        releasedShares
      });

      setDecryptedPlaintext(res.plaintext);
      onRecordDecrypted(asset);
    } catch (err) {
      setDecryptedPlaintext(null);
      setDecryptError(err instanceof Error ? err.message : 'Decryption failed');
    } finally {
      setIsDecrypting(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Unified Case File Header */}
      <header className="border-b border-[#DED9CE] pb-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-[0.14em] text-[#77736A]">
            <span className="text-[#242421] font-medium">{recoveryCase.caseId}</span>
            <span>·</span>
            <span className="tabular-nums">Recovery Nonce #{recoveryCase.epochNumber}</span>
            <span>·</span>
            <span>Record {recoveryCase.assetAccession}</span>
          </div>
          <ArchivalStamp state={recoveryCase.state} size="md" />
        </div>

        <div className="space-y-3 max-w-3xl">
          <h1 className="font-serif text-4xl sm:text-5xl font-normal text-[#242421] leading-tight">
            Case #{recoveryCase.epochNumber}: {recoveryCase.assetTitle}
          </h1>
          <p className="text-base text-[#77736A] leading-relaxed">
            {recoveryCase.state === 'CANCELLED_RESEALED' &&
              `Closed by Owner Check-In. The vault has been safely re-sealed and advanced to Nonce #${recoveryCase.epochNumber}. Previous guardian approvals from Nonce #${
                recoveryCase.epochNumber - 1
              } are permanently void.`}
            {recoveryCase.state === 'GUARDIAN_REVIEW' &&
              `Recovery requested by ${recoveryCase.initiatedBy}. Currently awaiting 2-of-3 guardian approvals (${approvedCount} of 2 required recorded) before the 72-hour challenge period can begin.`}
            {recoveryCase.state === 'CHALLENGE_PERIOD' &&
              `2-of-3 guardian quorum reached. The case is now in its mandatory 72-hour Challenge Period (${recoveryCase.challengeRemainingHours}h remaining) so the owner or any guardian can stop a premature release.`}
            {recoveryCase.state === 'OBJECTED' &&
              `Escalated Hold: ${
                objectedGuardian?.name || 'A guardian'
              } filed a formal objection during the challenge window. Automatic authorization is halted.`}
            {recoveryCase.state === 'AUTHORIZED' &&
              `Quorum and the 72-hour challenge period have completed without objection. Approved guardians may now release their threshold key shares (${releasedShareCount} of 2 required released).`}
            {recoveryCase.state === 'RELEASED' &&
              `At least 2 guardian key shares have been released. The beneficiary can now reconstruct the AES-256-GCM key and unseal the record locally.`}
          </p>
        </div>

        {/* Clean 5-Stage Case Progression Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
          {stages.map((st) => {
            const isCancelled = recoveryCase.state === 'CANCELLED_RESEALED';
            const isObjected = recoveryCase.state === 'OBJECTED' && st.id === 3;
            const isCurrent = !isCancelled && currentStageNum === st.id;
            const isCompleted = !isCancelled && currentStageNum > st.id;

            return (
              <div
                key={st.id}
                className={`px-3.5 py-2.5 border text-xs font-mono uppercase tracking-wider ${
                  isCancelled
                    ? 'border-[#DED9CE] bg-[#EFECE4]/40 text-[#77736A] line-through'
                    : isObjected
                    ? 'border-[#7A3236] bg-[#F5E8E9] text-[#7A3236] font-medium'
                    : isCurrent
                    ? 'border-[#242421] bg-[#242421] text-[#F7F4ED] font-medium'
                    : isCompleted
                    ? 'border-[#30483B]/40 bg-[#E8EFEA] text-[#30483B]'
                    : 'border-[#DED9CE] bg-[#EFECE4]/40 text-[#77736A]'
                }`}
              >
                {st.label}
              </div>
            );
          })}
        </div>
      </header>

      {/* FOCUSED ROLE ACTION WORKSPACE — Clear separation of Owner, Guardian, and Beneficiary actions */}
      <section className="border border-[#242421] bg-[#EFECE4]/70 p-6 sm:p-8 space-y-6">
        {/* Role Selector Tabs inside the Case File */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DED9CE] pb-5">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#77736A]">
              Active Participant Perspective
            </div>
            <h2 className="font-serif text-2xl text-[#242421] mt-0.5">
              {perspective === 'owner' && 'Vault Owner Safety Controls (Julian Vance-Sterling)'}
              {perspective === 'guardian' && 'Guardian Decision & Share Release Console'}
              {perspective === 'beneficiary' && 'Beneficiary Recovery & Local Reconstruction (Hannah Vance)'}
            </h2>
          </div>

          <div className="flex items-center gap-1.5 bg-[#F7F4ED] p-1 border border-[#DED9CE] self-start sm:self-auto">
            {(
              [
                { id: 'owner', label: 'Owner' },
                { id: 'guardian', label: 'Guardian' },
                { id: 'beneficiary', label: 'Beneficiary' }
              ] as { id: UserPerspective; label: string }[]
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => onChangePerspective(tab.id)}
                className={`px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                  perspective === tab.id
                    ? 'bg-[#242421] text-[#F7F4ED]'
                    : 'text-[#77736A] hover:text-[#242421]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 1. OWNER PERSPECTIVE */}
        {perspective === 'owner' && (
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="text-sm font-medium text-[#242421]">
                {recoveryCase.state === 'CANCELLED_RESEALED'
                  ? `Vault is safely re-sealed under Nonce #${recoveryCase.epochNumber}.`
                  : 'Are you safe and able to access your vault?'}
              </div>
              <p className="text-xs sm:text-sm text-[#77736A] leading-relaxed">
                {recoveryCase.state === 'CANCELLED_RESEALED'
                  ? `Your check-in closed the prior recovery attempt and invalidated all guardian approvals from Nonce #${
                      recoveryCase.epochNumber - 1
                    }. If a new recovery is ever needed, it must start fresh.`
                  : 'Performing an Owner Check-In immediately cancels this recovery case, invalidates any guardian approvals collected so far, and re-seals the record under a new recovery nonce.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {recoveryCase.state !== 'CANCELLED_RESEALED' ? (
                <button
                  onClick={onOwnerCancelAndReseal}
                  className="px-6 py-3.5 bg-[#30483B] text-[#F7F4ED] text-xs font-mono uppercase tracking-[0.14em] hover:bg-[#242421] transition-colors inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Check In & Re-Seal Vault</span>
                </button>
              ) : (
                <span className="inline-flex items-center gap-2 text-xs font-mono text-[#30483B] bg-[#E8EFEA] px-4 py-2.5 border border-[#30483B]/40">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>VAULT RE-SEALED (NONCE #{recoveryCase.epochNumber})</span>
                </span>
              )}
            </div>
          </div>
        )}

        {/* 2. GUARDIAN PERSPECTIVE — Focused solely on making a decision or releasing a key share */}
        {perspective === 'guardian' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F7F4ED] p-4 border border-[#DED9CE]">
              <div className="space-y-0.5">
                <div className="text-[11px] font-mono uppercase text-[#77736A]">
                  Select Guardian Identity
                </div>
                <div className="text-sm font-medium text-[#242421]">
                  {activeGuardian.name} — <span className="text-[#77736A] font-normal">{activeGuardian.roleTitle}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={selectedGuardianId}
                  onChange={(e) => setSelectedGuardianId(e.target.value)}
                  className="px-3.5 py-2 text-xs font-mono bg-[#EFECE4] border border-[#242421] text-[#242421]"
                >
                  {guardians.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.decision}
                      {g.shareReleased ? ' · Share Released' : ''})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {recoveryCase.state === 'CANCELLED_RESEALED' ? (
              <div className="p-5 bg-[#F7F4ED] border border-[#DED9CE] text-sm text-[#77736A]">
                This recovery case was cancelled by an Owner Check-In. No guardian actions are required until a new recovery petition is opened under Nonce #{recoveryCase.epochNumber}.
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#77736A] mb-1.5">
                    Attestation / Objection Note (Recorded in Case Timeline)
                  </label>
                  <input
                    type="text"
                    value={decisionNote}
                    onChange={(e) => setDecisionNote(e.target.value)}
                    placeholder="Enter verification note or reason for objection..."
                    className="w-full px-3.5 py-2.5 text-sm bg-[#F7F4ED] border border-[#DED9CE] text-[#242421]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Approve */}
                  <div className="p-4 bg-[#F7F4ED] border border-[#DED9CE] flex flex-col justify-between space-y-4">
                    <div>
                      <div className="text-xs font-mono uppercase text-[#30483B] font-medium">
                        1. Approve Recovery
                      </div>
                      <p className="text-xs text-[#77736A] mt-1">
                        Attest that recovery conditions are legitimate. 2 of 3 approvals are required to start the 72h challenge clock.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        onGuardianAction(activeGuardian.id, 'APPROVED', decisionNote.trim() || undefined);
                        setDecisionNote('');
                      }}
                      className="w-full py-2.5 bg-[#30483B] text-[#F7F4ED] text-xs font-mono uppercase tracking-wider hover:bg-[#242421] transition-colors cursor-pointer"
                    >
                      {activeGuardian.decision === 'APPROVED' ? 'Approved (Update)' : 'Approve Case'}
                    </button>
                  </div>

                  {/* Reject */}
                  <div className="p-4 bg-[#F7F4ED] border border-[#DED9CE] flex flex-col justify-between space-y-4">
                    <div>
                      <div className="text-xs font-mono uppercase text-[#242421] font-medium">
                        2. Reject Request
                      </div>
                      <p className="text-xs text-[#77736A] mt-1">
                        Decline to approve if documentation is insufficient. If 2 Guardians reject, quorum cannot be met.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        onGuardianAction(activeGuardian.id, 'REJECTED', decisionNote.trim() || undefined);
                        setDecisionNote('');
                      }}
                      className="w-full py-2.5 border border-[#242421] text-[#242421] text-xs font-mono uppercase tracking-wider hover:bg-[#242421] hover:text-[#F7F4ED] transition-colors cursor-pointer"
                    >
                      {activeGuardian.decision === 'REJECTED' ? 'Rejected (Update)' : 'Reject Case'}
                    </button>
                  </div>

                  {/* Object */}
                  <div className="p-4 bg-[#F5E8E9]/50 border border-[#7A3236]/40 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="text-xs font-mono uppercase text-[#7A3236] font-medium">
                        3. File Formal Objection
                      </div>
                      <p className="text-xs text-[#77736A] mt-1">
                        Halts the challenge countdown immediately and places the case into an escalated hold.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        onGuardianAction(activeGuardian.id, 'OBJECTED', decisionNote.trim() || undefined);
                        setDecisionNote('');
                      }}
                      className="w-full py-2.5 bg-[#7A3236] text-[#F7F4ED] text-xs font-mono uppercase tracking-wider hover:bg-[#242421] transition-colors cursor-pointer"
                    >
                      Object & Halt Release
                    </button>
                  </div>
                </div>

                {/* Key Share Release (Available once AUTHORIZED or RELEASED) */}
                <div className="p-5 border border-[#B0925A] bg-[#F7F4ED] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-xs font-mono uppercase tracking-wider text-[#B0925A] font-medium">
                      Threshold Key Share Custody ({activeGuardian.name})
                    </div>
                    <p className="text-xs text-[#77736A]">
                      {isAuthorizedOrReleased
                        ? activeGuardian.shareReleased
                          ? `Key Share #${activeGuardian.index} has been released to the beneficiary for local reconstruction.`
                          : `Case #${recoveryCase.epochNumber} is AUTHORIZED. You may now release Key Share #${activeGuardian.index} to the beneficiary.`
                        : 'Your threshold key share remains locked until the 2-of-3 quorum and 72-hour challenge period complete without objection.'}
                    </p>
                  </div>

                  <button
                    disabled={!isAuthorizedOrReleased || activeGuardian.shareReleased}
                    onClick={() => onGuardianReleaseShare(activeGuardian.id)}
                    className={`px-5 py-3 text-xs font-mono uppercase tracking-wider shrink-0 transition-colors ${
                      activeGuardian.shareReleased
                        ? 'bg-[#E8EFEA] text-[#30483B] border border-[#30483B]/40 cursor-default'
                        : isAuthorizedOrReleased
                        ? 'bg-[#242421] text-[#F7F4ED] hover:bg-[#30483B] cursor-pointer'
                        : 'bg-[#EFECE4] text-[#77736A] border border-[#DED9CE] cursor-not-allowed'
                    }`}
                  >
                    {activeGuardian.shareReleased
                      ? `Share #${activeGuardian.index} Released ✓`
                      : `Release Key Share #${activeGuardian.index}`}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. BENEFICIARY PERSPECTIVE — Clear state: Locked, In Recovery, Authorized, or Released */}
        {perspective === 'beneficiary' && (
          <div className="space-y-6">
            {recoveryCase.state === 'CANCELLED_RESEALED' ? (
              <div className="bg-[#F7F4ED] border border-[#DED9CE] p-6 space-y-4">
                <div className="text-sm font-medium text-[#242421]">
                  Prior Case Closed — Submit New Recovery Request (Nonce #{recoveryCase.epochNumber})
                </div>
                <p className="text-xs sm:text-sm text-[#77736A]">
                  Because the owner checked in and closed Case #{recoveryCase.epochNumber - 1}, previous guardian approvals cannot be reused. You may initiate a fresh recovery petition under Nonce #{recoveryCase.epochNumber}.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={newPetitionNote}
                    onChange={(e) => setNewPetitionNote(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 text-sm bg-[#EFECE4]/60 border border-[#DED9CE] text-[#242421]"
                    placeholder="Evidentiary summary for guardians..."
                  />
                  <button
                    onClick={() => onBeneficiaryRequestNewRecovery(newPetitionNote)}
                    className="px-6 py-3 bg-[#242421] text-[#F7F4ED] text-xs font-mono uppercase tracking-wider hover:bg-[#30483B] transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Request Recovery (Nonce #{recoveryCase.epochNumber})
                  </button>
                </div>
              </div>
            ) : !isAuthorizedOrReleased ? (
              <div className="bg-[#F7F4ED] border border-[#DED9CE] p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="text-xs font-mono uppercase text-[#9C6B30]">
                    Status: Controlled Waiting ({recoveryCase.state.replace(/_/g, ' ')})
                  </div>
                  <div className="font-serif text-2xl text-[#242421]">
                    Protected record exists, but access remains locked.
                  </div>
                  <p className="text-xs sm:text-sm text-[#77736A] leading-relaxed">
                    {recoveryCase.state === 'GUARDIAN_REVIEW' &&
                      `Waiting for at least 2 of 3 guardians to approve (${approvedCount}/2 approved so far). Switch to the Guardian tab above to approve or reject.`}
                    {recoveryCase.state === 'CHALLENGE_PERIOD' &&
                      `2 of 3 guardians have approved. The mandatory 72-hour challenge period (${recoveryCase.challengeRemainingHours}h remaining) must finish before the case is authorized.`}
                    {recoveryCase.state === 'OBJECTED' &&
                      `A guardian has objected to this recovery. Release is paused until the objection is resolved or 2-of-3 guardians re-approve.`}
                  </p>
                </div>

                {recoveryCase.state === 'CHALLENGE_PERIOD' && (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
                    <button
                      onClick={() => onAdvanceChallengeClock(24)}
                      className="px-4 py-2.5 border border-[#242421] text-[#242421] text-xs font-mono uppercase tracking-wider hover:bg-[#242421] hover:text-[#F7F4ED] transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Advance Clock +24h
                    </button>
                    <button
                      onClick={() => onAdvanceChallengeClock(recoveryCase.challengeRemainingHours)}
                      className="px-5 py-2.5 bg-[#242421] text-[#F7F4ED] text-xs font-mono uppercase tracking-wider hover:bg-[#30483B] transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Complete 72h Challenge → Authorize
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-[#F7F4ED] border border-[#30483B] p-6 space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="text-xs font-mono uppercase text-[#30483B] font-medium">
                      {releasedShareCount >= 2
                        ? 'Key Shares Released (2/2) — Ready for Local Decryption'
                        : `Case Authorized — Waiting for Guardian Key Shares (${releasedShareCount} of 2 Released)`}
                    </div>
                    <h3 className="font-serif text-2xl text-[#242421]">
                      {releasedShareCount >= 2
                        ? 'Reconstruct Master Key & Unseal Record'
                        : 'Guardians Must Release 2 Threshold Shares to Reconstruct Key'}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#77736A]">
                      {releasedShareCount >= 2
                        ? 'Two independent guardian shares have been released. Click below to run AES-256-GCM decryption and SHA-256 verification directly in your browser.'
                        : 'Switch to the Guardian tab above to release at least 2 guardian key shares, or click below to test insufficient-share rejection.'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    <button
                      onClick={handleBeneficiaryDecrypt}
                      disabled={isDecrypting}
                      className="px-6 py-3.5 bg-[#30483B] text-[#F7F4ED] text-xs font-mono uppercase tracking-wider hover:bg-[#242421] transition-colors inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
                    >
                      <KeyRound className="w-4 h-4" />
                      <span>
                        {isDecrypting
                          ? 'Decrypting...'
                          : `Reconstruct & Decrypt (${releasedShareCount}/2 Shares)`}
                      </span>
                    </button>
                  </div>
                </div>

                {decryptError && (
                  <div className="p-4 border border-[#7A3236] bg-[#F5E8E9] text-xs text-[#7A3236] flex items-start gap-2.5">
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{decryptError}</span>
                  </div>
                )}

                {decryptedPlaintext && (
                  <div className="border-t border-[#DED9CE] pt-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-2 text-xs font-mono uppercase text-[#30483B] font-medium">
                        <Unlock className="w-4 h-4" />
                        <span>Decrypted Archival Record ({asset.accessionNumber})</span>
                      </span>
                      <ArchivalStamp state="RELEASED" size="sm" />
                    </div>
                    <pre className="whitespace-pre-wrap font-mono text-xs sm:text-sm text-[#242421] leading-relaxed bg-[#EFECE4]/70 p-5 border border-[#DED9CE]">
                      {decryptedPlaintext}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {/* TWO-COLUMN COHERENT CASE BODY: TIMELINE (LEFT) & GUARDIAN QUORUM + CHALLENGE CLOCK (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left 7 Columns: Chronological Case Timeline */}
        <div className="lg:col-span-7 space-y-6">
          <div className="border-b border-[#DED9CE] pb-3 flex items-center justify-between">
            <h2 className="font-serif text-2xl text-[#242421]">Case Timeline</h2>
            <span className="text-xs font-mono text-[#77736A] tabular-nums">
              {recoveryCase.timeline.length} RECORDED EVENTS
            </span>
          </div>

          <div className="relative pl-6 border-l border-[#242421]/30 space-y-6">
            {recoveryCase.timeline.map((entry, idx) => (
              <div key={entry.id} className="relative">
                <div
                  className={`w-3 h-3 absolute -left-[30.5px] top-1.5 border-2 ${
                    idx === 0
                      ? 'bg-[#242421] border-[#242421]'
                      : 'bg-[#F7F4ED] border-[#242421]'
                  }`}
                />
                <div className="border border-[#DED9CE] bg-[#EFECE4]/40 p-5 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-xs font-mono text-[#77736A] tabular-nums">
                      {entry.timestamp} · <strong className="text-[#242421] font-normal">{entry.actor}</strong> ({entry.actorRole})
                    </div>
                    {entry.stateStamp && <ArchivalStamp state={entry.stateStamp} size="sm" />}
                  </div>

                  <h3 className="font-serif text-xl text-[#242421]">{entry.title}</h3>
                  <p className="text-xs sm:text-sm text-[#77736A] leading-relaxed">
                    {entry.description}
                  </p>
                  <div className="pt-1 text-[11px] font-mono text-[#77736A]">
                    Nonce #{entry.epochNumber} · Ref {entry.txHash}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 5 Columns: Guardian Quorum Status & Safety Layer Controls */}
        <div className="lg:col-span-5 space-y-6">
          {/* Guardian Quorum & Key Shares Table */}
          <div className="border border-[#DED9CE] bg-[#F7F4ED] p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#DED9CE] pb-3">
              <h3 className="font-serif text-2xl text-[#242421]">Guardian Quorum (2 of 3)</h3>
              <span className="font-mono text-xs text-[#30483B] tabular-nums">
                {approvedCount}/3 Approved
              </span>
            </div>

            <div className="divide-y divide-[#DED9CE]">
              {guardians.map((g) => (
                <div key={g.id} className="py-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-[#242421]">{g.name}</div>
                      <div className="text-xs text-[#77736A]">{g.roleTitle}</div>
                    </div>
                    <ArchivalStamp
                      state={
                        g.shareReleased
                          ? 'SHARE RELEASED'
                          : g.decision === 'APPROVED'
                          ? 'VERIFIED'
                          : g.decision === 'OBJECTED'
                          ? 'OBJECTED'
                          : g.decision
                      }
                      size="sm"
                    />
                  </div>

                  {g.decisionNote && (
                    <p className="text-xs text-[#77736A] italic font-serif">
                      “{g.decisionNote}”
                    </p>
                  )}

                  {/* Direct Quick Action if Case is Authorized and Share Not Released */}
                  {isAuthorizedOrReleased && !g.shareReleased && g.decision === 'APPROVED' && (
                    <div className="pt-1">
                      <button
                        onClick={() => onGuardianReleaseShare(g.id)}
                        className="text-xs font-mono uppercase tracking-wider text-[#30483B] hover:underline cursor-pointer"
                      >
                        + Release {g.name.split(' ')[0]}’s Key Share (#{g.index}) →
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Challenge Period Clock Control Box */}
          {recoveryCase.state === 'CHALLENGE_PERIOD' && (
            <div className="border border-[#9C6B30]/60 bg-[#F7EFE4] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#9C6B30] font-medium">
                  <Clock className="w-4 h-4" />
                  <span>72-Hour Safety Window</span>
                </span>
                <span className="font-mono text-sm text-[#242421] font-medium tabular-nums">
                  {recoveryCase.challengeRemainingHours}h left
                </span>
              </div>
              <p className="text-xs text-[#77736A] leading-relaxed">
                For demonstration, advance the simulated clock to see the case transition from <strong>Challenged</strong> to <strong>Authorized</strong>.
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => onAdvanceChallengeClock(24)}
                  className="py-2.5 border border-[#242421] text-[#242421] text-xs font-mono uppercase tracking-wider hover:bg-[#242421] hover:text-[#F7F4ED] transition-colors cursor-pointer"
                >
                  Advance +24h
                </button>
                <button
                  onClick={() => onAdvanceChallengeClock(recoveryCase.challengeRemainingHours)}
                  className="py-2.5 bg-[#242421] text-[#F7F4ED] text-xs font-mono uppercase tracking-wider hover:bg-[#30483B] transition-colors cursor-pointer"
                >
                  Finish 72h Clock
                </button>
              </div>
            </div>
          )}

          {/* Progressive Disclosure: Cryptographic Commitment & Integrity Test */}
          <div className="border border-[#DED9CE] bg-[#F7F4ED]">
            <button
              onClick={() => setShowTechnicalProof(!showTechnicalProof)}
              className="w-full px-5 py-4 flex items-center justify-between text-xs font-mono uppercase tracking-wider text-[#77736A] hover:text-[#242421] cursor-pointer"
            >
              <span>Cryptographic Nonce & Integrity Controls</span>
              {showTechnicalProof ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {showTechnicalProof && (
              <div className="px-5 pb-5 pt-3 border-t border-[#DED9CE] space-y-3 text-xs font-mono text-[#77736A]">
                <div>
                  <div className="text-[10px] uppercase">Evidence Commitment Hash</div>
                  <div className="text-[#242421] break-all mt-0.5">
                    {recoveryCase.evidenceCommitmentHash}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase">Invalidated Prior Nonces</div>
                  <div className="text-[#242421] mt-0.5">
                    Epochs #{recoveryCase.previousInvalidatedEpochs.join(', #')} (Cannot be replayed)
                  </div>
                </div>
                <div className="pt-2 border-t border-[#DED9CE] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase text-[#7A3236]">
                      Ciphertext Tamper Simulation
                    </span>
                    {asset.isTampered && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-[#7A3236]">
                        <AlertTriangle className="w-3 h-3" />
                        <span>CORRUPTED</span>
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      onToggleTamperAsset(asset.id);
                      setDecryptedPlaintext(null);
                      setDecryptError(null);
                    }}
                    className="w-full py-2 border border-[#7A3236] text-[#7A3236] hover:bg-[#F5E8E9] text-xs font-mono uppercase tracking-wider cursor-pointer"
                  >
                    {asset.isTampered
                      ? 'Restore Authentic Ciphertext'
                      : 'Corrupt Ciphertext to Test Integrity Check'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
