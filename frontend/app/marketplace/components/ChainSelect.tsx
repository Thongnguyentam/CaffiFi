import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Chain } from "../types";

const chains = [
  {
    id: "ethereum",
    name: "Ethereum",
    logo: "/ethereum.svg",
  },
  {
    id: "binance",
    name: "Binance",
    logo: "/binance.svg",
  },
  {
    id: "solana",
    name: "Solana",
    logo: "/solana.svg",
  },
  {
    id: "arbitrum",
    name: "Arbitrum",
    logo: "/arbitrum.svg",
  },
];

interface ChainSelectProps {
  selectedChain: Chain | null;
  onChainChange: (chain: Chain | null) => void;
}

export const ChainSelect = ({
  selectedChain,
  onChainChange,
}: ChainSelectProps) => {
  const handleChange = (value: string) => {
    if (value === "all") {
      onChainChange(null);
    } else {
      const chain = chains.find((c) => c.id === value);
      if (chain) {
        onChainChange(chain);
      }
    }
  };

  return (
    <Select value={selectedChain?.id || "all"} onValueChange={handleChange}>
      <SelectTrigger className="h-7 w-[110px] bg-transparent border-0 focus:ring-0 text-[#e8d5a9] hover:text-[#d4b37f] transition-colors">
        <SelectValue placeholder="All Chains" />
      </SelectTrigger>
      <SelectContent className="bg-[#1a0f02] border border-[#8B4513]/40">
        <SelectItem
          value="all"
          className="text-[#e8d5a9] focus:bg-[#8B4513]/20 focus:text-[#d4b37f]"
        >
          All Chains
        </SelectItem>
        {chains.map((chain) => (
          <SelectItem
            key={chain.id}
            value={chain.id}
            className="text-[#e8d5a9] focus:bg-[#8B4513]/20 focus:text-[#d4b37f]"
          >
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full overflow-hidden">
                <Image
                  src={chain.logo}
                  alt={chain.name}
                  width={16}
                  height={16}
                  className="w-full h-full object-contain"
                />
              </div>
              {chain.name}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
