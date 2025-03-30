"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, Coffee } from "lucide-react";
import { useState } from "react";

const faqItems = [
  {
    question: "What are meme coins?",
    answer:
      "Meme coins are cryptocurrencies inspired by internet memes, often created as jokes but some gaining serious value. They're part of the altcoin family, alternatives to Bitcoin.",
    color: "#d4b37f",
  },
  {
    question: "How to find new meme coins?",
    answer:
      "Explore our comprehensive table of meme coins, updated regularly with the latest additions. Remember to DYOR (Do Your Own Research) before investing.",
    color: "#8B4513",
  },
  {
    question: "How to buy meme coins",
    answer:
      "Get a digital wallet, find an exchange that lists your chosen meme coin, create an account, deposit funds, and make your purchase. Always verify the contract address.",
    color: "#A0522D",
  },
  {
    question: "Are meme coins really gambling?",
    answer:
      "Meme coins are highly volatile investments. While some have generated significant returns, they carry substantial risk. Never invest more than you can afford to lose.",
    color: "#e8d5a9",
  },
];

export function AboutMemes() {
  const [openItem, setOpenItem] = useState<number | null>(null);

  return (
    <Card className="border-[#8B4513]/30 bg-[#1a0f02]/90 backdrop-blur-xl shadow-md hover:shadow-[0_4px_12px_rgba(139,69,19,0.3)] transition-all">
      <CardContent className="p-6">
        <h1 className="text-4xl font-bold pb-4 flex items-center">
          About
          <span className="text-[#d4b37f] ml-2 flex items-center">
            Memes <Coffee className="ml-2 h-6 w-6 text-[#8B4513]" />
          </span>
        </h1>
        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className="border-b border-[#8B4513]/30 last:border-0 pb-4 last:pb-0"
            >
              <button
                className="flex items-center justify-between w-full text-left"
                onClick={() => setOpenItem(openItem === index ? null : index)}
              >
                <span
                  style={{ color: item.color }}
                  className="text-sm font-medium"
                >
                  {item.question}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-[#d4b37f] transition-transform ${
                    openItem === index ? "transform rotate-180" : ""
                  }`}
                />
              </button>
              {openItem === index && (
                <p className="mt-2 text-sm text-[#e8d5a9]/70">{item.answer}</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
