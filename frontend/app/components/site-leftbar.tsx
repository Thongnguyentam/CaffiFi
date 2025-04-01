"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useWallet } from "../providers/WalletProvider";
import {
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  Wallet,
  Dices,
  Coins,
  Share2,
  Bot,
  Settings,
  Search,
  MessageSquare,
  Clock,
  Bookmark,
  Plus,
  Zap,
  BarChart2,
  TrendingUp,
  Copy,
  ExternalLink,
  LogOut,
  Coffee,
  CupSoda,
  CircleDot,
} from "lucide-react";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href?: string;
  hasSubItems?: boolean;
  isActive?: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
}

const NavItem = ({
  icon,
  label,
  href,
  hasSubItems = false,
  isActive = false,
  isExpanded = false,
  onToggle,
}: NavItemProps) => {
  const router = useRouter();

  // Handle click on the main part of the nav item
  const handleMainClick = (e: React.MouseEvent) => {
    if (href) {
      router.push(href);
    }
    // If it has sub-items, also toggle the expansion
    if (hasSubItems && onToggle) {
      onToggle();
    }
  };

  // Handle click on the dropdown icon
  const handleToggleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggle) {
      onToggle();
    }
  };

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer ${
        isActive
          ? "bg-[#8B4513] text-white shadow-[0_0_15px_rgba(139,69,19,0.4)]"
          : "hover:bg-[#8B4513]/20 text-[#e8d5a9]/80 hover:text-[#e8d5a9]"
      }`}
    >
      <div className="flex items-center flex-1" onClick={handleMainClick}>
        <span className={`${isActive ? "text-white" : "text-[#d4b37f]"} mr-3`}>
          {icon}
        </span>
        <span>{label}</span>
      </div>
      {hasSubItems && (
        <span
          className="text-[#e8d5a9]/50 hover:text-[#d4b37f] p-1 rounded-full hover:bg-[#3a1e0a]"
          onClick={handleToggleClick}
        >
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
      )}
    </div>
  );
};

interface SubNavItemProps {
  label: string;
  href: string;
  isActive?: boolean;
  icon?: React.ReactNode;
}

const SubNavItem = ({
  label,
  href,
  isActive = false,
  icon,
}: SubNavItemProps) => {
  return (
    <Link
      href={href}
      className={`flex items-center pl-11 pr-4 py-2 rounded-lg transition-all ${
        isActive
          ? "bg-[#3a1e0a] text-white shadow-[0_0_10px_rgba(212,179,127,0.2)]"
          : "hover:bg-[#3a1e0a]/40 text-[#e8d5a9]/60 hover:text-[#d4b37f]"
      }`}
    >
      {icon && <span className="mr-2 text-[#d4b37f]">{icon}</span>}
      <span>{label}</span>
    </Link>
  );
};

interface ChatHistoryItemProps {
  title: string;
  date: string;
  href: string;
}

const ChatHistoryItem = ({ title, date, href }: ChatHistoryItemProps) => {
  return (
    <Link
      href={href}
      className="flex flex-col gap-1 pl-11 pr-4 py-2 rounded-lg hover:bg-[#3a1e0a]/40 transition-all"
    >
      <span className="text-sm text-[#e8d5a9] truncate">{title}</span>
      <span className="text-xs text-[#e8d5a9]/50 flex items-center gap-1">
        <Clock size={12} />
        {date}
      </span>
    </Link>
  );
};

export function SiteLeftbar() {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "dashboard",
  ]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { isConnected } = useWallet();

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const savedAuth = localStorage.getItem("isAuthenticated");
      setIsAuthenticated(isConnected || savedAuth === "true");
    };

    // Check on initial load
    checkAuth();

    // Listen for storage changes (for cross-tab synchronization)
    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, [isConnected]);

  // Determine active section and expanded sections based on current path
  useEffect(() => {
    if (pathname === "/" || pathname.includes("/dashboard")) {
      setActiveSection("dashboard");
      if (!expandedSections.includes("dashboard")) {
        setExpandedSections((prev) => [...prev, "dashboard"]);
      }
    } else if (
      pathname.includes("/chatbot") ||
      pathname.includes("/hedge-bot")
    ) {
      setActiveSection("hedge-bot");
      if (!expandedSections.includes("hedge-bot")) {
        setExpandedSections((prev) => [...prev, "hedge-bot"]);
      }
    } else if (pathname.includes("/coins")) {
      setActiveSection("coins");
      if (!expandedSections.includes("coins")) {
        setExpandedSections((prev) => [...prev, "coins"]);
      }
    } else if (pathname.includes("/settings")) {
      setActiveSection("settings");
    } else if (pathname.includes("/watchlist")) {
      setActiveSection("watchlist");
    }
  }, [pathname, expandedSections]);

  const toggleSection = (section: string) => {
    setActiveSection(section);

    // Toggle the expanded state
    if (expandedSections.includes(section)) {
      setExpandedSections(expandedSections.filter((s) => s !== section));
    } else {
      setExpandedSections([...expandedSections, section]);
    }
  };

  // Mock chat history data
  const chatHistory = [
    { title: "Meme coin analysis", date: "2h ago", href: "/chatbot" },
    {
      title: "Market trends research",
      date: "Yesterday",
      href: "/chatbot",
    },
    {
      title: "Portfolio optimization",
      date: "3 days ago",
      href: "/chatbot",
    },
    { title: "Risk assessment", date: "1 week ago", href: "/chatbot" },
    {
      title: "Token launch strategy",
      date: "2 weeks ago",
      href: "/chatbot",
    },
  ];

  // If not authenticated, don't render the sidebar
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-[#1a0f02] to-[#2c1809] border-r border-[#A0522D]/30 py-4">
      <div className="flex items-center justify-center mb-8 mt-2">
        <div className="relative p-2 bg-[#3a1e0a] rounded-full shadow-[0_0_20px_rgba(160,82,45,0.3)]">
          <Coffee className="h-10 w-10 text-[#d4b37f]" />
          <div className="absolute -top-1 -right-1 bg-[#8B4513] text-[#e8d5a9] rounded-full p-1">
            <CircleDot className="h-3 w-3" />
          </div>
        </div>
        <div className="ml-3">
          <h2 className="text-xl font-bold text-[#d4b37f]">CaffiFi</h2>
          <p className="text-xs text-[#e8d5a9]/60">Brew Station</p>
        </div>
      </div>

      <nav className="space-y-1 px-3 pb-20">
        <div className="space-y-3">
          {/* Dashboard Section */}
          <NavItem
            icon={<LayoutDashboard size={20} />}
            label="Brew Dashboard"
            href="/dashboard"
            hasSubItems={true}
            isActive={activeSection === "dashboard"}
            isExpanded={expandedSections.includes("dashboard")}
            onToggle={() => toggleSection("dashboard")}
          />

          {expandedSections.includes("dashboard") && (
            <div className="space-y-1 ml-2 pl-2 border-l-2 border-[#8B4513]/30">
              <SubNavItem
                label="My Portfolio"
                href="/dashboard/portfolio"
                isActive={pathname === "/dashboard/portfolio"}
                icon={<Coins size={14} />}
              />
              <SubNavItem
                label="Quick Swap"
                href="/dashboard/quick-swap"
                isActive={pathname === "/dashboard/quick-swap"}
                icon={<Zap size={14} />}
              />
              <SubNavItem
                label="My Bets"
                href="/dashboard/my-bets"
                isActive={pathname === "/dashboard/my-bets"}
                icon={<Dices size={14} />}
              />
              <SubNavItem
                label="My Tokens"
                href="/dashboard/my-tokens"
                isActive={pathname === "/dashboard/my-tokens"}
                icon={<TrendingUp size={14} />}
              />
              {/* <SubNavItem
                label="Shill Manager"
                href="/dashboard/shill-manager"
                isActive={pathname === "/dashboard/shill-manager"}
                icon={<Share2 size={14} />}
              /> */}
            </div>
          )}

          {/* Chat Bot Section */}
          <NavItem
            icon={<Bot size={20} />}
            label="Barista Bot"
            href="/chatbot"
            hasSubItems={true}
            isActive={activeSection === "hedge-bot"}
            isExpanded={expandedSections.includes("hedge-bot")}
            onToggle={() => toggleSection("hedge-bot")}
          />

          {expandedSections.includes("hedge-bot") && (
            <div className="space-y-3 ml-2 pl-2 border-l-2 border-[#8B4513]/30">
              {/* Search Bar */}
              <div className="px-4 py-2">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#d4b37f]"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    className="w-full bg-[#3a1e0a]/40 border border-[#8B4513]/40 rounded-lg py-2 pl-9 pr-3 text-sm text-[#e8d5a9] placeholder-[#d4b37f]/40 focus:outline-none focus:ring-1 focus:ring-[#d4b37f] focus:border-[#8B4513]"
                  />
                </div>
              </div>

              {/* New Chat Button */}
              <div className="px-4 py-2">
                <Link href={`/chatbot?new=true&t=${Date.now()}`}>
                  <Button
                    className="w-full bg-[#8B4513] hover:bg-[#A0522D] text-[#e8d5a9] border-none hover:shadow-[0_0_10px_rgba(212,179,127,0.3)] transition-all flex items-center justify-center gap-2"
                    size="sm"
                  >
                    <Plus size={16} />
                    <span>New Chat</span>
                  </Button>
                </Link>
              </div>

              {/* Chat History */}
              <div className="mt-2">
                <div className="flex items-center justify-between px-4 py-2">
                  <span className="text-xs font-medium text-[#d4b37f] uppercase flex items-center gap-1">
                    <Clock size={12} />
                    Recent Chats
                  </span>
                </div>
                <div className="space-y-1">
                  {chatHistory.slice(0, 5).map((chat, index) => (
                    <ChatHistoryItem
                      key={index}
                      title={chat.title}
                      date={chat.date}
                      href={chat.href}
                    />
                  ))}
                  {chatHistory.length > 5 && (
                    <Link
                      href="/chatbot/history"
                      className="flex items-center justify-center py-2 text-sm text-[#d4b37f] hover:text-[#e8d5a9] transition-colors"
                    >
                      View more
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Settings */}
          <NavItem
            icon={<Settings size={20} />}
            label="Brew Settings"
            href="/settings"
            isActive={activeSection === "settings"}
            onToggle={() => setActiveSection("settings")}
          />
        </div>
      </nav>

      <div className="fixed bottom-0 left-0 w-[var(--sidebar-width,256px)] p-4 bg-gradient-to-t from-[#1a0f02] to-transparent">
        <div className="bg-[#8B4513]/30 rounded-lg p-3 flex items-center gap-3">
          <CupSoda className="text-[#d4b37f] h-8 w-8" />
          <div>
            <p className="text-xs text-[#e8d5a9]/70">Brewing since</p>
            <p className="text-sm font-medium text-[#d4b37f]">Mar 2025</p>
          </div>
        </div>
      </div>
    </div>
  );
}
