import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/wallet/providers";
import MobileBottomNav from "@/components/MobileBottomNav";

export const metadata: Metadata = {
  title: "TredDEX Wallet",
  description: "Self-custodial Web3 wallet and decentralized exchange",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          <MobileBottomNav />
        </Providers>
      </body>
    </html>
  );
}
