import React, { useState } from "react";
import Header from "./Header";
import ScrollSection from "./ScrollSection";
import CreateProjectCard from "./CreateProjectCard";
import HomeCard from "./HomeCard";
import ThreeScene from "./ThreeScene";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import "../scss/App.scss";


const App = () => {
  const [activeView, setActiveView] = useState("home"); // Possible values: 'home', 'projects', 'addProject'

  const handleShowHome = () => setActiveView("home");
  const handleShowProjects = () => setActiveView("projects");
  const handleAddProjectClick = () => setActiveView("addProject");

  return (
    <>
      <Header
        onAddProject={handleAddProjectClick}
        onShowHome={handleShowHome}
        onShowProjects={handleShowProjects}
      />
      <div className="Canvas-div">
        <ThreeScene className="Canvas-div"></ThreeScene>
      </div>

      <SwitchTransition mode="out-in">
        <CSSTransition
          key={activeView}
          timeout={300}
          classNames="Modal"
          unmountOnExit
        >
          <div className="view-container">
            {activeView === "home" && <HomeCard onShowProjects={handleShowProjects}/>}
            {activeView === "projects" && <ScrollSection />}
            {activeView === "addProject" && <CreateProjectCard />}
          </div>
        </CSSTransition>
      </SwitchTransition>
    </>
  );
};

export default App;
