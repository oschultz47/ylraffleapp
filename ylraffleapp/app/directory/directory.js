"use client";

import React, { useState, useEffect, useRef } from 'react';
import { get, put, del } from 'aws-amplify/api';
import './directory.css';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../LoadingScreen';

const Directory = () => {
  const [tableData, setTableData] = useState([]);
  const [leaderData, setLeaderData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [leader, setLeader] = useState(null);
  const [school, setSchool] = useState('ffffff');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [currentEntry, setCurrentEntry] = useState(null);
  const { auth } = useAuth();
  const router = useRouter();

  const nameRef = useRef(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const restOperation = get({
          apiName: 'ylraffle',
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
          apiName: 'ylraffle',
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

    if (leaderData.length > 0 && auth) {
      searchLeader();
    }
  }, [leaderData, auth]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleNavigate = (path) => {
    router.push(path);
  };

  const handleEditClick = (entry) => {
    setCurrentEntry(entry);
    setEditModalVisible(true);
  };

  const handleDeleteClick = (entry) => {
    setCurrentEntry(entry);
    setDeleteModalVisible(true);
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();

    const updatedEntry = {
      ...currentEntry,
      Name: nameRef.current.value
    };

    try {
      const restOperation = put({
        apiName: 'ylraffle',
        path: `/kids/${currentEntry.id}`,
        options: {
          body: updatedEntry,
        },
      });

      await restOperation.response;

      setTableData((prevData) =>
        prevData.map((item) =>
          item.id === currentEntry.id ? updatedEntry : item
        )
      );
      setEditModalVisible(false);
    } catch (error) {
      console.log('PUT call failed: ', error);
    }
  };

  const handleDeleteSubmit = async () => {
    try {
      const restOperation = del({
        apiName: 'ylraffle',
        path: `/kids/${currentEntry.id}`,
      });

      await restOperation.response;

      setTableData((prevData) =>
        prevData.filter((item) => item.id !== currentEntry.id)
      );
      setDeleteModalVisible(false);
    } catch (error) {
      console.log('DELETE call failed: ', error);
    }
  };

  const handleNameChange = (e) => {
    setCurrentEntry({ ...currentEntry, Name: e.target.value });
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
    <div>
      <div className={`directory-container ${editModalVisible || deleteModalVisible ? 'blur' : ''}`}>
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
              {leader && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, index) => (
              <tr key={index}>
                <td data-label="Name">{item.Name}</td>
                <td data-label="School">{item.School}</td>
                <td data-label="Phone Number">{item.PhoneNumber}</td>
                <td data-label="Last at Club">{item.Timestamp}</td>
                {leader && (
                  <td data-label="Actions" className="actions">
                    <button onClick={() => handleEditClick(item)}>Edit</button>
                    <button onClick={() => handleDeleteClick(item)}>Delete</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editModalVisible && (
        <div className="modal-overlay">
          <div className="modal-content">
            <span className="close" onClick={() => setEditModalVisible(false)}>&times;</span>
            <h2>Edit Entry</h2>
            <form onSubmit={handleEditSubmit}>
              <label>
                Name:
                <input type="text" name="name" ref={nameRef} value={currentEntry?.Name || ''} onChange={handleNameChange} required />
              </label>
              <button className="submit-button" type="submit">Save Changes</button>
            </form>
          </div>
        </div>
      )}
      {deleteModalVisible && (
        <div className="modal-overlay">
          <div className="modal-content">
            <span className="close" onClick={() => setDeleteModalVisible(false)}>&times;</span>
            <h2>Delete Entry</h2>
            <p>Are you sure you want to delete this entry?</p>
            <button className="submit-button" onClick={handleDeleteSubmit}>Yes</button>
            <button className="submit-button" onClick={() => setDeleteModalVisible(false)}>No</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Directory;
