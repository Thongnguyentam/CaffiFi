"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { AppLayout } from "@/app/components/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ethers } from "ethers";
// import {
//   getTokens,
//   buyToken,
//   getPriceForTokens,
// } from "@/services/memecoin-launchpad";
import { useToast } from "@/components/ui/use-toast";
import {
  TrendingUp,
  TrendingDown,
  Globe,
  Twitter,
  MessageSquare as Telegram,
  Copy,
  Loader2,
  Rocket,
  BarChart3,
  AlertCircle,
  ArrowLeft,
  Share2,
  Star,
} from "lucide-react";
import { title } from "process";
import { useTestTokenService } from "@/services/TestTokenService";

const DEFAULT_TOKEN_IMAGE = "/placeholder.svg";

interface TokenApiResponse {
  success: boolean;
  data: {
    token: {
      token: string;
      name: string;
      creator: string;
      sold: string;
      raised: number;
      isOpen: boolean;
      image: string;
      description: string;
      symbol: string;
    };
    marketData: {
      price: string;
      marketCap: string;
      volume24h: string;
      holders: number;
    };
  };
}

export default function TokenDetailPage() {
  const params = useParams();
  const { toast } = useToast();
  const symbol = params.symbol as string;

  const [token, setToken] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [buyAmount, setBuyAmount] = useState("1");
  const [isBuying, setIsBuying] = useState(false);
  const [isStarred, setIsStarred] = useState(false);
  const [notFoundError, setNotFoundError] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState<string>("0");
  const [isPriceLoading, setIsPriceLoading] = useState(false);
  const [isTokenClosed, setIsTokenClosed] = useState(false);

  const testTokenService = useTestTokenService();

  // Check if amount exceeds maximum allowed
  const isAmountExceedingLimit = useMemo(() => {
    const amount = Number.parseFloat(buyAmount);
    return !isNaN(amount) && amount > 10000;
  }, [buyAmount]);

  // Fetch token details
  useEffect(() => {
    const fetchToken = async () => {
      try {
        setIsLoading(true);
        setNotFoundError(false);

        // First get all tokens to find the token address
        const tokens = await testTokenService.testGetTokens();
        console.log("Looking for token with identifier:", symbol);

        // Try to find the token address using different matching strategies
        let tokenAddress = null;

        // 1. Check if the symbol is already a valid address
        if (symbol.startsWith("0x") && symbol.length === 42) {
          tokenAddress = symbol;
          console.log("Using provided address:", tokenAddress);
        } else {
          // 2. Try to find the token address from the tokens list
          const foundToken = tokens.find(
            (t) =>
              t.name.substring(0, 4).toUpperCase() === symbol.toUpperCase() || // Match by symbol
              t.name.toUpperCase().includes(symbol.toUpperCase()) // Match by name
          );

          if (foundToken) {
            tokenAddress = foundToken.token;
            console.log("Found token address:", tokenAddress);
          }
        }

        if (!tokenAddress) {
          console.error("Token address not found for symbol:", symbol);
          setNotFoundError(true);
          toast({
            title: "Token Not Found",
            description:
              "The token you're looking for doesn't exist or is not available.",
            variant: "destructive",
          });
          return;
        }

        // Fetch token details from the API
        const response = await fetch(`/api/memecoin/${tokenAddress}`);
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const apiResponse: TokenApiResponse = await response.json();
        console.log("Token data from API:", apiResponse);

        if (!apiResponse.success || !apiResponse.data) {
          setNotFoundError(true);
          return;
        }

        const { token: tokenData, marketData } = apiResponse.data;

        // Check if token is closed
        const isOpen = tokenData.isOpen;
        setIsTokenClosed(!isOpen);

        // Get the actual price from the contract for 1 token
        let tokenPrice = ethers.formatEther(marketData.price || "0");

        // Format token data for display
        setToken({
          id: tokenData.token,
          name: tokenData.name,
          symbol:
            tokenData.symbol || tokenData.name.substring(0, 4).toUpperCase(),
          description: tokenData.description || "No description available",
          imageUrl: tokenData.image || DEFAULT_TOKEN_IMAGE,
          price: tokenPrice,
          marketCap: marketData.marketCap + " S",
          priceChange: Math.random() * 20 - 10, // Random price change for now
          fundingRaised: tokenData.raised.toString(),
          chain: "Sonic",
          volume24h: marketData.volume24h + "$",
          holders: marketData.holders,
          launchDate: new Date().toISOString().split("T")[0],
          status: isOpen ? "active" : "locked",
          creator: tokenData.creator,
          baseCost: tokenPrice,
          rawToken: tokenData,
          isOpen: isOpen,
        });
      } catch (error) {
        console.error("Error fetching token:", error);
        setNotFoundError(true);
        toast({
          title: "Error",
          description: "Failed to load token details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (symbol) {
      fetchToken();
    }
  }, [symbol, toast]);

  // Update estimated price when buyAmount changes
  useEffect(() => {
    const updateEstimatedPrice = async () => {
      if (!token?.rawToken || !buyAmount || parseFloat(buyAmount) <= 0) {
        setEstimatedPrice("0");
        return;
      }

      try {
        setIsPriceLoading(true);
        // Convert amount to BigInt
        const amount = BigInt(parseFloat(buyAmount));

        // Create a TokenSale object from the token data
        const tokenSaleData = {
          token: token.rawToken.token,
          name: token.rawToken.name,
          creator: token.rawToken.creator,
          sold: token.rawToken.sold,
          raised: token.rawToken.raised,
          isOpen: token.rawToken.isOpen,
          metadataURI: token.rawToken.image || "", // Use image URL as metadataURI
        };

        // Get the estimated price
        const price = await testTokenService.testGetPriceForTokens(
          tokenSaleData,
          amount
        );

        // Convert from wei to ETH and format
        const priceInEth = ethers.formatEther(price);
        setEstimatedPrice(priceInEth);
      } catch (error) {
        console.error("Error calculating price:", error);
        // Set estimated price to 0 instead of using a fallback calculation
        setEstimatedPrice("0");
      } finally {
        setIsPriceLoading(false);
      }
    };

    // Debounce the price update to avoid too many API calls
    const debounceTimer = setTimeout(() => {
      updateEstimatedPrice();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [buyAmount, token]);

  // Update handleBuyToken function
  const handleBuyToken = async () => {
    if (!token || !buyAmount) return;

    try {
      // Check if token is closed
      if (isTokenClosed) {
        toast({
          title: "Token Closed",
          description:
            "This token has graduated and is no longer available for purchase.",
          variant: "destructive",
        });
        return;
      }

      setIsBuying(true);

      // Check if amount is valid
      if (parseFloat(buyAmount) <= 0) {
        toast({
          title: "Invalid Amount",
          description: "Please enter a valid amount greater than 0",
          variant: "destructive",
        });
        return;
      }

      // Convert amount to BigInt
      const amount = BigInt(parseFloat(buyAmount));

      // Create a TokenSale object from the token data
      const tokenSaleData = {
        token: token.rawToken.token,
        name: token.rawToken.name,
        creator: token.rawToken.creator,
        sold: token.rawToken.sold,
        raised: token.rawToken.raised,
        isOpen: token.rawToken.isOpen,
        metadataURI: token.rawToken.image || "", // Use image URL as metadataURI
      };

      // Call the testBuyToken function
      const result = await testTokenService.testBuyToken(tokenSaleData, amount);

      if (result.success) {
        toast({
          title: "Success",
          description: `Successfully purchased ${buyAmount} ${token.symbol} tokens!`,
        });

        // Wait for transaction confirmation (typically 1-2 blocks)
        toast({
          title: "Refreshing Data",
          description: "Updating token information...",
        });

        // Add a small delay to allow the blockchain to update
        setTimeout(() => {
          // Reload the page to reflect updated data
          window.location.reload();
        }, 3000);
      } else {
        toast({
          title: "Transaction Failed",
          description: result.error || "Failed to buy tokens",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error buying token:", error);
      toast({
        title: "Error",
        description: error.message || "An error occurred while buying tokens",
        variant: "destructive",
      });
    } finally {
      setIsBuying(false);
    }
  };

  // Format address for display
  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Address copied to clipboard",
    });
  };

  // Handle share
  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `${token?.name} (${token?.symbol})`,
          text: `Check out ${token?.name} on CaffiFi!`,
          url: window.location.href,
        })
        .catch((err) => {
          console.error("Error sharing:", err);
        });
    } else {
      copyToClipboard(window.location.href);
      toast({
        title: "Link Copied",
        description: "Token link copied to clipboard for sharing",
      });
    }
  };

  // Toggle star/favorite
  const toggleStar = () => {
    setIsStarred(!isStarred);
    toast({
      title: isStarred ? "Removed from Watchlist" : "Added to Watchlist",
      description: isStarred
        ? `${token?.symbol} has been removed from your watchlist`
        : `${token?.symbol} has been added to your watchlist`,
    });
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container py-12">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-16 h-16 border-4 border-t-amber-600 border-b-amber-800 border-l-transparent border-r-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-lg text-muted-foreground">
              Brewing token details...
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!token || notFoundError) {
    return (
      <AppLayout>
        <div className="container py-12">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <AlertCircle className="w-16 h-16 text-red-500" />
            <h2 className="mt-4 text-2xl font-bold">Token Not Found</h2>
            <p className="mt-2 text-muted-foreground">
              The token you're looking for doesn't exist or is not available.
            </p>
            <Link href="/marketplace">
              <Button className="mt-6">Back to Marketplace</Button>
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="pb-12 bg-gradient-to-b from-amber-950/30 to-transparent">
        <div className="container max-w-7xl mx-auto px-4 pt-6">
          {/* Header with Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pt-4">
            <Link href="/marketplace">
              <Button
                variant="outline"
                size="sm"
                className="border-amber-800/50 hover:bg-amber-800/20"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Bean Market
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleStar}
                className={
                  isStarred
                    ? "bg-amber-600/10 text-amber-400 border-amber-600/20"
                    : "border-amber-800/50 hover:bg-amber-800/20"
                }
              >
                <Star
                  className={`mr-2 h-4 w-4 ${
                    isStarred ? "fill-amber-400" : ""
                  }`}
                />
                {isStarred ? "Favorite" : "Add to Favorites"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="border-amber-800/50 hover:bg-amber-800/20"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Token Overview Card */}
              <Card className="border-amber-800/30 bg-amber-950/40 backdrop-blur-xl">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Token Image */}
                    <div className="w-full md:w-48 h-48 relative rounded-lg overflow-hidden flex-shrink-0 bg-amber-900/30">
                      {/* Background placeholder */}
                      <div
                        className="w-full h-full absolute inset-0"
                        style={{
                          backgroundImage: `url(${DEFAULT_TOKEN_IMAGE})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          opacity: 0.5,
                        }}
                      />

                      {/* Token Image with error handling */}
                      <Image
                        src={token?.imageUrl || DEFAULT_TOKEN_IMAGE}
                        alt={token?.name || "Bean Token"}
                        fill
                        className="object-cover z-10"
                        onError={(e) => {
                          console.error(
                            "Error loading token image:",
                            token?.imageUrl
                          );
                          // Fallback to default image on error
                          e.currentTarget.src = DEFAULT_TOKEN_IMAGE;
                        }}
                        unoptimized={
                          !!(
                            token?.imageUrl &&
                            token?.imageUrl.startsWith("http")
                          )
                        }
                        priority
                      />
                    </div>

                    {/* Token Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <h1 className="text-3xl font-bold">{token?.name}</h1>
                        <Badge className="bg-gradient-to-r from-amber-600 to-amber-400 text-amber-950 font-semibold">
                          ${token?.symbol}
                        </Badge>
                      </div>

                      <p className="text-muted-foreground mb-6 line-clamp-3">
                        {token?.description}
                      </p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-amber-900/20 rounded-lg p-4">
                          <div className="text-muted-foreground text-sm mb-1">
                            Price
                          </div>
                          <div className="text-xl font-semibold">
                            {token?.price === "0" ? "0" : `$${token?.price}`}
                          </div>
                          <div
                            className={`text-sm ${
                              token?.priceChange > 0
                                ? "text-green-400"
                                : "text-red-400"
                            } flex items-center gap-1`}
                          >
                            {token?.priceChange > 0 ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : (
                              <TrendingDown className="h-3 w-3" />
                            )}
                            {token?.priceChange > 0 ? "+" : ""}
                            {token?.priceChange?.toFixed(2)}%
                          </div>
                        </div>

                        <div className="bg-amber-900/20 rounded-lg p-4">
                          <div className="text-muted-foreground text-sm mb-1">
                            Roast Cap
                          </div>
                          <div className="text-xl font-semibold">
                            {token?.marketCap}
                          </div>
                        </div>

                        <div className="bg-amber-900/20 rounded-lg p-4">
                          <div className="text-muted-foreground text-sm mb-1">
                            Brewers
                          </div>
                          <div className="text-xl font-semibold">
                            {token?.holders}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Description Card */}
              <Card className="border-amber-800/30 bg-amber-950/40 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle>About {token?.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      {token?.description ||
                        "No description available for this bean."}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="bg-amber-900/20 p-4 rounded-lg">
                        <h3 className="text-sm font-medium mb-2">
                          Bean Utility
                        </h3>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                          <li>Café governance voting</li>
                          <li>Brew shop discounts</li>
                          <li>Premium coffee access</li>
                          <li>Roasting rewards</li>
                        </ul>
                      </div>

                      <div className="bg-amber-900/20 p-4 rounded-lg">
                        <h3 className="text-sm font-medium mb-2">
                          Bean Economics
                        </h3>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                          <li>Total Supply: 1,000,000,000</li>
                          <li>Brewing Supply: 250,000,000</li>
                          <li>Initial Distribution: 25%</li>
                          <li>Barista Allocation: 15% (locked)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Price Chart Card */}
              <Card className="border-amber-800/30 bg-amber-950/40 backdrop-blur-xl">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle>Brewing History</CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs border-amber-800/50 hover:bg-amber-800/20"
                      >
                        1D
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs bg-amber-600/10 text-amber-400 border-amber-600/20"
                      >
                        1W
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs border-amber-800/50 hover:bg-amber-800/20"
                      >
                        1M
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs border-amber-800/50 hover:bg-amber-800/20"
                      >
                        1Y
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="aspect-[16/9] bg-amber-900/20 rounded-lg flex flex-col items-center justify-center p-6">
                    <BarChart3 className="h-16 w-16 text-amber-500/20 mb-4" />
                    <p className="text-muted-foreground text-center">
                      Brewing chart data will be available once there is
                      sufficient trading activity.
                    </p>
                    <p className="text-sm text-muted-foreground text-center mt-2">
                      Be one of the first to brew this bean!
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="bg-amber-900/20 p-3 rounded-lg">
                      <div className="text-xs text-muted-foreground">
                        All-time high
                      </div>
                      <div className="font-medium">$0.000045</div>
                      <div className="text-xs text-green-400">
                        +36.36% from current
                      </div>
                    </div>
                    <div className="bg-amber-900/20 p-3 rounded-lg">
                      <div className="text-xs text-muted-foreground">
                        All-time low
                      </div>
                      <div className="font-medium">$0.000021</div>
                      <div className="text-xs text-red-400">
                        -36.36% from current
                      </div>
                    </div>
                    <div className="bg-amber-900/20 p-3 rounded-lg">
                      <div className="text-xs text-muted-foreground">
                        30d change
                      </div>
                      <div className="font-medium flex items-center">
                        <TrendingDown className="h-3 w-3 text-red-400 mr-1" />
                        -9.65%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Buy Card - Moved to the top of the right column */}
              <Card className="border-amber-800/30 bg-amber-950/40 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle>Brew {token?.symbol}</CardTitle>
                  <CardDescription>
                    Purchase beans directly with S
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isTokenClosed && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-red-500 font-medium">
                            ❌ This bean has been fully brewed! No further
                            purchases allowed.
                          </p>
                          <p className="text-xs text-red-400/80 mt-1">
                            This bean is no longer available for purchase. You
                            can still view its details and track its
                            performance.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="text-muted-foreground text-sm block mb-2">
                        Amount
                      </label>
                      <Input
                        type="number"
                        value={buyAmount}
                        onChange={(e) => setBuyAmount(e.target.value)}
                        min="1"
                        className={`bg-amber-900/30 border-amber-800/30 h-12 rounded-lg text-lg ${
                          isAmountExceedingLimit ? "border-red-500" : ""
                        }`}
                      />
                      {isAmountExceedingLimit && (
                        <p className="text-red-500 text-xs mt-1 flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Maximum purchase limit is 10,000 beans
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-muted-foreground text-sm block mb-2">
                        Total Cost
                      </label>
                      <div
                        className={`bg-amber-900/30 border border-amber-800/30 h-12 rounded-lg flex items-center px-4 text-lg font-mono ${
                          isAmountExceedingLimit ? "border-red-500" : ""
                        }`}
                      >
                        {isPriceLoading ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Calculating...</span>
                          </div>
                        ) : (
                          <>{estimatedPrice} S</>
                        )}
                      </div>
                    </div>
                  </div>

                  {isAmountExceedingLimit && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-red-500 font-medium">
                            Purchase limit exceeded
                          </p>
                          <p className="text-xs text-red-400/80 mt-1">
                            For security reasons, purchases are limited to
                            10,000 beans per transaction. Please reduce the
                            amount to continue.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-amber-700 to-amber-500 hover:from-amber-800 hover:to-amber-600 text-white rounded-lg"
                    onClick={handleBuyToken}
                    disabled={
                      isBuying ||
                      !buyAmount ||
                      Number.parseFloat(buyAmount) <= 0 ||
                      isAmountExceedingLimit ||
                      isTokenClosed
                    }
                  >
                    {isBuying ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Brewing...</span>
                      </div>
                    ) : isTokenClosed ? (
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        <span>Bean Depleted</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Rocket className="h-5 w-5" />
                        <span>Brew {token?.symbol}</span>
                      </div>
                    )}
                  </Button>
                </CardContent>
                <CardFooter className="bg-amber-900/20 px-6 py-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>
                      {isTokenClosed
                        ? "This bean is no longer available for purchase."
                        : `Bean cost: ${token?.baseCost} S per bean. Grinding fees may apply.`}
                    </span>
                  </div>
                </CardFooter>
              </Card>

              {/* Token Information Card */}
              <Card className="border-amber-800/30 bg-amber-950/40 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle>Bean Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between py-3 border-b border-amber-800/30">
                      <span className="text-muted-foreground">
                        Bean Address
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">
                          {formatAddress(token?.id)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(token?.id)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex justify-between py-3 border-b border-amber-800/30">
                      <span className="text-muted-foreground">
                        Roast Network
                      </span>
                      <Badge
                        variant="outline"
                        className="bg-amber-900/20 border-amber-800/30"
                      >
                        {token?.chain}
                      </Badge>
                    </div>

                    <div className="flex justify-between py-3 border-b border-amber-800/30">
                      <span className="text-muted-foreground">Roast Date</span>
                      <span>{token?.launchDate}</span>
                    </div>

                    <div className="flex justify-between py-3 border-b border-amber-800/30">
                      <span className="text-muted-foreground">
                        Master Roaster
                      </span>
                      <span className="font-mono text-sm">
                        {formatAddress(token?.creator)}
                      </span>
                    </div>

                    <div className="flex justify-between py-3 border-b border-amber-800/30">
                      <span className="text-muted-foreground">Status</span>
                      <Badge
                        className={`${
                          isTokenClosed
                            ? "bg-red-500/10 text-red-500 border-red-500/20"
                            : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                        }`}
                      >
                        {isTokenClosed ? "Sold Out" : "Brewing"}
                      </Badge>
                    </div>

                    <div className="flex justify-between py-3">
                      <span className="text-muted-foreground">Café Links</span>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Globe className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Twitter className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Telegram className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Transactions */}
              <Card className="border-amber-800/30 bg-amber-950/40 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle>Recent Brews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Empty state for now */}
                    <div className="text-center py-6">
                      <div className="bg-amber-900/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                        <AlertCircle className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium mb-1">No brews yet</p>
                      <p className="text-xs text-muted-foreground">
                        Be the first to brew this bean
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Market Activity */}
              <Card className="border-amber-800/30 bg-amber-950/40 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle>Brewing Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-amber-900/20 p-4 rounded-lg">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-muted-foreground">
                          Brewing Volume (24h)
                        </span>
                        <span className="text-sm font-medium">
                          {token?.volume24h}
                        </span>
                      </div>
                      <div className="w-full bg-amber-800/20 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-amber-700 to-amber-500 h-full rounded-full"
                          style={{ width: "35%" }}
                        ></div>
                      </div>
                    </div>

                    <div className="bg-amber-900/20 p-4 rounded-lg">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-muted-foreground">
                          Brew Strength
                        </span>
                        <span className="text-sm font-medium">$45,678.90</span>
                      </div>
                      <div className="w-full bg-amber-800/20 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-amber-700 to-amber-500 h-full rounded-full"
                          style={{ width: "62%" }}
                        ></div>
                      </div>
                    </div>

                    <div className="bg-amber-900/20 p-4 rounded-lg">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-muted-foreground">
                          Brew/Sell Ratio
                        </span>
                        <span className="text-sm font-medium">68% / 32%</span>
                      </div>
                      <div className="flex h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-600 h-full"
                          style={{ width: "68%" }}
                        ></div>
                        <div
                          className="bg-red-500 h-full"
                          style={{ width: "32%" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
