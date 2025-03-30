"use client";

import type React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

interface Asset {
  id: string;
  symbol: string;
  name: string;
  category: string;
  price: number;
  priceChange: number;
  priceChangePercent: number;
  dailyPL: number;
  avgCost: number;
  pl: number;
  plPercent: number;
  value: number;
  holdings: number;
  address?: string;
}

interface AutoShillModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset;
}

export function AutoShillModal({
  isOpen,
  onClose,
  asset,
}: AutoShillModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [platform, setPlatform] = useState("twitter");
  const [frequency, setFrequency] = useState("daily");

  // Reset states when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setIsLoading(false);
      setShowSuccess(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Show success dialog after 5 seconds
    setTimeout(() => {
      setIsLoading(false);
      setShowSuccess(true);
    }, 5000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-[#8B4513]/30 bg-[#1a0f02]/90 backdrop-blur-xl">
        {!showSuccess ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-[#e8d5a9]">
                Auto Shill {asset.symbol}
              </DialogTitle>
              <DialogDescription className="text-[#e8d5a9]/70">
                Configure auto-shill settings for {asset.name}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[#e8d5a9]">Platform</Label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger className="border-[#8B4513]/40 bg-[#1a0f02]/60 text-[#e8d5a9]">
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent className="border-[#8B4513]/40 bg-[#1a0f02] text-[#e8d5a9]">
                    <SelectItem
                      value="twitter"
                      className="focus:bg-[#8B4513]/20 focus:text-[#e8d5a9]"
                    >
                      Twitter
                    </SelectItem>
                    <SelectItem
                      value="telegram"
                      className="focus:bg-[#8B4513]/20 focus:text-[#e8d5a9]"
                    >
                      Telegram
                    </SelectItem>
                    <SelectItem
                      value="discord"
                      className="focus:bg-[#8B4513]/20 focus:text-[#e8d5a9]"
                    >
                      Discord
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[#e8d5a9]">
                  Custom Message (optional)
                </Label>
                <Textarea
                  placeholder="Enter your custom shill message..."
                  className="bg-[#1a0f02]/60 border-[#8B4513]/40 text-[#e8d5a9] placeholder-[#d4b37f]/50 focus-visible:ring-[#d4b37f]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#e8d5a9]">
                  Custom Hashtags (optional)
                </Label>
                <Input
                  placeholder="Enter hashtags (comma separated)"
                  className="bg-[#1a0f02]/60 border-[#8B4513]/40 text-[#e8d5a9] placeholder-[#d4b37f]/50 focus-visible:ring-[#d4b37f]"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="border-[#8B4513]/40 text-[#e8d5a9] hover:bg-[#8B4513]/20 hover:text-[#e8d5a9]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-r from-[#d4b37f] to-[#8B4513] text-[#e8d5a9] hover:from-[#8B4513] hover:to-[#d4b37f]"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#e8d5a9]"></div>
                      Setting up...
                    </div>
                  ) : (
                    "Start Auto Shill"
                  )}
                </Button>
              </div>
            </form>
          </>
        ) : (
          // Success View
          <div className="flex flex-col items-center text-center space-y-6 py-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-20 h-20 rounded-full bg-gradient-to-r from-[#d4b37f] to-[#8B4513] flex items-center justify-center"
            >
              <Check className="h-10 w-10 text-[#e8d5a9]" />
            </motion.div>
            <div className="space-y-2">
              <h2 className="text-2xl font-medium text-[#e8d5a9]">
                Auto Shill Activated!
              </h2>
              <p className="text-[#e8d5a9]/70">
                Your {asset.symbol} has successfully been shilled on {platform}!
              </p>
            </div>
            <Button
              className="bg-gradient-to-r from-[#d4b37f] to-[#8B4513] text-[#e8d5a9] hover:from-[#8B4513] hover:to-[#d4b37f]"
              onClick={onClose}
            >
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
