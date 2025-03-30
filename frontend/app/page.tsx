"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useWallet } from "./providers/WalletProvider";
import Image from "next/image";
import { AppLayout } from "./components/app-layout";

export default function Home(): JSX.Element {
  const router = useRouter();
  const { isConnected, connect } = useWallet();

  // Check authentication status
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const savedAuth = localStorage.getItem("isAuthenticated") === "true";
    setIsAuthenticated(isConnected || savedAuth);

    // If authenticated, redirect to dashboard
    if (isConnected || savedAuth) {
      router.push("/dashboard");
    }
  }, [isConnected, router]);

  // Function to handle the "Connect Wallet" button click
  const handleConnectWallet = async () => {
    try {
      if (!isConnected) {
        console.log("Attempting to connect wallet from landing page...");
        await connect();
        console.log("Wallet connected successfully");
        // The WalletProvider will handle redirection after successful connection
      } else {
        console.log("Already connected, navigating to dashboard");
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      alert(
        "Failed to connect wallet. Please make sure MetaMask is installed and unlocked."
      );
    }
  };

  return (
    <AppLayout>
      {/* Glowing background */}
      <div className="fixed inset-0 bg-[#1a0f02] z-0">
        <div className="absolute inset-0 bg-gradient-radial from-[#3a1e0a] via-[#1a0f02] to-[#1a0f02] opacity-60"></div>
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-[#3a1e0a] to-transparent opacity-20"></div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto flex flex-col justify-center items-center relative z-10 h-screen">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-6xl relative -mt-24">
          {/* Left: Moka Pot */}
          <div className="md:absolute md:-left-20 lg:-left-32 flex justify-center mb-8 md:mb-0">
            <div className="relative">
              <Image
                src="/mokapot.png"
                alt="Moka Pot"
                width={280}
                height={280}
                className="animate-float drop-shadow-[0_0_15px_rgba(139,69,19,0.6)]"
                style={{ animationDelay: "0.2s" }}
                priority
              />
              <div className="absolute -top-10 left-1/2 w-8 h-8 bg-[#8B4513] opacity-30 rounded-full blur-md animate-steam"></div>
              <div
                className="absolute -top-12 left-1/3 w-6 h-6 bg-[#8B4513] opacity-30 rounded-full blur-md animate-steam-delayed"
                style={{ animationDelay: "1.2s" }}
              ></div>
            </div>
          </div>

          {/* Center: Text */}
          <div className="text-center mx-auto max-w-3xl px-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-[#e8c992] transform hover:scale-105 transition-transform drop-shadow-[0_0_10px_rgba(219,182,108,0.7)] whitespace-nowrap">
              Brew the Future of Memes
            </h1>
            <p className="text-lg md:text-xl mb-8 text-[#e8d5a9]">
              Brewed fresh on The Expresso Network.
            </p>
            <button
              className="bg-[#8B4513] hover:bg-[#A0522D] px-8 py-3 rounded-lg text-lg font-semibold transition-all transform hover:translate-y-[-4px] hover:shadow-[0_0_20px_rgba(139,69,19,0.8)] active:translate-y-0 text-[#e8d5a9]"
              onClick={handleConnectWallet}
            >
              Get Brewing
            </button>
          </div>

          {/* Coffee beans in hero section (absolutely positioned) */}
          <div className="md:absolute md:right-0 lg:-right-20 md:-top-32 z-0 hidden md:block">
            <Image
              src="/coffeebean.png"
              alt="Coffee Bean"
              width={220}
              height={220}
              className="animate-float-slow"
              style={{ animationDelay: "0.5s" }}
              priority
            />
          </div>
          <div className="md:absolute md:right-30 lg:-right-8 md:top-35 opacity-60 z-0 hidden md:block">
            <Image
              src="/coffeebean.png"
              alt="Coffee Bean"
              width={130}
              height={130}
              className="animate-float-delayed"
              style={{ animationDelay: "1.5s" }}
              priority
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
