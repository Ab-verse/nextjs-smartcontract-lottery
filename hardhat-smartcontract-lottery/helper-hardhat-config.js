// ChainLink VRF Config for Sepolia Network
// For more info https://docs.chain.link/vrf/v2/subscription/supported-networks#sepolia-testnet
const vrfCoordinatorV2Address = "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625"
const raffleEntranceFee = "100000000000000000"
const gasLane = "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c"
const subscriptionId = "5017"
const callbackGasLimit = "2500000"
const keepersUpdateInterval = "120"

const SepoliaConfig = {
    vrfCoordinatorV2Address,
    raffleEntranceFee,
    gasLane,
    subscriptionId,
    callbackGasLimit,
    keepersUpdateInterval,
  };
  
  // Export the object
  module.exports = SepoliaConfig;