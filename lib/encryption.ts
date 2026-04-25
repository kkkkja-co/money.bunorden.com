/**
 * lib/encryption.ts
 * 
 * End-to-End Encryption (E2EE) engine using the Web Crypto API.
 * Uses PBKDF2 for key derivation and AES-GCM for encryption.
 */

const ITERATIONS = 100000
const ALGO = 'AES-GCM'
const KEY_LEN = 256

/**
 * Derives a CryptoKey from a password/PIN and a salt.
 */
export async function deriveKey(password: string, salt: string): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const passwordBuffer = encoder.encode(password)
  const saltBuffer = encoder.encode(salt)

  const baseKey = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveKey']
  )

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: ITERATIONS,
      hash: 'SHA-256'
    },
    baseKey,
    { name: ALGO, length: KEY_LEN },
    false,
    ['encrypt', 'decrypt']
  )
}

/**
 * Encrypts a string and returns a Base64 encoded string containing the IV and ciphertext.
 */
export async function encrypt(text: string, key: CryptoKey): Promise<string> {
  const encoder = new TextEncoder()
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encodedText = encoder.encode(text)

  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGO, iv },
    key,
    encodedText
  )

  // Combine IV and ciphertext for storage
  const combined = new Uint8Array(iv.length + ciphertext.byteLength)
  combined.set(iv)
  combined.set(new Uint8Array(ciphertext), iv.length)

  return btoa(String.fromCharCode(...combined))
}

/**
 * Decrypts a Base64 encoded string.
 */
export async function decrypt(encryptedBase64: string, key: CryptoKey): Promise<string> {
  try {
    const combined = new Uint8Array(
      atob(encryptedBase64).split('').map(c => c.charCodeAt(0))
    )

    const iv = combined.slice(0, 12)
    const ciphertext = combined.slice(12)

    const decrypted = await crypto.subtle.decrypt(
      { name: ALGO, iv },
      key,
      ciphertext
    )

    return new TextDecoder().decode(decrypted)
  } catch (err) {
    console.error('Decryption failed:', err)
    return '🔒 [Decryption Error]'
  }
}

/**
 * Generates a random salt for new users.
 */
export function generateSalt(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return btoa(String.fromCharCode(...array))
}
