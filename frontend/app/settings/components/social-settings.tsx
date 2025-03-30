"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Twitter, MessageCircle, Check, AlertTriangle } from "lucide-react";

export function SocialSettings() {
  return (
    <div className="grid gap-6">
      {/* Twitter Integration */}
      <Card className="border-[#8B4513]/30 bg-[#1a0f02]/60 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-[#e8d5a9]">
                Twitter Integration
              </CardTitle>
              <CardDescription className="text-[#e8d5a9]/70">
                Connect your Twitter account for automated engagement
              </CardDescription>
            </div>
            <Badge
              variant="outline"
              className="bg-[#8B4513]/10 text-[#d4b37f] border-[#8B4513]/20"
            >
              <Check className="mr-1 h-3 w-3" />
              Connected
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4 p-4 rounded-lg bg-[#1a0f02]/60 border border-[#8B4513]/30">
            <Twitter className="h-8 w-8 text-[#d4b37f]" />
            <div className="flex-1">
              <p className="font-medium text-[#e8d5a9]">@cryptoninja</p>
              <p className="text-sm text-[#e8d5a9]/70">
                Connected since Feb 10, 2025
              </p>
            </div>
            <Button
              variant="outline"
              className="border-[#8B4513]/40 text-[#d4b37f] hover:bg-[#8B4513]/20 hover:text-[#e8d5a9]"
            >
              Disconnect
            </Button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-[#e8d5a9]">Auto-Tweet Permissions</Label>
                <p className="text-sm text-[#e8d5a9]/70">
                  Allow AI to post tweets on your behalf
                </p>
              </div>
              <Switch className="data-[state=checked]:bg-[#8B4513]" />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-[#e8d5a9]">Engagement Tracking</Label>
                <p className="text-sm text-[#e8d5a9]/70">
                  Track likes, retweets, and replies
                </p>
              </div>
              <Switch className="data-[state=checked]:bg-[#8B4513]" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Telegram Integration */}
      <Card className="border-[#8B4513]/30 bg-[#1a0f02]/60 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-[#e8d5a9]">Telegram Integration</CardTitle>
          <CardDescription className="text-[#e8d5a9]/70">
            Connect Telegram for instant notifications and updates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4 p-4 rounded-lg bg-[#1a0f02]/60 border border-[#8B4513]/30">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#8B4513] flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-[#e8d5a9]" />
              </div>
              <p className="font-medium text-[#e8d5a9]">CaffiFi Bot</p>
            </div>
            <Button className="bg-[#8B4513] hover:bg-[#A0522D] text-[#e8d5a9]">
              Connect
            </Button>
          </div>

          <div className="flex items-center gap-2 p-4 rounded-lg bg-[#A0522D]/20 border border-[#A0522D]/40 text-[#e8d5a9]">
            <AlertTriangle className="h-5 w-5 text-[#d4b37f]" />
            <p className="text-sm text-[#e8d5a9]">
              Start a chat with @CaffiFiBot on Telegram and use the command
              /connect to link your account.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Discord Webhook */}
      <Card className="border-[#8B4513]/30 bg-[#1a0f02]/60 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-[#e8d5a9]">Discord Webhook</CardTitle>
          <CardDescription className="text-[#e8d5a9]/70">
            Set up Discord notifications for your server
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[#e8d5a9]">Webhook URL</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://discord.com/api/webhooks/..."
                  className="bg-[#1a0f02]/60 border-[#8B4513]/40 text-[#e8d5a9] placeholder-[#d4b37f]/50 focus-visible:ring-[#d4b37f]"
                />
                <Button className="bg-[#8B4513] hover:bg-[#A0522D] text-[#e8d5a9]">
                  Save
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-[#e8d5a9]">Price Alerts</Label>
                  <p className="text-sm text-[#e8d5a9]/70">
                    Send price movements to Discord
                  </p>
                </div>
                <Switch className="data-[state=checked]:bg-[#8B4513]" />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-[#e8d5a9]">Trading Signals</Label>
                  <p className="text-sm text-[#e8d5a9]/70">
                    Notify when AI detects trading opportunities
                  </p>
                </div>
                <Switch className="data-[state=checked]:bg-[#8B4513]" />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-[#e8d5a9]">Portfolio Updates</Label>
                  <p className="text-sm text-[#e8d5a9]/70">
                    Daily portfolio performance summary
                  </p>
                </div>
                <Switch className="data-[state=checked]:bg-[#8B4513]" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
