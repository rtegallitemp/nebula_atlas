import "@fhevm/hardhat-plugin";
import "@nomicfoundation/hardhat-chai-matchers";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-verify";
import "@typechain/hardhat";
import "hardhat-deploy";
import "hardhat-gas-reporter";
import type { HardhatUserConfig } from "hardhat/config";
import { vars } from "hardhat/config";
import "solidity-coverage";

const MNEMONIC: string = vars.get("MNEMONIC", "");
const PRIVATE_KEY_RAW: string = vars.get("PRIVATE_KEY", "");
const PRIVATE_KEY: string =
  PRIVATE_KEY_RAW && !PRIVATE_KEY_RAW.startsWith("0x")
    ? `0x${PRIVATE_KEY_RAW}`
    : PRIVATE_KEY_RAW;
const SEPOLIA_RPC_URL: string = vars.get(
  "SEPOLIA_RPC_URL",
  "https://ethereum-sepolia-rpc.publicnode.com"
);

const HARDHAT_OR_LOCAL_ACCOUNTS =
  MNEMONIC && MNEMONIC.trim().length > 0 ? { mnemonic: MNEMONIC } : undefined;

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  namedAccounts: {
    deployer: 0,
  },
  etherscan: {
    apiKey: {
      sepolia: vars.get("ETHERSCAN_API_KEY", ""),
    },
  },
  gasReporter: {
    currency: "USD",
    enabled: process.env.REPORT_GAS ? true : false,
    excludeContracts: [],
  },
  networks: {
    hardhat: {
      accounts: HARDHAT_OR_LOCAL_ACCOUNTS,
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
      accounts: HARDHAT_OR_LOCAL_ACCOUNTS,
    },
    sepolia: {
      accounts:
        PRIVATE_KEY && PRIVATE_KEY.length > 2 ? [PRIVATE_KEY] : [],
      chainId: 11155111,
      url: SEPOLIA_RPC_URL,
    },
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test",
    deployments: "./deployments",
  },
  solidity: {
    version: "0.8.27",
    settings: {
      metadata: {
        bytecodeHash: "none",
      },
      optimizer: {
        enabled: true,
        runs: 800,
      },
      evmVersion: "cancun",
    },
  },
  typechain: {
    outDir: "types",
    target: "ethers-v6",
  },
};

export default config;




