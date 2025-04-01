"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppLayout } from "@/app/components/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ethers } from "ethers";
import { useBettingService } from "@/services/BettingService";
import { useWalletClient } from "wagmi";
import { AlertCircle, Info, CheckCircle, XCircle, Loader2 } from "lucide-react";

// Create a wrapper component that uses useSearchParams
function PlaceBetContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const betId = searchParams.get("id");
  const { data: walletClient } = useWalletClient();
  const bettingService = useBettingService();

  // Add mounted state
  const [isMounted, setIsMounted] = useState(false);

  // Bet state
  const [bet, setBet] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [betAmount, setBetAmount] = useState("1"); // Fixed bet amount
  const [betSide, setBetSide] = useState<"yes" | "no">("yes");
  const [isPlacingBet, setIsPlacingBet] = useState(false);

  // Handle mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch bet details
  useEffect(() => {
    if (!isMounted) return;

    async function fetchBetDetails() {
      if (!betId) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch all bets from the blockchain
        const allBets = await bettingService.getAllBets();
        // console.log("Fetched bets for place-bet page:", allBets);

        // Find the specific bet by ID
        const foundBet = allBets.find((bet) => String(bet.id) === betId);

        if (foundBet) {
          // Format bet data for display
          const currentDate = new Date();
          const endDateTimestamp = foundBet.endDate
            ? Number(foundBet.endDate) * 1000
            : currentDate.getTime() + 30 * 24 * 60 * 60 * 1000;

          const endDate = new Date(endDateTimestamp);
          const isActive = currentDate < endDate && !foundBet.isClosed;

          const joinAmount = foundBet.amount
            ? ethers.formatEther(foundBet.amount.toString())
            : "0";

          const poolAmount = foundBet.initialPoolAmount
            ? ethers.formatEther(foundBet.initialPoolAmount.toString())
            : "0";

          setBetAmount(joinAmount);
          // Format bet for UI
          setBet({
            id: String(foundBet.id),
            title: foundBet.title || `Bet #${foundBet.id}`,
            description: foundBet.description || "No description provided",
            category: foundBet.category || "Uncategorized",
            createdBy: foundBet.creator || "Unknown",
            endDate: endDate.toISOString(),
            endDateFormatted: endDate.toLocaleString(),
            isActive: isActive,
            status: isActive ? "active" : "closed",
            poolAmount: poolAmount || "0",
            joinAmount: joinAmount || "0",
            imageUrl: foundBet.imageURL || "/placeholder.svg",
            participants:
              (Number(foundBet.supportCount) || 0) +
              (Number(foundBet.againstCount) || 0),
            votesYes: Number(foundBet.supportCount) || 0,
            votesNo: Number(foundBet.againstCount) || 0,
            yesProbability:
              foundBet.supportCount &&
              foundBet.supportCount + foundBet.againstCount > 0
                ? (Number(foundBet.supportCount) /
                    (Number(foundBet.supportCount) +
                      Number(foundBet.againstCount))) *
                  100
                : 50,
            noProbability:
              foundBet.againstCount &&
              foundBet.supportCount + foundBet.againstCount > 0
                ? (Number(foundBet.againstCount) /
                    (Number(foundBet.supportCount) +
                      Number(foundBet.againstCount))) *
                  100
                : 50,
          });
        }
      } catch (error) {
        console.error("Error fetching bet details:", error);
        toast({
          title: "Error",
          description: "Failed to load bet details from the blockchain.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchBetDetails();
  }, [betId, bettingService, toast, isMounted]);

  // Handle placing bet
  const handlePlaceBet = async () => {
    if (!betId) {
      toast({
        title: "Error",
        description: "Invalid bet ID",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsPlacingBet(true);

      if (!walletClient) {
        throw new Error("Wallet not connected");
      }

      // Call the joinBet function from the betting service
      const receipt = await bettingService.joinBet(
        parseInt(betId),
        betSide === "yes", // true for "yes", false for "no"
        betAmount // Pass the bet amount from the form
      );

      console.log("Bet placed successfully:", receipt);

      toast({
        title: "Bet Placed Successfully",
        description: `You bet ${betAmount} ETH on ${betSide.toUpperCase()} for "${
          bet.title
        }". Transaction hash: ${receipt.hash.substring(0, 10)}...`,
      });
    } catch (error: any) {
      console.error("Error placing bet:", error);
      toast({
        title: "Bet Failed",
        description: error.message || "Failed to place bet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPlacingBet(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Return loading state if not mounted
  if (!isMounted) {
    return (
      <AppLayout>
        <div className="container py-12 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
        </div>
      </AppLayout>
    );
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container py-12 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
        </div>
      </AppLayout>
    );
  }

  if (!bet) {
    return (
      <AppLayout>
        <div className="container py-12">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <AlertCircle className="w-16 h-16 text-red-500" />
            <h2 className="mt-4 text-2xl font-bold">Bet Not Found</h2>
            <p className="mt-2 text-muted-foreground">
              The bet you're looking for doesn't exist or is not available.
            </p>
            <Link href="/bets">
              <Button className="mt-6 bg-amber-700 hover:bg-amber-800">
                Back to Bets
              </Button>
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container py-8 relative z-10 bg-gradient-to-b from-amber-950/30 to-transparent">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Back button */}
          <div className="mb-6">
            <Link href="/bets">
              <Button
                variant="outline"
                size="sm"
                className="border-amber-800/50 hover:bg-amber-800/20"
              >
                ← Back to Bean Bets
              </Button>
            </Link>
          </div>

          {/* Main content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Bet details */}
            <div className="md:col-span-2">
              <Card className="border-amber-800/30 bg-amber-950/40 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-2xl">{bet.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge
                      variant="outline"
                      className="bg-amber-900/50 border-amber-700/50"
                    >
                      {bet.category}
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      Roasts {formatDate(bet.endDate)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video relative rounded-lg overflow-hidden mb-6">
                    <Image
                      src={bet.imageUrl}
                      alt={bet.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Pool Distribution */}
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-1 text-green-400">
                        Yes {(bet.yesProbability * 100).toFixed(0)}%
                      </span>
                      <span className="flex items-center gap-1 text-red-400">
                        No {(bet.noProbability * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="relative h-2 overflow-hidden rounded-full bg-amber-900/30">
                      <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-700 to-amber-500"
                        style={{ width: `${bet.yesProbability * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Pool Info */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-amber-900/20 rounded-lg p-4">
                      <div className="text-sm text-muted-foreground mb-1">
                        Bean Pool
                      </div>
                      <div className="text-lg font-medium font-mono">
                        {bet.poolAmount} ETH
                      </div>
                    </div>
                    <div className="bg-amber-900/20 rounded-lg p-4">
                      <div className="text-sm text-muted-foreground mb-1">
                        Light Roast
                      </div>
                      <div className="text-lg font-medium font-mono text-green-400">
                        {bet.joinAmount} ETH
                      </div>
                    </div>
                    <div className="bg-amber-900/20 rounded-lg p-4">
                      <div className="text-sm text-muted-foreground mb-1">
                        Dark Roast
                      </div>
                      <div className="text-lg font-medium font-mono text-red-400">
                        {bet.poolAmount} ETH
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-amber-800/10 border border-amber-700/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-amber-400 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-amber-400">
                          How it brews
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Place your beans on whether this prediction will come
                          true. If you're right, you'll win a share of the bean
                          pool proportional to your bet amount. The smaller the
                          probability of your chosen brew, the higher your
                          potential reward.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Betting form */}
            <div className="md:col-span-1">
              <Card className="border-amber-800/30 bg-amber-950/40 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle>Brew Your Bet</CardTitle>
                  <CardDescription>
                    Choose your coffee blend and bean amount
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Bet Side Selection */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Your Brew Style
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant={betSide === "yes" ? "default" : "outline"}
                          className={
                            betSide === "yes"
                              ? "bg-amber-600 hover:bg-amber-700"
                              : "border-amber-800/50 hover:bg-amber-800/20"
                          }
                          onClick={() => setBetSide("yes")}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Light
                        </Button>
                        <Button
                          type="button"
                          variant={betSide === "no" ? "default" : "outline"}
                          className={
                            betSide === "no"
                              ? "bg-amber-900 hover:bg-amber-950"
                              : "border-amber-800/50 hover:bg-amber-800/20"
                          }
                          onClick={() => setBetSide("no")}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Dark
                        </Button>
                      </div>
                    </div>

                    {/* Fixed Bet Amount */}
                    <div className="p-4 bg-amber-900/20 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">
                        Bean Amount (ETH)
                      </div>
                      <div className="text-lg font-medium font-mono">
                        {betAmount} ETH
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-gradient-to-r from-amber-700 to-amber-500 hover:from-amber-800 hover:to-amber-600"
                    disabled={isPlacingBet || !walletClient}
                    onClick={handlePlaceBet}
                  >
                    {isPlacingBet && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {!walletClient
                      ? "Connect Wallet to Brew"
                      : `Brew ${betSide === "yes" ? "Light" : "Dark"}`}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}

// Main component wrapped in Suspense
export default function PlaceBetPage() {
  return (
    <Suspense
      fallback={
        <AppLayout>
          <div className="container py-12 flex items-center justify-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
          </div>
        </AppLayout>
      }
    >
      <PlaceBetContent />
    </Suspense>
  );
}
