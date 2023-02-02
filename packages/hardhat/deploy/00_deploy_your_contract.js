const { ethers } = require("hardhat");
const { chain } = require("ramda");

//Testnets
const LOCAL_CHAIN_ID = "31337";
const GOERLI_CHAIN_ID = "5";
const MUMBAI_CHAIN_ID = "80001";

//Mainnets
const POLYGON_CHAIN_ID = "137";

//Key Hash
const GOERLI_KEY_HASH =
  "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15";
const MUMBAI_KEY_HASH =
  "0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f";
const POLYGON_KEY_HASH =
  "0x6e099d640cde6de9d40ac749b4b594126b0169747122711109c9985d47751f93";

//CoordinatorAddress
const GOERLI_COORDINATOR_ADDRESS = "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D";
const MUMBAI_COORDINATOR_ADDRESS = "0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed";
const POLYGON_COORDINATOR_ADDRESS =
  "	0xAE975071Be8F8eE67addBC1A82488F1C24858067";

//Subscription
const LOCAL_SUBSCRIPTION_ID = "1";
const GOERLI_SUBSCRIPTION_ID = "9404";
const MUMBAI_SUBSCRIPTION_ID = "";
const POLYGON_SUBSCRIPTION_ID = "";

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();
  let keyHash;
  let vrfCoordinatorAddress;
  let hardhatVrfCoordinatorV2Mock;
  let subscriptionId;

  if (chainId == LOCAL_CHAIN_ID) {
    keyHash = MUMBAI_KEY_HASH;
    subscriptionId = LOCAL_SUBSCRIPTION_ID;

    await deploy("VRFCoordinatorV2Mock", {
      from: deployer,
      args: [0, 0],
      log: true,
      waitConfirmations: 5,
    });

    hardhatVrfCoordinatorV2Mock = await ethers.getContract(
      "VRFCoordinatorV2Mock"
    );

    await hardhatVrfCoordinatorV2Mock.createSubscription();

    await hardhatVrfCoordinatorV2Mock.fundSubscription(
      1,
      ethers.utils.parseEther("7")
    );

    vrfCoordinatorAddress = hardhatVrfCoordinatorV2Mock.address;
  }

  if (chainId == GOERLI_CHAIN_ID) {
    keyHash = GOERLI_KEY_HASH;
    vrfCoordinatorAddress = GOERLI_COORDINATOR_ADDRESS;
    subscriptionId = GOERLI_SUBSCRIPTION_ID;
  }

  if (chainId == MUMBAI_CHAIN_ID) {
    keyHash = MUMBAI_KEY_HASH;
    vrfCoordinatorAddress = MUMBAI_COORDINATOR_ADDRESS;
    subscriptionId = MUMBAI_SUBSCRIPTION_ID;
  }

  if (chainId == POLYGON_CHAIN_ID) {
    keyHash = POLYGON_KEY_HASH;
    vrfCoordinatorAddress = POLYGON_COORDINATOR_ADDRESS;
    subscriptionId = POLYGON_SUBSCRIPTION_ID;
  }

  const myContract = await deploy("SlotMachine", {
    from: deployer,
    args: [subscriptionId, vrfCoordinatorAddress, keyHash],
    log: true,
    waitConfirmations: 5,
  });

  if (chainId == LOCAL_CHAIN_ID) {
    await hardhatVrfCoordinatorV2Mock.addConsumer(1, myContract.address);
  }

  console.log("Contract address: ", myContract.address);

  if (chainId != LOCAL_CHAIN_ID) {
    // Getting a previously deployed contract
    const deployedContract = await ethers.getContract("SlotMachine", deployer);
    // To take ownership of yourContract using the ownable library uncomment next line and add the
    // address you want to be the owner.
    await deployedContract.transferOwnership(
      "0x0a25C91209a158D0a4922837cdd590aCe0D13f0d"
    );
  }

  //const YourContract = await ethers.getContractAt('YourContract', "0xaAC799eC2d00C013f1F11c37E654e59B0429DF6A") //<-- if you want to instantiate a version of a contract at a specific address!

  /*
  //If you want to send value to an address from the deployer
  const deployerWallet = ethers.provider.getSigner()
  await deployerWallet.sendTransaction({
    to: "0x34aA3F359A9D614239015126635CE7732c18fDF3",
    value: ethers.utils.parseEther("0.001")
  })
  */

  /*
  //If you want to send some ETH to a contract on deploy (make your constructor payable!)
  const yourContract = await deploy("YourContract", [], {
  value: ethers.utils.parseEther("0.05")
  });
  */

  /*
  //If you want to link a library into your contract:
  // reference: https://github.com/austintgriffith/scaffold-eth/blob/using-libraries-example/packages/hardhat/scripts/deploy.js#L19
  const yourContract = await deploy("YourContract", [], {}, {
   LibraryName: **LibraryAddress**
  });
  */

  // Verify from the command line by running `yarn verify`

  // You can also Verify your contracts with Etherscan here...
  // You don't want to verify on localhost
  // try {
  //   if (chainId !== localChainId) {
  //     await run("verify:verify", {
  //       address: YourContract.address,
  //       contract: "contracts/YourContract.sol:YourContract",
  //       constructorArguments: [],
  //     });
  //   }
  // } catch (error) {
  //   console.error(error);
  // }
};
module.exports.tags = ["SlotMachine"];
