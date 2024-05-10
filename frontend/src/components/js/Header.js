import React from "react";
import "./../scss/Header.scss";
import Button from "./Button";

const Header = () => {
  return (
    <div className="Header-div">
      <div className="HeaderContainer-div">
        <h1>EtheralFund</h1>
        <div className="HeaderButtonContainer-div">
          <Button text="Home" />
          <Button text="Add project" />
        </div>
      </div>
    </div>
  );
};

export default Header;
