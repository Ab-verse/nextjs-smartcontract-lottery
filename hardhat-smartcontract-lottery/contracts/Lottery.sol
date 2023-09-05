//SPDX-License-Identifier:MIT

pragma solidity 0.8.21;

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";

/* Errors */
error Lottery__SendMoreToEnter();
error Lottery__TransactionFailed();
error Lottery__RaffleNotOpen();
error Lottery__UpKeepNotNeeded(uint256 currentBalance, uint256 numPlayers, uint256 raffleState);

contract Lottery is VRFConsumerBaseV2, KeeperCompatibleInterface {
    /* Type declarations */
    enum RaffleState {
        OPEN,
        CALCULATING
    }

    /*  State variables  */
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    bytes32 private immutable i_keyHash;
    uint64 private immutable i_subscriptionId;
    uint32 private immutable i_callbackGasLimit;
    address payable public s_recentWinner;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_RANDOM_WORDS = 1;

    /* Lottery State Variables */
    uint256 private immutable i_interval;
    uint256 private immutable i_entryFee;
    uint256 private s_lastTimeStamp;
    address payable[] public s_players;
    RaffleState private s_raffleState;

    /* Events */
    event LotteryEnter(address indexed Player);
    event RequestedRafflewinner(uint256 indexed requestId);
    event Recent_winner(address indexed winner);

    constructor(
        address vrfcoordinatorV2,
        uint256 entryFee,
        bytes32 keyHash,
        uint64 subscriptionId,
        uint32 callbackGasLimit,
        uint256 interval
    ) VRFConsumerBaseV2(vrfcoordinatorV2) {
        i_entryFee = entryFee;
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfcoordinatorV2);
        i_keyHash = keyHash;
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
        s_raffleState = RaffleState.OPEN;
        i_interval = interval;
        s_lastTimeStamp = block.timestamp;
    }

    /* Enter the Lotery with this function */
    function EnterLottery() public payable {
        // If the raffle state is not open you won't be able to enter
        if (s_raffleState != RaffleState.OPEN) revert Lottery__RaffleNotOpen();
        // If the amount is less than the EntryFee you won't be able to participate
        if (msg.value < i_entryFee) revert Lottery__SendMoreToEnter();
        // Put the address into the players array to be part of the Lottery
        s_players.push(payable(msg.sender));
        // Emit the participant every time a new address come for the Lottery
        emit LotteryEnter(msg.sender);
    }

    /**
     * @dev This is the function that the Chainlink Keeper nodes call
     * they look for `upkeepNeeded` to return True.
     * the following should be true for this to return true:
     * 1. The time interval has passed between raffle runs.
     * 2. The lottery is open.
     * 3. The contract has ETH.
     * 4. Implicity, your subscription is funded with LINK.
     */
    function checkUpkeep(
        bytes memory /* checkData*/
    )
        public view
        override
        returns (
            bool upkeepNeeded,
            bytes memory /* performData */
        )
    {
        bool isopen = (RaffleState.OPEN == s_raffleState);
        bool timepassed = ((block.timestamp - s_lastTimeStamp) > i_interval);
        bool has_players = (s_players.length > 0);
        bool hasbalance = address(this).balance > 0;
        upkeepNeeded = (timepassed && has_players && isopen && hasbalance);
        return (upkeepNeeded, "0x");
    }

    /**
     * @dev Once `checkUpkeep` is returning `true`, this function is called
     * and it kicks off a Chainlink VRF call to get a random winner.
     */
    function performUpkeep(
        bytes calldata /* Perform Data */
    ) external override {
        // Request a random number
        // Once you get it, do something with it
        // Two way transaction
        (bool upkeepNeeded, ) = checkUpkeep("");
        if (!upkeepNeeded) revert Lottery__UpKeepNotNeeded(address(this).balance, s_players.length, uint256(s_raffleState));
        s_raffleState = RaffleState.CALCULATING;
        uint256 Request_id = i_vrfCoordinator.requestRandomWords(
            i_keyHash,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_RANDOM_WORDS
        );
        emit RequestedRafflewinner(Request_id);
    }

    /**
     * @dev This is the function that Chainlink VRF node
     * calls to send the money to the random winner.
     */
    function fulfillRandomWords(
        uint256, /*requestId*/
        uint256[] memory randomWords
    ) internal override {
        uint256 index_of_winner = randomWords[0] % s_players.length;
        address payable recent_Winner = s_players[index_of_winner];
        s_recentWinner = recent_Winner;
        s_raffleState = RaffleState.OPEN;
        s_lastTimeStamp = block.timestamp;
        s_players = new address payable[](0);

        (bool success, ) = s_recentWinner.call{value: address(this).balance}("");

        if (!success) {
            revert Lottery__TransactionFailed();
        }

        emit Recent_winner(s_recentWinner);
    }

    /** Getter Functions */
    function getPlayer(uint256 index) public view returns (address) {
        return s_players[index];
    }

    function getEntranceFee() public view returns (uint256) {
        return i_entryFee;
    }

    function getRecentWinner() public view returns (address) {
        return s_recentWinner;
    }

    function getRaffleState() public view returns (RaffleState) {
        return s_raffleState;
    }

    function getNumWords() public pure returns (uint256) {
        return NUM_RANDOM_WORDS;
    }

    function getNumberOfPlayers() public view returns (uint256) {
        return s_players.length;
    }

    function getLastTimeStamp() public view returns (uint256) {
        return s_lastTimeStamp;
    }

    function getRequestConfirmations() public pure returns (uint256) {
        return REQUEST_CONFIRMATIONS;
    }

    function getInterval() public view returns (uint256) {
        return i_interval;
    }
}

