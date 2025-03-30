"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { ethers } from "ethers";
import { AppLayout } from "../../components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowUpDown,
  ChevronDown,
  Copy,
  ExternalLink,
  Eye,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Share2,
  Trash,
  TrendingUp,
  TrendingDown,
  Rocket,
  Users,
  DollarSign,
  LinkIcon,
  Settings,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useTokenStore } from "../../store/tokenStore";
import { useTestTokenService } from "@/services/TestTokenService";
import {
  getTokens,
  getPriceForTokens,
  getPurchasedTokens,
  getTokenBalance,
} from "@/services/memecoin-launchpad";
import { useRouter } from "next/navigation";
import { useWallet } from "@/app/providers/WalletProvider";
import { toast } from "@/components/ui/use-toast";
import { useAccount, useWalletClient } from "wagmi";

export default function TokensPage() {
  // All hooks at the top level
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [tokenTypeTab, setTokenTypeTab] = useState("created");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>({ key: "value", direction: "desc" });
  const [isLoading, setIsLoading] = useState(true);
  const [createdTokens, setCreatedTokens] = useState<any[]>([]);
  const [purchasedTokens, setPurchasedTokens] = useState<any[]>([]);
  const [showConnectPrompt, setShowConnectPrompt] = useState(false);

  const testTokenService = useTestTokenService();
  const router = useRouter();
  const { networkName, isMetaMaskInstalled, connect } = useWallet();
  const { isConnected } = useAccount();
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const dataFetched = useRef(false);
  const { data: walletClient } = useWalletClient();

  // Handle connect wallet
  const handleConnectWallet = useCallback(async () => {
    try {
      await connect();
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      toast({
        title: "Error",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      });
    }
  }, [connect]);

  // Update wallet connection status and trigger fetch
  useEffect(() => {
    const isConnected = !!walletClient;
    setIsWalletConnected(isConnected);

    if (isConnected) {
      // Reset dataFetched when wallet connects
      dataFetched.current = false;
      handleRefresh();
    }
  }, [walletClient]);

  // Manual refresh function
  const handleRefresh = useCallback(() => {
    dataFetched.current = false;
    setIsLoading(true);
  }, []);

  // Fetch tokens effect
  useEffect(() => {
    if (!isWalletConnected || dataFetched.current) return;

    async function fetchAllTokens() {
      try {
        setIsLoading(true);
        dataFetched.current = true;

        const [createdTokensData, purchasedTokensData] = await Promise.all([
          testTokenService.testGetTokens({ isCreator: true }).catch((error) => {
            console.error("Error fetching created tokens:", error);
            return [];
          }),
          testTokenService.testGetPurchasedTokens().catch((error) => {
            console.error("Error fetching purchased tokens:", error);
            return [];
          }),
        ]);

        // Process created tokens
        const processedCreatedTokens = await Promise.all(
          (createdTokensData || []).map(async (token) => {
            try {
              let tokenPrice = "0";
              if (token.isOpen) {
                try {
                  const tokenSaleData = {
                    token: token.token,
                    name: token.name || "Unknown Token",
                    creator: token.creator,
                    sold: token.sold || "0",
                    raised: token.raised || "0",
                    isOpen: token.isOpen,
                    metadataURI: token.image || "",
                  };

                  const price = await testTokenService
                    .testGetPriceForTokens(tokenSaleData, BigInt(1))
                    .catch(() => BigInt(0));
                  tokenPrice = ethers.formatEther(price);
                } catch (error) {
                  console.error(
                    `Error fetching price for token ${token.name}:`,
                    error
                  );
                }
              }

              return {
                id: token.token,
                token: token.token,
                name: token.name || "Unknown Token",
                symbol: (token.name || "UNKN").substring(0, 4).toUpperCase(),
                description: token.description || "No description available",
                imageUrl: token.image || "/placeholder.svg",
                price: tokenPrice,
                marketCap:
                  (Number(token.raised || "0") / 1e18).toFixed(2) + "k",
                priceChange: 5.0,
                fundingRaised: token.raised?.toString() || "0",
                chain: "Sonic",
                volume24h: "$1,000.00",
                holders: "1000",
                launchDate: "2023-01-01",
                status: token.isOpen ? "active" : "locked",
                creator: token.creator,
                type: "created",
              };
            } catch (error) {
              console.error("Error processing created token:", error);
              return null;
            }
          })
        );

        // Process purchased tokens
        const processedPurchasedTokens = await Promise.all(
          (purchasedTokensData || []).map(async (token) => {
            try {
              let tokenPrice = "0";
              if (token.isOpen) {
                try {
                  const tokenSaleData = {
                    token: token.token,
                    name: token.name || "Unknown Token",
                    creator: token.creator,
                    sold: token.sold || "0",
                    raised: token.raised || "0",
                    isOpen: token.isOpen,
                    metadataURI: token.image || "",
                  };

                  const price = await testTokenService
                    .testGetPriceForTokens(tokenSaleData, BigInt(1))
                    .catch(() => BigInt(0));
                  tokenPrice = ethers.formatEther(price);
                } catch (error) {
                  console.error(
                    `Error fetching price for token ${token.name}:`,
                    error
                  );
                }
              }

              return {
                id: token.token,
                token: token.token,
                name: token.name || "Unknown Token",
                symbol: (token.name || "UNKN").substring(0, 4).toUpperCase(),
                description: token.description || "No description available",
                imageUrl: token.image || "/placeholder.svg",
                price: tokenPrice,
                marketCap:
                  (Number(token.raised || "0") / 1e18).toFixed(2) + "k",
                priceChange: 5.0,
                fundingRaised: token.raised?.toString() || "0",
                chain: "Sonic",
                volume24h: "$100,000.00",
                holders: "1000",
                launchDate: "2023-01-01",
                status: token.isOpen ? "active" : "locked",
                balance: token.balance
                  ? ethers.formatEther(token.balance)
                  : "0",
                type: "purchased",
              };
            } catch (error) {
              console.error("Error processing purchased token:", error);
              return null;
            }
          })
        );

        // Update state with filtered results
        setCreatedTokens(processedCreatedTokens.filter(Boolean));
        setPurchasedTokens(processedPurchasedTokens.filter(Boolean));
      } catch (error) {
        console.error("Error fetching tokens:", error);
        toast({
          title: "Error",
          description:
            error instanceof Error ? error.message : "Failed to load tokens.",
          variant: "destructive",
        });
        // Reset data fetched flag on error to allow retrying
        dataFetched.current = false;
      } finally {
        setIsLoading(false);
      }
    }

    fetchAllTokens();
  }, [isWalletConnected, testTokenService]);

  // Memoized values
  const tokens = useMemo(() => {
    return tokenTypeTab === "created" ? createdTokens : purchasedTokens;
  }, [tokenTypeTab, createdTokens, purchasedTokens]);

  // Sort tokens to show purchased tokens first
  const sortedTokens = useMemo(() => {
    let filteredTokens = [...tokens];

    // Apply tab filter
    if (activeTab !== "all") {
      filteredTokens = filteredTokens.filter(
        (token) => token.status === activeTab
      );
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      filteredTokens = filteredTokens.filter(
        (token) =>
          token.name.toLowerCase().includes(lowerCaseQuery) ||
          token.symbol.toLowerCase().includes(lowerCaseQuery)
      );
    }

    // Sort tokens - purchased tokens first, then by sortConfig
    return filteredTokens.sort((a, b) => {
      // First by purchased status
      const aPurchased = purchasedTokens.some((token) => token.token === a.id);
      const bPurchased = purchasedTokens.some((token) => token.token === b.id);

      if (aPurchased && !bPurchased) return -1;
      if (!aPurchased && bPurchased) return 1;

      // Then by sort config
      const aValue = a[sortConfig.key as keyof typeof a] as string | number;
      const bValue = b[sortConfig.key as keyof typeof b] as string | number;

      if (sortConfig.direction === "asc") {
        return typeof aValue === "string" && typeof bValue === "string"
          ? aValue.localeCompare(bValue)
          : (aValue as number) - (bValue as number);
      } else {
        return typeof aValue === "string" && typeof bValue === "string"
          ? bValue.localeCompare(aValue)
          : (bValue as number) - (aValue as number);
      }
    });
  }, [tokens, activeTab, searchQuery, sortConfig, purchasedTokens]);

  // Find best and worst performers
  const bestPerformer =
    tokens.length > 0
      ? [...tokens].reduce(
          (best, token) =>
            token.priceChange > best.priceChange ? token : best,
          tokens[0]
        )
      : null;

  const worstPerformer =
    tokens.length > 0
      ? [...tokens].reduce(
          (worst, token) =>
            token.priceChange < worst.priceChange ? token : worst,
          tokens[0]
        )
      : null;

  // Calculate total volume
  const totalVolume = tokens.reduce((sum, token) => {
    const volumeNumber = parseFloat(token.volume24h.replace(/[^0-9.]/g, ""));
    return (sum + volumeNumber) / 100;
  }, 0);

  // Get chain from wallet if available, otherwise use Sonic as fallback
  const getChainFromWallet = () => {
    if (networkName && networkName.includes("Sonic")) {
      return "Sonic";
    }
    return "Sonic";
  };

  // Render functions
  const renderMetaMaskPrompt = () => (
    <AppLayout>
      <div className="container py-8">
        <Card className="border-[#8B4513]/30 bg-[#1a0f02]/90 backdrop-blur-xl">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wallet className="h-12 w-12 text-[#d4b37f] mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-[#e8d5a9]">
              Wallet Not Available
            </h2>
            <p className="text-[#e8d5a9]/70 mb-6">
              Please install MetaMask to view your tokens
            </p>
            <Button
              onClick={() =>
                window.open("https://metamask.io/download/", "_blank")
              }
              className="bg-[#8B4513] hover:bg-[#A0522D] text-[#e8d5a9] border border-[#d4b37f]/20 transition-all"
            >
              Install MetaMask
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );

  const renderConnectPrompt = () => (
    <AppLayout>
      <div className="container py-8">
        <Card className="border-[#8B4513]/30 bg-[#1a0f02]/90 backdrop-blur-xl">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wallet className="h-12 w-12 text-[#d4b37f] mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-[#e8d5a9]">
              Connect Your Wallet
            </h2>
            <p className="text-[#e8d5a9]/70 mb-6">
              Please connect your wallet to view your tokens
            </p>
            <Button
              onClick={handleConnectWallet}
              className="bg-[#8B4513] hover:bg-[#A0522D] text-[#e8d5a9] border border-[#d4b37f]/20 transition-all"
            >
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );

  // Early returns using memoized conditions
  if (!isMetaMaskInstalled) {
    return renderMetaMaskPrompt();
  }

  if (showConnectPrompt) {
    return renderConnectPrompt();
  }

  // Main render
  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-b from-[#1a0f02] to-[#2c1809] overflow-hidden">
        <div className="container max-w-7xl mx-auto px-4 py-8 relative z-10">
          {/* Check wallet connection */}
          {!isMetaMaskInstalled ? (
            renderMetaMaskPrompt()
          ) : isWalletConnected ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Header section */}
              <div className="relative mb-12 pb-6 border-b border-[#8B4513]/30">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                  <div>
                    <h1 className="text-4xl font-bold mb-2">
                      My{" "}
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4b37f] to-[#8B4513]">
                        Tokens
                      </span>
                    </h1>
                    <p className="text-lg text-[#e8d5a9]/70">
                      Manage and monitor your token portfolio
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link href="/launch">
                      <Button className="bg-[#8B4513] hover:bg-[#A0522D] text-[#e8d5a9] border border-[#d4b37f]/20 transition-all">
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Token
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Token Type Tabs */}
              <div className="mb-8">
                <Tabs
                  value={tokenTypeTab}
                  onValueChange={setTokenTypeTab}
                  className="w-full"
                >
                  <TabsList className="bg-[#3a1e0a]/50 p-1 rounded-lg grid w-full max-w-md mx-auto grid-cols-2">
                    <TabsTrigger
                      value="created"
                      className="data-[state=active]:bg-[#8B4513] text-[#e8d5a9] flex items-center gap-2"
                    >
                      <Rocket className="w-4 h-4" />
                      Created Tokens
                    </TabsTrigger>
                    <TabsTrigger
                      value="purchased"
                      className="data-[state=active]:bg-[#8B4513] text-[#e8d5a9] flex items-center gap-2"
                    >
                      <Wallet className="w-4 h-4" />
                      Purchased Tokens
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Stats Cards */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-8">
                <Card className="bg-[#1a0f02]/90 border-[#8B4513]/30 hover:border-[#d4b37f]/50 transition-all hover:transform hover:scale-[1.02] cursor-pointer shadow-md hover:shadow-[0_4px_12px_rgba(139,69,19,0.3)]">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Rocket className="w-5 h-5 text-[#d4b37f]" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-[#e8d5a9]/70">Total Tokens</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold text-[#d4b37f]">
                          {tokens.length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#1a0f02]/90 border-[#8B4513]/30 hover:border-[#d4b37f]/50 transition-all hover:transform hover:scale-[1.02] cursor-pointer shadow-md hover:shadow-[0_4px_12px_rgba(139,69,19,0.3)]">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Users className="w-5 h-5 text-[#A0522D]" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-[#e8d5a9]/70">Total Holders</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold text-[#A0522D]">
                          3,617
                        </p>
                        <span className="text-sm text-green-500">+12.5%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#1a0f02]/90 border-[#8B4513]/30 hover:border-[#d4b37f]/50 transition-all hover:transform hover:scale-[1.02] cursor-pointer shadow-md hover:shadow-[0_4px_12px_rgba(139,69,19,0.3)]">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <DollarSign className="w-5 h-5 text-[#8B4513]" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-[#e8d5a9]/70">Total Volume</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold text-[#8B4513]">
                          ${totalVolume.toLocaleString()}
                        </p>
                        <span className="text-sm text-green-500">+8.3%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#1a0f02]/90 border-[#8B4513]/30 hover:border-[#d4b37f]/50 transition-all hover:transform hover:scale-[1.02] cursor-pointer shadow-md hover:shadow-[0_4px_12px_rgba(139,69,19,0.3)]">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <TrendingUp className="w-5 h-5 text-[#d4b37f]" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-[#e8d5a9]/70">24h Volume</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold text-[#d4b37f]">
                          $15,840
                        </p>
                        <span className="text-sm text-red-500">-3.2%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#1a0f02]/90 border-[#8B4513]/30 hover:border-[#d4b37f]/50 transition-all hover:transform hover:scale-[1.02] cursor-pointer shadow-md hover:shadow-[0_4px_12px_rgba(139,69,19,0.3)]">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <TrendingUp className="w-5 h-5 text-[#A0522D]" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-[#e8d5a9]/70">
                        Best Performer
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="text-2xl font-bold text-[#A0522D]">
                          {bestPerformer?.symbol}
                        </div>
                        <Badge
                          variant="default"
                          className="bg-green-500/20 text-green-500"
                        >
                          +{bestPerformer?.priceChange.toFixed(2)}%
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#1a0f02]/90 border-[#8B4513]/30 hover:border-[#d4b37f]/50 transition-all hover:transform hover:scale-[1.02] cursor-pointer shadow-md hover:shadow-[0_4px_12px_rgba(139,69,19,0.3)]">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <TrendingDown className="w-5 h-5 text-[#e8d5a9]" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-[#e8d5a9]/70">
                        Worst Performer
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="text-2xl font-bold text-[#e8d5a9]">
                          {worstPerformer?.symbol}
                        </div>
                        <Badge
                          variant="destructive"
                          className="bg-red-500/20 text-red-500"
                        >
                          {worstPerformer?.priceChange.toFixed(2)}%
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Filters and Search */}
              <div className="bg-[#3a1e0a]/30 rounded-xl p-6 mb-8 border border-[#8B4513]/30">
                <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center mb-6">
                  <Tabs
                    defaultValue="all"
                    className="w-full md:w-auto"
                    onValueChange={setActiveTab}
                  >
                    <TabsList className="bg-[#1a0f02]/50 p-1">
                      <TabsTrigger
                        value="all"
                        className="data-[state=active]:bg-[#8B4513] text-[#e8d5a9]"
                      >
                        All Tokens
                      </TabsTrigger>
                      <TabsTrigger
                        value="active"
                        className="data-[state=active]:bg-[#8B4513] text-[#e8d5a9]"
                      >
                        Active
                      </TabsTrigger>
                      <TabsTrigger
                        value="locked"
                        className="data-[state=active]:bg-[#8B4513] text-[#e8d5a9]"
                      >
                        Locked
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <div className="flex w-full md:w-auto gap-2">
                    <div className="relative flex-1 md:w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#d4b37f]" />
                      <Input
                        type="search"
                        placeholder="Search tokens..."
                        className="pl-10 bg-[#1a0f02]/50 border-[#8B4513]/30 focus:border-[#d4b37f]/50 transition-colors text-[#e8d5a9]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="border-[#8B4513]/30 hover:border-[#d4b37f]/50 bg-[#1a0f02]/50 transition-colors"
                        >
                          <Filter className="w-4 h-4 text-[#d4b37f]" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-56 bg-[#1a0f02]/95 border-[#8B4513]/30"
                      >
                        <DropdownMenuLabel className="text-xs text-[#e8d5a9]/70">
                          Filter By
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-[#8B4513]/30" />
                        <DropdownMenuItem className="hover:bg-[#3a1e0a]/50 text-[#e8d5a9]">
                          Newest First
                        </DropdownMenuItem>
                        <DropdownMenuItem className="hover:bg-[#3a1e0a]/50 text-[#e8d5a9]">
                          Oldest First
                        </DropdownMenuItem>
                        <DropdownMenuItem className="hover:bg-[#3a1e0a]/50 text-[#e8d5a9]">
                          Highest Market Cap
                        </DropdownMenuItem>
                        <DropdownMenuItem className="hover:bg-[#3a1e0a]/50 text-[#e8d5a9]">
                          Most Holders
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Token Table */}
                <div className="rounded-lg overflow-hidden border border-[#8B4513]/30">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-[#8B4513]/30 bg-[#3a1e0a]/60">
                        <TableHead className="text-xs font-medium text-[#e8d5a9]/70 uppercase">
                          Token
                        </TableHead>
                        <TableHead className="text-xs font-medium text-[#e8d5a9]/70 uppercase">
                          Price
                        </TableHead>
                        {tokenTypeTab === "purchased" && (
                          <TableHead className="text-xs font-medium text-[#e8d5a9]/70 uppercase">
                            Balance
                          </TableHead>
                        )}
                        <TableHead className="hidden text-xs font-medium text-[#e8d5a9]/70 uppercase md:table-cell">
                          Market Cap
                        </TableHead>
                        <TableHead className="hidden text-xs font-medium text-[#e8d5a9]/70 uppercase md:table-cell">
                          Holders
                        </TableHead>
                        <TableHead className="hidden text-xs font-medium text-[#e8d5a9]/70 uppercase md:table-cell">
                          24h Volume
                        </TableHead>
                        <TableHead className="hidden text-xs font-medium text-[#e8d5a9]/70 uppercase lg:table-cell">
                          Launch Date
                        </TableHead>
                        <TableHead className="hidden text-xs font-medium text-[#e8d5a9]/70 uppercase lg:table-cell">
                          Chain
                        </TableHead>
                        <TableHead className="hidden text-xs font-medium text-[#e8d5a9]/70 uppercase lg:table-cell">
                          Status
                        </TableHead>
                        <TableHead className="text-xs font-medium text-[#e8d5a9]/70 uppercase">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedTokens &&
                        sortedTokens.map((token) => (
                          <TableRow
                            key={token.id}
                            className="border-b border-[#8B4513]/30 hover:bg-[#3a1e0a]/30 transition-colors cursor-pointer"
                            onClick={() =>
                              router.push(`/token/${token.symbol}`)
                            }
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <img
                                  src={token.imageUrl || "/placeholder.svg"}
                                  alt={token.name}
                                  className="w-10 h-10 rounded-full border border-[#8B4513]/30"
                                />
                                <div>
                                  <div className="font-medium text-[#e8d5a9]">
                                    {token.name}
                                  </div>
                                  <div className="text-sm text-[#e8d5a9]/70">
                                    {token.symbol}
                                  </div>
                                  <div className="text-xs text-[#d4b37f]/50 mt-0.5 max-w-[150px] truncate">
                                    {token.description}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium text-[#e8d5a9]">
                                {token.price}
                              </div>
                              <div
                                className={`text-sm flex items-center ${
                                  token.priceChange >= 0
                                    ? "text-green-500"
                                    : "text-red-500"
                                }`}
                              >
                                {token.priceChange >= 0 ? (
                                  <TrendingUp className="w-3 h-3 mr-1" />
                                ) : (
                                  <TrendingDown className="w-3 h-3 mr-1" />
                                )}
                                {token.priceChange >= 0 ? "+" : ""}
                                {token.priceChange}%
                              </div>
                            </TableCell>
                            {tokenTypeTab === "purchased" && (
                              <TableCell>
                                <div className="font-medium">
                                  {token.balance}
                                </div>
                                <div className="text-xs text-gray-500">
                                  $
                                  {(
                                    parseFloat(token.balance) *
                                    parseFloat(token.price)
                                  ).toFixed(2)}
                                </div>
                              </TableCell>
                            )}
                            <TableCell className="hidden md:table-cell">
                              <div className="font-medium">
                                {token.marketCap}
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <div className="font-medium">{token.holders}</div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <div className="font-medium">
                                {token.volume24h}
                              </div>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <div className="font-medium">
                                {token.launchDate}
                              </div>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <Badge
                                variant="outline"
                                className="bg-[#1a0f02]/70 border-[#8B4513]/50 text-[#d4b37f]"
                              >
                                {getChainFromWallet()}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <Badge
                                variant={
                                  token.status === "active"
                                    ? "default"
                                    : "secondary"
                                }
                                className={
                                  token.status === "active"
                                    ? "bg-[#3a1e0a]/50 text-[#d4b37f] hover:bg-[#3a1e0a]/70"
                                    : "bg-[#1a0f02]/70 text-[#8B4513]"
                                }
                              >
                                {token.status === "active"
                                  ? "Active"
                                  : "Locked"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-full"
                                  >
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="w-56 bg-[#1a0f02]/95 border-[#8B4513]/30"
                                >
                                  <DropdownMenuLabel className="text-xs text-[#e8d5a9]/70">
                                    Token Actions
                                  </DropdownMenuLabel>
                                  <DropdownMenuSeparator className="bg-[#8B4513]/30" />
                                  <DropdownMenuItem className="flex items-center gap-2 text-sm cursor-pointer hover:bg-[#3a1e0a]/50 text-[#e8d5a9]">
                                    <Rocket className="w-4 h-4 text-[#d4b37f]" />
                                    <span>Boost Marketing</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="flex items-center gap-2 text-sm cursor-pointer hover:bg-[#3a1e0a]/50 text-[#e8d5a9]">
                                    <Users className="w-4 h-4 text-[#A0522D]" />
                                    <span>View Holders</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="flex items-center gap-2 text-sm cursor-pointer hover:bg-[#3a1e0a]/50 text-[#e8d5a9]">
                                    <DollarSign className="w-4 h-4 text-[#8B4513]" />
                                    <span>Add Liquidity</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="flex items-center gap-2 text-sm cursor-pointer hover:bg-[#3a1e0a]/50 text-[#e8d5a9]">
                                    <LinkIcon className="w-4 h-4 text-[#d4b37f]" />
                                    <span>View on Explorer</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="flex items-center gap-2 text-sm cursor-pointer hover:bg-[#3a1e0a]/50 text-[#e8d5a9]">
                                    <Share2 className="w-4 h-4 text-[#8B4513]" />
                                    <span>Share Token</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="bg-[#8B4513]/30" />
                                  <DropdownMenuItem className="flex items-center gap-2 text-sm cursor-pointer hover:bg-[#3a1e0a]/50 text-[#e8d5a9]">
                                    <Settings className="w-4 h-4 text-[#e8d5a9]/70" />
                                    <span>Token Settings</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </motion.div>
          ) : (
            renderConnectPrompt()
          )}
        </div>
      </div>
    </AppLayout>
  );
}
