import crypto from 'node:crypto';
import { env } from '../config/env.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;

// Derive a robust 32-byte key from the environment secret
function getKey(): Buffer {
  const secret = env.PROVIDER_KEY_SECRET || 'fallback-unsafe-secret';
  return crypto.createHash('sha256').update(secret).digest();
}

export function encryptApiKey(text: string) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const salt = crypto.randomBytes(SALT_LENGTH);
  const key = getKey();

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // Create a fast hash for equality checks (so we can see if they are sending the same key)
  const hash = crypto.createHash('sha256').update(text).digest('hex');

  return {
    ciphertext: encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
    hash,
  };
}

export function decryptApiKey(ciphertext: string, ivHex: string, authTagHex: string): string {
  const key = getKey();
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
