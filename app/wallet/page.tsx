"use client";

import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Cloud,
  KeyRound,
  ShieldCheck,
  Sparkles,
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
          id="tdx-wallet-gradient"
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
        stroke="url(#tdx-wallet-gradient)"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />

      <path
        d="M24 15.2L30.5 19V26.5L24 30.3L17.5 26.5V19L24 15.2Z"
        fill="url(#tdx-wallet-gradient)"
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

function DexVisual() {
  return (
    <div className="wallet-onboarding-visual" aria-hidden="true">
      <div className="dex-orbit dex-orbit-one" />
      <div className="dex-orbit dex-orbit-two" />

      <div className="dex-node dex-node-top">
        <span>BNB</span>
      </div>

      <div className="dex-node dex-node-left">
        <span>TRADE</span>
      </div>

      <div className="dex-node dex-node-right">
        <span>USDT</span>
      </div>

      <div className="dex-center">
        <BlockchainLogo size={72} />
        <div className="dex-center-label">DEX</div>
      </div>

      <div className="dex-pulse" />
    </div>
  );
}

function Feature({
  icon,
  label,
  text,
}: {
  icon: React.ReactNode;
  label: string;
  text: string;
}) {
  return (
    <div className="wallet-account-feature">
      <div className="wallet-account-feature-icon">{icon}</div>

      <div>
        <div className="wallet-account-feature-label">{label}</div>
        <div className="wallet-account-feature-text">{text}</div>
      </div>
    </div>
  );
}

export default function WalletAccountPage() {
  const router = useRouter();

  return (
    <main className="wallet-shell">
      <div className="wallet-content wallet-onboarding-content">
        <section className="wallet-account-page">
          <div className="wallet-account-header">
            <div className="wallet-account-logo">
              <BlockchainLogo size={62} />
            </div>

            <div className="wallet-account-eyebrow">
              TredDEX • WEB3 WALLET
            </div>

            <h1>
              Your wallet.
              <br />
              <span>Your control.</span>
            </h1>

            <p>
              Securely create or restore your self-custodial Web3 wallet
              and access your digital assets across the decentralized
              ecosystem.
            </p>
          </div>

          <DexVisual />

          <div className="wallet-account-network">
            <span className="network-dot" />
            <span>BNB Smart Chain</span>
            <span className="wallet-account-network-divider">•</span>
            <span>Non-custodial</span>
          </div>

          <div className="wallet-account-features">
            <Feature
              icon={<ShieldCheck size={19} />}
              label="Self-custody protection"
              text="Your recovery credentials remain under your control."
            />

            <Feature
              icon={<KeyRound size={19} />}
              label="Secure wallet encryption"
              text="Sensitive wallet data is encrypted before local storage."
            />

            <Feature
              icon={<Cloud size={19} />}
              label="Optional encrypted backup"
              text="Protect your encrypted wallet backup with Google Drive."
            />
          </div>

          <div className="wallet-account-actions">
            <button
              className="connect-button wallet-create-button"
              onClick={() => router.push("/wallet/create")}
            >
              <WalletCards size={19} />
              <span>Create New Wallet</span>
              <ArrowRight size={18} />
            </button>

            <button
              className="secondary-wallet-action wallet-import-button"
              onClick={() => router.push("/wallet/import")}
            >
              <KeyRound size={18} />
              <span>Import Existing Wallet</span>
            </button>
          </div>

          <div className="wallet-account-security-note">
            <Sparkles size={14} />
            <span>
              TredDEX will never ask you to disclose your recovery phrase
              or private keys.
            </span>
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
