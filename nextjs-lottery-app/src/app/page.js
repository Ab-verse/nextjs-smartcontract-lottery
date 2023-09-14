"use client";

import Header from "@/components/Header";
import React from "react";
import { NotificationProvider } from "@web3uikit/core";

import { contractAddress, abi } from "@/utils/utils";

function Lottery() {
  return (
    <div>
      <NotificationProvider>
        <Header contractAddress={contractAddress} abi={abi} />
      </NotificationProvider>
    </div>
  );
}

export default Lottery;
