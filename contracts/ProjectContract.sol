// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ProjectContract {
    address public owner;
    uint public fundingGoal;
    uint public totalFundsReceived;
    uint[] public payoutFractions;
    uint public lastPayoutTime;
    uint public payoutInterval; // Set the payout interval to one month
    uint public fractionIndex = 0; // to track which fraction to pay next

    // Events to log actions
    event FundReceived(address sender, uint amount);
    event FundsWithdrawn(address recipient, uint amount, uint fraction);

    // Modifier to restrict actions to only the owner
    modifier onlyOwner() {
        require(msg.sender == owner, "You are not the owner.");
        _;
    }

    constructor(uint _fundingGoal, uint[] memory _payoutFractions, uint _payoutInterval) {
        owner = msg.sender;
        fundingGoal = _fundingGoal;
        payoutFractions = _payoutFractions;
        lastPayoutTime = block.timestamp;
        payoutInterval = _payoutInterval; // Initialize the last payout time
    }

    receive() external payable {
        totalFundsReceived += msg.value;
        emit FundReceived(msg.sender, msg.value);
    }

    function isGoalMet() public view returns(bool) {
        return totalFundsReceived >= fundingGoal;
    }



    function isTimeForPayout() public view returns(bool) {
        return block.timestamp >= lastPayoutTime + payoutInterval && fractionIndex < payoutFractions.length;
    }

    // Now private and only called internally
    function withdrawFunds() public onlyOwner() {
        require(isGoalMet() && isTimeForPayout(), "cant withdraw");
        uint amount = address(this).balance * payoutFractions[fractionIndex] / 100;
        (bool success, ) = owner.call{value: amount}("");
        require(success, "Failed to send Ether");
        emit FundsWithdrawn(owner, amount, payoutFractions[fractionIndex]);

        lastPayoutTime = block.timestamp;
        fractionIndex++; // Move to the next fraction
    }

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
}
