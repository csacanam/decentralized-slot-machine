const { ethers } = require("hardhat");

//CHAINLINK

//Key Hash
const POLYGON_KEY_HASH =
  "0x6e099d640cde6de9d40ac749b4b594126b0169747122711109c9985d47751f93";

//CoordinatorAddress
const POLYGON_COORDINATOR_ADDRESS =
  "	0xAE975071Be8F8eE67addBC1A82488F1C24858067";

//Subscription
const POLYGON_SUBSCRIPTION_ID = process.env.POLYGON_SUBSCRIPTION_ID;

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  let keyHash;
  let vrfCoordinatorAddress;
  let subscriptionId;

  keyHash = POLYGON_KEY_HASH;
  vrfCoordinatorAddress = POLYGON_COORDINATOR_ADDRESS;
  subscriptionId = POLYGON_SUBSCRIPTION_ID;

  const myContract = await deploy("SlotMachine", {
    from: deployer,
    args: [subscriptionId, vrfCoordinatorAddress, keyHash],
    log: true,
    waitConfirmations: 5,
  });

  console.log("Contract address: ", myContract.address);

  // Getting deployed contract
  const deployedContract = await ethers.getContract("SlotMachine", deployer);

  await deployedContract.transferOwnership(
    "0x0a25C91209a158D0a4922837cdd590aCe0D13f0d"
  );
};

module.exports.tags = ["SlotMachine"];
