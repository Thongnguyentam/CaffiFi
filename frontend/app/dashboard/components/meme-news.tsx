"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import type { NewsItem } from "@/app/types/news";
import { fetchNewsItems } from "@/app/lib/news";
import { Coffee, CupSoda } from "lucide-react";

export function MemeNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setIsLoading(true);
        const data = await fetchNewsItems();
        // Check if data is an array, otherwise use empty array
        if (Array.isArray(data)) {
          setNews(data);
        } else {
          console.error("API did not return an array:", data);
          setNews([]);
          if (data.error) {
            setError(data.error);
          } else {
            setError("Failed to load news data");
          }
        }
      } catch (err) {
        console.error("Error fetching news:", err);
        setNews([]);
        setError("Failed to fetch news");
      } finally {
        setIsLoading(false);
      }
    };
    fetchNews();
  }, []);

  const myLoader = ({ src }: { src: string }) => {
    return src;
  };

  return (
    <div className="mt-6 space-y-6">
      <h1 className="text-2xl font-bold flex items-center text-[#e8d5a9]">
        <Coffee className="h-5 w-5 mr-2 text-[#d4b37f]" />
        Coffee <span className="text-[#d4b37f] ml-2">Brews</span>
      </h1>
      {/* News List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-4 text-center text-[#e8d5a9]/70">
            Brewing news...
          </div>
        ) : error ? (
          <div className="py-4 text-center text-[#a05c35]">{error}</div>
        ) : news.length === 0 ? (
          <div className="py-4 text-center text-[#e8d5a9]/70">
            No fresh brews available
          </div>
        ) : (
          // Limit to maximum 4 news items
          news.slice(0, 4).map((item, index) => (
            <div
              key={index}
              className="flex gap-3 p-3 transition-colors rounded-lg cursor-pointer hover:bg-[#8B4513]/20 border border-[#8B4513]/20 hover:border-[#8B4513]/40"
            >
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-[#d4b37f]">
                    {item.source.name}
                  </span>
                  <span className="text-xs text-[#e8d5a9]/50">
                    {item.publishedAt}
                  </span>
                </div>
                <h3 className="mb-1 text-sm font-medium text-[#e8d5a9]">
                  {item.title}
                </h3>
                <p className="text-xs text-[#d4b37f]/80">{item.author}</p>
              </div>
              <div className="relative flex-shrink-0 w-16 h-16 overflow-hidden rounded-md border border-[#8B4513]/40">
                <Image
                  src={item.urlToImage || "/coffeebean.png"}
                  loader={myLoader}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
