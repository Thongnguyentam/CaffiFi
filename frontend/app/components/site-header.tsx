"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  NavigationMenu,
  NavItem,
  globalStyles,
} from "@/app/components/ui/navigation-menu";
import {
  Search,
  LineChart,
  Swords,
  TrendingUp,
  Users,
  Rocket,
  Target,
  Settings2,
  Wallet,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useWallet } from "../providers/WalletProvider";

// Matrix-style text scramble effect for the logo
class TextScramble {
  el: HTMLElement;
  chars: string;
  queue: Array<{
    from: string;
    to: string;
    start: number;
    end: number;
    char?: string;
  }>;
  frame: number;
  frameRequest: number;
  resolve: (value: void | PromiseLike<void>) => void;

  constructor(el: HTMLElement) {
    this.el = el;
    this.chars = "!<>-_\\/[]{}—=+*^?#₿Ξ◎Ð₳₮";
    this.queue = [];
    this.frame = 0;
    this.frameRequest = 0;
    this.resolve = () => {};
    this.update = this.update.bind(this);
  }

  setText(newText: string) {
    const oldText = this.el.innerText;
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise<void>((resolve) => (this.resolve = resolve));
    this.queue = [];

    for (let i = 0; i < length; i++) {
      const from = oldText[i] || "";
      const to = newText[i] || "";
      const start = Math.floor(Math.random() * 40);
      const end = start + Math.floor(Math.random() * 40);
      this.queue.push({ from, to, start, end });
    }

    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  }

  update() {
    let output = "";
    let complete = 0;

    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i];
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.chars[Math.floor(Math.random() * this.chars.length)];
          this.queue[i].char = char;
        }
        output += `<span class="dud">${char}</span>`;
      } else {
        output += from;
      }
    }

    this.el.innerHTML = output;
    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  }
}

