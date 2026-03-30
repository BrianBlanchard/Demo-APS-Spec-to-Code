import crypto from 'crypto';
import { getAppConfig } from '../config/app.config';

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

export const encrypt = (text: string): string => {
  const config = getAppConfig();
  const key = crypto.scryptSync(config.encryptionKey, 'salt', 32);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
};

export const decrypt = (text: string): string => {
  const config = getAppConfig();
  const key = crypto.scryptSync(config.encryptionKey, 'salt', 32);
  const parts = text.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

export const maskSensitiveData = (data: string, visibleChars: number = 4): string => {
  if (visibleChars === 0 || data.length <= visibleChars) {
    return '*'.repeat(data.length);
  }
  const masked = '*'.repeat(data.length - visibleChars);
  return masked + data.slice(-visibleChars);
};
