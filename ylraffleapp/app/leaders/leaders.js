import React, { useState, useEffect, useRef } from 'react';
import InputMask from 'react-input-mask';
import { get, post, put, del } from 'aws-amplify/api';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../LoadingScreen';
import './leaders.css';

const Leaders = () => {
  const [tableData, setTableData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [leader, setLeader] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [newLeader, setNewLeader] = useState({ name: '', team: '', phone: '', email: '' });
  const [currentEntry, setCurrentEntry] = useState(null);
  const { auth } = useAuth();
  const router = useRouter();

  const nameRef = useRef(null);
  const teamRef = useRef(null);
  const phoneRef = useRef(null);
  const emailRef = useRef(null);

  // Fetch the leaders data from the API
  const fetchItems = async () => {
    try {
      const restOperation = get({
        apiName: 'ylraffle',
        path: '/leaders',
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

      // Format the phone number
      result.forEach((item) => {
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

  useEffect(() => {
    if (!auth) {
      router.push('/');
      return;
    }

    fetchItems();
  }, [auth, router]);

  useEffect(() => {
    if (!auth || tableData.length === 0) return;

    if (auth.signInDetails && auth.signInDetails.loginId) {
      const user = tableData.find((element) => element.Email === auth.signInDetails.loginId);
      const isLeader = !!user;
      setLeader(isLeader);

      if (user && user.School === 'Admin') {
        setIsAdmin(true);
      }
    } else {
      setLeader(false);
    }
  }, [tableData, auth]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleNavigate = (path) => {
    router.push(path);
  };

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewLeader({ ...newLeader, [name]: value });
  };

  const formatPhoneNumber = (phoneNumber) => {
    const digits = phoneNumber.replace(/\D/g, '');
    return `+${digits}`;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formattedLeader = {
      name: nameRef.current.value,
      team: teamRef.current.value,
      phone: formatPhoneNumber(phoneRef.current.value),
      email: emailRef.current.value,
    };

    try {
      const restOperation = post({
        apiName: 'ylraffle',
        path: '/leaders',
        options: {
          body: formattedLeader,
        },
      });

      await restOperation.response;

      fetchItems(); // Fetch the updated list after adding a new leader
      toggleModal();
    } catch (error) {
      console.log('POST call failed: ', error);
    }
  };

  const handleEditClick = (entry) => {
    setCurrentEntry(entry);
    setEditModalVisible(true);
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();

    const formattedLeader = {
      name: currentEntry.Name,
      team: currentEntry.School,
      phone: formatPhoneNumber(currentEntry.PhoneNumber),
      email: currentEntry.Email,
    };

    try {
      const restOperation = put({
        apiName: 'ylraffleapi',
        path: `/leaders/${currentEntry.id}`,
        options: {
          body: formattedLeader,
        },
      });

      await restOperation.response;

      fetchItems(); // Fetch the updated list after editing a leader
      setEditModalVisible(false);
    } catch (error) {
      console.log('PUT call failed: ', error);
    }
  };

  const handleDeleteClick = (entry) => {
    setCurrentEntry(entry);
    setDeleteModalVisible(true);
  };

  const handleDeleteSubmit = async () => {
    try {
      const phone = formatPhoneNumber(currentEntry.PhoneNumber);
      const leaderpath = `/leaders/${phone}`;
      const restOperation = del({
        apiName: 'ylraffle',
        path: leaderpath,
      });

      await restOperation.response;

      fetchItems(); // Fetch the updated list after deleting a leader
      setDeleteModalVisible(false);
    } catch (error) {
      console.log('DELETE call failed: ', error);
    }
  };

  const handleNameChange = (e) => {
    setCurrentEntry({ ...currentEntry, Name: e.target.value });
  };

  const handlePhoneChange = (e) => {
    setCurrentEntry({ ...currentEntry, PhoneNumber: e.target.value });
  };

  const handleEmailChange = (e) => {
    setCurrentEntry({ ...currentEntry, Email: e.target.value });
  };

  const handleSchoolChange = (e) => {
    setCurrentEntry({ ...currentEntry, School: e.target.value });
  };

  const filteredData = tableData.filter(
    (item) =>
      item.Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.PhoneNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.School.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.Email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!auth || leader === null) {
    return <LoadingScreen />;
  }

  if (!leader) {
    return (
      <div className="access-denied">
        <p>Your account does not have access to this feature.</p>
      </div>
    );
  }

  return (
    <div>
      <div
        className={`leaders-container ${
          showModal || editModalVisible || deleteModalVisible ? 'blur' : ''
        }`}
      >
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
          {isAdmin && (
            <button className="add-leader-button" onClick={toggleModal}>
              Add Leader
            </button>
          )}
        </div>
        <table className="leaders-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Team</th>
              <th>Phone Number</th>
              <th>Email</th>
              {isAdmin && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, index) => (
              <tr key={index}>
                <td data-label="Name">{item.Name}</td>
                <td data-label="Team">{item.School}</td>
                <td data-label="Phone Number">{item.PhoneNumber}</td>
                <td data-label="Email">{item.Email}</td>
                {isAdmin && (
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
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <span className="close" onClick={toggleModal}>
              &times;
            </span>
            <h2>Add New Leader</h2>
            <form onSubmit={handleSubmit}>
              <label>
                Name:
                <input type="text" name="name" ref={nameRef} required />
              </label>
              <label>
                Team:
                <select name="team" ref={teamRef} required>
                  <option value="">Select Team</option>
                  <option value="Consol">Consol</option>
                  <option value="CSHS">CSHS</option>
                  <option value="Bryan">Bryan</option>
                  <option value="Rudder">Rudder</option>
                  <option value="Navasota">Navasota</option>
                  <option value="Caldwell">Caldwell</option>
                  <option value="Brenham">Brenham</option>
                  <option value="Hearne">Hearne</option>
                  <option value="YoungLives">YoungLives</option>
                  <option value="Capernaum">Capernaum</option>
                  <option value="College">College</option>
                  <option value="Admin">Admin</option>
                </select>
              </label>
              <label>
                Phone Number:
                <InputMask mask="+1 (999) 999-9999" name="phone" ref={phoneRef} required>
                  {(inputProps) => <input {...inputProps} type="text" />}
                </InputMask>
              </label>
              <label>
                Email:
                <input type="email" name="email" ref={emailRef} required />
              </label>
              <button className="submit-button" type="submit">
                Add Leader
              </button>
            </form>
          </div>
        </div>
      )}
      {editModalVisible && (
        <div className="modal-overlay">
          <div className="modal-content">
            <span className="close" onClick={() => setEditModalVisible(false)}>
              &times;
            </span>
            <h2>Edit Leader</h2>
            <form onSubmit={handleEditSubmit}>
              <label>
                Name:
                <input
                  type="text"
                  name="name"
                  value={currentEntry?.Name || ''}
                  onChange={handleNameChange}
                  required
                />
              </label>
              <label>
                Team:
                <select
                  name="team"
                  value={currentEntry?.School || ''}
                  onChange={handleSchoolChange}
                  required
                >
                  <option value="Consol">Consol</option>
                  <option value="CSHS">CSHS</option>
                  <option value="Bryan">Bryan</option>
                  <option value="Rudder">Rudder</option>
                  <option value="Navasota">Navasota</option>
                  <option value="Caldwell">Caldwell</option>
                  <option value="Brenham">Brenham</option>
                  <option value="Hearne">Hearne</option>
                  <option value="YoungLives">YoungLives</option>
                  <option value="Capernaum">Capernaum</option>
                  <option value="College">College</option>
                  <option value="Admin">Admin</option>
                </select>
              </label>
              <label>
                Phone Number:
                <InputMask
                  mask="+1 (999) 999-9999"
                  name="phone"
                  value={currentEntry?.PhoneNumber || ''}
                  onChange={handlePhoneChange}
                  required
                >
                  {(inputProps) => <input {...inputProps} type="text" />}
                </InputMask>
              </label>
              <label>
                Email:
                <input
                  type="email"
                  name="email"
                  value={currentEntry?.Email || ''}
                  onChange={handleEmailChange}
                  required
                />
              </label>
              <button className="submit-button" type="submit">
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
      {deleteModalVisible && (
        <div className="modal-overlay">
          <div className="modal-content">
            <span
              className="close"
              onClick={() => setDeleteModalVisible(false)}
            >
              &times;
            </span>
            <h2>Delete Leader</h2>
            <p>Are you sure you want to delete this entry?</p>
            <button className="submit-button" onClick={handleDeleteSubmit}>
              Yes
            </button>
            <button
              className="submit-button"
              onClick={() => setDeleteModalVisible(false)}
            >
              No
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaders;
