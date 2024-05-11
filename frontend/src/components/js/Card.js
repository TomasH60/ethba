import React, { useState, useEffect } from "react";
import "../scss/Card.scss";
import Button from "./Button";
import PlotFractions from "./PlotFractions";
import { div } from "three/examples/jsm/nodes/Nodes.js";
import { ethers } from 'ethers';
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
const defaultImage = "path/to/your/default/image.png"; // Define a default image

const Card = (props) => {
  const [isInvestor, setIsInvestor] = useState(false); // Default to false
  const [voteTime, setVoteTime] = useState(false); // Default to false
  const [timer, setTimer] = useState(5 * 1); // Countdown timer from 5 minutes
  const [voted, setVoted] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [connectedAddress, setConnectedAddress] = useState("");
  const [fundAmount, setFundAmount] = useState();
  console.log(props);
  useEffect(() => {
    const getConnectedAddress = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        setConnectedAddress(accounts[0]);
      }
    };

    getConnectedAddress();
  }, []);

  useEffect(() => {
    setIsOwner(props.owner_address === connectedAddress);
  }, [props.owner_address, connectedAddress]);

  const voteForYes = async () => {
    if (!window.ethereum) {
        alert("Ethereum wallet is not connected");
        return;
    }
    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(props.project_contract_address, CONTRACT_ABI, signer);

        const transaction = await contract.voteForYes();
        await transaction.wait();
        alert('Vote recorded!');
    } catch (error) {
        console.error("Error on voting:", error);
        alert("Failed to cast vote");
      }
  };

  const fund = async (amountEther) => {
    if (!window.ethereum) {
      alert("Ethereum wallet is not connected");
      return;
    }
  
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
  
      // Get the address of the signer (connected wallet)
      const address = await signer.getAddress();
  
      // Fetch and log the balance of the connected wallet
      const balance = await provider.getBalance(address);
      console.log(`Wallet balance before transaction: ${ethers.utils.formatEther(balance)} ETH`);
  
      // Convert the amount from Ether to Wei
      const amountWei = ethers.utils.parseEther(amountEther.toString());
      console.log("Amount in Wei:", amountWei);
  
      // Prepare transaction parameters
      const transactionParameters = {
        to: props.project_contract_address, // Required except during contract creation
        from: address, // must match user's active address.
        value: amountWei._hex, // hex encoded wei value
      };
  
      // Sending Ether to the contract (invokes the receive() function)
      const txResponse = await signer.sendTransaction(transactionParameters);
      await txResponse.wait();
      alert('Funds successfully sent!');
    } catch (error) {
      console.error("Error during funding:", error);
      alert("Funding failed");
    }
  };

  


  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(timer - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setVoteTime(true); // Enable voting
    }
  }, [timer]);

  const handleImageError = (e) => {
    e.target.src = defaultImage;
  };

  const fundingRaised = props.project_fundingRaised || 0;
  const fundingNeeded = props.project_fundingNeeded;
  const progress = (fundingRaised / fundingNeeded) * 100;

  const displayWebsite = props.project_website ? props.project_website.replace('https://', '').split('/')[0] : '';

  return (
    <div className="Card-div">
      <div className="CardContainer-div" style={{ marginRight: '20px' }}>
        <h1 className="project_name-h1">{props.project_name}</h1>
        <p className="project_desc-p">{props.project_desc}</p>
        <p className="project_stats-p">{props.project_stats}</p>
        <p className="project_funding_goal" style={{ marginBottom: '10px' }}>Funding goal: {props.project_fundingNeeded}</p>
        <p className="number_of_fractinos">Number of fractions {props.project_number_of_fractinos}</p>
        <a className="project_website-a" href={props.project_website}>{displayWebsite}</a>
        <PlotFractions data={props.project_fractions} className="PlotCss"/>
        <div style={{ width: '100%', backgroundColor: '#eee', borderRadius: '5px', margin: '10px 0'}}>
          <div style={{
            width: `${progress}%`,
            backgroundColor: progress >= 100 ? 'green' : '#007bff',
            height: '20px',
            borderRadius: '5px',
            transition: 'width 0.4s ease-in-out',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}>
            <span style={{
              position: 'absolute', 
              width: '100%',
              textAlign: 'center',
              color: 'black',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              {progress.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
      <div className="CardContainer-div">
        <img 
          className="project_img-img" 
          src={props.project_img} 
          alt="Project Visual" 
          onError={handleImageError}
        />
        {!isInvestor ? <div className="scamlegitdiv" > <input className="InputWithUnit" value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}></input ><p>ETH</p><Button text="Invest" onclick={() => {fund(fundAmount)}}/> </div>: 
          <div className="scamlegitdiv">
            {voted ? <p>Current votage: scam: {} legit {} </p> : <div>
            {voteTime ? 
            <div className="scamlegitdiv">
              <Button className="scamlegitbuttons" text="Is a Scam" onclick={() => setVoted(true)}/>
              Voting on fraction {} of the project.
              <Button className="scamlegitbuttons" text="Legit" onclick={() => {setVoted(true); voteForYes()}}/>
            </div>

            :
            <div className="scamlegitdivtimer">
              <p>Voting in: {Math.floor(timer / 60)}:{("0" + (timer % 60)).slice(-2)}</p>
            </div>
              
            }</div>}
          </div>
        }
      </div>
    </div>
  );
};

export default Card;
