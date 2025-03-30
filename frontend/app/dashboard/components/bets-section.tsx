"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Trophy,
  XCircle,
  ArrowRight,
  Wallet,
  Target,
  Coffee,
} from "lucide-react";
import Link from "next/link";

const betStats = {
  activeBets: 3,
  totalBets: 42,
  wonBets: 28,
  lostBets: 11,
  totalWinnings: "$12,450",
  winRate: "66.7%",
  totalStaked: "$25,890",
  avgReturn: "48.2%",
  bestWin: "$5,400",
  activeValue: "$2,800",
};

export function BetsSection() {
  return (
    <Card className="border-[#8B4513]/40 bg-[#1a0f02]/90 backdrop-blur-xl">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#e8d5a9] flex items-center">
            <Coffee className="h-5 w-5 mr-2 text-[#d4b37f]" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4b37f] to-[#8B4513]">
              Brew Bets
            </span>
          </h2>
          <Link href="/bets">
            <Button
              variant="outline"
              className="border-[#8B4513]/60 text-[#d4b37f] hover:bg-[#8B4513]/20"
            >
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-[#1a0f02]/80 rounded-lg p-4 border border-[#8B4513]/40">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-[#d4b37f]" />
              <span className="text-[#e8d5a9]/70">Active</span>
            </div>
            <p className="text-2xl font-bold text-[#e8d5a9]">
              {betStats.activeBets}
            </p>
            <p className="text-sm text-[#e8d5a9]/60 mt-1">
              Value: {betStats.activeValue}
            </p>
          </div>
          <div className="bg-[#1a0f02]/80 rounded-lg p-4 border border-[#8B4513]/40">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-5 w-5 text-[#d4b37f]" />
              <span className="text-[#e8d5a9]/70">Won</span>
            </div>
            <p className="text-2xl font-bold text-[#e8d5a9]">
              {betStats.wonBets}
            </p>
            <p className="text-sm text-[#e8d5a9]/60 mt-1">
              of {betStats.totalBets} total
            </p>
          </div>
          <div className="bg-[#1a0f02]/80 rounded-lg p-4 border border-[#8B4513]/40">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="h-5 w-5 text-[#a05c35]" />
              <span className="text-[#e8d5a9]/70">Lost</span>
            </div>
            <p className="text-2xl font-bold text-[#e8d5a9]">
              {betStats.lostBets}
            </p>
            <p className="text-sm text-[#e8d5a9]/60 mt-1">
              Rate:{" "}
              {(100 - Number.parseFloat(betStats.winRate.slice(0, -1))).toFixed(
                1
              )}
              %
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-[#1a0f02]/80 rounded-lg p-4 border border-[#8B4513]/40">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="h-5 w-5 text-[#d4b37f]" />
              <span className="text-[#e8d5a9]/70">Total Staked</span>
            </div>
            <p className="text-xl font-bold text-[#e8d5a9]">
              {betStats.totalStaked}
            </p>
          </div>
          <div className="bg-[#1a0f02]/80 rounded-lg p-4 border border-[#8B4513]/40">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-5 w-5 text-[#d4b37f]" />
              <span className="text-[#e8d5a9]/70">Best Win</span>
            </div>
            <p className="text-xl font-bold text-[#e8d5a9]">
              {betStats.bestWin}
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center p-4 bg-[#1a0f02]/80 rounded-lg border border-[#8B4513]/40">
          <div>
            <p className="text-sm text-[#e8d5a9]/70">Total Winnings</p>
            <p className="text-xl font-bold text-[#d4b37f]">
              {betStats.totalWinnings}
            </p>
          </div>
          <div>
            <p className="text-sm text-[#e8d5a9]/70">Avg Return</p>
            <p className="text-xl font-bold text-[#d4b37f]">
              {betStats.avgReturn}
            </p>
          </div>
          <div>
            <p className="text-sm text-[#e8d5a9]/70">Win Rate</p>
            <p className="text-xl font-bold text-[#d4b37f]">
              {betStats.winRate}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
