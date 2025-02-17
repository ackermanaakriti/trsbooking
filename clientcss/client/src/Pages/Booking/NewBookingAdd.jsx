import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { baseurl } from '../../Global/Baseurl';

const NewBookingAdd = () => {
  const selectedbranchid = localStorage.getItem('selectedBranchId')

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_number: '',
    address: '',
    check_in_date: '',
    check_out_date: '',
    room_details: [],
    complementaries: {},
    total_price: 0,
    additional_note: '',
  });

  const [rooms, setRooms] = useState([]);
  const [roomDetails, setRoomDetails] = useState([]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get(`${baseurl}/api/auth/getallrooms`,{
          headers: { 'x-branch-id': selectedbranchid, },
        });
        setRooms(response.data);
      } catch (error) {
        console.error('Error fetching rooms:', error);
      }
    };
    fetchRooms();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoomSelection = (roomId) => {
    if (roomDetails.some((room) => room.roomId === roomId)) {
      alert('This room is already selected.');
      return;
    }

    axios.post(`${baseurl}/api/auth/roomavailability`, {
      headers: { 'x-branch-id': selectedbranchid, },
    }, {
      
      check_in_date: formData.check_in_date,
      check_out_date: formData.check_out_date,
      roomId,
    }).then((res) => {
      if (res.data.available) {
        setRoomDetails((prev) => [
          ...prev,
          { roomId, no_of_person: '', total_price: '', room_name: res.data.room_name },
        ]);
      } else {
        alert(`Room ${res.data.room_name} is not available for the selected dates.`);
      }
    }).catch((err) => console.error(err));
  };

  const handleRemoveRoom = (roomId) => {
    setRoomDetails((prev) => prev.filter((room) => room.roomId !== roomId));
  };

  const handleRoomDetailChange = (roomId, field, value) => {
    setRoomDetails((prev) =>
      prev.map((room) => room.roomId === roomId ? { ...room, [field]: value } : room)
    );
  };

  const handleSubmit = () => {
    const finalData = { ...formData, room_details: roomDetails };
    console.log('Submitting:', finalData);
    // Submit to API
  };

  return (
    <div className="main-container-wrapper form-container">
      <div className="main-container-inner">
        kjkj
        {/* Basic Input Fields */}
        <div>
          <label>Name</label>
          <input name="name" value={formData.name} onChange={handleInputChange} />
        </div>
        <div>
          <label>Email</label>
          <input name="email" value={formData.email} onChange={handleInputChange} />
        </div>
        <div>
          <label>Phone Number</label>
          <input name="phone_number" value={formData.phone_number} onChange={handleInputChange} />
        </div>
        <div>
          <label>Address</label>
          <input name="address" value={formData.address} onChange={handleInputChange} />
        </div>
        <div>
          <label>Check-in Date</label>
          <input name="check_in_date" type="date" value={formData.check_in_date} onChange={handleInputChange} />
        </div>
        <div>
          <label>Check-out Date</label>
          <input name="check_out_date" type="date" value={formData.check_out_date} onChange={handleInputChange} />
        </div>

        {/* Room Selection */}
        <div className="input-wrapper"> 
          <label>Select Rooms</label>
          <select onChange={(e) => handleRoomSelection(e.target.value)}>
            <option value="">Select a room</option>
            {rooms.map((room) => (
              <option key={room.room_id} value={room.room_id}>
                {room.room_name}
              </option>
            ))}
          </select>
        </div>
        {/* Room Details */}
        {roomDetails.map((room) => (
          <div key={room.roomId} className="room-details">
            <h4>{room.room_name}</h4>
            <button type="button" onClick={() => handleRemoveRoom(room.roomId)}>X</button>
            <div>
              <label>No. of Persons</label>
              <input
                type="number"
                value={room.no_of_person}
                onChange={(e) => handleRoomDetailChange(room.roomId, 'no_of_person', e.target.value)}
              />
            </div>
            <div>
              <label>Total Price</label>
              <input
                type="number"
                value={room.total_price}
                onChange={(e) => handleRoomDetailChange(room.roomId, 'total_price', e.target.value)}
              />
            </div>
          </div>
        ))}

        {/* Submit Button */}
        <button type="button" onClick={handleSubmit}>Submit</button>
      </div>
    </div>
  );
};

export default NewBookingAdd;
