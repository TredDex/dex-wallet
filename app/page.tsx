"use client";

import { useState } from "react";
import { formatUnits } from "viem";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ChevronDown,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Menu,
  RefreshCw,
  Send,
  Settings,
  ShieldCheck,
  WalletCards,
  X,
} from "lucide-react";
import {
  useAccount,
  useBalance,
  useConnect,
  useDisconnect,
} from "wagmi";

function shortenAddress(address?: string) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatBalance(value?: bigint, decimals?: number) {
  if (value === undefined || decimals === undefined) return "0.0000";

  const amount = Number(formatUnits(value, decimals));

  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  });
}

function BlockchainLogo({ size = 42 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="TredDEX blockchain logo"
      role="img"
    >
      <defs>
        <linearGradient
          id="tdx-logo-gradient"
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
        stroke="url(#tdx-logo-gradient)"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />

      <path
        d="M24 15.2L30.5 19V26.5L24 30.3L17.5 26.5V19L24 15.2Z"
        fill="url(#tdx-logo-gradient)"
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

export default function Home() {
  const [showBalance, setShowBalance] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const {
    data: balance,
    isLoading: balanceLoading,
    refetch,
  } = useBalance({
    address,
    chainId: 56,
  });

  const { connectors, connect, isPending } = useConnect();

  const formattedBalance = balance
    ? formatBalance(balance.value, balance.decimals)
    : "0.0000";

  const connectWallet = () => {
    if (connectors[0]) {
      connect({ connector: connectors[0] });
    }
  };

  return (
    <main className="wallet-shell">
      <header className="wallet-header">
        <div className="header-inner">
          <a href="/" className="brand">
            <BlockchainLogo size={43} />

            <div className="brand-copy">
              <div className="brand-name">
                Tred<span>DEX</span>
              </div>
              <div className="brand-subtitle">WEB3 WALLET</div>
            </div>
          </a>

          <div className="desktop-actions">
            <button
              onClick={() => refetch()}
              className="icon-button"
              aria-label="Refresh wallet"
              title="Refresh wallet"
            >
              <RefreshCw size={18} />
            </button>

            <button className="network-button">
              <span className="network-dot" />
              <span>BNB Smart Chain</span>
              <ChevronDown size={15} />
            </button>

            {isConnected ? (
              <button
                onClick={() => disconnect()}
                className="address-button"
              >
                <span className="connected-dot" />
                {shortenAddress(address)}
              </button>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isPending || connectors.length === 0}
                className="connect-button"
              >
                {isPending ? "Connecting..." : "Connect Wallet"}
              </button>
            )}
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="mobile-menu-button"
            aria-label="Open wallet menu"
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>

        {menuOpen && (
          <div className="mobile-menu">
            <button
              onClick={() => refetch()}
              className="mobile-menu-item"
            >
              <RefreshCw size={18} />
              Refresh balance
            </button>

            <button className="mobile-menu-item">
              <Settings size={18} />
              Wallet settings
            </button>

            {isConnected ? (
              <button
                onClick={() => {
                  disconnect();
                  setMenuOpen(false);
                }}
                className="mobile-connect-button"
              >
                Disconnect {shortenAddress(address)}
              </button>
            ) : (
              <button
                onClick={() => {
                  connectWallet();
                  setMenuOpen(false);
                }}
                disabled={isPending || connectors.length === 0}
                className="mobile-connect-button"
              >
                {isPending ? "Connecting..." : "Connect Wallet"}
              </button>
            )}
          </div>
        )}
      </header>

      <div className="wallet-content">
        <div className="page-heading">
          <div>
            <div className="eyebrow">PORTFOLIO</div>
            <h1>Your Wallet</h1>
          </div>

          <div className="chain-pill">
            <span className="network-dot" />
            BNB Chain
          </div>
        </div>

        <section className="balance-card">
          <div className="balance-glow balance-glow-one" />
          <div className="balance-glow balance-glow-two" />

          <div className="balance-card-content">
            <div className="balance-top">
              <div>
                <div className="balance-label">TOTAL BALANCE</div>

                <div className="balance-value">
                  {showBalance ? (
                    balanceLoading ? (
                      <span className="loading-text">Loading...</span>
                    ) : (
                      <>
                        {formattedBalance}
                        <span className="balance-symbol">
                          {balance?.symbol ?? "BNB"}
                        </span>
                      </>
                    )
                  ) : (
                    "••••••••"
                  )}
                </div>

                <div className="balance-status">
                  <span className="status-indicator" />
                  {isConnected
                    ? `Connected ${shortenAddress(address)}`
                    : "Wallet not connected"}
                </div>
              </div>

              <button
                onClick={() => setShowBalance(!showBalance)}
                className="balance-eye"
                aria-label={
                  showBalance ? "Hide wallet balance" : "Show wallet balance"
                }
              >
                {showBalance ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>

            <div className="balance-actions">
              <button className="primary-wallet-action">
                <ArrowDownToLine size={19} />
                Receive
              </button>

              <button className="secondary-wallet-action">
                <Send size={19} />
                Send
              </button>

              <button className="secondary-wallet-action">
                <ArrowUpFromLine size={19} />
                Swap
              </button>
            </div>
          </div>
        </section>

        <section className="assets-section">
          <div className="section-heading">
            <div>
              <h2>Assets</h2>
              <p>Tokens held in your wallet</p>
            </div>

            <button
              onClick={() => refetch()}
              className="refresh-small"
              aria-label="Refresh assets"
            >
              <RefreshCw size={16} />
            </button>
          </div>

          <div className="asset-list">
            <div className="asset-row">
              <div className="asset-left">
                <div className="bnb-logo">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 32 32"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M16 3.5L20.1 7.6L16 11.7L11.9 7.6L16 3.5Z"
                      fill="currentColor"
                    />
                    <path
                      d="M9 9.8L13.1 13.9L9 18L4.9 13.9L9 9.8Z"
                      fill="currentColor"
                    />
                    <path
                      d="M23 9.8L27.1 13.9L23 18L18.9 13.9L23 9.8Z"
                      fill="currentColor"
                    />
                    <path
                      d="M16 13.1L20.1 17.2L16 21.3L11.9 17.2L16 13.1Z"
                      fill="currentColor"
                    />
                    <path
                      d="M9 19.2L13.1 23.3L16 26.2L18.9 23.3L23 19.2L27.1 23.3L16 28.5L4.9 23.3L9 19.2Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>

                <div>
                  <div className="asset-name">BNB</div>
                  <div className="asset-network">BNB Smart Chain</div>
                </div>
              </div>

              <div className="asset-right">
                <div className="asset-amount">
                  {showBalance
                    ? balanceLoading
                      ? "..."
                      : formattedBalance
                    : "••••••"}
                </div>
                <div className="asset-symbol">BNB</div>
              </div>
            </div>
          </div>
        </section>

        {isConnected && address && (
          <section className="address-card">
            <div className="address-icon">
              <WalletCards size={20} />
            </div>

            <div className="address-info">
              <div className="address-label">WALLET ADDRESS</div>
              <div className="address-value">{shortenAddress(address)}</div>
            </div>

            <div className="address-actions">
              <button
                onClick={() => navigator.clipboard.writeText(address)}
                className="address-action"
                aria-label="Copy wallet address"
              >
                <Copy size={17} />
              </button>

              <a
                href={`https://bscscan.com/address/${address}`}
                target="_blank"
                rel="noreferrer"
                className="address-action"
                aria-label="View wallet on BscScan"
              >
                <ExternalLink size={17} />
              </a>
            </div>
          </section>
        )}

        <section className="security-card">
          <div className="security-icon">
            <ShieldCheck size={22} />
          </div>

          <div>
            <h3>Self-custody protection</h3>
            <p>
              Your wallet is designed around self-custody. Never share your
              recovery phrase or private keys, and always verify transaction
              details before signing.
            </p>
          </div>
        </section>

        <footer className="wallet-footer">
          <BlockchainLogo size={28} />
          <span>TredDEX Wallet</span>
          <span className="footer-separator">•</span>
          <span>Non-custodial Web3 wallet</span>
        </footer>
      </div>
    </main>
  );
}
