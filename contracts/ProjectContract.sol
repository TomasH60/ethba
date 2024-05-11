// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ProjectContract {
    address public owner;
    uint public fundingGoal;
    uint public totalFundsReceived;
    address[] public investors;
    uint[] public payoutFractions;
    uint public lastPayoutTime;
    uint public fractionIndex = 0;
    uint public voteYes;
    uint public voteNo; 
    bool public isApproved;
    uint public remainingFunds;

    mapping(address => uint) public amountInvested;

    event FundReceived(address sender, uint amount);
    event FundsWithdrawn(address recipient, uint amount, uint fraction);
    event FundReturned(address recipient, uint amount);
    event FundAdjusted(address investor, uint oldInvestment, uint newInvestment);

    modifier onlyOwner() {
        require(msg.sender == owner, "You are not the owner.");
        _;
    }

    constructor(uint _fundingGoal, uint[] memory _payoutFractions) {
        owner = msg.sender;
        fundingGoal = _fundingGoal;
        payoutFractions = _payoutFractions;
        lastPayoutTime = block.timestamp;
        remainingFunds = _fundingGoal;
    }

    receive() external payable {
        totalFundsReceived += msg.value;
        investors.push(msg.sender);
        amountInvested[msg.sender] += msg.value;
        emit FundReceived(msg.sender, msg.value);
    }

    function isGoalMet() public view returns(bool) {
        return totalFundsReceived >= fundingGoal;
    }

    function voteForYes() public {
        require(amountInvested[msg.sender] > fundingGoal / 100000, "Insufficient stake to vote.");
        uint votingPower = calculateVotingPower(msg.sender);
        voteYes += votingPower;
        if (voteYes > totalFundsReceived / 2) {
            isApproved = true;
        }
    }

    function voteForNo() public {
        require(amountInvested[msg.sender] > fundingGoal / 100000, "Insufficient stake to vote.");
        uint votingPower = calculateVotingPower(msg.sender);
        voteNo += votingPower;
        if (voteNo > totalFundsReceived / 2) {
            returnFundsToInvestors();
        }
    }

    function calculateVotingPower(address voter) internal view returns (uint) {
        uint votingPower = amountInvested[voter];
        
        return votingPower;
    }

    function returnFundsToInvestors() internal {
        for (uint i = 0; i < investors.length; i++) {
            address investor = investors[i];
            uint amount = amountInvested[investor];
            (bool success, ) = investor.call{value: amount}("");
            require(success, "Failed to return funds");
            emit FundReturned(investor, amount);
            amountInvested[investor] = 0; 
        }
        totalFundsReceived = 0; 
    }

    function withdrawFunds() public onlyOwner() {
        require(isGoalMet() && isApproved, "Cannot withdraw");
        uint amount = address(this).balance * payoutFractions[fractionIndex] / 100;

        for (uint i = 0; i < investors.length; i++) {
            address investor = investors[i];
            uint investorShare = amountInvested[investor] * amount / totalFundsReceived; 
            uint oldInvestment = amountInvested[investor];
            amountInvested[investor] -= investorShare;
            emit FundAdjusted(investor, oldInvestment, amountInvested[investor]);
        }

        (bool success, ) = owner.call{value: amount}("");
        require(success, "Failed to send Ether");
        emit FundsWithdrawn(owner, amount, payoutFractions[fractionIndex]);

        lastPayoutTime = block.timestamp;
        fractionIndex++;
        totalFundsReceived -= amount;
    }

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

    function getInvestors() public view returns (address[] memory) {
        return investors;
    }
    function getNoVotes() public view returns (uint) {
        return voteNo;
    }
    function getYesVotes() public view returns (uint) {
        return voteYes;
    }
}
