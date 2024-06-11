"use client";

import React, { useState, useEffect } from 'react';
import { get } from 'aws-amplify/api';
import './directory.css';
import { useRouter } from 'next/navigation';


const Directory = () => {
  const [tableData, setTableData] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    
    const router = useRouter();


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
          item.Leader = item.Leader.toLocaleString();
        });
        setTableData(result);
        console.log('Items:', result);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };
    fetchItems();
  }, []);

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
      item.Timestamp.toLowerCase().includes(searchQuery.toLowerCase())
    );
    


  return (
    <div className="directory-container">
      <div className="top-bar">
        <button className="home-button" onClick={() => handleNavigate('/')}>
        Home
        </button>
        <input
          type="text"
          placeholder="Search by name, phone number, or timestamp"
          value={searchQuery}
          onChange={handleSearchChange}
          className="search-input"
        />
      </div>
      <table className="directory-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone Number</th>
            <th>School</th>
            <th>Is Leader?</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((item, index) => (
            <tr key={index}>
              <td>{item.Name}</td>
              <td>{item.PhoneNumber}</td>
              <td>{item.School}</td>
              <td>{item.Leader}</td>
              <td>{item.Timestamp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Directory;
