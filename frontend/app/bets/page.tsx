"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AppLayout } from "../components/app-layout";
import { Input } from "@/components/ui/input";
import { Search, Rocket, Loader2, AlertCircle, Wallet } from "lucide-react";
import { LeaderboardCard } from "./leaderboard-card";
import { BetFilters } from "./bet-filters";
import { BetSection } from "./bet-section";
import { PastBetsSlider } from "./past-bets-slider";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useBettingService } from "@/services/BettingService";
import { ethers } from "ethers";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useWalletClient } from "wagmi";
import { Bet } from "./types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Our internal type for blockchain data
interface BlockchainBet {
  id: number;
  title: string;
  description: string;
  category: string;
  createdBy: string;
  endDate: Date;
  endDateFormatted: string;
  isActive: boolean;
  status: string;
  poolAmount: string;
  joinAmount: string;
  participants: number;
  imageUrl: string;
  votesYes: number;
  votesNo: number;
  outcome: boolean;
  resolved: boolean;
}

export default function BetsPage() {
  // Page state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeCurrentPage, setActiveCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<"all" | "120min" | "12hours">(
    "all"
  );

  // Bets data state
  const [bets, setBets] = useState<Bet[]>([]);
  const [activeBets, setActiveBets] = useState<Bet[]>([]);
  const [pastBets, setPastBets] = useState<Bet[]>([]);
  const [totalVolume, setTotalVolume] = useState("0.000");

  // Check wallet connection
  const { data: walletClient } = useWalletClient();
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  // Services and utilities
  const bettingService = useBettingService();
  const { toast } = useToast();

  // Track if data has been fetched to prevent refetching
  const dataFetched = useRef(false);

  // Update wallet connection status and trigger fetch
  useEffect(() => {
    const isConnected = !!walletClient;
    setIsWalletConnected(isConnected);

    if (isConnected) {
      // Reset dataFetched when wallet connects
      dataFetched.current = false;
      handleRefresh();
    }
  }, [walletClient]);

  // Fetch bets data when wallet is connected
  useEffect(() => {
    if (!isWalletConnected || dataFetched.current) return;

    async function fetchBets() {
      try {
        setLoading(true);
        dataFetched.current = true;

        const allBets = await bettingService.getAllBets();

        if (!allBets || allBets.length === 0) {
          setBets([]);
          setActiveBets([]);
          setPastBets([]);
          setTotalVolume("0.000");
          setLoading(false);
          return;
        }

        // Process bets data
        const processedBets = allBets
          .map((bet, index) => {
            if (!bet) return null;

            try {
              // Format values with safety checks
              const joinAmount = bet.amount
                ? ethers.formatEther(bet.amount.toString())
                : "0";

              const poolAmount = bet.initialPoolAmount
                ? ethers.formatEther(bet.initialPoolAmount.toString())
                : "0";

              // Calculate dates and status
              const currentDate = new Date();
              const endDateTimestamp = bet.endDate
                ? Number(bet.endDate) * 1000
                : currentDate.getTime() + 30 * 24 * 60 * 60 * 1000;

              const endDate = new Date(endDateTimestamp);
              const isActive = currentDate < endDate && !bet.isClosed;

              // Return formatted bet
              return {
                id: Number(bet.id || index),
                title: bet.title || `Bet #${bet.id || index}`,
                description: bet.description || "No description provided",
                category: bet.category || "Uncategorized",
                createdBy: bet.creator || "Unknown",
                endDate: endDate,
                endDateFormatted: endDate.toLocaleString(),
                isActive: isActive,
                status: isActive ? "active" : "closed",
                poolAmount: poolAmount || "0",
                joinAmount: joinAmount || "0",
                participants:
                  (Number(bet.supportCount) || 0) +
                  (Number(bet.againstCount) || 0),
                imageUrl: bet.imageURL || "/placeholder.svg",
                votesYes: Number(bet.supportCount) || 0,
                votesNo: Number(bet.againstCount) || 0,
                outcome: Boolean(bet.outcome),
                resolved: Boolean(bet.isClosed),
              };
            } catch (error) {
              console.warn(`Error formatting bet at index ${index}:`, error);
              return null;
            }
          })
          .filter(Boolean) as BlockchainBet[];

        // Convert to UI format
        const formattedBets = processedBets.map((bet) => ({
          id: String(bet.id),
          title: bet.title,
          image: bet.imageUrl,
          category: bet.category,
          endDate: bet.endDateFormatted,
          totalPool: parseFloat(bet.poolAmount),
          yesPool:
            parseFloat(bet.poolAmount) *
            (bet.votesYes / (bet.votesYes + bet.votesNo || 1)),
          noPool:
            parseFloat(bet.poolAmount) *
            (bet.votesNo / (bet.votesYes + bet.votesNo || 1)),
          yesProbability:
            (bet.votesYes / (bet.votesYes + bet.votesNo || 1)) * 100,
          noProbability:
            (bet.votesNo / (bet.votesYes + bet.votesNo || 1)) * 100,
          isResolved: bet.resolved,
          result: bet.resolved
            ? bet.outcome
              ? ("yes" as const)
              : ("no" as const)
            : undefined,
        }));

        // Update all state in a batch
        const active = formattedBets.filter((bet) => {
          // Check if the bet is not resolved and the end date is in the future
          const endDate = new Date(bet.endDate);
          const now = new Date();
          return !bet.isResolved && endDate > now;
        });

        const past = formattedBets.filter((bet) => {
          // A bet is considered past if it's either resolved or its end date has passed
          const endDate = new Date(bet.endDate);
          const now = new Date();
          return bet.isResolved || endDate <= now;
        });

        const volume = formattedBets.reduce(
          (acc, bet) => acc + bet.totalPool,
          0
        );

        // Set all state at once
        setBets(formattedBets);
        setActiveBets(active);
        setPastBets(past);
        setTotalVolume(volume.toFixed(3));
      } catch (error) {
        console.error("Error fetching bets:", error);
        toast({
          title: "Error fetching bets",
          description: "Failed to load bets from the blockchain.",
          variant: "destructive",
        });

        setBets([]);
        setActiveBets([]);
        setPastBets([]);
        setTotalVolume("0.000");
      } finally {
        setLoading(false);
      }
    }

    fetchBets();
  }, [bettingService, isWalletConnected, toast]);

  // Manual refresh function
  const handleRefresh = useCallback(() => {
    dataFetched.current = false;
    setLoading(true);
  }, []);

  // Add a periodic check for ended bets
  useEffect(() => {
    // Function to check if any active bets have ended
    const checkForEndedBets = () => {
      const now = new Date();

      // Check if any active bets have ended
      const hasEndedBets = activeBets.some((bet) => {
        const endDate = new Date(bet.endDate);
        return endDate <= now;
      });

      // If we found ended bets, trigger a refresh
      if (hasEndedBets) {
        console.log("Found ended bets, refreshing...");
        handleRefresh();
      }
    };

    // Check every minute
    const interval = setInterval(checkForEndedBets, 60000);

    return () => clearInterval(interval);
  }, [activeBets]);

  // Reset pagination when filters change
  useEffect(() => {
    setActiveCurrentPage(1);
  }, [searchTerm, selectedCategory, timeFilter]);

  // Filter bets based on search term, category, and time filter
  const filteredActiveBets = activeBets.filter((bet) => {
    // First apply search and category filters
    const matchesSearchAndCategory =
      (bet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bet.category.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!selectedCategory || bet.category === selectedCategory);

    // Then apply time filter if needed
    if (timeFilter === "all") {
      return matchesSearchAndCategory;
    }

    // Get the current time
    const now = new Date();
    const endDate = new Date(bet.endDate);

    // Calculate time difference in milliseconds
    const timeDiff = endDate.getTime() - now.getTime();

    // Convert to hours and minutes
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    if (timeFilter === "120min") {
      // Show bets ending within the next 120 minutes (2 hours)
      return matchesSearchAndCategory && hoursDiff <= 2;
    } else if (timeFilter === "12hours") {
      // Show bets ending within the next 12 hours
      return matchesSearchAndCategory && hoursDiff <= 12;
    }

    return matchesSearchAndCategory;
  });

  // Calculate counts for each time filter
  const betsIn120Min = activeBets.filter((bet) => {
    const now = new Date();
    const endDate = new Date(bet.endDate);
    const timeDiff = endDate.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    return (
      hoursDiff <= 2 &&
      (bet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bet.category.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!selectedCategory || bet.category === selectedCategory)
    );
  }).length;

  const betsIn12Hours = activeBets.filter((bet) => {
    const now = new Date();
    const endDate = new Date(bet.endDate);
    const timeDiff = endDate.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    return (
      hoursDiff <= 12 &&
      (bet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bet.category.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!selectedCategory || bet.category === selectedCategory)
    );
  }).length;

  const filteredPastBets = pastBets.filter(
    (bet) =>
      (bet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bet.category.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!selectedCategory || bet.category === selectedCategory)
  );

  return (
    <AppLayout>
      <div className="container py-6 mx-auto space-y-8">
        {/* Page Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Coffee{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4b37f] to-[#8B4513]">
                Bets
              </span>
            </h1>
            <p className="text-[#e8d5a9]/70 mt-1">
              Place wagers on future outcomes and earn rewards.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/bets/create" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-[#8B4513] hover:bg-[#A0522D] text-[#e8d5a9] border-[#8B4513] border">
                <Rocket className="mr-2 h-4 w-4" />
                Create Bet
              </Button>
            </Link>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#d4b37f]" />
              <Input
                type="text"
                placeholder="Search bets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 border-[#8B4513]/30 bg-[#1a0f02]/60 text-[#e8d5a9] placeholder-[#e8d5a9]/40 focus-visible:ring-[#8B4513]"
              />
            </div>
          </div>
        </div>

        {/* Content Status */}
        {!isWalletConnected ? (
          <Alert className="border-[#8B4513]/30 bg-[#1a0f02]/60 text-[#e8d5a9]">
            <Wallet className="h-4 w-4 text-[#d4b37f]" />
            <AlertTitle className="text-[#e8d5a9]">
              Wallet not connected
            </AlertTitle>
            <AlertDescription className="text-[#e8d5a9]/70">
              Please connect your wallet to view and place bets.
            </AlertDescription>
          </Alert>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-[#d4b37f]" />
            <p className="mt-4 text-[#e8d5a9]/70">Loading bets...</p>
          </div>
        ) : activeBets.length === 0 && pastBets.length === 0 ? (
          <Alert className="border-[#8B4513]/30 bg-[#1a0f02]/60 text-[#e8d5a9]">
            <AlertCircle className="h-4 w-4 text-[#d4b37f]" />
            <AlertTitle className="text-[#e8d5a9]">No bets found</AlertTitle>
            <AlertDescription className="text-[#e8d5a9]/70">
              There are currently no bets available. Create a new bet to get
              started.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {/* Stats Cards Row */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-[#8B4513]/30 bg-[#1a0f02]/60 p-4">
                <div className="text-[#e8d5a9]/70 mb-1 text-sm">
                  Total Volume
                </div>
                <div className="text-2xl font-bold text-[#e8d5a9]">
                  {totalVolume} ETH
                </div>
              </div>

              <div className="rounded-xl border border-[#8B4513]/30 bg-[#1a0f02]/60 p-4">
                <div className="text-[#e8d5a9]/70 mb-1 text-sm">
                  Active Bets
                </div>
                <div className="text-2xl font-bold text-[#e8d5a9]">
                  {activeBets.length}
                </div>
              </div>

              <div className="rounded-xl border border-[#8B4513]/30 bg-[#1a0f02]/60 p-4">
                <div className="text-[#e8d5a9]/70 mb-1 text-sm">
                  Resolved Bets
                </div>
                <div className="text-2xl font-bold text-[#e8d5a9]">
                  {pastBets.filter((bet) => bet.isResolved).length}
                </div>
              </div>
            </div>

            {/* Leaderboard Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-[#e8d5a9]">
                  Top Winners
                </h2>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-[#d4b37f]"
                      >
                        <AlertCircle className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#1a0f02] border-[#8B4513]/30 text-[#e8d5a9]">
                      <p>Users with the highest winnings across all bets</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <LeaderboardCard
                  title="Top Winner"
                  entries={[{ address: "0x1a2...3b4c", amount: 1.24, rank: 1 }]}
                />
                <LeaderboardCard
                  title="Runner Up"
                  entries={[{ address: "0x4d5...6e7f", amount: 0.89, rank: 2 }]}
                />
                <LeaderboardCard
                  title="Third Place"
                  entries={[{ address: "0x7g8...9h0i", amount: 0.67, rank: 3 }]}
                />
                <LeaderboardCard
                  title="Fourth Place"
                  entries={[{ address: "0xj1k...2l3m", amount: 0.51, rank: 4 }]}
                />
              </div>
            </div>

            {/* Active Bets Section */}
            <BetSection
              title="Active Bets"
              bets={activeBets.filter((bet) => {
                // Filter by search term
                if (
                  searchTerm &&
                  !bet.title.toLowerCase().includes(searchTerm.toLowerCase())
                ) {
                  return false;
                }

                // Filter by category if selected
                if (selectedCategory && bet.category !== selectedCategory) {
                  return false;
                }

                return true;
              })}
              currentPage={activeCurrentPage}
              onPageChange={setActiveCurrentPage}
              itemsPerPage={6}
            />

            {/* Filters */}
            <BetFilters
              activeFilter="all"
              selectedCategory={selectedCategory}
              onFilterChange={() => {}}
              onCategoryChange={setSelectedCategory}
            />

            {/* Past Bets Slider */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-[#e8d5a9]">
                Past Bets
              </h2>
              {pastBets.length > 0 ? (
                <PastBetsSlider bets={pastBets} />
              ) : (
                <div className="text-center p-8 border border-[#8B4513]/30 bg-[#1a0f02]/30 rounded-xl">
                  <p className="text-[#e8d5a9]/70">No past bets available.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