// Matrix-style connect button for when not using RainbowKit
const MatrixConnectButton = () => {
  const router = useRouter();
  const { connect, isConnected } = useWallet();
  const [buttonHovered, setButtonHovered] = useState(false);

  const handleConnectClick = async () => {
    try {
      if (!isConnected) {
        await connect();
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      router.push("/dashboard");
    }
  };

  return (
    <button
      onClick={handleConnectClick}
      onMouseEnter={() => setButtonHovered(true)}
      onMouseLeave={() => setButtonHovered(false)}
      className={`px-4 py-2 rounded-md text-sm font-bold transition-all duration-300 ${
        buttonHovered
          ? "bg-sky-400 text-black shadow-[0_0_10px_rgba(56,189,248,0.7)]"
          : "bg-transparent border border-sky-400 text-sky-400"
      }`}
    >
      <div className="flex items-center">
        <Wallet className="mr-2 h-4 w-4" />
        <span>{isConnected ? "DASHBOARD" : "CONNECT"}</span>
      </div>
    </button>
  );
};

// Coffee-themed connect wallet button
const CoffeeConnectButton = () => {
  const router = useRouter();
  const { connect, isConnected } = useWallet();

  const handleConnectWallet = async () => {
    try {
      if (!isConnected) {
        await connect();
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      router.push("/dashboard");
    }
  };

  return (
    <button
      className="bg-[#8B4513] hover:bg-[#A0522D] px-6 py-2 rounded-lg transition-all transform hover:translate-y-[-2px] hover:shadow-[0_8px_16px_rgba(139,69,19,0.3)] active:translate-y-0 text-[#e8d5a9]"
      onClick={handleConnectWallet}
    >
      Connect Wallet
    </button>
  );
};

export function SiteHeader() {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const logoRef = useRef<HTMLSpanElement>(null);
  const scramblerRef = useRef<TextScramble | null>(null);
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  // Use wagmi account hook
  const { address, isConnected } = useAccount();

  // Use our wallet context
  const { disconnect, connect } = useWallet();

  // Initialize text scramble effect for logo
  useEffect(() => {
    if (logoRef.current && !scramblerRef.current) {
      scramblerRef.current = new TextScramble(logoRef.current);
      setMounted(true);
    }
  }, []);

  // Apply text scramble effect on hover
  const handleLogoHover = () => {
    if (scramblerRef.current) {
      scramblerRef.current.setText("CaffiFi");
    }
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Close mobile menu when path changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Function to handle the "Connect Wallet" button click
  const handleConnectWallet = async () => {
    try {
      if (!isConnected) {
        console.log("Attempting to connect wallet...");
        await connect();
        console.log("Wallet connected successfully");
        // WalletProvider will handle redirection to dashboard after successful connection
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

  // Load authentication state and user data from localStorage on component mount
  useEffect(() => {
    // Check if connected via wagmi
    if (isConnected && address) {
      setIsAuthenticated(true);
      setUserAddress(address);
      return;
    }

    // Clear authentication if disconnected
    if (!isConnected) {
      setIsAuthenticated(false);
      setUserAddress(null);
      return;
    }

    // Only check localStorage if wagmi isn't connected
    const savedAuth = localStorage.getItem("isAuthenticated");
    const savedAddress = localStorage.getItem("userAddress");

    if (savedAuth === "true" && savedAddress) {
      setIsAuthenticated(true);
      setUserAddress(savedAddress);
    } else {
      setIsAuthenticated(false);
      setUserAddress(null);
    }
  }, [isConnected, address]);

  const menuItems = useMemo(
    (): NavItem[] => [
      { label: "Marketcap", href: "/marketcap" },
      { label: "Marketplace", href: "/marketplace" },
      { label: "Prediction Markets", href: "/bets" },
    ],
    []
  );

  const authenticatedMenuItems = useMemo(
    (): NavItem[] => [
      { label: "Marketcap", href: "/marketcap" },
      { label: "Bets", href: "/bets" },
      { label: "Launch Tokens", href: "/launch" },
      { label: "Create Bets", href: "/bets/create" },
      { label: "Quick Swap", href: "/dashboard/quick-swap" },
    ],
    []
  );

  return (
    // Coffee-themed header for all pages
    <nav className="container mx-auto px-6 py-4 flex items-center justify-between relative z-20">
      <div className="flex items-center gap-2 transform hover:scale-105 transition-transform">
        <Image src="/logo-nobg.svg" alt="CaffiFi Logo" width={40} height={40} />
        <Link href="/" className="text-2xl font-bold text-[#d4b37f]">
          CaffiFi
        </Link>
      </div>

      <div className="hidden md:flex items-center gap-8">
        {(isAuthenticated ? authenticatedMenuItems : menuItems).map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`transition-all transform hover:translate-y-[-2px] px-4 py-1.5 rounded-lg ${
              pathname === item.href
                ? "text-[#e8d5a9] font-bold bg-[#8B4513]/80 border border-[#d4b37f]/40 shadow-[0_4px_12px_rgba(139,69,19,0.2)]"
                : "text-[#e8d5a9] hover:text-[#d4b37f] hover:bg-[#8B4513]/20"
            }`}
          >
            {item.label}
          </Link>
        ))}
        {isAuthenticated ? (
          <Link
            href="/dashboard"
            className={`transition-all transform hover:translate-y-[-2px] px-6 py-2 rounded-lg ${
              pathname.includes("/dashboard")
                ? "text-[#e8d5a9] font-bold bg-[#8B4513]/80 border border-[#d4b37f]/40 shadow-[0_4px_12px_rgba(139,69,19,0.2)]"
                : "bg-[#8B4513] hover:bg-[#A0522D] text-[#e8d5a9] hover:shadow-[0_8px_16px_rgba(139,69,19,0.3)] active:translate-y-0"
            }`}
          >
            Dashboard
          </Link>
        ) : (
          <button
            className="bg-[#8B4513] hover:bg-[#A0522D] px-6 py-2 rounded-lg transition-all transform hover:translate-y-[-2px] hover:shadow-[0_8px_16px_rgba(139,69,19,0.3)] active:translate-y-0 text-[#e8d5a9]"
            onClick={handleConnectWallet}
          >
            Connect Wallet
          </button>
        )}
      </div>

      {/* Mobile menu toggle */}
      <button className="md:hidden text-[#e8d5a9]" onClick={toggleMobileMenu}>
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-[#1a0f02] p-4 md:hidden z-50">
          <div className="flex flex-col space-y-4">
            {(isAuthenticated ? authenticatedMenuItems : menuItems).map(
              (item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    pathname === item.href
                      ? "text-[#e8d5a9] font-bold bg-[#8B4513]/80 border border-[#d4b37f]/40 shadow-[0_4px_12px_rgba(139,69,19,0.2)]"
                      : "text-[#e8d5a9] hover:text-[#d4b37f] hover:bg-[#8B4513]/20"
                  }`}
                >
                  {item.label}
                </Link>
              )
            )}
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className={`px-6 py-2 rounded-lg transition-all text-center ${
                  pathname.includes("/dashboard")
                    ? "text-[#e8d5a9] font-bold bg-[#8B4513]/80 border border-[#d4b37f]/40 shadow-[0_4px_12px_rgba(139,69,19,0.2)]"
                    : "bg-[#8B4513] hover:bg-[#A0522D] text-[#e8d5a9]"
                }`}
              >
                Dashboard
              </Link>
            ) : (
              <button
                className="bg-[#8B4513] hover:bg-[#A0522D] px-6 py-2 rounded-lg text-[#e8d5a9] text-center"
                onClick={handleConnectWallet}
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default SiteHeader;
