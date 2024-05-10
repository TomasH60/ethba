import React from "react";
import Button from "./Button";
import "../scss/HomeCard.scss";

const HomeCard = ({onShowProjects}) => {
  return (
    <div className="HomeCard-div">
      <h1>🚀Boost your confidence in investing!🚀</h1>
      <p>
        EtheralFund is a decentralized crowdfunding platform that allows you to
        fund projects with Ether.
        <br /><br />
        Deploy a smart contract, where users can donate ethereum to fund your
        project. When the funding goal is reached, the funds will be sent out to
        your wallet in fractions (which you can map to your project roadmap
        e.g.).
        <br /><br />
        During the pay out period, the investors can vote on how your project is
        developing. If the majority of investors (51%) decide, that your project
        is not going according to your roadmap, they can claim back their locked
        funds.
      </p>
      <Button text="Browse projects" style={{marginTop: '3%'}} onclick={onShowProjects} />
    </div>
  );
};

export default HomeCard;
