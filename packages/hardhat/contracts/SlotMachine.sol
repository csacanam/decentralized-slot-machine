// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SlotMachine is Ownable, VRFConsumerBaseV2 {
    //VRF Chainlink
    VRFCoordinatorV2Interface COORDINATOR;
    uint64 subscriptionId;
    //Polygon mainnet keyHash
    //bytes32 keyHash = 0x6e099d640cde6de9d40ac749b4b594126b0169747122711109c9985d47751f93;
    //Mumbai keyHash
    bytes32 keyHash =
        0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f;
    uint32 callbackGasLimit = 100000;
    uint16 requestConfirmations = 3;
    uint32 numWords = 3;

    uint8 public constant INVALID_NUMBER = 20;

    mapping(uint256 => Round) public rounds;

    struct User {
        uint256 moneyAdded; //money added to contract
        uint256 moneyEarned; //money earned by the user
        uint256 moneyClaimed; //amount of money the user can claim
        bool active; //if true, user has activated the account
        address referringUserAddress; //the one who refers the user
        uint256 earnedByReferrals; //total money earned by referrals in the contract
        uint256 claimedByReferrals; //total money claimed by referrals in the contract
    }

    struct TeamMember {
        address devAddress;
        uint8 percentage;
    }

    struct Round {
        address userAddress;
        uint8 number1;
        uint8 number2;
        uint8 number3;
        uint256 value;
    }

    enum Symbols {
        cherry,
        bar,
        luckySeven,
        diamond
    }

    mapping(uint8 => uint256) public prize;
    Symbols[] public reel1;
    Symbols[] public reel2;
    Symbols[] public reel3;

    mapping(address => User) public infoPerUser; //information per user
    uint256 public users; //amount of users who have used the protocol
    uint256 public totalMoneyAdded; //total money added to the contract by users
    uint256 public totalMoneyEarnedByPlayers; //total money earned by players in the contract
    uint256 public totalMoneyClaimedByPlayers; //total money claimed by players in the contract
    uint256 public totalMoneyEarnedByDevs; //total money earned by devs
    uint256 public totalMoneyClaimedByDevs; //total money claimed by devs
    uint256 public totalMoneyEarnedByReferrals; //total money earned by referrals in the contract
    uint256 public totalMoneyClaimedByReferrals; //total money claimed by referrals in the contract

    //Dev Team
    TeamMember[] public teamMembers; //list of devs

    uint8 public constant DEV_FEE = 5; //Dev Fee - 5%
    uint8 public constant REFERRAL_FEE = 1; //Referrral Fee - 1%

    //Events
    event ReceivedRandomness(uint256 reqId, uint256 n1, uint256 n2, uint256 n3);
    event RequestedRandomness(uint256 reqId, address invoker);

    constructor(
        uint64 _subscriptionId,
        address _vrfCoordinator
    ) payable VRFConsumerBaseV2(_vrfCoordinator) {
        COORDINATOR = VRFCoordinatorV2Interface(_vrfCoordinator);
        subscriptionId = _subscriptionId;

        prize[0] = 5 ether;
        prize[1] = 14 ether;
        prize[2] = 20 ether;
        prize[3] = 30 ether;
        reel1 = [
            Symbols.cherry,
            Symbols.cherry,
            Symbols.cherry,
            Symbols.cherry,
            Symbols.cherry,
            Symbols.bar,
            Symbols.bar,
            Symbols.luckySeven,
            Symbols.luckySeven,
            Symbols.diamond
        ];
        reel2 = [
            Symbols.cherry,
            Symbols.cherry,
            Symbols.cherry,
            Symbols.cherry,
            Symbols.cherry,
            Symbols.bar,
            Symbols.bar,
            Symbols.luckySeven,
            Symbols.luckySeven,
            Symbols.diamond
        ];
        reel3 = [
            Symbols.cherry,
            Symbols.cherry,
            Symbols.cherry,
            Symbols.cherry,
            Symbols.cherry,
            Symbols.bar,
            Symbols.bar,
            Symbols.luckySeven,
            Symbols.luckySeven,
            Symbols.diamond
        ];
    }

    //1. CORE LOGIC

    /**
     * @dev Allow user to play in the slot machine
     * @param referringUserAddress user who refer this play
     */
    function play(
        address referringUserAddress
    ) public payable returns (uint256 requestId) {
        require(msg.value > 0, "Amount should be greater than 0");
        require(msg.value == 1 ether, "msg.value should be 1 ether");
        require(
            getMoneyInContract() - getCurrentDebt() >= 30 ether,
            "There is no money to pay. The contract should have more money."
        );

        User memory currentUser = infoPerUser[msg.sender];
        if (currentUser.active == false) {
            currentUser.active = true;
            currentUser.moneyEarned = 0;
            currentUser.earnedByReferrals = 0;
            currentUser.claimedByReferrals = 0;
            currentUser.referringUserAddress = referringUserAddress;
            users += 1;

            infoPerUser[msg.sender] = currentUser;
        }

        //Pay to referring user if exist
        if (currentUser.referringUserAddress != address(0)) {
            updateReferralEarnings(currentUser.referringUserAddress, msg.value);
        }

        requestId = COORDINATOR.requestRandomWords(
            keyHash,
            subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );

        rounds[requestId] = Round(
            msg.sender,
            INVALID_NUMBER,
            INVALID_NUMBER,
            INVALID_NUMBER,
            msg.value
        );

        emit RequestedRandomness(requestId, msg.sender);
    }

    /**
     * It is called when the randomWords are ready to be used
     * @param requestId Request id
     * @param randomWords Randow words
     */
    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal override {
        uint8 n1 = uint8(randomWords[0] % 10);
        uint8 n2 = uint8(randomWords[1] % 10);
        uint8 n3 = uint8(randomWords[2] % 10);

        Round memory round = rounds[requestId];

        round.number1 = n1;
        round.number2 = n2;
        round.number3 = n3;

        rounds[requestId] = round;

        User memory currentUser = infoPerUser[round.userAddress];

        //Check if the user won
        if (n1 == n2 && n2 == n3) {
            currentUser.moneyEarned += prize[n1];
            totalMoneyEarnedByPlayers += prize[n1];
        }

        //Update user info
        currentUser.moneyAdded += round.value;
        infoPerUser[round.userAddress] = currentUser;

        //Update general stats
        totalMoneyAdded += round.value;
        totalMoneyEarnedByDevs += getDevFee(round.value);

        emit ReceivedRandomness(requestId, n1, n2, n3);
    }

    /**
     *@dev Get total money in contract
     */
    function getMoneyInContract() public view returns (uint256) {
        return address(this).balance;
    }

    /**
     *@dev Get total debt in contract
     */
    function getCurrentDebt() public view returns (uint256) {
        uint256 debtWithPlayers = totalMoneyEarnedByPlayers -
            totalMoneyClaimedByPlayers;
        uint256 debtWithDevs = totalMoneyEarnedByDevs - totalMoneyClaimedByDevs;
        uint256 debtWithReferrals = totalMoneyEarnedByReferrals -
            totalMoneyClaimedByReferrals;

        return debtWithPlayers + debtWithDevs + debtWithReferrals;
    }

    /**
     *@dev Get dev fee given a specific amount
     */
    function getDevFee(uint256 amount) private pure returns (uint256) {
        return ((amount * DEV_FEE) / 100);
    }

    /**
     *@dev Get referral fee given a specific amount
     */
    function getReferralFee(uint256 amount) private pure returns (uint256) {
        return ((amount * REFERRAL_FEE) / 100);
    }

    /**
     *@dev Update referral earnings
     *@param referringUserAddress referring user addresss
     *@param amountToAdd amount to add to the referring user
     */
    function updateReferralEarnings(
        address referringUserAddress,
        uint256 amountToAdd
    ) private {
        totalMoneyEarnedByReferrals += ((amountToAdd * REFERRAL_FEE) / 100);

        infoPerUser[referringUserAddress].earnedByReferrals += ((amountToAdd *
            REFERRAL_FEE) / 100);
    }

    //2. DEV LOGIC

    /**
     *@dev Add a dev to the list of members
     *@param teamMemberAddress the address
     *@param percentage the share for the user (ex: 10 means 10% of the commission to this dev)
     */
    function addTeamMember(
        address teamMemberAddress,
        uint8 percentage
    ) public onlyOwner {
        bool existingMember = false;
        uint8 currentPercentage = 0;

        for (uint8 i = 0; i < teamMembers.length; i++) {
            TeamMember memory teamMember = teamMembers[i];
            currentPercentage += teamMember.percentage;

            if (teamMemberAddress == teamMember.devAddress) {
                existingMember = true;
            }
        }

        require(!existingMember, "There is a member with given address");

        require(
            currentPercentage < 100,
            "There is not available space to add a team member"
        );

        require(
            (currentPercentage + percentage) <= 100,
            "The total new percentage cannot be more than 100"
        );

        //Add new member
        TeamMember memory newTeamMember = TeamMember(
            teamMemberAddress,
            percentage
        );
        teamMembers.push(newTeamMember);
    }

    /**
     *@dev Remove a dev from the list of members
     *@param teamMemberAddress the address
     */
    function removeTeamMember(address teamMemberAddress) public onlyOwner {
        for (uint8 i = 0; i < teamMembers.length; i++) {
            TeamMember memory teamMember = teamMembers[i];
            if (teamMember.devAddress == teamMemberAddress) {
                //Move last member to spot i
                teamMembers[i] = teamMembers[teamMembers.length - 1];
                //Remove last member in the array
                teamMembers.pop();
                break;
            }
        }
    }

    /**
     *@dev Claim dev earnings
     */
    function claimDevEarnings() public onlyTeamMember {
        require(
            teamMembers.length > 0,
            "There are not team members in the list"
        );

        uint256 totalPendingMoney = totalMoneyEarnedByDevs -
            totalMoneyClaimedByDevs;

        require(
            totalPendingMoney > 0,
            "There is no total pending money to pay to devs"
        );

        for (uint8 i = 0; i < teamMembers.length; i++) {
            TeamMember memory teamMember = teamMembers[i];

            uint256 amounToPay = (totalPendingMoney * teamMember.percentage) /
                100;

            address payable devAddressPayable = payable(teamMember.devAddress);
            devAddressPayable.transfer(amounToPay);

            totalMoneyClaimedByDevs += amounToPay;
        }
    }

    /**
     * Claim player earnings of a specific user
     * @param userAddress user address
     */
    function claimPlayerEarnings(address userAddress) public {
        User memory user = infoPerUser[userAddress];
        require(
            user.moneyEarned > 0 || user.earnedByReferrals > 0,
            "User has not earned money"
        );
        uint256 moneyToClaimForPlay = user.moneyEarned - user.moneyClaimed;
        uint256 moneyToClaimForReferring = user.earnedByReferrals -
            user.claimedByReferrals;

        uint256 moneyToClaim = moneyToClaimForPlay + moneyToClaimForReferring;

        require(moneyToClaim > 0, "User has claimed all the earnings");

        address payable userAdressPayable = payable(userAddress);
        userAdressPayable.transfer(moneyToClaim);

        //Update user and global stats
        infoPerUser[userAddress].moneyClaimed += moneyToClaimForPlay;
        totalMoneyClaimedByPlayers += moneyToClaimForPlay;

        infoPerUser[userAddress].claimedByReferrals += moneyToClaimForReferring;
        totalMoneyClaimedByReferrals += moneyToClaimForReferring;
    }

    /**
     *@dev Get total team members in contract
     */
    function getTeamMembersLength() public view returns (uint256) {
        return teamMembers.length;
    }

    /**
     *@dev Get total team members list
     */
    function getTeamMemberList() public view returns (TeamMember[] memory) {
        return teamMembers;
    }

    /**
     * Get round information
     * @param roundId roundId
     */
    function getRoundInfo(uint256 roundId) public view returns (Round memory) {
        return rounds[roundId];
    }

    //3. MODIFIERS AND OTHERS

    receive() external payable {}

    /**
     *@dev Check if current user is part of the member list
     */
    modifier onlyTeamMember() {
        bool isMember = false;

        for (uint8 i = 0; i < teamMembers.length; i++) {
            TeamMember memory teamMember = teamMembers[i];

            if (msg.sender == teamMember.devAddress) {
                isMember = true;
                break;
            }
        }

        require(isMember, "User is not part of the team members");
        _;
    }
}
