import CryptoJS from "crypto-js"

const SECRET_KEY = process.env.ENCRYPTION_SECRET || "default-secret-key"

export function encrypt(text: string): string {
  try {
    const encrypted = CryptoJS.AES.encrypt(text, SECRET_KEY).toString()
    return encrypted
  } catch (error) {
    console.error("Encryption failed:", error)
    return text
  }
}

export function decrypt(encryptedText: string): string {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedText, SECRET_KEY)
    return decrypted.toString(CryptoJS.enc.Utf8)
  } catch (error) {
    console.error("Decryption failed:", error)
    return encryptedText
  }
}

export function hashPassword(password: string): string {
  return CryptoJS.SHA256(password).toString()
}

export function generateApiKey(): string {
  return CryptoJS.lib.WordArray.random(32).toString()
}

export function generateSecureToken(): string {
  return CryptoJS.lib.WordArray.random(16).toString()
}

export function maskEmail(email: string): string {
  const [username, domain] = email.split("@")
  if (username.length <= 2) {
    return `${username[0]}***@${domain}`
  }
  return `${username.substring(0, 2)}***@${domain}`
}

export function maskPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "")
  if (cleaned.length >= 10) {
    return `***-***-${cleaned.slice(-4)}`
  }
  return "***-***-****"
}

export function validateApiKey(apiKey: string): boolean {
  return /^[a-f0-9]{64}$/.test(apiKey)
}

export function generateChecksum(data: string): string {
  return CryptoJS.MD5(data).toString()
}
