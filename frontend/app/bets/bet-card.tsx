"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Share2,
  Twitter,
  CheckCircle2,
  XCircle,
  Trophy,
  Clock,
  TrendingUp,
  Users,
  DollarSign,
  Flame,
  BarChart3,
  Calendar,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { TimeLeft } from "./time-left";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface Bet {
  id: string;
  title: string;
  image: string;
  endDate: string;
  totalPool: number;
  yesPool: number;
  noPool: number;
  yesProbability: number;
  noProbability: number;
  isResolved?: boolean;
  result?: "yes" | "no";
  rank?: number;
}

// Define bet phases
type BetPhase = "early" | "middle" | "late" | "final" | "ended";

export function BetCard({ bet }: { bet: Bet }) {
  // Create a local state to track if the bet has ended
  const [hasEnded, setHasEnded] = useState(false);
  const [betPhase, setBetPhase] = useState<BetPhase>("early");
  const [timeProgress, setTimeProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [formattedTimeWithSeconds, setFormattedTimeWithSeconds] =
    useState<string>("");

  // Check if the bet has ended based on endDate and calculate time progress
  useEffect(() => {
    const calculateTimeAndPhase = () => {
      const now = new Date();
      const end = new Date(bet.endDate);
      const isEnded = now >= end;
      setHasEnded(isEnded);

      // Calculate time progress
      const endTime = end.getTime();
      const nowTime = now.getTime();
      const start = endTime - 7 * 24 * 60 * 60 * 1000; // Assuming 7 days duration

      // Calculate time left for countdown
      if (!isEnded) {
        const diff = endTime - nowTime;
        const totalSeconds = Math.floor(diff / 1000);
        setSecondsLeft(totalSeconds);

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        // Format with seconds for the prominent timer
        if (days > 0) {
          setFormattedTimeWithSeconds(
            `${days}d ${hours}h ${minutes}m ${seconds}s`
          );
        } else if (hours > 0) {
          setFormattedTimeWithSeconds(`${hours}h ${minutes}m ${seconds}s`);
        } else {
          setFormattedTimeWithSeconds(`${minutes}m ${seconds}s`);
        }

        // Format without seconds for other displays
        if (days > 0) {
          setTimeLeft(`${days}d ${hours}h ${minutes}m`);
        } else if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m`);
        } else {
          setTimeLeft(`${minutes}m`);
        }
      } else {
        setTimeLeft("Ended");
        setFormattedTimeWithSeconds("Ended");
        setSecondsLeft(0);
      }

      let progress = 0;

      if (nowTime >= endTime) {
        progress = 100;
        setBetPhase("ended");
      } else if (nowTime <= start) {
        progress = 0;
        setBetPhase("early");
      } else {
        const totalDuration = endTime - start;
        const elapsed = nowTime - start;
        progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));

        // Determine bet phase based on progress
        if (progress < 25) {
          setBetPhase("early");
        } else if (progress < 50) {
          setBetPhase("middle");
        } else if (progress < 75) {
          setBetPhase("late");
        } else {
          setBetPhase("final");
        }
      }

      setTimeProgress(progress);
    };

    // Calculate immediately
    calculateTimeAndPhase();

    // Then check every second instead of every minute
    const interval = setInterval(calculateTimeAndPhase, 1000);

    return () => clearInterval(interval);
  }, [bet.endDate]);

  // If the bet has ended but is not marked as resolved, we should treat it as ended
  const isEffectivelyResolved = bet.isResolved || hasEnded;

  const formattedDate = new Date(bet.endDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Calculate payout multiplier for winning side
  const winningPayout =
    bet.result === "yes"
      ? (bet.totalPool / bet.yesPool).toFixed(2)
      : (bet.totalPool / bet.noPool).toFixed(2);

  // Get phase display information
  const getPhaseInfo = () => {
    switch (betPhase) {
      case "early":
        return {
          label: "Early Phase",
          color: "text-blue-400",
          icon: <Clock className="h-3 w-3 mr-1" />,
        };
      case "middle":
        return {
          label: "Middle Phase",
          color: "text-green-400",
          icon: <TrendingUp className="h-3 w-3 mr-1" />,
        };
      case "late":
        return {
          label: "Late Phase",
          color: "text-yellow-400",
          icon: <TrendingUp className="h-3 w-3 mr-1" />,
        };
      case "final":
        return {
          label: "Final Hours",
          color: "text-red-400",
          icon: <Flame className="h-3 w-3 mr-1" />,
        };
      case "ended":
        return {
          label: "Ended",
          color: "text-gray-400",
          icon: <Clock className="h-3 w-3 mr-1" />,
        };
      default:
        return {
          label: "Active",
          color: "text-green-400",
          icon: <Clock className="h-3 w-3 mr-1" />,
        };
    }
  };

  const phaseInfo = getPhaseInfo();

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="group h-full overflow-visible"
    >
      <Card className="overflow-visible border-[#8B4513]/30 bg-[#1a0f02]/90 backdrop-blur-xl flex flex-col h-full relative">
        {/* Time Progress Bar */}
        {!isEffectivelyResolved && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#8B4513]/20 z-10">
            <div
              className="h-full bg-gradient-to-r from-[#d4b37f] to-[#8B4513]"
              style={{ width: `${timeProgress}%` }}
            />
          </div>
        )}

        {/* Top Rank Badge */}
        {bet.rank !== undefined && bet.rank < 3 && (
          <div className="absolute -top-5 -left-3 z-30">
            <div
              className={cn(
                "font-bold text-3xl px-0 py-0 flex items-center justify-center transform -rotate-12",
                bet.rank === 0
                  ? "text-[#d4b37f]"
                  : bet.rank === 1
                  ? "text-[#c0a172]"
                  : "text-[#a38b62]"
              )}
            >
              <span
                className="font-extrabold tracking-wider"
                style={{ textShadow: "3px 3px 5px rgba(0,0,0,0.8)" }}
              >
                TOP{bet.rank + 1}
              </span>
            </div>
          </div>
        )}

        {/* Image */}
        <div className="relative h-48 flex-shrink-0">
          <Image
            src={
              bet.image && bet.image.startsWith("http")
                ? bet.image
                : "/placeholder.svg"
            }
            alt={bet.title}
            fill
            className="object-cover"
            onError={(e) => {
              console.error(`Error loading image for bet ${bet.id}:`, e);
              // Set fallback image
              e.currentTarget.src = "/placeholder.svg";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a0f02] to-transparent" />

          {/* Timer / Status Badge */}
          <div className="absolute bottom-3 left-3 flex flex-col gap-1">
            {/* Status Badge */}
            {isEffectivelyResolved ? (
              <Badge
                variant="outline"
                className={cn(
                  "text-xs rounded-md px-2 py-1 bg-[#1a0f02]/80 backdrop-blur-sm border-[#8B4513]/30 flex items-center gap-1 text-[#e8d5a9]",
                  "group-hover:border-[#8B4513]/50"
                )}
              >
                {bet.isResolved ? (
                  <>
                    {bet.result === "yes" ? (
                      <CheckCircle2 className="h-3 w-3 text-[#92da6c]" />
                    ) : (
                      <XCircle className="h-3 w-3 text-red-400" />
                    )}
                    <span className="text-[#e8d5a9]">
                      {bet.result === "yes" ? "Yes Won" : "No Won"}
                    </span>
                    <span
                      className={cn(
                        "ml-1 font-mono",
                        bet.result === "yes" ? "text-[#92da6c]" : "text-red-400"
                      )}
                    >
                      {bet.result === "yes"
                        ? `${bet.yesProbability.toFixed(0)}%`
                        : `${bet.noProbability.toFixed(0)}%`}
                    </span>
                  </>
                ) : (
                  <>
                    <Clock className="h-3 w-3 text-[#d4b37f]" />
                    <span>Resolved Soon</span>
                  </>
                )}
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className={cn(
                  "text-xs rounded-md px-2 py-1 bg-[#1a0f02]/80 backdrop-blur-sm border-[#8B4513]/30 text-[#e8d5a9] flex items-center gap-1",
                  phaseInfo.color,
                  "group-hover:border-[#8B4513]/50"
                )}
              >
                {phaseInfo.icon}
                <span>{phaseInfo.label}</span>
              </Badge>
            )}

            {/* Time Left */}
            {!isEffectivelyResolved && (
              <div
                className={cn(
                  "text-xl font-medium tracking-tight text-white/90",
                  betPhase === "final" && "text-red-400 animate-pulse"
                )}
              >
                <TimeLeft
                  endDate={bet.endDate}
                  className="text-[#e8d5a9] font-medium"
                />
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col p-4">
          <div className="flex-1">
            <h3 className="font-semibold mb-2 text-lg leading-tight text-[#e8d5a9]">
              {bet.title}
            </h3>

            {/* Status Info */}
            <div className="flex flex-wrap gap-2 mt-2 mb-3">
              <div className="flex items-center gap-1 text-xs text-[#e8d5a9]/70">
                <Trophy className="h-3 w-3 text-[#d4b37f]" />
                <span>
                  Pool: {bet.totalPool.toFixed(2)}{" "}
                  <span className="text-xs">ETH</span>
                </span>
              </div>

              <div className="flex items-center gap-1 text-xs text-[#e8d5a9]/70">
                <Calendar className="h-3 w-3 text-[#d4b37f]" />
                <span>{formattedDate}</span>
              </div>
            </div>

            {/* Probabilities */}
            <div className="mt-4 mb-2">
              <div className="flex items-center justify-between mb-1 text-xs">
                <span className="text-[#92da6c]">
                  Yes {bet.yesProbability.toFixed(0)}%
                </span>
                <span className="text-red-400">
                  No {bet.noProbability.toFixed(0)}%
                </span>
              </div>

              <div className="h-2 bg-[#8B4513]/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#92da6c] to-[#92da6c]/70"
                  style={{ width: `${bet.yesProbability}%` }}
                />
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-auto pt-3">
            <Link href={`/bets/place-bet?id=${bet.id}`}>
              <Button
                className={cn(
                  "w-full bg-[#8B4513] hover:bg-[#A0522D] text-[#e8d5a9] border-[#8B4513] border",
                  isEffectivelyResolved &&
                    "bg-[#8B4513]/30 hover:bg-[#8B4513]/40 text-[#e8d5a9]/70"
                )}
                disabled={isEffectivelyResolved}
              >
                {isEffectivelyResolved
                  ? "Betting Closed"
                  : `Place Bet (${bet.totalPool.toFixed(2)} ETH pool)`}
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
