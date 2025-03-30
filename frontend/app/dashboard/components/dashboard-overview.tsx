"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  Target,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

export function DashboardOverview() {
  const stats = [
    {
      title: "Total Users",
      value: "12,345",
      change: "+15.2%",
      trend: "up",
      icon: Users,
      color: "#d4b37f",
    },
    {
      title: "Active Predictions",
      value: "234",
      change: "+8.1%",
      trend: "up",
      icon: Target,
      color: "#8B4513",
    },
    {
      title: "Total Volume",
      value: "$1.2M",
      change: "+22.5%",
      trend: "up",
      icon: DollarSign,
      color: "#A0522D",
    },
    {
      title: "Success Rate",
      value: "76.4%",
      change: "+5.3%",
      trend: "up",
      icon: TrendingUp,
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
