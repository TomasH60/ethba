import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import "../scss/CreateProjectCard.scss";
import Button from "./Button";
import PlotFractions from "./PlotFractions";
import { db, auth } from "../../firebase.config.js";
import { collection, addDoc } from "firebase/firestore";
import { use } from "chai";

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
  `;
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
      "inputs": [],
      "name": "getNoVotes",
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
      "name": "getYesVotes",
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
  ]
  const CONTRACT_BYTECODE = "60806040525f600655348015610013575f80fd5b50604051611904380380611904833981810160405281019061003591906102a1565b335f806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508160018190555080600490805190602001906100919291906100a7565b504260058190555081600a8190555050506102fb565b828054828255905f5260205f209081019282156100e1579160200282015b828111156100e05782518255916020019190600101906100c5565b5b5090506100ee91906100f2565b5090565b5b80821115610109575f815f9055506001016100f3565b5090565b5f604051905090565b5f80fd5b5f80fd5b5f819050919050565b6101308161011e565b811461013a575f80fd5b50565b5f8151905061014b81610127565b92915050565b5f80fd5b5f601f19601f8301169050919050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52604160045260245ffd5b61019b82610155565b810181811067ffffffffffffffff821117156101ba576101b9610165565b5b80604052505050565b5f6101cc61010d565b90506101d88282610192565b919050565b5f67ffffffffffffffff8211156101f7576101f6610165565b5b602082029050602081019050919050565b5f80fd5b5f61021e610219846101dd565b6101c3565b9050808382526020820190506020840283018581111561024157610240610208565b5b835b8181101561026a5780610256888261013d565b845260208401935050602081019050610243565b5050509392505050565b5f82601f83011261028857610287610151565b5b815161029884826020860161020c565b91505092915050565b5f80604083850312156102b7576102b6610116565b5b5f6102c48582860161013d565b925050602083015167ffffffffffffffff8111156102e5576102e461011a565b5b6102f185828601610274565b9150509250929050565b6115fc806103085f395ff3fe608060405260043610610122575f3560e01c80637a3a0e841161009f578063addace6211610063578063addace62146104b5578063b2f5a54c146104df578063bf27f58514610509578063c2fb2e8014610533578063e5920ab5146105495761022d565b80637a3a0e84146103e35780637b34120e1461040d5780638da5cb5b1461043757806390cf581c14610461578063a5aa542e1461048b5761022d565b80633c3d3af6116100e65780633c3d3af6146102db5780633feb5f2b1461031757806341c12a701461035357806358a1cabf1461037d5780637854a486146103a75761022d565b80630cd205781461023157806312065fe01461025b57806324600fc31461028557806328f371aa1461029b5780633821d01c146102c55761022d565b3661022d573460025f8282546101389190610f61565b92505081905550600333908060018154018082558091505060019003905f5260205f20015f9091909190916101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555034600b5f3373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f8282546101eb9190610f61565b925050819055507f54a5b8782470a0d2c022b3b9e5e729503ac5dbdfe053afeb4559f9297f7565a63334604051610223929190610fe2565b60405180910390a1005b5f80fd5b34801561023c575f80fd5b50610245610573565b6040516102529190611023565b60405180910390f35b348015610266575f80fd5b5061026f610581565b60405161027c919061103c565b60405180910390f35b348015610290575f80fd5b50610299610588565b005b3480156102a6575f80fd5b506102af6109ea565b6040516102bc9190611023565b60405180910390f35b3480156102d0575f80fd5b506102d96109fc565b005b3480156102e6575f80fd5b5061030160048036038101906102fc9190611083565b610ad2565b60405161030e919061103c565b60405180910390f35b348015610322575f80fd5b5061033d600480360381019061033891906110d8565b610ae7565b60405161034a9190611103565b60405180910390f35b34801561035e575f80fd5b50610367610b22565b604051610374919061103c565b60405180910390f35b348015610388575f80fd5b50610391610b28565b60405161039e919061103c565b60405180910390f35b3480156103b2575f80fd5b506103cd60048036038101906103c891906110d8565b610b2e565b6040516103da919061103c565b60405180910390f35b3480156103ee575f80fd5b506103f7610b4e565b604051610404919061103c565b60405180910390f35b348015610418575f80fd5b50610421610b54565b60405161042e919061103c565b60405180910390f35b348015610442575f80fd5b5061044b610b5a565b6040516104589190611103565b60405180910390f35b34801561046c575f80fd5b50610475610b7d565b604051610482919061103c565b60405180910390f35b348015610496575f80fd5b5061049f610b83565b6040516104ac919061103c565b60405180910390f35b3480156104c0575f80fd5b506104c9610b89565b6040516104d6919061103c565b60405180910390f35b3480156104ea575f80fd5b506104f3610b92565b60405161050091906111d3565b60405180910390f35b348015610514575f80fd5b5061051d610c1d565b60405161052a919061103c565b60405180910390f35b34801561053e575f80fd5b50610547610c23565b005b348015610554575f80fd5b5061055d610d0b565b60405161056a919061103c565b60405180910390f35b5f6001546002541015905090565b5f47905090565b5f8054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610615576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161060c9061124d565b60405180910390fd5b61061d610573565b8015610634575060095f9054906101000a900460ff165b610673576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161066a906112b5565b60405180910390fd5b5f606460046006548154811061068c5761068b6112d3565b5b905f5260205f200154476106a09190611300565b6106aa919061136e565b90505f5b60038054905081101561086f575f600382815481106106d0576106cf6112d3565b5b905f5260205f20015f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1690505f60025484600b5f8573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f20546107479190611300565b610751919061136e565b90505f600b5f8473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f2054905081600b5f8573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f8282546107e0919061139e565b925050819055507fab8cd09583b5834ce840063919d618bf4485e663075a195247ed4481d54bd6a58382600b5f8773ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f2054604051610857939291906113d1565b60405180910390a150505080806001019150506106ae565b505f805f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16826040516108b590611433565b5f6040518083038185875af1925050503d805f81146108ef576040519150601f19603f3d011682016040523d82523d5f602084013e6108f4565b606091505b5050905080610938576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161092f90611491565b60405180910390fd5b7ffbc3a599b784fe88772fc5abcc07223f64ca0b13acc341f4fb1e46bef0510eb45f8054906101000a900473ffffffffffffffffffffffffffffffffffffffff16836004600654815481106109905761098f6112d3565b5b905f5260205f2001546040516109a8939291906113d1565b60405180910390a14260058190555060065f8154809291906109c9906114af565b91905055508160025f8282546109df919061139e565b925050819055505050565b60095f9054906101000a900460ff1681565b620186a0600154610a0d919061136e565b600b5f3373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205411610a8b576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610a8290611540565b60405180910390fd5b5f610a9533610d14565b90508060085f828254610aa89190610f61565b9250508190555060028054610abd919061136e565b6008541115610acf57610ace610d5f565b5b50565b600b602052805f5260405f205f915090505481565b60038181548110610af6575f80fd5b905f5260205f20015f915054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60085481565b60055481565b60048181548110610b3d575f80fd5b905f5260205f20015f915090505481565b60015481565b60065481565b5f8054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60075481565b600a5481565b5f600754905090565b60606003805480602002602001604051908101604052809291908181526020018280548015610c1357602002820191905f5260205f20905b815f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019060010190808311610bca575b5050505050905090565b60025481565b620186a0600154610c34919061136e565b600b5f3373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205411610cb2576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610ca990611540565b60405180910390fd5b5f610cbc33610d14565b90508060075f828254610ccf9190610f61565b9250508190555060028054610ce4919061136e565b6007541115610d0857600160095f6101000a81548160ff0219169083151502179055505b50565b5f600854905090565b5f80600b5f8473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f2054905080915050919050565b5f5b600380549050811015610f21575f60038281548110610d8357610d826112d3565b5b905f5260205f20015f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1690505f600b5f8373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205490505f8273ffffffffffffffffffffffffffffffffffffffff1682604051610e1390611433565b5f6040518083038185875af1925050503d805f8114610e4d576040519150601f19603f3d011682016040523d82523d5f602084013e610e52565b606091505b5050905080610e96576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610e8d906115a8565b60405180910390fd5b7ff0f0519cd10c4b06281b3bcd73769ee2071e9f11d6a5cfa92b565d51c56430838383604051610ec7929190610fe2565b60405180910390a15f600b5f8573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f20819055505050508080600101915050610d61565b505f600281905550565b5f819050919050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52601160045260245ffd5b5f610f6b82610f2b565b9150610f7683610f2b565b9250828201905080821115610f8e57610f8d610f34565b5b92915050565b5f73ffffffffffffffffffffffffffffffffffffffff82169050919050565b5f610fbd82610f94565b9050919050565b610fcd81610fb3565b82525050565b610fdc81610f2b565b82525050565b5f604082019050610ff55f830185610fc4565b6110026020830184610fd3565b9392505050565b5f8115159050919050565b61101d81611009565b82525050565b5f6020820190506110365f830184611014565b92915050565b5f60208201905061104f5f830184610fd3565b92915050565b5f80fd5b61106281610fb3565b811461106c575f80fd5b50565b5f8135905061107d81611059565b92915050565b5f6020828403121561109857611097611055565b5b5f6110a58482850161106f565b91505092915050565b6110b781610f2b565b81146110c1575f80fd5b50565b5f813590506110d2816110ae565b92915050565b5f602082840312156110ed576110ec611055565b5b5f6110fa848285016110c4565b91505092915050565b5f6020820190506111165f830184610fc4565b92915050565b5f81519050919050565b5f82825260208201905092915050565b5f819050602082019050919050565b61114e81610fb3565b82525050565b5f61115f8383611145565b60208301905092915050565b5f602082019050919050565b5f6111818261111c565b61118b8185611126565b935061119683611136565b805f5b838110156111c65781516111ad8882611154565b97506111b88361116b565b925050600181019050611199565b5085935050505092915050565b5f6020820190508181035f8301526111eb8184611177565b905092915050565b5f82825260208201905092915050565b7f596f7520617265206e6f7420746865206f776e65722e000000000000000000005f82015250565b5f6112376016836111f3565b915061124282611203565b602082019050919050565b5f6020820190508181035f8301526112648161122b565b9050919050565b7f43616e6e6f7420776974686472617700000000000000000000000000000000005f82015250565b5f61129f600f836111f3565b91506112aa8261126b565b602082019050919050565b5f6020820190508181035f8301526112cc81611293565b9050919050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52603260045260245ffd5b5f61130a82610f2b565b915061131583610f2b565b925082820261132381610f2b565b9150828204841483151761133a57611339610f34565b5b5092915050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52601260045260245ffd5b5f61137882610f2b565b915061138383610f2b565b92508261139357611392611341565b5b828204905092915050565b5f6113a882610f2b565b91506113b383610f2b565b92508282039050818111156113cb576113ca610f34565b5b92915050565b5f6060820190506113e45f830186610fc4565b6113f16020830185610fd3565b6113fe6040830184610fd3565b949350505050565b5f81905092915050565b50565b5f61141e5f83611406565b915061142982611410565b5f82019050919050565b5f61143d82611413565b9150819050919050565b7f4661696c656420746f2073656e642045746865720000000000000000000000005f82015250565b5f61147b6014836111f3565b915061148682611447565b602082019050919050565b5f6020820190508181035f8301526114a88161146f565b9050919050565b5f6114b982610f2b565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff82036114eb576114ea610f34565b5b600182019050919050565b7f496e73756666696369656e74207374616b6520746f20766f74652e00000000005f82015250565b5f61152a601b836111f3565b9150611535826114f6565b602082019050919050565b5f6020820190508181035f8301526115578161151e565b9050919050565b7f4661696c656420746f2072657475726e2066756e6473000000000000000000005f82015250565b5f6115926016836111f3565b915061159d8261155e565b602082019050919050565b5f6020820190508181035f8301526115bf81611586565b905091905056fea26469706673582212209e06911d59389371289db1648feb7c7fc2cffcaaf222522a4d717b2db61efae164736f6c63430008190033";

  const processForm = async (e) => {
    e.preventDefault();
    await deployContract();
    console.log('Form submitted and saved');
    
  }
  useEffect(() => {
    async function fetchData() {
        try {
            await storeData();
        } catch (error) {
            console.error('Failed to store data:', error);
        }
    }
    fetchData();
}, [ownerAddress, contractAddress]);

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
