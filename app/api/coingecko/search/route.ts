import { NextRequest, NextResponse } from "next/server";

const COINGECKO_API = "https://api.coingecko.com/api/v3";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim();

  if (!query) {
    return NextResponse.json({ coins: [] });
  }

  try {
    const response = await fetch(
      `${COINGECKO_API}/search?query=${encodeURIComponent(query)}`,
      {
        next: {
          revalidate: 300,
        },
        headers: {
          Accept: "application/json",
        },
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "CoinGecko search failed" },
        { status: response.status },
      );
    }

    const data = await response.json();

    const coins = (data.coins ?? [])
      .map((coin: any) => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol?.toUpperCase() ?? "",
        thumb: coin.thumb,
        marketCapRank: coin.market_cap_rank,
      }))
      .sort((a: any, b: any) =>
        a.name.localeCompare(b.name),
      );

    return NextResponse.json({ coins });
  } catch (error) {
    console.error("CoinGecko search error:", error);

    return NextResponse.json(
      { error: "Unable to search coins" },
      { status: 500 },
    );
  }
}
