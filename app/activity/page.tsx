"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  ChevronRight,
  History,
  RefreshCw,
  Search,
} from "lucide-react";

type Activity = {
  hash: string;
  type: "send" | "receive" | "swap";
  status: "confirmed" | "pending" | "failed";
  token: string;
  amount: string;
  address: string;
  timestamp: string;
};

function ActivityIcon({ type }: { type: Activity["type"] }) {
  if (type === "receive") {
    return <ArrowDownLeft size={19} />;
  }

  if (type === "swap") {
    return <ArrowLeftRight size={19} />;
  }

  return <ArrowUpRight size={19} />;
}

export default function ActivityPage() {
  const [address, setAddress] = useState("");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadActivity(walletAddress: string) {
    if (!walletAddress) {
      setActivities([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/activity?address=${encodeURIComponent(walletAddress)}`,
        {
          cache: "no-store",
        },
      );

      if (!response.ok) {
        throw new Error("Unable to load wallet activity.");
      }

      const data = await response.json();

      setActivities(
        Array.isArray(data.activities)
          ? data.activities
          : [],
      );
    } catch (err) {
      setActivities([]);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load wallet activity.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const storedAddress =
      localStorage.getItem("dex-wallet-address") || "";

    setAddress(storedAddress);

    if (storedAddress) {
      void loadActivity(storedAddress);
    } else {
      setLoading(false);
    }
  }, []);

  const filteredActivities = activities.filter((item) => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return [
      item.hash,
      item.type,
      item.token,
      item.address,
      item.status,
    ]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });

  return (
    <main className="wallet-shell">
      <div className="wallet-content">
        <div className="activity-page">
          <header className="activity-header">
            <div>
              <Link
                href="/wallet"
                className="activity-back"
              >
                <ChevronRight
                  size={16}
                  style={{
                    transform: "rotate(180deg)",
                  }}
                />
                Wallet
              </Link>

              <div className="wallet-account-eyebrow">
                WALLET ACTIVITY
              </div>

              <h1>Activity</h1>

              <p>
                View transactions recorded for your connected
                wallet on BNB Smart Chain.
              </p>
            </div>

            {address && (
              <button
                type="button"
                className="secondary-wallet-action"
                onClick={() => void loadActivity(address)}
                disabled={loading}
              >
                <RefreshCw size={15} />
                {loading ? "Refreshing..." : "Refresh"}
              </button>
            )}
          </header>

          <section className="activity-panel">
            <div className="activity-toolbar">
              <div className="activity-search">
                <Search size={17} />

                <input
                  type="search"
                  placeholder="Search transactions"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  aria-label="Search transactions"
                />
              </div>
            </div>

            {!address ? (
              <div className="activity-empty">
                <div className="activity-empty-icon">
                  <History size={25} />
                </div>

                <h2>Wallet not connected</h2>

                <p>
                  Connect or unlock your wallet to view its
                  on-chain activity.
                </p>
              </div>
            ) : loading ? (
              <div className="activity-empty">
                <div className="activity-empty-icon">
                  <RefreshCw size={25} />
                </div>

                <h2>Loading activity</h2>

                <p>
                  Checking the blockchain for transactions
                  belonging to this wallet.
                </p>
              </div>
            ) : error ? (
              <div className="activity-empty">
                <div className="activity-empty-icon">
                  <History size={25} />
                </div>

                <h2>Unable to load activity</h2>

                <p>{error}</p>
              </div>
            ) : filteredActivities.length === 0 ? (
              <div className="activity-empty">
                <div className="activity-empty-icon">
                  <History size={25} />
                </div>

                <h2>No transactions yet</h2>

                <p>
                  No recorded transactions were found for this
                  wallet on BNB Smart Chain.
                </p>
              </div>
            ) : (
              <div className="activity-list">
                {filteredActivities.map((item) => (
                  <article
                    className="activity-row"
                    key={item.hash}
                  >
                    <div
                      className={`activity-icon ${item.type}`}
                    >
                      <ActivityIcon type={item.type} />
                    </div>

                    <div className="activity-details">
                      <div className="activity-title-row">
                        <div>
                          <strong>
                            {item.type === "receive"
                              ? "Received"
                              : item.type === "send"
                                ? "Sent"
                                : "Swap"}
                          </strong>

                          <span>{item.token}</span>
                        </div>

                        <span
                          className={`activity-status ${item.status}`}
                        >
                          {item.status}
                        </span>
                      </div>

                      <div className="activity-meta">
                        <span>{item.timestamp}</span>
                        <span>•</span>
                        <span>BNB Smart Chain</span>
                      </div>

                      <div className="activity-address">
                        {item.address}
                      </div>
                    </div>

                    <div className="activity-amount">
                      <strong>{item.amount}</strong>

                      <a
                        href={`https://bscscan.com/tx/${item.hash}`}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="View transaction on BscScan"
                      >
                        View
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <div className="activity-footer">
            <History size={15} />
            Only activity returned for this wallet address is
            displayed.
          </div>
        </div>
      </div>
    </main>
  );
}
