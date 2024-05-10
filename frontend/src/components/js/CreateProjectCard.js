import React, { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import "../scss/CreateProjectCard.scss";

const CreateProjectCard = () => {
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [imgLink, setImgLink] = useState("");
  const [fundingGoal, setFundingGoal] = useState("");

  const solidityCode = `contract ProjectContract {
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
  `;

  return (
    <div className="CreateProjectCard-div">
      <div className="Wrapper-div">
        <div className="Form-div">
          <h1>Create a new project</h1>
          <form className="Form-form">
            <div className="FormField">
              <label>Project Name:</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>
            <div className="FormField">
              <label>Description:</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="FormField">
              <label>Image Link:</label>
              <input
                type="text"
                value={imgLink}
                onChange={(e) => setImgLink(e.target.value)}
              />
            </div>
            <div className="FormField">
              <label>Funding Goal:</label>
              <input
                type="number"
                value={fundingGoal}
                onChange={(e) => setFundingGoal(e.target.value)}
              />
            </div>
            <button type="submit">Create Project</button>
          </form>
        </div>
        <div className="Code-div">
          <SyntaxHighlighter language="solidity" style={materialDark}>
            {solidityCode}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectCard;
