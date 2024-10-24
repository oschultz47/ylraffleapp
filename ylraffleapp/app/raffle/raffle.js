"use client";

import React, { useState, useEffect, useRef } from 'react';
import { get } from 'aws-amplify/api';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation'; // Import the router
import LoadingScreen from '../LoadingScreen';
import WinnerModal from './winnerModal';
import './raffle.css';

const Raffle = () => {
  const [names, setNames] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [winner, setWinner] = useState(null);
  const [allNames, setAllNames] = useState([]);
  const [leader, setLeader] = useState(null);
  const [namesLoaded, setNamesLoaded] = useState(false); // Default to false
  const [school, setSchool] = useState('ffffff');
  const [selectedSchool, setSelectedSchool] = useState(''); // For filtering names
  const [isEliminationActive, setIsEliminationActive] = useState(false); // Track if elimination has started
  const { auth } = useAuth();
  const router = useRouter(); // Initialize the router
  const intervalRef = useRef(null); // Use useRef to store the interval ID


  // Check authentication status immediately
  useEffect(() => {
    if (!auth) {
      router.push('/'); // Redirect to the homepage if the user is not authenticated
      return;
    }
  }, [auth, router]);

  useEffect(() => {
    if (!auth) return; // Prevent further execution if not authenticated

    const fetchAllNames = async () => {
      try {
        const restOperation = get({
          apiName: 'ylraffle',
          path: '/allnames',
          httpMethod: 'GET',
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
        setAllNames(result);
      } catch (error) {
        console.error('Error fetching all names:', error);
      }
    };

    fetchAllNames();
  }, [auth]);

  useEffect(() => {
    if (!auth || allNames.length === 0) return; // Prevent further execution if not authenticated or no names

    const searchNames = async () => {
      if (auth.signInDetails && auth.signInDetails.loginId) {
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

    searchNames();
  }, [allNames, auth]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const restOperation = get({
          apiName: 'ylraffle',
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
  
        // Filter out entries where Joke is true or Name is empty
        let filteredResponse = result.filter(item => !item.Joke && item.Name !== '');
  
        // Filter by selected school if Admin has chosen a school
        if (school === 'Admin' && selectedSchool !== '') {
          filteredResponse = filteredResponse.filter(item => item.School === selectedSchool);
        } else if (school !== 'Admin') {
          filteredResponse = filteredResponse.filter(item => item.School === school);
        }
  
        // Format timestamps and update state
        filteredResponse.forEach((item) => {
          item.Timestamp = new Date(item.Timestamp).toLocaleString();
        });
  
        setTableData(filteredResponse);
        setNames(filteredResponse.map(item => item.Name));
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };

    // Only fetch items if the elimination is not active
    if (!isEliminationActive) {
      fetchItems();
      intervalRef.current = setInterval(fetchItems, 1000); // Poll every second
    }
  
    return () => clearInterval(intervalRef.current); // Cleanup on unmount
  }, [school, auth, selectedSchool, isEliminationActive]);
  

  useEffect(() => {
    setNames(tableData.map((item) => item.Name));
    setNamesLoaded(true);
  }, [tableData]);

  useEffect(() => {
    if (names.filter(name => name && name.trim() !== '').length === 1) {
      setWinner(names.filter(name => name && name.trim() !== '')[0]);
    }
  }, [names]);

  const handleCloseModal = () => {
    setWinner(null);
    resetRaffle();
  };

  const resetRaffle = () => {
    setIsEliminationActive(false); // Reset the elimination state
    if (!auth || !school) return; // Prevent further execution if not authenticated or no school

    const fetchItems = async () => {
      try {
        const restOperation = get({
          apiName: 'ylraffle',
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

        // Filter out entries where Joke is true
        let filteredResponse = result.filter(item => !item.Joke);

        if (school === 'Admin' && selectedSchool !== '') {
          filteredResponse = filteredResponse.filter(item => item.School === selectedSchool);
        } else if (school !== 'Admin') {
          filteredResponse = filteredResponse.filter(item => item.School === school);
        }

        filteredResponse.forEach((item) => {
          item.Timestamp = new Date(item.Timestamp).toLocaleString();
        });
        setTableData(filteredResponse);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };

    fetchItems();

    intervalRef.current = setInterval(fetchItems, 1000);
  };

  const eliminateHalf = () => {
    clearInterval(intervalRef.current); // Stop polling when elimination starts
    setIsEliminationActive(true); // Set elimination to active
    const remainingNames = [...names];
    const half = Math.floor(remainingNames.length / 2);
    for (let i = 0; i < half; i++) {
      const randomIndex = Math.floor(Math.random() * remainingNames.length);
      remainingNames.splice(randomIndex, 1);
    }
    setNames(remainingNames);
  };

  const calculateFontSize = (nameCount) => {
    if (nameCount <= 5){
      return '4vw';
    } else if (nameCount <= 24) {
      return '3vw';
    } else if (nameCount <=48){
      return '2.5vw';
    }else if (nameCount <=64){
      return '2vw';
    }
    else{
      return '1.25vw';
    }
  };

  const handleSchoolChange = (event) => {
    setSelectedSchool(event.target.value);
  };

  if (!auth || namesLoaded === null || leader === null) {
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
        {names.filter(name => name && name.trim() !== '').map((name, index) => (
          <div
            key={index}
            className="name"
            style={{ fontSize: calculateFontSize(names.length) }}
          >
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
      {school === 'Admin' && (
        <div className="raffle-school-filter">
          <label htmlFor="school-select">Filter by School: </label>
          <select
            id="school-select"
            value={selectedSchool}
            onChange={handleSchoolChange}
          >
            <option value="">All Schools</option>
            {Array.from(new Set(allNames.map(name => name.School)))
            .filter(schoolName => schoolName !== 'Admin') // Exclude 'Admin'
            .map(schoolName => (
              <option key={schoolName} value={schoolName}>
                {schoolName}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default Raffle;
