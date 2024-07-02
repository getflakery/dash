import crypto from 'crypto';


export class CryptoString {
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
  const config = useRuntimeConfig()

  if (!_crpytoString) {
    _crpytoString = new CryptoString(config.crypto_string_key, config.crypto_string_salt);
  }
  return _crpytoString;
};
