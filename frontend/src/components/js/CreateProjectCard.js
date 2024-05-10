import React, { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import Gun from 'gun';
import "../scss/CreateProjectCard.scss";
import PlotFractions from "./PlotFractions";

const gun = Gun(['http://localhost:8765/gun']); // Add your Gun peers here

const CreateProjectCard = () => {
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [imgLink, setImgLink] = useState("");
  const [fundingGoal, setFundingGoal] = useState("");
  const [fractionNums, setFractionNums] = useState();
  const [fractions, setFractions] = useState([]);

  const storeData = async (e) => {
    e.preventDefault();
    const projectData = { projectName, description, imgLink, fundingGoal };
    const projectRef = gun.get('projects').set(projectData);
    console.log("Data stored with Gun ref:", projectRef);
  };

  const handleFractionChange = (index, value) => {
    const newFractions = [...fractions];
    newFractions[index] = Number(value);
    setFractions(newFractions);
  };

  const FractionValueDisplay = () => {
    const totalPercentage = fractions.reduce((acc, curr) => acc + curr, 0);
    return fractions.map((fraction, index) => (
        <div key={index} className="FractionValue">
          {((fraction) / 100 * fundingGoal).toFixed(2)} ETH 
        
        </div>
    ));
  };
  
  const calculatePercentageData = () => {
    const total = fractions.reduce((acc, val) => acc + val, 0);
    let cumulativeTotal = 0;
  
    const data = [{ fractionNumber: 0, percentage: 0 }];  // Start with 0%
  
    fractions.forEach((fraction, index) => {
      cumulativeTotal += fraction;
      data.push({
        fractionNumber: index + 1,
        percentage: (cumulativeTotal / total) * 100
      });
    });
  
    return data;
  };

  
  const plotData = calculatePercentageData();  
      

  const renderFractionBoxes = () => {
    return (
      <>
        <div className="FractionBox">
          {Array.from({ length: parseInt(fractionNums, 10) }, (_, index) => (
            <div key={index} className="InputWithUnit">
              <input
                className="FractionInput"
                type="number"
                value={fractions[index] || ''}
                onChange={(e) => handleFractionChange(index, e.target.value)}
                placeholder={`Fraction ${index + 1}`}
              />
              <span className="Unit">%</span>
            </div>
          ))}
        </div>
      </>
    );
  };



  const totalPercentage = fractions.reduce((acc, curr) => acc + curr, 0);

  const isTotalValid = totalPercentage <= 100;

  const renderValidationMessage = () => {
    if (!isTotalValid) {
      return <p style={{ color: 'red' }}>The total percentage cannot exceed 100%.</p>;
    }
    return null;
  };

  return (
    <div className="CreateProjectCard-div">
      <div className="Wrapper-div">
        <div className="Form-div">
          <h1>Create a new project</h1>
          <form className="Form-form" onSubmit={storeData}>
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
              <label>Funding Goal:</label>
              <div className="InputWithUnit">
                <input
                  type="number"
                  value={fundingGoal}
                  onChange={(e) => setFundingGoal(e.target.value)}
                  placeholder="Enter funding goal"
                />
                <span className="Unit">ETH</span>
              </div>
            </div>
            <div className="FormField">
              <label>Number of fractions:</label>
              <input
                type="number"
                value={fractionNums}
                onChange={(e) => {
                  const num = Math.min(Number(e.target.value), 10); // Limit fractions to a maximum of 10
                  setFractionNums(num);
                  setFractions(new Array(num).fill(0)); // Reset fractions array when number changes
                }}
                max="10"
                min="0"
              />
            </div>
            <div className="FractionsContainer">
              
              {fractionNums > 0 && renderFractionBoxes()}
              
              <div className="FractionValueContainer">
              {fractionNums > 0 && fundingGoal > 0 &&<FractionValueDisplay />}</div>
            </div>

            {fractionNums > 0 && renderValidationMessage()}
            
            <div className="PlotBox"> 
              <PlotFractions data={plotData} className/>
            </div>
            <button type="submit" disabled={!isTotalValid}>Create Project</button>
          </form>

        </div>
        <div className="Code-div">
          <SyntaxHighlighter language="solidity" style={materialDark}>
            {/* Solidity code here */}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectCard;
