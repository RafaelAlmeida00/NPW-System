// utils/crypto.ts
import CryptoJS from "crypto-js";

const SECRET_KEY = import.meta.env.VITE_ENCRYPTION_KEY || "super-secreta-key";

export function encryptData(data: string): string {
  return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
}

export function decryptData(cipherText?: string): string {
  if (!cipherText || typeof cipherText !== 'string') return '';
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (e) {
    console.warn('Falha ao descriptografar', cipherText);
    return cipherText; // ou ''
  }
}
