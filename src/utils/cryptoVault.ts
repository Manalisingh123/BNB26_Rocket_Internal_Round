/**
 * Real Browser Web Crypto & 2-of-3 Threshold Secret Sharing Engine for Heirloom.
 * Uses native window.crypto.subtle (AES-256-GCM + SHA-256) and GF(256) / XOR 2-of-3 threshold key splitting.
 * No fake encryption: ciphertext is genuine AES-GCM output; tampering with ciphertext or missing key shares
 * genuinely fails cryptographic verification and decryption.
 */

export interface ThresholdShares {
  /** Guardian 1 holds Pad A and Pad B */
  share1: string;
  /** Guardian 2 holds Pad B and Pad C */
  share2: string;
  /** Guardian 3 holds Pad C and Pad A */
  share3: string;
}

export interface EncryptedArchiveBundle {
  ciphertextBase64: string;
  ivBase64: string;
  contentSha256: string;
  ciphertextSha256: string;
  algorithm: 'AES-256-GCM + 2-of-3 Threshold Split';
  shares: ThresholdShares;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.trim();
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function sha256Hex(input: string | Uint8Array): Promise<string> {
  const data =
    typeof input === 'string' ? new TextEncoder().encode(input) : input;
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data as BufferSource);
  return bytesToHex(new Uint8Array(hashBuffer));
}

/**
 * Splits a 32-byte (256-bit) master key K into 3 guardian shares such that:
 * - Any 1 share reveals 0 bits of K (information-theoretically secure pad).
 * - Any 2 shares reconstruct K = A ^ B ^ C cleanly.
 *
 * Construction:
 * Generate random 32-byte pads A and B. Compute C = K ^ A ^ B.
 * Share 1 (Guardian 1): "1:" + hex(A) + ":" + hex(B)
 * Share 2 (Guardian 2): "2:" + hex(B) + ":" + hex(C)
 * Share 3 (Guardian 3): "3:" + hex(C) + ":" + hex(A)
 */
export function splitKey2of3(keyBytes: Uint8Array): ThresholdShares {
  if (keyBytes.length !== 32) {
    throw new Error('Master key must be 32 bytes (256 bits)');
  }
  const padA = window.crypto.getRandomValues(new Uint8Array(32));
  const padB = window.crypto.getRandomValues(new Uint8Array(32));
  const padC = new Uint8Array(32);

  for (let i = 0; i < 32; i++) {
    padC[i] = keyBytes[i] ^ padA[i] ^ padB[i];
  }

  return {
    share1: `1:${bytesToHex(padA)}:${bytesToHex(padB)}`,
    share2: `2:${bytesToHex(padB)}:${bytesToHex(padC)}`,
    share3: `3:${bytesToHex(padC)}:${bytesToHex(padA)}`
  };
}

/**
 * Reconstructs the 32-byte master key from at least 2 distinct guardian shares.
 */
export function reconstructKey2of3(shares: string[]): Uint8Array {
  const uniqueShares = Array.from(new Set(shares.filter(Boolean)));
  if (uniqueShares.length < 2) {
    throw new Error(
      `Insufficient key shares: received ${uniqueShares.length}, but 2-of-3 quorum is required.`
    );
  }

  let padA: Uint8Array | null = null;
  let padB: Uint8Array | null = null;
  let padC: Uint8Array | null = null;

  for (const raw of uniqueShares) {
    const parts = raw.split(':');
    if (parts.length !== 3) {
      throw new Error('Malformed threshold key share format.');
    }
    const [idx, firstHex, secondHex] = parts;
    if (idx === '1') {
      padA = hexToBytes(firstHex);
      padB = hexToBytes(secondHex);
    } else if (idx === '2') {
      padB = hexToBytes(firstHex);
      padC = hexToBytes(secondHex);
    } else if (idx === '3') {
      padC = hexToBytes(firstHex);
      padA = hexToBytes(secondHex);
    }
  }

  if (!padA || !padB || !padC) {
    throw new Error('Need at least 2 distinct guardian shares to reconstruct the master key.');
  }

  const keyBytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    keyBytes[i] = padA[i] ^ padB[i] ^ padC[i];
  }
  return keyBytes;
}

/**
 * Encrypts plaintext string in the browser using genuine AES-256-GCM and splits the key into 2-of-3 shares.
 */
export async function encryptAndSplitRecord(
  plaintext: string
): Promise<EncryptedArchiveBundle> {
  const encodedPlaintext = new TextEncoder().encode(plaintext);
  const contentSha256 = await sha256Hex(encodedPlaintext);

  const rawKey = window.crypto.getRandomValues(new Uint8Array(32));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    rawKey as BufferSource,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );

  const cipherBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    cryptoKey,
    encodedPlaintext as BufferSource
  );

  const cipherBytes = new Uint8Array(cipherBuffer);
  const ciphertextBase64 = bytesToBase64(cipherBytes);
  const ciphertextSha256 = await sha256Hex(cipherBytes);
  const ivBase64 = bytesToBase64(iv);
  const shares = splitKey2of3(rawKey);

  return {
    ciphertextBase64,
    ivBase64,
    contentSha256,
    ciphertextSha256,
    algorithm: 'AES-256-GCM + 2-of-3 Threshold Split',
    shares
  };
}

/**
 * Verifies ciphertext integrity and decrypts in the browser using 2+ released guardian shares.
 * Throws a descriptive error if ciphertext was tampered with or if shares are insufficient/invalid.
 */
export async function verifyAndDecryptRecord(params: {
  ciphertextBase64: string;
  ivBase64: string;
  expectedCiphertextSha256: string;
  expectedContentSha256: string;
  releasedShares: string[];
}): Promise<{ plaintext: string; verifiedContentHash: string }> {
  const {
    ciphertextBase64,
    ivBase64,
    expectedCiphertextSha256,
    expectedContentSha256,
    releasedShares
  } = params;

  if (releasedShares.length < 2) {
    throw new Error(
      `Cannot reconstruct key: only ${releasedShares.length} of 2 required guardian key shares have been released.`
    );
  }

  let cipherBytes: Uint8Array;
  try {
    cipherBytes = base64ToBytes(ciphertextBase64);
  } catch {
    throw new Error('Integrity Failure: Ciphertext payload is corrupted (invalid base64 encoding).');
  }

  const actualCipherHash = await sha256Hex(cipherBytes);
  if (actualCipherHash !== expectedCiphertextSha256) {
    throw new Error(
      `Integrity Verification Failed: Ciphertext SHA-256 (${actualCipherHash.slice(
        0,
        12
      )}…) does not match sealed commitment (${expectedCiphertextSha256.slice(0, 12)}…). Tampering detected.`
    );
  }

  const rawKey = reconstructKey2of3(releasedShares);
  const iv = base64ToBytes(ivBase64);

  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    rawKey as BufferSource,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );

  let decryptedBuffer: ArrayBuffer;
  try {
    decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv as BufferSource },
      cryptoKey,
      cipherBytes as BufferSource
    );
  } catch {
    throw new Error(
      'Cryptographic Authentication Failed: AES-256-GCM tag verification rejected the payload or key shares.'
    );
  }

  const decryptedBytes = new Uint8Array(decryptedBuffer);
  const verifiedContentHash = await sha256Hex(decryptedBytes);
  if (verifiedContentHash !== expectedContentSha256) {
    throw new Error(
      'Plaintext Integrity Mismatch: Decrypted content hash does not match original sealed record hash.'
    );
  }

  const plaintext = new TextDecoder().decode(decryptedBytes);
  return { plaintext, verifiedContentHash };
}
