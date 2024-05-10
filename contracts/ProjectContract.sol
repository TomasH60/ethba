// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ProjectContract {
    address public owner;
    uint public fundingGoal;
    uint public totalFundsReceived;

    // Events to log actions
    event FundReceived(address sender, uint amount);
    event FundsWithdrawn(address recipient, uint amount);

    // Modifier to restrict actions to only the owner
    modifier onlyOwner() {
        require(msg.sender == owner, "You are not the owner.");
        _;
    }

    // Constructor to set the owner and funding goal during deployment
    constructor(uint _fundingGoal) {
        owner = msg.sender;
        fundingGoal = _fundingGoal;
    }

    // Function to receive funds
    receive() external payable {
        totalFundsReceived += msg.value;
        emit FundReceived(msg.sender, msg.value);
    }

    // Function to check if the funding goal is met
    function isGoalMet() public view returns(bool) {
        return totalFundsReceived >= fundingGoal;
    }

    // Function for the owner to withdraw funds after the goal is met
    function withdrawFunds() public onlyOwner {
        require(isGoalMet(), "Funding goal has not been met.");
        uint amount = address(this).balance;
        (bool success, ) = owner.call{value: amount}("");
        require(success, "Failed to send Ether");
        emit FundsWithdrawn(owner, amount);
    }

    // Function to get the current balance of the contract
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
}
