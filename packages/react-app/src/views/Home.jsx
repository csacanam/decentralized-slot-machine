import { useContractReader } from "eth-hooks";
import { ethers } from "ethers";
import React from "react";
import { Link } from "react-router-dom";
import { utils } from "ethers";
import { Button, Input, Row, Tooltip, Col } from "antd";

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

  //Connect Button
  let accountButtonInfo;
  if (web3Modal?.cachedProvider) {
    accountButtonInfo = { name: "Logout", action: logoutOfWeb3Modal };
  } else {
    accountButtonInfo = { name: "Connect", action: loadWeb3Modal };
  }

  //Get info per user
  const infoPerUser = useContractReader(readContracts, "SlotMachine", "infoPerUser", [address]);
  let unclaimedWins = 0;
  let unclaimedReferrals = 0;

  if (infoPerUser) {
    unclaimedWins = infoPerUser.moneyEarned - infoPerUser.moneyClaimed;
    unclaimedReferrals = infoPerUser.earnedByReferrals - infoPerUser.claimedByReferrals;
  }

  //Get balance
  let balance = utils.formatEther(yourLocalBalance || 0);
  balance = (+balance).toFixed(4);

  let connectYourWalletSection = (
    <div>
      <h3>Please, connect your wallet</h3>
      <p>Please connect your wallet to play, earn and claim your rewards.</p>
      {web3Modal && (
        <Button style={{ marginLeft: 8 }} shape="round" onClick={accountButtonInfo.action}>
          {accountButtonInfo.name}
        </Button>
      )}
    </div>
  );

  const txValueInput = (
    <div style={{ margin: 2 }} key="txValueInput">
      <Input
        placeholder="Total bet"
        //onChange={e => setTxValue(e.target.value)}
        //value={txValue}
      />
    </div>
  );

  let gameSection = (
    <div id="game">
      <div id="board">
        <div id="reel1"></div>
        <div id="reel2"></div>
        <div id="reel3"></div>
      </div>
      <div id="controls">
        <div id="moneySelector">
          <Button id="spinButton" style={{ marginLeft: 8 }} shape="round">
            -
          </Button>
          <div>{txValueInput}</div>
          <Button id="spinButton" style={{ marginLeft: 8 }} shape="round">
            +
          </Button>
        </div>
        <Button id="spinButton" style={{ marginLeft: 8 }} shape="round">
          SPIN!
        </Button>
      </div>
    </div>
  );

  if (!address) {
    balance = "_____";
    unclaimedWins = "_____";
    unclaimedReferrals = "_____";
    gameSection = "";
  } else {
    connectYourWalletSection = "";
  }

  return (
    <div>
      <div id="header">
        <h2>Dashboard</h2>
        <p>All values are expressed in MATIC.</p>
      </div>
      <div id="balanceInfo" className="balanceInfo">
        <div className="balance">
          <h3>Balance</h3>
          <p>
            <b>{balance}</b>
          </p>
        </div>
        <div className="rewards">
          <h3>Unclaimed rewards</h3>
          <div>
            <h4>Wins:</h4>
            <p>{unclaimedWins}</p>
          </div>
          <div>
            <h4>Referrals:</h4>
            <p>{unclaimedReferrals}</p>
          </div>
        </div>
        {connectYourWalletSection}
        {gameSection}
      </div>
    </div>
  );
}

export default Home;
