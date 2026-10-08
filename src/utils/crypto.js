/**
 * Cryptographic utility for salted SHA-256 hashing using the Web Crypto API.
 * Ensures answers are never stored in plaintext within client bundles.
 */

const SALT = "simanto_birthday_2026_salt_x9";

/**
 * Computes SHA-256 hex digest of a string using browser's native crypto.subtle.
 * @param {string} message 
 * @returns {Promise<string>} Hex-encoded SHA-256 hash
 */
export async function sha256Hex(message) {
  const cryptoSubtle = globalThis?.crypto?.subtle || (typeof window !== 'undefined' && window.crypto?.subtle);
  if (cryptoSubtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await cryptoSubtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  throw new Error('Web Crypto API is not supported in this environment');
}

/**
 * Generates a salted hash for an answer candidate.
 * @param {string} candidateAnswer
 * @param {number} questionId
 * @returns {Promise<string>}
 */
export async function hashAnswer(candidateAnswer, questionId) {
  if (!candidateAnswer) return '';
  const normalized = candidateAnswer.trim().toLowerCase().replace(/\s+/g, ' ');
  return sha256Hex(`${normalized}:${SALT}:${questionId}`);
}
