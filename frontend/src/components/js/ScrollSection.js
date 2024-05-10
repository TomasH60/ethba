import React, { useState, useEffect } from 'react';
import ThreeScene from './ThreeScene';
import Card from './Card';
import "../scss/ScrollSection.scss";
import img1 from '../../img1.png'
import { use } from 'chai';
import { create } from 'ipfs-http-client';

const ScrollSection = (props) => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [scrolling, setScrolling] = useState(0);
  useEffect(() => {
    loadMoreItems();
  }, []);


  const ipfs = create({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });

  const storeData = async (data) => {
    try {
      const { path } = await ipfs.add(data);
      console.log("Stored on IPFS with CID:", path);
      return path;  // This CID (Content Identifier) is used to retrieve the data later
    } catch (error) {
      console.error("Error storing data on IPFS:", error);
      return null;
    }
  };

  const retrieveData = async (cid) => {
    try {
      const chunks = [];
      for await (const chunk of ipfs.cat(cid)) {
        chunks.push(chunk);
      }
      return new TextDecoder().decode(Buffer.concat(chunks));
    } catch (error) {
      console.error("Error retrieving data from IPFS:", error);
      return null;
    }
  };

  const loadMoreItemsNew = async () => {
    if (isLoading || !hasMore) return;
  
    setIsLoading(true);
  
    try {
      // Example IPFS hash of your data
      const ipfsHash = 'Qm...'; // Replace with actual IPFS hash
      const response = await ipfs.cat(ipfsHash);
  
      const newItems = JSON.parse(response.toString()); // Assuming the data is JSON-formatted
      setItems(prevItems => [...prevItems, ...newItems]);
      setHasMore(newItems.length > 0);
    } catch (error) {
      console.error('Error fetching from IPFS:', error);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };
  
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
  
    // Determine the direction based on the difference between current scroll top and last scroll top
    const newScrolling = scrollTop > scrolling ? 1 : -1;
  
    // Load more items if the bottom is reached
    if (scrollHeight - scrollTop <= clientHeight + 10) {
      loadMoreItems();
    }
  
    // Update the last scroll top position
    setScrolling(scrollTop);
    console.log(newScrolling);  // Log the new scrolling direction
  };
  
 


  return (
    <section className="ScrollSection-section">
      <div className='Canvas-div'>

        <ThreeScene className='Canvas-div' scroll = {scrolling}>
              
        </ThreeScene>
      </div>
        
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
