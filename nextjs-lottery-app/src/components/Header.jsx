// Header.js

import React, { useState, useEffect } from "react";
import Main from "./Main";
import Image from "next/image";

const Header = () => {
  const [buttonText, setButtonText] = useState("Connect Wallet");
  const [walletAddress, setWalletAddress] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [chainId, setChainId] = useState("");

  useEffect(() => {
    fetchChainId();
  });

  // Fetch Chain Id
  const fetchChainId = async () => {
    try {
      if (typeof window.ethereum !== "undefined") {
        const fetchChainIdHexValue = await ethereum.request({
          method: "eth_chainId",
        });
        const decimalValueChainId = parseInt(fetchChainIdHexValue, 16);
        setChainId(decimalValueChainId.toString());
      }
    } catch (error) {
      console.error("Chain ID fetch error:", error);
    }
  };

  useEffect(() => {
    // Effect to retrieve the wallet address from local storage on component mount
    const storedWalletAddress = localStorage.getItem("walletAddress");

    if (storedWalletAddress) {
      setWalletAddress(storedWalletAddress);
      setIsConnected(true);
      setButtonText("Disconnect Wallet");
    }

    // Listen for changes in the Metamask account
    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        setIsConnected(false);
        setButtonText("Connect Wallet");
        setWalletAddress("");
        localStorage.removeItem("walletAddress");
      } else {
        setIsConnected(true);
        setButtonText("Disconnect Wallet");
        const selectedAddress = ethereum.selectedAddress;
        localStorage.setItem("walletAddress", selectedAddress);
        setWalletAddress(selectedAddress);
      }
    };

    ethereum.on("accountsChanged", handleAccountsChanged);

    return () => {
      ethereum.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, []);

  const handleConnectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        await ethereum.request({ method: "eth_requestAccounts" });
        const selectedAddress = ethereum.selectedAddress;
        localStorage.setItem("walletAddress", selectedAddress);
        setWalletAddress(selectedAddress);
        setIsConnected(true);
        setButtonText("Disconnect Wallet");
      } catch (error) {
        console.error("Wallet connection error:", error);
        setButtonText("Connect Wallet");
      }
    } else {
      setButtonText("Please Install MetaMask!");
    }
  };

  const handleDisconnectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        await ethereum.request({ method: "eth_accounts" });
        setIsConnected(false);
        setButtonText("Connect Wallet");
        setWalletAddress("");
        localStorage.removeItem("walletAddress");
      } catch (error) {
        console.error("Wallet disconnection error:", error);
      }
    }
  };

  return (
    <div>
      <nav className="bg-rose-50 px-10 py-10 flex justify-between items-center border-b-2">
        <h1 className="text-3xl font-semibold text-red-500">
          Decentralized Lottery
        </h1>
        <button
          className="border border-solid border-red-600 hover:bg-white text-red-600 bg-red-200 px-4 py-2 rounded-2xl font-medium"
          onClick={isConnected ? handleDisconnectWallet : handleConnectWallet}
        >
          {buttonText}
        </button>
      </nav>
      <div className="px-10 py-10">
        <p className="text-2xl">
          {isConnected
            ? chainId === "11155111"
              ? `Connected Wallet Address Is: ${walletAddress}`
              : "Please switch to supported chain. The Supported chain is Sepolia!"
            : "Connect to MetaMask!"}
        </p>
        <div className=" bg-sky-100 mt-5 rounded-tl rounded-br overflow-hidden flex items-center">
          <Image
            src="/assets/winBig.png"
            width={330}
            height={330}
            alt="win big image"
          />

          <div className=" ml-80 p-10 text-8xl text-gray-700">WIN BIG!</div>
        </div>
        <div className="text-lg">
          {isConnected && chainId === "11155111" && (
            <Main isConnected={isConnected} chainId={chainId} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
