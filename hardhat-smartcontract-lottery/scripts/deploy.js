async function main() {
    const vrfCoordinatorV2Address = "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625"
    const raffleEntranceFee = "100000000000000000"
    const gasLane = "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c"
    const subscriptionId = "4990"
    const callbackGasLimit = "5000000"
    const keepersUpdateInterval = "120"

    const arguments = [
        vrfCoordinatorV2Address,
        raffleEntranceFee,
        gasLane,
        subscriptionId,
        callbackGasLimit,
        keepersUpdateInterval,
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
