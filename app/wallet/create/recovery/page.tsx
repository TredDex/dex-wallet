"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { createWallet } from "@/lib/wallet/generate";

export default function RecoveryPage() {
  const router = useRouter();

  const [mnemonic, setMnemonic] = useState<string[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const wallet = createWallet();
    setMnemonic(wallet.mnemonic.split(" "));
  }, []);

  function copyPhrase() {
    if (mnemonic.length === 0) return;

    navigator.clipboard
      .writeText(mnemonic.join(" "))
      .then(() => {
        setCopied(true);

        setTimeout(() => {
          setCopied(false);
        }, 1800);
      })
      .catch(() => {
        setCopied(false);
      });
  }

  function continueToBackup() {
    if (!confirmed || mnemonic.length !== 12) {
      return;
    }

    /*
     * The recovery phrase will be passed to the next
     * wallet-creation step without placing it in the URL.
     *
     * sessionStorage is temporary and will be cleared
     * after the encrypted wallet is created.
     */
    sessionStorage.setItem(
      "tdx-pending-mnemonic",
      mnemonic.join(" "),
    );

    router.push("/wallet/create/backup");
  }

  return (
    <main className="wallet-shell">
      <div className="wallet-content">
        <section className="wallet-password-page">
          <button
            type="button"
            className="wallet-password-back"
            onClick={() => router.back()}
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>

          <div className="wallet-password-header">
            <div className="wallet-password-logo">
              <KeyRound
                size={42}
                style={{ color: "#f5b72e" }}
              />
            </div>

            <div className="wallet-password-step">
              STEP 2 OF 4
            </div>

            <h1>Secure your recovery phrase</h1>

            <p>
              This 12-word phrase is the master backup for
              your wallet. Anyone who has it can control the
              assets in your wallet.
            </p>
          </div>

          <div className="wallet-password-warning">
            <ShieldAlert size={20} />

            <div>
              <strong>Never share these words</strong>

              <p>
                TredDEX support will never ask for your
                recovery phrase, private key, or password.
              </p>
            </div>
          </div>

          <div className="wallet-password-card">
            <div className="wallet-password-card-heading">
              <div>
                <div className="wallet-password-eyebrow">
                  RECOVERY PHRASE
                </div>

                <h2>Your 12 words</h2>
              </div>

              <div className="wallet-password-card-icon">
                <ShieldCheck size={20} />
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(3, minmax(0, 1fr))",
                gap: 9,
                marginTop: 18,
              }}
            >
              {mnemonic.map((word, index) => (
                <div
                  key={`${word}-${index}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    minHeight: 48,
                    padding: "9px 10px",
                    border:
                      "1px solid rgba(255,255,255,.07)",
                    borderRadius: 12,
                    background:
                      "rgba(255,255,255,.025)",
                  }}
                >
                  <span
                    style={{
                      width: 20,
                      flex: "0 0 20px",
                      color:
                        "rgba(255,255,255,.28)",
                      fontSize: 9,
                      fontWeight: 800,
                      textAlign: "center",
                    }}
                  >
                    {index + 1}
                  </span>

                  <span
                    style={{
                      color: revealed
                        ? "rgba(255,255,255,.86)"
                        : "rgba(255,255,255,.18)",
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: ".02em",
                      filter: revealed
                        ? "none"
                        : "blur(5px)",
                      userSelect: revealed
                        ? "text"
                        : "none",
                    }}
                  >
                    {word}
                  </span>
                </div>
              ))}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "1fr 1fr",
                gap: 9,
                marginTop: 15,
              }}
            >
              <button
                type="button"
                className="secondary-wallet-action"
                onClick={() =>
                  setRevealed(!revealed)
                }
              >
                {revealed ? (
                  <EyeOff size={17} />
                ) : (
                  <Eye size={17} />
                )}

                <span>
                  {revealed
                    ? "Hide phrase"
                    : "Reveal phrase"}
                </span>
              </button>

              <button
                type="button"
                className="secondary-wallet-action"
                onClick={copyPhrase}
                disabled={!revealed}
              >
                <Check size={17} />

                <span>
                  {copied
                    ? "Copied"
                    : "Copy phrase"}
                </span>
              </button>
            </div>
          </div>

          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 11,
              marginTop: 17,
              padding: 14,
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
              style={{
                width: 18,
                height: 18,
                marginTop: 1,
                accentColor: "#f5b72e",
              }}
            />

            <span
              style={{
                color:
                  "rgba(255,255,255,.58)",
                fontSize: 11,
                lineHeight: 1.55,
              }}
            >
              I have securely backed up my recovery
              phrase and understand that TredDEX cannot
              recover it for me.
            </span>
          </label>

          <button
            type="button"
            className={
              confirmed
                ? "wallet-password-continue enabled"
                : "wallet-password-continue"
            }
            onClick={continueToBackup}
            disabled={!confirmed}
            style={{
              opacity: confirmed ? 1 : 0.5,
              cursor: confirmed
                ? "pointer"
                : "not-allowed",
            }}
          >
            <span>Continue</span>
            <ArrowRight size={19} />
          </button>

          <div className="wallet-password-progress">
            <span />
            <span className="active" />
            <span />
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
    </main>
  );
}
