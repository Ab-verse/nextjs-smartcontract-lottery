const SepoliaConfig = require("../helper-hardhat-config")

async function main() {
    const arguments = [
        SepoliaConfig.vrfCoordinatorV2Address,
        SepoliaConfig.raffleEntranceFee,
        SepoliaConfig.gasLane,
        SepoliaConfig.subscriptionId,
        SepoliaConfig.callbackGasLimit,
        SepoliaConfig.keepersUpdateInterval,
    ]

    const [deployer] = await ethers.getSigners()

    console.log("Deploying contracts with the account:", deployer.address)

    const token = await ethers.deployContract("Lottery", arguments)

    console.log("contract address:", await token.getAddress())
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
