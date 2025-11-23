//////////////////////////////////////////////////////////////////////////
//
// WARNING!!
// ALWAY USE DYNAMICS IMPORT FOR THIS FILE TO AVOID INCLUDING THE ENTIRE 
// FHEVM MOCK LIB IN THE FINAL PRODUCTION BUNDLE!!
//
//////////////////////////////////////////////////////////////////////////

import { Contract, JsonRpcProvider } from "ethers";
import { MockFhevmInstance } from "@fhevm/mock-utils";
import { FhevmInstance } from "../../fhevmTypes";

export const fhevmMockCreateInstance = async (parameters: {
  rpcUrl: string;
  chainId: number;
  metadata: {
    ACLAddress: `0x${string}`;
    InputVerifierAddress: `0x${string}`;
    KMSVerifierAddress: `0x${string}`;
  };
}): Promise<FhevmInstance> => {
  const provider = new JsonRpcProvider(parameters.rpcUrl);
  // Dynamically read EIP712 domain from InputVerifier to get real verifying contract address and chainId
  const inputVerifierContract = new Contract(
    parameters.metadata.InputVerifierAddress,
    [
      "function eip712Domain() view returns (bytes1, string, string, uint256, address, bytes32, uint256[])",
    ],
    provider
  );
  const domain: readonly unknown[] = await inputVerifierContract.eip712Domain();
  const domainChainId = Number(domain[3] as unknown as bigint);
  const verifyingContractAddressInputVerification = domain[4] as `0x${string}`;

  const instance = await MockFhevmInstance.create(
    provider,
    provider,
    {
      aclContractAddress: parameters.metadata.ACLAddress,
      chainId: parameters.chainId,
      gatewayChainId: Number.isFinite(domainChainId)
        ? domainChainId
        : parameters.chainId,
      inputVerifierContractAddress: parameters.metadata.InputVerifierAddress,
      kmsContractAddress: parameters.metadata.KMSVerifierAddress,
      // Keep decryption verifying address from known default for mock gateway
      verifyingContractAddressDecryption:
        "0x5ffdaAB0373E62E2ea2944776209aEf29E631A64",
      verifyingContractAddressInputVerification,
    },
    {
      inputVerifierProperties: {},
      kmsVerifierProperties: {},
    }
  );
  return instance as unknown as FhevmInstance;
};




