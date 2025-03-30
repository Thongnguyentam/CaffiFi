"use client";

import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle, Clock, Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BetFiltersProps {
  activeFilter: "all" | "active" | "resolved";
  selectedCategory: string | null;
  onFilterChange: (filter: "all" | "active" | "resolved") => void;
  onCategoryChange: (category: string | null) => void;
}

const categories = [
  "Crypto",
  "Politics",
  "Sports",
  "Entertainment",
  "Technology",
  "Finance",
];

export function BetFilters({
  activeFilter,
  selectedCategory,
  onFilterChange,
  onCategoryChange,
}: BetFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant={activeFilter === "all" ? "default" : "outline"}
        size="sm"
        onClick={() => onFilterChange("all")}
        className={
          activeFilter === "all"
            ? "bg-[#8B4513] hover:bg-[#A0522D] text-[#e8d5a9]"
            : "border-[#8B4513]/30 text-[#d4b37f] hover:bg-[#8B4513]/20 hover:text-[#e8d5a9]"
        }
      >
        <Filter className="mr-2 h-4 w-4" />
        All Bets
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="border-[#8B4513]/30 text-[#d4b37f] hover:bg-[#8B4513]/20 hover:text-[#e8d5a9]"
          >
            <Calendar className="mr-2 h-4 w-4" />
            {selectedCategory || "Categories"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="bg-[#1a0f02] border-[#8B4513]/30"
        >
          <DropdownMenuItem
            onClick={() => onCategoryChange(null)}
            className="hover:bg-[#8B4513]/20 text-[#e8d5a9]"
          >
            All Categories
          </DropdownMenuItem>
          {categories.map((category) => (
            <DropdownMenuItem
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`${
                selectedCategory === category ? "bg-[#8B4513]/20" : ""
              } hover:bg-[#8B4513]/30 text-[#e8d5a9]`}
            >
              {category}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
