"use client";

import React, { useState, useEffect } from 'react';
import { get } from 'aws-amplify/api';
import './leaders.css';
import { useRouter } from 'next/navigation';


const Leaders = () => {
  const [tableData, setTableData] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    
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
          console.log(result);
        
        result.forEach((item) => {
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
      item.School.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.Email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    


  return (
    <div className="leaders-container">
      <div className="top-bar">
        <button className="home-button" onClick={() => handleNavigate('/')}>
        Home
        </button>
        <input
          type="text"
          placeholder="Search by name, phone number, school, timestamp, or email"
          value={searchQuery}
          onChange={handleSearchChange}
          className="search-input"
        />
      </div>
      <table className="leaders-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>School</th>          
            <th>Phone Number</th>
            <th>Email</th>  
          </tr>
        </thead>
        <tbody>
          {filteredData.map((item, index) => (
            <tr key={index}>
            <td>{item.Name}</td>
            <td>{item.School}</td>
            <td>{item.PhoneNumber}</td>
            <td>{item.Email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Leaders;