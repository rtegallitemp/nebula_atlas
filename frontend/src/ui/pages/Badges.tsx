import { ethers } from "ethers";
import { useEffect, useMemo, useState } from "react";
import { Medal, Sparkles, Trophy, Flame, Clock, Star, Crown, Lock } from "lucide-react";
import { NebulaAtlasABI } from "../../abi/NebulaAtlasABI";
import { NebulaAtlasAddresses } from "../../abi/NebulaAtlasAddresses";

export function Badges({
  account,
  ethersReadonlyProvider,
  chainId,
  ethersSigner
}: {
  account?: string;
  ethersReadonlyProvider: ethers.ContractRunner | undefined;
  chainId: number | undefined;
  ethersSigner: ethers.JsonRpcSigner | undefined;
}) {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<{ numGames: number; totalPublicScore: number; maxSinglePublicScore: number; lastPlayedAt: number } | null>(null);
  const [claimed, setClaimed] = useState<Record<number, boolean>>({});
  const [actionMsg, setActionMsg] = useState<string>("");

  const contractMeta = useMemo(() => {
    if (!chainId) return undefined;
    const entry = (NebulaAtlasAddresses as any)[String(chainId)];
    return entry?.address ? { address: entry.address as `0x${string}`, abi: NebulaAtlasABI.abi } : undefined;
  }, [chainId]);

  useEffect(() => {
    async function load() {
      try {
        if (!contractMeta?.address || !ethersReadonlyProvider || !account) {
          setStats(null);
          setClaimed({});
          return;
        }
        setLoading(true);
        const c = new ethers.Contract(contractMeta.address, contractMeta.abi, ethersReadonlyProvider);
        const r = await c.readPlayerMilestones(account);
        // tuple returns BigInt values
        setStats({
          numGames: Number(r[0]),
          totalPublicScore: Number(r[1]),
          maxSinglePublicScore: Number(r[2]),
          lastPlayedAt: Number(r[3]),
        });
        // 查询领取状态
        const ids = [1, 2, 3, 4, 5, 6];
        const statuses: Record<number, boolean> = {};
        for (const id of ids) {
          try {
            const ok: boolean = await c.emblemClaimed(id, account);
            statuses[id] = ok;
          } catch {
            statuses[id] = false;
          }
        }
        setClaimed(statuses);
      } catch {
        setStats(null);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [contractMeta?.address, ethersReadonlyProvider, account]);

  const now = Math.floor(Date.now() / 1000);

  const items = useMemo(() => {
    const s = stats ?? { numGames: 0, totalPublicScore: 0, maxSinglePublicScore: 0, lastPlayedAt: 0 };
    const within7d = s.lastPlayedAt + 7 * 24 * 60 * 60 >= now;
    const within1d = s.lastPlayedAt + 24 * 60 * 60 >= now;
    return [
      {
        id: 1,
        name: "初行星途",
        desc: "完成第一次游戏",
        icon: <Medal className="w-6 h-6 text-white" />,
        progress: Math.min(s.numGames / 1, 1),
        unlocked: s.numGames >= 1,
      },
      {
        id: 2,
        name: "十点星光",
        desc: "总公开分数 ≥ 10",
        icon: <Sparkles className="w-6 h-6 text-white" />,
        progress: Math.min(s.totalPublicScore / 10, 1),
        unlocked: s.totalPublicScore >= 10,
      },
      {
        id: 3,
        name: "璀璨之星",
        desc: "单局公开分数 ≥ 20",
        icon: <Star className="w-6 h-6 text-white" />,
        progress: Math.min(s.maxSinglePublicScore / 20, 1),
        unlocked: s.maxSinglePublicScore >= 20,
      },
      {
        id: 4,
        name: "活跃之旅",
        desc: "7天内 ≥ 3 局",
        icon: <Flame className="w-6 h-6 text-white" />,
        progress: within7d ? Math.min(s.numGames / 3, 1) : 0,
        unlocked: within7d && s.numGames >= 3,
      },
      {
        id: 5,
        name: "每日签到",
        desc: "1天内活跃",
        icon: <Clock className="w-6 h-6 text-white" />,
        progress: within1d ? 1 : 0,
        unlocked: within1d,
      },
      {
        id: 6,
        name: "资深旅者",
        desc: "累计 ≥ 10 局",
        icon: <Crown className="w-6 h-6 text-white" />,
        progress: Math.min(s.numGames / 10, 1),
        unlocked: s.numGames >= 10,
      },
    ];
  }, [stats, now]);

  function Progress({ value }: { value: number }) {
    return (
      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-pink-500 to-purple-500" style={{ width: `${Math.round(value * 100)}%` }} />
      </div>
    );
  }

  async function onClaim(id: number) {
    try {
      setActionMsg("正在领取...");
      if (!contractMeta?.address || !ethersSigner) {
        throw new Error("签名器未就绪");
      }
      const c = new ethers.Contract(contractMeta.address, contractMeta.abi, ethersSigner);
      const tx: ethers.TransactionResponse = await c.redeemEmblem(id);
      setActionMsg(`等待确认：${tx.hash}`);
      await tx.wait();
      setClaimed((prev) => ({ ...prev, [id]: true }));
      setActionMsg("领取成功！");
    } catch (e: any) {
      setActionMsg(`领取失败：${e?.message ?? String(e)}`);
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="neon-card">
        <div className="neon-card-inner p-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-extrabold title-gradient">Badges</h2>
            <div className="text-sm text-white/60">
              {loading ? "同步中..." : stats ? `总局数：${stats.numGames} · 最高单局：${stats.maxSinglePublicScore} · 总公开分数：${stats.totalPublicScore}` : "未获取到数据"}
            </div>
          </div>
          {actionMsg && <div className="mt-2 text-white/70 text-sm">{actionMsg}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">
            {items.map((item) => {
              const percent = Math.round(item.progress * 100);
              const locked = !item.unlocked;
              const isClaimed = Boolean(claimed[item.id]);
              return (
                <div key={item.id} className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-indigo-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="glass rounded-2xl p-5 relative overflow-hidden">
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-2xl p-0.5 ${locked ? "opacity-60" : ""}`} style={{ background: "linear-gradient(135deg,#ec4899,#8b5cf6)" }}>
                        <div className="w-full h-full rounded-2xl bg-gray-950 flex items-center justify-center">
                          {locked ? <Lock className="w-6 h-6 text-white/70" /> : item.icon}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-white font-semibold">{item.name}</p>
                          <div className="flex items-center gap-2">
                            {isClaimed && <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">Claimed</span>}
                            <span className={`text-xs px-2 py-0.5 rounded-full ${item.unlocked ? "bg-green-500/20 text-green-400" : "bg-white/10 text-white/60"}`}>
                              {item.unlocked ? "Achieved" : `${percent}%`}
                            </span>
                          </div>
                        </div>
                        <p className="text-white/70 text-sm mt-1">{item.desc}</p>
                        <div className="mt-3">
                          <Progress value={item.progress} />
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          {item.unlocked ? (
                            <div className="flex items-center gap-2 text-sm text-white/80">
                              <Trophy className="w-4 h-4 text-amber-400" />
                              <span>{isClaimed ? "Claimed" : "Available"}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-white/60">Keep going</span>
                          )}
                          {item.unlocked && !isClaimed && (
                            <button onClick={() => onClaim(item.id)} className="px-3 py-1.5 text-sm rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:scale-105 transition transform">
                              Claim
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}


