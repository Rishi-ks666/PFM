import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128-bit IV for GCM

/**
 * Derive the encryption key from the hex-encoded ENCRYPTION_KEY env var.
 * @returns {Buffer} 32-byte key
 */
const getKey = () => Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

/**
 * Encrypt plaintext using AES-256-GCM.
 *
 * @param {string} text — plaintext to encrypt
 * @returns {{ encrypted: string, iv: string, authTag: string }} — hex-encoded ciphertext, IV, and auth tag
 */
export const encrypt = (text) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
  };
};

/**
 * Decrypt AES-256-GCM ciphertext back to plaintext.
 *
 * @param {string} encrypted — hex-encoded ciphertext
 * @param {string} iv        — hex-encoded initialisation vector
 * @param {string} authTag   — hex-encoded authentication tag
 * @returns {string} — decrypted plaintext
 */
export const decrypt = (encrypted, iv, authTag) => {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    getKey(),
    Buffer.from(iv, 'hex'),
  );

  decipher.setAuthTag(Buffer.from(authTag, 'hex'));

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};
