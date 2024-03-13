import crypto from 'crypto';
import config from '~/config';


class CryptoString {
  constructor(key, salt) {
    this.key = crypto.scryptSync(key, salt, 32); // Creates a 256-bit key
    this.iv = crypto.randomBytes(16); // Initialization vector
  }

  // Method to encrypt a message
  encrypt(text) {
    const cipher = crypto.createCipheriv('aes-256-cbc', this.key, this.iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return {
      iv: this.iv.toString('hex'),
      encryptedData: encrypted
    };
  }

  // Method to decrypt a message
  decrypt(encryptedObject: { iv: string, encryptedData: string }) {
    const iv = Buffer.from(encryptedObject.iv, 'hex');
    const encryptedText = encryptedObject.encryptedData;
    const decipher = crypto.createDecipheriv('aes-256-cbc', this.key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}

let _crpytoString: CryptoString | null = null;
export const useCryptoString = () => {
  if (!_crpytoString) {
    _crpytoString = new CryptoString(config.CRYPTO_STRING_KEY, config.CRYPTO_STRING_SALT);
  }
  return _crpytoString;
};
