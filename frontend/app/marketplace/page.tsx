"use client";

import { SiteHeader } from "../components/site-header";
import { Input } from "@/components/ui/input";
import {
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Globe,
  Twitter,
  Shield,
  TextIcon as Telegram,
  Clock,
  TrendingUp,
  Filter,
  ArrowUpDown,
  Wallet,
  AlertCircle,
  CupSoda,
  Loader2,
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import Image from "next/image";
import Link from "next/link";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { MarketFilters } from "../components/MarketFilters";
import type { Chain, FilterOption, MemeToken } from "../components/types";
import Marquee from "react-fast-marquee";
import { AppLayout } from "../components/app-layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTokenStore } from "../store/tokenStore";
import { getTokens, getPriceForTokens } from "@/services/memecoin-launchpad";
import { ethers, id } from "ethers";
import { error } from "console";
import page from "../page";
import { useTestTokenService } from "@/services/TestTokenService";
import { useAccount, useWalletClient } from "wagmi";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ButtonGroup } from "./components/ButtonGroup";

const DEFAULT_TOKEN_IMAGE = "/placeholder.svg";
const DEFAULT_CHAIN_LOGO = "/chain-placeholder.svg";

const chains: Chain[] = [
  {
    id: "bsc",
    name: "BSC",
    logo: "https://cryptologos.cc/logos/bnb-bnb-logo.png",
  },
  {
    id: "solana",
    name: "Solana",
    logo: "https://cryptologos.cc/logos/solana-sol-logo.png",
  },
  {
    id: "polygon",
    name: "Polygon",
    logo: "https://cryptologos.cc/logos/polygon-matic-logo.png",
  },
  {
    id: "avalanche",
    name: "Avalanche",
    logo: "https://cryptologos.cc/logos/avalanche-avax-logo.png",
  },
] as const;

const filterOptions: FilterOption[] = [
  { id: "latest", label: "Latest", icon: Clock },
  { id: "trending", label: "Trending", icon: TrendingUp },
] as const;

