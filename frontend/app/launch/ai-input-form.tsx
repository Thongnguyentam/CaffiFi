"use client";

import type React from "react";

import { useState } from "react";
import { Bot, RefreshCcw, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import type { InputMethod } from "./input-method-selector";

interface AIInputFormProps {
  inputMethod: InputMethod;
  onGenerate: (input: string) => Promise<void>;
  isGenerating: boolean;
}

export function AIInputForm({
  inputMethod,
  onGenerate,
  isGenerating,
}: AIInputFormProps) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!input.trim()) {
      setError("Please enter some text");
      return;
    }

    try {
      await onGenerate(input);
    } catch (err) {
      setError("Failed to generate token details. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card className="p-6 bg-[#3a1e0a]/30 border-[#8B4513]/40 shadow-sm">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {inputMethod === "ai-joke" ? (
              <Bot className="w-5 h-5 text-[#d4b37f]" />
            ) : (
              <Wand2 className="w-5 h-5 text-[#d4b37f]" />
            )}
            <h3 className="font-medium text-[#e8d5a9]">
              {inputMethod === "ai-joke"
                ? "Enter your meme idea or joke"
                : "Enter a tweet URL"}
            </h3>
          </div>

          {inputMethod === "ai-joke" ? (
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="E.g., Trump got so mad he turned into a meme coin that only goes up when he tweets"
              className="min-h-[100px] bg-[#1a0f02]/60 border-[#8B4513]/40 text-[#e8d5a9] placeholder-[#d4b37f]/50 focus-visible:ring-[#d4b37f]"
            />
          ) : (
            <Input
              type="url"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="https://twitter.com/username/status/123456789"
              className="bg-[#1a0f02]/60 border-[#8B4513]/40 text-[#e8d5a9] placeholder-[#d4b37f]/50 focus-visible:ring-[#d4b37f]"
            />
          )}

          {error && (
            <Alert
              variant="destructive"
              className="bg-[#A0522D]/20 border-[#A0522D]/40 text-[#e8d5a9]"
            >
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full bg-[#8B4513] hover:bg-[#A0522D] text-[#e8d5a9] border border-[#8B4513]/60"
            disabled={isGenerating || !input.trim()}
          >
            {isGenerating ? (
              <div className="flex items-center gap-2">
                <RefreshCcw className="w-4 h-4 animate-spin" />
                Generating...
              </div>
            ) : (
              "Generate Token Details"
            )}
          </Button>
        </div>
      </Card>
    </form>
  );
}
