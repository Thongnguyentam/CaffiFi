"use client";

import { AppLayout } from "../components/app-layout";
import { MemeCoinMarketCap } from "../components/MemeCoinMarketCap";
import { fetchTrendingTokens } from "@/app/lib/coins";
import { useState, useEffect } from "react";
import { TrendingCoin } from "@/app/types/coins";
import { Coffee, Coins, TrendingUp } from "lucide-react";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}

function Sparkline({
  data,
  width = 60,
  height = 20,
  color = "#8B4513",
}: SparklineProps) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;
  const points = data
    .map(
      (value, index) =>
        `${(index / (data.length - 1)) * width},${
          height - ((value - min) / range) * height
        }`
    )
    .join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function MarketcapPage(): JSX.Element {
  const [trendingCoins, setTrendingCoins] = useState<TrendingCoin[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchTrendingTokensData = async () => {
      if (!mounted) return;

      try {
        setIsLoading(true);
        const tokens = await fetchTrendingTokens();

        if (!mounted) return;

        const updatedCoins: TrendingCoin[] = tokens.map((token) => ({
          name: token.name,
          price: token.price,
          volume_24h: token.volume_24h,
          symbol: token.symbol,
          change: `${
            token.price_change_24h >= 0 ? "+" : ""
          }${token.price_change_24h.toFixed(2)}%`,
          marketCap: token.marketcap?.toString() || "0",
          volume: token.volume_24h.toString(),
          image: token.image_url,
          address: token.address,
          listed: "Recently",
          sparklineData: [1, 1, 1, 1, 1, 1, 1],
          holders: `${token.active_users_24h}`,
          transactions: `${token.transactions_24h}`,
        }));

        if (mounted) {
          setTrendingCoins(updatedCoins);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching trending tokens:", error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchTrendingTokensData();

    const interval = setInterval(fetchTrendingTokensData, 60000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <AppLayout>
      <div className="relative z-10 container py-8">
        <div className="mb-8 bg-[#1a0f02]/90 backdrop-blur-xl p-6 rounded-xl border border-[#8B4513]/30 shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <Coins className="h-8 w-8 text-[#d4b37f]" />
            <h1 className="text-4xl font-bold">
              Today's Meme Coin Prices by{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B4513] via-[#d4b37f] to-[#A0522D]">
                Market Cap
              </span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#8B4513]" />
            <p className="text-[#e8d5a9]/70">
              Track and analyze the latest meme coins across multiple chains
            </p>
          </div>
          <div className="mt-4 p-4 bg-[#3a1e0a]/50 rounded-lg border border-[#8B4513]/20 flex items-center gap-3">
            <Coffee className="h-5 w-5 text-[#d4b37f]" />
            <p className="text-[#e8d5a9]">
              <span className="font-bold text-[#d4b37f]">CaffiFi Insight:</span>{" "}
              Brew your own crypto portfolio with confidence by analyzing these
              trending meme coins.
            </p>
          </div>
        </div>
        <MemeCoinMarketCap coins={trendingCoins} />
      </div>
    </AppLayout>
  );
}
