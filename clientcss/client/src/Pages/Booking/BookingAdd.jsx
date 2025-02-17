import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { baseurl } from '../../Global/Baseurl';
import Complementaries from '../../Components/Complementries';

const BookingAddUpdate = () => {
  const selectedbranchid = localStorage.getItem('selectedBranchId')

  const { id } = useParams(); // Extract ID from URL parameters
  const [rooms, setRooms] = useState([]);
  const [complementaries, setComplementaries] = useState([]);
    const [selectedRooms, setSelectedRooms] = useState([]);
    const [selectedRoomId,setSelectedRoomId] = useState('');
    const [loading,setLoading] = useState(false)
    const navigate = useNavigate()
console.log('adding')
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
        advance_amount: '',
  });

  
  // Fetch rooms and complementaries
  const fetchRooms = async () => {
    const response = await axios.get(`${baseurl}/api/auth/getallrooms`,{
      headers: { 'x-branch-id': selectedbranchid, },
    });
    setRooms(response.data);
  };

  const fetchComplementaries = async () => {
    const response = await axios.get(`${baseurl}/api/auth/complementry`,{
      headers: { 'x-branch-id': selectedbranchid, },
    });
    setComplementaries(response.data);
  };

  // Fetch booking data if ID is present
  const fetchBookingData = async () => {
    if (id) {
      const response = await axios.get(`${baseurl}/api/auth/getbooking/${id}`,{
        headers: { 'x-branch-id': selectedbranchid, },
      });
      const bookingData = response.data;

      setFormData({
        ...bookingData,
        complementaries: bookingData.complementaries.reduce((acc, item) => {
          acc[item.day] = item.service_name;
          return acc;
        }, {}),
      });
      setSelectedRooms(bookingData.room_details || []);
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchComplementaries();
    fetchBookingData();
  }, [id]);

  // Handle form input changes
  const handleRoomDetailChange = (roomId, field, value) => {
    console.log('checkng room id',roomId,field,value)
    console.log('selected room dta',selectedRooms)
    setSelectedRooms((prevSelectedRooms) => {
      const updatedRooms = prevSelectedRooms.map((room) =>
        room.room_id === roomId ? { ...room, [field]: value } : room
      );
      console.log(updatedRooms)

      const total_price = updatedRooms.reduce((acc, room) => {
        console.log(Number(room.no_of_person))

        // Calculate the room total price based on number of people and price per person
        const roomTotalPrice = (Number(room.no_of_person) || 0) * (Number(room.total_price) || 0);
        return acc + roomTotalPrice;
      }, 0);
      
      console.log('chcking tola price',total_price)

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
      const response = await axios.post(`${baseurl}/api/auth/roomavailability`, 
        {
          check_in_date: formData.check_in_date,
          check_out_date: formData.check_out_date,
          roomId,
        },
        {
          headers: { 
            'x-branch-id': selectedbranchid, 
          },
        });
      
  
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
  
  const handleRemoveRoom = (roomId) => {
    // Update frontend state immediately
    setSelectedRooms((prevRooms) =>
      prevRooms.filter((room) => room.room_id !== roomId)
    );
  
    setFormData((prevFormData) => {
      const updatedRooms = prevFormData.room_details.filter(
        (room) => room.room_id !== roomId
      );
  
      const total_price = updatedRooms.reduce(
        (acc, room) => acc + Number(room.total_price || 0),
        0
      );
  
      return { ...prevFormData, room_details: updatedRooms, total_price };
    });
  
    // Reset selectedRoomId to allow re-selection of the same room
    setSelectedRoomId(null);
  };
  
  


  
  

  const handleSubmit = async (e) => {
    setLoading(true)
    e.preventDefault();

    

    const data = {
      ...formData,
      
    };

    try {
      if (id) {
        // Update booking
     const response =   await axios.put(`${baseurl}/api/auth/updatebooking/${id}`,{
      headers: { 'x-branch-id': selectedbranchid, },
    }, data);
        
        alert('Booking updated successfully!');
      } else {
        console.log('adding')
        // Add booking
       const response = await axios.post(
  `${baseurl}/api/auth/addbooking`,
  data,  // This is your request body
  {
    headers: {
      'x-branch-id': selectedbranchid // Sending selectedbranchid as a header
    }
  }
);
        alert('Booking added successfully!');
        if(response.status == 201) 
        { 
          navigate('/booking')
          setLoading(false)
        }
      }

      setFormData({
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
        advance_amount : '',
      });
    } catch (error) {
      console.error('Error while submitting:', error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div className="main-container-wrapper form-container">
      <div className='main-container-inner'>
        <div className='form-header'> 
      <h1> Add Bookingjj</h1>
      </div>
      <form onSubmit={handleSubmit}>
        <div className='form-inner-forms'>
          <div className='input-flex-wrapper'>
      <div className='input-wrapper'>
      <label className='input-label'>Name</label>
        <input
          type="text"
          required
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
        />
        </div>
        <div className='input-wrapper'>
        <label className='input-label'>Email</label>
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
        />
       </div>
       </div>

   {/* Room Selection */}
   <div className='input-wrapper'>
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




     <Complementaries formData={formData} setFormData={setFormData} complementaries={complementaries}/>
     <h4 className='form-input-title'>Total Price: {formData.total_price}</h4>
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
        <button className='button' type="submit">{id ? 'Update' : 'Submit'}</button>
        
        </div>
        </div>
      </form>
      </div>
    </div>
  );
};

export default BookingAddUpdate;
