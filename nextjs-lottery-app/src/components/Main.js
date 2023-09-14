// Main.js

import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useNotification } from "@web3uikit/core";
import { abi, contractAddress } from "@/utils/utils";

const Main = ({ isConnected, chainId }) => {
  const [entranceFee, setEntranceFee] = useState("");
  const [recentWinner, setRecentWinner] = useState("");
  const [numberOfPlayers, setNumberOfPlayers] = useState("");
  const [isLoading, setIsLoading] = useState(false);


  const dispatch = useNotification();

  useEffect(() => {
    if (isConnected) {
      updateUIValues();
    }
  }, [isConnected]);

  useEffect(() => {
    loadStateFromLocalStorage();
  }, []);

  const handleSuccess = () => {
    dispatch({
      type: "success",
      message: "Transaction Completed!",
      title: "Transaction Notification",
      position: "topR",
    });
  };

  const handleError = () => {
    dispatch({
      type: "error",
      message: "Transaction Failed!",
      title: "Transaction Notification",
      position: "topR",
    });
  };

  async function updateUIValues() {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, abi, provider);
      try {
        const getEntranceFee = await contract.getEntranceFee();
        const getRecentWinner = await contract.getRecentWinner();
        const getNumberOfPlayers = await contract.getNumberOfPlayers();

        setEntranceFee(ethers.utils.formatEther(getEntranceFee));
        setRecentWinner(getRecentWinner.toString());
        setNumberOfPlayers(getNumberOfPlayers.toString());

        saveStateToLocalStorage();
      } catch (error) {
        console.error(error);
      }
    } else {
      console.log("Please install MetaMask");
    }
  }

  function saveStateToLocalStorage() {
    localStorage.setItem("entranceFee", entranceFee);
    localStorage.setItem("recentWinner", recentWinner);
    localStorage.setItem("numberOfPlayers", numberOfPlayers);
  }

  function loadStateFromLocalStorage() {
    const storedEntranceFee = localStorage.getItem("entranceFee");
    const storedRecentWinner = localStorage.getItem("recentWinner");
    const storedNumberOfPlayers = localStorage.getItem("numberOfPlayers");

    if (storedEntranceFee) {
      setEntranceFee(storedEntranceFee.toString());
    } else {
      setEntranceFee(""); // Set a default value or leave it empty
    }

    if (storedRecentWinner) {
      setRecentWinner(storedRecentWinner);
    } else {
      setRecentWinner(""); // Set a default value or leave it empty
    }

    if (storedNumberOfPlayers) {
      setNumberOfPlayers(storedNumberOfPlayers);
    } else {
      setNumberOfPlayers(""); // Set a default value or leave it empty
    }
  }

  async function EnterLottery() {
    if (typeof window.ethereum !== "undefined") {
      if (isConnected) {
        if (chainId === "11155111") {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const contract = new ethers.Contract(contractAddress, abi, signer);
          const recentWinnerEvent = contract.filters.Recent_winner(); // Define the event filter
          try {
            setIsLoading(true); // Set loading to true while processing
            const transactionResponse = await contract.EnterLottery({
              value: ethers.utils.parseEther(entranceFee),
            });

            console.log(`Mining ${transactionResponse.hash}`);

            const transactionReceipt = await transactionResponse.wait();

            handleSuccess();
            updateUIValues();

            console.log("Status:", transactionReceipt.status);
            console.log("Gas used:", transactionReceipt.gasUsed.toString());
            

            // Listen for the Recent_winner event
            await contract.once(recentWinnerEvent, (winnerAddress) => {
              console.log("New Winner:", winnerAddress);
              setNumberOfPlayers("0");
              setRecentWinner(winnerAddress.toString())
            });
            
          } catch (error) {
            handleError();
            console.error(error);
          }
          finally {
            setIsLoading(false); // Set loading back to false after processing
          }
        } else {
          console.log(
            "Please switch to supported chain. The Supported chain is Sepolia!"
          );
        }
      } else {
        console.log("Connect to MetaMask");
      }
    } else {
      console.log("Please install MetaMask");
    }
  }

  return (
    <div className=" ">
      <button
        className="my-5 px-3 py-2 bg-blue-600 text-white rounded-lg font-bold"
        onClick={EnterLottery}
      >
        {isLoading ? "Processing..." : "Enter Lottery"}
      </button>

      <div>
        <div>
          <span className="font-bold">Number of Players:</span>{" "}
          {numberOfPlayers}
        </div>
        <div>
          <span className="font-bold">Recent Winner:</span> {recentWinner}
        </div>
      </div>
    </div>
  );
};

export default Main;
