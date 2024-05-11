import React, { useState, useEffect } from "react";
import "../scss/Card.scss";
import Button from "./Button";
import PlotFractions from "./PlotFractions";
import { div } from "three/examples/jsm/nodes/Nodes.js";

const defaultImage = "path/to/your/default/image.png"; // Define a default image

const Card = (props) => {
  const [isInvestor, setIsInvestor] = useState(false); // Default to false
  const [voteTime, setVoteTime] = useState(false); // Default to false
  const [timer, setTimer] = useState(5 * 1); // Countdown timer from 5 minutes
  const [voted, setVoted] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [connectedAddress, setConnectedAddress] = useState("");
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
        {isInvestor ? <Button text="Invest" /> : 
          <div className="scamlegitdiv">
            {voted ? <p>Current votage: scam: {} legit {} </p> : <div>
            {voteTime ? 
            <div className="scamlegitdiv">
              <Button className="scamlegitbuttons" text="Is a Scam" onclick={() => setVoted(true)}/>
              Voting on fraction {} of the project.
              <Button className="scamlegitbuttons" text="Legit" onclick={() => setVoted(true)}/>
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
