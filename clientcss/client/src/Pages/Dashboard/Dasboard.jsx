import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { baseurl } from '../../Global/Baseurl';
import RoomCalender from './RoomCalender';
import Possiblecheckins from '../../Components/Possiblecheckins';

const Dasboard = () => {
  const selectedbranchid = localStorage.getItem('selectedBranchId')
  const [complementaries, setComplementaries] = useState([]);
  const [newComplementary, setNewComplementary] = useState("");
  const user = JSON.parse(localStorage.getItem('userData'));

  // Fetch complementaries from API
  useEffect(() => {
    const fetchComplementaries = async () => {
      try {
        const response = await axios.get(`${baseurl}/api/auth/complementry`, {
          headers: {
            'x-branch-id': selectedbranchid, // Send the selectedBranchId as a header
          },
        });
        setComplementaries(response.data);
      } catch (error) {
        console.error("Error fetching complementaries:", error);
      }
    };
    fetchComplementaries();
  }, []);

  // Add complementary item
  const handleAddComplementary = async () => {
    if (!newComplementary.trim()) return;
    try {
      const response = await axios.post(`${baseurl}/api/auth/add/complementry`,
         { service_name: newComplementary },
         {
          headers: {
            'x-branch-id': selectedbranchid, // Send the selectedBranchId as a header
          }
        }
        );
      setComplementaries([...complementaries, response.data]);
      setNewComplementary("");
    } catch (error) {
      console.error("Error adding complementary:", error);
    }
  };

  // Delete complementary item
  const handleDeleteComplementary = async (id) => {
    try {
      await axios.delete(`${baseurl}/api/auth/delete/complementry/${id}`,{
        headers: {
          'x-branch-id': selectedbranchid, // Send the selectedBranchId as a header
        }
      });
      setComplementaries(complementaries.filter(item => item.id !== id));
    } catch (error) {
      console.error("Error deleting complementary:", error);
    }
  };

  return (
    <div className="main-container-wrapper">
      <div className="main-container-inner">
        <div className='main-dashboard-content'> 
        <div className='complementry-dashboard-wrapper'>
        <h1>Complementaries</h1>
        <div className="complementaries-list">
          {complementaries.map(item => (
            <div key={item.id} className="complementary-item">
              <span>{item.service_name}</span>
              {user?.role =='admin'?  <button className="delete-button" onClick={() => handleDeleteComplementary(item.id)}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>
              </button>: ''}
             
            </div>
          ))}
        </div>
        {user?.role == 'admin' ?  <div className="add-complementary">
          <input
            type="text"
            value={newComplementary}
            onChange={(e) => setNewComplementary(e.target.value)}
            placeholder="Add new complementary"
            className='compInput'
          />
         
         
          <button onClick={handleAddComplementary} className="compBtn">Add</button>
        </div>: ''}
        </div>
        {/* <Possiblecheckins/> */}
        <div className='main-nepali-calender'>
          <RoomCalender/>
        </div>
        </div>
        
        
       
       
      </div>
    </div>
  );
};

export default Dasboard;
