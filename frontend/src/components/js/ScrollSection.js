import React, { useState, useEffect } from 'react';
import { db } from '../../firebase.config.js'; // Ensure this points to your Firebase configuration file
import { collection, query, onSnapshot } from 'firebase/firestore';
import Card from './Card';
import "../scss/ScrollSection.scss";
import ThreeScene from './ThreeScene';

const ScrollSection = (props) => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Initialize as true for initial load

  useEffect(() => {
    const q = query(collection(db, "projects"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const projects = [];
      querySnapshot.forEach((doc) => {
        projects.push({ ...doc.data(), id: doc.id });
      });
      setItems(projects);
      setIsLoading(false);
      console.log("Items loaded:", projects);
    }, (error) => {
      console.error("Error loading projects:", error);
      setIsLoading(false);
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  return (
    <section className="ScrollSection-section">
      <div className="ScrollSectionContainer-div">
        {items.map(item => (
          console.log(item),
          <Card
            key={item.id}
            project_name={item.projectName}
            project_desc={item.description}
            project_stats='asd'
            project_img={item.imgLink}
            project_number_of_fractinos={item.fractionNums}
            project_fractions={item.totalPercentage}
            project_website={item.webLink}
            project_fundingNeeded={item.fundingGoal}
            project_owner_address={item.ownerAddress}
            project_contract_address={item.contractAddress}
            
          />
        ))}
        {isLoading && <p>Loading more items...</p>}
      </div>
    </section>
  );
};

export default ScrollSection;
