import { checkForUndefined } from "./utils/checkers";
import dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";
import "@openzeppelin/hardhat-upgrades";
import "hardhat-contract-sizer";
import { NetworkUserConfig } from "hardhat/types";
dotenv.config({ path: "./.env" });

const {
  INFURA_KEY,
  ETHERSCAN_KEY,
  PRIVATE_KEY,
  MNEMONIC,
  NOT_CI,
  POLYGONSCAN_KEY,
} = process.env;

if (NOT_CI === "true") {
  checkForUndefined("INFURA_KEY", INFURA_KEY);
  checkForUndefined("ETHERSCAN_KEY", ETHERSCAN_KEY);
  checkForUndefined("PRIVATE_KEY", PRIVATE_KEY);
  checkForUndefined("MNEMONIC", MNEMONIC);
}

const OPTIMIZER_RUNS = 1000;

const sharedNetworkConfig: NetworkUserConfig = {};

const sharedCompilerConfig = {
  optimizer: {
    enabled: true,
    runs: OPTIMIZER_RUNS,
  },
  outputSelection: {
    "*": {
      "*": ["storageLayout"],
    },
  },
};

// Order of priority for account/signer generation:
// 1) .env/PRIVATE_KEY
// 2) .env/MNEMONIC
// 3) default mnemonic
if (PRIVATE_KEY) {
  sharedNetworkConfig.accounts = [PRIVATE_KEY];
} else if (MNEMONIC) {
  sharedNetworkConfig.accounts = {
    mnemonic: MNEMONIC,
  };
} else {
  sharedNetworkConfig.accounts = {
    mnemonic: "Life is tufff",
  };
}

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  paths: {
    artifacts: "build/artifacts",
    cache: "build/cache",
    deploy: "deploy",
    sources: "contracts",
  },
  solidity: "0.8.19",
  networks: {
    localhost: {
      url: "http://localhost:8545",
    },
    hardhat: {},
    // mainnet: {
    // 	...sharedNetworkConfig,
    // 	url: `https://mainnet.infura.io/v3/${INFURA_KEY}`,
    // },
    goerli: {
      ...sharedNetworkConfig,
      url: `https://goerli.infura.io/v3/${INFURA_KEY}`,
    },
    matic: {
      ...sharedNetworkConfig,
      url: `https://polygon-mainnet.infura.io/v3/${INFURA_KEY}`,
    },
    mumbai: {
      ...sharedNetworkConfig,
      url: `https://polygon-mumbai.infura.io/v3/${INFURA_KEY}`,
    },
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    coinmarketcap: "",
    excludeContracts: ["contracts/testing/"],
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
  },
  namedAccounts: {
    deployer: 0,
  },
  etherscan: {
    apiKey: {
      ethereum: ETHERSCAN_KEY,
      goerli: ETHERSCAN_KEY,
      polygonMumbai: POLYGONSCAN_KEY,
      polygon: POLYGONSCAN_KEY,
    },
  },
};

export default config;
