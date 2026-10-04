import React, { useState } from 'react';
import { VaultAsset, Guardian, RecoveryCase, AppSection } from '../types/heirloom';
import { ArchivalStamp } from './ArchivalSeal';
import { verifyAndDecryptRecord } from '../utils/cryptoVault';
import {
  ArrowLeft,
  Lock,
  Unlock,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';

interface AssetDetailViewProps {
  asset: VaultAsset;
  guardians: Guardian[];
  recoveryCase: RecoveryCase;
  onBack: () => void;
  onNavigate: (section: AppSection) => void;
  onRequestRecoveryForAsset: (asset: VaultAsset) => void;
  onToggleTamperAsset: (assetId: string) => void;
  onRecordDecrypted: (asset: VaultAsset) => void;
}

export const AssetDetailView: React.FC<AssetDetailViewProps> = ({
  asset,
  guardians,
  recoveryCase,
  onBack,
  onNavigate,
  onRequestRecoveryForAsset,
  onToggleTamperAsset,
  onRecordDecrypted
}) => {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [decryptedPlaintext, setDecryptedPlaintext] = useState<string | null>(null);
  const [verifiedHash, setVerifiedHash] = useState<string | null>(null);
  const [decryptError, setDecryptError] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);

  const isActiveRecoveryAsset = recoveryCase.assetId === asset.id;
  const isAuthorizedOrReleased =
    isActiveRecoveryAsset &&
    (recoveryCase.state === 'AUTHORIZED' || recoveryCase.state === 'RELEASED');

  const releasedCount = isActiveRecoveryAsset
    ? recoveryCase.releasedShareGuardianIds.length
    : 0;

  const effectiveStamp = isActiveRecoveryAsset
    ? recoveryCase.state === 'CANCELLED_RESEALED'
      ? 'SEALED'
      : recoveryCase.state
    : asset.protectionState;

  const handleLocalDecrypt = async () => {
    setIsDecrypting(true);
    setDecryptError(null);

    try {
      if (!isActiveRecoveryAsset || !isAuthorizedOrReleased) {
        throw new Error(
          'Access Denied: This record is still SEALED. Recovery must be authorized by 2-of-3 guardians and complete the 72-hour challenge period before key reconstruction.'
        );
      }

      const releasedShares = recoveryCase.releasedShareGuardianIds.map(
        (gId) => asset.guardianKeyShares[gId as 'g-1' | 'g-2' | 'g-3']
      );

      const result = await verifyAndDecryptRecord({
        ciphertextBase64: asset.ciphertextBase64,
        ivBase64: asset.ivBase64,
        expectedCiphertextSha256: asset.ciphertextHash,
        expectedContentSha256: asset.contentHash.replace('sha256:', ''),
        releasedShares
      });

      setDecryptedPlaintext(result.plaintext);
      setVerifiedHash(result.verifiedContentHash);
      onRecordDecrypted(asset);
    } catch (err) {
      setDecryptedPlaintext(null);
      setVerifiedHash(null);
      setDecryptError(err instanceof Error ? err.message : 'Decryption failed');
    } finally {
      setIsDecrypting(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Top Return Bar */}
      <div className="flex items-center justify-between border-b border-[#DED9CE] pb-5">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#77736A] hover:text-[#242421] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to My Vault</span>
        </button>

        <div className="flex items-center gap-3 text-xs font-mono text-[#77736A]">
          <span>{asset.accessionNumber}</span>
          <span>·</span>
          <ArchivalStamp state={effectiveStamp} size="sm" />
        </div>
      </div>

      {/* RECORD HEADER & PRIMARY ACTION */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-[#DED9CE] pb-10">
        <div className="space-y-3 max-w-2xl">
          <div className="text-xs font-mono uppercase tracking-[0.14em] text-[#B0925A]">
            {asset.category}
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-normal text-[#242421] leading-tight">
            {asset.title}
          </h1>
          <p className="text-base text-[#77736A] leading-relaxed">
            {asset.summaryDescription}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {isActiveRecoveryAsset &&
          recoveryCase.state !== 'INACTIVE' &&
          recoveryCase.state !== 'CANCELLED_RESEALED' ? (
            <button
              onClick={() => onNavigate('recovery')}
              className="px-6 py-3.5 bg-[#242421] text-[#F7F4ED] text-xs font-medium uppercase tracking-[0.14em] hover:bg-[#30483B] transition-colors cursor-pointer whitespace-nowrap"
            >
              Open Active Recovery Case #{recoveryCase.epochNumber}
            </button>
          ) : (
            <button
              onClick={() => onRequestRecoveryForAsset(asset)}
              className="px-6 py-3.5 bg-[#242421] text-[#F7F4ED] text-xs font-medium uppercase tracking-[0.14em] hover:bg-[#30483B] transition-colors cursor-pointer whitespace-nowrap"
            >
              Request Recovery for This Record
            </button>
          )}
        </div>
      </section>

      {/* CORE RECORD METADATA & SIGNATURE SEALED CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left 7 Columns: Record Particulars & Contents */}
        <div className="lg:col-span-7 space-y-10">
          <dl className="border-t border-b border-[#DED9CE] divide-y divide-[#DED9CE] text-sm">
            <div className="py-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2">
              <dt className="font-mono text-xs uppercase tracking-wider text-[#77736A]">
                Owner
              </dt>
              <dd className="sm:col-span-2 text-[#242421]">{asset.ownerName}</dd>
            </div>
            <div className="py-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2">
              <dt className="font-mono text-xs uppercase tracking-wider text-[#77736A]">
                Designated Beneficiary
              </dt>
              <dd className="sm:col-span-2 text-[#242421]">
                {asset.beneficiaryName} ({asset.beneficiaryRelation})
              </dd>
            </div>
            <div className="py-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2">
              <dt className="font-mono text-xs uppercase tracking-wider text-[#77736A]">
                Recovery Policy
              </dt>
              <dd className="sm:col-span-2 text-[#242421] font-medium">
                {asset.quorumPolicy}
              </dd>
            </div>
            <div className="py-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2">
              <dt className="font-mono text-xs uppercase tracking-wider text-[#77736A]">
                Assigned Guardians
              </dt>
              <dd className="sm:col-span-2 text-[#242421]">
                {guardians.map((g) => g.name).join(' · ')}
              </dd>
            </div>
            <div className="py-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2">
              <dt className="font-mono text-xs uppercase tracking-wider text-[#77736A]">
                Preserved Date
              </dt>
              <dd className="sm:col-span-2 text-[#77736A] font-mono text-xs">
                {asset.createdDate} · Verified {asset.lastVerifiedDate}
              </dd>
            </div>
          </dl>

          {/* Decrypted Plaintext View (If Unlocked) OR Sealed Manifest */}
          {decryptedPlaintext ? (
            <div className="border-2 border-[#30483B] bg-[#F7F4ED] p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between border-b border-[#DED9CE] pb-3">
                <span className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#30483B] font-medium">
                  <Unlock className="w-4 h-4" />
                  <span>Unsealed Archival Plaintext (Verified AES-256-GCM)</span>
                </span>
                <ArchivalStamp state="RELEASED" size="sm" />
              </div>

              <pre className="whitespace-pre-wrap font-mono text-xs sm:text-sm text-[#242421] leading-relaxed bg-[#EFECE4]/60 p-5 border border-[#DED9CE]">
                {decryptedPlaintext}
              </pre>

              <div className="flex items-center justify-between text-[11px] font-mono text-[#30483B] pt-1">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>SHA-256 Content Integrity Verified</span>
                </span>
                <span className="truncate max-w-xs">{verifiedHash}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-2xl text-[#242421]">
                  Sealed Contents Manifest
                </h2>
                <span className="text-xs font-mono text-[#77736A]">
                  {asset.sealedContentsPreview.length} ITEMS ENCRYPTED
                </span>
              </div>

              <div className="border border-[#DED9CE] bg-[#EFECE4]/40 divide-y divide-[#DED9CE]">
                {asset.sealedContentsPreview.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 flex items-center justify-between gap-4 text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <Lock className="w-3.5 h-3.5 text-[#30483B] shrink-0" />
                      <span className="text-[#242421]">{item}</span>
                    </div>
                    <span className="text-[11px] font-mono uppercase text-[#77736A]">
                      Sealed
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right 5 Columns: Signature SEALED State & Local Reconstruction Box */}
        <div className="lg:col-span-5 space-y-6">
          <div className="border border-[#242421] bg-[#EFECE4] p-7 space-y-6">
            <div className="flex items-center justify-between border-b border-[#DED9CE] pb-4">
              <span className="text-xs font-mono uppercase tracking-[0.14em] text-[#77736A]">
                Container Custody State
              </span>
              <ArchivalStamp state={effectiveStamp} size="lg" />
            </div>

            <div className="space-y-3">
              <h3 className="font-serif text-2xl text-[#242421]">
                {isAuthorizedOrReleased
                  ? releasedCount >= 2
                    ? 'Ready for Local Browser Decryption'
                    : `Authorized — Waiting for Guardian Key Shares (${releasedCount}/2)`
                  : 'Underlying Contents Are Sealed'}
              </h3>
              <p className="text-xs sm:text-sm text-[#77736A] leading-relaxed">
                {isAuthorizedOrReleased
                  ? releasedCount >= 2
                    ? 'At least 2 guardian key shares have been released. You can now reconstruct the master key and decrypt the record locally.'
                    : 'Recovery is authorized. Once 2 of 3 guardians release their key shares in the Recovery Case File, you can unseal this record.'
                  : 'This record is encrypted with AES-256-GCM. It cannot be opened directly until a recovery case completes both the 2-of-3 guardian quorum and the 72-hour challenge period.'}
              </p>
            </div>

            {decryptError && (
              <div className="p-4 border border-[#7A3236] bg-[#F5E8E9] text-xs text-[#7A3236] flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{decryptError}</span>
              </div>
            )}

            <div className="space-y-2.5 pt-2">
              <button
                onClick={handleLocalDecrypt}
                disabled={isDecrypting}
                className="w-full py-3.5 bg-[#30483B] text-[#F7F4ED] text-xs font-mono uppercase tracking-[0.14em] hover:bg-[#242421] transition-colors cursor-pointer"
              >
                {isDecrypting
                  ? 'Verifying SHA-256 & Reconstructing Key...'
                  : decryptedPlaintext
                  ? 'Re-Verify & Decrypt Record'
                  : `Verify Integrity & Unseal (${releasedCount}/2 Shares Released)`}
              </button>

              {!isAuthorizedOrReleased && (
                <button
                  onClick={() => onNavigate('recovery')}
                  className="w-full py-3 border border-[#242421] text-[#242421] text-xs font-mono uppercase tracking-[0.14em] hover:bg-[#242421] hover:text-[#F7F4ED] transition-colors cursor-pointer"
                >
                  Go to Recovery Case File →
                </button>
              )}
            </div>
          </div>

          {/* Progressive Disclosure: Technical & Integrity Verification */}
          <div className="border border-[#DED9CE] bg-[#F7F4ED]">
            <button
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="w-full px-5 py-4 flex items-center justify-between text-xs font-mono uppercase tracking-wider text-[#77736A] hover:text-[#242421] cursor-pointer"
            >
              <span>Cryptographic Details & Tamper Test</span>
              {showTechnicalDetails ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {showTechnicalDetails && (
              <div className="px-5 pb-5 pt-3 border-t border-[#DED9CE] space-y-4 text-xs font-mono text-[#77736A]">
                <div>
                  <div className="text-[10px] uppercase">Cipher & Threshold Split</div>
                  <div className="text-[#242421] mt-0.5">{asset.encryptionCipher}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase">Plaintext SHA-256 Commitment</div>
                  <div className="text-[#242421] mt-0.5 break-all">{asset.contentHash}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase">Ciphertext SHA-256 Commitment</div>
                  <div className="text-[#242421] mt-0.5 break-all">{asset.ciphertextHash}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase">AES-GCM Ciphertext Payload (Preview)</div>
                  <div className="text-[#242421] mt-0.5 truncate bg-[#EFECE4] p-2 border border-[#DED9CE]">
                    {asset.ciphertextBase64.slice(0, 72)}...
                  </div>
                </div>

                {/* Tamper / Integrity Verification Test Control */}
                <div className="pt-3 border-t border-[#DED9CE] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase text-[#7A3236]">
                      Integrity Verification Test
                    </span>
                    {asset.isTampered && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-[#7A3236] font-medium">
                        <AlertTriangle className="w-3 h-3" />
                        <span>CIPHERTEXT CORRUPTED</span>
                      </span>
                    )}
                  </div>
                  <p className="font-sans text-xs text-[#77736A]">
                    Simulate storage tampering by corrupting a byte of the ciphertext. Attempting to unseal will fail SHA-256 and AES-GCM authentication.
                  </p>
                  <button
                    onClick={() => {
                      onToggleTamperAsset(asset.id);
                      setDecryptedPlaintext(null);
                      setDecryptError(null);
                    }}
                    className={`w-full py-2 border text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                      asset.isTampered
                        ? 'border-[#30483B] text-[#30483B] bg-[#E8EFEA]'
                        : 'border-[#7A3236] text-[#7A3236] hover:bg-[#F5E8E9]'
                    }`}
                  >
                    {asset.isTampered
                      ? 'Restore Authentic Ciphertext'
                      : 'Simulate Ciphertext Tampering'}
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
