"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ArrowUpDown,
  Info,
  Search,
  ChevronDown,
  X,
  Zap,
  Check,
  ExternalLink,
  Copy,
  ArrowDown,
  Clock,
  Globe,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  getPriceForTokens,
  getEstimatedTokensForEth,
  getEstimatedEthForTokens,
  getTokenBalance,
  getEthBalance,
  swapEthForToken,
  swapTokenForEth,
} from "@/services/memecoin-launchpad";
import { ethers } from "ethers";
import { useAccount, useWalletClient } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useTestTokenService } from "@/services/TestTokenService";

// Define the Token interface to match what's returned by getTokens
interface Token {
  token: string;
  name: string;
  creator: string;
  sold: any;
  raised: any;
  isOpen: boolean;
  image: string;
  description: string;
  metadataURI: string;
}

// Define TokenSale interface to match what's needed for price estimation functions
interface TokenSale {
  token: string;
  name: string;
  creator: string;
  sold: any;
  raised: any;
  isOpen: boolean;
  metadataURI: string;
}

// Define UI token type that includes tokenData which can be null for default tokens
interface UIToken {
  symbol: string;
  name: string;
  balance: number;
  icon: string;
  change24h: string;
  price: number;
  tokenData: Token | null;
}

interface CoinSwapProps {
  symbol: string;
  isAuthenticated: boolean;
  handleTradeAction: () => void;
  marketplaceTokens?: Token[];
}

// Define token data with more details
const defaultTokens: UIToken[] = [
  {
    symbol: "ETH",
    name: "Ethereum",
    balance: 1.2,
    icon: "☕",
    change24h: "-0.5%",
    price: 4125,
    tokenData: null,
  },
  {
    symbol: "USDT",
    name: "Tether",
    balance: 500.0,
    icon: "💵",
    change24h: "+0.1%",
    price: 1.0,
    tokenData: null,
  },
  // ... other default tokens
];

// DeBridgeWidget component for cross-chain swaps
const DeBridgeWidget = () => {
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Safety check if the component is unmounted before the script loads
    let isMounted = true;

    const loadScript = () => {
      // Remove any existing scripts to avoid conflicts
      const existingScripts = document.querySelectorAll(
        'script[src="https://app.debridge.finance/assets/scripts/widget.js"]'
      );
      existingScripts.forEach((script) => script.remove());

      // Create and load the script
      const script = document.createElement("script");
      script.src = "https://app.debridge.finance/assets/scripts/widget.js";
      script.async = true;
      script.onload = () => {
        if (isMounted && widgetRef.current && window.deBridge) {
          // Clear any existing content
          widgetRef.current.innerHTML = "";

          // Initialize widget
          window.deBridge.widget({
            v: "1",
            element: "debridgeWidget",
            title: "CaffiFi",
            description: "",
            width: "100%",
            height: "650px",
            r: null,
            supportedChains:
              '{"inputChains":{"1":"all","10":"all","56":"all","100":"all","137":"all","146":"all","250":"all","388":"all","998":"all","1088":"all","1514":"all","2741":"all","4158":"all","7171":"all","8453":"all","42161":"all","43114":"all","48900":"all","59144":"all","80094":"all","7565164":"all","245022934":"all"},"outputChains":{"1":"all","10":"all","56":"all","100":"all","137":"all","146":"all","250":"all","388":"all","998":"all","999":"all","1088":"all","1514":"all","2741":"all","4158":"all","7171":"all","8453":"all","42161":"all","43114":"all","48900":"all","59144":"all","80094":"all","7565164":"all","245022934":"all"}}',
            inputChain: 56,
            outputChain: 1,
            inputCurrency: "",
            outputCurrency: "",
            address: "",
            showSwapTransfer: true,
            amount: "",
            outputAmount: "",
            isAmountFromNotModifiable: false,
            isAmountToNotModifiable: false,
            lang: "en",
            mode: "deswap",
            isEnableCalldata: false,
            styles:
              "eyJhcHBCYWNrZ3JvdW5kIjoiIzFhMGYwMiIsImJvcmRlckNvbG9yIjoiIzhCNDUxMyIsInRvb2x0aXBCZyI6IiMxYTBmMDIiLCJwcmltYXJ5IjoiI2Q0YjM3ZiIsInByaW1hcnlCdG5CZyI6IiM4QjQ1MTMifQ==",
            theme: "dark",
            isHideLogo: false,
            logo: "",
            disabledWallets: [],
            disabledElements: [],
          });
        }
      };

      document.body.appendChild(script);
    };

    loadScript();

    // Cleanup function to run when component unmounts
    return () => {
      isMounted = false;
      const scripts = document.querySelectorAll(
        'script[src="https://app.debridge.finance/assets/scripts/widget.js"]'
      );
      scripts.forEach((script) => script.remove());

      if (widgetRef.current) {
        widgetRef.current.innerHTML = "";
      }
    };
  }, []);

  return (
    <div className="w-full overflow-hidden mt-4">
      <div
        id="debridgeWidget"
        ref={widgetRef}
        style={{
          width: "100%",
          height: "650px",
          border: "none",
          overflow: "hidden",
          background: "#1a0f02",
        }}
      ></div>
    </div>
  );
};

// Define interface for transaction state
interface Transaction {
  type: string;
  fromSymbol: string;
  toSymbol: string;
  fromAmount: string;
  toAmount: string;
  hash?: string;
  status: "pending" | "success" | "failed";
}

