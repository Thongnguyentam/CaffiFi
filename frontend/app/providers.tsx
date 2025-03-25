"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WalletProvider } from "./providers/WalletProvider";
import { AuthGuard } from "./providers/AuthGuard";
import { WagmiProvider, createConfig, http } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";

// Configure custom Orbit testnet
const espressoOrbit = {
  id: 10000096,
  name: "Espresso Orbit Devnet",
  network: "espressoOrbit",
  nativeCurrency: {
    decimals: 18,
    name: "Ethereum",
    symbol: "ETH",
  },
  rpcUrls: {
    public: { http: ["http://127.0.0.1:8547"] },
    default: { http: ["http://127.0.0.1:8547"] },
  },
  blockExplorers: {
    default: {
      name: "Local Explorer",
      url: "", // Leave empty if no block explorer
    },
  },
  testnet: true,
};


// Configure custom Hardhat testnet
const hardhatTestnet = {
  id: 31337,
  name: "Hardhat",
  network: "hardhat",
  nativeCurrency: {
    decimals: 18,
    name: "Ethereum",
    symbol: "ETH",
  },
  rpcUrls: {
    public: { http: ["http://127.0.0.1:8545"] },
    default: { http: ["http://127.0.0.1:8545"] },
  },
  blockExplorers: {
    default: {
      name: "Block Explorer",
      url: "http://localhost:8545", // Local explorer if you have one
    },
  },
  testnet: true,
};

// Create wagmi config
const config = createConfig({
  chains: [espressoOrbit, hardhatTestnet],
  transports: {
    [espressoOrbit.id]: http(),
    [hardhatTestnet.id]: http(),
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <NextThemesProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <WalletProvider>
              <AuthGuard>{children}</AuthGuard>
            </WalletProvider>
          </NextThemesProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
