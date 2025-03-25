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
    requiredConfirmations: 1
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
    }
}
};
