import React from "react";
import "../scss/Card.scss";
import Button from "./Button";
import PlotFractions from "./PlotFractions";

const defaultImage = "path/to/your/default/image.png"; // Define a default image

const Card = (props) => {
  // Function to handle image loading errors
  const handleImageError = (e) => {
    e.target.src = defaultImage; // Set default image if the given URL fails
  };

  console.log(props)
  return (
    <div className="Card-div">
      <div className="CardContainer-div">
        <h1 className="project_name-h1">{props.project_name}</h1>
        <p className="project_desc-p">{props.project_desc}</p>
        <p className="project_stats-p">{props.project_stats}</p>
        <p className="number_of_fractinos">Number of fractions {props.project_number_of_fractinos}</p>
        <a className="project_website-a" href={props.project_website}>{props.project_website}</a>
        <PlotFractions data={props.project_fractions} />
      </div>
      <div className="CardContainer-div">
        <img 
          className="project_img-img" 
          src={props.project_img} 
          alt="Project Visual" 
          onError={handleImageError}
        />
        <Button text="Fund" />
      </div>
    </div>
  );
};

export default Card;