const mockTokens: MemeToken[] = [
  {
    name: "Doge Wisdom",
    symbol: "WISE",
    description: "Much wisdom, very insight, wow!",
    imageUrl:
      "https://i.kym-cdn.com/entries/icons/original/000/013/564/doge.jpg",
    price: "0",
    marketCap: "7.3k",
    priceChange: 0.41,
    fundingRaised: "0",
    chain: "ethereum",
  },
  {
    name: "Pepe Rare",
    symbol: "RARE",
    description: "The rarest Pepe in existence",
    imageUrl:
      "https://i.kym-cdn.com/entries/icons/original/000/017/618/pepefroggie.jpg",
    price: "0",
    marketCap: "7.3k",
    priceChange: -9.74,
    fundingRaised: "0",
    chain: "solana",
  },
  {
    name: "Wojak Finance",
    symbol: "WOJAK",
    description: "He bought? Dump it.",
    imageUrl:
      "https://i.kym-cdn.com/entries/icons/original/000/031/671/cover1.jpg",
    price: "0",
    marketCap: "7.3k",
    priceChange: -3.48,
    fundingRaised: "0",
    chain: "solana",
  },
  {
    name: "Cheems Bonk",
    symbol: "BONK",
    description: "The legendary Cheems brings good fortune",
    imageUrl:
      "https://i.kym-cdn.com/entries/icons/original/000/033/421/cover2.jpg",
    price: "0",
    marketCap: "7.3k",
    priceChange: 6.83,
    fundingRaised: "0",
    chain: "bsc",
  },
  {
    name: "Gigachad Token",
    symbol: "CHAD",
    description: "Yes, I buy memecoins. How could you tell?",
    imageUrl:
      "https://i.kym-cdn.com/entries/icons/original/000/026/152/gigachad.jpg",
    price: "0",
    marketCap: "7.3k",
    priceChange: 12.45,
    fundingRaised: "0",
    chain: "avalanche",
  },
  {
    name: "Stonks Master",
    symbol: "STONK",
    description: "Only goes up! Financial genius!",
    imageUrl:
      "https://i.kym-cdn.com/entries/icons/original/000/029/959/Screen_Shot_2019-06-05_at_1.26.32_PM.jpg",
    price: "0",
    marketCap: "7.3k",
    priceChange: 8.21,
    fundingRaised: "0",
    chain: "polygon",
  },
  {
    name: "Nyan Cat Classic",
    symbol: "NYAN",
    description: "Pop-tart cat traversing the galaxy",
    imageUrl:
      "https://i.kym-cdn.com/entries/icons/original/000/000/976/Nyan_Cat.jpg",
    price: "0",
    marketCap: "7.3k",
    priceChange: -5.67,
    fundingRaised: "0",
    chain: "ethereum",
  },
  {
    name: "This Is Fine",
    symbol: "FINE",
    description: "Everything is absolutely fine",
    imageUrl:
      "https://i.kym-cdn.com/entries/icons/original/000/018/012/this_is_fine.jpeg",
    price: "0",
    marketCap: "7.3k",
    priceChange: 3.92,
    fundingRaised: "0",
    chain: "bsc",
  },
  {
    name: "Distracted BF",
    symbol: "SIMP",
    description: "When you see another meme coin pumping",
    imageUrl:
      "https://i.kym-cdn.com/entries/icons/original/000/023/732/damngina.jpg",
    price: "0",
    marketCap: "8.1k",
    priceChange: 15.32,
    fundingRaised: "0",
    chain: "avalanche",
  },
  {
    name: "Moon Soon",
    symbol: "MOON",
    description: "To the moon! Any minute now...",
    imageUrl:
      "https://i.kym-cdn.com/entries/icons/original/000/022/444/hiltonmoon.jpg",
    price: "0",
    marketCap: "5.2k",
    priceChange: -2.15,
    fundingRaised: "0",
    chain: "polygon",
  },
  {
    name: "Galaxy Brain",
    symbol: "BRAIN",
    description: "Big brain moves only",
    imageUrl:
      "https://i.kym-cdn.com/entries/icons/original/000/030/525/cover5.png",
    price: "0",
    marketCap: "9.4k",
    priceChange: 7.84,
    fundingRaised: "0",
    chain: "ethereum",
  },
  {
    name: "Sad Pablo",
    symbol: "SAD",
    description: "When your portfolio is down bad",
    imageUrl:
      "https://i.kym-cdn.com/entries/icons/original/000/026/489/crying.jpg",
    price: "0",
    marketCap: "3.5k",
    priceChange: -12.45,
    fundingRaised: "0",
    chain: "solana",
  },
];

// Update the MemeToken interface to include the new properties
interface ExtendedMemeToken extends MemeToken {
  id?: string;
  token?: string;
  volume24h?: string;
  holders?: string;
  launchDate?: string;
  status?: "active" | "inactive" | "paused";
  creator?: string;
}

