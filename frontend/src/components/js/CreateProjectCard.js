import React, { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import Gun from "gun";
import "../scss/CreateProjectCard.scss";

const gun = Gun(["http://localhost:8765/gun"]); // Add your Gun peers here

const CreateProjectCard = ({ onClose }) => {
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [imgLink, setImgLink] = useState("");
  const [fundingGoal, setFundingGoal] = useState("");

  const storeData = async (e) => {
    e.preventDefault(); // Prevent the form from submitting traditionally
    const projectData = { projectName, description, imgLink, fundingGoal };
    const projectRef = gun.get("projects").set(projectData); // Store data in Gun
    console.log("Data stored with Gun ref:", projectRef);
  };
  const solidityCode = `
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

        function withdrawFunds() public {
            require(totalFundsReceived >= fundingGoal, "Goal not reached");
            (bool sent, ) = owner.call{value: address(this).balance}("");
            require(sent, "Failed to send Ether");
        }
    }`;

  return (
    <div className="CreateProjectCard-div">
      <div className="Wrapper-div">
        <div className="Form-div">
          <h1>Create a new project</h1>
          <form className="Form-form" onSubmit={(e) => storeData}>
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
            <button className="SubmitButton-button" type="submit">Create Project</button>
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