const CoinSwap = ({
  symbol,
  isAuthenticated,
  handleTradeAction,
  marketplaceTokens = [],
}: CoinSwapProps) => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const testTokenService = useTestTokenService();

  // State for token balances
  const [tokenBalances, setTokenBalances] = useState<Record<string, string>>(
    {}
  );
  const [ethBalance, setEthBalance] = useState<string>("0");
  const [isLoadingBalances, setIsLoadingBalances] = useState<boolean>(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  // State for transaction tracking
  const [activeTransactions, setActiveTransactions] = useState<Transaction[]>(
    []
  );

  // Track if data has been fetched to prevent refetching
  const dataFetched = useRef(false);

  // Add state for the order type to manage when to show the deBridge widget
  const [orderType, setOrderType] = useState<
    "instant" | "limit" | "cross-chain"
  >("instant");

  // Add state for chain IDs
  const [currentChainId, setCurrentChainId] = useState<number>(10000096); // Default to Espresso Orbit
  const [targetChainId, setTargetChainId] = useState<number>(10000099); // Default to Latte Orbit

  // Remove duplicate marketplaceTokens state since it's already passed as a prop
  const [userOwnedTokens, setUserOwnedTokens] = useState<Token[]>([]);

  // Add function to fetch user's owned tokens
  const fetchUserOwnedTokens = useCallback(async () => {
    if (!isConnected || !walletClient) return;

    try {
      const ownedTokens = await testTokenService.testGetTokens({
        isCreator: true,
      });
      // Ensure the tokens have the required metadataURI property
      const formattedTokens = ownedTokens.map((token) => ({
        token: token.token,
        name: token.name,
        creator: token.creator,
        sold: token.sold,
        raised: token.raised,
        isOpen: token.isOpen,
        image: token.image || "",
        description: token.description || "",
        metadataURI: token.metadataURI || token.image || "", // Use image as fallback for metadataURI
      }));
      setUserOwnedTokens(formattedTokens);
    } catch (error) {
      console.error("Error fetching user owned tokens:", error);
    }
  }, [isConnected, walletClient, testTokenService]);

  // Update useEffect to fetch user's owned tokens when wallet connects
  useEffect(() => {
    if (isConnected && walletClient) {
      fetchUserOwnedTokens();
    }
  }, [isConnected, walletClient, fetchUserOwnedTokens]);

  // Convert marketplace tokens to the format needed for the UI
  const marketplaceTokensFormatted: UIToken[] = marketplaceTokens.map(
    (token) => ({
      symbol: token.name.substring(0, 4).toUpperCase(),
      name: token.name,
      balance: 0, // Will be updated with real balance
      icon: "🪙", // Default icon for marketplace tokens
      change24h: "+0.0%", // This would need to be fetched from an API
      price: 0.01, // Default price, will be updated dynamically
      tokenData: token, // Store the original token data for API calls
    })
  );

  // Convert user owned tokens to UI format
  const userOwnedTokensFormatted: UIToken[] = userOwnedTokens.map((token) => ({
    symbol: token.name.substring(0, 4).toUpperCase(),
    name: token.name,
    balance: 0, // Will be updated with real balance
    icon: "👑", // Special icon for user owned tokens
    change24h: "+0.0%",
    price: 0.01,
    tokenData: token,
  }));

  // Combine ETH with marketplace tokens and user owned tokens
  const tokens: UIToken[] = [
    ...defaultTokens.filter((t) => t.symbol === "ETH"), // Only keep ETH from default tokens
    ...userOwnedTokensFormatted, // Add user owned tokens first
    ...marketplaceTokensFormatted,
  ];

  // Find the token that matches the symbol or default to ETH
  const defaultToken = tokens.find((t) => t.symbol === symbol) || tokens[0];

  const [fromToken, setFromToken] = useState<UIToken>(defaultToken);
  // Find a graduated token for the "to" token default
  const graduatedToken = marketplaceTokensFormatted.find(
    (token) => token.tokenData && !token.tokenData.isOpen
  );
  const [toToken, setToToken] = useState<UIToken>(
    graduatedToken || defaultTokens[1]
  ); // Default to first graduated marketplace token or USDT
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [swapType, setSwapType] = useState("instant");
  const [fromSearchQuery, setFromSearchQuery] = useState("");
  const [toSearchQuery, setToSearchQuery] = useState("");
  const [isFromOpen, setIsFromOpen] = useState(false);
  const [isToOpen, setIsToOpen] = useState(false);
  const [slippage, setSlippage] = useState("0.5");
  const [showSettings, setShowSettings] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [transactionHash, setTransactionHash] = useState("");
  const [estimatedPrice, setEstimatedPrice] = useState<string>("0");
  const [isCalculating, setIsCalculating] = useState(false);
  const [swapDirection, setSwapDirection] = useState<
    "ethToToken" | "tokenToEth"
  >("ethToToken");
  const [recipientAddress, setRecipientAddress] = useState(
    "0xf79DcD66e8bC69dae488c3E0F35e0693815bD7d6"
  );
  const [gasOnDestination, setGasOnDestination] = useState<string>("");
  const [fee, setFee] = useState<string>("");
  const [gasCost, setGasCost] = useState<string>("");
  const [estimatedTime, setEstimatedTime] = useState<string>("");

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
    setIsLoadingBalances(true);
  }, []);

  // Fetch balances when wallet is connected
  useEffect(() => {
    if (!isWalletConnected || dataFetched.current) return;

    async function fetchBalances() {
      try {
        setIsLoadingBalances(true);
        dataFetched.current = true;

        // Fetch ETH balance using test function
        const ethBalanceWei = await testTokenService.testGetEthBalance();
        const formattedEthBalance = ethers.formatEther(ethBalanceWei);
        console.log("ETH Balance:", formattedEthBalance);
        setEthBalance(formattedEthBalance);

        // Update ETH token in the tokens array
        const ethToken = tokens.find((t) => t.symbol === "ETH");
        if (ethToken) {
          ethToken.balance = parseFloat(formattedEthBalance);
        }

        // Fetch token balances for marketplace tokens using test function
        const balancePromises = marketplaceTokensFormatted.map(
          async (token) => {
            if (token.tokenData) {
              try {
                const balance = await testTokenService.testGetTokenBalance(
                  token.tokenData.token
                );
                const formattedBalance = ethers.formatEther(balance);
                return {
                  tokenAddress: token.tokenData.token,
                  balance: formattedBalance,
                };
              } catch (error) {
                console.error(
                  `Error fetching balance for ${token.name}:`,
                  error
                );
                return { tokenAddress: token.tokenData.token, balance: "0" };
              }
            }
            return null;
          }
        );

        const balanceResults = await Promise.all(balancePromises);

        // Create a map of token address to balance
        const balanceMap: Record<string, string> = {};
        balanceResults.forEach((result) => {
          if (result) {
            balanceMap[result.tokenAddress] = result.balance;
          }
        });

        setTokenBalances(balanceMap);

        // Update token balances in the tokens array
        marketplaceTokensFormatted.forEach((token) => {
          if (token.tokenData && balanceMap[token.tokenData.token]) {
            token.balance = parseFloat(balanceMap[token.tokenData.token]);
          }
        });
      } catch (error) {
        console.error("Error fetching balances:", error);
      } finally {
        setIsLoadingBalances(false);
      }
    }

    fetchBalances();
  }, [isWalletConnected, testTokenService, marketplaceTokensFormatted]);

  // Add cleanup for wallet disconnection
  useEffect(() => {
    if (!isWalletConnected) {
      setTokenBalances({});
      setEthBalance("0");
      setIsLoadingBalances(false);
      dataFetched.current = false;
    }
  }, [isWalletConnected]);

  // Get the current balance of the selected token
  const getSelectedTokenBalance = (token: UIToken): string => {
    if (token.symbol === "ETH") {
      return ethBalance;
    }

    if (token.tokenData) {
      return tokenBalances[token.tokenData.token] || "0";
    }

    return "0";
  };

  // Filter tokens based on search query
  const filteredFromTokens = tokens.filter(
    (token) =>
      token.symbol.toLowerCase().includes(fromSearchQuery.toLowerCase()) ||
      token.name.toLowerCase().includes(fromSearchQuery.toLowerCase())
  );

  // For "To" tokens, only show marketplace tokens when swapping from ETH
  // When swapping from a marketplace token, only show ETH
  const filteredToTokens =
    swapDirection === "ethToToken"
      ? marketplaceTokensFormatted.filter(
          (token) =>
            token.symbol.toLowerCase().includes(toSearchQuery.toLowerCase()) ||
            token.name.toLowerCase().includes(toSearchQuery.toLowerCase())
        )
      : tokens.filter(
          (token) =>
            token.symbol === "ETH" &&
            (token.symbol.toLowerCase().includes(toSearchQuery.toLowerCase()) ||
              token.name.toLowerCase().includes(toSearchQuery.toLowerCase()))
        );

  // Helper function to check if a token is swappable (graduated)
  const isTokenSwappable = (token: UIToken) => {
    // ETH is always swappable
    if (token.symbol === "ETH") return true;
    // For other tokens, check if they are graduated (isOpen = false)
    return token.tokenData ? !token.tokenData.isOpen : true;
  };

  // Update swap direction when tokens change
  useEffect(() => {
    if (fromToken.symbol === "ETH") {
      setSwapDirection("ethToToken");
    } else {
      setSwapDirection("tokenToEth");
      // If we're swapping from token to ETH, ensure the "to" token is ETH
      const ethToken = tokens.find((t) => t.symbol === "ETH");
      if (ethToken && toToken.symbol !== "ETH") {
        setToToken(ethToken);
      }
    }
  }, [fromToken, toToken, tokens]);

  // Update price calculation
  useEffect(() => {
    const calculatePrice = async () => {
      if (
        !fromAmount ||
        isNaN(parseFloat(fromAmount)) ||
        parseFloat(fromAmount) <= 0
      ) {
        setToAmount("");
        setEstimatedPrice("0");
        return;
      }

      try {
        setIsCalculating(true);

        // Convert amount to bigint for the API calls
        const amount = BigInt(Math.floor(parseFloat(fromAmount) * 1e18));

        if (
          swapDirection === "ethToToken" &&
          fromToken.symbol === "ETH" &&
          toToken.tokenData
        ) {
          // ETH to Token swap
          const tokenSale: TokenSale = {
            token: toToken.tokenData.token,
            name: toToken.tokenData.name,
            creator: toToken.tokenData.creator,
            sold: toToken.tokenData.sold,
            raised: toToken.tokenData.raised,
            isOpen: toToken.tokenData.isOpen,
            metadataURI: "", // This might need to be fetched if required
          };

          const estimatedTokens =
            await testTokenService.testGetEstimatedTokensForEth(
              tokenSale,
              amount
            );
          const formattedAmount = ethers.formatUnits(estimatedTokens, 18);
          setToAmount(formattedAmount);
        } else if (
          swapDirection === "tokenToEth" &&
          toToken.symbol === "ETH" &&
          fromToken.tokenData
        ) {
          // Token to ETH swap
          const tokenSale: TokenSale = {
            token: fromToken.tokenData.token,
            name: fromToken.tokenData.name,
            creator: fromToken.tokenData.creator,
            sold: fromToken.tokenData.sold,
            raised: fromToken.tokenData.raised,
            isOpen: fromToken.tokenData.isOpen,
            metadataURI: "", // This might need to be fetched if required
          };

          const estimatedEth =
            await testTokenService.testGetEstimatedEthForTokens(
              tokenSale,
              amount
            );
          const formattedAmount = ethers.formatUnits(estimatedEth, 18);
          setToAmount(formattedAmount);
        }
      } catch (error) {
        console.error("Error calculating swap price:", error);
      } finally {
        setIsCalculating(false);
      }
    };

    calculatePrice();
  }, [fromAmount, fromToken, toToken, swapDirection, testTokenService]);

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    // Price calculation is handled by the useEffect
  };

  const handleToAmountChange = (value: string) => {
    setToAmount(value);
    // We don't calculate the reverse direction automatically
    // This would require implementing the reverse calculation
  };

  const handleSwapTokens = () => {
    // Only allow swapping if it's between ETH and a marketplace token
    if (
      (fromToken.symbol === "ETH" && toToken.tokenData) ||
      (toToken.symbol === "ETH" && fromToken.tokenData)
    ) {
      const temp = fromToken;
      setFromToken(toToken);
      setToToken(temp);
      setFromAmount(toAmount);
      setToAmount(fromAmount);
    }
  };

  const handleMaxClick = () => {
    // Use the real balance from our state
    const balance = getSelectedTokenBalance(fromToken);

    // If it's ETH, leave some for gas
    if (fromToken.symbol === "ETH") {
      // Leave 0.01 ETH for gas
      const ethBalanceNum = parseFloat(balance);
      const maxAmount = Math.max(0, ethBalanceNum - 0.01).toString();
      handleFromAmountChange(maxAmount);
    } else {
      // For tokens, use the full balance
      handleFromAmountChange(balance);
    }
  };

  // Calculate estimated fees and slippage
  const estimatedFee = fromAmount ? parseFloat(fromAmount) * 0.003 : 0;
  const estimatedSlippage =
    fromAmount && slippage
      ? parseFloat(fromAmount) * (parseFloat(slippage) / 100)
      : 0;

  // Calculate minimum received
  const minimumReceived =
    toAmount && estimatedSlippage
      ? (parseFloat(toAmount) - estimatedSlippage).toFixed(6)
      : "0";

  // Calculate USD values
  const fromUsdValue = fromAmount
    ? parseFloat(fromAmount) * fromToken.price
    : 0;
  const toUsdValue = toAmount ? parseFloat(toAmount) * toToken.price : 0;

  // Calculate gas fee based on current network conditions
  useEffect(() => {
    // This would typically come from an API or blockchain provider
    const calculateGasEstimates = async () => {
      try {
        // In a real implementation, these would be fetched from an API or blockchain
        const currentGasPrice = Math.random() * 50 + 20; // Simulated gas price in Gwei
        const estimatedGasUnits = 150000; // Typical gas units for a swap

        // Calculate gas cost in native token
        const gasCostInEth = (currentGasPrice * estimatedGasUnits) / 1e9;
        const gasCostInUsd = gasCostInEth * fromToken.price;

        // Set the dynamic values
        setGasCost(`${gasCostInEth.toFixed(5)} ETH`);
        setFee(`$${(fromUsdValue * 0.003).toFixed(2)}`); // 0.3% fee
        setGasOnDestination(`0.001 ETH`); // Small amount for destination chain gas

        // Estimate transaction time based on gas price
        const estimatedMinutes =
          currentGasPrice > 50
            ? "< 1 min"
            : currentGasPrice > 30
            ? "1-2 min"
            : "3-5 min";
        setEstimatedTime(estimatedMinutes);
      } catch (error) {
        console.error("Error calculating gas estimates:", error);
        // Set fallback values
        setGasCost("0.005 ETH");
        setFee("$0.50");
        setGasOnDestination("0.001 ETH");
        setEstimatedTime("1-3 min");
      }
    };

    if (fromAmount && parseFloat(fromAmount) > 0) {
      calculateGasEstimates();
    } else {
      // Reset values when no amount is entered
      setGasCost("0 ETH");
      setFee("$0.00");
      setGasOnDestination("0 ETH");
      setEstimatedTime("0 min");
    }
  }, [fromAmount, fromToken.price, fromUsdValue]);

  // Estimate transaction cost (gas fee) in USD for display
  const estimatedGasFee = parseFloat(gasCost.split(" ")[0]) * fromToken.price;

  // Handle the swap action
  const handleSwap = async () => {
    // Check if we're trying to swap with a non-graduated token
    if (
      (swapDirection === "ethToToken" && toToken.tokenData?.isOpen === true) ||
      (swapDirection === "tokenToEth" && fromToken.tokenData?.isOpen === true)
    ) {
      // Show an error message or alert that only graduated tokens can be swapped
      alert("Only graduated tokens can be swapped.");
      return;
    }

    // Check if the user has enough balance
    const currentBalance = parseFloat(getSelectedTokenBalance(fromToken));
    const amountToSwap = parseFloat(fromAmount);

    if (isNaN(amountToSwap) || amountToSwap <= 0) {
      alert("Please enter a valid amount to swap.");
      return;
    }

    if (amountToSwap > currentBalance) {
      alert(
        `Insufficient balance. You have ${currentBalance} ${fromToken.symbol} but are trying to swap ${amountToSwap} ${fromToken.symbol}.`
      );
      return;
    }

    try {
      // Convert amount to BigInt for the API calls
      const amount = Number(fromAmount);
      let result;

      if (swapDirection === "ethToToken" && toToken.tokenData) {
        // ETH to Token swap
        const tokenSale = {
          token: toToken.tokenData.token,
          name: toToken.tokenData.name,
          creator: toToken.tokenData.creator,
          sold: toToken.tokenData.sold,
          raised: toToken.tokenData.raised,
          isOpen: toToken.tokenData.isOpen,
          metadataURI: toToken.tokenData.image || "", // Use image URL as metadataURI
        };

        // Call the test swap function
        result = await testTokenService.testSwapEthForToken(tokenSale, amount);
      } else if (swapDirection === "tokenToEth" && fromToken.tokenData) {
        // Token to ETH swap
        const tokenSale = {
          token: fromToken.tokenData.token,
          name: fromToken.tokenData.name,
          creator: fromToken.tokenData.creator,
          sold: fromToken.tokenData.sold,
          raised: fromToken.tokenData.raised,
          isOpen: fromToken.tokenData.isOpen,
          metadataURI: fromToken.tokenData.image || "", // Use image URL as metadataURI
        };

        // Call the test swap function
        result = await testTokenService.testSwapTokenForEth(tokenSale, amount);
      } else {
        alert("Invalid swap configuration");
        return;
      }

      // Check if the swap was successful
      if (!result.success) {
        alert(result.error || "Swap failed. Please try again.");
        return;
      }

      // In a real app, this would call a blockchain transaction
      // For demo purposes, we'll just show the success dialog after a short delay
      if (handleTradeAction) {
        handleTradeAction();
      }

      // Generate a mock transaction hash (in a real app, this would come from the blockchain)
      const mockTxHash =
        "0xf79DcD66e8bC69dae488c3E0F35e069381" +
        Math.floor(Math.random() * 1000000)
          .toString(16)
          .padStart(6, "0");
      setTransactionHash(mockTxHash);
      setShowSuccess(true);

      // Update balances after successful swap
      updateBalancesAfterSwap();
    } catch (error) {
      console.error("Error during swap:", error);
      alert("An error occurred during the swap. Please try again.");
    }
  };

  // Update balances after a successful swap
  const updateBalancesAfterSwap = async () => {
    if (!isConnected || !walletClient) return;

    try {
      // Fetch updated balances
      const ethBalanceWei = await testTokenService.testGetEthBalance();
      const formattedEthBalance = ethers.formatEther(ethBalanceWei);
      setEthBalance(formattedEthBalance);

      // Update ETH token in the tokens array
      const ethToken = tokens.find((t) => t.symbol === "ETH");
      if (ethToken) {
        ethToken.balance = parseFloat(formattedEthBalance);
      }

      // If we swapped a token, update its balance
      if (swapDirection === "tokenToEth" && fromToken.tokenData) {
        const tokenBalance = await testTokenService.testGetTokenBalance(
          fromToken.tokenData.token
        );
        const formattedBalance = ethers.formatEther(tokenBalance);

        // Update the balance in our state
        setTokenBalances((prev) => ({
          ...prev,
          [fromToken.tokenData!.token]: formattedBalance,
        }));

        // Update the token in the tokens array
        const token = marketplaceTokensFormatted.find(
          (t) => t.tokenData && t.tokenData.token === fromToken.tokenData!.token
        );
        if (token) {
          token.balance = parseFloat(formattedBalance);
        }
      } else if (swapDirection === "ethToToken" && toToken.tokenData) {
        const tokenBalance = await testTokenService.testGetTokenBalance(
          toToken.tokenData.token
        );
        const formattedBalance = ethers.formatEther(tokenBalance);

        // Update the balance in our state
        setTokenBalances((prev) => ({
          ...prev,
          [toToken.tokenData!.token]: formattedBalance,
        }));

        // Update the token in the tokens array
        const token = marketplaceTokensFormatted.find(
          (t) => t.tokenData && t.tokenData.token === toToken.tokenData!.token
        );
        if (token) {
          token.balance = parseFloat(formattedBalance);
        }
      }
    } catch (error) {
      console.error("Error updating balances after swap:", error);
    }
  };

  // Create a Sonic token logo component
  const SonicLogo = () => (
    <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center">
      <img
        src="https://cryptologos.cc/logos/ethereum-eth-logo.png"
        alt="Ethereum"
        className="w-full h-full object-cover"
      />
    </div>
  );

  // Update the token icon display in the token selection UI
  const renderTokenIcon = (token: UIToken) => {
    if (token.symbol === "ETH") {
      return <SonicLogo />;
    }

    if (token.tokenData?.image) {
      return (
        <img
          src={token.tokenData.image}
          alt={token.name}
          className="w-6 h-6 rounded-full"
        />
      );
    }

    return (
      <div className="w-6 h-6 rounded-full bg-amber-900/60 flex items-center justify-center text-white">
        {token.icon}
      </div>
    );
  };

  // Update the token selection UI to show owned tokens
  const renderTokenList = (
    tokens: UIToken[],
    searchQuery: string,
    currentToken: UIToken
  ) => {
    const filteredTokens = tokens.filter(
      (token) =>
        token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="max-h-[200px] overflow-y-auto py-1">
        {filteredTokens
          .filter((token) =>
            isTokenSwappable(token)
              ? true
              : token.symbol === currentToken.symbol
          )
          .map((token) => (
            <button
              key={token.symbol}
              className={`flex items-center justify-between w-full p-2 rounded-lg hover:bg-[#8B4513]/20 ${
                token.symbol === currentToken.symbol ? "bg-[#8B4513]/20" : ""
              }`}
              onClick={() => {
                if (currentToken === fromToken) {
                  setFromToken(token);
                  setFromSearchQuery("");
                } else {
                  setToToken(token);
                  setToSearchQuery("");
                }
              }}
            >
              <div className="flex items-center">
                {renderTokenIcon(token)}
                <div className="ml-2 text-left">
                  <div className="font-medium text-[#e8d5a9]">
                    {token.symbol}
                  </div>
                  <div className="text-xs text-[#e8d5a9]/70">{token.name}</div>
                </div>
              </div>
              <div className="text-xs text-right text-[#d4b37f]">
                <div>
                  {token.symbol === "ETH"
                    ? ethBalance
                    : tokenBalances[token.tokenData?.token || ""] || "0"}
                </div>
                <div>${token.price}</div>
              </div>
            </button>
          ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4 sticky top-24">
      <Card className="border-[#8B4513]/30 bg-[#1a0f02]/90 backdrop-blur-xl">
        <CardContent className="p-4">
          {/* Swap Type Selector */}
          <div className="flex items-center justify-center mb-4 border border-[#8B4513]/30 rounded-lg p-1 bg-[#1a0f02]/60">
            <Button
              variant="ghost"
              onClick={() => setOrderType("instant")}
              className={`flex-1 text-sm ${
                orderType === "instant"
                  ? "bg-[#8B4513] text-[#e8d5a9]"
                  : "bg-transparent text-[#d4b37f] hover:bg-[#8B4513]/20"
              }`}
            >
              Instant
            </Button>
            <Button
              variant="ghost"
              onClick={() => setOrderType("limit")}
              className={`flex-1 text-sm ${
                orderType === "limit"
                  ? "bg-[#8B4513] text-[#e8d5a9]"
                  : "bg-transparent text-[#d4b37f] hover:bg-[#8B4513]/20"
              }`}
            >
              Limit
            </Button>
            <Button
              variant="ghost"
              onClick={() => setOrderType("cross-chain")}
              className={`flex-1 text-sm ${
                orderType === "cross-chain"
                  ? "bg-[#8B4513] text-[#e8d5a9]"
                  : "bg-transparent text-[#d4b37f] hover:bg-[#8B4513]/20"
              }`}
            >
              Cross-Chain
            </Button>
          </div>

          {orderType === "cross-chain" ? (
            <div className="space-y-4">
              {/* From Chain Selection */}
              <div className="relative">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-[#d4b37f]">From Chain</span>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center justify-between space-x-1 w-full h-9 border-[#8B4513] bg-[#1a0f02]/60 text-[#e8d5a9] hover:bg-[#8B4513]/20"
                    >
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 mr-1.5 text-[#d4b37f]" />
                        <span>
                          {currentChainId === 10000096
                            ? "Espresso Orbit"
                            : "Latte Orbit"}
                        </span>
                      </div>
                      <ChevronDown className="h-4 w-4 text-[#d4b37f]" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[300px] bg-[#1a0f02] border-[#8B4513]/30 text-[#e8d5a9]"
                    align="end"
                  >
                    <div className="space-y-2">
                      <div className="max-h-[200px] overflow-y-auto py-1">
                        <button
                          className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-[#8B4513]/20"
                          onClick={() => {
                            if (currentChainId !== 10000096) {
                              setCurrentChainId(10000096);
                            }
                          }}
                        >
                          <div className="flex items-center">
                            <Globe className="h-4 w-4 mr-2 text-[#d4b37f]" />
                            <div className="text-left">
                              <div className="font-medium text-[#e8d5a9]">
                                Espresso Orbit
                              </div>
                              <div className="text-xs text-[#e8d5a9]/70">
                                Devnet
                              </div>
                            </div>
                          </div>
                          {currentChainId === 10000096 && (
                            <Check className="h-4 w-4 text-[#92da6c]" />
                          )}
                        </button>
                        <button
                          className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-[#8B4513]/20"
                          onClick={() => {
                            if (currentChainId !== 10000099) {
                              setCurrentChainId(10000099);
                            }
                          }}
                        >
                          <div className="flex items-center">
                            <Globe className="h-4 w-4 mr-2 text-[#d4b37f]" />
                            <div className="text-left">
                              <div className="font-medium text-[#e8d5a9]">
                                Latte Orbit
                              </div>
                              <div className="text-xs text-[#e8d5a9]/70">
                                Devnet
                              </div>
                            </div>
                          </div>
                          {currentChainId === 10000099 && (
                            <Check className="h-4 w-4 text-[#92da6c]" />
                          )}
                        </button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* To Chain Selection */}
              <div className="relative">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-[#d4b37f]">To Chain</span>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center justify-between space-x-1 w-full h-9 border-[#8B4513] bg-[#1a0f02]/60 text-[#e8d5a9] hover:bg-[#8B4513]/20"
                    >
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 mr-1.5 text-[#d4b37f]" />
                        <span>
                          {targetChainId === 10000096
                            ? "Espresso Orbit"
                            : "Latte Orbit"}
                        </span>
                      </div>
                      <ChevronDown className="h-4 w-4 text-[#d4b37f]" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[300px] bg-[#1a0f02] border-[#8B4513]/30 text-[#e8d5a9]"
                    align="end"
                  >
                    <div className="space-y-2">
                      <div className="max-h-[200px] overflow-y-auto py-1">
                        <button
                          className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-[#8B4513]/20"
                          onClick={() => {
                            if (targetChainId !== 10000096) {
                              setTargetChainId(10000096);
                            }
                          }}
                        >
                          <div className="flex items-center">
                            <Globe className="h-4 w-4 mr-2 text-[#d4b37f]" />
                            <div className="text-left">
                              <div className="font-medium text-[#e8d5a9]">
                                Espresso Orbit
                              </div>
                              <div className="text-xs text-[#e8d5a9]/70">
                                Devnet
                              </div>
                            </div>
                          </div>
                          {targetChainId === 10000096 && (
                            <Check className="h-4 w-4 text-[#92da6c]" />
                          )}
                        </button>
                        <button
                          className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-[#8B4513]/20"
                          onClick={() => {
                            if (targetChainId !== 10000099) {
                              setTargetChainId(10000099);
                            }
                          }}
                        >
                          <div className="flex items-center">
                            <Globe className="h-4 w-4 mr-2 text-[#d4b37f]" />
                            <div className="text-left">
                              <div className="font-medium text-[#e8d5a9]">
                                Latte Orbit
                              </div>
                              <div className="text-xs text-[#e8d5a9]/70">
                                Devnet
                              </div>
                            </div>
                          </div>
                          {targetChainId === 10000099 && (
                            <Check className="h-4 w-4 text-[#92da6c]" />
                          )}
                        </button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Token Selection */}
              <div className="relative">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-[#d4b37f]">Token</span>
                  <span className="text-xs text-[#e8d5a9]/70">
                    Balance:{" "}
                    {fromToken.symbol === "ETH"
                      ? ethBalance
                      : tokenBalances[fromToken.tokenData?.token || ""] || "0"}
                  </span>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center justify-between space-x-1 w-full h-9 border-[#8B4513] bg-[#1a0f02]/60 text-[#e8d5a9] hover:bg-[#8B4513]/20"
                    >
                      <div className="flex items-center">
                        {renderTokenIcon(fromToken)}
                        <span className="ml-1.5">{fromToken.symbol}</span>
                      </div>
                      <ChevronDown className="h-4 w-4 text-[#d4b37f]" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[300px] bg-[#1a0f02] border-[#8B4513]/30 text-[#e8d5a9]"
                    align="end"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center border border-[#8B4513]/30 rounded-lg p-2">
                        <Search className="h-4 w-4 mr-2 text-[#d4b37f]" />
                        <Input
                          placeholder="Search token"
                          className="border-none bg-transparent text-[#e8d5a9] placeholder-[#e8d5a9]/40 focus-visible:ring-0"
                          value={fromSearchQuery}
                          onChange={(e) => setFromSearchQuery(e.target.value)}
                        />
                        {fromSearchQuery && (
                          <X
                            className="h-4 w-4 cursor-pointer text-[#d4b37f] hover:text-[#e8d5a9]"
                            onClick={() => setFromSearchQuery("")}
                          />
                        )}
                      </div>
                      {renderTokenList(tokens, fromSearchQuery, fromToken)}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Amount Input */}
              <div className="relative">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-[#d4b37f]">Amount</span>
                  <span className="text-xs text-[#e8d5a9]/70">
                    Balance:{" "}
                    {fromToken.symbol === "ETH"
                      ? ethBalance
                      : tokenBalances[fromToken.tokenData?.token || ""] || "0"}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex-1">
                    <Input
                      type="number"
                      placeholder="0.0"
                      value={fromAmount}
                      onChange={(e) => handleFromAmountChange(e.target.value)}
                      className="text-lg font-medium border-none bg-transparent text-[#e8d5a9] placeholder-[#e8d5a9]/40 focus-visible:ring-0"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMaxClick}
                    className="h-8 text-xs border-[#8B4513] text-[#d4b37f] hover:bg-[#8B4513]/20 hover:text-[#e8d5a9]"
                  >
                    MAX
                  </Button>
                </div>
              </div>

              {/* Cross-Chain Details */}
              <div className="mt-4 pt-4 border-t border-[#8B4513]/30">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <div className="flex items-center text-[#e8d5a9]/70">
                      Bridge Fee
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3 w-3 ml-1 text-[#d4b37f]" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[250px] bg-[#1a0f02] border-[#8B4513]/30 text-[#e8d5a9]">
                            <p>Fee charged for cross-chain transfer.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <span className="text-[#e8d5a9]">0.1 ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex items-center text-[#e8d5a9]/70">
                      Estimated Time
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3 w-3 ml-1 text-[#d4b37f]" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[250px] bg-[#1a0f02] border-[#8B4513]/30 text-[#e8d5a9]">
                            <p>Estimated time for cross-chain transfer.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <span className="text-[#e8d5a9]">2-5 minutes</span>
                  </div>
                </div>
              </div>

              {/* Bridge Button */}
              <Button
                onClick={async () => {
                  if (!fromToken.tokenData) {
                    alert("Please select a token to bridge");
                    return;
                  }

                  if (!fromAmount || parseFloat(fromAmount) <= 0) {
                    alert("Please enter a valid amount");
                    return;
                  }

                  const currentBalance = parseFloat(
                    fromToken.symbol === "ETH"
                      ? ethBalance
                      : tokenBalances[fromToken.tokenData.token] || "0"
                  );

                  if (parseFloat(fromAmount) > currentBalance) {
                    alert(
                      `Insufficient balance. You have ${currentBalance} ${fromToken.symbol} but are trying to bridge ${fromAmount} ${fromToken.symbol}.`
                    );
                    return;
                  }

                  try {
                    setIsCalculating(true);
                    const targetRpcUrl =
                      targetChainId === 10000096
                        ? "http://127.0.0.1:8547"
                        : "http://127.0.0.1:8647";

                    const result = await testTokenService.swp(
                      fromToken.tokenData,
                      Number(fromAmount),
                      targetChainId,
                      targetRpcUrl
                    );

                    if (!result.success) {
                      alert(result.error || "Bridge failed. Please try again.");
                      return;
                    }

                    // Show success message
                    alert("Bridge initiated successfully!");
                    if (handleTradeAction) {
                      handleTradeAction();
                    }
                  } catch (error) {
                    console.error("Error during bridge:", error);
                    alert(
                      "An error occurred during the bridge. Please try again."
                    );
                  } finally {
                    setIsCalculating(false);
                  }
                }}
                disabled={!fromAmount || isCalculating || !fromToken.tokenData}
                className={`w-full h-12 text-lg font-medium rounded-xl ${
                  !fromAmount || isCalculating || !fromToken.tokenData
                    ? "bg-[#8B4513]/30 text-[#e8d5a9]/50 cursor-not-allowed"
                    : "bg-[#8B4513] hover:bg-[#A0522D] text-[#e8d5a9]"
                }`}
              >
                {isCalculating ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent border-[#e8d5a9]"></div>
                    <span>Brewing...</span>
                  </div>
                ) : !fromAmount ? (
                  "Enter an amount"
                ) : (
                  "Bridge Token"
                )}
              </Button>
            </div>
          ) : (
            <>
              {/* From Token */}
              <div className="relative mb-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-[#d4b37f]">From</span>
                  <span className="text-xs text-[#e8d5a9]/70">
                    Balance:{" "}
                    {fromToken.symbol === "ETH"
                      ? isLoadingBalances
                        ? "Loading..."
                        : ethBalance || "0"
                      : isLoadingBalances
                      ? "Loading..."
                      : tokenBalances[fromToken.tokenData?.token || ""] || "0"}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex-1">
                    <Input
                      type="number"
                      placeholder="0.0"
                      value={fromAmount}
                      onChange={(e) => handleFromAmountChange(e.target.value)}
                      className="text-lg font-medium border-none bg-transparent text-[#e8d5a9] placeholder-[#e8d5a9]/40 focus-visible:ring-0"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMaxClick}
                    className="h-8 text-xs border-[#8B4513] text-[#d4b37f] hover:bg-[#8B4513]/20 hover:text-[#e8d5a9]"
                  >
                    MAX
                  </Button>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center justify-between space-x-1 w-[130px] h-9 border-[#8B4513] bg-[#1a0f02]/60 text-[#e8d5a9] hover:bg-[#8B4513]/20"
                      >
                        <div className="flex items-center">
                          {renderTokenIcon(fromToken)}
                          <span className="ml-1.5">{fromToken.symbol}</span>
                        </div>
                        <ChevronDown className="h-4 w-4 text-[#d4b37f]" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[300px] bg-[#1a0f02] border-[#8B4513]/30 text-[#e8d5a9]"
                      align="end"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center border border-[#8B4513]/30 rounded-lg p-2">
                          <Search className="h-4 w-4 mr-2 text-[#d4b37f]" />
                          <Input
                            placeholder="Search token"
                            className="border-none bg-transparent text-[#e8d5a9] placeholder-[#e8d5a9]/40 focus-visible:ring-0"
                            value={fromSearchQuery}
                            onChange={(e) => setFromSearchQuery(e.target.value)}
                          />
                          {fromSearchQuery && (
                            <X
                              className="h-4 w-4 cursor-pointer text-[#d4b37f] hover:text-[#e8d5a9]"
                              onClick={() => setFromSearchQuery("")}
                            />
                          )}
                        </div>
                        {renderTokenList(tokens, fromSearchQuery, fromToken)}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-[#e8d5a9]/60">
                    ${fromUsdValue ? fromUsdValue.toFixed(2) : "0.00"}
                  </span>
                </div>
              </div>

              {/* Swap button */}
              <div className="relative flex justify-center my-2">
                <div className="absolute left-1/2 -translate-x-1/2 -mt-[1px] -mb-[1px] flex items-center justify-center w-8 h-8 rounded-full border border-[#8B4513]/40 bg-[#1a0f02] z-10">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 p-0 text-[#d4b37f] hover:bg-[#8B4513]/20 hover:text-[#e8d5a9]"
                    onClick={handleSwapTokens}
                  >
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </div>
                <div className="w-full border-t border-[#8B4513]/30"></div>
              </div>

              {/* To Token */}
              <div className="relative">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-[#d4b37f]">To</span>
                  <span className="text-xs text-[#e8d5a9]/70">
                    Balance:{" "}
                    {toToken.symbol === "ETH"
                      ? isLoadingBalances
                        ? "Loading..."
                        : ethBalance || "0"
                      : isLoadingBalances
                      ? "Loading..."
                      : tokenBalances[toToken.tokenData?.token || ""] || "0"}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex-1">
                    <Input
                      type="number"
                      placeholder="0.0"
                      value={toAmount}
                      onChange={(e) => handleToAmountChange(e.target.value)}
                      className="text-lg font-medium border-none bg-transparent text-[#e8d5a9] placeholder-[#e8d5a9]/40 focus-visible:ring-0"
                    />
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center justify-between space-x-1 w-[130px] h-9 border-[#8B4513] bg-[#1a0f02]/60 text-[#e8d5a9] hover:bg-[#8B4513]/20"
                      >
                        <div className="flex items-center">
                          {renderTokenIcon(toToken)}
                          <span className="ml-1.5">{toToken.symbol}</span>
                        </div>
                        <ChevronDown className="h-4 w-4 text-[#d4b37f]" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[300px] bg-[#1a0f02] border-[#8B4513]/30 text-[#e8d5a9]"
                      align="end"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center border border-[#8B4513]/30 rounded-lg p-2">
                          <Search className="h-4 w-4 mr-2 text-[#d4b37f]" />
                          <Input
                            placeholder="Search token"
                            className="border-none bg-transparent text-[#e8d5a9] placeholder-[#e8d5a9]/40 focus-visible:ring-0"
                            value={toSearchQuery}
                            onChange={(e) => setToSearchQuery(e.target.value)}
                          />
                          {toSearchQuery && (
                            <X
                              className="h-4 w-4 cursor-pointer text-[#d4b37f] hover:text-[#e8d5a9]"
                              onClick={() => setToSearchQuery("")}
                            />
                          )}
                        </div>
                        {renderTokenList(tokens, toSearchQuery, toToken)}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-[#e8d5a9]/60">
                    ${toUsdValue ? toUsdValue.toFixed(2) : "0.00"}
                  </span>
                </div>
              </div>

              {/* Swap Details */}
              <div className="mt-4 pt-4 border-t border-[#8B4513]/30">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <div className="flex items-center text-[#e8d5a9]/70">
                      Rate
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3 w-3 ml-1 text-[#d4b37f]" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[250px] bg-[#1a0f02] border-[#8B4513]/30 text-[#e8d5a9]">
                            <p>The exchange rate between tokens.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <span className="text-[#e8d5a9]">
                      {estimatedPrice
                        ? `1 ${fromToken.symbol} ≈ ${estimatedPrice} ${toToken.symbol}`
                        : "-"}
                    </span>
                  </div>
                  {orderType === "instant" && (
                    <>
                      <div className="flex justify-between">
                        <div className="flex items-center text-[#e8d5a9]/70">
                          Brewing Fee
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3 w-3 ml-1 text-[#d4b37f]" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-[250px] bg-[#1a0f02] border-[#8B4513]/30 text-[#e8d5a9]">
                                <p>
                                  Estimated transaction fee on the blockchain.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <span className="text-[#e8d5a9]">
                          {gasCost ? gasCost : "-"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <div className="flex items-center text-[#e8d5a9]/70">
                          Brew Method
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3 w-3 ml-1 text-[#d4b37f]" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-[250px] bg-[#1a0f02] border-[#8B4513]/30 text-[#e8d5a9]">
                                <p>The path your swap will take.</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <span className="flex items-center text-[#e8d5a9]">
                          <Zap className="h-3 w-3 mr-1 text-[#d4b37f]" />
                          Direct Brew
                        </span>
                      </div>
                    </>
                  )}
                  {orderType === "limit" && (
                    <div className="flex justify-between">
                      <div className="flex items-center text-[#e8d5a9]/70">
                        Freshness
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3 w-3 ml-1 text-[#d4b37f]" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[250px] bg-[#1a0f02] border-[#8B4513]/30 text-[#e8d5a9]">
                              <p>
                                When your limit order will expire if not filled.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <span className="flex items-center text-[#e8d5a9]">
                        <Clock className="h-3 w-3 mr-1 text-[#d4b37f]" />
                        24 Hours
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Connection Status / Action Button */}
              <div className="mt-4">
                {!isConnected || !isAuthenticated ? (
                  <div className="rounded-xl border border-[#8B4513]/40 bg-[#1a0f02]/60 p-4 flex flex-col items-center space-y-2">
                    <p className="text-[#e8d5a9] text-center mb-2">
                      Connect your wallet to swap coffee-powered tokens!
                    </p>
                    <ConnectButton />
                  </div>
                ) : (
                  <Button
                    onClick={
                      orderType === "instant"
                        ? handleSwap
                        : orderType === "limit"
                        ? () => {}
                        : () => {}
                    }
                    disabled={
                      !fromAmount ||
                      isCalculating ||
                      !isTokenSwappable(fromToken) ||
                      !toToken.tokenData
                    }
                    className={`w-full h-12 text-lg font-medium rounded-xl ${
                      !fromAmount ||
                      isCalculating ||
                      !isTokenSwappable(fromToken) ||
                      !toToken.tokenData
                        ? "bg-[#8B4513]/30 text-[#e8d5a9]/50 cursor-not-allowed"
                        : "bg-[#8B4513] hover:bg-[#A0522D] text-[#e8d5a9]"
                    }`}
                  >
                    {isCalculating ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent border-[#e8d5a9]"></div>
                        <span>Brewing...</span>
                      </div>
                    ) : !fromAmount ? (
                      "Enter an amount"
                    ) : orderType === "instant" ? (
                      "Brew Coffee"
                    ) : orderType === "limit" ? (
                      "Place Limit Order"
                    ) : (
                      "Cross-Chain Brew"
                    )}
                  </Button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {activeTransactions.length > 0 && (
        <Card className="overflow-hidden border-[#8B4513]/30 bg-[#1a0f02]/90 backdrop-blur-xl">
          <div className="border-b border-[#8B4513]/30 px-4 py-3">
            <h3 className="text-sm font-medium text-[#e8d5a9]">Recent Brews</h3>
          </div>
          <CardContent className="p-0">
            <div className="divide-y divide-[#8B4513]/30">
              {activeTransactions.map((tx, index) => (
                <div key={index} className="px-4 py-3 flex items-center">
                  <div className="mr-2 h-8 w-8 flex items-center justify-center rounded-full bg-[#8B4513]/20">
                    {tx.status === "pending" ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent border-[#d4b37f]"></div>
                    ) : tx.status === "success" ? (
                      <Check className="h-4 w-4 text-[#92da6c]" />
                    ) : (
                      <X className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#e8d5a9] truncate">
                      {tx.type} {tx.fromSymbol} for {tx.toSymbol}
                    </p>
                    <div className="flex items-center text-xs text-[#e8d5a9]/70">
                      <span className="truncate">
                        {tx.hash ? `${tx.hash.substring(0, 10)}...` : "Brewing"}
                      </span>
                      {tx.hash && (
                        <div className="flex ml-2 space-x-1">
                          <button
                            onClick={() => {
                              if (tx.hash) {
                                navigator.clipboard.writeText(tx.hash);
                              }
                            }}
                            className="hover:text-[#d4b37f]"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                          <a
                            href={`https://etherscan.io/tx/${tx.hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-[#d4b37f]"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-[#e8d5a9]">
                      {tx.fromAmount} {tx.fromSymbol}
                    </p>
                    <div className="flex items-center justify-end text-xs text-[#e8d5a9]/70">
                      <ArrowDown className="h-2 w-2 mx-1 rotate-45" />
                      <span>
                        {tx.toAmount} {tx.toSymbol}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Add TypeScript declaration for the global deBridge object
declare global {
  interface Window {
    deBridge?: {
      widget: (config: any) => void;
    };
  }
}

export default CoinSwap;
