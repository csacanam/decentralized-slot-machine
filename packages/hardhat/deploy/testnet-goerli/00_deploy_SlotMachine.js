const { ethers } = require("hardhat");

//Key Hash
const GOERLI_KEY_HASH =
  "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15";

//CoordinatorAddress
const GOERLI_COORDINATOR_ADDRESS = "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D";

//Subscription
const GOERLI_SUBSCRIPTION_ID = process.env.GOERLI_SUBSCRIPTION_ID;

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  let keyHash;
  let vrfCoordinatorAddress;
  let subscriptionId;

  keyHash = GOERLI_KEY_HASH;
  vrfCoordinatorAddress = GOERLI_COORDINATOR_ADDRESS;
  subscriptionId = GOERLI_SUBSCRIPTION_ID;

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
