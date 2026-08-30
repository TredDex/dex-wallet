import {
  generateMnemonic,
  mnemonicToAccount,
  english,
} from "viem/accounts";

import {
  validateMnemonic,
  mnemonicToSeedSync,
} from "@scure/bip39";

export function createWallet() {
  const mnemonic = generateMnemonic(english);

  const account = mnemonicToAccount(mnemonic);

  return {
    mnemonic,
    address: account.address,
  };
}

export function importWallet(mnemonic: string) {
  const normalized = mnemonic.trim().replace(/\s+/g, " ");

  if (!validateMnemonic(normalized, english)) {
    throw new Error("Invalid recovery phrase");
  }

  // Force BIP-39 validation/seed derivation locally.
  mnemonicToSeedSync(normalized);

  const account = mnemonicToAccount(normalized);

  return {
    mnemonic: normalized,
    address: account.address,
  };
}
