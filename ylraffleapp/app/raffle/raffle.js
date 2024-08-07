"use client";

import React, { useState, useEffect } from 'react';
import { get } from 'aws-amplify/api';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../LoadingScreen';
import WinnerModal from './winnerModal';
import './raffle.css';

const Raffle = () => {
  const [names, setNames] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [winner, setWinner] = useState(null);
  const [allNames, setAllNames] = useState([]);
  const [leader, setLeader] = useState(null);
  const [namesLoaded, setNamesLoaded] = useState(null);
  const [school, setSchool] = useState('ffffff');
  const { auth } = useAuth();

  useEffect(() => {
    const fetchAllNames = async () => {
      try {
        const restOperation = get({
          apiName: 'ylraffleapi',
          path: '/allnames',
          httpMethod: 'GET'
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
        console.log(result);
        setAllNames(result);
      } catch (error) {
        console.error('Error fetching all names:', error);
      }
    };
    fetchAllNames();
  }, []);

  useEffect(() => {
    const searchNames = async () => {
      if (auth && auth.signInDetails && auth.signInDetails.loginId) {
        const leader = allNames.find(element => element.Email === auth.signInDetails.loginId);
        if (leader) {
          setLeader(true);
          setSchool(leader.School);
        } else {
          setLeader(false);
        }
      } else {
        setLeader(false);
      }
    };

    if (allNames.length > 0 && auth) {
      searchNames();
    }
  }, [allNames, auth]);

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
        console.log(result);

        let filteredResponse = result;
        if (school !== 'Admin') {
          filteredResponse = result.filter(item => item.School === school);
        }

        filteredResponse.forEach((item) => {
          item.Timestamp = new Date(item.Timestamp).toLocaleString();
        });
        setTableData(filteredResponse);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };

    if (school) {
      fetchItems();
    }
  }, [school]);

  useEffect(() => {
    setNames(tableData.map((item) => item.Name));
    setNamesLoaded(true);
  }, [tableData]);

  useEffect(() => {
    if (names.length === 1) {
      setWinner(names[0]);
    }
  }, [names]);

  const handleCloseModal = () => {
    setWinner(null);
    resetRaffle();
  };

  const resetRaffle = () => {
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

        let filteredResponse = result;
        if (school !== 'Admin') {
          filteredResponse = result.filter(item => item.School === school);
        }

        filteredResponse.forEach((item) => {
          item.Timestamp = new Date(item.Timestamp).toLocaleString();
        });
        setTableData(filteredResponse);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    }
      fetchItems();
  };

  const calculateFontSize = (length) => {
    return Math.max(10, 50 - length); // Ensure a minimum font size of 10px
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

  if (namesLoaded === null || leader === null) {
    return <LoadingScreen />;
  }

  if (namesLoaded && !leader) {
    return (
      <div className='access-denied'>
        <p>Your account does not have access to this feature.</p>
      </div>
    );
  }

  return (
    <div className="raffle-container">
      {winner && <WinnerModal winner={winner} onClose={handleCloseModal} />}
      <div id="names" className="names-grid">
        {names.map((name, index) => (
          <div key={index} className="name" style={{ fontSize: `${calculateFontSize(names.length)}px` }}>
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
