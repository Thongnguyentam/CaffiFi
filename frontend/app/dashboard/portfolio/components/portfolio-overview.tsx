"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Percent,
  Coffee,
} from "lucide-react";

export function PortfolioOverview() {
  const stats = [
    {
      title: "Total Value",
      value: "$124,567.89",
      change: "+12.5%",
      trend: "up",
      icon: Wallet,
      color: "#d4b37f",
    },
    {
      title: "24h Change",
      value: "$2,345.67",
      change: "+5.2%",
      trend: "up",
      icon: TrendingUp,
      color: "#8B4513",
    },
    {
      title: "Total P/L",
      value: "$34,567.89",
      change: "+28.4%",
      trend: "up",
      icon: DollarSign,
      color: "#A0522D",
    },
    {
      title: "Best Performer",
      value: "TRUMP",
      change: "+156.7%",
      trend: "up",
      icon: Percent,
      color: "#e8d5a9",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card
          key={stat.title}
          className="border-[#8B4513]/30 bg-[#1a0f02]/90 backdrop-blur-xl shadow-md hover:shadow-[0_4px_12px_rgba(139,69,19,0.3)] transition-all"
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <stat.icon style={{ color: stat.color }} className="h-5 w-5" />
              {stat.trend === "up" ? (
                <ArrowUpRight className="h-4 w-4 text-green-500" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-500" />
              )}
            </div>
            <div className="mt-4">
              <p className="text-sm text-[#e8d5a9]/70">{stat.title}</p>
              <div className="mt-2 flex items-baseline gap-2">
                <p style={{ color: stat.color }} className="text-2xl font-bold">
                  {stat.value}
                </p>
                <span
                  className={
                    stat.trend === "up" ? "text-green-500" : "text-red-500"
                  }
                >
                  {stat.change}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
