import { createCipheriv, createDecipheriv, randomBytes, CipherGCM, DecipherGCM } from 'crypto';
import { config } from '../config/config';
import { ServiceUnavailableError } from '../types/error-response';

export interface IEncryptionService {
  encrypt(plainText: string): Promise<string>;
  decrypt(encryptedText: string): Promise<string>;
}

export class EncryptionService implements IEncryptionService {
  private algorithm = 'aes-256-gcm';
  private keyBuffer: Buffer;

  constructor() {
    if (!config.encryption.key) {
      throw new Error('Encryption key not configured');
    }

    // Key should be base64 encoded 256-bit key
    try {
      this.keyBuffer = Buffer.from(config.encryption.key, 'base64');
      if (this.keyBuffer.length !== 32) {
        throw new Error('Encryption key must be 256 bits (32 bytes)');
      }
    } catch (error) {
      throw new Error('Invalid encryption key format');
    }
  }

  async encrypt(plainText: string): Promise<string> {
    try {
      // Generate random IV (Initialization Vector)
      const iv = randomBytes(16);

      // Create cipher (cast to CipherGCM for GCM-specific methods)
      const cipher = createCipheriv(this.algorithm, this.keyBuffer, iv) as CipherGCM;

      // Encrypt the text
      let encrypted = cipher.update(plainText, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      // Get auth tag for GCM mode
      const authTag = cipher.getAuthTag();

      // Combine IV + AuthTag + Encrypted data (all in hex)
      // Format: iv(32 chars) + authTag(32 chars) + encrypted
      return iv.toString('hex') + authTag.toString('hex') + encrypted;
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new ServiceUnavailableError('Encryption service unavailable');
    }
  }

  async decrypt(encryptedText: string): Promise<string> {
    try {
      // Extract IV (first 32 hex chars = 16 bytes)
      const iv = Buffer.from(encryptedText.slice(0, 32), 'hex');

      // Extract auth tag (next 32 hex chars = 16 bytes)
      const authTag = Buffer.from(encryptedText.slice(32, 64), 'hex');

      // Extract encrypted data (remaining)
      const encrypted = encryptedText.slice(64);

      // Create decipher (cast to DecipherGCM for GCM-specific methods)
      const decipher = createDecipheriv(this.algorithm, this.keyBuffer, iv) as DecipherGCM;
      decipher.setAuthTag(authTag);

      // Decrypt
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new ServiceUnavailableError('Decryption service unavailable');
    }
  }
}
