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
      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
        isActive
          ? "bg-[#231f1c] text-[#e0d6cf]"
          : "hover:bg-[#231f1c] text-[#c2b6ab] hover:text-[#e0d6cf]"
      }`}
    >
      <div className="flex items-center flex-1" onClick={handleMainClick}>
        <span
          className={`${isActive ? "text-[#c9804a]" : "text-[#8a7a6d]"} mr-3`}
        >
          {icon}
        </span>
        <span>{label}</span>
      </div>
      {hasSubItems && (
        <span
          className="text-[#8a7a6d] hover:text-[#c9804a] p-1 rounded-full hover:bg-[#231f1c]"
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
      className={`flex items-center pl-11 pr-4 py-2 rounded-lg transition-colors ${
        isActive
          ? "bg-[#231f1c] text-[#e0d6cf]"
          : "hover:bg-[#231f1c] text-[#c2b6ab] hover:text-[#e0d6cf]"
      }`}
    >
      {icon && <span className="mr-2 text-[#8a7a6d]">{icon}</span>}
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
      className="flex flex-col gap-1 pl-11 pr-4 py-2 rounded-lg hover:bg-[#24201d] transition-all"
    >
      <span className="text-sm text-[#c2b6ab] truncate">{title}</span>
      <span className="text-xs text-[#8a7a6d] flex items-center gap-1">
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
    <div className="h-full overflow-y-auto bg-[#151214] py-4">
      <div className="flex items-center px-6 mb-12">
        <div className="w-12 h-12 bg-[#c9804a] rounded-2xl flex items-center justify-center mr-3">
          <Coffee className="h-6 w-6 text-[#151214]" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-white">Brew Station</h2>
        </div>
      </div>

      <nav className="px-3 pb-20">
        <div className="space-y-8">
          {/* Dashboard Section */}
          <div className="space-y-3">
            <div className="px-3">
              <h3 className="text-xs font-medium text-[#8a7a6d] uppercase tracking-wider">
                Dashboard
              </h3>
            </div>
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
              <div className="space-y-1 ml-2 pl-2 border-l-2 border-[#2a2422]">
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
              </div>
            )}
          </div>

          {/* Trading Section */}
          <div className="space-y-3">
            <div className="px-3">
              <h3 className="text-xs font-medium text-[#8a7a6d] uppercase tracking-wider">
                INSIGHTS
              </h3>
            </div>
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
              <div className="space-y-3 ml-2 pl-2 border-l-2 border-[#2a2422]">
                {/* Search Bar */}
                <div className="px-4 py-2">
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8a7a6d]"
                      size={16}
                    />
                    <input
                      type="text"
                      placeholder="Search conversations..."
                      className="w-full bg-[#231f1c] border border-[#2a2422] rounded-lg py-2 pl-9 pr-3 text-sm text-[#e0d6cf] placeholder-[#8a7a6d] focus:outline-none focus:border-[#c9804a]"
                    />
                  </div>
                </div>

                {/* New Chat Button */}
                <div className="px-4 py-2">
                  <Link href={`/chatbot?new=true&t=${Date.now()}`}>
                    <Button
                      className="w-full bg-[#c9804a] hover:bg-[#b77440] text-[#1c1917] border-none hover:shadow-[0_0_10px_rgba(201,128,74,0.3)] transition-all flex items-center justify-center gap-2"
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
                    <span className="text-xs font-medium text-[#8a7a6d] uppercase flex items-center gap-1">
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
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tools Section */}
          <div className="space-y-3">
            <div className="px-3">
              <h3 className="text-xs font-medium text-[#8a7a6d] uppercase tracking-wider">
                Tools
              </h3>
            </div>
            <NavItem
              icon={<Settings size={20} />}
              label="Brew Settings"
              href="/settings"
              isActive={activeSection === "settings"}
              onToggle={() => setActiveSection("settings")}
            />
          </div>
        </div>
      </nav>

      <div className="fixed bottom-0 left-0 w-[var(--sidebar-width,256px)] p-4 bg-gradient-to-t from-[#151214] to-transparent">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-10 h-10 bg-[#c9804a] rounded-full flex items-center justify-center">
            <span className="text-lg font-medium text-[#151214]">N</span>
          </div>
          <div>
            <p className="text-sm font-medium text-[#e0d6cf]">Brew Master</p>
            <p className="text-xs text-[#8a7a6d]">Brewing since Mar 2025</p>
          </div>
        </div>
      </div>
    </div>
  );
}
