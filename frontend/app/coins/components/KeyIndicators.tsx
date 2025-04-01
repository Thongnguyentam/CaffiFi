"use client";

interface KeyIndicatorsProps {
  symbol: string;
}

const KeyIndicators = ({ symbol }: KeyIndicatorsProps) => {
  // Mock data for key indicators
  const indicators = {
    rsi: 58.3,
    macd: "Strong",
    ma: "Golden Brew",
    volume: "+12% (24h)",
  };

  return (
    <div className="bg-[#1a0f02]/60 p-3 rounded-lg border border-[#8B4513]/30">
      <div className="text-[#e8d5a9] mb-2">Key Indicators</div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <div className="text-[#e8d5a9]/70">RSI (14)</div>
          <div className="text-[#e8d5a9]">{indicators.rsi}</div>
        </div>
        <div className="flex justify-between">
          <div className="text-[#e8d5a9]/70">Strength</div>
          <div className="text-amber-500">{indicators.macd}</div>
        </div>
        <div className="flex justify-between">
          <div className="text-[#e8d5a9]/70">MA (50/200)</div>
          <div className="text-amber-500">{indicators.ma}</div>
        </div>
        <div className="flex justify-between">
          <div className="text-[#e8d5a9]/70">Volume</div>
          <div className="text-amber-500">{indicators.volume}</div>
        </div>
      </div>
    </div>
  );
};

export default KeyIndicators;
