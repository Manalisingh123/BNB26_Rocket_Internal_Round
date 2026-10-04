import { VaultAsset, Guardian, RecoveryCase, AuditEvent } from '../types/heirloom';
import { encryptAndSplitRecord } from '../utils/cryptoVault';

export const INITIAL_GUARDIANS: Guardian[] = [
  {
    id: 'g-1',
    index: 1,
    name: 'Dr. Clara Vance',
    roleTitle: 'Primary Legal Fiduciary',
    relationship: 'Estate Counsel · Zurich',
    publicKeyRef: '0x7F4C...91A2',
    location: 'Zurich, Switzerland',
    availability: 'Verified & Active',
    lastVerified: '02 Oct 2026',
    decision: 'APPROVED',
    decisionTimestamp: '02 Oct 2026 · 09:14 UTC',
    decisionNote: 'Verified certified hospital admission affidavit and secondary family notice.',
    shareReleased: false
  },
  {
    id: 'g-2',
    index: 2,
    name: 'Marcus Sterling',
    roleTitle: 'Trusted Sibling & Executor',
    relationship: 'Brother · London',
    publicKeyRef: '0x3B9E...44C8',
    location: 'London, United Kingdom',
    availability: 'Verified & Active',
    lastVerified: '02 Oct 2026',
    decision: 'APPROVED',
    decisionTimestamp: '02 Oct 2026 · 16:42 UTC',
    decisionNote: 'Confirmed inability of owner to access primary hardware token during extended absence.',
    shareReleased: false
  },
  {
    id: 'g-3',
    index: 3,
    name: 'Elena Rostova',
    roleTitle: 'Independent Technical Custodian',
    relationship: 'Co-Founder & Archivist · Geneva',
    publicKeyRef: '0x9D2A...08F1',
    location: 'Geneva, Switzerland',
    availability: 'Verified & Active',
    lastVerified: '29 Sep 2026',
    decision: 'PENDING',
    shareReleased: false
  }
];

