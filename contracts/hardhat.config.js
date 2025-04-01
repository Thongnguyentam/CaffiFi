require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Use the same account for both networks
const PRIVATE_KEY = "0c6aaedebed8f32db344a74f5fda724c42a1b7053450ebfecd29ba0e0922dd6b";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
      version: '0.8.28',
      settings: {
          optimizer: {
              enabled: true,
              runs: 100,
          },
      },
  },
  ignition: {
    // Ignition specific settings
    moduleCompilationOpts: {
      optimizer: {
        enabled: true,
        runs: 100,
      },
    },
    // Set low confirmations for faster testing
    requiredConfirmations: 1,
  },
  
  gasReporter: {
      enabled: true,
  },

  contractSizer: {
      alphaSort: true,
      disambiguatePaths: false,
      runOnCompile: true,
      strict: false,
  },

  // allowUnlimitedContractSize: true,
  networks: {
    espressoOrbit: {
      url: "http://127.0.0.1:8547",
      chainId: 10000096,
      accounts: [PRIVATE_KEY],
      gas: 8000000,
      gasPrice: 1000000000
    },
    latteOrbit: {
      url: "http://127.0.0.1:8647",
      chainId: 10000099,
      accounts: [PRIVATE_KEY],
      gas: 8000000,
      gasPrice: 1000000000
    }
  }
};
