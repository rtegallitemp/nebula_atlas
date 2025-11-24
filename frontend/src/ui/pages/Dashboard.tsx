import { RefObject } from "react";
import { useNavigate } from "react-router-dom";
import { Rocket, Trophy, Star, Zap, Sparkles, Globe } from "lucide-react";
import { ethers } from "ethers";
import { FhevmInstance } from "../../web3/fhevm/fhevmTypes";

interface DashboardProps {
  isConnected: boolean;
  account?: string;
  fhevmInstance: FhevmInstance | undefined;
  fhevmStatus: string;
  ethersSigner: ethers.JsonRpcSigner | undefined;
  ethersReadonlyProvider: ethers.ContractRunner | undefined;
  chainId: number | undefined;
  sameChain: RefObject<(chainId: number | undefined) => boolean>;
  sameSigner: RefObject<
    (ethersSigner: ethers.JsonRpcSigner | undefined) => boolean
  >;
}

export function Dashboard({
  isConnected,
  fhevmInstance,
  fhevmStatus,
}: DashboardProps) {
  const navigate = useNavigate();

  const stats = [
    { icon: Trophy, label: "历史最高", value: "0", color: "from-amber-500 to-orange-500" },
    { icon: Star, label: "总游戏数", value: "0", color: "from-blue-500 to-cyan-500" },
    { icon: Zap, label: "勋章数量", value: "0", color: "from-purple-500 to-pink-500" },
  ];

  const quickActions = [
    {
      title: "开始征途",
      desc: "探索未知国度",
      icon: Rocket,
      color: "from-pink-500 via-purple-500 to-indigo-500",
      action: () => navigate("/play"),
    },
    {
      title: "我的旅程",
      desc: "回顾历史记录",
      icon: Globe,
      color: "from-cyan-500 via-blue-500 to-purple-500",
      action: () => navigate("/records"),
    },
    {
      title: "星际荣耀",
      desc: "查看勋章成就",
      icon: Sparkles,
      color: "from-yellow-500 via-orange-500 to-red-500",
      action: () => navigate("/badges"),
    },
  ];

  return (
    <div className="min-h-screen pl-20 pr-8 py-12">
      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        {/* 英雄区块 */}
        <div className="relative">
          {/* 背景光斑 */}
          <div className="glow-orb w-[600px] h-[600px] bg-pink-500 -top-48 -right-48"></div>
          <div className="glow-orb w-[500px] h-[500px] bg-purple-500 top-32 -left-64"></div>

          <div className="relative">
            <h1 className="text-7xl font-bold mb-6 float">
              <span className="text-gradient-pink">Nebula</span>
              <span className="text-white"> Atlas</span>
            </h1>
            <p className="text-2xl text-gray-400 mb-8">
              星际地理探索，由区块链保护你的荣耀
            </p>

            {/* 状态指示器 */}
            <div className="flex items-center gap-6 mb-12">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-600'} ${isConnected ? 'animate-pulse' : ''}`}></div>
                <span className="text-sm text-gray-400">
                  钱包: {isConnected ? "已连接" : "未连接"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${fhevmStatus === 'ready' ? 'bg-cyan-500' : fhevmStatus === 'loading' ? 'bg-yellow-500' : 'bg-gray-600'} ${fhevmStatus === 'loading' ? 'animate-pulse' : ''}`}></div>
                <span className="text-sm text-gray-400">
                  FHEVM: {fhevmStatus === 'ready' ? '就绪' : fhevmStatus === 'loading' ? '加载中' : '待机'}
                </span>
              </div>
            </div>

            {/* 快速行动卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {quickActions.map((action, idx) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.title}
                    onClick={action.action}
                    className="group relative overflow-hidden"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <div className="neon-card h-full hover-lift">
                      <div className="neon-card-inner p-8 h-full flex flex-col items-start">
                        {/* 背景图标 */}
                        <div className="absolute -right-8 -bottom-8 opacity-5 rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-all duration-500">
                          <Icon className="w-48 h-48" />
                        </div>

                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${action.color} p-0.5 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                          <div className="w-full h-full rounded-2xl bg-gray-950 flex items-center justify-center">
                            <Icon className="w-8 h-8 text-white" />
                          </div>
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-gradient-pink transition-all duration-300">
                          {action.title}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {action.desc}
                        </p>

                        <div className="mt-auto pt-6 flex items-center text-pink-400 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                          开始 <span className="ml-2">→</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 数据统计 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div 
                key={stat.label} 
                className="neon-card"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="neon-card-inner p-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <Sparkles className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="text-4xl font-bold text-white mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-400">
                    {stat.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 功能介绍 */}
        <div className="neon-card">
          <div className="neon-card-inner p-12">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              探索星际地理的奥秘
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">加密你的成绩</h3>
                    <p className="text-gray-400 text-sm">
                      使用 FHEVM 全同态加密技术，保护你的游戏数据隐私
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">区块链存证</h3>
                    <p className="text-gray-400 text-sm">
                      每一次游戏都被永久记录在链上，不可篡改
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">解锁成就勋章</h3>
                    <p className="text-gray-400 text-sm">
                      完成挑战，收集独特的链上勋章，展示你的实力
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">公平竞技</h3>
                    <p className="text-gray-400 text-sm">
                      透明的规则，去中心化的验证，公平公正
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        {!isConnected && (
          <div className="neon-card">
            <div className="neon-card-inner p-12 text-center">
              <Rocket className="w-24 h-24 mx-auto mb-6 text-pink-500 float" />
              <h2 className="text-3xl font-bold text-white mb-4">
                准备好开始你的征途了吗？
              </h2>
              <p className="text-gray-400 mb-8">
                连接钱包，加入星际探索者的行列
              </p>
              <button className="px-12 py-5 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-2xl font-bold text-white text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 pulse-glow">
                连接钱包
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
