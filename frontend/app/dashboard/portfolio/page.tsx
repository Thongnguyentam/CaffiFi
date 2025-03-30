"use client";

import { motion } from "framer-motion";
import { AppLayout } from "../../components/app-layout";
import { PortfolioOverview } from "./components/portfolio-overview";
import { PortfolioChart } from "./components/portfolio-chart";
import { AssetTable } from "./components/asset-table";
import { QuickActions } from "./components/quick-actions";
import { PortfolioAnalytics } from "./components/portfolio-analytics";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

export default function PortfolioPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <AppLayout>
      <div className="container max-w-7xl pt-10 mx-auto px-4">
        {/* Header */}
        <h1 className="text-4xl font-bold">
          Portfolio{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4b37f] to-[#8B4513]">
            Overview
          </span>
        </h1>
        <p className="text-[#e8d5a9]/70 mb-6">
          Track and manage your crypto assets
        </p>

        <div className="flex items-center justify-between mb-4">
          <QuickActions />
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d4b37f]" />
            <Input
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-[#1a0f02]/70 border-[#8B4513]/40 text-[#e8d5a9] placeholder-[#d4b37f]/40 focus-visible:ring-[#d4b37f]"
            />
          </div>
        </div>
        <AssetTable searchQuery={searchQuery} />
      </div>
    </AppLayout>
  );
}
