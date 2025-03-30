import { Button } from "@/components/ui/button";
import { FilterOption } from "../types";

interface ButtonGroupProps {
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
}

export const ButtonGroup = ({
  activeFilter,
  setActiveFilter,
}: ButtonGroupProps) => {
  const filters = [
    { id: "latest", label: "Latest" },
    { id: "trending", label: "Trending" },
    { id: "gainers", label: "Gainers" },
    { id: "losers", label: "Losers" },
    { id: "volume", label: "Volume" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.map((filter) => (
        <Button
          key={filter.id}
          variant={activeFilter === filter.id ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveFilter(filter.id)}
          className={
            activeFilter === filter.id
              ? "bg-[#8B4513] hover:bg-[#A0522D] text-[#e8d5a9] border border-[#8B4513]/60"
              : "border-[#8B4513]/30 text-[#d4b37f] hover:bg-[#8B4513]/20 hover:text-[#e8d5a9]"
          }
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
};
