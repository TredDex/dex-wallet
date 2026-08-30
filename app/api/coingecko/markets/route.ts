import { NextResponse } from "next/server";

const COINGECKO_API = "https://api.coingecko.com/api/v3";

export async function GET() {
  try {
    const response = await fetch(
      `${COINGECKO_API}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false&price_change_percentage=24h`,
      {
        next: {
          revalidate: 60,
        },
        headers: {
          Accept: "application/json",
        },
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "CoinGecko market request failed",
          status: response.status,
        },
        { status: response.status },
      );
    }

    const markets = await response.json();

    return NextResponse.json(markets, {
      headers: {
        "Cache-Control":
          "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("CoinGecko markets error:", error);

    return NextResponse.json(
      { error: "Unable to load market data" },
      { status: 500 },
    );
  }
}
