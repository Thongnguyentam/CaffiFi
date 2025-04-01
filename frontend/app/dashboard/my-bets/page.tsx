"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  Filter,
  TrendingUp,
  TrendingDown,
  Dices,
  Award,
  BarChart,
  Loader2,
  CupSoda,
  Coffee,
  CircleDot,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppLayout } from "../../components/app-layout";
import { BetCard } from "../../bets/bet-card";
import { BetFilters } from "../../bets/bet-filters";
import { useBettingService } from "@/services/BettingService";
import { useAccount } from "wagmi";
import { ethers } from "ethers";

// Interface for bet data from smart contract
interface ContractBet {
  id: number;
  creator: string;
  amount: bigint;
  title: string;
  description: string;
  category: string;
  twitterHandle: string;
  endDate: bigint;
  initialPoolAmount: bigint;
  imageURL: string;
  isClosed: boolean;
  supportCount: number;
  againstCount: number;
  outcome: boolean;
}

// Interface for bet card display
interface DisplayBet {
  id: string;
  title: string;
  image: string;
  category: string;
  endDate: string;
  totalPool: number;
  yesPool: number;
  noPool: number;
  yesProbability: number;
  noProbability: number;
  isResolved?: boolean;
  result?: "yes" | "no";
}

export default function MyBetsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<
    "all" | "active" | "resolved"
  >("all");
  const [showFilters, setShowFilters] = useState(false);
  const [bets, setBets] = useState<ContractBet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const bettingService = useBettingService();
  const { address, isConnected } = useAccount();

  // Add state for mounted status
  const [isMounted, setIsMounted] = useState(false);

  // Add a function to refresh the bets data
  const refreshBets = async () => {
    try {
      setIsLoading(true);
      const allBets = await bettingService.getAllBets();
      setBets(allBets);
    } catch (error) {
      console.error("Error refreshing bets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update useEffect to handle mounting and fetch bets
  useEffect(() => {
    let mounted = true;

    const fetchBets = async () => {
      try {
        if (!isConnected) {
          router.push("/bets");
          return;
        }

        setIsLoading(true);
        const allBets = await bettingService.getAllBets();

        if (mounted) {
          setBets(allBets);
          setIsLoading(false);
          setIsMounted(true);
        }
      } catch (error) {
        console.error("Error fetching bets:", error);
        if (mounted) {
          setIsLoading(false);
          setIsMounted(true);
        }
      }
    };

    fetchBets();

    return () => {
      mounted = false;
    };
  }, [isConnected, router]); // Remove bettingService from dependencies

  // Filter bets based on user's involvement
  const myBets = bets.filter(
    (bet) =>
      bet.creator.toLowerCase() === address?.toLowerCase() ||
      bet.twitterHandle.toLowerCase() === address?.toLowerCase()
  );

  // Filter active bets - must not be closed and end date must be in the future
  const activeBets = myBets.filter((bet) => {
    const endDate = new Date(Number(bet.endDate) * 1000);
    const now = new Date();
    return !bet.isClosed && endDate > now;
  });

  // Filter past bets - either closed or end date has passed
  const pastBets = myBets.filter((bet) => {
    const endDate = new Date(Number(bet.endDate) * 1000);
    const now = new Date();
    return bet.isClosed || endDate <= now;
  });

  // Add a periodic check for ended bets - moved after activeBets declaration
  useEffect(() => {
    if (!isMounted) return;

    // Function to check if any active bets have ended
    const checkForEndedBets = () => {
      const now = new Date();

      // Check if any active bets have ended
      const hasEndedBets = activeBets.some((bet) => {
        const endDate = new Date(Number(bet.endDate) * 1000);
        return endDate <= now;
      });

      // If we found ended bets, trigger a refresh
      if (hasEndedBets) {
        console.log("Found ended bets in MyBetsPage, refreshing...");
        refreshBets();
      }
    };

    // Check every minute
    const interval = setInterval(checkForEndedBets, 60000);

    return () => clearInterval(interval);
  }, [activeBets, isMounted, bettingService]);

  // Calculate statistics
  const totalBets = myBets.length;
  const wonBets = pastBets.filter((bet) => bet.outcome).length;
  const lostBets = pastBets.filter((bet) => !bet.outcome).length;
  const pendingBets = activeBets.length;
  const winRate = totalBets > 0 ? Math.round((wonBets / totalBets) * 100) : 0;

  // Calculate total profit/loss with proper BigInt handling
  const totalProfit = pastBets.reduce((acc, bet) => {
    const amount = Number(ethers.formatEther(BigInt(bet.initialPoolAmount)));
    return acc + (bet.outcome ? amount : -amount);
  }, 0);

  // Filter bets based on search term and category
  const filteredActiveBets = activeBets.filter(
    (bet) =>
      (bet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bet.category.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!selectedCategory || bet.category === selectedCategory)
  );

  const filteredPastBets = pastBets.filter(
    (bet) =>
      (bet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bet.category.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!selectedCategory || bet.category === selectedCategory)
  );

  // Return loading state until component is mounted
  if (!isMounted) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-[#151214]">
          <div className="container py-8">
            <div className="flex items-center justify-center h-[60vh]">
              <div className="space-y-4 text-center">
                <Loader2 className="h-12 w-12 animate-spin text-[#c9804a] mx-auto" />
                <p className="text-[#8a7a6d]">Loading your bets...</p>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Update the convertToDisplayBet function to handle dates consistently
  const convertToDisplayBet = (bet: ContractBet): DisplayBet => {
    const totalParticipants =
      Number(bet.supportCount) + Number(bet.againstCount);
    const yesProbability =
      totalParticipants > 0
        ? Number(bet.supportCount) / totalParticipants
        : 0.5;
    const noProbability =
      totalParticipants > 0
        ? Number(bet.againstCount) / totalParticipants
        : 0.5;

    // Format the date in UTC to ensure consistency
    const date = new Date(Number(bet.endDate) * 1000);
    const endDateISO = date.toISOString();

    // Ensure initialPoolAmount is treated as BigInt
    const poolAmount = BigInt(bet.initialPoolAmount.toString());

    return {
      id: bet.id.toString(),
      title: bet.title,
      image: bet.imageURL,
      category: bet.category,
      endDate: endDateISO,
      totalPool: Number(ethers.formatEther(poolAmount)),
      yesPool: Number(bet.supportCount),
      noPool: Number(bet.againstCount),
      yesProbability: yesProbability * 100,
      noProbability: noProbability * 100,
      isResolved: bet.isClosed,
      result: bet.isClosed ? (bet.outcome ? "yes" : "no") : undefined,
    };
  };

  if (!isConnected) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-[#151214]">
          <div className="container py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-lg mx-auto mt-20 bg-[#c9804a]/10 border border-[#c9804a]/20 text-[#c9804a] p-8 rounded-xl shadow-xl"
            >
              <h2 className="text-2xl font-bold mb-4">
                Authentication Required
              </h2>
              <p className="text-lg">
                You need to be signed in to view your bets. Redirecting to the
                bets page...
              </p>
            </motion.div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#151214]">
        <div className="container py-8">
          {/* Header section */}
          <div className="relative mb-12 pb-6 border-b border-[#2a2422]">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  My{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c9804a] to-[#8B4513]">
                    Brews
                  </span>
                </h1>
                <p className="text-lg text-[#8a7a6d]">
                  Track and manage your brewing portfolio
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#8a7a6d]" />
                  <Input
                    type="search"
                    placeholder="Search brews..."
                    className="pl-10 w-full sm:w-[300px] bg-[#231f1c] border-[#2a2422] focus:border-[#c9804a] transition-colors text-[#e0d6cf] placeholder-[#8a7a6d]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowFilters(!showFilters)}
                    className={`border-[#2a2422] hover:border-[#c9804a] transition-colors ${
                      showFilters ? "bg-[#c9804a]/10 border-[#c9804a]" : ""
                    }`}
                  >
                    <Filter className="h-4 w-4 text-[#8a7a6d]" />
                  </Button>
                  <Button
                    asChild
                    className="bg-[#c9804a] hover:bg-[#b77440] text-[#151214] transition-colors"
                  >
                    <Link href="/bets/create">
                      <CupSoda className="h-4 w-4 mr-2" />
                      Start New Brew
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-12"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Brews Card */}
              <Card className="bg-[#231f1c] border-[#2a2422] hover:border-[#c9804a] transition-all hover:transform hover:scale-[1.02] cursor-pointer">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-[#8a7a6d] flex items-center gap-2">
                    <CupSoda className="h-4 w-4 text-[#c9804a]" />
                    Total Brews
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <div className="text-3xl font-bold text-[#e0d6cf]">
                      {totalBets}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#8a7a6d]">
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-[#c9804a]/10 text-[#c9804a]">
                        {pendingBets} brewing
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-[#2a2422] text-[#8a7a6d]">
                        {pastBets.length} served
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Success Rate Card */}
              <Card className="bg-[#231f1c] border-[#2a2422] hover:border-[#c9804a] transition-all hover:transform hover:scale-[1.02] cursor-pointer">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-[#8a7a6d] flex items-center gap-2">
                    <Coffee className="h-4 w-4 text-[#c9804a]" />
                    Brewing Success
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <div className="text-3xl font-bold text-[#e0d6cf]">
                      {winRate}%
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#8a7a6d]">
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-[#c9804a]/10 text-[#c9804a]">
                        {wonBets} perfect
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-[#2a2422] text-[#8a7a6d]">
                        {lostBets} spilled
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Total Profit Card */}
              <Card className="bg-[#231f1c] border-[#2a2422] hover:border-[#c9804a] transition-all hover:transform hover:scale-[1.02] cursor-pointer">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-[#8a7a6d] flex items-center gap-2">
                    {totalProfit >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-[#c9804a]" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-400" />
                    )}
                    Total Earnings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <div
                      className={`text-3xl font-bold ${
                        totalProfit >= 0 ? "text-[#c9804a]" : "text-red-400"
                      }`}
                    >
                      {totalProfit > 0 ? "+" : ""}
                      {totalProfit.toFixed(4)} ETH
                    </div>
                    <p className="text-sm text-[#8a7a6d]">
                      Lifetime profit/loss
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Active Pool Size Card */}
              <Card className="bg-[#231f1c] border-[#2a2422] hover:border-[#c9804a] transition-all hover:transform hover:scale-[1.02] cursor-pointer">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-[#8a7a6d] flex items-center gap-2">
                    <CircleDot className="h-4 w-4 text-[#c9804a]" />
                    Active Brew Size
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <div className="text-3xl font-bold text-[#e0d6cf]">
                      {ethers.formatEther(
                        activeBets.reduce(
                          (acc, bet) =>
                            acc + BigInt(bet.initialPoolAmount.toString()),
                          BigInt(0)
                        )
                      )}{" "}
                      ETH
                    </div>
                    <p className="text-sm text-[#8a7a6d]">
                      Total active brew value
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8"
            >
              <Card className="bg-[#231f1c] border-[#2a2422]">
                <CardContent className="pt-6">
                  <BetFilters
                    activeFilter={activeFilter}
                    selectedCategory={selectedCategory}
                    onFilterChange={setActiveFilter}
                    onCategoryChange={setSelectedCategory}
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Tabs */}
          <div className="bg-[#231f1c] rounded-xl p-6">
            <Tabs defaultValue="active" className="mb-8">
              <TabsList className="bg-[#151214] p-1">
                <TabsTrigger
                  value="active"
                  className="data-[state=active]:bg-[#c9804a] data-[state=active]:text-[#151214]"
                >
                  Brewing Now
                </TabsTrigger>
                <TabsTrigger
                  value="past"
                  className="data-[state=active]:bg-[#8B4513] data-[state=active]:text-[#e0d6cf]"
                >
                  Past Brews
                </TabsTrigger>
                <TabsTrigger
                  value="created"
                  className="data-[state=active]:bg-[#c9804a] data-[state=active]:text-[#151214]"
                >
                  My Recipes
                </TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="mt-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-[#c9804a]" />
                  </div>
                ) : filteredActiveBets.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredActiveBets.map((bet) => (
                      <BetCard key={bet.id} bet={convertToDisplayBet(bet)} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CupSoda className="h-16 w-16 text-[#8a7a6d] mx-auto mb-4" />
                    <h3 className="text-xl font-medium mb-2 text-[#e0d6cf]">
                      No active brews found
                    </h3>
                    <p className="text-[#8a7a6d] max-w-md mx-auto mb-6">
                      You don't have any active brews matching your search
                      criteria.
                    </p>
                    <Button
                      asChild
                      className="bg-[#c9804a] hover:bg-[#b77440] text-[#151214]"
                    >
                      <Link href="/bets">Browse Brews</Link>
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="past" className="mt-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-[#c9804a]" />
                  </div>
                ) : filteredPastBets.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredPastBets.map((bet) => (
                      <BetCard key={bet.id} bet={convertToDisplayBet(bet)} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CupSoda className="h-16 w-16 text-[#8a7a6d] mx-auto mb-4" />
                    <h3 className="text-xl font-medium mb-2 text-[#e0d6cf]">
                      No past brews found
                    </h3>
                    <p className="text-[#8a7a6d] max-w-md mx-auto mb-6">
                      You don't have any past brews matching your search
                      criteria.
                    </p>
                    <Button
                      asChild
                      className="bg-[#c9804a] hover:bg-[#b77440] text-[#151214]"
                    >
                      <Link href="/bets">Browse Brews</Link>
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="created" className="mt-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-[#c9804a]" />
                  </div>
                ) : myBets.filter(
                    (bet) =>
                      bet.creator.toLowerCase() === address?.toLowerCase()
                  ).length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {myBets
                      .filter(
                        (bet) =>
                          bet.creator.toLowerCase() === address?.toLowerCase()
                      )
                      .map((bet) => (
                        <BetCard key={bet.id} bet={convertToDisplayBet(bet)} />
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CupSoda className="h-16 w-16 text-[#8a7a6d] mx-auto mb-4" />
                    <h3 className="text-xl font-medium mb-2 text-[#e0d6cf]">
                      No recipes created yet
                    </h3>
                    <p className="text-[#8a7a6d] max-w-md mx-auto mb-6">
                      You haven't created any brews yet.
                    </p>
                    <Button
                      asChild
                      className="bg-[#c9804a] hover:bg-[#b77440] text-[#151214]"
                    >
                      <Link href="/bets/create">
                        <CupSoda className="h-4 w-4 mr-2" />
                        Start New Brew
                      </Link>
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
