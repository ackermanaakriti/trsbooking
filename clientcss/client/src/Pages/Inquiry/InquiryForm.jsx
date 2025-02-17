import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { baseurl, token } from '../../Global/Baseurl';

const InquiryForm = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // For editing
  const queryClient = useQueryClient();
  const selectedbranchid = localStorage.getItem('selectedBranchId')

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phoneno: '',
    remarks:'',
    no_of_pax:'',
    looking_approxdate:''
  });

  // Fetch room data for editing
  const { data: inQuiryData, isLoading } = useQuery(
    ['room', id],
    async () => {
      const response = await fetch(`${baseurl}/api/auth/getinquiry/${id}`, {
        headers: { Authorization: `Bearer ${token}`,
        'x-branch-id': selectedbranchid,
      },
      });
      if (!response.ok) throw new Error('Error fetching room details');
      return response.json();
    },
    {
      enabled: !!id, // Only fetch if `id` is present
    }
  );

  useEffect(() => {
    if (inQuiryData) {
      setFormData({
        customer_name: inQuiryData.customer_name || '',
        customer_phoneno: inQuiryData.customer_phoneno || '',
        remarks: inQuiryData.remarks || '',
        no_of_pax:inQuiryData.no_of_pax || '',
        looking_approxdate:inQuiryData.looking_approxdate || ''
        
      });
    }
  }, [inQuiryData]);

  const mutation = useMutation(
    async (data) => {
      const url = id
        ? `${baseurl}/api/auth/inquiry/update/${id}`
        : `${baseurl}/api/auth/inquiry/add`;
      const method = id ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'x-branch-id': selectedbranchid,

        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(`Error ${id ? 'updating' : 'adding'} inquiry`);
      return response.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('inquiry');
        navigate('/inquiry');
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
      <h2>{id ? 'Edit Inquiry' : 'Add Inquiry'}</h2>
    </div>   
      <form onSubmit={handleSubmit}>
        
      <div className='form-inner-forms'>
      <div className='input-flex-wrapper'>
        <div  className='input-wrapper'>
          <label htmlFor="customer_name">Customer Name:</label>
          <input
            type="text"
            id="customer_name"
            name="customer_name"
            value={formData.customer_name}
            onChange={handleChange}
            required
          />
        </div>
        <div className='input-wrapper'>
          <label htmlFor="customer_phoneno">Customer Phone No.:</label>
          <input
            type="text"
            id="customer_phoneno"
            name="customer_phoneno"
            value={formData.customer_phoneno}
            onChange={handleChange}
            required
          />
        </div>
        </div>
        <div className='input-wrapper'>
          <label htmlFor="remarks">No of pax</label>
          <input
            type="number"
            id="no_of_pax"
            name="no_of_pax"
            value={formData.no_of_pax}
            onChange={handleChange}
            
          />
        </div>
        <div className='input-wrapper'>
          <label htmlFor="remarks">Date looking for</label>
          <input
            type="text"
            id="looking_approxdate"
            name="looking_approxdate"
            value={formData.looking_approxdate}
            onChange={handleChange}
            
          />
        </div>
        <div className='input-wrapper'>
          <label htmlFor="remarks">Remarks</label>
          <input
            type="text"
            id="remarks"
            name="remarks"
            className='textarea-input'
            value={formData.remarks}
            onChange={handleChange}
            
          />
        </div>
        <div className='forms-button'>
        <button className='button' type="submit" disabled={mutation.isLoading}>
          {mutation.isLoading ? (id ? 'Updating...' : 'Adding...') : id ? 'Update Inquiry' : 'Add Inquiry'}
        </button>
        </div>
        </div>
      </form>
    
    </div>
    </div>
  );
};

export default InquiryForm;
