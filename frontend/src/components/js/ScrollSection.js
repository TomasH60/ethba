import React, { useState, useEffect } from 'react';
import Card from './Card'; // Ensure you import your Card component correctly
import "../scss/ScrollSection.scss";

const ScrollSection = (props) => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadMoreItems(); // Load initial items
  }, []);

  const loadMoreItems = () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    // Simulate fetching data
    setTimeout(() => {
      const newItems = Array.from({ length: 20 }, (_, index) => ({
        id: items.length + index + 1,
        title: `Title ${items.length + index + 1}`,
        description: `Description for item ${items.length + index + 1}`
        // Add other properties as needed
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
      <div 
        className="ScrollSectionContainer-div" 
        onScroll={handleScroll} 
      >
        {items.map(item => (
          <Card key={item.id} title={item.title} description={item.description} />
          // Pass other properties to Card as needed
        ))}
        {isLoading && <p>Loading more items...</p>}
      </div>
    </section>
  );
};

export default ScrollSection;
