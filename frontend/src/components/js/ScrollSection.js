import React, { useState, useEffect } from 'react';
import Gun from 'gun';
import Card from './Card';
import "../scss/ScrollSection.scss";
import img1 from '../../img1.png';
import ThreeScene from './ThreeScene';

const gun = Gun(['http://localhost:8765/gun']); // Adjust the Gun peer(s) as necessary

const ScrollSection = (props) => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadInitialItems();
  }, []);

  const loadInitialItems = () => {
    setIsLoading(true);
    gun.get('projects').map().once((project, id) => {
      if (project) {
        setItems(prevItems => [...prevItems, { ...project, id }]);
      }
    });
    setIsLoading(false);
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
  
    
    if (scrollHeight - scrollTop <= clientHeight + 10) {
      loadMoreItems();
    }
  
  };
  
 


  return (
    <section className="ScrollSection-section">
      <div className='Canvas-div'>

        <ThreeScene className='Canvas-div'>
        </ThreeScene>
      </div>
        
      <div 
        className="ScrollSectionContainer-div" 
        onScroll={handleScroll} 

      >
        {items.map(item => (
          <Card key={item.id} project_name='PROJECT_NAME' project_desc='Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ullamcorper sit amet risus nullam eget felis eget nunc. Vulputate eu scelerisque felis imperdiet proin. Velit scelerisque in dictum non. Ac turpis egestas integer eget aliquet nibh praesent tristique magna. Bibendum arcu vitae elementum curabitur vitae nunc sed velit dignissim. Scelerisque mauris pellentesque pulvinar pellentesque habitant. Varius vel pharetra vel turpis nunc eget lorem. Enim blandit volutpat maecenas volutpat blandit aliquam etiam erat velit. Est lorem ipsum dolor sit amet. Consequat id porta nibh venenatis cras sed. Ut etiam sit amet nisl purus. Turpis massa sed elementum tempus egestas sed sed risus pretium. Massa ultricies mi quis hendrerit dolor. Aliquet sagittis id consectetur purus ut faucibus. Urna et pharetra pharetra massa massa ultricies mi. Tincidunt lobortis feugiat vivamus at augue eget arcu dictum. In ante metus dictum at tempor commodo ullamcorper a lacus.' project_stats='asd' project_img={img1}/>
          // Pass other properties to Card as needed
        ))}
        {isLoading && <p>Loading more items...</p>}
      </div>
    </section>
  );
};

export default ScrollSection;
