import React from "react";
import Header from "./Header";
import Card from "./Card";
import ScrollSection from "./ScrollSection";

const App = () => {
  return (
    <>
      <Header />
      <ScrollSection>
        <Card />
      </ScrollSection>
    </>
  );
};

export default App;
