"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Rocket,
  TrendingUp,
  Users,
  Wallet,
  ArrowRight,
  Coffee,
  CupSoda,
} from "lucide-react";
import Link from "next/link";

const tokenStats = {
  totalLaunched: 12,
  trending: 3,
  totalHolders: "25.4K",
  totalVolume: "$1.2M",
};

const chainDistribution = [
  { chain: "ETH", percentage: 45 },
  { chain: "BSC", percentage: 30 },
  { chain: "SOL", percentage: 25 },
];

export function LaunchedTokens() {
  return (
    <Card className="border-[#8B4513]/40 bg-[#1a0f02]/90 backdrop-blur-xl">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#e8d5a9] flex items-center">
            <CupSoda className="h-5 w-5 mr-2 text-[#d4b37f]" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4b37f] to-[#8B4513]">
              Bean Tokens
            </span>
          </h2>
          <Link href="/launch">
            <Button
              variant="outline"
              className="border-[#8B4513]/60 text-[#d4b37f] hover:bg-[#8B4513]/20"
            >
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-[#1a0f02]/80 rounded-lg p-4 border border-[#8B4513]/40">
            <div className="flex items-center gap-2 mb-2">
              <Rocket className="h-5 w-5 text-[#d4b37f]" />
              <span className="text-[#e8d5a9]/70">Total Launched</span>
            </div>
            <p className="text-2xl font-bold text-[#e8d5a9]">
              {tokenStats.totalLaunched}
            </p>
          </div>
          <div className="bg-[#1a0f02]/80 rounded-lg p-4 border border-[#8B4513]/40">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-[#d4b37f]" />
              <span className="text-[#e8d5a9]/70">Trending</span>
            </div>
            <p className="text-2xl font-bold text-[#e8d5a9]">
              {tokenStats.trending}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-[#1a0f02]/80 rounded-lg p-4 border border-[#8B4513]/40">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-[#d4b37f]" />
              <span className="text-[#e8d5a9]/70">Total Holders</span>
            </div>
            <p className="text-2xl font-bold text-[#e8d5a9]">
              {tokenStats.totalHolders}
            </p>
          </div>
          <div className="bg-[#1a0f02]/80 rounded-lg p-4 border border-[#8B4513]/40">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="h-5 w-5 text-[#d4b37f]" />
              <span className="text-[#e8d5a9]/70">Total Volume</span>
            </div>
            <p className="text-2xl font-bold text-[#e8d5a9]">
              {tokenStats.totalVolume}
            </p>
          </div>
        </div>

        <div className="mt-2">
          <p className="text-sm text-[#e8d5a9]/70 mb-3">Bean Distribution</p>
          <div className="flex gap-2">
            {chainDistribution.map((chain) => (
              <div
                key={chain.chain}
                className="flex-1 bg-[#1a0f02]/80 rounded-lg p-2 text-center border border-[#8B4513]/40"
              >
                <p className="text-sm font-medium text-[#e8d5a9]">
                  {chain.chain}
                </p>
                <p className="text-lg font-bold text-[#d4b37f]">
                  {chain.percentage}%
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
