"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { importWallet } from "@/lib/wallet/generate";
import { saveWallet } from "@/lib/wallet/storage";

type Step = "phrase" | "password";

function getStrength(password: string) {
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { label: "Weak", level: 1 };
  if (score <= 4) return { label: "Good", level: 2 };

  return { label: "Strong", level: 3 };
}

export default function ImportWalletPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("phrase");

  const [phrase, setPhrase] = useState("");
  const [revealed, setRevealed] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const normalizedPhrase = useMemo(
    () => phrase.trim().replace(/\s+/g, " "),
    [phrase],
  );

  const wordCount =
    normalizedPhrase.length > 0
      ? normalizedPhrase.split(" ").length
      : 0;

  const strength = useMemo(
    () => getStrength(password),
    [password],
  );

  const passwordRequirements = [
    {
      label: "At least 8 characters",
      valid: password.length >= 8,
    },
    {
      label: "Uppercase and lowercase letters",
      valid:
        /[a-z]/.test(password) &&
        /[A-Z]/.test(password),
    },
    {
      label: "At least one number",
      valid: /\d/.test(password),
    },
    {
      label: "At least one special character",
      valid: /[^A-Za-z0-9]/.test(password),
    },
  ];

  const passwordValid = passwordRequirements.every(
    (item) => item.valid,
  );

  const passwordsMatch =
    password.length > 0 &&
    confirmation.length > 0 &&
    password === confirmation;

  const phraseLooksValid = wordCount === 12;

  function validatePhrase() {
    setError("");

    if (!phraseLooksValid) {
      setError(
        `Enter a valid 12-word recovery phrase. You entered ${wordCount} word${
          wordCount === 1 ? "" : "s"
        }.`,
      );
      return;
    }

    try {
      const imported = importWallet(normalizedPhrase);

      setAddress(imported.address);
      setPhrase(normalizedPhrase);
      setStep("password");
    } catch {
      setError(
        "Invalid recovery phrase. Check every word and make sure the phrase is a valid BIP-39 recovery phrase.",
      );
    }
  }

  async function completeImport() {
    setError("");

    if (!address || !normalizedPhrase) {
      setError("Your recovery phrase is missing. Please restart.");
      return;
    }

    if (!passwordValid) {
      setError("Please meet all password requirements.");
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords do not match.");
      return;
    }

    if (loading) return;

    setLoading(true);

    try {
      /*
       * Validate again immediately before saving so the phrase
       * being encrypted is guaranteed to be a valid BIP-39 phrase.
       */
      const imported = importWallet(normalizedPhrase);

      await saveWallet(imported.mnemonic, password);
      localStorage.setItem(
  "dex-wallet-address",
  imported.address,
);

      /*
       * The mnemonic and password only existed in React state
       * during this flow. The encrypted wallet is now stored
       * through the existing wallet storage implementation.
       */
      setPhrase("");
      setPassword("");
      setConfirmation("");

    router.replace("/");
    } catch (err) {
      setLoading(false);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to import wallet. Please try again.",
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
            onClick={() => {
              if (loading) return;

              if (step === "password") {
                setStep("phrase");
                setError("");
              } else {
                router.push("/wallet");
              }
            }}
            disabled={loading}
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>

          <div className="wallet-password-header">
            <div className="wallet-password-logo">
              {step === "phrase" ? (
                <WalletCards
                  size={44}
                  style={{ color: "#f5b72e" }}
                />
              ) : (
                <LockKeyhole
                  size={44}
                  style={{ color: "#f5b72e" }}
                />
              )}
            </div>

            <div className="wallet-password-step">
              {step === "phrase"
                ? "IMPORT WALLET"
                : "WALLET SECURITY"}
            </div>

            <h1>
              {step === "phrase"
                ? "Restore your wallet"
                : "Protect your wallet"}
            </h1>

            <p>
              {step === "phrase"
                ? "Enter your existing 12-word recovery phrase to restore your self-custodial wallet on this device."
                : "Create a strong password to encrypt the imported wallet locally on this device."}
            </p>
          </div>

          {step === "phrase" ? (
            <>
              <div className="wallet-password-warning">
                <ShieldCheck size={20} />

                <div>
                  <strong>Your recovery phrase stays local</strong>

                  <p>
                    TredDEX does not send your recovery phrase
                    to a server. Never share it with anyone.
                  </p>
                </div>
              </div>

              <div className="wallet-password-card">
                <div className="wallet-password-card-heading">
                  <div>
                    <div className="wallet-password-eyebrow">
                      RECOVERY PHRASE
                    </div>

                    <h2>Enter your 12 words</h2>
                  </div>

                  <div className="wallet-password-card-icon">
                    <KeyRound size={20} />
                  </div>
                </div>

                <label className="wallet-password-label">
                  Recovery phrase
                </label>

                <div
                  style={{
                    position: "relative",
                    marginTop: 8,
                  }}
                >
                  <textarea
                    value={phrase}
                    onChange={(event) => {
                      setPhrase(event.target.value);
                      setError("");
                    }}
                    placeholder="Enter your 12-word recovery phrase"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    rows={5}
                    style={{
                      width: "100%",
                      resize: "vertical",
                      minHeight: 130,
                      padding: "14px 46px 14px 14px",
                      borderRadius: 14,
                      border:
                        "1px solid rgba(255,255,255,.08)",
                      background:
                        "rgba(255,255,255,.025)",
                      color: revealed
                        ? "rgba(255,255,255,.9)"
                        : "rgba(255,255,255,.2)",
                      outline: "none",
                      fontSize: 13,
                      lineHeight: 1.7,
                      filter: revealed
                        ? "none"
                        : "blur(4px)",
                    }}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setRevealed(!revealed)
                    }
                    aria-label={
                      revealed
                        ? "Hide recovery phrase"
                        : "Show recovery phrase"
                    }
                    style={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      border: 0,
                      background: "transparent",
                      color: "rgba(255,255,255,.5)",
                      cursor: "pointer",
                      padding: 6,
                    }}
                  >
                    {revealed ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: 10,
                    color:
                      wordCount === 12
                        ? "#f5b72e"
                        : "rgba(255,255,255,.4)",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  <span>
                    {wordCount} / 12 words
                  </span>

                  {wordCount === 12 && (
                    <span>Ready to validate</span>
                  )}
                </div>

                {error && (
                  <div
                    style={{
                      marginTop: 14,
                      padding: 12,
                      borderRadius: 12,
                      background:
                        "rgba(255,70,70,.08)",
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
                  phraseLooksValid
                    ? "wallet-password-continue enabled"
                    : "wallet-password-continue"
                }
                onClick={validatePhrase}
                disabled={!phraseLooksValid}
                style={{
                  marginTop: 18,
                  opacity: phraseLooksValid ? 1 : 0.5,
                }}
              >
                <span>Validate & Continue</span>
                <ArrowRight size={19} />
              </button>

              <div className="wallet-password-progress">
                <span className="active" />
                <span />
              </div>
            </>
          ) : (
            <>
              <div className="wallet-password-security">
                <div className="wallet-password-security-icon">
                  <ShieldCheck size={21} />
                </div>

                <div>
                  <strong>Wallet verified locally</strong>

                  <p
                    style={{
                      wordBreak: "break-all",
                    }}
                  >
                    {address}
                  </p>
                </div>
              </div>

              <div className="wallet-password-card">
                <div className="wallet-password-card-heading">
                  <div>
                    <div className="wallet-password-eyebrow">
                      WALLET SECURITY
                    </div>

                    <h2>Create encryption password</h2>
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
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setError("");
                    }}
                    placeholder="Create a strong password"
                    autoComplete="new-password"
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

                {password.length > 0 && (
                  <div className="wallet-password-strength">
                    <div className="wallet-password-strength-top">
                      <span>
                        Password strength
                      </span>

                      <strong
                        className={`strength-${strength.level}`}
                      >
                        {strength.label}
                      </strong>
                    </div>

                    <div className="wallet-password-strength-bars">
                      {[1, 2, 3].map((level) => (
                        <span
                          key={level}
                          className={
                            level <= strength.level
                              ? `active strength-bar-${level}`
                              : ""
                          }
                        />
                      ))}
                    </div>
                  </div>
                )}

                <label
                  className="wallet-password-label"
                  style={{ marginTop: 18 }}
                >
                  Confirm password
                </label>

                <div className="wallet-password-input-wrap">
                  <input
                    type={
                      showConfirmation
                        ? "text"
                        : "password"
                    }
                    value={confirmation}
                    onChange={(event) => {
                      setConfirmation(
                        event.target.value,
                      );
                      setError("");
                    }}
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    className={
                      confirmation.length > 0 &&
                      !passwordsMatch
                        ? "wallet-password-input invalid"
                        : "wallet-password-input"
                    }
                  />

                  <button
                    type="button"
                    className="wallet-password-eye"
                    onClick={() =>
                      setShowConfirmation(
                        !showConfirmation,
                      )
                    }
                    aria-label={
                      showConfirmation
                        ? "Hide confirmation"
                        : "Show confirmation"
                    }
                  >
                    {showConfirmation ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>

                <div
                  style={{
                    marginTop: 18,
                    display: "grid",
                    gridTemplateColumns:
                      "1fr 1fr",
                    gap: 9,
                  }}
                >
                  {passwordRequirements.map(
                    (requirement) => (
                      <div
                        key={requirement.label}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 7,
                          fontSize: 10,
                          color: requirement.valid
                            ? "rgba(245,183,46,.9)"
                            : "rgba(255,255,255,.38)",
                        }}
                      >
                        <Check size={13} />
                        <span>
                          {requirement.label}
                        </span>
                      </div>
                    ),
                  )}
                </div>

                {error && (
                  <div
                    style={{
                      marginTop: 14,
                      padding: 12,
                      borderRadius: 12,
                      background:
                        "rgba(255,70,70,.08)",
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
                  passwordValid &&
                  passwordsMatch &&
                  !loading
                    ? "wallet-password-continue enabled"
                    : "wallet-password-continue"
                }
                onClick={completeImport}
                disabled={
                  !passwordValid ||
                  !passwordsMatch ||
                  loading
                }
                style={{
                  marginTop: 18,
                  opacity:
                    passwordValid &&
                    passwordsMatch &&
                    !loading
                      ? 1
                      : 0.5,
                }}
              >
                <span>
                  {loading
                    ? "Importing secure wallet..."
                    : "Import Wallet"}
                </span>

                {loading ? (
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
                <span className="active" />
              </div>
            </>
          )}

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
