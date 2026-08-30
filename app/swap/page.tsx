"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownUp,
  ChevronDown,
  Search,
  Settings2,
  X,
  Loader2,
  Wallet,
  Info,
} from "lucide-react";
import { useAccount, useBalance, useConnect } from "wagmi";

type Coin = {
  id: string;
  name: string;
  symbol: string;
  platforms?: Record<string, string>;
};

type Market = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number | null;
  price_change_percentage_24h: number | null;
};

type Token = Coin & {
  image?: string;
  price?: number | null;
  change24h?: number | null;
};

const FALLBACK_TOKENS: Token[] = [
  {
    id: "binancecoin",
    name: "BNB",
    symbol: "BNB",
    image:
      "https://coin-images.coingecko.com/coins/images/825/large/binance-coin-logo.png",
  },
  {
    id: "tether",
    name: "Tether",
    symbol: "USDT",
    image:
      "https://coin-images.coingecko.com/coins/images/325/large/Tether.png",
  },
];

function formatPrice(value?: number | null) {
  if (value === undefined || value === null) return "—";

  if (value >= 1000) {
    return `$${value.toLocaleString(undefined, {
      maximumFractionDigits: 2,
    })}`;
  }

  if (value >= 1) {
    return `$${value.toLocaleString(undefined, {
      maximumFractionDigits: 4,
    })}`;
  }

  return `$${value.toLocaleString(undefined, {
    maximumFractionDigits: 8,
  })}`;
}

