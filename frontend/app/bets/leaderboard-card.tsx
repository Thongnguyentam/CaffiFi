"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";

interface LeaderboardEntry {
  address: string;
  amount: number;
  rank: number;
}

interface LeaderboardCardProps {
  title: string;
  entries: LeaderboardEntry[];
}

export function LeaderboardCard({ title, entries }: LeaderboardCardProps) {
  return (
    <Card className="border-[#8B4513]/30 bg-[#1a0f02]/90 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2 text-[#e8d5a9]">
          <Trophy className="h-5 w-5 text-[#d4b37f]" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {entries.map((entry) => (
            <div
              key={entry.address}
              className="flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                    entry.rank === 1
                      ? "bg-[#d4b37f]/20 text-[#d4b37f]"
                      : entry.rank === 2
                      ? "bg-[#c0a172]/20 text-[#c0a172]"
                      : entry.rank === 3
                      ? "bg-[#a38b62]/20 text-[#a38b62]"
                      : "bg-[#8B4513]/20 text-[#e8d5a9]/70"
                  }`}
                >
                  {entry.rank}
                </div>
                <span className="font-mono text-sm text-[#e8d5a9]/70">
                  {entry.address}
                </span>
              </div>
              <span className="font-mono text-sm font-medium text-[#e8d5a9]">
                ${entry.amount.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
