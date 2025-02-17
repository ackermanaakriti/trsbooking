import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { baseurl } from '../../Global/Baseurl';
import Complementaries from '../../Components/Complementries';

const BookingEdit = () => {
  const selectedbranchid = localStorage.getItem('selectedBranchId')

  const { id } = useParams(); // Extract ID from URL parameters
  const [rooms, setRooms] = useState([]);
  const [complementaries, setComplementaries] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]);
     const [selectedRoomId,setSelectedRoomId] = useState('')
     const [fethcedComplementry,setFetchComplementry]= useState([])

     const complementaryData = {};
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_number: '',
    address: '',
    check_in_date: '',
    check_out_date: '',
    room_details: [],
    complementaries: [],
    total_price: 0,
    additional_note: '',
    advance_amount: ''
  });

  // Fetch rooms and complementaries
  const fetchRooms = async () => {
    const response = await axios.get(`${baseurl}/api/auth/getallrooms`,{ headers: { 'x-branch-id': selectedbranchid, },});
    setRooms(response.data);
  };

  const fetchComplementaries = async () => {
    const response = await axios.get(`${baseurl}/api/auth/complementry`,{ headers: { 'x-branch-id': selectedbranchid, },});
    setComplementaries(response.data);
    setFetchComplementry(response.data)
  };

  // Fetch booking data
  const fetchBookingData = async () => {
    const response = await axios.get(`${baseurl}/api/auth/getbooking/${id}`,{ headers: { 'x-branch-id': selectedbranchid, },});
    const bookingData = response.data;
    console.log(bookingData.complementaries)
    setFormData({
      ...bookingData,
    });
    
    
    setSelectedRooms(bookingData.room_details || []);
    
  };

  useEffect(() => {
    fetchRooms();
    fetchComplementaries();
    fetchBookingData();
    console.log('selcted rooms',selectedRooms)
  }, [id]);

  // Handle form input changes
  const handleRoomDetailChange = (roomId, field, value) => {
    setSelectedRooms((prevSelectedRooms) => {
      const updatedRooms = prevSelectedRooms.map((room) =>
        room.room_id === roomId ? { ...room, [field]: value } : room
      );

      const total_price = updatedRooms.reduce((acc, room) => {
        console.log(Number(room.no_of_person))

        // Calculate the room total price based on number of people and price per person
        const roomTotalPrice = (Number(room.no_of_person) || 0) * (Number(room.total_price) || 0);
        return acc + roomTotalPrice;
      }, 0);

      setFormData((prevFormData) => ({
        ...prevFormData,
        room_details: updatedRooms,
        total_price,
      }));

      return updatedRooms;
    });
  };
  const handleRoomSelection = async (roomId, roomName) => {
    if (!formData.check_in_date || !formData.check_out_date) {
      alert('Please select check-in and check-out dates first.');
      return;
    }
  
    try {
      const response = await axios.post(
        `${baseurl}/api/auth/roomavailability`, 
        {  // This is the body of the request
          check_in_date: formData.check_in_date,
          check_out_date: formData.check_out_date,
          roomId,
        },
        {  // This is the headers
          headers: { 
            'x-branch-id': selectedbranchid, 
          }
        }
      );
  
      if (!response.data.available) {
        alert(response.data.message);
        return;
      }
  
      // Add the room only if it's not already in selectedRooms
      setSelectedRooms((prevRooms) => {
        const roomExists = prevRooms.some((room) => room.room_id === roomId);
        if (!roomExists) {
          return [
            ...prevRooms,
            { room_id: roomId, room_name: roomName, price: '', no_of_person: '' },
          ];
        }
        return prevRooms;
      });
    } catch (error) {
      console.error('Error checking room availability:', error);
    }
  };
  
  const handleRemoveRoom = async (roomId) => {
    // Update frontend state immediately
    setSelectedRooms((prevRooms) =>
      prevRooms.filter((room) => room.room_id !== roomId)
    );
  
    setFormData((prevFormData) => {
      const updatedRooms = prevFormData.room_details.filter(
        (room) => room.room_id !== roomId
      );
  
      const total_price = updatedRooms.reduce((acc, room) => {
        console.log(Number(room.no_of_person))

        // Calculate the room total price based on number of people and price per person
        const roomTotalPrice = (Number(room.no_of_person) || 0) * (Number(room.total_price) || 0);
        return acc + roomTotalPrice;
      }, 0);
  
      return { ...prevFormData, room_details: updatedRooms, total_price };
    });
  
    try {
      // Calculate the updated total price on the frontend
      const updatedRooms = selectedRooms.filter((room) => room.room_id !== roomId);
    
      const updatedTotalPrice = updatedRooms.reduce((acc, room) => {
        console.log(Number(room.no_of_person))

        // Calculate the room total price based on number of people and price per person
        const roomTotalPrice = (Number(room.no_of_person) || 0) * (Number(room.total_price) || 0);
        return acc + roomTotalPrice;
      }, 0);
  
      // Send DELETE request with roomId and updated total price
      const response = await axios.delete(
        `${baseurl}/api/auth/deleteSelected_room/${id}`,
        {
          headers: { 'x-branch-id': selectedbranchid, },
        },
        {
          params: { roomId: roomId },
          data: { total_price: updatedTotalPrice }, // Include updated total price in the request body
        }
      );
  
      if (response.status === 200) {
        // Update the backend total price and reload the page
        console.log("Room deleted successfully, total price updated.");
        window.location.reload();
        setFormData((prevFormData) => {
          const updatedRooms = prevFormData.room_details.filter(
            (room) => room.room_id !== roomId
          );
      
          const total_price = updatedRooms.reduce((acc, room) => {
            console.log(Number(room.no_of_person))
    
            // Calculate the room total price based on number of people and price per person
            const roomTotalPrice = (Number(room.no_of_person) || 0) * (Number(room.total_price) || 0);
            return acc + roomTotalPrice;
          }, 0);
      
          return { ...prevFormData, room_details: updatedRooms, total_price };
        });
      } else {
        console.error("Failed to delete room or update total price.");
      }
    } catch (error) {
      console.error("Error removing room:", error);
    }
  
    // Reset selectedRoomId to allow re-selection of the same room
    setSelectedRoomId(null);
  };
  
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    // const complementariesArray = Object.entries(formData.complementaries).map(([day, services]) => ({
    //   day,
    //   service_name: services,
    // }));

    const data = {
      ...formData,
      
    };

    try {
      const response = await axios.put(
        `${baseurl}/api/auth/updatebooking/${id}`,
        data,  // This is your request body
        {
          headers: {
            'x-branch-id': selectedbranchid // Sending selectedbranchid as a header
          }
        }
      );
      alert('Booking updated successfully!');
    } catch (error) {
      console.error('Error while submitting:', error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div className="main-container-wrapper form-container">
    <div className='main-container-inner'>
      <div className='form-header'> 
    <h1> Update Booking</h1>
    </div>
    <form onSubmit={handleSubmit}>
      <div className='form-inner-forms'>
        <div className='input-flex-wrapper'>
    <div className='input-wrapper'>
    <label className='input-label'>Full Name</label>
      <input
        type="text"
        required
        placeholder="Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
      />
      </div>
      <div className='input-wrapper'>
      <label className='input-label'>Email Address</label>
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        
      />
      </div>
      <div className='input-wrapper'>
      <label className='input-label'>Phone Number</label>
        <input
          type="text"
          placeholder="Phone"
          value={formData.phone_number}
          onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
          required
        /> 
      </div>
      <div  className='input-wrapper'>
        <label className='input-label'>Address</label>
        <input
          type="text"
          placeholder="Address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          required
        />
      </div>
      <div className='input-wrapper'>
      <label className='input-label'>Check In</label>
      <input
        type="date"
        value={formData.check_in_date}
        name='check_in_date'
        onChange={(e) => setFormData({ ...formData, check_in_date: e.target.value })}
        required
      />
      </div>

      
     
     <div className='input-wrapper'>
     <label className='input-label'>Check Out</label>
     <input
        type="date"
        value={formData.check_out_date}
        onChange={(e) => setFormData({ ...formData, check_out_date: e.target.value })}
        required
        name='check_out_date'
      />
     </div>
     </div>

  {/* Room Selection */}
  <div className="input-wrapper">
  <label>Select Rooms</label>
<select
  value={selectedRoomId || ''}
  onChange={(e) => {
    const roomId = e.target.value;
    const roomData = rooms.find((room) => room.id == roomId);
    const roomName = roomData?.room_name;
    setSelectedRoomId(roomId); // Set active room
    handleRoomSelection(roomId, roomName); // Pass selected room details
  }}
>
  <option value="">Select a room</option>
  {rooms.map((room) => (
    <option
      key={room.room_id}
      value={room.id}
      className={selectedRoomId === room.id ? 'active' : ''}
    >
      {room.room_name}
    </option>
  ))}
</select>

</div>


        {/* Room Details */}
        {selectedRooms?.map((room) => (
  <div key={room.roomId} className="room-details-container">
    <div className='room-details-headers'> 
    <h4>Details for Room: {room?.room_name}</h4>
    <button type="button" className='closeBtn' onClick={() => handleRemoveRoom(room.room_id)}>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"></path></svg>
    </button>
    </div>
    <div className='input-flex-wrapper'> 
    <div className='input-wrapper'>
      <label>No. of Persons</label>
      <input
        type="number"
        value={room.no_of_person}
        onChange={(e) => handleRoomDetailChange(room.room_id, 'no_of_person', e.target.value)}
      />
    </div>
    <div className='input-wrapper'>
      <label>Total Price for Room</label>
      <input
        type="number"
        value={room.total_price}
        onChange={(e) => handleRoomDetailChange(room.room_id, 'total_price', e.target.value)}
      />
    </div>
    </div>
  </div>
))}



   <Complementaries
    setFormData={setFormData}
    formData={formData}
    complementaries={fethcedComplementry}
    />
   <p className='form-input-title'>Total Price: {formData.total_price}</p>
   <div className='input-wrapper'>
      <label>Advance Amount</label>
      <input
        type="number"
        value={formData.advance_amount}
        onChange={(e) => setFormData({ ...formData, advance_amount: e.target.value })}
        />
    </div>
<div className='input-wrapper'>
      <textarea
      className='textarea-input'
        placeholder="Additional Note"
        value={formData.additional_note}
        onChange={(e) => setFormData({ ...formData, additional_note: e.target.value })}
      />
      </div>
      <div className='forms-button'>
      <button className='button' type="submit">Update</button>
      </div>
      </div>
    </form>
    </div>
  </div>
  );
};

export default BookingEdit;
