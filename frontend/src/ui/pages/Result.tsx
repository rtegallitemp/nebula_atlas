import { RefObject, useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import { ethers } from "ethers";
import { FhevmInstance } from "../../web3/fhevm/fhevmTypes";
import { useNebulaAtlas } from "../../web3/hooks/useNebulaAtlas";

export function Result({
  fhevmInstance,
  ethersSigner,
  ethersReadonlyProvider,
  chainId,
  sameChain,
  sameSigner,
}: {
  fhevmInstance: FhevmInstance | undefined;
  ethersSigner: ethers.JsonRpcSigner | undefined;
  ethersReadonlyProvider: ethers.ContractRunner | undefined;
  chainId: number | undefined;
  sameChain: RefObject<(chainId: number | undefined) => boolean>;
  sameSigner: RefObject<(signer: ethers.JsonRpcSigner | undefined) => boolean>;
}) {
  const { state } = useLocation() as {
    state?: { score: number; totalQuestions: number; timeSpent: number; txHash: string };
  };

  const nebula = useNebulaAtlas({
    instance: fhevmInstance,
    chainId,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
  });

  const hashShort = useMemo(() => {
    const h = state?.txHash;
    return h ? `${h.slice(0, 8)}...${h.slice(-6)}` : "-";
  }, [state?.txHash]);

  const masked = !nebula.isDecrypted;
  const displayScore = masked ? "解密后可见" : String(state?.score ?? "-");
  const displayTime = masked ? "解密后可见" : `${state?.timeSpent ?? "-"}s`;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="card p-8">
        <h2 className="text-2xl font-extrabold title-gradient">征途结果</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="glass rounded-xl p-4">
            <p className="text-white/60 text-sm">得分</p>
            <p className={`text-3xl font-bold ${masked ? "text-white/50" : "text-white"}`}>{displayScore}</p>
          </div>
          <div className="glass rounded-xl p-4">
            <p className="text-white/60 text-sm">题目数</p>
            <p className="text-3xl font-bold text-white">{state?.totalQuestions ?? "-"}</p>
          </div>
          <div className="glass rounded-xl p-4">
            <p className="text-white/60 text-sm">耗时</p>
            <p className={`text-3xl font-bold ${masked ? "text-white/50" : "text-white"}`}>{displayTime}</p>
          </div>
        </div>

        <div className="mt-6 glass rounded-xl p-4">
          <p className="text-white/60 text-sm">交易哈希</p>
          <p className="text-white font-mono mt-1">{hashShort}</p>
        </div>

        <div className="mt-8 flex items-center gap-3">
          <Link to="/play" className="px-6 py-3 btn-neon">再来一局</Link>
          <button
            onClick={() => nebula.refreshEncryptedTotal()}
            className="px-6 py-3 glass rounded-xl text-white/90 hover:text-white"
          >
            刷新密文
          </button>
          <button
            onClick={() => nebula.decryptEncryptedTotal({ forceSign: true })}
            className="px-6 py-3 glass rounded-xl text-white/90 hover:text-white"
          >
            {masked ? "解密以显示分数与耗时" : "已解密，可见分数与耗时"}
          </button>
        </div>

        <div className="mt-6">
          <p className="text-white/70 text-sm mb-1">消息</p>
          <p className="text-white/90">{nebula.message}</p>
          {nebula.isDecrypted && (
            <p className="text-aurora-400 font-bold mt-2">总分明文：{nebula.clear?.toString()}</p>
          )}
        </div>
      </div>
    </div>
  );
}