const SEED_RECORDS = [
  {
    id: 'asset-1',
    accessionNumber: 'HLM-2026-001',
    title: 'Primary Family Trust & Sovereign Custody Directives',
    subtitle: 'Master instructions, cold-storage hardware coordinates, and legal executor letters',
    category: 'Estate Directive' as const,
    createdDate: '14 January 2026',
    lastVerifiedDate: '03 October 2026',
    protectionState: 'CHALLENGED' as const,
    summaryDescription:
      'Complete procedural manual for accessing the Zurich safe deposit box, multi-signature hardware derivation paths, and sealed personal letters addressed to Hannah Vance.',
    sealedContentsPreview: [
      'Notarized Letter of Intent & Executor Mandate',
      'Sovereign Hardware Vault Derivation & Reconstruction Map',
      'Private Bank of Geneva Safe Deposit Key Protocol',
      'Personal Written Correspondence to Hannah Vance'
    ],
    plaintextSecret: `OFFICIAL ARCHIVAL RECORD // HLM-2026-001
TITLE: Primary Family Trust & Sovereign Custody Directives
PRESERVED BY: Julian Vance-Sterling
DESIGNATED BENEFICIARY: Hannah Vance

1. LETTER TO HANNAH
My dear Hannah, if you have reconstructed this record, the guardian quorum and safety challenge period have completed as intended. Everything in this archive was prepared so that you would never have to guess where our family records stand.

2. ZURICH SAFE DEPOSIT PROTOCOL
Institution: Lombard Odier Private Vault, Bahnhofstrasse, Zurich
Box Reference: Vault Folio #449-B
Physical Key Location: Held in sealed escrow with Dr. Clara Vance (Primary Legal Fiduciary).

3. SOVEREIGN HARDWARE DERIVATION COORDINATES
Primary Multisig Descriptor: wsh(sortedmulti(2,[88a14e9b/48h/0h/0h/2h]xpub6E...,[42c977d1/48h/0h/0h/2h]xpub6F...))
Backup Steel Plate Location: Library study wainscoting panel behind the 1924 architectural monograph.`
  },
  {
    id: 'asset-2',
    accessionNumber: 'HLM-2026-002',
    title: 'Atelier Sterling Architectural Archive & IP Rights',
    subtitle: 'Unpublished structural monographs, licensing deeds, and studio patronage ledger',
    category: 'Corporate Succession' as const,
    createdDate: '08 February 2026',
    lastVerifiedDate: '03 October 2026',
    protectionState: 'SEALED' as const,
    summaryDescription:
      'Intellectual property assignment, CAD preservation archives, and ongoing royalty distribution rules for Atelier Sterling.',
    sealedContentsPreview: [
      'Intellectual Property Assignment Deed (Signed & Timestamped)',
      'Master Studio Encrypted NAS Decryption Passphrase',
      'Patronage & Collector Endowment Contacts'
    ],
    plaintextSecret: `OFFICIAL ARCHIVAL RECORD // HLM-2026-002
TITLE: Atelier Sterling Architectural Archive & IP Rights
PRESERVED BY: Julian Vance-Sterling

1. INTELLECTUAL PROPERTY ASSIGNMENT
All architectural drawings, monograph rights, and structural models of Atelier Sterling are hereby assigned to Hannah Vance as Literary & Architectural Executor.

2. STUDIO ARCHIVE STORAGE CREDENTIALS
Geneva Cold NAS Host: archive-local.atelier-sterling.ch
Master Volume Passphrase: "vela-stone-architrave-1988-zurich-amber"
SHA-256 Checksum of Master CAD Archive: 4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a`
  },
  {
    id: 'asset-3',
    accessionNumber: 'HLM-2026-003',
    title: 'Treasury Reserve Cold-Storage Reconstruction Kit',
    subtitle: 'Air-gapped multisig descriptors and geographic vault coordinates',
    category: 'Cryptographic Custody' as const,
    createdDate: '22 March 2026',
    lastVerifiedDate: '03 October 2026',
    protectionState: 'SEALED' as const,
    summaryDescription:
      'Output descriptors, timelock recovery scripts, and physical custodian instructions required to reconstruct the long-term family reserve.',
    sealedContentsPreview: [
      'Miniscript Output Descriptor & Watch-Only Wallet Map',
      'Geographic Coordinates of Secondary Steel Backup Plates',
      'Step-by-Step Verification Guide for Non-Technical Heirs'
    ],
    plaintextSecret: `OFFICIAL ARCHIVAL RECORD // HLM-2026-003
TITLE: Treasury Reserve Cold-Storage Reconstruction Kit

1. RECOVERY PROCEDURE
Do not enter any seed words into an internet-connected computer. Use an air-gapped hardware signer with the following descriptor:
tr(c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5,{pk(Key_Beneficiary),and_v(v:pk(Key_GuardianQuorum),older(43200))})

2. VERIFICATION CONTACT
Marcus Sterling and Elena Rostova can assist with air-gapped hardware verification.`
  },
  {
    id: 'asset-4',
    accessionNumber: 'HLM-2026-004',
    title: 'Biographical Letters, Journals & Family Provenance',
    subtitle: 'Four decades of personal letters, family history, and ethical wills',
    category: 'Personal Correspondence' as const,
    createdDate: '19 May 2026',
    lastVerifiedDate: '03 October 2026',
    protectionState: 'SEALED' as const,
    summaryDescription:
      'Personal reflections, family genealogy documentation, scanned handwritten journals, and letters intended to be read only when the time comes.',
    sealedContentsPreview: [
      'Handwritten Journals (1989–2026 High-Resolution Scans)',
      'Letters to Hannah on Milestones & Stewardship',
      'Provenance Records of Physical Family Heirlooms'
    ],
    plaintextSecret: `OFFICIAL ARCHIVAL RECORD // HLM-2026-004
TITLE: Biographical Letters, Journals & Family Provenance

"To preserve something properly is an act of quiet optimism. It assumes that the future will care enough to read carefully, and that the people we love will value truth over convenience." — Julian Vance-Sterling, Autumn 2026.`
  }
];

