"use client";

import React, { useState, useEffect } from 'react';
import { get } from 'aws-amplify/api';
import './raffle.css'

const Raffle = () => {
  const [names, setNames] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const restOperation = get({
          apiName: 'ylraffleapi',
          path: '/raffle',
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
        result.forEach((item) => {
          item.Timestamp = new Date(item.Timestamp).toLocaleString();
        });
        setTableData(result);
        console.log('Items:', result);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };
    fetchItems();
  }, []);

  useEffect(() => {
    setNames(tableData.map((item) => item.Name));
  }, [tableData]);

  useEffect(() => {
    if (names.length && !document.querySelector('.name').style.position) {
      scatterItems();
    }
  }, [names]);

  useEffect(() => {
    if (names.length === 1) {
      setWinner(names[0]);
    }
  }, [names]);

  useEffect(() => {
    if (winner) {
      alert(`The winner is ${winner}!`);
    }
  }, [winner]);
    
  const calculateFontSize = (length) => {
    return Math.max(10, 50 - length); // Ensure a minimum font size of 10px
  };

  const scatterItems = () => {
    const nameElements = document.querySelectorAll('.name');
    const button = document.getElementById('eliminateButton');
    const buttonRect = button.getBoundingClientRect();
    const positions = [];
      const margin = calculateFontSize(names.length) * 2;
      console.log(margin);

    const addPosition = (top, left, width, height) => {
      positions.push({ top, left, width, height });
    };

    addPosition(buttonRect.top - margin, buttonRect.left - margin, buttonRect.width + 2 * margin, buttonRect.height + 2 * margin);

    nameElements.forEach((name) => {
      let top, left;
      let overlap;
      do {
        overlap = false;
        top = Math.random() * (window.innerHeight - name.clientHeight);
        left = Math.random() * (window.innerWidth - name.clientWidth);

        for (let pos of positions) {
          if (
            left < pos.left + pos.width &&
            left + name.clientWidth > pos.left &&
            top < pos.top + pos.height &&
            top + name.clientHeight > pos.top
          ) {
            overlap = true;
            break;
          }
        }
      } while (overlap);

      addPosition(top, left, name.clientWidth, name.clientHeight);

      name.style.position = 'absolute';
      name.style.top = `${top}px`;
      name.style.left = `${left}px`;
    });
  };

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
    <div className="raffle-container">
      <div id="names">
        {names.map((name, index) => (
          <div key={index} className="name" style={{ margin: '5px 0', fontSize: `${calculateFontSize(names.length)}px` }}>
            {name}
          </div>
        ))}
      </div>
      <button
        id="eliminateButton"
        onClick={eliminateHalf}
        className="eliminate-button"
      >
        Eliminate Half
      </button>
    </div>
  );
};

export default Raffle;
