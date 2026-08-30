import { createWallet, importWallet } from "./generate";

const wallet = createWallet();

console.log("Wallet address:", wallet.address);
console.log("Recovery phrase:", wallet.mnemonic);

const imported = importWallet(wallet.mnemonic);

console.log("Imported address:", imported.address);

if (wallet.address !== imported.address) {
  throw new Error("Wallet import test failed");
}

console.log("Wallet generation/import test: PASSED");
