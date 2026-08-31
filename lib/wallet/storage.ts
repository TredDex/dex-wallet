import {
  decryptWallet,
  encryptWallet,
} from "./encryption";

const STORAGE_KEY = "dex-wallet-encrypted";

export type StoredWallet = {
  version: number;
  algorithm: string;
  kdf: string;
  iterations: number;
  salt: string;
  iv: string;
  data: string;
};

export async function saveWallet(
  mnemonic: string,
  password: string,
) {
  const encrypted = await encryptWallet(
    mnemonic,
    password,
  );

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(encrypted),
  );

  return encrypted;
}

export async function unlockWallet(
  password: string,
) {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    throw new Error("No wallet found");
  }

  const stored = JSON.parse(raw) as StoredWallet;

  return decryptWallet(stored, password);
}

export function hasWallet(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null;
}

export function removeWallet(): void {
  localStorage.removeItem(STORAGE_KEY);
}

const ADDRESS_KEY = "dex-wallet-address";

export function saveWalletAddress(address: string): void {
  localStorage.setItem(ADDRESS_KEY, address);
}

export function getWalletAddress(): string {
  return localStorage.getItem(ADDRESS_KEY) || "";
}

export function removeWalletAddress(): void {
  localStorage.removeItem(ADDRESS_KEY);
}

