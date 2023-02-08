import { useContractReader } from "eth-hooks";
import { ethers } from "ethers";
import React from "react";
import { Link } from "react-router-dom";
import { utils } from "ethers";
import { Button } from "antd";

/**
 * web3 props can be passed from '../App.jsx' into your local view component for use
 * @param {*} yourLocalBalance balance on current network
 * @param {*} readContracts contracts from current chain already pre-loaded using ethers contract module. More here https://docs.ethers.io/v5/api/contract/contract/
 * @returns react component
 **/
function Home({ yourLocalBalance, readContracts, address, web3Modal, logoutOfWeb3Modal, loadWeb3Modal }) {
  const styles = {
    balanceInfo: {
      display: "flex",
      background: "papayawhip",
      justifyContent: "center",
      alignItems: "center",
      height: "200px",
    },
  };

  const infoPerUser = useContractReader(readContracts, "SlotMachine", "infoPerUser", [address]);
  console.log(infoPerUser);
  let unclaimedWins = 0;
  let unclaimedReferrals = 0;

  if (infoPerUser) {
    unclaimedWins = infoPerUser.moneyEarned - infoPerUser.moneyClaimed;
    unclaimedReferrals = infoPerUser.earnedByReferrals - infoPerUser.claimedByReferrals;
  }

  let balance = utils.formatEther(yourLocalBalance || 0);
  balance = (+balance).toFixed(4);

  let connectYourWallet;

  let accountButtonInfo;
  if (web3Modal?.cachedProvider) {
    accountButtonInfo = { name: "Logout", action: logoutOfWeb3Modal };
  } else {
    accountButtonInfo = { name: "Connect", action: loadWeb3Modal };
  }

  if (!address) {
    balance = "_____";
    unclaimedWins = "_____";
    unclaimedReferrals = "_____";
    connectYourWallet = (
      <div>
        <h2>Please, connect your wallet</h2>
        <p>Please connect your wallet to play, earn and claim your rewards.</p>
        {web3Modal && (
          <Button style={{ marginLeft: 8 }} shape="round" onClick={accountButtonInfo.action}>
            {accountButtonInfo.name}
          </Button>
        )}
      </div>
    );
  } else {
    connectYourWallet = "";
  }

  return (
    <div>
      <div id="header">
        <h1>Dashboard</h1>
        <p>All values are expressed in MATIC.</p>
      </div>
      <div id="balanceInfo" className="balanceInfo">
        <div className="balance">
          <h2>Balance</h2>
          <p>
            <b>{balance}</b>
          </p>
        </div>
        <div className="rewards">
          <h2>Unclaimed rewards</h2>
          <div>
            <h3>Wins:</h3>
            <p>{unclaimedWins}</p>
          </div>
          <div>
            <h3>Referrals:</h3>
            <p>{unclaimedReferrals}</p>
          </div>
        </div>
        {connectYourWallet}
      </div>
    </div>
  );
}

export default Home;
