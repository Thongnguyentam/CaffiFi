require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

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
      accounts: ["0c6aaedebed8f32db344a74f5fda724c42a1b7053450ebfecd29ba0e0922dd6b"],
      gas: 8000000, // <- manually set gas limit
      gasPrice: 1000000000 // optional: set fixed gas price
    },
    latteOrbit: {
      url: "http://127.0.0.1:8647",
      chainId: 10000099,
      accounts: ["bdf23c7f17c40c6a5cd3f193daea787bc27e0d64b75fc2618449182819357d24"],
      gas: 8000000, // <- manually set gas limit
      gasPrice: 1000000000 // optional: set fixed gas price
    }
  }
};
