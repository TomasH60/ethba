import React from "react";
import "../scss/Card.scss";
import Button from "./Button";

const Card = (props) => {
  return (
    <div className="Card-div">
      <div className="CardContainer-div">
        <h1 className="project_name-h1">{props.project_name}</h1>
        <p className="project_desc-p">{props.project_desc}</p>
        <p className="project_stats-p">{props.project_stats}</p>
        <a className="poject_website-a" href="https://www.google.com">https://www.google.com</a>
      </div>
      <div className="CardContainer-div">
        <img className="project_img-img" src={props.project_img} alt="err" />
        <Button text="Fund" />
      </div>
    </div>
  );
};

export default Card;
