import React, { useState, useEffect } from "react";
import "./../scss/Header.scss";
import Button from "./Button";

const Header = ({ onAddProject }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectedAddress, setConnectedAddress] = useState("");

  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts && accounts.length > 0) {
        const address = accounts[0];
        setIsConnected(true);
        setConnectedAddress(address);
      } else {
        console.log("MetaMask not installed");
      }
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length > 0) {
        const address = accounts[0];
        setIsConnected(true);
        setConnectedAddress(address);
      } else {
        console.log("MetaMask not installed");
      }
    }
  };

  return (
    <div className="Header-div">
      <div className="HeaderContainer-div">
        <h1>EtheralFund</h1>
        <div className="HeaderButtonContainer-div">
          <Button text="Home" />
          <Button text="Add project" onclick={onAddProject} />
          {isConnected ? (
            <Button text={`Wallet connected: ${connectedAddress.slice(0, 5)}...`} />
          ) : (
            <Button text="Connect wallet" onclick={connectWallet} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
