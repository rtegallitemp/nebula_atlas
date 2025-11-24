import { ethers } from "ethers";
import { RefObject, useEffect, useMemo, useState } from "react";
import { FhevmInstance } from "../../web3/fhevm/fhevmTypes";
import { Link } from "react-router-dom";
import { NebulaAtlasABI } from "../../abi/NebulaAtlasABI";
import { NebulaAtlasAddresses } from "../../abi/NebulaAtlasAddresses";

export function Records({
  account,
  ethersReadonlyProvider,
  chainId,
  fhevmInstance,
  ethersSigner,
  sameChain,
  sameSigner,
}: {
  account?: string;
  ethersReadonlyProvider: ethers.ContractRunner | undefined;
  chainId: number | undefined;
  fhevmInstance: FhevmInstance | undefined;
  ethersSigner: ethers.JsonRpcSigner | undefined;
  sameChain: RefObject<(chainId: number | undefined) => boolean>;
  sameSigner: RefObject<(signer: ethers.JsonRpcSigner | undefined) => boolean>;
}) {
  const [records, setRecords] = useState<Array<{ id: number; scorePublic: number; ts: number }>>([]);
  const [message, setMessage] = useState<string>("");

  const contractMeta = useMemo(() => {
    if (!chainId) return undefined;
    const entry = (NebulaAtlasAddresses as any)[String(chainId)];
    return entry?.address ? { address: entry.address as `0x${string}`, abi: NebulaAtlasABI.abi } : undefined;
  }, [chainId]);

  useEffect(() => {
    async function load() {
      try {
        if (!contractMeta?.address || !ethersReadonlyProvider || !account) {
          setRecords([]);
          setMessage(account ? "合约未就绪" : "请先连接钱包");
          return;
        }
        const provider = ethersReadonlyProvider as unknown as ethers.AbstractProvider;
        const iface = new ethers.Interface(contractMeta.abi);
        // 事件签名与 topics（indexed: id, player）
        // 直接通过签名生成 topic0，避免接口兼容性差异
        const topic0 = ethers.id("OutcomeLogged(uint256,address,bytes32,string,uint256,uint256)");
        const topicPlayer = ethers.zeroPadValue(ethers.getAddress(account), 32);

        const logs = await provider.getLogs({
          address: contractMeta.address,
          fromBlock: 0n,
          toBlock: "latest",
          topics: [topic0, null, topicPlayer],
        });

        const rows: Array<{ id: number; scorePublic: number; ts: number }> = [];
        for (const log of logs) {
          try {
            // 使用 parseLog 自动匹配事件并解码
            const parsed = iface.parseLog({ topics: Array.from(log.topics), data: log.data } as any) as any;
            const id = Number(parsed.args.id);
            const scorePublic = Number(parsed.args.scorePublic);
            const timestamp = Number(parsed.args.timestamp);
            rows.push({ id, scorePublic, ts: timestamp });
          } catch {
            // skip
          }
        }
        rows.sort((a, b) => b.id - a.id);
        setRecords(rows);
        setMessage(rows.length ? "" : "暂无上链记录");
      } catch (e: any) {
        setMessage(`加载失败：${e?.message ?? String(e)}`);
      }
    }
    void load();
  }, [contractMeta?.address, ethersReadonlyProvider, account]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="card p-6">
        <h2 className="text-2xl font-extrabold title-gradient">My Journey</h2>
        {message && <div className="mt-3 text-white/60 text-sm">{message}</div>}
        {!message && (
          <div className="mt-4 space-y-3">
            {records.map(r => (
              <Link key={r.id} to={`/records/${r.id}`} className="flex items-center justify-between glass rounded-xl p-4 hover:bg-white/10 transition-colors">
                <div className="text-white/90">
                  <div className="font-semibold">记录 #{r.id}</div>
                  {/* 公开分数已隐藏 */}
                </div>
                <div className="text-white/50 text-sm">{new Date(r.ts * 1000).toLocaleString()}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


