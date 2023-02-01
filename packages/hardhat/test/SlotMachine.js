const { ethers } = require("hardhat");
const { expect } = require("chai");
const { BigNumber } = require("ethers");

const provider = ethers.getDefaultProvider();

describe("Decentralized Slot Machine", async function () {
  let myContract;
  let hardhatVrfCoordinatorV2Mock;
  let account1;

  describe("Testing Deployment", function () {
    //1. Contract deployment
    it("Contracts deployed", async function () {
      const SlotMachine = await ethers.getContractFactory("SlotMachine");
      let vrfCoordinatorV2Mock = await ethers.getContractFactory(
        "VRFCoordinatorV2Mock"
      );

      hardhatVrfCoordinatorV2Mock = await vrfCoordinatorV2Mock.deploy(0, 0);

      await hardhatVrfCoordinatorV2Mock.createSubscription();

      await hardhatVrfCoordinatorV2Mock.fundSubscription(
        1,
        ethers.utils.parseEther("7")
      );

      myContract = await SlotMachine.deploy(
        1,
        hardhatVrfCoordinatorV2Mock.address,
        {
          value: ethers.utils.parseEther("100"),
        }
      );

      await hardhatVrfCoordinatorV2Mock.addConsumer(1, myContract.address);

      [account1] = await ethers.getSigners();
    });

    //2. Round # 1
    describe("Round # 1 - First Player", function () {
      it("Contract should receive random numbers", async () => {
        const [account1, account2] = await ethers.getSigners();

        let tx = await myContract.play(ethers.constants.AddressZero, {
          value: ethers.utils.parseEther("0.1"),
        });
        let { events } = await tx.wait();

        let [reqId] = events.filter((x) => x.event === "RequestedRandomness")[0]
          .args;

        await expect(
          hardhatVrfCoordinatorV2Mock.fulfillRandomWords(
            reqId,
            myContract.address
          )
        ).to.emit(myContract, "ReceivedRandomness");

        let round = await myContract.rounds(reqId);

        expect(round.userAddress).to.be.equal(account1.address);
        expect(round.number1).to.be.equal(1);
        expect(round.number2).to.be.equal(9);
        expect(round.number3).to.be.equal(6);
      });

      it("Number of users should be 1", async () => {
        const users = await myContract.users();
        expect(Number(users)).to.be.equal(Number(1));
      });

      it("First user should have 0.1 ether in money added", async () => {
        const [account1, account2] = await ethers.getSigners();
        const user1 = await myContract.infoPerUser(account1.address);
        expect(Number(user1.moneyAdded)).to.be.equal(
          Number(ethers.utils.parseEther("0.1"))
        );
      });

      it("First user should be active", async () => {
        const [account1, account2] = await ethers.getSigners();
        const user1 = await myContract.infoPerUser(account1.address);
        expect(user1.active).to.be.equal(true);
      });
    });

    describe("Round # 2 - First Player", function () {
      it("Contract should increment the money in contract", async function () {
        const [account1, account2] = await ethers.getSigners();

        //Get balance previous to bet
        const previousBalance = Number(
          await ethers.provider.getBalance(myContract.address)
        );

        let tx = await myContract.play(ethers.constants.AddressZero, {
          value: ethers.utils.parseEther("0.1"),
        });
        let { events } = await tx.wait();

        let [reqId] = events.filter((x) => x.event === "RequestedRandomness")[0]
          .args;

        await expect(
          hardhatVrfCoordinatorV2Mock.fulfillRandomWords(
            reqId,
            myContract.address
          )
        ).to.emit(myContract, "ReceivedRandomness");

        let round = await myContract.rounds(reqId);

        expect(round.userAddress).to.be.equal(account1.address);
        expect(round.number1).to.be.equal(1);
        expect(round.number2).to.be.equal(7);
        expect(round.number3).to.be.equal(8);

        //Get current balance
        const currentBalance = Number(
          await ethers.provider.getBalance(myContract.address)
        );

        //The balance in contract should have one ether more
        expect(currentBalance).to.be.equal(
          previousBalance + Number(ethers.utils.parseEther("0.1"))
        );
      });
    });

    describe("Final Stats", function () {
      it("There should be 0.2 ether in totalMoneyAdded", async function () {
        const totalMoneyAdded = await myContract.totalMoneyAdded();

        expect(Number(totalMoneyAdded)).to.be.equal(
          Number(ethers.utils.parseEther("0.2"))
        );
      });
      it("There should be 0 ether in totalMoneyClaimedByDevs", async function () {
        const totalMoneyClaimedByDevs =
          await myContract.totalMoneyClaimedByDevs();

        expect(Number(totalMoneyClaimedByDevs)).to.be.equal(
          Number(ethers.utils.parseEther("0"))
        );
      });
      it("There should be 0 ether in totalMoneyClaimedByPlayers", async function () {
        const totalMoneyClaimedByPlayers =
          await myContract.totalMoneyClaimedByPlayers();

        expect(Number(totalMoneyClaimedByPlayers)).to.be.equal(
          Number(ethers.utils.parseEther("0"))
        );
      });
      it("There should be 0 ether in totalMoneyClaimedByReferrals", async function () {
        const totalMoneyClaimedByReferrals =
          await myContract.totalMoneyClaimedByReferrals();

        expect(Number(totalMoneyClaimedByReferrals)).to.be.equal(
          Number(ethers.utils.parseEther("0"))
        );
      });
      it("There should be 0.01 ether in totalMoneyEarnedByDevs", async function () {
        const totalMoneyEarnedByDevs =
          await myContract.totalMoneyEarnedByDevs();

        expect(Number(totalMoneyEarnedByDevs)).to.be.equal(
          Number(ethers.utils.parseEther("0.01"))
        );
      });
      it("There should be 0 ether in totalMoneyEarnedByPlayers", async function () {
        const totalMoneyEarnedByPlayers =
          await myContract.totalMoneyEarnedByPlayers();

        expect(Number(totalMoneyEarnedByPlayers)).to.be.equal(
          Number(ethers.utils.parseEther("0"))
        );
      });
      it("There should be 0 ether in totalMoneyEarnedByReferrals", async function () {
        const totalMoneyEarnedByReferrals =
          await myContract.totalMoneyEarnedByReferrals();

        expect(Number(totalMoneyEarnedByReferrals)).to.be.equal(
          Number(ethers.utils.parseEther("0"))
        );
      });
    });
  });
});