function TokenLogo({
  token,
  size = 40,
}: {
  token?: Token;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);

  if (!token) {
    return (
      <div
        className="swap-token-logo swap-token-logo-placeholder"
        style={{ width: size, height: size }}
      >
        ?
      </div>
    );
  }

  if (token.image && !failed) {
    return (
      <img
        src={token.image}
        alt=""
        width={size}
        height={size}
        className="swap-token-logo"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div
      className="swap-token-logo swap-token-logo-placeholder"
      style={{ width: size, height: size }}
    >
      {token.symbol.slice(0, 1)}
    </div>
  );
}

export default function SwapPage() {
  const { address, isConnected } = useAccount();
  const { connectors, connect, isPending } = useConnect();

  const { data: balance } = useBalance({
    address,
    chainId: 56,
  });

  const [coins, setCoins] = useState<Coin[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loadingCoins, setLoadingCoins] = useState(true);

  const [fromToken, setFromToken] = useState<Token>(FALLBACK_TOKENS[0]);
  const [toToken, setToToken] = useState<Token>(FALLBACK_TOKENS[1]);

  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");

  const [selector, setSelector] = useState<"from" | "to" | null>(null);
  const [search, setSearch] = useState("");
  const [slippage, setSlippage] = useState("0.50");

  useEffect(() => {
    let cancelled = false;

    async function loadCoins() {
      try {
        setLoadingCoins(true);

        const [coinsResponse, marketsResponse] = await Promise.all([
          fetch("/api/coingecko/coins"),
          fetch("/api/coingecko/markets"),
        ]);

        if (!coinsResponse.ok || !marketsResponse.ok) {
          throw new Error("CoinGecko request failed");
        }

        const coinData: Coin[] = await coinsResponse.json();
        const marketData: Market[] = await marketsResponse.json();

        if (cancelled) return;

        setCoins(coinData);
        setMarkets(marketData);

        const marketMap = new Map(
          marketData.map((market) => [market.id, market]),
        );

        const bnbMarket = marketMap.get("binancecoin");
        const usdtMarket = marketMap.get("tether");

        if (bnbMarket) {
          setFromToken({
            id: bnbMarket.id,
            name: bnbMarket.name,
            symbol: bnbMarket.symbol.toUpperCase(),
            image: bnbMarket.image,
            price: bnbMarket.current_price,
            change24h: bnbMarket.price_change_percentage_24h,
          });
        }

        if (usdtMarket) {
          setToToken({
            id: usdtMarket.id,
            name: usdtMarket.name,
            symbol: usdtMarket.symbol.toUpperCase(),
            image: usdtMarket.image,
            price: usdtMarket.current_price,
            change24h: usdtMarket.price_change_percentage_24h,
          });
        }
      } catch (error) {
        console.error("Failed to load CoinGecko data:", error);
      } finally {
        if (!cancelled) {
          setLoadingCoins(false);
        }
      }
    }

    loadCoins();

    return () => {
      cancelled = true;
    };
  }, []);

  const tokenList = useMemo<Token[]>(() => {
    const marketMap = new Map(
      markets.map((market) => [market.id, market]),
    );

    return coins.map((coin) => {
      const market = marketMap.get(coin.id);

      return {
        ...coin,
        image: market?.image,
        price: market?.current_price,
        change24h: market?.price_change_percentage_24h,
      };
    });
  }, [coins, markets]);

  const filteredTokens = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = query
      ? tokenList.filter(
          (token) =>
            token.name.toLowerCase().includes(query) ||
            token.symbol.toLowerCase().includes(query),
        )
      : tokenList;

    return filtered.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, {
        sensitivity: "base",
      }),
    );
  }, [tokenList, search]);

  function selectToken(token: Token) {
    if (selector === "from") {
      setFromToken(token);
    }

    if (selector === "to") {
      setToToken(token);
    }

    setSelector(null);
    setSearch("");
  }

  function switchTokens() {
    const oldFrom = fromToken;
    setFromToken(toToken);
    setToToken(oldFrom);

    const oldAmount = fromAmount;
    setFromAmount(toAmount);
    setToAmount(oldAmount);
  }

  function connectWallet() {
    if (connectors[0]) {
      connect({
        connector: connectors[0],
      });
    }
  }

  const fromBalance =
    balance && fromToken.symbol === balance.symbol
      ? Number(balance)
      : 0;

  return (
    <main className="wallet-shell">
      <div className="wallet-content swap-page">
        <div className="page-heading">
          <div>
            <div className="eyebrow">DECENTRALIZED EXCHANGE</div>
            <h1>Swap</h1>
          </div>

          <button
            type="button"
            className="swap-settings-button"
            onClick={() => {
              const next =
                slippage === "0.50" ? "1.00" : "0.50";

              setSlippage(next);
            }}
          >
            <Settings2 size={17} />
            <span>{slippage}%</span>
          </button>
        </div>

        <section className="swap-card">
          <div className="swap-card-header">
            <div>
              <div className="swap-card-title">Swap tokens</div>
              <div className="swap-card-subtitle">
                Trade assets on BNB Smart Chain
              </div>
            </div>

            <div className="chain-pill">
              <span className="network-dot" />
              BNB Chain
            </div>
          </div>

          <div className="swap-input-box">
            <div className="swap-input-top">
              <span>You pay</span>

              {fromToken.symbol === "BNB" && (
                <span>
                  Balance:{" "}
                  {balance
                    ? Number(balance).toLocaleString(
                        undefined,
                        { maximumFractionDigits: 5 },
                      )
                    : "0"}
                </span>
              )}
            </div>

            <div className="swap-input-row">
              <input
                value={fromAmount}
                onChange={(event) =>
                  setFromAmount(event.target.value)
                }
                inputMode="decimal"
                placeholder="0.00"
                aria-label="Amount to pay"
              />

              <button
                type="button"
                className="token-selector"
                onClick={() => {
                  setSelector("from");
                  setSearch("");
                }}
              >
                <TokenLogo token={fromToken} size={34} />

                <span className="token-selector-text">
                  <strong>{fromToken.symbol}</strong>
                  <small>{fromToken.name}</small>
                </span>

                <ChevronDown size={17} />
              </button>
            </div>

            {fromBalance > 0 && (
              <div className="percentage-row">
                {[25, 50, 75, 100].map((percent) => (
                  <button
                    key={percent}
                    type="button"
                    onClick={() =>
                      setFromAmount(
                        ((fromBalance * percent) / 100).toFixed(
                          6,
                        ),
                      )
                    }
                  >
                    {percent}%
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="swap-direction">
            <button
              type="button"
              onClick={switchTokens}
              aria-label="Switch tokens"
            >
              <ArrowDownUp size={18} />
            </button>
          </div>

          <div className="swap-input-box">
            <div className="swap-input-top">
              <span>You receive</span>
            </div>

            <div className="swap-input-row">
              <input
                value={toAmount}
                onChange={(event) =>
                  setToAmount(event.target.value)
                }
                inputMode="decimal"
                placeholder="0.00"
                aria-label="Amount to receive"
              />

              <button
                type="button"
                className="token-selector"
                onClick={() => {
                  setSelector("to");
                  setSearch("");
                }}
              >
                <TokenLogo token={toToken} size={34} />

                <span className="token-selector-text">
                  <strong>{toToken.symbol}</strong>
                  <small>{toToken.name}</small>
                </span>

                <ChevronDown size={17} />
              </button>
            </div>
          </div>

          <div className="swap-details">
            <div>
              <span>Rate</span>
              <strong>
                1 {fromToken.symbol} ≈{" "}
                {fromToken.price && toToken.price
                  ? (fromToken.price / toToken.price).toLocaleString(
                      undefined,
                      { maximumFractionDigits: 6 },
                    )
                  : "—"}{" "}
                {toToken.symbol}
              </strong>
            </div>

            <div>
              <span>Slippage tolerance</span>
              <strong>{slippage}%</strong>
            </div>

            <div>
              <span>Network fee</span>
              <strong>Estimated at execution</strong>
            </div>
          </div>

          {!isConnected ? (
            <button
              type="button"
              className="swap-connect-button"
              onClick={connectWallet}
              disabled={isPending || connectors.length === 0}
            >
              <Wallet size={18} />
              {isPending
                ? "Connecting..."
                : "Connect Wallet"}
            </button>
          ) : (
            <button
              type="button"
              className="swap-connect-button"
              disabled={!fromAmount}
            >
              <ArrowDownUp size={18} />
              Review Swap
            </button>
          )}

          <div className="swap-disclaimer">
            <Info size={14} />
            <span>
              Prices are provided by CoinGecko. Final execution
              pricing depends on available on-chain liquidity.
            </span>
          </div>
        </section>
      </div>

      {selector && (
        <div
          className="token-modal-backdrop"
          onClick={() => setSelector(null)}
        >
          <section
            className="token-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="token-modal-header">
              <div>
                <div className="eyebrow">SELECT TOKEN</div>
                <h2>Choose an asset</h2>
              </div>

              <button
                type="button"
                className="token-modal-close"
                onClick={() => setSelector(null)}
                aria-label="Close token selector"
              >
                <X size={20} />
              </button>
            </div>

            <div className="token-search">
              <Search size={18} />

              <input
                autoFocus
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search by name or symbol"
              />
            </div>

            <div className="token-list">
              {loadingCoins ? (
                <div className="token-loading">
                  <Loader2
                    size={22}
                    className="spin"
                  />
                  Loading live assets...
                </div>
              ) : filteredTokens.length === 0 ? (
                <div className="token-empty">
                  No assets found
                </div>
              ) : (
                filteredTokens.slice(0, 300).map((token) => (
                  <button
                    type="button"
                    className="token-row"
                    key={`${token.id}-${token.symbol}`}
                    onClick={() => selectToken(token)}
                  >
                    <TokenLogo token={token} size={40} />

                    <div className="token-row-info">
                      <strong>{token.name}</strong>
                      <span>
                        {token.symbol}
                        {token.change24h !== undefined &&
                          token.change24h !== null && (
                            <>
                              {" "}
                              ·{" "}
                              {token.change24h >= 0
                                ? "+"
                                : ""}
                              {token.change24h.toFixed(2)}
                              %
                            </>
                          )}
                      </span>
                    </div>

                    <div className="token-row-price">
                      {formatPrice(token.price)}
                    </div>
                  </button>
                ))
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
