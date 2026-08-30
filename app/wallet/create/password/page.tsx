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
  Sparkles,
} from "lucide-react";

function BlockchainLogo({ size = 56 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="TredDEX Wallet"
      role="img"
    >
      <defs>
        <linearGradient
          id="tdx-password-gradient"
          x1="5"
          y1="5"
          x2="43"
          y2="43"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFE27A" />
          <stop offset="0.5" stopColor="#F5B72E" />
          <stop offset="1" stopColor="#D98A0B" />
        </linearGradient>
      </defs>

      <rect
        x="1"
        y="1"
        width="46"
        height="46"
        rx="14"
        fill="#171B24"
        stroke="rgba(255,255,255,0.12)"
      />

      <path
        d="M24 8L36.5 15.2V29.6L24 36.8L11.5 29.6V15.2L24 8Z"
        stroke="url(#tdx-password-gradient)"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />

      <path
        d="M24 15.2L30.5 19V26.5L24 30.3L17.5 26.5V19L24 15.2Z"
        fill="url(#tdx-password-gradient)"
      />

      <path
        d="M24 8V15.2M36.5 15.2L30.5 19M36.5 29.6L30.5 26.5M24 36.8V30.3M11.5 29.6L17.5 26.5M11.5 15.2L17.5 19"
        stroke="#FFF4C7"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      <circle cx="24" cy="8" r="2" fill="#FFE27A" />
      <circle cx="36.5" cy="15.2" r="2" fill="#FFE27A" />
      <circle cx="36.5" cy="29.6" r="2" fill="#FFE27A" />
      <circle cx="24" cy="36.8" r="2" fill="#FFE27A" />
      <circle cx="11.5" cy="29.6" r="2" fill="#FFE27A" />
      <circle cx="11.5" cy="15.2" r="2" fill="#FFE27A" />
    </svg>
  );
}

function getStrength(password: string) {
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) {
    return {
      label: "Weak",
      level: 1,
    };
  }

  if (score <= 4) {
    return {
      label: "Good",
      level: 2,
    };
  }

  return {
    label: "Strong",
    level: 3,
  };
}

export default function CreateWalletPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const [touched, setTouched] = useState(false);
  const [confirmationTouched, setConfirmationTouched] = useState(false);

  const strength = useMemo(
    () => getStrength(password),
    [password],
  );

  const requirements = [
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


  const passwordValid = requirements.every(
    (item) => item.valid,
  );

  const passwordsMatch =
    password.length > 0 &&
    confirmation.length > 0 &&
    password === confirmation;

  const canContinue =
    passwordValid && passwordsMatch;

  function continueToRecoveryPhrase() {
    if (!canContinue) {
      setTouched(true);
      setConfirmationTouched(true);
      return;
    }

    sessionStorage.setItem(
      "tdx-pending-password",
      password,
    );

    router.push("/wallet/create/recovery");
  }

  return (

    <main className="wallet-shell">
      <div className="wallet-content">
        <section className="wallet-password-page">
          <button
            type="button"
            className="wallet-password-back"
            onClick={() => router.push("/wallet")}
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>

          <div className="wallet-password-header">
            <div className="wallet-password-logo">
              <BlockchainLogo size={58} />
            </div>

            <div className="wallet-password-step">
              STEP 1 OF 4
            </div>

            <h1>Create your password</h1>

            <p>
              Protect access to your TredDEX wallet with a
              strong password. This password helps secure the
              encrypted wallet stored on your device.
            </p>
          </div>

          <div className="wallet-password-security">
            <div className="wallet-password-security-icon">
              <LockKeyhole size={21} />
            </div>

            <div>
              <strong>Your password stays private</strong>

              <p>
                TredDEX does not receive or recover your wallet
                password. Keep it somewhere secure.
              </p>
            </div>
          </div>

          <div className="wallet-password-card">
            <div className="wallet-password-card-heading">
              <div>
                <div className="wallet-password-eyebrow">
                  WALLET SECURITY
                </div>

                <h2>Set a strong password</h2>
              </div>

              <div className="wallet-password-card-icon">
                <KeyRound size={20} />
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
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                onBlur={() => setTouched(true)}
                placeholder="Enter a strong password"
                autoComplete="new-password"
                className={
                  touched && !passwordValid
                    ? "wallet-password-input invalid"
                    : "wallet-password-input"
                }
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
                  <span>Password strength</span>

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
                          ? `active strength-bar-${strength.level}`
                          : ""
                      }
                    />
                  ))}
                </div>
              </div>
            )}

            <label className="wallet-password-label confirmation-label">
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
                onChange={(event) =>
                  setConfirmation(event.target.value)
                }
                onBlur={() =>
                  setConfirmationTouched(true)
                }
                placeholder="Confirm your password"
                autoComplete="new-password"
                className={
                  confirmationTouched &&
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

            {confirmationTouched &&
              confirmation.length > 0 &&
              !passwordsMatch && (
                <div className="wallet-password-error">
                  Passwords do not match.
                </div>
              )}

            <div className="wallet-password-requirements">
              <div className="wallet-password-requirements-title">
                Password requirements
              </div>

              <div className="wallet-password-requirements-grid">
                {requirements.map(
                  (requirement) => (
                    <div
                      key={requirement.label}
                      className={
                        requirement.valid
                          ? "password-requirement valid"
                          : "password-requirement"
                      }
                    >
                      <span className="password-requirement-icon">
                        <Check size={12} />
                      </span>

                      <span>
                        {requirement.label}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>

          <div className="wallet-password-warning">
            <ShieldCheck size={19} />

            <div>
              <strong>
                Important security notice
              </strong>

              <p>
                Your wallet is self-custodial. Losing your
                password and recovery phrase may permanently
                prevent access to your assets. TredDEX cannot
                reset your wallet credentials.
              </p>
            </div>
          </div>

          <button
            type="button"
            className={
              canContinue
                ? "wallet-password-continue enabled"
                : "wallet-password-continue"
            }
            onClick={continueToRecoveryPhrase}
          >
            <span>Continue</span>
            <ArrowRight size={19} />
          </button>

          <div className="wallet-password-progress">
            <span className="active" />
            <span />
            <span />
            <span />
          </div>

          <footer className="wallet-password-footer">
            <BlockchainLogo size={25} />

            <span>TredDEX Wallet</span>

            <span className="footer-dot">
              •
            </span>

            <span>
              Self-custodial Web3 infrastructure
            </span>

            <Sparkles size={13} />
          </footer>
        </section>
      </div>
    </main>
  );
}
