import React, { useState } from "react";
import { ethers } from 'ethers';
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import "../scss/CreateProjectCard.scss";
import Button from "./Button";
import PlotFractions from "./PlotFractions";
import { db, auth } from "../../firebase.config.js";
import { collection, addDoc } from "firebase/firestore";

const CreateProjectCard = ({ onClose }) => {
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [imgLink, setImgLink] = useState("");
  const [webLink, setWebLink] = useState("");
  const [fundingGoal, setFundingGoal] = useState("");
  const [fractionNums, setFractionNums] = useState();
  const [fractions, setFractions] = useState([0]);
  const [contractAddress, setContractAddress] = useState("");
  const [ownerAddress, setOwnerAddress] = useState("");
  const solidityCode = `// SPDX-License-Identifier: MIT
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
          if (voteYes * 1e18 > remainingFunds * 1e18 / 100 * 51) {
              isApproved = true;
          }
      }
  
      function voteForNo() public {
          require(amountInvested[msg.sender] > fundingGoal / 100000, "Insufficient stake to vote.");
          uint votingPower = calculateVotingPower(msg.sender);
          voteNo += votingPower;
          if (voteNo * 1e18 > remainingFunds * 1e18 / 100 * 51) {
              returnFundsToInvestors();
          }
      }
  
      function calculateVotingPower(address voter) internal view returns (uint) {
          uint votingPower = amountInvested[voter];
          uint maxVotingPower = fundingGoal / 10;
          if (votingPower > maxVotingPower) {
              votingPower = maxVotingPower;
          }
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
      }
  
      function getBalance() public view returns (uint) {
          return address(this).balance;
      }
  
      function getInvestors() public view returns (address[] memory) {
          return investors;
      }
  }
  `
  const CONTRACT_ABI = [
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_fundingGoal",
          "type": "uint256"
        },
        {
          "internalType": "uint256[]",
          "name": "_payoutFractions",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "investor",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "oldInvestment",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newInvestment",
          "type": "uint256"
        }
      ],
      "name": "FundAdjusted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "sender",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "FundReceived",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "FundReturned",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "fraction",
          "type": "uint256"
        }
      ],
      "name": "FundsWithdrawn",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "amountInvested",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "fractionIndex",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "fundingGoal",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getBalance",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getInvestors",
      "outputs": [
        {
          "internalType": "address[]",
          "name": "",
          "type": "address[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "investors",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "isApproved",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "isGoalMet",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "lastPayoutTime",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "payoutFractions",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "remainingFunds",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalFundsReceived",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "voteForNo",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "voteForYes",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "voteNo",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "voteYes",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "withdrawFunds",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "stateMutability": "payable",
      "type": "receive"
    }
  ];
  const CONTRACT_BYTECODE = "60806040525f600655348015610013575f80fd5b506040516118f53803806118f5833981810160405281019061003591906102a1565b335f806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508160018190555080600490805190602001906100919291906100a7565b504260058190555081600a8190555050506102fb565b828054828255905f5260205f209081019282156100e1579160200282015b828111156100e05782518255916020019190600101906100c5565b5b5090506100ee91906100f2565b5090565b5b80821115610109575f815f9055506001016100f3565b5090565b5f604051905090565b5f80fd5b5f80fd5b5f819050919050565b6101308161011e565b811461013a575f80fd5b50565b5f8151905061014b81610127565b92915050565b5f80fd5b5f601f19601f8301169050919050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52604160045260245ffd5b61019b82610155565b810181811067ffffffffffffffff821117156101ba576101b9610165565b5b80604052505050565b5f6101cc61010d565b90506101d88282610192565b919050565b5f67ffffffffffffffff8211156101f7576101f6610165565b5b602082029050602081019050919050565b5f80fd5b5f61021e610219846101dd565b6101c3565b9050808382526020820190506020840283018581111561024157610240610208565b5b835b8181101561026a5780610256888261013d565b845260208401935050602081019050610243565b5050509392505050565b5f82601f83011261028857610287610151565b5b815161029884826020860161020c565b91505092915050565b5f80604083850312156102b7576102b6610116565b5b5f6102c48582860161013d565b925050602083015167ffffffffffffffff8111156102e5576102e461011a565b5b6102f185828601610274565b9150509250929050565b6115ed806103085f395ff3fe60806040526004361061010c575f3560e01c80637854a4861161009457806390cf581c1161006357806390cf581c1461044b578063a5aa542e14610475578063b2f5a54c1461049f578063bf27f585146104c9578063c2fb2e80146104f357610217565b80637854a486146103915780637a3a0e84146103cd5780637b34120e146103f75780638da5cb5b1461042157610217565b80633821d01c116100db5780633821d01c146102af5780633c3d3af6146102c55780633feb5f2b1461030157806341c12a701461033d57806358a1cabf1461036757610217565b80630cd205781461021b57806312065fe01461024557806324600fc31461026f57806328f371aa1461028557610217565b36610217573460025f8282546101229190610f52565b92505081905550600333908060018154018082558091505060019003905f5260205f20015f9091909190916101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555034600b5f3373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f8282546101d59190610f52565b925050819055507f54a5b8782470a0d2c022b3b9e5e729503ac5dbdfe053afeb4559f9297f7565a6333460405161020d929190610fd3565b60405180910390a1005b5f80fd5b348015610226575f80fd5b5061022f610509565b60405161023c9190611014565b60405180910390f35b348015610250575f80fd5b50610259610517565b604051610266919061102d565b60405180910390f35b34801561027a575f80fd5b5061028361051e565b005b348015610290575f80fd5b50610299610968565b6040516102a69190611014565b60405180910390f35b3480156102ba575f80fd5b506102c361097a565b005b3480156102d0575f80fd5b506102eb60048036038101906102e69190611074565b610a83565b6040516102f8919061102d565b60405180910390f35b34801561030c575f80fd5b50610327600480360381019061032291906110c9565b610a98565b60405161033491906110f4565b60405180910390f35b348015610348575f80fd5b50610351610ad3565b60405161035e919061102d565b60405180910390f35b348015610372575f80fd5b5061037b610ad9565b604051610388919061102d565b60405180910390f35b34801561039c575f80fd5b506103b760048036038101906103b291906110c9565b610adf565b6040516103c4919061102d565b60405180910390f35b3480156103d8575f80fd5b506103e1610aff565b6040516103ee919061102d565b60405180910390f35b348015610402575f80fd5b5061040b610b05565b604051610418919061102d565b60405180910390f35b34801561042c575f80fd5b50610435610b0b565b60405161044291906110f4565b60405180910390f35b348015610456575f80fd5b5061045f610b2e565b60405161046c919061102d565b60405180910390f35b348015610480575f80fd5b50610489610b34565b604051610496919061102d565b60405180910390f35b3480156104aa575f80fd5b506104b3610b3a565b6040516104c091906111c4565b60405180910390f35b3480156104d4575f80fd5b506104dd610bc5565b6040516104ea919061102d565b60405180910390f35b3480156104fe575f80fd5b50610507610bcb565b005b5f6001546002541015905090565b5f47905090565b5f8054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146105ab576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016105a29061123e565b60405180910390fd5b6105b3610509565b80156105ca575060095f9054906101000a900460ff165b610609576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610600906112a6565b60405180910390fd5b5f6064600460065481548110610622576106216112c4565b5b905f5260205f2001544761063691906112f1565b610640919061135f565b90505f5b600380549050811015610805575f60038281548110610666576106656112c4565b5b905f5260205f20015f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1690505f60025484600b5f8573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f20546106dd91906112f1565b6106e7919061135f565b90505f600b5f8473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f2054905081600b5f8573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f828254610776919061138f565b925050819055507fab8cd09583b5834ce840063919d618bf4485e663075a195247ed4481d54bd6a58382600b5f8773ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f20546040516107ed939291906113c2565b60405180910390a15050508080600101915050610644565b505f805f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168260405161084b90611424565b5f6040518083038185875af1925050503d805f8114610885576040519150601f19603f3d011682016040523d82523d5f602084013e61088a565b606091505b50509050806108ce576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016108c590611482565b60405180910390fd5b7ffbc3a599b784fe88772fc5abcc07223f64ca0b13acc341f4fb1e46bef0510eb45f8054906101000a900473ffffffffffffffffffffffffffffffffffffffff1683600460065481548110610926576109256112c4565b5b905f5260205f20015460405161093e939291906113c2565b60405180910390a14260058190555060065f81548092919061095f906114a0565b91905055505050565b60095f9054906101000a900460ff1681565b620186a060015461098b919061135f565b600b5f3373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205411610a09576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610a0090611531565b60405180910390fd5b5f610a1333610ce6565b90508060085f828254610a269190610f52565b9250508190555060336064670de0b6b3a7640000600a54610a4791906112f1565b610a51919061135f565b610a5b91906112f1565b670de0b6b3a7640000600854610a7191906112f1565b1115610a8057610a7f610d50565b5b50565b600b602052805f5260405f205f915090505481565b60038181548110610aa7575f80fd5b905f5260205f20015f915054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60085481565b60055481565b60048181548110610aee575f80fd5b905f5260205f20015f915090505481565b60015481565b60065481565b5f8054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60075481565b600a5481565b60606003805480602002602001604051908101604052809291908181526020018280548015610bbb57602002820191905f5260205f20905b815f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019060010190808311610b72575b5050505050905090565b60025481565b620186a0600154610bdc919061135f565b600b5f3373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205411610c5a576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610c5190611531565b60405180910390fd5b5f610c6433610ce6565b90508060075f828254610c779190610f52565b9250508190555060336064670de0b6b3a7640000600a54610c9891906112f1565b610ca2919061135f565b610cac91906112f1565b670de0b6b3a7640000600754610cc291906112f1565b1115610ce357600160095f6101000a81548160ff0219169083151502179055505b50565b5f80600b5f8473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205490505f600a600154610d38919061135f565b905080821115610d46578091505b8192505050919050565b5f5b600380549050811015610f12575f60038281548110610d7457610d736112c4565b5b905f5260205f20015f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1690505f600b5f8373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205490505f8273ffffffffffffffffffffffffffffffffffffffff1682604051610e0490611424565b5f6040518083038185875af1925050503d805f8114610e3e576040519150601f19603f3d011682016040523d82523d5f602084013e610e43565b606091505b5050905080610e87576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610e7e90611599565b60405180910390fd5b7ff0f0519cd10c4b06281b3bcd73769ee2071e9f11d6a5cfa92b565d51c56430838383604051610eb8929190610fd3565b60405180910390a15f600b5f8573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f20819055505050508080600101915050610d52565b505f600281905550565b5f819050919050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52601160045260245ffd5b5f610f5c82610f1c565b9150610f6783610f1c565b9250828201905080821115610f7f57610f7e610f25565b5b92915050565b5f73ffffffffffffffffffffffffffffffffffffffff82169050919050565b5f610fae82610f85565b9050919050565b610fbe81610fa4565b82525050565b610fcd81610f1c565b82525050565b5f604082019050610fe65f830185610fb5565b610ff36020830184610fc4565b9392505050565b5f8115159050919050565b61100e81610ffa565b82525050565b5f6020820190506110275f830184611005565b92915050565b5f6020820190506110405f830184610fc4565b92915050565b5f80fd5b61105381610fa4565b811461105d575f80fd5b50565b5f8135905061106e8161104a565b92915050565b5f6020828403121561108957611088611046565b5b5f61109684828501611060565b91505092915050565b6110a881610f1c565b81146110b2575f80fd5b50565b5f813590506110c38161109f565b92915050565b5f602082840312156110de576110dd611046565b5b5f6110eb848285016110b5565b91505092915050565b5f6020820190506111075f830184610fb5565b92915050565b5f81519050919050565b5f82825260208201905092915050565b5f819050602082019050919050565b61113f81610fa4565b82525050565b5f6111508383611136565b60208301905092915050565b5f602082019050919050565b5f6111728261110d565b61117c8185611117565b935061118783611127565b805f5b838110156111b757815161119e8882611145565b97506111a98361115c565b92505060018101905061118a565b5085935050505092915050565b5f6020820190508181035f8301526111dc8184611168565b905092915050565b5f82825260208201905092915050565b7f596f7520617265206e6f7420746865206f776e65722e000000000000000000005f82015250565b5f6112286016836111e4565b9150611233826111f4565b602082019050919050565b5f6020820190508181035f8301526112558161121c565b9050919050565b7f43616e6e6f7420776974686472617700000000000000000000000000000000005f82015250565b5f611290600f836111e4565b915061129b8261125c565b602082019050919050565b5f6020820190508181035f8301526112bd81611284565b9050919050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52603260045260245ffd5b5f6112fb82610f1c565b915061130683610f1c565b925082820261131481610f1c565b9150828204841483151761132b5761132a610f25565b5b5092915050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52601260045260245ffd5b5f61136982610f1c565b915061137483610f1c565b92508261138457611383611332565b5b828204905092915050565b5f61139982610f1c565b91506113a483610f1c565b92508282039050818111156113bc576113bb610f25565b5b92915050565b5f6060820190506113d55f830186610fb5565b6113e26020830185610fc4565b6113ef6040830184610fc4565b949350505050565b5f81905092915050565b50565b5f61140f5f836113f7565b915061141a82611401565b5f82019050919050565b5f61142e82611404565b9150819050919050565b7f4661696c656420746f2073656e642045746865720000000000000000000000005f82015250565b5f61146c6014836111e4565b915061147782611438565b602082019050919050565b5f6020820190508181035f83015261149981611460565b9050919050565b5f6114aa82610f1c565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff82036114dc576114db610f25565b5b600182019050919050565b7f496e73756666696369656e74207374616b6520746f20766f74652e00000000005f82015250565b5f61151b601b836111e4565b9150611526826114e7565b602082019050919050565b5f6020820190508181035f8301526115488161150f565b9050919050565b7f4661696c656420746f2072657475726e2066756e6473000000000000000000005f82015250565b5f6115836016836111e4565b915061158e8261154f565b602082019050919050565b5f6020820190508181035f8301526115b081611577565b905091905056fea2646970667358221220f1df7357d5da11814e2f7611cda988b9d06fe4e387d493e943987b0ddb5d87fb64736f6c63430008190033";

  const processForm = async (e) => {
    e.preventDefault();
    await deployContract();
    await storeData();
    console.log('Form submitted and saved');
    
  }
  const deployContract = async () => {
    if (!window.ethereum) {
        alert('Please install MetaMask to interact.');
        return;
    }

    try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        
        // Get the owner address
        const ownerAddress = await signer.getAddress();
        
        const ContractFactory = new ethers.ContractFactory(
            CONTRACT_ABI,
            CONTRACT_BYTECODE,
            signer
        );

        const contract = await ContractFactory.deploy(
            ethers.utils.parseUnits(fundingGoal, "ether"),
            fractions
        );

        await contract.deployed();

        console.log('Contract deployed to:', contract.address);
        
        // Update state with the contract address and owner address
        setContractAddress(contract.address);
        setOwnerAddress(ownerAddress);
    } catch (error) {
        console.error("Error deploying contract:", error);
    }
};



 const storeData = async () => {
    const totalPercentage = fractions.reduce((acc, curr) => acc + curr, 0);
    const projectData = {
      projectName,
      description,
      imgLink,
      webLink,
      fundingGoal,
      fractionNums,
      fractions,
      totalPercentage,
      contractAddress,
      ownerAddress
    };
    
    try {
      const docRef = await addDoc(collection(db, "projects"), projectData);
      console.log("Document written with ID: ", docRef.id);
    } catch (error) {
      console.error("Error adding document: ", error);
    }
};

  const handleFractionChange = (index, value) => {
    const newFractions = [...fractions];
    newFractions[index] = Number(value);
    setFractions(newFractions);
  };

  const renderFractionBoxes = () => {
    return (
      <div className="FractionBox">
        {Array.from({ length: parseInt(fractionNums, 10) }, (_, index) => (
          <div key={index} className="InputWithUnit">
            <input
              className="FractionInput"
              type="number"
              style={{ minWidth: "120px" }}
              value={fractions[index] || ""}
              onChange={(e) => handleFractionChange(index, e.target.value)}
              placeholder={`frac. ${index + 1}`}
            />
            <span className="Unit">%</span>
          </div>
        ))}
      </div>
    );
  };

  const totalPercentage = fractions.reduce((acc, curr) => acc + curr, 0);
  const isTotalValid = totalPercentage <= 100;

  const renderValidationMessage = () => {
    if (!isTotalValid) {
      return (
        <p style={{ color: "red", fontSize: '14px', marginBottom: '8px', minWidth: '100%'}}>
          Total percentage cannot exceed 100%.
        </p>
      );
    }
    return null;
  };

  return (
    <div className="CreateProjectCard-div">
      <div className="Wrapper-div">
        <div className="Form-div">
          <h1 className="HeaderProject-h1">Add a project</h1>
          <form className="Form-form" onSubmit={processForm}>
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
              <label>Project web link:</label>
              <input
                type="text"
                value={webLink}
                onChange={(e) => setWebLink(e.target.value)}
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
            <div className="FormField">
              <label>Number of fractions:</label>
              <input
                type="number"
                value={fractionNums}
                onChange={(e) => {
                  const num = Math.min(Number(e.target.value), 10);
                  setFractionNums(num);
                  setFractions(new Array(num).fill(0));
                }}
              />
            </div>
            {fractionNums > 0 && renderFractionBoxes()}
            {fractionNums > 0 && renderValidationMessage()}
            <button
              className="SubmitButton-button"
              type="submit"
              disabled={!isTotalValid}
            >
              Deploy contract
            </button>
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
