import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Gun from 'gun';
import '../scss/CreateProjectCard.scss';

const gun = Gun(['http://localhost:8765/gun']); // Add your Gun peers here

const CreateProjectCard = () => {
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [imgLink, setImgLink] = useState('');
  const [fundingGoal, setFundingGoal] = useState('');

  const storeData = async (e) => {
    e.preventDefault();
    const projectData = { projectName, description, imgLink, fundingGoal };
    const projectRef = gun.get('projects').set(projectData);
    
    console.log("Data stored with Gun ref:", projectRef);
  
    // Log the data immediately after storing
    
  };
  localStorage.clear()

  const solidityCode = `
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.0;

    contract ProjectContract {
        address public owner;
        uint public fundingGoal;
        uint public totalFundsReceived;

        constructor(uint _fundingGoal) {
            owner = msg.sender;
            fundingGoal = _fundingGoal;
        }

        receive() external payable {
            totalFundsReceived += msg.value;
        }

        function withdrawFunds() public {
            require(totalFundsReceived >= fundingGoal, "Goal not reached");
            (bool sent, ) = owner.call{value: address(this).balance}("");
            require(sent, "Failed to send Ether");
        }
    }`;


  return (
    <div className='CreateProjectCard-div'>
        <div className='Form-div'>
          <form className='Form-form' onSubmit={(e) => storeData(e)}>
            <label>
              Project Name:
              <input type="text" value={projectName} onChange={e => setProjectName(e.target.value)} />
            </label>
            <label>
              Description:
              <textarea value={description} onChange={e => setDescription(e.target.value)} />
            </label>
            <label>
              Image Link:
              <input type="text" value={imgLink} onChange={e => setImgLink(e.target.value)} />
            </label>
            <label>
              Funding Goal:
              <input type="number" value={fundingGoal} onChange={e => setFundingGoal(e.target.value)} />
            </label>
            <button type="submit">Create Project</button>
          </form>
        </div>
        <div className='Code-div'>
          <SyntaxHighlighter language="solidity" style={materialLight}>
            {solidityCode}
          </SyntaxHighlighter>
        </div>
    </div>
  )
}

export default CreateProjectCard;
