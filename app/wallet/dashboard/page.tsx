"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { mnemonicToAccount } from "viem/accounts";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { unlockWallet } from "@/lib/wallet/storage";

export default function WalletDashboardPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [address, setAddress] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function unlock() {
    if (!password || loading) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const mnemonic = await unlockWallet(password);
      const account = mnemonicToAccount(mnemonic);

      setAddress(account.address);
      setUnlocked(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to unlock wallet.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (unlocked) {
    return (
      <main className="wallet-shell">
        <div className="wallet-content">
          <section
            className="wallet-account-page"
            style={{
              maxWidth: 560,
              margin: "0 auto",
            }}
          >
            <div className="wallet-account-header">
              <div className="wallet-account-logo">
                <WalletCards size={42} />
              </div>

              <div className="wallet-account-eyebrow">
                TredDEX • WALLET
              </div>

              <h1>
                Wallet
                <br />
                <span>Unlocked.</span>
              </h1>

              <p>
                Your self-custodial wallet is ready. Your wallet
                credentials remain encrypted locally on this device.
              </p>
            </div>

            <div
              style={{
                marginTop: 24,
                padding: 18,
                borderRadius: 18,
                border:
                  "1px solid rgba(255,255,255,.08)",
                background:
                  "rgba(255,255,255,.025)",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: ".14em",
                  color: "rgba(245,183,46,.75)",
                }}
              >
                WALLET ADDRESS
              </div>

              <div
                style={{
                  marginTop: 10,
                  fontSize: 12,
                  lineHeight: 1.6,
                  wordBreak: "break-all",
                  color: "rgba(255,255,255,.78)",
                }}
              >
                {address}
              </div>
            </div>

            <div
              className="wallet-password-security"
              style={{ marginTop: 16 }}
            >
              <div className="wallet-password-security-icon">
                <ShieldCheck size={21} />
              </div>

              <div>
                <strong>Self-custodial wallet</strong>

                <p>
                  Your encrypted wallet is stored locally. Never
                  share your password or recovery phrase.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="wallet-shell">
      <div className="wallet-content">
        <section className="wallet-password-page">
          <div className="wallet-password-header">
            <div className="wallet-password-logo">
              <WalletCards
                size={44}
                style={{ color: "#f5b72e" }}
              />
            </div>

            <div className="wallet-password-step">
              TredDEX WALLET
            </div>

            <h1>Unlock your wallet</h1>

            <p>
              Enter your wallet password to securely decrypt your
              locally stored wallet.
            </p>
          </div>

          <div className="wallet-password-card">
            <div className="wallet-password-card-heading">
              <div>
                <div className="wallet-password-eyebrow">
                  WALLET SECURITY
                </div>

                <h2>Enter password</h2>
              </div>

              <div className="wallet-password-card-icon">
                <LockKeyhole size={20} />
              </div>
            </div>

            <label className="wallet-password-label">
              Password
            </label>

            <div className="wallet-password-input-wrap">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    unlock();
                  }
                }}
                placeholder="Enter your wallet password"
                autoComplete="current-password"
                className="wallet-password-input"
              />

              <button
                type="button"
                className="wallet-password-eye"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff size={19} />
                ) : (
                  <Eye size={19} />
                )}
              </button>
            </div>

            {error && (
              <div
                style={{
                  marginTop: 14,
                  padding: 12,
                  borderRadius: 12,
                  background: "rgba(255,70,70,.08)",
                  border:
                    "1px solid rgba(255,70,70,.16)",
                  color: "#ff8d8d",
                  fontSize: 11,
                  lineHeight: 1.5,
                }}
              >
                {error}
              </div>
            )}
          </div>

          <button
            type="button"
            className={
              password && !loading
                ? "wallet-password-continue enabled"
                : "wallet-password-continue"
            }
            onClick={unlock}
            disabled={!password || loading}
            style={{
              marginTop: 18,
              opacity:
                password && !loading ? 1 : 0.5,
            }}
          >
            <span>
              {loading
                ? "Unlocking..."
                : "Unlock Wallet"}
            </span>

            <LockKeyhole size={19} />
          </button>

          <button
            type="button"
            className="secondary-wallet-action"
            onClick={() => router.push("/wallet")}
            style={{
              width: "100%",
              marginTop: 10,
            }}
          >
            Back to Wallet
          </button>

          <footer className="wallet-password-footer">
            <span>TredDEX Wallet</span>
            <span className="footer-dot">•</span>
            <span>
              Self-custodial Web3 infrastructure
            </span>
          </footer>
        </section>
      </div>
    </main>
  );
}
