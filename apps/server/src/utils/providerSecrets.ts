import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';

interface EncryptedSecret {
  ciphertext: string;
  iv: string;
  authTag: string;
}

const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_IV_BYTES = 12;
const BCRYPT_SALT_ROUNDS = 12;

function resolveKeySecret(): string {
  return env.PROVIDER_KEY_SECRET ?? 'iprep-local-provider-secret-change-me';
}

function deriveKey(secret: string): Buffer {
  return crypto.createHash('sha256').update(secret).digest();
}

export function encryptProviderSecret(secretValue: string): EncryptedSecret {
  const secret = resolveKeySecret();
  const iv = crypto.randomBytes(ENCRYPTION_IV_BYTES);
  const key = deriveKey(secret);

  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(secretValue, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    ciphertext: encrypted.toString('base64'),
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
  };
}

export function decryptProviderSecret(payload: EncryptedSecret): string {
  const secret = resolveKeySecret();
  const key = deriveKey(secret);
  const iv = Buffer.from(payload.iv, 'base64');
  const authTag = Buffer.from(payload.authTag, 'base64');
  const encrypted = Buffer.from(payload.ciphertext, 'base64');

  const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}

export async function hashProviderSecret(secretValue: string): Promise<string> {
  return bcrypt.hash(secretValue, BCRYPT_SALT_ROUNDS);
}