export async function buildInitialEncryptedAssets(): Promise<VaultAsset[]> {
  const results: VaultAsset[] = [];

  for (const item of SEED_RECORDS) {
    const bundle = await encryptAndSplitRecord(item.plaintextSecret);
    results.push({
      id: item.id,
      accessionNumber: item.accessionNumber,
      title: item.title,
      subtitle: item.subtitle,
      category: item.category,
      createdDate: item.createdDate,
      lastVerifiedDate: item.lastVerifiedDate,
      protectionState: item.protectionState,
      ownerName: 'Julian Vance-Sterling',
      ownerAddress: '0x88A1...4E9B',
      beneficiaryName: 'Hannah Vance',
      beneficiaryRelation: 'Daughter & Designated Successor',
      beneficiaryAddress: '0x42C9...77D1',
      quorumPolicy: '2 of 3 Independent Guardians + 72-Hour Challenge Window',
      challengeWindowHours: 72,
      inactivityThresholdDays: 90,
      summaryDescription: item.summaryDescription,
      sealedContentsPreview: item.sealedContentsPreview,
      ciphertextBase64: bundle.ciphertextBase64,
      originalCiphertextBase64: bundle.ciphertextBase64,
      ivBase64: bundle.ivBase64,
      contentHash: `sha256:${bundle.contentSha256}`,
      ciphertextHash: bundle.ciphertextSha256,
      encryptionCipher: bundle.algorithm,
      storageReference: `local-vault://${item.accessionNumber.toLowerCase()}`,
      contractPolicyId: 'HLM-POL-0x4A92E81C · Epoch #14',
      guardianKeyShares: {
        'g-1': bundle.shares.share1,
        'g-2': bundle.shares.share2,
        'g-3': bundle.shares.share3
      },
      isTampered: false
    });
  }

  return results;
}

export const INITIAL_RECOVERY_CASE: RecoveryCase = {
  caseId: 'CASE-2026-014',
  epochNumber: 14,
  previousInvalidatedEpochs: [11, 12, 13],
  assetId: 'asset-1',
  assetTitle: 'Primary Family Trust & Sovereign Custody Directives',
  assetAccession: 'HLM-2026-001',
  state: 'CHALLENGE_PERIOD',
  initiatedBy: 'Hannah Vance',
  initiatedByRole: 'Designated Beneficiary',
  initiatedAt: '01 Oct 2026 · 14:10 UTC',
  evidenceCommitmentHash: '0x94c2f8a1e7b03d56c89102f4a7b8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6',
  evidenceSummary:
    'Formal recovery petition accompanied by notarized medical incapacity attestation and statutory notice of prolonged owner unavailability.',
  challengeRemainingHours: 46,
  challengeTotalHours: 72,
  quorumRequired: 2,
  quorumTotal: 3,
  releasedShareGuardianIds: [],
  timeline: [
    {
      id: 'tl-3',
      timestamp: '02 Oct 2026 · 16:42 UTC',
      title: 'Guardian Quorum Reached (2 of 3) — 72-Hour Challenge Period Started',
      actor: 'Marcus Sterling',
      actorRole: 'Guardian',
      description:
        'Second independent guardian approval reached the 2-of-3 threshold. Rather than releasing the asset immediately, Heirloom entered a mandatory 72-hour Challenge Period so the owner or any guardian can intervene.',
      stateStamp: 'QUORUM 2/3',
      txHash: '0x8f2e...1c77',
      epochNumber: 14
    },
    {
      id: 'tl-2',
      timestamp: '02 Oct 2026 · 09:14 UTC',
      title: 'First Guardian Approval Recorded (1 of 3)',
      actor: 'Dr. Clara Vance',
      actorRole: 'Guardian',
      description:
        'Primary Legal Fiduciary reviewed the evidentiary commitment and signed conditional approval for Case #14.',
      stateStamp: 'VERIFIED',
      txHash: '0x3c8d...4e19',
      epochNumber: 14
    },
    {
      id: 'tl-1',
      timestamp: '01 Oct 2026 · 14:10 UTC',
      title: 'Recovery Case #14 Formally Opened',
      actor: 'Hannah Vance',
      actorRole: 'Beneficiary',
      description:
        'Beneficiary submitted recovery petition for HLM-2026-001. Previous approvals from Epoch #13 remain permanently invalidated.',
      stateStamp: 'CASE OPENED',
      txHash: '0x6a1b...9f02',
      epochNumber: 14
    }
  ]
};

