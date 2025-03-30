"use client";

import { motion } from "framer-motion";
import { AppLayout } from "../components/app-layout";
import { PortfolioOverview } from "./portfolio/components/portfolio-overview";
import { PortfolioChart } from "./portfolio/components/portfolio-chart";
import { PortfolioAnalytics } from "./portfolio/components/portfolio-analytics";
import { BetsSection } from "./components/bets-section";
import { LaunchedTokens } from "./components/launched-tokens";
import { MemeNews } from "./components/meme-news";
import { AboutMemes } from "./components/about-memes";
import { useAccount } from "wagmi";
import { useWallet } from "../providers/WalletProvider";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Wallet, Coffee, CupSoda } from "lucide-react";
import Image from "next/image";

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const { isAuthenticated } = useWallet();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    // Set wallet address from connected account or localStorage
    if (address) {
      setWalletAddress(address);
    } else {
      const savedAddress = localStorage.getItem("userAddress");
      if (savedAddress) {
        setWalletAddress(savedAddress);
      }
    }
  }, [address]);

  return (
    <AppLayout>
      {/* Coffee-themed background with subtle patterns */}
      <div className="fixed inset-0 bg-[#1a0f02] -z-10">
        <div className="absolute inset-0 bg-gradient-radial from-[#3a1e0a] via-[#1a0f02] to-[#1a0f02] opacity-40"></div>
      </div>

      <div className="px-4 pr-[390px] max-w-full overflow-x-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 max-w-5xl mx-auto mt-8">
          <div className="flex items-center">
            <Coffee className="h-8 w-8 mr-3 text-[#d4b37f]" />
            <h1 className="text-3xl md:text-4xl font-bold text-[#e8d5a9]">
              My Brew{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4b37f] to-[#8B4513]">
                Portfolio
              </span>
            </h1>
          </div>

          {/* Connected Wallet Display */}
          {walletAddress && (
            <div className="flex items-center gap-2 mt-2 md:mt-0 p-3 rounded-md bg-[#8B4513]/20 border border-[#d4b37f]/30">
              <Wallet className="h-4 w-4 text-[#d4b37f]" />
              <span className="text-sm font-medium text-[#e8d5a9]">
                Wallet:
              </span>
              <span className="text-sm text-[#e8d5a9]/80">
                {walletAddress.substring(0, 6)}...
                {walletAddress.substring(walletAddress.length - 4)}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-4 max-w-5xl mx-auto">
          {/* Portfolio Overview */}
          <div className="mb-4">
            <PortfolioOverview />
          </div>

          {/* Bottom Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#1a0f02]/80 rounded-xl p-4 border border-[#8B4513]/40 h-full shadow-lg shadow-[#8B4513]/10">
              <div className="mb-4 border-b border-[#8B4513]/20 pb-2">
                <h2 className="text-xl font-semibold text-[#d4b37f]">
                  Active Bets
                </h2>
              </div>
              <BetsSection />
            </div>
            <div className="bg-[#1a0f02]/80 rounded-xl p-4 border border-[#8B4513]/40 h-full shadow-lg shadow-[#8B4513]/10">
              <div className="mb-4 border-b border-[#8B4513]/20 pb-2">
                <h2 className="text-xl font-semibold text-[#d4b37f]">
                  My Tokens
                </h2>
              </div>
              <LaunchedTokens />
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Right Sidebar */}
      <div className="fixed top-[64px] right-0 w-[370px] h-[calc(100vh-64px)] overflow-y-auto bg-[#1a0f02]/90 backdrop-blur-sm border-l border-[#8B4513]/40">
        <div className="p-4 space-y-6">
          <div className="mb-2">
            <h3 className="text-lg font-semibold text-[#d4b37f] mb-3 flex items-center">
              <Image
                src="/coffeebean.png"
                alt="Coffee Bean"
                width={20}
                height={20}
                className="mr-2"
              />
              Coffee News
            </h3>
            <MemeNews />
          </div>
          <div className="pt-4 border-t border-[#8B4513]/30">
            <h3 className="text-lg font-semibold text-[#d4b37f] mb-3">
              Bean Knowledge
            </h3>
            <AboutMemes />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
