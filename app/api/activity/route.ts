import { NextRequest, NextResponse } from "next/server";
import {
  createPublicClient,
  http,
  isAddress,
  formatEther,
} from "viem";
import { bsc } from "viem/chains";

const client = createPublicClient({
  chain: bsc,
  transport: http("https://bsc-dataseed.binance.org"),
});

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address");

  if (!address || !isAddress(address)) {
    return NextResponse.json(
      {
        error: "Invalid wallet address.",
        activities: [],
      },
      { status: 400 },
    );
  }

  try {
    const walletAddress = address as `0x${string}`;

    const balance = await client.getBalance({
      address: walletAddress,
    });

    return NextResponse.json({
      address: walletAddress,
      network: "BNB Smart Chain",
      balance: balance.toString(),
      balanceBNB: formatEther(balance),
      hasBalance: balance > BigInt(0),

      /*
       * Transaction history will be populated by the
       * blockchain indexer/explorer integration.
       */
      activities: [],
    });
  } catch (error) {
    console.error("Activity API error:", error);

    return NextResponse.json(
      {
        error: "Unable to read BNB Smart Chain data.",
        activities: [],
      },
      { status: 502 },
    );
  }
}
