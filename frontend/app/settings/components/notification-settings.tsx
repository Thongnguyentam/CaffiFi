"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bell, Bot, Shield, LineChart } from "lucide-react";

export function NotificationSettings() {
  return (
    <div className="grid gap-6">
      {/* Price Alerts */}
      <Card className="border-[#8B4513]/30 bg-[#1a0f02]/60 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <LineChart className="h-5 w-5 text-[#d4b37f]" />
            <div>
              <CardTitle className="text-[#e8d5a9]">Price Alerts</CardTitle>
              <CardDescription className="text-[#e8d5a9]/70">
                Configure price movement notifications
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-[#e8d5a9]">Price Change Alerts</Label>
                <p className="text-sm text-[#e8d5a9]/70">
                  Notify on significant price movements
                </p>
              </div>
              <Switch
                className="data-[state=checked]:bg-[#8B4513]"
                defaultChecked
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#e8d5a9]">Threshold (%)</Label>
              <Select defaultValue="5">
                <SelectTrigger className="border-[#8B4513]/40 bg-[#1a0f02]/60 text-[#e8d5a9]">
                  <SelectValue placeholder="Select threshold" />
                </SelectTrigger>
                <SelectContent className="border-[#8B4513]/40 bg-[#1a0f02] text-[#e8d5a9]">
                  <SelectItem
                    value="3"
                    className="focus:bg-[#8B4513]/20 focus:text-[#e8d5a9]"
                  >
                    3%
                  </SelectItem>
                  <SelectItem
                    value="5"
                    className="focus:bg-[#8B4513]/20 focus:text-[#e8d5a9]"
                  >
                    5%
                  </SelectItem>
                  <SelectItem
                    value="10"
                    className="focus:bg-[#8B4513]/20 focus:text-[#e8d5a9]"
                  >
                    10%
                  </SelectItem>
                  <SelectItem
                    value="20"
                    className="focus:bg-[#8B4513]/20 focus:text-[#e8d5a9]"
                  >
                    20%
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Engagement */}
      <Card className="border-[#8B4513]/30 bg-[#1a0f02]/60 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-[#d4b37f]" />
            <div>
              <CardTitle className="text-[#e8d5a9]">
                AI Engagement Alerts
              </CardTitle>
              <CardDescription className="text-[#e8d5a9]/70">
                Manage AI activity notifications
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-[#e8d5a9]">
                  Auto-Reply Notifications
                </Label>
                <p className="text-sm text-[#e8d5a9]/70">
                  Get notified when AI responds to mentions
                </p>
              </div>
              <Switch
                className="data-[state=checked]:bg-[#8B4513]"
                defaultChecked
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-[#e8d5a9]">Auto-Shill Alerts</Label>
                <p className="text-sm text-[#e8d5a9]/70">
                  Notifications for automated promotional posts
                </p>
              </div>
              <Switch
                className="data-[state=checked]:bg-[#8B4513]"
                defaultChecked
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-[#e8d5a9]">Engagement Reports</Label>
                <p className="text-sm text-[#e8d5a9]/70">
                  Daily summary of AI interactions
                </p>
              </div>
              <Switch className="data-[state=checked]:bg-[#8B4513]" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Alerts */}
      <Card className="border-[#8B4513]/30 bg-[#1a0f02]/60 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#d4b37f]" />
            <div>
              <CardTitle className="text-[#e8d5a9]">Security Alerts</CardTitle>
              <CardDescription className="text-[#e8d5a9]/70">
                Critical security notification preferences
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-[#e8d5a9]">Unusual Activity</Label>
                <p className="text-sm text-[#e8d5a9]/70">
                  Alert on suspicious account activity
                </p>
              </div>
              <Switch
                className="data-[state=checked]:bg-[#8B4513]"
                defaultChecked
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-[#e8d5a9]">New Device Login</Label>
                <p className="text-sm text-[#e8d5a9]/70">
                  Notify when account is accessed from new device
                </p>
              </div>
              <Switch
                className="data-[state=checked]:bg-[#8B4513]"
                defaultChecked
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-[#e8d5a9]">Wallet Transactions</Label>
                <p className="text-sm text-[#e8d5a9]/70">
                  Alert on significant wallet movements
                </p>
              </div>
              <Switch
                className="data-[state=checked]:bg-[#8B4513]"
                defaultChecked
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Preferences */}
      <Card className="border-[#8B4513]/30 bg-[#1a0f02]/60 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-[#d4b37f]" />
            <div>
              <CardTitle className="text-[#e8d5a9]">
                Delivery Preferences
              </CardTitle>
              <CardDescription className="text-[#e8d5a9]/70">
                Choose how you want to receive notifications
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-[#e8d5a9]">Email Notifications</Label>
                <p className="text-sm text-[#e8d5a9]/70">
                  Receive updates via email
                </p>
              </div>
              <Switch
                className="data-[state=checked]:bg-[#8B4513]"
                defaultChecked
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-[#e8d5a9]">Push Notifications</Label>
                <p className="text-sm text-[#e8d5a9]/70">
                  Browser push notifications
                </p>
              </div>
              <Switch
                className="data-[state=checked]:bg-[#8B4513]"
                defaultChecked
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-[#e8d5a9]">Telegram Notifications</Label>
                <p className="text-sm text-[#e8d5a9]/70">
                  Get alerts via Telegram bot
                </p>
              </div>
              <Switch
                className="data-[state=checked]:bg-[#8B4513]"
                defaultChecked
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-[#e8d5a9]">Discord Notifications</Label>
                <p className="text-sm text-[#e8d5a9]/70">
                  Receive alerts in Discord
                </p>
              </div>
              <Switch className="data-[state=checked]:bg-[#8B4513]" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
