import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  AppSection,
  VaultAsset,
  Guardian,
  RecoveryCase,
  AuditEvent,
  UserPerspective
} from './types/heirloom';
import {
  buildInitialEncryptedAssets,
  INITIAL_GUARDIANS,
  INITIAL_RECOVERY_CASE,
  INITIAL_AUDIT_EVENTS
} from './data/mockVaultData';
import { encryptAndSplitRecord, sha256Hex } from './utils/cryptoVault';
import { smoothScrollToY } from './utils/smoothScroll';
import { LandingPage } from './components/LandingPage';
import { OverviewView } from './components/OverviewView';
import { MyVaultView } from './components/MyVaultView';
import { AssetDetailView } from './components/AssetDetailView';
import { RecoveryCaseView } from './components/RecoveryCaseView';
import { GuardiansView } from './components/GuardiansView';
import { ActivityView } from './components/ActivityView';
import { SettingsView } from './components/SettingsView';
import { ArchivalStamp } from './components/ArchivalSeal';
import {
  Menu,
  X,
  ArrowLeft,
  Shield,
  BookOpen,
  Scale,
  Users,
  Clock,
  Settings
} from 'lucide-react';

const STORAGE_KEY = 'heirloom_vault_state_v2';

export default function App() {
  const shouldReduceMotion = useReducedMotion();
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [activeSection, setActiveSection] = useState<AppSection>('landing');
  const [selectedAssetId, setSelectedAssetId] = useState<string>('asset-1');
  const [perspective, setPerspective] = useState<UserPerspective>('owner');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [assets, setAssets] = useState<VaultAsset[]>([]);
  const [guardians, setGuardians] = useState<Guardian[]>(INITIAL_GUARDIANS);
  const [recoveryCase, setRecoveryCase] = useState<RecoveryCase>(INITIAL_RECOVERY_CASE);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>(INITIAL_AUDIT_EVENTS);
  const [lastOwnerCheckIn, setLastOwnerCheckIn] = useState<string>('03 Oct 2026 · 08:30 UTC');
  const [inactivityCadenceDays, setInactivityCadenceDays] = useState<number>(90);
  const [challengeWindowHours, setChallengeWindowHours] = useState<number>(72);

  // Load persisted state from localStorage or build real encrypted seed state
  useEffect(() => {
    let mounted = true;
    async function initVault() {
      try {
        const savedRaw = window.localStorage.getItem(STORAGE_KEY);
        if (savedRaw) {
          const parsed = JSON.parse(savedRaw);
          if (parsed && Array.isArray(parsed.assets) && parsed.assets.length > 0) {
            if (!mounted) return;
            setAssets(parsed.assets);
            setGuardians(parsed.guardians || INITIAL_GUARDIANS);
            setRecoveryCase(parsed.recoveryCase || INITIAL_RECOVERY_CASE);
            setAuditEvents(parsed.auditEvents || INITIAL_AUDIT_EVENTS);
            setLastOwnerCheckIn(parsed.lastOwnerCheckIn || '03 Oct 2026 · 08:30 UTC');
            setInactivityCadenceDays(parsed.inactivityCadenceDays || 90);
            setChallengeWindowHours(parsed.challengeWindowHours || 72);
            if (parsed.activeSection) setActiveSection(parsed.activeSection);
            if (parsed.selectedAssetId) setSelectedAssetId(parsed.selectedAssetId);
            if (parsed.perspective) setPerspective(parsed.perspective);
            setIsInitializing(false);
            return;
          }
        }
      } catch {
        // Fallback to fresh encryption seed
      }

      const encryptedSeeds = await buildInitialEncryptedAssets();
      if (!mounted) return;
      setAssets(encryptedSeeds);
      setIsInitializing(false);
    }

    initVault();
    return () => {
      mounted = false;
    };
  }, []);

  // Persist state changes to localStorage
  useEffect(() => {
    if (isInitializing || assets.length === 0) return;
    try {
      const payload = {
        assets,
        guardians,
        recoveryCase,
        auditEvents,
        lastOwnerCheckIn,
        inactivityCadenceDays,
        challengeWindowHours,
        activeSection,
        selectedAssetId,
        perspective
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage quota errors
    }
  }, [
    isInitializing,
    assets,
    guardians,
    recoveryCase,
    auditEvents,
    lastOwnerCheckIn,
    inactivityCadenceDays,
    challengeWindowHours,
    activeSection,
    selectedAssetId,
    perspective
  ]);

  const handleSelectAsset = (assetId: string) => {
    setSelectedAssetId(assetId);
    setActiveSection('asset-detail');
    smoothScrollToY(0, 620);
  };

  const handleNavigate = (section: AppSection) => {
    setActiveSection(section);
    setMobileMenuOpen(false);
    smoothScrollToY(0, 620);
  };

  // Reset entire demo state to fresh encrypted seed
  const handleResetVaultDemo = async () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setIsInitializing(true);
    const encryptedSeeds = await buildInitialEncryptedAssets();
    setAssets(encryptedSeeds);
    setGuardians(INITIAL_GUARDIANS);
    setRecoveryCase(INITIAL_RECOVERY_CASE);
    setAuditEvents(INITIAL_AUDIT_EVENTS);
    setLastOwnerCheckIn('03 Oct 2026 · 08:30 UTC');
    setInactivityCadenceDays(90);
    setChallengeWindowHours(72);
    setSelectedAssetId('asset-1');
    setPerspective('owner');
    setIsInitializing(false);
    setActiveSection('overview');
  };

  // Owner Check-In: Cancels any active recovery, increments epoch/nonce, invalidates old approvals & released shares
  const handleOwnerCheckIn = () => {
    const nowStamp = '03 Oct 2026 · 21:15 UTC';
    setLastOwnerCheckIn(nowStamp);

    if (recoveryCase.state !== 'CANCELLED_RESEALED' && recoveryCase.state !== 'INACTIVE') {
      const closedEpoch = recoveryCase.epochNumber;
      const nextEpoch = closedEpoch + 1;

      setGuardians((prev) =>
        prev.map((g) => ({
          ...g,
          decision: 'PENDING',
          decisionTimestamp: undefined,
          decisionNote: undefined,
          shareReleased: false,
          shareReleasedAt: undefined
        }))
      );

      setRecoveryCase((prev) => ({
        ...prev,
        epochNumber: nextEpoch,
        previousInvalidatedEpochs: [...prev.previousInvalidatedEpochs, closedEpoch],
        state: 'CANCELLED_RESEALED',
        releasedShareGuardianIds: [],
        timeline: [
          {
            id: `tl-${Date.now()}`,
            timestamp: nowStamp,
            title: `Owner Checked In — Case #${closedEpoch} Cancelled & Vault Re-Sealed`,
            actor: 'Julian Vance-Sterling',
            actorRole: 'Owner',
            description: `Owner check-in invalidated all guardian approvals from Nonce #${closedEpoch} and safely re-sealed the record under Nonce #${nextEpoch}.`,
            stateStamp: 'RE-SEALED',
            txHash: '0x4f9a...2e81',
            epochNumber: nextEpoch
          },
          ...prev.timeline
        ]
      }));

      setAssets((prev) =>
        prev.map((a) =>
          a.id === recoveryCase.assetId ? { ...a, protectionState: 'SEALED' } : a
        )
      );

      setAuditEvents((prev) => [
        {
          id: `aud-${Date.now()}`,
          timestamp: nowStamp,
          actor: 'Julian Vance-Sterling',
          actorRole: 'Owner',
          actionTitle: `Owner Check-In · Recovery Case #${closedEpoch} Cancelled & Re-Sealed`,
          category: 'Safety Layer',
          explanation: `Owner check-in invalidated all guardian approvals from Nonce #${closedEpoch} and re-sealed ${recoveryCase.assetAccession} under Nonce #${nextEpoch}.`,
          assetRef: recoveryCase.assetAccession,
          epochRef: `Nonce #${closedEpoch} → #${nextEpoch}`,
          txHash: '0x4f9a88c12d3e4f5a6b7c8d9e0f1a2b3c4d5e2e81',
          stateAfter: 'SEALED'
        },
        ...prev
      ]);
    } else {
      setAuditEvents((prev) => [
        {
          id: `aud-${Date.now()}`,
          timestamp: nowStamp,
          actor: 'Julian Vance-Sterling',
          actorRole: 'Owner',
          actionTitle: 'Routine Owner Check-In Verified',
          category: 'Check-In',
          explanation: `Vault owner confirmed active custody. Inactivity timer reset for ${inactivityCadenceDays} days.`,
          epochRef: `Nonce #${recoveryCase.epochNumber}`,
          txHash: '0x8b1c44e92a3f7d5c2b1a0e9f8d7c6b5a4f3e1102',
          stateAfter: 'SEALED'
        },
        ...prev
      ]);
    }
  };

  // Request Recovery for any specific asset
  const handleRequestRecoveryForAsset = async (targetAsset: VaultAsset) => {
    const nowStamp = '03 Oct 2026 · 21:18 UTC';
    const nextEpoch =
      recoveryCase.state === 'CANCELLED_RESEALED'
        ? recoveryCase.epochNumber
        : recoveryCase.epochNumber + 1;
    const commitment = await sha256Hex(`${targetAsset.id}:${nextEpoch}:${nowStamp}`);

    setGuardians((prev) =>
      prev.map((g) => ({
        ...g,
        decision: 'PENDING',
        decisionTimestamp: undefined,
        decisionNote: undefined,
        shareReleased: false,
        shareReleasedAt: undefined
      }))
    );

    setRecoveryCase((prev) => ({
      caseId: `CASE-2026-0${nextEpoch}`,
      epochNumber: nextEpoch,
      previousInvalidatedEpochs: prev.previousInvalidatedEpochs.includes(prev.epochNumber)
        ? prev.previousInvalidatedEpochs
        : [...prev.previousInvalidatedEpochs, prev.epochNumber],
      assetId: targetAsset.id,
      assetTitle: targetAsset.title,
      assetAccession: targetAsset.accessionNumber,
      state: 'GUARDIAN_REVIEW',
      initiatedBy: targetAsset.beneficiaryName,
      initiatedByRole: 'Designated Beneficiary',
      initiatedAt: nowStamp,
      evidenceCommitmentHash: `0x${commitment}`,
      evidenceSummary: `Formal recovery petition opened for ${targetAsset.accessionNumber} (${targetAsset.title}). Awaiting 2-of-3 guardian approvals.`,
      challengeRemainingHours: challengeWindowHours,
      challengeTotalHours: challengeWindowHours,
      quorumRequired: 2,
      quorumTotal: 3,
      releasedShareGuardianIds: [],
      timeline: [
        {
          id: `tl-${Date.now()}`,
          timestamp: nowStamp,
          title: `Recovery Case #${nextEpoch} Opened for ${targetAsset.accessionNumber}`,
          actor: targetAsset.beneficiaryName,
          actorRole: 'Beneficiary',
          description: `Beneficiary opened a formal recovery petition for "${targetAsset.title}". Requires 2 of 3 independent guardian approvals.`,
          stateStamp: 'CASE OPENED',
          txHash: `0x${commitment.slice(0, 8)}`,
          epochNumber: nextEpoch
        },
        ...prev.timeline
      ]
    }));

    setAssets((prev) =>
      prev.map((a) =>
        a.id === targetAsset.id ? { ...a, protectionState: 'PROTECTED' } : a
      )
    );

    setActiveSection('recovery');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Guardian Decision (Approve / Reject / Object)
  const handleGuardianAction = (
    guardianId: string,
    decision: 'APPROVED' | 'REJECTED' | 'OBJECTED',
    reason?: string
  ) => {
    const nowStamp = '03 Oct 2026 · 21:20 UTC';
    const targetGuardian = guardians.find((g) => g.id === guardianId);
    if (!targetGuardian) return;

    const updatedGuardians = guardians.map((g) =>
      g.id === guardianId
        ? {
            ...g,
            decision,
            decisionTimestamp: nowStamp,
            decisionNote:
              reason ||
              (decision === 'APPROVED'
                ? 'Verified evidentiary commitment and approved recovery request.'
                : decision === 'OBJECTED'
                ? 'Formal guardian objection filed during challenge window.'
                : 'Declined approval pending additional verification.')
          }
        : g
    );

    setGuardians(updatedGuardians);

    const newApprovedCount = updatedGuardians.filter((g) => g.decision === 'APPROVED').length;
    const hasObjection = updatedGuardians.some((g) => g.decision === 'OBJECTED');

    let nextState = recoveryCase.state;
    let stamp: 'VERIFIED' | 'QUORUM 2/3' | 'OBJECTION FILED' | 'PROTECTED' = 'VERIFIED';

    if (hasObjection) {
      nextState = 'OBJECTED';
      stamp = 'OBJECTION FILED';
    } else if (newApprovedCount >= 2) {
      if (recoveryCase.state !== 'AUTHORIZED' && recoveryCase.state !== 'RELEASED') {
        nextState = 'CHALLENGE_PERIOD';
      }
      stamp = 'QUORUM 2/3';
    } else {
      nextState = 'GUARDIAN_REVIEW';
      stamp = 'PROTECTED';
    }

    setRecoveryCase((prev) => ({
      ...prev,
      state: nextState,
      challengeRemainingHours:
        nextState === 'CHALLENGE_PERIOD' && prev.state !== 'CHALLENGE_PERIOD'
          ? challengeWindowHours
          : prev.challengeRemainingHours,
      timeline: [
        {
          id: `tl-${Date.now()}`,
          timestamp: nowStamp,
          title:
            decision === 'OBJECTED'
              ? `Guardian Objection Filed by ${targetGuardian.name}`
              : decision === 'APPROVED'
              ? `Guardian Approval Recorded by ${targetGuardian.name} (${newApprovedCount}/3)`
              : `Guardian Rejection Recorded by ${targetGuardian.name}`,
          actor: targetGuardian.name,
          actorRole: 'Guardian',
          description:
            decision === 'OBJECTED'
              ? `${targetGuardian.name} filed a formal objection. The challenge clock is paused and automatic release is blocked.`
              : decision === 'APPROVED' && newApprovedCount >= 2
              ? `2-of-3 guardian quorum reached. The mandatory ${challengeWindowHours}-hour Challenge Period is now active.`
              : `${targetGuardian.name} recorded ${decision} on Case #${prev.epochNumber}.`,
          stateStamp: stamp,
          txHash: '0x7c3e...9a14',
          epochNumber: prev.epochNumber
        },
        ...prev.timeline
      ]
    }));

    setAssets((prev) =>
      prev.map((a) =>
        a.id === recoveryCase.assetId
          ? {
              ...a,
              protectionState:
                nextState === 'OBJECTED'
                  ? 'OBJECTED'
                  : nextState === 'CHALLENGE_PERIOD'
                  ? 'CHALLENGED'
                  : 'PROTECTED'
            }
          : a
      )
    );

    setAuditEvents((prev) => [
      {
        id: `aud-${Date.now()}`,
        timestamp: nowStamp,
        actor: targetGuardian.name,
        actorRole: 'Guardian',
        actionTitle: `Guardian ${decision} Recorded (${targetGuardian.name})`,
        category: decision === 'OBJECTED' ? 'Safety Layer' : 'Quorum',
        explanation:
          reason ||
          `${targetGuardian.name} recorded ${decision} on Recovery Case #${recoveryCase.epochNumber}.`,
        assetRef: recoveryCase.assetAccession,
        epochRef: `Nonce #${recoveryCase.epochNumber}`,
        txHash: '0x7c3e91b24d8f0a1c2e3d4f5a6b7c8d9e0f1a9a14',
        stateAfter:
          nextState === 'OBJECTED'
            ? 'OBJECTED'
            : nextState === 'CHALLENGE_PERIOD'
            ? 'CHALLENGED'
            : 'PROTECTED'
      },
      ...prev
    ]);
  };

  // Advance simulated challenge clock
  const handleAdvanceChallengeClock = (hoursToAdvance: number) => {
    if (recoveryCase.state !== 'CHALLENGE_PERIOD') return;

    const remaining = Math.max(0, recoveryCase.challengeRemainingHours - hoursToAdvance);
    const nowStamp = '06 Oct 2026 · 16:42 UTC';

    if (remaining === 0) {
      setRecoveryCase((prev) => ({
        ...prev,
        state: 'AUTHORIZED',
        challengeRemainingHours: 0,
        timeline: [
          {
            id: `tl-${Date.now()}`,
            timestamp: nowStamp,
            title: `72-Hour Challenge Period Completed — Case #${prev.epochNumber} Authorized`,
            actor: 'Heirloom Vault Protocol',
            actorRole: 'Protocol',
            description:
              'The mandatory challenge period concluded with 2-of-3 guardian approvals and zero objections. Guardians may now release their threshold key shares to the beneficiary.',
            stateStamp: 'AUTHORIZED',
            txHash: '0x2a8f...7b99',
            epochNumber: prev.epochNumber
          },
          ...prev.timeline
        ]
      }));

      setAssets((prev) =>
        prev.map((a) =>
          a.id === recoveryCase.assetId ? { ...a, protectionState: 'AUTHORIZED' } : a
        )
      );

      setAuditEvents((prev) => [
        {
          id: `aud-${Date.now()}`,
          timestamp: nowStamp,
          actor: 'Vault Protocol',
          actorRole: 'Vault Protocol',
          actionTitle: `Challenge Window Completed · Case #${recoveryCase.epochNumber} Authorized`,
          category: 'Recovery',
          explanation: `72-hour challenge period concluded uncontested. Key share release is now unlocked for ${recoveryCase.assetAccession}.`,
          assetRef: recoveryCase.assetAccession,
          epochRef: `Nonce #${recoveryCase.epochNumber}`,
          txHash: '0x2a8f77c12d3e4f5a6b7c8d9e0f1a2b3c4d5e7b99',
          stateAfter: 'AUTHORIZED'
        },
        ...prev
      ]);
    } else {
      setRecoveryCase((prev) => ({
        ...prev,
        challengeRemainingHours: remaining
      }));
    }
  };

  // Release a guardian's threshold key share once case is AUTHORIZED
  const handleGuardianReleaseShare = (guardianId: string) => {
    if (recoveryCase.state !== 'AUTHORIZED' && recoveryCase.state !== 'RELEASED') return;
    const target = guardians.find((g) => g.id === guardianId);
    if (!target || target.shareReleased) return;

    const nowStamp = '06 Oct 2026 · 17:05 UTC';

    setGuardians((prev) =>
      prev.map((g) =>
        g.id === guardianId
          ? { ...g, shareReleased: true, shareReleasedAt: nowStamp }
          : g
      )
    );

    const nextReleasedIds = Array.from(
      new Set([...recoveryCase.releasedShareGuardianIds, guardianId])
    );
    const hasTwoShares = nextReleasedIds.length >= 2;

    setRecoveryCase((prev) => ({
      ...prev,
      state: hasTwoShares ? 'RELEASED' : 'AUTHORIZED',
      releasedShareGuardianIds: nextReleasedIds,
      timeline: [
        {
          id: `tl-${Date.now()}`,
          timestamp: nowStamp,
          title: `Threshold Key Share #${target.index} Released by ${target.name} (${nextReleasedIds.length}/2 Required)`,
          actor: target.name,
          actorRole: 'Guardian',
          description: hasTwoShares
            ? `2 of 3 threshold key shares have now been released. Beneficiary Hannah Vance can reconstruct the AES-256-GCM master key locally.`
            : `${target.name} released threshold key share #${target.index}. One additional guardian share is required to reconstruct the master key.`,
          stateStamp: 'SHARE RELEASED',
          txHash: '0x9d1c...4a02',
          epochNumber: prev.epochNumber
        },
        ...prev.timeline
      ]
    }));

    if (hasTwoShares) {
      setAssets((prev) =>
        prev.map((a) =>
          a.id === recoveryCase.assetId ? { ...a, protectionState: 'RELEASED' } : a
        )
      );
    }

    setAuditEvents((prev) => [
      {
        id: `aud-${Date.now()}`,
        timestamp: nowStamp,
        actor: target.name,
        actorRole: 'Guardian',
        actionTitle: `Threshold Key Share #${target.index} Released (${nextReleasedIds.length}/2)`,
        category: 'Recovery',
        explanation: `${target.name} released threshold key share #${target.index} for ${recoveryCase.assetAccession}.`,
        assetRef: recoveryCase.assetAccession,
        epochRef: `Nonce #${recoveryCase.epochNumber}`,
        txHash: '0x9d1c55b82e4f0a1c2e3d4f5a6b7c8d9e0f1a4a02',
        stateAfter: hasTwoShares ? 'RELEASED' : 'AUTHORIZED'
      },
      ...prev
    ]);
  };

  // Beneficiary initiates a new recovery attempt after a prior cancellation
  const handleBeneficiaryRequestNewRecovery = (evidenceNote: string) => {
    const nowStamp = '04 Oct 2026 · 10:00 UTC';
    const currentEpoch = recoveryCase.epochNumber;

    setGuardians((prev) =>
      prev.map((g) => ({
        ...g,
        decision: 'PENDING',
        decisionTimestamp: undefined,
        decisionNote: undefined,
        shareReleased: false,
        shareReleasedAt: undefined
      }))
    );

    setRecoveryCase((prev) => ({
      ...prev,
      caseId: `CASE-2026-0${currentEpoch}`,
      state: 'GUARDIAN_REVIEW',
      initiatedAt: nowStamp,
      evidenceSummary:
        evidenceNote.trim() ||
        'Fresh recovery petition submitted under new recovery nonce.',
      challengeRemainingHours: challengeWindowHours,
      releasedShareGuardianIds: [],
      timeline: [
        {
          id: `tl-${Date.now()}`,
          timestamp: nowStamp,
          title: `New Recovery Case #${currentEpoch} Requested (Fresh Quorum Required)`,
          actor: 'Hannah Vance',
          actorRole: 'Beneficiary',
          description: `Beneficiary opened a new recovery petition under Nonce #${currentEpoch}. All prior guardian approvals remain invalidated.`,
          stateStamp: 'CASE OPENED',
          txHash: '0x9e4b...3d08',
          epochNumber: currentEpoch
        },
        ...prev.timeline
      ]
    }));

    setAssets((prev) =>
      prev.map((a) =>
        a.id === recoveryCase.assetId ? { ...a, protectionState: 'PROTECTED' } : a
      )
    );
  };

  // Toggle ciphertext tampering on an asset to demonstrate real SHA-256 / AES-GCM integrity check
  const handleToggleTamperAsset = (assetId: string) => {
    setAssets((prev) =>
      prev.map((a) => {
        if (a.id !== assetId) return a;
        if (a.isTampered) {
          return {
            ...a,
            ciphertextBase64: a.originalCiphertextBase64,
            isTampered: false
          };
        } else {
          // Flip characters in the middle of the base64 ciphertext
          const orig = a.originalCiphertextBase64;
          const mid = Math.floor(orig.length / 2);
          const replacementChar = orig[mid] === 'A' ? 'B' : 'A';
          const corrupted =
            orig.slice(0, mid) + replacementChar + orig.slice(mid + 1);
          return {
            ...a,
            ciphertextBase64: corrupted,
            isTampered: true
          };
        }
      })
    );
  };

  // Log when a record is decrypted locally
  const handleRecordDecrypted = (decryptedAsset: VaultAsset) => {
    setAssets((prev) =>
      prev.map((a) =>
        a.id === decryptedAsset.id ? { ...a, protectionState: 'RELEASED' } : a
      )
    );
  };

  // Create & Seal a new asset using real browser AES-256-GCM encryption and 2-of-3 key splitting
  const handleCreateAsset = async (newRecord: {
    title: string;
    subtitle: string;
    category: VaultAsset['category'];
    beneficiaryName: string;
    summaryDescription: string;
    plaintextSecret: string;
  }) => {
    const bundle = await encryptAndSplitRecord(newRecord.plaintextSecret);
    const nextNum = assets.length + 1;
    const accession = `HLM-2026-00${nextNum}`;

    const created: VaultAsset = {
      id: `asset-${Date.now()}`,
      accessionNumber: accession,
      title: newRecord.title,
      subtitle: newRecord.subtitle,
      category: newRecord.category,
      createdDate: '03 October 2026',
      lastVerifiedDate: '03 October 2026',
      protectionState: 'SEALED',
      ownerName: 'Julian Vance-Sterling',
      ownerAddress: '0x88A1...4E9B',
      beneficiaryName: newRecord.beneficiaryName,
      beneficiaryRelation: 'Designated Successor',
      beneficiaryAddress: '0x42C9...77D1',
      quorumPolicy: `2 of 3 Independent Guardians + ${challengeWindowHours}-Hour Challenge Window`,
      challengeWindowHours,
      inactivityThresholdDays: inactivityCadenceDays,
      summaryDescription: newRecord.summaryDescription,
      sealedContentsPreview: [
        `Encrypted Archival Payload (${bundle.algorithm})`,
        `SHA-256 Verified Digest: ${bundle.contentSha256.slice(0, 18)}...`
      ],
      ciphertextBase64: bundle.ciphertextBase64,
      originalCiphertextBase64: bundle.ciphertextBase64,
      ivBase64: bundle.ivBase64,
      contentHash: `sha256:${bundle.contentSha256}`,
      ciphertextHash: bundle.ciphertextSha256,
      encryptionCipher: bundle.algorithm,
      storageReference: `local-vault://${accession.toLowerCase()}`,
      contractPolicyId: `HLM-POL-0x5D88A12E · Nonce #${recoveryCase.epochNumber}`,
      guardianKeyShares: {
        'g-1': bundle.shares.share1,
        'g-2': bundle.shares.share2,
        'g-3': bundle.shares.share3
      },
      isTampered: false
    };

    setAssets((prev) => [created, ...prev]);
    setAuditEvents((prev) => [
      {
        id: `aud-${Date.now()}`,
        timestamp: '03 Oct 2026 · 21:25 UTC',
        actor: 'Julian Vance-Sterling',
        actorRole: 'Owner',
        actionTitle: `Record Encrypted & Sealed (${accession})`,
        category: 'Preservation',
        explanation: `"${created.title}" was encrypted in the browser with AES-256-GCM and split into 2-of-3 guardian key shares.`,
        assetRef: accession,
        epochRef: `Nonce #${recoveryCase.epochNumber}`,
        txHash: `0x${bundle.ciphertextSha256.slice(0, 40)}`,
        stateAfter: 'SEALED'
      },
      ...prev
    ]);
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#F7F4ED] text-[#242421] flex items-center justify-center p-6">
        <div className="text-center space-y-2">
          <div className="font-serif text-2xl tracking-[0.14em] uppercase">Heirloom</div>
          <div className="text-xs font-mono text-[#77736A] uppercase tracking-wider">
            Verifying Local Cryptographic Archive...
          </div>
        </div>
      </div>
    );
  }

  if (activeSection === 'landing') {
    return (
      <LandingPage
        onEnterVault={() => handleNavigate('overview')}
        onExploreRecoveryCase={() => handleNavigate('recovery')}
      />
    );
  }

  const currentAsset = assets.find((a) => a.id === selectedAssetId) || assets[0];
  const recoveryAsset =
    assets.find((a) => a.id === recoveryCase.assetId) || assets[0];

  const navItems: { id: AppSection; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <Shield className="w-4 h-4" /> },
    { id: 'vault', label: 'My Vault', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'recovery', label: 'Recovery', icon: <Scale className="w-4 h-4" /> },
    { id: 'guardians', label: 'Guardians', icon: <Users className="w-4 h-4" /> },
    { id: 'activity', label: 'Activity', icon: <Clock className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-[#F7F4ED] text-[#242421] flex flex-col lg:flex-row selection:bg-[#30483B] selection:text-[#F7F4ED]">
      {/* Quiet Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 border-r border-[#DED9CE] bg-[#EFECE4]/50 shrink-0 justify-between sticky top-0 h-screen">
        <div className="p-7 space-y-10">
          <div className="border-b border-[#DED9CE] pb-5">
            <button
              onClick={() => handleNavigate('landing')}
              className="font-serif text-2xl tracking-[0.14em] uppercase font-medium text-[#242421] hover:text-[#30483B] transition-colors cursor-pointer"
            >
              Heirloom
            </button>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive =
                activeSection === item.id ||
                (activeSection === 'asset-detail' && item.id === 'vault');
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-mono uppercase tracking-[0.12em] transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#242421] text-[#F7F4ED] font-medium'
                      : 'text-[#77736A] hover:text-[#242421] hover:bg-[#EFECE4]'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quiet Account & Landing Return */}
        <div className="p-6 border-t border-[#DED9CE] space-y-4">
          <div>
            <div className="text-[11px] font-mono uppercase text-[#77736A]">
              Active Perspective
            </div>
            <div className="text-xs font-medium text-[#242421] mt-0.5 capitalize">
              {perspective} View
            </div>
          </div>

          <button
            onClick={() => handleNavigate('landing')}
            className="w-full pt-3 border-t border-[#DED9CE] flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-[#77736A] hover:text-[#242421] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Landing Story</span>
          </button>
        </div>
      </aside>

      {/* Mobile Compact Header */}
      <header className="lg:hidden border-b border-[#DED9CE] bg-[#F7F4ED] px-5 h-14 flex items-center justify-between sticky top-0 z-30">
        <button
          onClick={() => handleNavigate('landing')}
          className="font-serif text-xl tracking-[0.14em] uppercase font-medium text-[#242421]"
        >
          Heirloom
        </button>

        <div className="flex items-center gap-3">
          <ArchivalStamp
            state={
              recoveryCase.state === 'CANCELLED_RESEALED'
                ? 'SEALED'
                : recoveryCase.state
            }
            size="sm"
          />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-[#242421] border border-[#DED9CE]"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-[#242421] bg-[#EFECE4] px-5 py-4 space-y-2 z-20">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-mono uppercase tracking-wider ${
                activeSection === item.id
                  ? 'bg-[#242421] text-[#F7F4ED]'
                  : 'text-[#242421]'
              }`}
            >
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Clean 3-Zone Workspace Top Bar */}
        <div className="hidden lg:flex items-center justify-between px-10 xl:px-14 h-16 border-b border-[#DED9CE] bg-[#F7F4ED]">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#77736A]">
            <span>Archive</span>
            <span>/</span>
            <span className="text-[#242421] font-medium">
              {activeSection === 'asset-detail' ? currentAsset.accessionNumber : activeSection}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-[#77736A]">
            <span>Role:</span>
            {(['owner', 'guardian', 'beneficiary'] as UserPerspective[]).map((p) => (
              <button
                key={p}
                onClick={() => {
                  setPerspective(p);
                  if (p !== 'owner' && activeSection !== 'recovery') {
                    setActiveSection('recovery');
                  }
                }}
                className={`px-2.5 py-1 uppercase transition-colors cursor-pointer ${
                  perspective === p
                    ? 'bg-[#242421] text-[#F7F4ED]'
                    : 'hover:text-[#242421] bg-[#EFECE4]/70'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <ArchivalStamp
              state={
                recoveryCase.state === 'CANCELLED_RESEALED'
                  ? 'SEALED'
                  : recoveryCase.state
              }
              size="sm"
            />
          </div>
        </div>

        {/* Spacious Main Canvas */}
        <main className="flex-1 max-w-[1120px] w-full mx-auto px-6 sm:px-10 xl:px-14 py-10 sm:py-14">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeSection}-${selectedAssetId}`}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
            >
              {activeSection === 'overview' && (
                <OverviewView
                  assets={assets}
                  recoveryCase={recoveryCase}
                  guardians={guardians}
                  lastOwnerCheckIn={lastOwnerCheckIn}
                  onNavigate={handleNavigate}
                  onSelectAsset={handleSelectAsset}
                  onOwnerCheckIn={handleOwnerCheckIn}
                />
              )}

              {activeSection === 'vault' && (
                <MyVaultView
                  assets={assets}
                  onSelectAsset={handleSelectAsset}
                  onCreateAsset={handleCreateAsset}
                />
              )}

              {activeSection === 'asset-detail' && (
                <AssetDetailView
                  asset={currentAsset}
                  guardians={guardians}
                  recoveryCase={recoveryCase}
                  onBack={() => handleNavigate('vault')}
                  onNavigate={handleNavigate}
                  onRequestRecoveryForAsset={handleRequestRecoveryForAsset}
                  onToggleTamperAsset={handleToggleTamperAsset}
                  onRecordDecrypted={handleRecordDecrypted}
                />
              )}

              {activeSection === 'recovery' && (
                <RecoveryCaseView
                  recoveryCase={recoveryCase}
                  asset={recoveryAsset}
                  guardians={guardians}
                  perspective={perspective}
                  onChangePerspective={setPerspective}
                  onGuardianAction={handleGuardianAction}
                  onGuardianReleaseShare={handleGuardianReleaseShare}
                  onOwnerCancelAndReseal={handleOwnerCheckIn}
                  onBeneficiaryRequestNewRecovery={handleBeneficiaryRequestNewRecovery}
                  onAdvanceChallengeClock={handleAdvanceChallengeClock}
                  onToggleTamperAsset={handleToggleTamperAsset}
                  onRecordDecrypted={handleRecordDecrypted}
                />
              )}

              {activeSection === 'guardians' && (
                <GuardiansView
                  guardians={guardians}
                  recoveryCase={recoveryCase}
                  onSimulateGuardianDecision={(gId, decision) =>
                    handleGuardianAction(gId, decision)
                  }
                  onGuardianReleaseShare={handleGuardianReleaseShare}
                  onNavigate={handleNavigate}
                />
              )}

              {activeSection === 'activity' && <ActivityView events={auditEvents} />}

              {activeSection === 'settings' && (
                <SettingsView
                  inactivityCadenceDays={inactivityCadenceDays}
                  challengeWindowHours={challengeWindowHours}
                  onUpdatePolicy={(cadence, hours) => {
                    setInactivityCadenceDays(cadence);
                    setChallengeWindowHours(hours);
                  }}
                  onResetVaultDemo={handleResetVaultDemo}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
