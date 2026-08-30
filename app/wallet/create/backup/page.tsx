"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { saveWallet } from "@/lib/wallet/storage";

export default function BackupPage() {
  const router = useRouter();

  const [mnemonic, setMnemonic] = useState("");
  const [password, setPassword] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const pendingMnemonic = sessionStorage.getItem(
      "tdx-pending-mnemonic",
    );

    const pendingPassword = sessionStorage.getItem(
      "tdx-pending-password",
    );

    if (!pendingMnemonic || !pendingPassword) {
      setError(
        "Your wallet creation session is incomplete. Please restart wallet creation.",
      );
      return;
    }

    setMnemonic(pendingMnemonic);
    setPassword(pendingPassword);
  }, []);

  async function createWallet() {
    if (!confirmed || !mnemonic || !password || creating) {
      return;
    }

    setCreating(true);
    setError("");

    try {
      await saveWallet(mnemonic, password);

      /*
       * Remove temporary sensitive values after the
       * encrypted wallet has been successfully saved.
       */
      sessionStorage.removeItem("tdx-pending-password");
      sessionStorage.removeItem("tdx-pending-mnemonic");

      router.replace("/wallet/dashboard");
    } catch (err) {
      console.error(err);

      setCreating(false);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to create your wallet. Please try again.",
      );
    }
  }

  return (
    <main className="wallet-shell">
      <div className="wallet-content">
        <section className="wallet-password-page">
          <button
            type="button"
            className="wallet-password-back"
            onClick={() =>
              router.push("/wallet/create/recovery")
            }
            disabled={creating}
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>

          <div className="wallet-password-header">
            <div className="wallet-password-logo">
              <ShieldCheck
                size={44}
                style={{ color: "#f5b72e" }}
              />
            </div>

            <div className="wallet-password-step">
              STEP 3 OF 4
            </div>

            <h1>Confirm your backup</h1>

            <p>
              Your recovery phrase has been prepared. Confirm
              that you have safely stored it before your encrypted
              wallet is created.
            </p>
          </div>

          <div className="wallet-password-warning">
            <ShieldCheck size={20} />

            <div>
              <strong>Keep your recovery phrase offline</strong>

              <p>
                Never share your recovery phrase or password with
                anyone, including TredDEX support.
              </p>
            </div>
          </div>

          <div className="wallet-password-card">
            <div className="wallet-password-card-heading">
              <div>
                <div className="wallet-password-eyebrow">
                  FINAL SECURITY CHECK
                </div>

                <h2>Ready to create your wallet?</h2>
              </div>

              <div className="wallet-password-card-icon">
                <WalletCards size={20} />
              </div>
            </div>

            <p
              style={{
                marginTop: 14,
                color: "rgba(255,255,255,.52)",
                fontSize: 12,
                lineHeight: 1.65,
              }}
            >
              The recovery phrase will be encrypted using your
              wallet password and stored locally on this device.
              TredDEX does not receive your password or recovery
              phrase.
            </p>

            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 11,
                marginTop: 20,
                padding: 15,
                border:
                  "1px solid rgba(255,255,255,.07)",
                borderRadius: 15,
                background:
                  "rgba(255,255,255,.025)",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(event) =>
                  setConfirmed(event.target.checked)
                }
                disabled={creating}
                style={{
                  width: 18,
                  height: 18,
                  marginTop: 1,
                  accentColor: "#f5b72e",
                }}
              />

              <span
                style={{
                  color: "rgba(255,255,255,.62)",
                  fontSize: 11,
                  lineHeight: 1.6,
                }}
              >
                I have securely backed up my recovery phrase and
                understand that losing it may permanently prevent
                me from recovering my wallet.
              </span>
            </label>

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
              confirmed && !creating
                ? "wallet-password-continue enabled"
                : "wallet-password-continue"
            }
            onClick={createWallet}
            disabled={
              !confirmed ||
              creating ||
              !mnemonic ||
              !password
            }
            style={{
              marginTop: 18,
              opacity:
                confirmed &&
                !creating &&
                mnemonic &&
                password
                  ? 1
                  : 0.5,
            }}
          >
            <span>
              {creating
                ? "Creating secure wallet..."
                : "Create Secure Wallet"}
            </span>

            {creating ? (
              <span
                style={{
                  width: 17,
                  height: 17,
                  border:
                    "2px solid rgba(255,255,255,.3)",
                  borderTopColor: "#fff",
                  borderRadius: "50%",
                  display: "inline-block",
                  animation:
                    "wallet-spin .8s linear infinite",
                }}
              />
            ) : (
              <Check size={19} />
            )}
          </button>

          <div className="wallet-password-progress">
            <span />
            <span />
            <span className="active" />
            <span />
          </div>

          <footer className="wallet-password-footer">
            <span>TredDEX Wallet</span>
            <span className="footer-dot">•</span>
            <span>
              Self-custodial Web3 infrastructure
            </span>
          </footer>
        </section>
      </div>

      <style jsx>{`
        @keyframes wallet-spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </main>
  );
}