export const INITIAL_AUDIT_EVENTS: AuditEvent[] = [
  {
    id: 'aud-1',
    timestamp: '02 Oct 2026 · 16:42 UTC',
    actor: 'Marcus Sterling',
    actorRole: 'Guardian',
    actionTitle: 'Guardian Quorum 2-of-3 Reached · Challenge Window Started',
    category: 'Quorum',
    explanation:
      'Second independent guardian attested to Recovery Case #14. The vault automatically initiated the mandatory 72-hour safety challenge window before any key shares can be released.',
    assetRef: 'HLM-2026-001',
    epochRef: 'Epoch #14',
    txHash: '0x8f2e91a04c7b3d1e5f6a8b9c0d1e2f3a4b5c6d7e',
    stateAfter: 'CHALLENGED'
  },
  {
    id: 'aud-2',
    timestamp: '02 Oct 2026 · 09:14 UTC',
    actor: 'Dr. Clara Vance',
    actorRole: 'Guardian',
    actionTitle: 'Guardian Approval Submitted (1 of 3)',
    category: 'Quorum',
    explanation:
      'Estate counsel verified the evidentiary commitment hash and recorded an independent signature for Case #14.',
    assetRef: 'HLM-2026-001',
    epochRef: 'Epoch #14',
    txHash: '0x3c8d72b19e4a0f6c1d2e3f4a5b6c7d8e9f0a1b2c',
    stateAfter: 'PROTECTED'
  },
  {
    id: 'aud-3',
    timestamp: '01 Oct 2026 · 14:10 UTC',
    actor: 'Hannah Vance',
    actorRole: 'Beneficiary',
    actionTitle: 'Recovery Case #14 Requested',
    category: 'Recovery',
    explanation:
      'Designated beneficiary opened a formal recovery petition for Primary Family Trust & Sovereign Custody Directives.',
    assetRef: 'HLM-2026-001',
    epochRef: 'Epoch #14',
    txHash: '0x6a1b44c82d9e0f1a2b3c4d5e6f7a8b9c0d1e2f02',
    stateAfter: 'PROTECTED'
  },
  {
    id: 'aud-4',
    timestamp: '18 Aug 2026 · 19:05 UTC',
    actor: 'Julian Vance-Sterling',
    actorRole: 'Owner',
    actionTitle: 'Owner Check-In & Prior Case #13 Cancelled',
    category: 'Safety Layer',
    explanation:
      'Vault owner performed a check-in during a scheduled test drill. Recovery Case #13 was immediately closed, all prior guardian approvals were invalidated, and the vault advanced to Epoch #14.',
    assetRef: 'HLM-2026-001',
    epochRef: 'Epoch #13 → #14',
    txHash: '0x1d9a55e37b2c8f4a6d0e1f2a3b4c5d6e7f8a9b0c',
    stateAfter: 'SEALED'
  },
  {
    id: 'aud-5',
    timestamp: '19 May 2026 · 11:30 UTC',
    actor: 'Julian Vance-Sterling',
    actorRole: 'Owner',
    actionTitle: 'Archival Record Sealed & Encrypted in Browser',
    category: 'Preservation',
    explanation:
      'Biographical Letters, Journals & Family Provenance (HLM-2026-004) was encrypted via AES-256-GCM and split into 2-of-3 guardian key shares.',
    assetRef: 'HLM-2026-004',
    epochRef: 'Epoch #13',
    txHash: '0x9b4c12e88a3f7d5c2b1a0e9f8d7c6b5a4f3e2d1c',
    stateAfter: 'SEALED'
  }
];
