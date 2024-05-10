import React, { useState, useEffect } from 'react';
import Gun from 'gun';
import Card from './Card';
import "../scss/ScrollSection.scss";
import img1 from '../../img1.png';
import ThreeScene from './ThreeScene';

const gun = Gun(['http://localhost:8765/gun']); 


const ScrollSection = (props) => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    if (!items.length){
      loadInitialItems();
    }
    
  }, []);

  const loadInitialItems = () => {
    setIsLoading(true);
    gun.get('projects').map().once((project, id) => {
      if (project) {
        setItems(prevItems => [...prevItems, { ...project, id }]);
      }
      console.log("Items loaded:", items);
    });
    

    setIsLoading(false);
  };

  return (
    <section className="ScrollSection-section">
      
      <div 
        className="ScrollSectionContainer-div" 

      >
        {items.map(item => (
          
          <Card key={item.id} project_name={item.projectName} project_desc={item.description} project_stats='asd' project_img={img1}/>

        ))}
        {isLoading && <p>Loading more items...</p>}
      </div>
    </section>
  );
};

export default ScrollSection;
