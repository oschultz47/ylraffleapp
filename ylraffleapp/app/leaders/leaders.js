import React, { useState, useEffect, useRef } from 'react';
import InputMask from 'react-input-mask';
import { get, post } from 'aws-amplify/api';
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
  const [newLeader, setNewLeader] = useState({ name: '', team: '', phone: '', email: '' });
  const { auth } = useAuth();
  const router = useRouter();

  const nameRef = useRef(null);
  const teamRef = useRef(null);
  const phoneRef = useRef(null);
  const emailRef = useRef(null);

  const fetchItems = async () => {
    try {
      const restOperation = get({
        apiName: 'ylraffleapi',
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
    fetchItems();
  }, []);

  useEffect(() => {
    if (auth && auth.signInDetails && auth.signInDetails.loginId && tableData.length > 0) {
      const user = tableData.find((element) => element.Email === auth.signInDetails.loginId);
      const isLeader = !!user;
      setLeader(isLeader);

      if (user && user.School === 'Admin') {
        setIsAdmin(true);
      }
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

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewLeader({ ...newLeader, [name]: value });
  };

  const formatPhoneNumber = (phoneNumber) => {
    const digits = phoneNumber.replace(/\D/g, '');
    return `+1${digits}`;
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
        apiName: 'ylraffleapi',
        path: '/leaders',
        options: {
          body: formattedLeader,
        },
      });

      const { body } = await restOperation.response;
      const response = await body.json();

      fetchItems();
      toggleModal();
    } catch (error) {
      console.log('POST call failed: ', error);
    }
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
    <div>
      <div className={`leaders-container ${showModal ? 'blur' : ''}`}>
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
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <span className="close" onClick={toggleModal}>&times;</span>
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
                <InputMask mask="(999) 999-9999" name="phone" ref={phoneRef} required>
                  {(inputProps) => <input {...inputProps} type="text" />}
                </InputMask>
              </label>
              <label>
                Email:
                <input type="email" name="email" ref={emailRef} required />
              </label>
              <button className="submit-button" type="submit">Add Leader</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaders;
