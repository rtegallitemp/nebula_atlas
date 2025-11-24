import { ethers } from "ethers";
import { useEffect, useMemo, useState } from "react";
import { NebulaAtlasABI } from "../../abi/NebulaAtlasABI";
import { NebulaAtlasAddresses } from "../../abi/NebulaAtlasAddresses";
import { useNebulaAtlas } from "../../web3/hooks/useNebulaAtlas";

export function Leaderboard({
  ethersReadonlyProvider,
  chainId,
  ethersSigner,
  fhevmInstance,
  sameChain,
  sameSigner,
}: {
  ethersReadonlyProvider: ethers.ContractRunner | undefined;
  chainId: number | undefined;
  ethersSigner?: ethers.JsonRpcSigner;
  fhevmInstance?: any;
  sameChain?: React.RefObject<(c: number | undefined) => boolean>;
  sameSigner?: React.RefObject<(s: ethers.JsonRpcSigner | undefined) => boolean>;
}) {
  const [addresses, setAddresses] = useState<string[]>([]);
  const [handlesByAddress, setHandlesByAddress] = useState<Record<string, string>>({});
  const [decryptedByAddress, setDecryptedByAddress] = useState<Record<string, bigint | string>>({});
  const [message, setMessage] = useState<string>("");

  const contractMeta = useMemo(() => {
    if (!chainId) return undefined;
    const entry = (NebulaAtlasAddresses as any)[String(chainId)];
    return entry?.address ? { address: entry.address as `0x${string}`, abi: NebulaAtlasABI.abi } : undefined;
  }, [chainId]);

  const nebula = useNebulaAtlas({
    instance: fhevmInstance as any,
    chainId,
    ethersSigner: ethersSigner as any,
    ethersReadonlyProvider,
    sameChain: (sameChain as any) ?? { current: () => true },
    sameSigner: (sameSigner as any) ?? { current: () => true },
  });

  useEffect(() => {
    async function loadPlayers() {
      try {
        if (!contractMeta?.address || !ethersReadonlyProvider) {
          setAddresses([]);
          setMessage("合约未就绪");
          return;
        }
        const provider = ethersReadonlyProvider as unknown as ethers.AbstractProvider;
        const iface = new ethers.Interface(contractMeta.abi);
        const topic0 = ethers.id("OutcomeLogged(uint256,address,bytes32,string,uint256,uint256)");
        const logs = await provider.getLogs({
          address: contractMeta.address,
          fromBlock: 0n,
          toBlock: "latest",
          topics: [topic0],
        });
        const set = new Set<string>();
        for (const log of logs) {
          try {
            const parsed = iface.parseLog({ topics: Array.from(log.topics), data: log.data } as any) as any;
            const player = parsed.args.player as string;
            set.add(ethers.getAddress(player));
          } catch {}
        }
        setAddresses(Array.from(set));
        setMessage("");
      } catch (e: any) {
        setMessage(`加载失败：${e?.message ?? String(e)}`);
      }
    }
    void loadPlayers();
  }, [contractMeta?.address, ethersReadonlyProvider]);

  async function refreshEncryptedTotals() {
    try {
      if (!contractMeta?.address || !ethersReadonlyProvider) return;
      const c = new ethers.Contract(contractMeta.address, contractMeta.abi, ethersReadonlyProvider);
      const next: Record<string, string> = {};
      for (const addr of addresses) {
        try {
          const v = await c.readEncryptedTotal(addr);
          const h = typeof v === "bigint" ? "0x" + v.toString(16) : String(v);
          next[addr] = h;
        } catch {
          next[addr] = "0x0";
        }
      }
      setHandlesByAddress(next);
      setDecryptedByAddress({});
      setMessage("密文已刷新，点击“解密全部”尝试解密你可以解密的数据。");
    } catch (e: any) {
      setMessage(`刷新失败：${e?.message ?? String(e)}`);
    }
  }

  async function decryptAll() {
    const results: Record<string, bigint | string> = {};
    for (const [addr, handle] of Object.entries(handlesByAddress)) {
      if (!handle || /^0x0+$/i.test(handle)) continue;
      try {
        // 强制签名以发起一次本次会话的解密授权
        const value = await nebula.decryptHandle(handle, { forceSign: true });
        results[addr] = value;
      } catch {
        results[addr] = "锁定";
      }
    }
    setDecryptedByAddress(results);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="card p-6">
        <h2 className="text-2xl font-extrabold title-gradient">Leaderboard</h2>
        <p className="text-white/70 text-sm mt-1">Aggregate players from on-chain events and show totals as ciphertext. You can only decrypt data you are authorized to access.</p>
        <div className="mt-4 flex items-center gap-3">
          <button onClick={refreshEncryptedTotals} className="px-3 py-2 glass rounded-lg text-white/90 hover:text-white">
            Refresh ciphertext
          </button>
          <button onClick={decryptAll} className="px-3 py-2 btn-neon">
            Decrypt all
          </button>
        </div>
        {message && <div className="mt-2 text-sm text-white/70">{message}</div>}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-white/60 text-sm">
              <tr>
                <th className="py-2">Rank</th>
                <th className="py-2">Address</th>
                <th className="py-2">Total (ciphertext/decrypted)</th>
              </tr>
            </thead>
            <tbody className="text-white/90">
              {addresses.map((addr, i) => {
                const short = `${addr.slice(0,6)}...${addr.slice(-4)}`;
                const decrypted = decryptedByAddress[addr];
                const handle = handlesByAddress[addr];
                const display = decrypted !== undefined ? String(decrypted) : (handle && !/^x?0+$/i.test(handle) ? "****" : "-");
                return (
                  <tr key={addr} className="border-t border-white/10">
                    <td className="py-3">{i + 1}</td>
                    <td className="py-3">{short}</td>
                    <td className="py-3">{display}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


