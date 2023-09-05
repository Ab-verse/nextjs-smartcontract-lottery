require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("dotenv").config();

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;

const SEPOLIA_PRIVATE_KEY = process.env.SEPOLIA_PRIVATE_KEY;

const etherscanApiKey = process.env.etherscanApiKey;

module.exports = {
  solidity: "0.8.21",
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [SEPOLIA_PRIVATE_KEY],
    },
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: etherscanApiKey,
  },

  // Verify contract on etherscan
  // npx hardhat verify --network sepolia 0x66945f9f1dfab74599ae39e6dd681ada5dc3893a "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625" "100000000000000000" "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c" "5017" "5000000" "120"
};
