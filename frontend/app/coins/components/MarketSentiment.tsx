"use client";

interface MarketSentimentProps {
  symbol: string;
  sentimentPercentage?: number;
}

const MarketSentiment = ({
  symbol,
  sentimentPercentage = 65,
}: MarketSentimentProps) => {
  return (
    <div className="bg-[#1a0f02]/60 p-3 rounded-lg border border-[#8B4513]/30">
      <div className="text-[#e8d5a9] mb-2">Market Sentiment</div>
      <div className="flex items-center">
        <div className="w-full bg-[#3c2611] h-2 rounded-full overflow-hidden">
          <div
            className="bg-amber-500 h-full"
            style={{ width: `${sentimentPercentage}%` }}
          ></div>
        </div>
        <div className="ml-2 text-amber-500 font-medium">
          {sentimentPercentage}%
        </div>
      </div>
      <div className="flex justify-between text-xs mt-1">
        <div className="text-amber-900">Mild</div>
        <div className="text-amber-400">Bold</div>
      </div>
    </div>
  );
};

export default MarketSentiment;
