import { NextResponse } from "next/server";

const COINGECKO_API = "https://api.coingecko.com/api/v3";

export async function GET() {
  try {
    const response = await fetch(
  "https://api.coingecko.com/api/v3/coins/list?include_platform=true",
  {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  }
);
    if (!response.ok) {
      return NextResponse.json(
        {
          error: "CoinGecko coin list request failed",
          status: response.status,
        },
        { status: response.status },
      );
    }

    const coins = await response.json();

    const sortedCoins = coins
      .map((coin: any) => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol?.toUpperCase() ?? "",
        platforms: coin.platforms ?? {},
      }))
      .sort((a: any, b: any) =>
        a.name.localeCompare(b.name),
      );

    return NextResponse.json(sortedCoins, {
      headers: {
        "Cache-Control":
          "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("CoinGecko coins error:", error);

    return NextResponse.json(
      { error: "Unable to load coin list" },
      { status: 500 },
    );
  }
}
