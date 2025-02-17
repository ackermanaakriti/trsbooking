import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { baseurl, token } from '../../Global/Baseurl';

const RoomForm = () => {
  const selectedbranchid = localStorage.getItem('selectedBranchId')

  const navigate = useNavigate();
  const { id } = useParams(); // For editing
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    room_number: '',
    room_name: '',
    room_status:''
  });

  // Fetch room data for editing
  const { data: roomData, isLoading } = useQuery(
    ['room', id],
    async () => {
      const response = await fetch(`${baseurl}/api/auth/getroom/${id}`, {
        headers: { 'x-branch-id': selectedbranchid, },
      });
      if (!response.ok) throw new Error('Error fetching room details');
      return response.json();
    },
    {
      enabled: !!id, // Only fetch if `id` is present
    }
  );

  useEffect(() => {
    if (roomData) {
      setFormData({
        room_number: roomData.room_number || '',
        room_name: roomData.room_name || '',
        room_status:roomData.room_status || ''
      });
    }
  }, [roomData]);

  const mutation = useMutation(
    async (data) => {
      const url = id
        ? `${baseurl}/api/auth/room/update/${id}`
        : `${baseurl}/api/auth/room/add`;
      const method = id ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-branch-id': selectedbranchid,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(`Error ${id ? 'updating' : 'adding'} room`);
      return response.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('room');
        navigate('/rooms');
      },
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="main-container-wrapper form-container">
    <div className='main-container-inner'>
      <div className='form-header'> 
      <h2>{id ? 'Edit Room' : 'Add Room'}</h2>
    </div>
      
      <form  className='form-inner-forms' onSubmit={handleSubmit}>
        <div>
        <div className='input-wrapper'>
          <label htmlFor="room_number">Room Number:</label>
          <input
            type="text"
            id="room_number"
            name="room_number"
            value={formData.room_number}
            onChange={handleChange}
            
          />
        </div>
        <div className='input-wrapper'>
          <label htmlFor="room_name">Room Name:</label>
          <input
            type="text"
            id="room_name"
            name="room_name"
            value={formData.room_name}
            onChange={handleChange}
            
          />
        </div>
        <div className='input-wrapper'>
          <label htmlFor="room_name">Room Staus:</label>
          <div className='input-wrapper'>
  <select
    id="room_status"
    value={formData.room_status} 
    onChange={(e) => setFormData({ ...formData, room_status: e.target.value })} // Update formData on change
  >
    <option value="">Select Status</option> 
    <option value="Active">Active</option>  
    <option value="Inactive">Inactive</option> 
  </select>
</div>

        </div>
        <div className='forms-button'>
        <button className='button' type="submit" disabled={mutation.isLoading}>
          {mutation.isLoading ? (id ? 'Updating...' : 'Adding...') : id ? 'Update Room' : 'Add Room'}
        </button>
        </div>
        </div>
      </form>
    </div>
    </div>
  );
};

export default RoomForm;
