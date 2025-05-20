// utilities/encryption.ts
import crypto from 'crypto';

/**
 * Encryption utility for journal data
 * Uses AES-256-CBC for encryption with HMAC verification
 */

// Environment variables should be set in your .env file
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '';
const ENCRYPTION_IV = process.env.ENCRYPTION_IV || '';
// const HMAC_KEY = process.env.HMAC_KEY || '';

if (!ENCRYPTION_KEY || !ENCRYPTION_IV ) {
  console.error('WARNING: Encryption keys not properly configured in environment variables');
}

// Convert hex string keys to buffers for crypto operations
const getEncryptionKey = () => {
  const key = Buffer.from(ENCRYPTION_KEY, 'hex');
  if (key.length !== 32) {
    throw new Error('Invalid ENCRYPTION_KEY length. Must be 32 bytes (64 hex characters).');
  }
  return key;
};

const getIvBuffer = () => {
  const iv = Buffer.from(ENCRYPTION_IV, 'hex');
  if (iv.length !== 16) {
    throw new Error('Invalid ENCRYPTION_IV length. Must be 16 bytes (32 hex characters).');
  }
  return iv;
};

// const getHmacKey = () => {
//   return Buffer.from(HMAC_KEY, 'hex');
// };

/**
 * Encrypts a string value
 * @param {string} text - The text to encrypt
 * @returns {string} - The encrypted text in format: iv:encryptedData:hmac
 */
export function encrypt(text: string): string {
  if (!text) return '';
  
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', getEncryptionKey(), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Return just IV and ciphertext (no HMAC)
  return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts an encrypted string
 * @param {string} encryptedText - The encrypted text in format: iv:encryptedData:hmac
 * @returns {string} - The decrypted text
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText) return '';
  
  const parts = encryptedText.split(':');
  if (parts.length !== 2) { // No HMAC check
    throw new Error('Invalid encrypted format');
  }
  
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  
  const decipher = crypto.createDecipheriv('aes-256-cbc', getEncryptionKey(), iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Encrypts an object's specific fields
 * @param {Record<string, any>} data - The object containing data to partially encrypt
 * @param {string[]} fieldsToEncrypt - Array of field names to encrypt
 * @returns {Record<string, any>} - Object with specified fields encrypted
 */
export function encryptFields(data: Record<string, any>, fieldsToEncrypt: string[]): Record<string, any> {
  if (!data) return data;
  
  const result = { ...data };
  
  fieldsToEncrypt.forEach(field => {
    if (result[field] !== undefined && result[field] !== null) {
      // Handle arrays (like tags) specially
      if (Array.isArray(result[field])) {
        result[field] = encrypt(JSON.stringify(result[field]));
      } 
      // Handle objects by converting to JSON first
      else if (typeof result[field] === 'object') {
        result[field] = encrypt(JSON.stringify(result[field]));
      }
      // Handle primitive values
      else {
        result[field] = encrypt(String(result[field]));
      }
    }
  });
  
  return result;
}

/**
 * Decrypts an object's specific fields
 * @param {Record<string, any>} data - The object containing encrypted data
 * @param {string[]} fieldsToDecrypt - Array of field names to decrypt
 * @returns {Record<string, any>} - Object with specified fields decrypted
 */
export function decryptFields(data: Record<string, any>, fieldsToDecrypt: string[]): Record<string, any> {
  if (!data) return data;
  
  const result = { ...data };
  
  fieldsToDecrypt.forEach(field => {
    if (result[field] && typeof result[field] === 'string') {
      try {
        const decrypted = decrypt(result[field]);
        
        // Try to parse as JSON (for arrays and objects)
        try {
          result[field] = JSON.parse(decrypted);
        } catch {
          // If not valid JSON, use as plain string
          result[field] = decrypted;
        }
      } catch (error) {
        console.error(`Failed to decrypt field ${field}:`, error);
        // Keep the encrypted value if decryption fails
      }
    }
  });
  
  return result;
}

/**
 * Helper functions for Journal model
 */

// List of journal fields that should be encrypted
export const JOURNAL_ENCRYPTED_FIELDS = ['title', 'content', 'tags', 'mood', 'journalType'];

/**
 * Encrypt journal data before saving to database
 * @param {Record<string, any>} journalData - Journal data to encrypt
 * @returns {Record<string, any>} - Journal data with sensitive fields encrypted
 */
export function encryptJournalData(journalData: Record<string, any>): Record<string, any> {
  return encryptFields(journalData, JOURNAL_ENCRYPTED_FIELDS);
}

/**
 * Decrypt journal data after retrieving from database
 * @param {Record<string, any>} journalData - Journal data with encrypted fields
 * @returns {Record<string, any>} - Journal data with fields decrypted
 */
export function decryptJournalData(journalData: Record<string, any>): Record<string, any> {
  return decryptFields(journalData, JOURNAL_ENCRYPTED_FIELDS);
}

/**
 * Generate encryption keys for setup
 * @returns {Object} Object containing generated keys
 */
export function generateEncryptionKeys() {
  return {
    ENCRYPTION_KEY: crypto.randomBytes(32).toString('hex'),
    ENCRYPTION_IV: crypto.randomBytes(16).toString('hex'),
    // HMAC_KEY: crypto.randomBytes(32).toString('hex')
  };
}