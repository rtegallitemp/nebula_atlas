import { Link, useLocation } from "react-router-dom";
import { Home, Play, List, TrendingUp, Award, Zap, Wallet } from "lucide-react";
import { useState } from "react";

interface NavbarProps {
  isConnected: boolean;
  account?: string;
  chainId?: number;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function Navbar({
  isConnected,
  account,
  chainId,
  onConnect,
  onDisconnect,
}: NavbarProps) {
  const location = useLocation();
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  const navItems = [
    { path: "/", icon: Home, label: "Home", color: "from-pink-500 to-rose-500" },
    { path: "/play", icon: Play, label: "Play", color: "from-purple-500 to-indigo-500" },
    { path: "/records", icon: List, label: "Records", color: "from-blue-500 to-cyan-500" },
    { path: "/leaderboard", icon: TrendingUp, label: "Leaderboard", color: "from-indigo-500 to-purple-500" },
    { path: "/badges", icon: Award, label: "Badges", color: "from-amber-500 to-orange-500" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* 侧边导航栏 */}
      <nav className="sidebar-nav">
        {/* Logo */}
        <Link 
          to="/" 
          className="relative group mb-4"
          onMouseEnter={() => setShowTooltip("nebula")}
          onMouseLeave={() => setShowTooltip(null)}
        >
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 p-0.5 group-hover:scale-110 transition-transform duration-300">
              <div className="w-full h-full rounded-2xl bg-gray-950 flex items-center justify-center">
                <Zap className="w-7 h-7 text-pink-400" fill="currentColor" />
              </div>
            </div>
            <div className="absolute -inset-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"></div>
          </div>
          
          {/* Tooltip */}
          {showTooltip === "nebula" && (
            <div className="absolute left-20 top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap border border-pink-500/30 animate-fly-in-2">
              Nebula Atlas
              <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-r-4 border-r-gray-900"></div>
            </div>
          )}
        </Link>

        {/* 分隔线 */}
        <div className="w-10 h-px bg-gradient-to-r from-transparent via-pink-500/50 to-transparent mb-2"></div>

        {/* 导航项 */}
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative group"
              onMouseEnter={() => setShowTooltip(item.path)}
              onMouseLeave={() => setShowTooltip(null)}
            >
              <div className={`sidebar-item ${active ? 'active' : ''}`}>
                <Icon className={`w-6 h-6 ${active ? 'text-pink-400' : 'text-gray-400 group-hover:text-white'} transition-colors duration-300`} />
                
                {active && (
                  <div className="absolute inset-0 bg-gradient-to-br ${item.color} opacity-20 rounded-2xl"></div>
                )}
              </div>

          {/* active indicator */}
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-pink-500 to-purple-500 rounded-r-full"></div>
              )}

              {/* Tooltip */}
              {showTooltip === item.path && (
                <div 
                  className={`absolute left-20 top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap border border-pink-500/30`}
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  {item.label}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-r-4 border-r-gray-900"></div>
                </div>
              )}
            </Link>
          );
        })}

          {/* wallet at bottom */}
        <div className="mt-auto">
          <div className="w-10 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent mb-4"></div>
          
          {isConnected ? (
            <div 
              className="relative group cursor-pointer"
              onMouseEnter={() => setShowTooltip("wallet")}
              onMouseLeave={() => setShowTooltip(null)}
              onClick={onDisconnect}
            >
              <div className="sidebar-item active">
                <Wallet className="w-6 h-6 text-green-400" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-950 animate-pulse"></div>
              </div>

              {showTooltip === "wallet" && (
                <div className="absolute left-20 top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg border border-green-500/30">
                  <div className="font-mono text-xs mb-1">
                    {account?.slice(0, 6)}...{account?.slice(-4)}
                  </div>
                  <div className="text-xs text-gray-400">
                    Chain: {chainId}
                  </div>
                  <div className="text-xs text-red-400 mt-1">
                    Disconnect
                  </div>
                  <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-r-4 border-r-gray-900"></div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onConnect}
              className="relative group"
              onMouseEnter={() => setShowTooltip("connect")}
              onMouseLeave={() => setShowTooltip(null)}
            >
              <div className="sidebar-item hover:scale-110">
                <Wallet className="w-6 h-6 text-gray-400 group-hover:text-pink-400 transition-colors duration-300" />
              </div>

              {showTooltip === "connect" && (
                <div className="absolute left-20 top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap border border-pink-500/30 animate-fly-in-2">
                  Connect Wallet
                  <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-r-4 border-r-gray-900"></div>
                </div>
              )}
            </button>
          )}
        </div>
      </nav>

      {/* top status bar */}
      <div className="fixed top-8 right-8 z-50 flex items-center gap-3 pointer-events-auto">
        {isConnected && chainId && (
          <div className="neon-card">
            <div className="neon-card-inner px-4 py-2 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" aria-hidden="true"></div>
              <span className="text-sm font-medium text-green-400">
                L{chainId}
              </span>
            </div>
          </div>
        )}

        {isConnected && account && (
          <div className="neon-card">
            <div className="neon-card-inner px-4 py-2">
              <span className="text-sm font-mono text-gray-300">
                {account.slice(0, 6)}...{account.slice(-4)}
              </span>
            </div>
          </div>
        )}
        {!isConnected && (
          <button onClick={onConnect} className="px-4 py-2 btn-neon text-sm rounded-xl">
            Connect
          </button>
        )}
      </div>
    </>
  );
}
