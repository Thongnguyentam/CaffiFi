"use client";

import { Bot, Edit, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type InputMethod = "ai-joke" | "ai-tweet" | "manual";

interface InputMethodSelectorProps {
  selected: InputMethod;
  onSelect: (method: InputMethod) => void;
}

export function InputMethodSelector({
  selected,
  onSelect,
}: InputMethodSelectorProps) {
  const methods = [
    {
      id: "ai-joke" as const,
      icon: Bot,
      title: "AI Generator",
      description: "Enter a joke or meme idea",
    },
    {
      id: "ai-tweet" as const,
      icon: Twitter,
      title: "From Tweet",
      description: "Use a tweet as inspiration",
    },
    {
      id: "manual" as const,
      icon: Edit,
      title: "Manual Entry",
      description: "Enter details yourself",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {methods.map((method) => (
        <Button
          key={method.id}
          variant="outline"
          className={cn(
            "h-auto flex flex-col items-center gap-2 p-6 border-[#8B4513]/30 hover:border-[#8B4513]/60 hover:bg-[#8B4513]/10 text-[#e8d5a9]",
            selected === method.id && "border-[#8B4513]/60 bg-[#8B4513]/10"
          )}
          onClick={() => onSelect(method.id)}
        >
          <method.icon
            className={cn(
              "h-8 w-8 text-[#d4b37f]",
              selected === method.id && "text-[#e8d5a9]"
            )}
          />
          <div className="text-center">
            <h3
              className={cn(
                "font-semibold text-[#e8d5a9]",
                selected === method.id && "text-[#e8d5a9]"
              )}
            >
              {method.title}
            </h3>
            <p
              className={cn(
                "text-sm text-[#d4b37f]/70",
                selected === method.id && "text-[#d4b37f]"
              )}
            >
              {method.description}
            </p>
          </div>
        </Button>
      ))}
    </div>
  );
}
