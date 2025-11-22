import { ethers } from "ethers";
import {
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FhevmInstance } from "../fhevm/fhevmTypes";
import { FhevmDecryptionSignature } from "../fhevm/FhevmDecryptionSignature";
import { GenericStringStorage } from "../fhevm/GenericStringStorage";
import { NebulaAtlasAddresses } from "../../abi/NebulaAtlasAddresses";
import { NebulaAtlasABI } from "../../abi/NebulaAtlasABI";

export const useNebulaAtlas = (parameters: {
  instance: FhevmInstance | undefined;
  eip1193Provider?: ethers.Eip1193Provider | undefined;
  chainId: number | undefined;
  ethersSigner: ethers.JsonRpcSigner | undefined;
  ethersReadonlyProvider: ethers.ContractRunner | undefined;
  sameChain: RefObject<(chainId: number | undefined) => boolean>;
  sameSigner: RefObject<
    (ethersSigner: ethers.JsonRpcSigner | undefined) => boolean
  >;
  autoRefreshTotal?: boolean;
}) => {
  const {
    instance,
    chainId,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
    autoRefreshTotal = true,
  } = parameters;

  const storage = useRef(new GenericStringStorage()).current;
  const sameChainFn = sameChain.current ?? (() => true);
  const sameSignerFn = sameSigner.current ?? (() => true);
  const [message, setMessage] = useState<string>("");
  const [handle, setHandle] = useState<string | undefined>(undefined);
  const [clear, setClear] = useState<bigint | undefined>(undefined);
  const isDecrypted = handle && clear !== undefined;
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastTxHash, setLastTxHash] = useState<string | undefined>(undefined);

  const isRefreshingRef = useRef(false);
  const isDecryptingRef = useRef(false);
  const isSubmittingRef = useRef(false);
  const nebulaRef = useRef<any>(undefined);

  const contract = useMemo(() => {
    if (!chainId) return { abi: NebulaAtlasABI.abi };
    const entry = (NebulaAtlasAddresses as any)[String(chainId)];
    return {
      abi: NebulaAtlasABI.abi,
      address: entry?.address as `0x${string}` | undefined,
      chainId: entry?.chainId ?? chainId,
      chainName: entry?.chainName,
    };
  }, [chainId]);
  nebulaRef.current = contract;

  const isDeployed = useMemo(() => {
    if (!contract) return undefined;
    return Boolean(contract.address) && contract.address !== ethers.ZeroAddress;
  }, [contract]);

  const canRefresh = useMemo(() => {
    return contract.address && ethersReadonlyProvider && ethersSigner && !isRefreshing;
  }, [contract.address, ethersReadonlyProvider, ethersSigner, isRefreshing]);

  // 刷新单条记录密文句柄（by outcomeId）
  const refreshEncryptedOutcome = useCallback((outcomeId: number | string) => {
    if (isRefreshingRef.current) return;
    if (!contract?.address || !ethersReadonlyProvider) {
      setHandle(undefined);
      setMessage("连接信息不完整，无法查询记录密文");
      return;
    }
    isRefreshingRef.current = true;
    setIsRefreshing(true);

    const thisChainId = contract.chainId;
    const thisAddress = contract.address;
    const c = new ethers.Contract(thisAddress!, contract.abi, ethersReadonlyProvider);

    c.readEncryptedOutcome(BigInt(outcomeId))
      .then((value: any) => {
        const handleStr = typeof value === 'bigint' ? '0x' + value.toString(16) : String(value);
        if (sameChainFn(thisChainId) && thisAddress === nebulaRef.current?.address) {
          const isZero = /^0x0+$/i.test(handleStr ?? "");
          setHandle(handleStr);
          setClear(undefined);
          if (isZero) {
            setMessage("该记录暂无密文（可能未成功上链）");
          } else {
            setMessage(`记录 #${String(outcomeId)} 密文已刷新，可以解密`);
          }
        }
      })
      .catch((e: any) => {
        console.error("[refreshEncryptedOutcome] Error:", e);
        setMessage("刷新记录密文失败: " + String(e.message || e));
      })
      .finally(() => {
        isRefreshingRef.current = false;
        setIsRefreshing(false);
      });
  }, [contract.abi, contract.chainId, ethersReadonlyProvider, sameChain]);

  const refreshEncryptedTotal = useCallback(() => {
    if (isRefreshingRef.current) return;
    if (!contract?.address || !ethersReadonlyProvider || !ethersSigner) {
      setHandle(undefined);
      setMessage("Connection not ready. Cannot query ciphertext.");
      return;
    }
    isRefreshingRef.current = true;
    setIsRefreshing(true);

    const thisChainId = contract.chainId;
    const thisAddress = contract.address;
    const thisSigner = ethersSigner;
    const c = new ethers.Contract(thisAddress!, contract.abi, ethersReadonlyProvider);

    c.readEncryptedTotal(thisSigner.address)
      .then((value: any) => {
        const handleStr = typeof value === 'bigint' ? '0x' + value.toString(16) : String(value);
        if (sameChainFn(thisChainId) && thisAddress === nebulaRef.current?.address) {
          const isZero = /^0x0+$/i.test(handleStr ?? "");
          setHandle(handleStr);
          setClear(undefined);
          if (isZero) {
            setMessage("No ciphertext found. Submit a game first or refresh later.");
          } else {
            setMessage("Ciphertext refreshed. Ready to decrypt.");
          }
        }
      })
      .catch((e: any) => {
        console.error("[refreshEncryptedTotal] Error:", e);
        setMessage("Refresh failed: " + String(e.message || e));
      })
      .finally(() => {
        isRefreshingRef.current = false;
        setIsRefreshing(false);
      });
  }, [contract.abi, contract.chainId, ethersReadonlyProvider, ethersSigner, sameChain]);

  useEffect(() => {
    if (!autoRefreshTotal) return;
    if (!contract.address || !ethersReadonlyProvider || !ethersSigner) return;
    refreshEncryptedTotal();
  }, [autoRefreshTotal, contract.address, ethersReadonlyProvider, ethersSigner?.address]);

  const canDecrypt = useMemo(() => {
    const hasHandle = typeof handle === "string" && !/^0x0+$/i.test(handle);
    return (
      contract.address &&
      instance &&
      ethersSigner &&
      !isRefreshing &&
      !isDecrypting &&
      hasHandle &&
      clear === undefined
    );
  }, [contract.address, instance, ethersSigner, isRefreshing, isDecrypting, handle, clear]);

  const decryptEncryptedTotal = useCallback(async (options?: { forceSign?: boolean }) => {
    if (isRefreshingRef.current) {
      setMessage("Refreshing ciphertext... will decrypt afterwards.");
      const waitForRefresh = new Promise<void>((resolve) => {
        const checkInterval = setInterval(() => {
          if (!isRefreshingRef.current) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
        setTimeout(() => {
          clearInterval(checkInterval);
          resolve();
        }, 10000);
      });
      await waitForRefresh;
    }

    if (isDecryptingRef.current) {
      setMessage("Decrypting... please wait.");
      return;
    }
    if (!contract.address || !instance || !ethersSigner) {
      setMessage("FHEVM or signer not ready. Please connect wallet and wait to load.");
      return;
    }
    if (!handle || /^0x0+$/i.test(handle)) {
      setMessage("No ciphertext to decrypt. Submit a game or click [Refresh ciphertext].");
      return;
    }

    const thisChainId = chainId;
    const thisAddress = contract.address;
    const thisHandle = handle;
    const thisSigner = ethersSigner;

    isDecryptingRef.current = true;
    setIsDecrypting(true);
    setMessage("Starting decryption...");

    const run = async () => {
      const isStale = () =>
        thisAddress !== nebulaRef.current?.address ||
        !sameChainFn(thisChainId) ||
        !sameSignerFn(thisSigner);
      try {
        const sig = await FhevmDecryptionSignature.loadOrSign(
          instance,
          [contract.address as `0x${string}`],
          ethersSigner,
          storage,
          undefined,
          { force: options?.forceSign === true }
        );
        if (!sig) {
          setMessage("无法生成解密签名");
          return;
        }
        if (isStale()) {
          setMessage("Stale request ignored.");
          return;
        }
        setMessage("Calling userDecrypt...");
        const res = await instance.userDecrypt(
          [{ handle: thisHandle, contractAddress: thisAddress! }],
          sig.privateKey,
          sig.publicKey,
          sig.signature,
          sig.contractAddresses,
          sig.userAddress,
          sig.startTimestamp,
          sig.durationDays
        );
        if (isStale()) {
          setMessage("Stale result ignored.");
          return;
        }
        const value = res[thisHandle] as bigint;
        setClear(value);
        setMessage("Decryption completed.");
      } catch (e: any) {
        setMessage("Decryption failed: " + String(e));
        console.error("Decryption error:", e);
      } finally {
        isDecryptingRef.current = false;
        setIsDecrypting(false);
      }
    };
    await run();
  }, [chainId, contract.address, ethersSigner, handle, instance, sameChain, sameSigner, storage]);

  const decryptHandle = useCallback(
    async (handleToDecrypt: string, options?: { forceSign?: boolean }) => {
      if (!contract.address || !instance || !ethersSigner) {
        throw new Error("FHEVM or signer not ready");
      }
      const sig = await FhevmDecryptionSignature.loadOrSign(
        instance,
        [contract.address as `0x${string}`],
        ethersSigner,
        storage,
        undefined,
        { force: options?.forceSign === true }
      );
      if (!sig) {
        throw new Error("Cannot generate decryption signature");
      }
      const res = await instance.userDecrypt(
        [{ handle: handleToDecrypt, contractAddress: contract.address! }],
        sig.privateKey,
        sig.publicKey,
        sig.signature,
        sig.contractAddresses,
        sig.userAddress,
        sig.startTimestamp,
        sig.durationDays
      );
      return res[handleToDecrypt] as bigint;
    },
    [contract.address, ethersSigner, instance, storage]
  );

  const [form, setForm] = useState<{ score: number; scorePublic: number; resultCID: string; resultHash: string }>({
    score: 1,
    scorePublic: 0,
    resultCID: "",
    resultHash: ""
  });

  const canSubmit = useMemo(() => {
    return contract.address && instance && ethersSigner && !isSubmitting && form.resultHash && form.resultCID && Number.isFinite(form.score);
  }, [contract.address, instance, ethersSigner, isSubmitting, form]);

  const submitCore = useCallback(async (payload: { score: number; scorePublic: number; resultCID: string; resultHash: string }) => {
    if (isRefreshingRef.current || isSubmittingRef.current) {
      throw new Error("已有正在执行的操作，请稍后再试");
    }
    if (!contract.address || !instance || !ethersSigner) {
      throw new Error("Contract address, FHEVM instance or signer not ready");
    }
    const thisChainId = chainId;
    const thisAddress = contract.address;
    const thisSigner = ethersSigner;
    const c = new ethers.Contract(thisAddress!, contract.abi, thisSigner);

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setMessage("Preparing score encryption...");

    const run = async () => {
      const isStale = () =>
        thisAddress !== nebulaRef.current?.address ||
        !sameChainFn(thisChainId) ||
        !sameSignerFn(thisSigner);
      try {
        await new Promise((r) => setTimeout(r, 50));
        const input = instance.createEncryptedInput(
          thisAddress!,
          thisSigner.address
        );
        input.add32(payload.score);
        const enc = await input.encrypt();
        if (isStale()) {
          setMessage("Stale submission ignored.");
          throw new Error("Chain or signer changed. Submission cancelled.");
        }
        setMessage("Submitting transaction...");
        const tx: ethers.TransactionResponse = await c.logGameOutcome(
          enc.handles[0],
          enc.inputProof,
          payload.resultHash,
          payload.resultCID,
          payload.scorePublic >>> 0 // ensure uint32
        );
        setMessage("Waiting for confirmation: " + tx.hash);
        setLastTxHash(tx.hash);
        const r = await tx.wait();
        setMessage("Submission complete, status=" + r?.status);
        refreshEncryptedTotal();
        return tx.hash as string;
      } catch (e: any) {
        setMessage("Submission failed: " + String(e));
        throw e;
      } finally {
        isSubmittingRef.current = false;
        setIsSubmitting(false);
      }
    };
    return await run();
  }, [chainId, contract.address, ethersSigner, instance, refreshEncryptedTotal, sameChain, sameSigner]);

  const submitOutcome = useCallback(() => {
    void submitCore(form);
  }, [form, submitCore]);

  const submitOutcomeWith = useCallback(async (payload: { score: number; scorePublic: number; resultCID: string; resultHash: string }) => {
    return await submitCore(payload);
  }, [submitCore]);

  return {
    contractAddress: contract.address as `0x${string}` | undefined,
    isDeployed,
    message,
    handle,
    clear,
    isDecrypted: Boolean(isDecrypted),
    isRefreshing,
    isDecrypting,
    lastTxHash,
    canRefresh,
    canDecrypt,
    refreshEncryptedOutcome,
    refreshEncryptedTotal,
    decryptEncryptedTotal,
    decryptHandle,
    form,
    setForm,
    canSubmit,
    submitOutcome,
    submitOutcomeWith,
  };
};




