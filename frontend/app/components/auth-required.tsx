"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Lock, ArrowLeft } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useRouter } from "next/navigation";
import { useWallet } from "../providers/WalletProvider";

export function AuthRequired() {
  const router = useRouter();
  const { connect } = useWallet();

  // Handle direct connect with our wallet provider
  const handleDirectConnect = async () => {
    try {
      console.log("Attempting direct wallet connection...");
      await connect();
      console.log("Direct wallet connection successful");

      // Force reload the page to apply authentication changes
      window.location.reload();
    } catch (error) {
      console.error("Direct wallet connection failed:", error);
      alert(
        "Failed to connect wallet. Please make sure MetaMask is installed and unlocked."
      );
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-sky-500/20 bg-background/95 backdrop-blur">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-sky-500/10 p-3">
                <Lock className="h-6 w-6 text-sky-500" />
              </div>
            </div>
            <CardTitle className="text-center text-2xl">
              Authentication Required
            </CardTitle>
            <CardDescription className="text-center">
              Please connect your wallet to access this page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* RainbowKit connection button */}
            <div className="flex justify-center">
              <ConnectButton />
            </div>

            {/* Divider with text */}
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-gray-400/20"></div>
              <span className="flex-shrink mx-4 text-gray-400/60 text-sm">
                or try direct connection
              </span>
              <div className="flex-grow border-t border-gray-400/20"></div>
            </div>

            {/* Direct connect button */}
            <Button
              variant="default"
              className="w-full bg-[#8B4513] hover:bg-[#A0522D] text-[#e8d5a9]"
              onClick={handleDirectConnect}
            >
              <Wallet className="mr-2 h-4 w-4" />
              Connect with MetaMask
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              <p>
                Connect your wallet to access all features including dashboard,
                portfolio, and trading.
              </p>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
