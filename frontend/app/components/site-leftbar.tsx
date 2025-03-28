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
          ? "bg-[#3a1e0a] border-l-2 border-[#d4b37f] text-[#ffffff] shadow-[0_0_10px_rgba(212,179,127,0.2)]"
          : "hover:bg-[#3a1e0a]/70 text-[#e8d5a9]/70 hover:text-[#e8d5a9] hover:shadow-[0_0_5px_rgba(212,179,127,0.1)]"
      }`}
    >
      <div className="flex items-center flex-1" onClick={handleMainClick}>
        <span
          className={`${isActive ? "text-[#d4b37f]" : "text-[#8B4513]"} mr-3`}
        >
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
}

const SubNavItem = ({ label, href, isActive = false }: SubNavItemProps) => {
  return (
    <Link
      href={href}
      className={`flex items-center pl-11 pr-4 py-2 rounded-lg transition-all ${
        isActive
          ? "bg-[#3a1e0a]/80 text-[#d4b37f] shadow-[0_0_8px_rgba(212,179,127,0.15)]"
          : "hover:bg-[#3a1e0a]/60 text-[#e8d5a9]/60 hover:text-[#d4b37f] hover:shadow-[0_0_5px_rgba(212,179,127,0.1)]"
      }`}
    >
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
      className="flex flex-col gap-1 pl-11 pr-4 py-2 rounded-lg hover:bg-[#3a1e0a]/60 transition-all hover:shadow-[0_0_5px_rgba(212,179,127,0.1)]"
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
    <div className="h-full overflow-y-auto bg-[#1a0f02]/90 backdrop-blur-sm border-r border-[#8B4513]/40 py-4">
      <div className="px-4 pt-5 mb-6">
        <div className="text-[#d4b37f] text-xs uppercase tracking-wider mb-2 opacity-70">
          CaffiFi BREW STATION
        </div>
        <div className="h-0.5 bg-gradient-to-r from-[#d4b37f] to-[#8B4513]"></div>
      </div>

      <nav className="space-y-1 px-2 pb-20">
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
          <div className="pt-1 pb-1">
            <SubNavItem
              label="My Portfolio"
              href="/dashboard/portfolio"
              isActive={pathname === "/dashboard/portfolio"}
            />
            <SubNavItem
              label="Quick Swap"
              href="/dashboard/quick-swap"
              isActive={pathname === "/dashboard/quick-swap"}
            />
            <SubNavItem
              label="My Bets"
              href="/dashboard/my-bets"
              isActive={pathname === "/dashboard/my-bets"}
            />
            <SubNavItem
              label="My Tokens"
              href="/dashboard/my-tokens"
              isActive={pathname === "/dashboard/my-tokens"}
            />
            <SubNavItem
              label="Shill Manager"
              href="/dashboard/shill-manager"
              isActive={pathname === "/dashboard/shill-manager"}
            />
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
          <div className="pt-1 pb-1">
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
                  className="w-full bg-[#3a1e0a]/50 border border-[#8B4513]/50 rounded-lg py-2 pl-9 pr-3 text-sm text-[#e8d5a9] placeholder-[#d4b37f]/50 focus:outline-none focus:ring-1 focus:ring-[#d4b37f] focus:border-[#8B4513]"
                />
              </div>
            </div>

            {/* New Chat Button */}
            <div className="px-4 py-2">
              <Link href={`/chatbot?new=true&t=${Date.now()}`}>
                <Button
                  className="w-full bg-[#3a1e0a] hover:bg-[#8B4513] text-[#e8d5a9] border border-[#8B4513]/50 hover:border-[#d4b37f] hover:shadow-[0_0_10px_rgba(212,179,127,0.3)] transition-all flex items-center justify-center gap-2"
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
                <span className="text-xs font-medium text-[#d4b37f] uppercase">
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

        {/* Watchlist */}
        <NavItem
          icon={<Bookmark size={20} />}
          label="Bean Watchlist"
          href="/watchlist"
          isActive={activeSection === "watchlist"}
          onToggle={() => setActiveSection("watchlist")}
        />

        {/* Settings */}
        <NavItem
          icon={<Settings size={20} />}
          label="Brew Settings"
          href="/settings"
          isActive={activeSection === "settings"}
          onToggle={() => setActiveSection("settings")}
        />
      </nav>
    </div>
  );
}
