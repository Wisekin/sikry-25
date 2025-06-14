import CryptoJS from "crypto-js"

const ENCRYPTION_KEY = process.env.ENCRYPTION_SECRET || "default-secret-key"

export class FieldEncryption {
  static encrypt(data: string): string {
    try {
      return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString()
    } catch (error) {
      console.error("Encryption failed:", error)
      throw new Error("Failed to encrypt data")
    }
  }

  static decrypt(encryptedData: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY)
      return bytes.toString(CryptoJS.enc.Utf8)
    } catch (error) {
      console.error("Decryption failed:", error)
      throw new Error("Failed to decrypt data")
    }
  }

  static encryptObject(obj: Record<string, any>, fieldsToEncrypt: string[]): Record<string, any> {
    const result = { ...obj }

    fieldsToEncrypt.forEach((field) => {
      if (result[field] && typeof result[field] === "string") {
        result[field] = this.encrypt(result[field])
      }
    })

    return result
  }

  static decryptObject(obj: Record<string, any>, fieldsToDecrypt: string[]): Record<string, any> {
    const result = { ...obj }

    fieldsToDecrypt.forEach((field) => {
      if (result[field] && typeof result[field] === "string") {
        try {
          result[field] = this.decrypt(result[field])
        } catch (error) {
          console.warn(`Failed to decrypt field ${field}:`, error)
        }
      }
    })

    return result
  }
}

export class APIKeyManager {
  static generateAPIKey(): string {
    return CryptoJS.lib.WordArray.random(32).toString()
  }

  static hashAPIKey(apiKey: string): string {
    return CryptoJS.SHA256(apiKey).toString()
  }

  static validateAPIKey(apiKey: string, hashedKey: string): boolean {
    return this.hashAPIKey(apiKey) === hashedKey
  }

  static encryptAPIKey(apiKey: string): string {
    return FieldEncryption.encrypt(apiKey)
  }

  static decryptAPIKey(encryptedKey: string): string {
    return FieldEncryption.decrypt(encryptedKey)
  }
}
