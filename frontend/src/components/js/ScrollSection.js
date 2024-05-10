import React, { useState, useEffect } from 'react';
import Card from './Card';
import "../scss/ScrollSection.scss";
import img1 from '../../img1.png'

const ScrollSection = (props) => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadMoreItems();
  }, []);

  const loadMoreItems = () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setTimeout(() => {
      const newItems = Array.from({ length: 20}, (_, index) => ({
        id: items.length + index + 1,
        title: `Title ${items.length + index + 1}`,
        description: `Description for item ${items.length + index + 1}`
      }));
      setItems(prevItems => [...prevItems, ...newItems]);
      setIsLoading(false);
      setHasMore(newItems.length > 0);
    }, 1000);
  };

  const handleScroll = (event) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;

    if (scrollHeight - scrollTop <= clientHeight + 10) {
      loadMoreItems();
    }
  };

  return (
    <section className="ScrollSection-section">
      <div className='testSprite'></div>
      <div 
        className="ScrollSectionContainer-div" 
        onScroll={handleScroll} 

      >
        {items.map(item => (
          <Card key={item.id} project_name='PROJECT_NAME' project_desc='Ensure that the padding, border, and any other styling details of both .Card-div and .CardContainer-div are tailored to your specific design requirements. Adjusting these values can help achieve the desired layout and visual impact without compromising the design integrity on different screen sizes or orientations.' project_stats='asd' project_img={img1}/>
          // Pass other properties to Card as needed
        ))}
        {isLoading && <p>Loading more items...</p>}
      </div>
    </section>
  );
};

export default ScrollSection;
