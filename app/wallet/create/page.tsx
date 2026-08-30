"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  KeyRound,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

function BlockchainLogo({ size = 58 }: { size?: number }) {
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
          id="tdx-create-gradient"
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
        stroke="url(#tdx-create-gradient)"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />

      <path
        d="M24 15.2L30.5 19V26.5L24 30.3L17.5 26.5V19L24 15.2Z"
        fill="url(#tdx-create-gradient)"
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

export default function CreateWalletPage() {
  const router = useRouter();

  function startCreation() {
    sessionStorage.removeItem("tdx-pending-password");
    sessionStorage.removeItem("tdx-pending-mnemonic");

    router.push("/wallet/create/password");
  }

  return (
    <main className="wallet-shell">
      <div className="wallet-content">
        <section className="wallet-account-page">
          <button
            type="button"
            className="wallet-password-back"
            onClick={() => router.push("/wallet")}
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>

          <div className="wallet-account-header">
            <div className="wallet-account-logo">
              <BlockchainLogo size={62} />
            </div>

            <div className="wallet-account-eyebrow">
              TredDEX • NEW WALLET
            </div>

            <h1>
              Create your
              <br />
              <span>secure wallet.</span>
            </h1>

            <p>
              Set a password, securely back up your recovery
              phrase, and create your self-custodial Web3 wallet.
            </p>
          </div>

          <div className="wallet-account-features">
            <div className="wallet-account-feature">
              <div className="wallet-account-feature-icon">
                <ShieldCheck size={19} />
              </div>

              <div>
                <div className="wallet-account-feature-label">
                  Self-custody
                </div>

                <div className="wallet-account-feature-text">
                  You control your wallet credentials and assets.
                </div>
              </div>
            </div>

            <div className="wallet-account-feature">
              <div className="wallet-account-feature-icon">
                <KeyRound size={19} />
              </div>

              <div>
                <div className="wallet-account-feature-label">
                  Secure recovery
                </div>

                <div className="wallet-account-feature-text">
                  Your wallet is protected by a locally encrypted
                  recovery phrase.
                </div>
              </div>
            </div>

            <div className="wallet-account-feature">
              <div className="wallet-account-feature-icon">
                <WalletCards size={19} />
              </div>

              <div>
                <div className="wallet-account-feature-label">
                  BNB Smart Chain
                </div>

                <div className="wallet-account-feature-text">
                  Ready for your Web3 assets and DEX activity.
                </div>
              </div>
            </div>
          </div>

          <div className="wallet-account-actions">
            <button
              type="button"
              className="connect-button wallet-create-button"
              onClick={startCreation}
            >
              <WalletCards size={19} />
              <span>Start Wallet Creation</span>
              <ArrowRight size={18} />
            </button>
          </div>

          <div className="wallet-account-security-note">
            <ShieldCheck size={14} />

            <span>
              TredDEX will never ask you for your password,
              recovery phrase, or private keys.
            </span>
          </div>

          <div className="wallet-password-progress">
            <span className="active" />
            <span />
            <span />
            <span />
          </div>

          <footer className="wallet-account-footer">
            <BlockchainLogo size={27} />
            <span>TredDEX Wallet</span>
            <span>•</span>
            <span>Secure Web3 infrastructure</span>
          </footer>
        </section>
      </div>
    </main>
  );
}
