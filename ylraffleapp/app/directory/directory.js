"use client";

import React, { useState, useEffect } from 'react';
import { get } from 'aws-amplify/api';
import './directory.css';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../LoadingScreen';

const Directory = () => {
  const [tableData, setTableData] = useState([]);
  const [leaderData, setLeaderData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [leader, setLeader] = useState(false);
  const [school, setSchool] = useState('ffffff');
  const [found, setFound] = useState(false);
  const { auth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const restOperation = get({
          apiName: 'ylraffleapi',
          path: '/kids',
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

        result.forEach((item) => {
          item.Timestamp = new Date(item.Timestamp).toLocaleString();
          item.Leader = item.Leader.toLocaleString();
          const match = item.PhoneNumber.match(/^\+1(\d{3})(\d{3})(\d{4})$/);
          if (match) {
            item.PhoneNumber = `+1 (${match[1]}) ${match[2]}-${match[3]}`;
          }
        });
        setTableData(result);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };
    fetchItems();
  }, []);

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const restOperation = get({
          apiName: 'ylraffleapi',
          path: '/leaders',
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

        result.forEach((item) => {
          item.Leader = item.Leader.toLocaleString();
        });
        setLeaderData(result);
      } catch (error) {
        console.error('Error fetching leaders:', error);
      }
    };
    fetchLeaders();
  }, []);

  useEffect(() => {
    const searchLeader = async () => {
      if (auth && auth.signInDetails && auth.signInDetails.loginId) {
        const leader = leaderData.find(element => element.Email === auth.signInDetails.loginId);
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

    const foundLeader = () => {
      setFound(true);
    };

    const executeSearch = async () => {
      await searchLeader();
      foundLeader();
    };

    executeSearch();
  }, [leaderData, auth]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleNavigate = (path) => {
    router.push(path);
  };

  const filteredData = tableData.filter((item) => {
    const matchesSearchQuery =
      item.Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.PhoneNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.Timestamp.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.School.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSchool = school === 'Admin' || item.School === school;

    return matchesSearchQuery && matchesSchool;
  });

  if (!found) {
    return <LoadingScreen />;
  }

  if (!leader) {
    return (
      <div className='access-denied'>
        <p>Your account does not have access to this feature.</p>
      </div>
    );
  }

  return (
    <div className="directory-container">
      <div className="top-bar">
        <button className="home-button" onClick={() => handleNavigate('/')}>
          Home
        </button>
        <input
          type="text"
          placeholder="Search by name, school, phone number, or last time at club"
          value={searchQuery}
          onChange={handleSearchChange}
          className="search-input"
        />
      </div>
      <table className="directory-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>School</th>
            <th>Phone Number</th>
            <th>Last at Club</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((item, index) => (
            <tr key={index}>
              <td data-label="Name">{item.Name}</td>
              <td data-label="School">{item.School}</td>
              <td data-label="Phone Number">{item.PhoneNumber}</td>
              <td data-label="Last at Club">{item.Timestamp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Directory;
