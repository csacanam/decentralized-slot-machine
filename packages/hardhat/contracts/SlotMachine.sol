// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract SlotMachine is Ownable {
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

    mapping(uint8 => uint256) public prize;
    enum Symbols {
        cherry,
        bar,
        luckySeven,
        diamond
    }
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

    constructor() payable {
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
    function play(address referringUserAddress) public payable {
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
        }

        //Pay to referring user if exist
        if (currentUser.referringUserAddress != address(0)) {
            updateReferralEarnings(currentUser.referringUserAddress, msg.value);
        }

        //Get random numbers
        uint8 result1 = uint8(
            uint256(
                keccak256(abi.encodePacked(block.timestamp, block.difficulty))
            ) % 4
        );
        uint8 result2 = uint8(
            uint256(
                keccak256(abi.encodePacked(block.timestamp, block.difficulty))
            ) % 4
        );

        uint8 result3 = uint8(
            uint256(
                keccak256(abi.encodePacked(block.timestamp, block.difficulty))
            ) % 4
        );

        //Check if the user won
        if (result1 == result2 && result2 == result3) {
            currentUser.moneyEarned += prize[result1];
            totalMoneyEarnedByPlayers += prize[result1];
        }

        //Update user info
        currentUser.moneyAdded += msg.value;
        infoPerUser[msg.sender] = currentUser;

        //Update general stats
        totalMoneyAdded += msg.value;
        totalMoneyEarnedByDevs += getDevFee(msg.value);
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

        User memory referringUser = infoPerUser[referringUserAddress];
        referringUser.earnedByReferrals += ((amountToAdd * REFERRAL_FEE) / 100);
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
        User user = infoPerUser[userAddress];
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
        referringUserAddress.transfer(moneyToClaim);

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
