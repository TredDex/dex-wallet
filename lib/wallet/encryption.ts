const ITERATIONS = 310000;
const KEY_LENGTH = 256;

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
}

async function deriveKey(
  password: string,
  salt: Uint8Array,
): Promise<CryptoKey> {
  const encoder = new TextEncoder();

  const passwordKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: toArrayBuffer(salt),
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    passwordKey,
    {
      name: "AES-GCM",
      length: KEY_LENGTH,
    },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptWallet(
  mnemonic: string,
  password: string,
) {
  if (!password || password.length < 8) {
    throw new Error("Password must contain at least 8 characters");
  }

  const encoder = new TextEncoder();

  const salt = new Uint8Array(16);
  const iv = new Uint8Array(12);

  crypto.getRandomValues(salt);
  crypto.getRandomValues(iv);

  const key = await deriveKey(password, salt);

  const encrypted = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: toArrayBuffer(iv),
    },
    key,
    encoder.encode(mnemonic),
  );

  return {
    version: 1,
    algorithm: "AES-GCM",
    kdf: "PBKDF2-SHA256",
    iterations: ITERATIONS,
    salt: bytesToBase64(salt),
    iv: bytesToBase64(iv),
    data: bytesToBase64(new Uint8Array(encrypted)),
  };
}

export async function decryptWallet(
  encryptedWallet: {
    salt: string;
    iv: string;
    data: string;
    iterations?: number;
  },
  password: string,
): Promise<string> {
  const salt = base64ToBytes(encryptedWallet.salt);
  const iv = base64ToBytes(encryptedWallet.iv);
  const data = base64ToBytes(encryptedWallet.data);

  const key = await deriveKey(password, salt);

  try {
    const decrypted = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: toArrayBuffer(iv),
      },
      key,
      toArrayBuffer(data),
    );

    return new TextDecoder().decode(decrypted);
  } catch {
    throw new Error("Incorrect password or corrupted wallet");
  }
}
