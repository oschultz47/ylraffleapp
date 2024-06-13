'use client';

import React, { useState, useEffect } from 'react';
import { get } from 'aws-amplify/api';
import './leaders.css';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../LoadingScreen';

const Leaders = () => {
  const [tableData, setTableData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [leader, setLeader] = useState(null); // Initially null to indicate status is not yet determined
  const { auth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchItems = async () => {
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
    if (auth && auth.signInDetails && auth.signInDetails.loginId && tableData.length > 0) {
      const isLeader = tableData.some(element => element.Email === auth.signInDetails.loginId);
      setLeader(isLeader);
    } else if (tableData.length > 0) {
      setLeader(false);
    }
  }, [tableData, auth]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleNavigate = (path) => {
    router.push(path);
  };

  const filteredData = tableData.filter(
    (item) =>
      item.Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.PhoneNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.School.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.Email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (leader === null) {
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
    <div className="leaders-container">
      <div className="top-bar">
        <button className="home-button" onClick={() => handleNavigate('/')}>
          Home
        </button>
        <input
          type="text"
          placeholder="Search by name, team, phone number or email"
          value={searchQuery}
          onChange={handleSearchChange}
          className="search-input"
        />
      </div>
      <table className="leaders-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Team</th>
            <th>Phone Number</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((item, index) => (
            <tr key={index}>
              <td data-label="Name">{item.Name}</td>
              <td data-label="Team">{item.School}</td>
              <td data-label="Phone Number">{item.PhoneNumber}</td>
              <td data-label="Email">{item.Email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Leaders;
