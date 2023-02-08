import { useContractReader } from "eth-hooks";
import { ethers } from "ethers";
import React from "react";
import { Link } from "react-router-dom";

/**
 * web3 props can be passed from '../App.jsx' into your local view component for use
 * @param {*} yourLocalBalance balance on current network
 * @param {*} readContracts contracts from current chain already pre-loaded using ethers contract module. More here https://docs.ethers.io/v5/api/contract/contract/
 * @returns react component
 **/
function Home({ yourLocalBalance, readContracts }) {
  const styles = {
    rouletteOptions: {
      display: "flex",
      justifyContent: "center",
    },
  };
  // you can also use hooks locally in your component of choice
  // in this case, let's keep track of 'purpose' variable from our contract
  const purpose = useContractReader(readContracts, "SlotMachine", "purpose");

  return (
    <div>
      <div id="header">
        <h1>Dashboard</h1>
        <p>All values are expressed in MATIC.</p>
      </div>
      <div id="balanceInfo">
        <div className="balance">
          <h2>Balance</h2>
          <p>____</p>
        </div>
        <div className="rewards">
          <h2>Unclaimed rewards</h2>
          <div>
            <h3>Wins:</h3>
            <p>____</p>
          </div>
          <div>
            <h3>Referrals:</h3>
            <p>____</p>
          </div>
        </div>
        <div>
          <h2>Please, connect your wallet</h2>
          <p>Please connect your wallet to play, earn and claim your rewards.</p>
          <button>Connect wallet</button>
        </div>
      </div>
    </div>
  );
}

export default Home;
