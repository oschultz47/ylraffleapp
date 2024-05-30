"use client"

import React, { useState } from 'react';
import { get } from 'aws-amplify/api';

const Raffle = () => {
    const [names, setNames] = useState([]);
    const [tableData, setTableData] = React.useState([]);
    const [winner, setWinner] = useState(null);
    
    React.useEffect(() => {
        const fetchItems = async () => {
          try {
            const restOperation = get({
              apiName: 'ylraffleapi',
              path: '/raffle'
            });
            const response = await restOperation.response;
            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let result = '';
            let done = false;
    
            while (!done) {
              const { value, done: streamDone } = await reader.read();
              done = streamDone;
              result += decoder.decode(value, { stream: !done });
            }
            result = JSON.parse(result);
            for (let i = 0; i < result.length; i++) {
              result[i].Timestamp = new Date(result[i].Timestamp).toLocaleString();
            }
            setTableData(result);
            console.log('Items:', result);
          } catch (error) {
            console.error('Error fetching items:', error);
          }
        };
        fetchItems();
    }, []);
    
    React.useEffect(() => {
        setNames(tableData.map((item) => item.Name));
    }, [tableData]);

    React.useEffect(() => {
        if (names.length === 1) {
          setWinner(names[0]);
        }
      }, [names]);

    React.useEffect(() => {
        if (winner) {
            alert(`The winner is ${winner}!`);
        }
    }, [winner]);



  const eliminateHalf = () => {
    const remainingNames = [...names];
    const half = Math.floor(remainingNames.length / 2);
    for (let i = 0; i < half; i++) {
      const randomIndex = Math.floor(Math.random() * remainingNames.length);
      remainingNames.splice(randomIndex, 1);
    }
    setNames(remainingNames);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div id="names">
        {names.map((name, index) => (
          <div key={index} className="name" style={{ margin: '5px 0' }}>
            {name}
          </div>
        ))}
      </div>
      <button 
        id="eliminateButton" 
        onClick={eliminateHalf} 
        style={{ margin: '20px', padding: '10px 20px', fontSize: '16px' }}
      >
        Eliminate Half
      </button>
    </div>
  );
};

export default Raffle;