const TokenCard = ({
  token,
  index,
}: {
  token: ExtendedMemeToken;
  index: number;
}) => {
  const needsMarquee = token.name.length > 15;
  const [imageError, setImageError] = useState(false);

  // Determine the token identifier to use in the URL
  // Prefer token address if available, otherwise use symbol
  const tokenIdentifier = token.token || token.symbol;

  console.log(
    `TokenCard ${index} - Name: ${token.name}, Symbol: ${token.symbol}, Token ID: ${tokenIdentifier}`
  );

  return (
    <div className="w-full group">
      <div className="relative overflow-hidden border rounded-2xl border-[#8B4513]/40 bg-[#1a0f02]/90 backdrop-blur-xl shadow-md hover:shadow-[0_4px_12px_rgba(139,69,19,0.3)] transition-all">
        {/* Image Container */}
        <Link href={`/token/${tokenIdentifier}`} className="block">
          <div className="relative flex items-center justify-center overflow-hidden bg-[#3a1e0a] aspect-square">
            {/* Background placeholder */}
            <div
              className="absolute inset-0 w-full h-full"
              style={{
                backgroundImage: `url(${DEFAULT_TOKEN_IMAGE})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                opacity: imageError ? 1 : 0.5,
              }}
            />

            {/* Next.js Image with error handling */}
            {!imageError && (
              <Image
                src={
                  token.imageUrl && token.imageUrl.startsWith("http")
                    ? token.imageUrl
                    : token.imageUrl || DEFAULT_TOKEN_IMAGE
                }
                alt={token.name}
                width={400}
                height={400}
                className="absolute inset-0 object-cover w-full h-full"
                priority={index < 4}
                onError={() => setImageError(true)}
                unoptimized={
                  !!(token.imageUrl && token.imageUrl.startsWith("http"))
                }
                style={{ maxWidth: "100%" }}
              />
            )}

            {/* Price Change Badge */}
            <div className="absolute z-20 top-4 right-4">
              <div className="bg-[#1a0f02]/90 rounded-lg px-2.5 py-1 border border-[#8B4513]/40">
                <div className="flex items-center gap-1">
                  {token.priceChange > 0 ? (
                    <ArrowUpRight className="h-3.5 w-3.5 text-[#d4b37f]" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5 text-red-400" />
                  )}
                  <span
                    className={`text-[11px] font-medium ${
                      token.priceChange > 0 ? "text-[#d4b37f]" : "text-red-400"
                    }`}
                  >
                    {Math.abs(token.priceChange).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Link>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="flex items-center gap-1.5">
                  <Link href={`/token/${tokenIdentifier}`}>
                    <h3 className="text-sm font-medium text-[#e8d5a9] transition-colors hover:text-[#d4b37f]">
                      {needsMarquee ? (
                        <div className="w-[120px] overflow-hidden">
                          <Marquee gradient={false} speed={20}>
                            <span>{token.name}</span>
                            <span className="mx-2">•</span>
                          </Marquee>
                        </div>
                      ) : (
                        token.name
                      )}
                    </h3>
                  </Link>
                  <Badge
                    variant="secondary"
                    className="h-5 px-1.5 text-[10px] font-mono bg-[#8B4513]/40 text-[#d4b37f]"
                  >
                    ${token.symbol}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Badge
                  variant="outline"
                  className="h-5 px-1.5 text-[10px] font-mono bg-[#3a1e0a]/40 border-[#8B4513]/40 text-[#d4b37f]"
                >
                  Rank #{index + 1}
                </Badge>
                {index < 3 && (
                  <Badge className="h-5 px-1.5 text-[10px] bg-[#A0522D]/20 text-[#e8d5a9] border-[#8B4513]/40">
                    Trending
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-sm font-medium text-[#e8d5a9]">
                ${token.price}
              </div>
              <div className="text-[10px] text-[#d4b37f]/70">
                MC: ${token.marketCap}
              </div>
            </div>
          </div>

          <p className="mt-3 text-[13px] text-[#e8d5a9]/70 line-clamp-2">
            {token.description}
          </p>

          {/* Token Metrics */}
          <div className="grid grid-cols-2 gap-4 py-3 mt-3 border-y border-[#8B4513]/40">
            <div>
              <div className="text-[10px] text-[#d4b37f]/70 mb-0.5">
                Volume 24h
              </div>
              <div className="font-mono text-sm font-medium text-[#d4b37f]">
                {token.volume24h}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-[#d4b37f]/70 mb-0.5">
                Holders
              </div>
              <div className="font-mono text-sm font-medium text-[#8B4513]">
                {token.holders}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <button className="p-1.5 hover:bg-[#8B4513]/20 rounded-full transition-colors">
                <Globe className="h-3.5 w-3.5 text-[#d4b37f]/70 hover:text-[#e8d5a9]" />
              </button>
              <button className="p-1.5 hover:bg-[#8B4513]/20 rounded-full transition-colors">
                <Twitter className="h-3.5 w-3.5 text-[#d4b37f]/70 hover:text-[#e8d5a9]" />
              </button>
              <button className="p-1.5 hover:bg-[#8B4513]/20 rounded-full transition-colors">
                <Telegram className="h-3.5 w-3.5 text-[#d4b37f]/70 hover:text-[#e8d5a9]" />
              </button>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="h-3.5 w-3.5 text-[#d4b37f]" />
              <span className="text-[10px] text-[#e8d5a9]/70">Verified</span>
            </div>
          </div>

          {/* Buy Button */}
          <div className="mt-4">
            <Link href={`/token/${tokenIdentifier}`}>
              <Button
                className="w-full bg-[#8B4513] hover:bg-[#A0522D] text-[#e8d5a9] border border-[#8B4513]/60"
                size="sm"
              >
                Buy {token.symbol}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// First, add the missing utility functions
const formatDate = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

const randomAddress = (): string => {
  const chars = "0123456789abcdef";
  let result = "0x";
  for (let i = 0; i < 40; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

export default function MarketplacePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("latest"); // Changed to string to accommodate all filter values
  const [selectedChain, setSelectedChain] = useState<Chain | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [tokensPerPage, setTokensPerPage] = useState(12);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tokens, setTokens] = useState<ExtendedMemeToken[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  // Get the TestTokenService
  const testTokenService = useTestTokenService();
  const { data: walletClient } = useWalletClient();

  // Refs for infinite scroll
  const observer = useRef<IntersectionObserver>();
  const lastTokenElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setCurrentPage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading]
  );

  // Track if real tokens are available
  const [realTokens, setRealTokens] = useState<ExtendedMemeToken[]>([]);
  const [hasRealTokens, setHasRealTokens] = useState(false);

  // Calculate if there are more tokens to load
  const totalTokens = tokens.length;
  const hasMore = currentPage * tokensPerPage < totalTokens;

  // Update wallet connection status
  useEffect(() => {
    const isConnected = !!walletClient;
    setIsWalletConnected(isConnected);

    if (isConnected && !hasRealTokens) {
      // If wallet is connected and we don't have real tokens yet, fetch them
      fetchBlockchainTokens();
    }
  }, [walletClient]);

  // Use effect for initialization
  useEffect(() => {
    setIsMounted(true);
    fetchTokens();
  }, []);

  // Update tokens when filter, search, or chain changes
  useEffect(() => {
    if (isMounted) {
      setCurrentPage(1); // Reset to first page
      fetchTokens();
    }
  }, [activeFilter, searchTerm, selectedChain, isMounted, hasRealTokens]);

  // Load more tokens when page changes
  useEffect(() => {
    if (isMounted && currentPage > 1) {
      fetchMoreTokens();
    }
  }, [currentPage, isMounted]);

  // Function to fetch tokens from the blockchain
  async function fetchBlockchainTokens() {
    try {
      setIsLoading(true);
      setError(null);

      // Get tokens from the blockchain
      const blockchainTokens = await testTokenService.testGetTokens({
        isOpen: true,
      });

      if (!blockchainTokens || blockchainTokens.length === 0) {
        console.log("No blockchain tokens found");
        setHasRealTokens(false);
        setIsLoading(false);
        return;
      }

      // Process tokens and get prices
      const formattedTokensPromises = blockchainTokens.map(async (token) => {
        let tokenPrice = "0";
        if (token.isOpen) {
          try {
            const tokenSaleData = {
              token: token.token,
              name: token.name,
              creator: token.creator,
              sold: token.sold,
              raised: token.raised,
              isOpen: token.isOpen,
              metadataURI: token.image || "",
            };

            const price = await testTokenService.testGetPriceForTokens(
              tokenSaleData,
              BigInt(1)
            );
            tokenPrice = ethers.formatEther(price);
          } catch (error) {
            console.error(
              `Error fetching price for token ${token.name}:`,
              error
            );
            tokenPrice = "0";
          }
        }

        return {
          id: token.token,
          token: token.token,
          name: token.name,
          symbol: token.symbol || token.name.substring(0, 4).toUpperCase(),
          description: token.description || "No description available",
          imageUrl: token.image || DEFAULT_TOKEN_IMAGE,
          price: tokenPrice,
          marketCap: (Number(token.raised) / 1e18).toFixed(2) + "k",
          priceChange: Math.random() * 20 - 10, // Random for now
          fundingRaised: token.raised.toString(),
          chain: "ethereum",
          volume24h: "$" + (Math.random() * 100000).toFixed(2),
          holders: (Math.random() * 1000).toFixed(0),
          launchDate: new Date().toISOString().split("T")[0],
          status: "active" as const,
          creator: token.creator,
        };
      });

      const formattedTokens = await Promise.all(formattedTokensPromises);
      const validTokens = formattedTokens.filter(
        Boolean
      ) as ExtendedMemeToken[];

      if (validTokens.length > 0) {
        setRealTokens(validTokens);
        setHasRealTokens(true);
        // Update the tokens state with real tokens
        setTokens(validTokens);
      }
    } catch (error) {
      console.error("Error fetching blockchain tokens:", error);
      setHasRealTokens(false);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchTokens() {
    try {
      setIsLoading(true);
      setError(null);

      // If we have real tokens from the blockchain, use those
      if (hasRealTokens && realTokens.length > 0) {
        let filteredTokens = [...realTokens];

        // Apply chain filter (if blockchain supports multiple chains)
        if (selectedChain) {
          filteredTokens = filteredTokens.filter(
            (token) => token.chain === selectedChain.id
          );
        }

        // Apply search filter
        if (searchTerm) {
          const search = searchTerm.toLowerCase();
          filteredTokens = filteredTokens.filter(
            (token) =>
              token.name.toLowerCase().includes(search) ||
              token.symbol.toLowerCase().includes(search) ||
              (token.description &&
                token.description.toLowerCase().includes(search))
          );
        }

        // Apply sorting based on active filter
        switch (activeFilter) {
          case "trending":
            filteredTokens = filteredTokens.sort(
              (a, b) => Math.abs(b.priceChange) - Math.abs(a.priceChange)
            );
            break;
          case "gainers":
            filteredTokens = filteredTokens.sort(
              (a, b) => b.priceChange - a.priceChange
            );
            break;
          case "losers":
            filteredTokens = filteredTokens.sort(
              (a, b) => a.priceChange - b.priceChange
            );
            break;
          case "volume":
            filteredTokens = filteredTokens.sort((a, b) => {
              const aMarketCap =
                typeof a.marketCap === "string"
                  ? parseFloat(a.marketCap.replace(/[^\d.-]/g, ""))
                  : 0;
              const bMarketCap =
                typeof b.marketCap === "string"
                  ? parseFloat(b.marketCap.replace(/[^\d.-]/g, ""))
                  : 0;
              return bMarketCap - aMarketCap;
            });
            break;
          case "latest":
          default:
            // No additional sorting needed
            break;
        }

        // Paginate
        const paginatedTokens = filteredTokens.slice(0, tokensPerPage);
        setTokens(paginatedTokens);
      } else if (isWalletConnected) {
        // If wallet is connected but we don't have real tokens yet, fetch them
        await fetchBlockchainTokens();
      } else {
        // For wallet not connected, we could show a message or minimal set of mockTokens
        setTokens([]);
      }
    } catch (err) {
      console.error("Error fetching tokens:", err);
      setError("Failed to fetch tokens. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchMoreTokens() {
    try {
      setIsLoading(true);

      // Calculate correct pagination
      const startIndex = (currentPage - 1) * tokensPerPage;
      const endIndex = startIndex + tokensPerPage;

      // If we have real tokens, use those
      if (hasRealTokens && realTokens.length > 0) {
        let filteredTokens = [...realTokens];

        // Apply all filters same as fetchTokens
        if (selectedChain) {
          filteredTokens = filteredTokens.filter(
            (token) => token.chain === selectedChain.id
          );
        }

        if (searchTerm) {
          const search = searchTerm.toLowerCase();
          filteredTokens = filteredTokens.filter(
            (token) =>
              token.name.toLowerCase().includes(search) ||
              token.symbol.toLowerCase().includes(search) ||
              (token.description &&
                token.description.toLowerCase().includes(search))
          );
        }

        // Apply the same sorting
        switch (activeFilter) {
          case "trending":
            filteredTokens = filteredTokens.sort(
              (a, b) => Math.abs(b.priceChange) - Math.abs(a.priceChange)
            );
            break;
          case "gainers":
            filteredTokens = filteredTokens.sort(
              (a, b) => b.priceChange - a.priceChange
            );
            break;
          case "losers":
            filteredTokens = filteredTokens.sort(
              (a, b) => a.priceChange - b.priceChange
            );
            break;
          case "volume":
            filteredTokens = filteredTokens.sort((a, b) => {
              const aMarketCap =
                typeof a.marketCap === "string"
                  ? parseFloat(a.marketCap.replace(/[^\d.-]/g, ""))
                  : 0;
              const bMarketCap =
                typeof b.marketCap === "string"
                  ? parseFloat(b.marketCap.replace(/[^\d.-]/g, ""))
                  : 0;
              return bMarketCap - aMarketCap;
            });
            break;
        }

        // Get the next page of tokens
        const nextPageTokens = filteredTokens.slice(startIndex, endIndex);

        // Append to existing tokens
        setTokens((prev) => [...prev, ...nextPageTokens]);
      }
    } catch (error) {
      console.error("Error fetching more tokens:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <AppLayout>
      <div className="relative z-10">
        <div className="container py-8">
          <div className="flex flex-col items-start justify-between gap-4 mb-8 md:flex-row md:items-center">
            <div>
              <h1 className="text-4xl font-bold">
                Meme Token{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4b37f] to-[#8B4513]">
                  Marketplace
                </span>
              </h1>
              <p className="mt-2 text-[#e8d5a9]/70">
                Discover and invest in the latest meme tokens
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[#d4b37f]" />
                <Input
                  type="search"
                  placeholder="Search tokens..."
                  className="pl-8 w-[200px] md:w-[300px] border-[#8B4513]/40 bg-[#1a0f02]/60 text-[#e8d5a9] placeholder-[#d4b37f]/50 focus-visible:ring-[#d4b37f] rounded-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                className="border-[#8B4513]/40 bg-[#1a0f02]/60 text-[#d4b37f] hover:bg-[#8B4513]/20 hover:text-[#e8d5a9] hover:border-[#8B4513]"
              >
                <Filter className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="border-[#8B4513]/40 bg-[#1a0f02]/60 text-[#d4b37f] hover:bg-[#8B4513]/20 hover:text-[#e8d5a9] hover:border-[#8B4513]"
              >
                <ArrowUpDown className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Wallet Warning - show when wallet is not connected */}
          {!isWalletConnected && !isLoading && (
            <div className="mb-8">
              <Alert
                variant="default"
                className="bg-[#8B4513]/10 border-[#8B4513]/30"
              >
                <Wallet className="h-5 w-5 text-[#d4b37f]" />
                <AlertTitle className="text-[#e8d5a9]">
                  Wallet Not Connected
                </AlertTitle>
                <AlertDescription className="text-[#e8d5a9]/70">
                  Connect your wallet to see real tokens from the blockchain.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Show a message if wallet is connected but no tokens found */}
          {isWalletConnected && !isLoading && tokens.length === 0 && (
            <div className="mb-8">
              <Alert
                variant="default"
                className="bg-[#8B4513]/10 border-[#8B4513]/30"
              >
                <CupSoda className="h-5 w-5 text-[#d4b37f]" />
                <AlertTitle className="text-[#e8d5a9]">
                  No Tokens Found
                </AlertTitle>
                <AlertDescription className="text-[#e8d5a9]/70">
                  No tokens are currently available. Create the first one by
                  clicking "Create a Token"!
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Token Grid */}
          <div className="mb-8">
            {isLoading && tokens.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 mb-4 animate-spin text-[#d4b37f]" />
                <p className="text-[#e8d5a9]/70">Loading tokens...</p>
              </div>
            ) : error ? (
              <div className="p-4 rounded-md bg-[#A0522D]/20 border border-[#A0522D]/40">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle
                      className="w-5 h-5 text-[#A0522D]"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-[#e8d5a9]">
                      Error
                    </h3>
                    <div className="mt-2 text-sm text-[#e8d5a9]/70">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : tokens.length === 0 ? (
              <div className="p-8 text-center border rounded-md bg-[#1a0f02]/70 border-[#8B4513]/40">
                <CupSoda className="w-12 h-12 mx-auto mb-4 text-[#d4b37f]" />
                <h3 className="text-lg font-medium text-[#e8d5a9]">
                  No Beans Found
                </h3>
                <p className="mt-2 text-[#e8d5a9]/70">
                  No tokens match your search criteria. Try adjusting your
                  filters.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {tokens.map((token, index) => {
                    // Add ref to last element for infinite scroll
                    const isLastElement = index === tokens.length - 1;
                    return isLastElement ? (
                      <div
                        key={`${token.id}-${index}`}
                        ref={lastTokenElementRef as any}
                      >
                        <TokenCard token={token} index={index} />
                      </div>
                    ) : (
                      <div key={`${token.id}-${index}`}>
                        <TokenCard token={token} index={index} />
                      </div>
                    );
                  })}
                </div>

                {/* Loading indicator for infinite scroll */}
                {isLoading && tokens.length > 0 && (
                  <div className="flex justify-center mt-8">
                    <Loader2 className="w-8 h-8 animate-spin text-[#d4b37f]" />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
