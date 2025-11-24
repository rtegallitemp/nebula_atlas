import { RefObject, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { ethers } from "ethers";
import { FhevmInstance } from "../../web3/fhevm/fhevmTypes";
import { useNebulaAtlas } from "../../web3/hooks/useNebulaAtlas";

export function RecordDetail({
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
  const { id } = useParams();
  const outcomeId = useMemo(() => Number(id ?? 0), [id]);
  const nebula = useNebulaAtlas({
    instance: fhevmInstance,
    chainId,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
    autoRefreshTotal: false,
  });

  useEffect(() => {
    if (!Number.isFinite(outcomeId)) return;
    nebula.refreshEncryptedOutcome(outcomeId);
  }, [outcomeId]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="card p-6">
        <h2 className="text-2xl font-extrabold title-gradient">Record Detail #{id}</h2>
        <p className="text-white/70 text-sm mt-2">Decrypt the encrypted score for this record (not the total).</p>

        <div className="mt-6 flex items-center gap-3">
          <button onClick={() => nebula.refreshEncryptedOutcome(outcomeId)} className="px-5 py-2 glass rounded-xl text-white/90 hover:text-white">Refresh ciphertext</button>
          <button onClick={() => nebula.decryptEncryptedTotal({ forceSign: true })} className="px-5 py-2 btn-neon">Decrypt score</button>
        </div>
        <div className="mt-4 text-white/90">
          {nebula.message}
          {nebula.isDecrypted && <div className="text-aurora-400 font-bold mt-2">Decrypted Score: {nebula.clear?.toString()}</div>}
        </div>
      </div>
    </div>
  );
}


