const { ethers } = require("hardhat");
const { expect } = require("chai");

const provider = ethers.getDefaultProvider();

describe("Decentralized Slot Machine", async function () {
  let myContract;

  describe("Testing Decentralized Slot Machine", function () {
    //1. Contract deployment
    it("Should deploy Slot Machine Contract", async function () {
      const SlotMachine = await ethers.getContractFactory("SlotMachine");

      myContract = await SlotMachine.deploy({
        value: ethers.utils.parseEther("100"),
      });
    });

    //2. Play
    describe("First Play - First Player", function () {
      it("Contract should have more money in contract", async function () {
        //Get balance previous to bet
        const previousBalance = Number(
          await ethers.provider.getBalance(myContract.address)
        );

        //Play with 1 ether
        await myContract.play(ethers.constants.AddressZero, {
          value: ethers.utils.parseEther("1"),
        });

        //Get current balance
        const currentBalance = Number(
          await ethers.provider.getBalance(myContract.address)
        );

        //The balance in contract should have one ether more
        expect(currentBalance).to.be.equal(
          previousBalance + Number(ethers.utils.parseEther("1"))
        );
      });

      it("There should be 1 ether in totalMoneyAdded", async function () {
        const totalMoneyAdded = await myContract.totalMoneyAdded();

        expect(Number(totalMoneyAdded)).to.be.equal(
          Number(ethers.utils.parseEther("1"))
        );
      });

      it("There should be 0.05 ether in totalMoneyEarnedByDevs", async function () {
        const totalMoneyEarnedByDevs =
          await myContract.totalMoneyEarnedByDevs();

        expect(Number(totalMoneyEarnedByDevs)).to.be.equal(
          Number(ethers.utils.parseEther("0.05"))
        );
      });

      it("There should be 0 ether in totalMoneyEarnedByReferrals", async function () {
        const totalMoneyEarnedByReferrals =
          await myContract.totalMoneyEarnedByReferrals();

        expect(Number(totalMoneyEarnedByReferrals)).to.be.equal(
          Number(ethers.utils.parseEther("0"))
        );
      });

      it("First user should be active", async function () {
        const [account1, account2] = await ethers.getSigners();

        const user1 = await myContract.infoPerUser(account1.address);

        expect(user1.active).to.be.equal(true);
      });

      it("First user should have 1 ether in money added", async function () {
        const [account1, account2] = await ethers.getSigners();

        const user1 = await myContract.infoPerUser(account1.address);

        expect(Number(user1.moneyAdded)).to.be.equal(
          Number(ethers.utils.parseEther("1"))
        );
      });

      it("Number of users should be 1", async function () {
        const users = await myContract.users();

        expect(Number(users)).to.be.equal(Number(1));
      });
    });
  });
});
