const { ethers } = require("hardhat");

//Testnets
const MUMBAI_CHAIN_ID = "80001";

//Key Hash
const MUMBAI_KEY_HASH =
  "0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f";

//CoordinatorAddress
const MUMBAI_COORDINATOR_ADDRESS = "0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed";

//Subscription
const MUMBAI_SUBSCRIPTION_ID = process.env.MUMBAI_SUBSCRIPTION_ID;

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  let keyHash;
  let vrfCoordinatorAddress;
  let subscriptionId;

  keyHash = MUMBAI_KEY_HASH;
  vrfCoordinatorAddress = MUMBAI_COORDINATOR_ADDRESS;
  subscriptionId = MUMBAI_SUBSCRIPTION_ID;

  const myContract = await deploy("SlotMachine", {
    from: deployer,
    args: [subscriptionId, vrfCoordinatorAddress, keyHash],
    log: true,
    waitConfirmations: 5,
  });

  console.log("Contract address: ", myContract.address);

  // Getting a previously deployed contract
  const deployedContract = await ethers.getContract("SlotMachine", deployer);
  // To take ownership of yourContract using the ownable library uncomment next line and add the
  // address you want to be the owner.
  await deployedContract.transferOwnership(
    "0x0a25C91209a158D0a4922837cdd590aCe0D13f0d"
  );
};
module.exports.tags = ["SlotMachine"];
