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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bot, MessageSquare, Shield, Target } from "lucide-react";

export function AISettings() {
  return (
    <div className="grid gap-6">
      {/* Response Style */}
      <Card className="border-[#8B4513]/30 bg-[#1a0f02]/60 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-[#d4b37f]" />
            <div>
              <CardTitle className="text-[#e8d5a9]">
                AI Response Style
              </CardTitle>
              <CardDescription className="text-[#e8d5a9]/70">
                Customize how the AI interacts with your community
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[#e8d5a9]">Default Response Style</Label>
              <Select defaultValue="neutral">
                <SelectTrigger className="border-[#8B4513]/40 bg-[#1a0f02]/60 text-[#e8d5a9]">
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent className="border-[#8B4513]/40 bg-[#1a0f02] text-[#e8d5a9]">
                  <SelectItem
                    value="aggressive"
                    className="focus:bg-[#8B4513]/20 focus:text-[#e8d5a9]"
                  >
                    Aggressive & Confident
                  </SelectItem>
                  <SelectItem
                    value="neutral"
                    className="focus:bg-[#8B4513]/20 focus:text-[#e8d5a9]"
                  >
                    Neutral & Balanced
                  </SelectItem>
                  <SelectItem
                    value="educational"
                    className="focus:bg-[#8B4513]/20 focus:text-[#e8d5a9]"
                  >
                    Educational & Informative
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[#e8d5a9]">Response Length</Label>
              <Select defaultValue="medium">
                <SelectTrigger className="border-[#8B4513]/40 bg-[#1a0f02]/60 text-[#e8d5a9]">
                  <SelectValue placeholder="Select length" />
                </SelectTrigger>
                <SelectContent className="border-[#8B4513]/40 bg-[#1a0f02] text-[#e8d5a9]">
                  <SelectItem
                    value="short"
                    className="focus:bg-[#8B4513]/20 focus:text-[#e8d5a9]"
                  >
                    Short & Concise
                  </SelectItem>
                  <SelectItem
                    value="medium"
                    className="focus:bg-[#8B4513]/20 focus:text-[#e8d5a9]"
                  >
                    Medium & Balanced
                  </SelectItem>
                  <SelectItem
                    value="long"
                    className="focus:bg-[#8B4513]/20 focus:text-[#e8d5a9]"
                  >
                    Long & Detailed
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[#e8d5a9]">Custom Tone Adjustments</Label>
              <Textarea
                placeholder="Add custom phrases or expressions for the AI to use"
                className="bg-[#1a0f02]/60 border-[#8B4513]/40 text-[#e8d5a9] placeholder-[#d4b37f]/50 focus-visible:ring-[#d4b37f]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Filters */}
      <Card className="border-[#8B4513]/30 bg-[#1a0f02]/60 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#d4b37f]" />
            <div>
              <CardTitle className="text-[#e8d5a9]">Content Filters</CardTitle>
              <CardDescription className="text-[#e8d5a9]/70">
                Manage AI response restrictions and preferences
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[#e8d5a9]">Blacklisted Words</Label>
              <Textarea
                placeholder="Enter words to avoid (comma-separated)"
                className="bg-[#1a0f02]/60 border-[#8B4513]/40 text-[#e8d5a9] placeholder-[#d4b37f]/50 focus-visible:ring-[#d4b37f]"
              />
              <p className="text-sm text-[#e8d5a9]/70">
                AI will avoid using or responding to these terms
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-[#e8d5a9]">Sensitive Topics</Label>
              <div className="space-y-2">
                {[
                  "Politics",
                  "Religion",
                  "NSFW Content",
                  "Financial Advice",
                ].map((topic) => (
                  <div
                    key={topic}
                    className="flex items-center justify-between"
                  >
                    <Label className="text-sm text-[#e8d5a9]">{topic}</Label>
                    <Switch className="data-[state=checked]:bg-[#8B4513]" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Prioritization */}
      <Card className="border-[#8B4513]/30 bg-[#1a0f02]/60 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-[#d4b37f]" />
            <div>
              <CardTitle className="text-[#e8d5a9]">
                Project Prioritization
              </CardTitle>
              <CardDescription className="text-[#e8d5a9]/70">
                Configure AI focus for specific projects
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[#e8d5a9]">Whitelisted Projects</Label>
              <Input
                placeholder="Enter token symbols (comma-separated)"
                className="bg-[#1a0f02]/60 border-[#8B4513]/40 text-[#e8d5a9] placeholder-[#d4b37f]/50 focus-visible:ring-[#d4b37f]"
              />
              <p className="text-sm text-[#e8d5a9]/70">
                AI will prioritize engagement for these projects
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-[#e8d5a9]">
                  Auto-Detect New Projects
                </Label>
                <p className="text-sm text-[#e8d5a9]/70">
                  Automatically track trending projects
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

      {/* Engagement Rules */}
      <Card className="border-[#8B4513]/30 bg-[#1a0f02]/60 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-[#d4b37f]" />
            <div>
              <CardTitle className="text-[#e8d5a9]">Engagement Rules</CardTitle>
              <CardDescription className="text-[#e8d5a9]/70">
                Set rules for AI interactions
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-[#e8d5a9]">Reply to Mentions</Label>
                <p className="text-sm text-[#e8d5a9]/70">
                  Automatically respond when mentioned
                </p>
              </div>
              <Switch
                className="data-[state=checked]:bg-[#8B4513]"
                defaultChecked
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-[#e8d5a9]">Proactive Engagement</Label>
                <p className="text-sm text-[#e8d5a9]/70">
                  Initiate conversations based on keywords
                </p>
              </div>
              <Switch className="data-[state=checked]:bg-[#8B4513]" />
            </div>

            <div className="space-y-2">
              <Label className="text-[#e8d5a9]">Response Delay (seconds)</Label>
              <Select defaultValue="30">
                <SelectTrigger className="border-[#8B4513]/40 bg-[#1a0f02]/60 text-[#e8d5a9]">
                  <SelectValue placeholder="Select delay" />
                </SelectTrigger>
                <SelectContent className="border-[#8B4513]/40 bg-[#1a0f02] text-[#e8d5a9]">
                  <SelectItem
                    value="0"
                    className="focus:bg-[#8B4513]/20 focus:text-[#e8d5a9]"
                  >
                    Instant
                  </SelectItem>
                  <SelectItem
                    value="30"
                    className="focus:bg-[#8B4513]/20 focus:text-[#e8d5a9]"
                  >
                    30 seconds
                  </SelectItem>
                  <SelectItem
                    value="60"
                    className="focus:bg-[#8B4513]/20 focus:text-[#e8d5a9]"
                  >
                    1 minute
                  </SelectItem>
                  <SelectItem
                    value="300"
                    className="focus:bg-[#8B4513]/20 focus:text-[#e8d5a9]"
                  >
                    5 minutes
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
