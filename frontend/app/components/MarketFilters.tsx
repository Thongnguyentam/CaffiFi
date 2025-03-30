"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronDown, Rocket } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Chain, FilterOption } from "./types";

interface MarketFiltersProps {
  chains: Chain[];
  filterOptions: FilterOption[];
  selectedChain: Chain | null;
  activeFilter: "latest" | "trending" | "new" | "gainers" | "visited";
  onChainSelect: (chain: Chain | null) => void;
  onFilterSelect: (
    filter: "latest" | "trending" | "new" | "gainers" | "visited"
  ) => void;
}

export function MarketFilters({
  chains,
  filterOptions,
  selectedChain,
  activeFilter,
  onChainSelect,
  onFilterSelect,
}: MarketFiltersProps) {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-[130px] border-[#8B4513]/40 bg-[#1a0f02]/60 text-[#e8d5a9] hover:bg-[#8B4513]/20 hover:text-[#e8d5a9] hover:border-[#8B4513]"
            >
              <div className="flex items-center gap-2">
                {selectedChain ? (
                  <>
                    <Image
                      src={selectedChain.logo || "/placeholder.svg"}
                      alt={selectedChain.name}
                      width={20}
                      height={20}
                      className="rounded-full"
                    />
                    {selectedChain.name}
                  </>
                ) : (
                  "All Chains"
                )}
                <ChevronDown className="ml-auto h-4 w-4 text-[#d4b37f]" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-[200px] border-[#8B4513]/30 bg-[#1a0f02] text-[#e8d5a9]"
          >
            <DropdownMenuItem
              onClick={() => onChainSelect(null)}
              className="hover:bg-[#8B4513]/20 focus:bg-[#8B4513]/20 hover:text-[#e8d5a9] cursor-pointer"
            >
              <span className="font-medium">All Chains</span>
            </DropdownMenuItem>
            {chains.map((chain) => (
              <DropdownMenuItem
                key={chain.id}
                onClick={() => onChainSelect(chain)}
                className="hover:bg-[#8B4513]/20 focus:bg-[#8B4513]/20 hover:text-[#e8d5a9] cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Image
                    src={chain.logo || "/placeholder.svg"}
                    alt={chain.name}
                    width={20}
                    height={20}
                    className="rounded-full"
                  />
                  <span className="font-medium">{chain.name}</span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex items-center gap-2">
          {filterOptions.map((filter) => {
            const Icon = filter.icon;
            return (
              <Button
                key={filter.id}
                variant="ghost"
                size="sm"
                className={`flex items-center gap-2 ${
                  activeFilter === filter.id
                    ? "text-[#e8d5a9] bg-[#8B4513]/30"
                    : "text-[#e8d5a9]/70 hover:text-[#e8d5a9] hover:bg-[#8B4513]/20"
                }`}
                onClick={() =>
                  onFilterSelect(
                    filter.id as
                      | "latest"
                      | "trending"
                      | "new"
                      | "gainers"
                      | "visited"
                  )
                }
              >
                <Icon className="w-4 h-4 text-[#d4b37f]" />
                {filter.label}
              </Button>
            );
          })}
        </div>
      </div>

      <Button
        asChild
        className="bg-gradient-to-r from-[#d4b37f] to-[#8B4513] text-[#e8d5a9] hover:from-[#8B4513] hover:to-[#d4b37f]"
      >
        <Link href="/launch">
          <Rocket className="mr-2 h-4 w-4" />
          Create a Token
        </Link>
      </Button>
    </div>
  );
}
