export type UserPerspective = 'owner' | 'guardian' | 'beneficiary';

export type AppSection =
  | 'landing'
  | 'overview'
  | 'vault'
  | 'asset-detail'
  | 'recovery'
  | 'guardians'
  | 'activity'
  | 'settings';

export type ProtectionState =
  | 'SEALED'
  | 'PROTECTED'
  | 'VERIFIED'
  | 'CHALLENGED'
  | 'OBJECTED'
  | 'AUTHORIZED'
  | 'RELEASED';

export type RecoveryCaseState =
  | 'INACTIVE'
  | 'REQUESTED'
  | 'GUARDIAN_REVIEW'
  | 'CHALLENGE_PERIOD'
  | 'OBJECTED'
  | 'CANCELLED_RESEALED'
  | 'AUTHORIZED'
  | 'RELEASED';

export type GuardianDecision = 'PENDING' | 'APPROVED' | 'REJECTED' | 'OBJECTED';

export interface Guardian {
  id: string;
  index: 1 | 2 | 3;
  name: string;
  roleTitle: string;
  relationship: string;
  publicKeyRef: string;
  location: string;
  availability: 'Verified & Active' | 'Responsive';
  lastVerified: string;
  decision: GuardianDecision;
  decisionTimestamp?: string;
  decisionNote?: string;
  /** Whether this guardian has released their threshold key share after AUTHORIZED */
  shareReleased: boolean;
  shareReleasedAt?: string;
}

export interface VaultAsset {
  id: string;
  accessionNumber: string;
  title: string;
  subtitle: string;
  category:
    | 'Estate Directive'
    | 'Cryptographic Custody'
    | 'Personal Correspondence'
    | 'Corporate Succession';
  createdDate: string;
  lastVerifiedDate: string;
  protectionState: ProtectionState;
  ownerName: string;
  ownerAddress: string;
  beneficiaryName: string;
  beneficiaryRelation: string;
  beneficiaryAddress: string;
  quorumPolicy: string;
  challengeWindowHours: number;
  inactivityThresholdDays: number;
  summaryDescription: string;
  sealedContentsPreview: string[];
  // Real browser cryptographic fields
  ciphertextBase64: string;
  originalCiphertextBase64: string; // Stored to allow restoring if user tests tamper simulation
  ivBase64: string;
  contentHash: string;
  ciphertextHash: string;
  encryptionCipher: string;
  storageReference: string;
  contractPolicyId: string;
  /** Threshold shares mapped to g-1, g-2, g-3 */
  guardianKeyShares: {
    'g-1': string;
    'g-2': string;
    'g-3': string;
  };
  isTampered?: boolean;
}

export interface TimelineEntry {
  id: string;
  timestamp: string;
  title: string;
  actor: string;
  actorRole: 'Owner' | 'Beneficiary' | 'Guardian' | 'Protocol';
  description: string;
  stateStamp?: ProtectionState | 'CASE OPENED' | 'QUORUM 2/3' | 'OBJECTION FILED' | 'RE-SEALED' | 'SHARE RELEASED';
  txHash: string;
  epochNumber: number;
}

export interface RecoveryCase {
  caseId: string;
  epochNumber: number;
  previousInvalidatedEpochs: number[];
  assetId: string;
  assetTitle: string;
  assetAccession: string;
  state: RecoveryCaseState;
  initiatedBy: string;
  initiatedByRole: string;
  initiatedAt: string;
  evidenceCommitmentHash: string;
  evidenceSummary: string;
  challengeRemainingHours: number;
  challengeTotalHours: number;
  quorumRequired: number;
  quorumTotal: number;
  /** Guardian IDs that have released their key share for the current epoch */
  releasedShareGuardianIds: string[];
  timeline: TimelineEntry[];
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: 'Owner' | 'Guardian' | 'Beneficiary' | 'Vault Protocol';
  actionTitle: string;
  category: 'Preservation' | 'Check-In' | 'Recovery' | 'Quorum' | 'Safety Layer';
  explanation: string;
  assetRef?: string;
  epochRef: string;
  txHash: string;
  stateAfter: ProtectionState;
}
