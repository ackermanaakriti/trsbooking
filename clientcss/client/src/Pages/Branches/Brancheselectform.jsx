import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { baseurl } from '../../Global/Baseurl';
import { useNavigate } from 'react-router';
import Loading from '../../Components/Loading';
import Mainloader from '../../Components/Mainloader';

const BranchSelectForm = () => {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [showAllBranches, setShowAllBranches] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loading,setLoading]= useState(false)
  const[addBranchloading,setaddbranchloading] = useState(false)
  const [showmodal,setshowbranchmodal]= useState(true)
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    contact_email: '',
    contact_phone: '',
  });


  const user = JSON.parse(localStorage.getItem('userData'));

  // Fetch branches from backend
  useEffect(() => {
    fetchBranches();
  }, [addBranchloading]);

  const fetchBranches = () => {
    axios.get(`${baseurl}/api/auth/allbranches`)
      .then((response) => setBranches(response.data))
      .catch((err) => console.error('Error fetching branches'));
  };

  // Handle branch selection
  const handleSelectBranch = (branchId) => {
    setLoading(true)
    setSelectedBranch(branchId);
    console.log('Branch selected!');
    setTimeout(() => {
        window.location.href = `/dashboard?branchId=${branchId}`;
        localStorage.setItem('selectedBranchId', branchId);
        setLoading(false)
        setshowbranchmodal(false)
    }, 1000);
   

  };

  // Handle form submission for adding/editing
  const handleSubmit = async(e) => {
    e.preventDefault();
    setaddbranchloading(true)
    if (formData.id) {

      try{
        const response = await axios.put(`${baseurl}/api/auth/editbranch/${formData.id}`, formData)
  
        if (response.status === 201 || response.statusText === 'OK') {
          console.log('Branch updated successfully!');
          fetchBranches();
          setShowForm(false);
          setaddbranchloading(false)
        } else {
          console.error('Unexpected response:', response);
        }
      } catch (error) {
        console.error('Error adding branch:', error);
      } finally {
        setLoading(false); // Always set loading to false after the API call
      }
    } else {
      // Add new branch
      setTimeout(() => {
        try{
          const response =  axios.post(`${baseurl}/api/auth/addbranch`, formData);
    
          if (response.status === 200 || response.statusText === 'OK') {
            console.log('Branch added successfully!');
            fetchBranches();
            setShowForm(false);
            setaddbranchloading(false)
          } else {
            console.error('Unexpected response:', response);
          }
        } catch (error) {
          console.error('Error adding branch:', error);
        } finally {
          setLoading(false); // Always set loading to false after the API call
        }
      }, 1000);
   
    }
  };

  // Handle branch deletion
  const handleDelete = async(branchId) => {
    setaddbranchloading(true)
    
    // if (window.confirm('Are you sure you want to delete this branch?')) {
    //   axios.delete(`${baseurl}/api/auth/deletebranch/${branchId}`)
    //     .then(() => {
    //       console.log('Branch deleted successfully!');
    //       fetchBranches();
    //     })
    //     .catch(() => console.error('Error deleting branch'));
    // }
    try{
      const response = await axios.delete(`${baseurl}/api/auth/deletebranch/${branchId}`);

      if (response.status === 201 || response.statusText === 'OK') {
        console.log('Branch deleted successfully!');
        fetchBranches();
        setShowForm(false);
        setaddbranchloading(false)
      } else {
        console.error('Unexpected response:', response);
      }
    } catch (error) {
      console.error('Error adding branch:', error);
    } finally {
      setLoading(false); // Always set loading to false after the API call
    }

  };

  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Open form for editing
  const handleEdit = (branch) => {
    setFormData(branch);
    setShowForm(true);
  };

  // Open form for adding
  const handleAdd = () => {
    setFormData({ name: '', location: '', contact_email: '', contact_phone: '' });
    setShowForm(true);
  };

  return (
    <>
    {showmodal ? 
        <div class='main-container branch-modal main-branch-container'>
        <div class='main-container-inner'>
        <div className="main-header-wrapper"> 
        <div className="main-header-wrapper-inner-branch">
        <div className='container-header branch-container-header'> 
      <h2>Manage Branches</h2>
      </div>
      </div>
      </div>

      {/* Branch Selection */}
      <div className='branch-manage-wrapper'>
        <div className='branch-manage-inner-wrapper'>

            <div className='branch-selct-wrapper'>
        <h4>Select a Branch</h4>
        <ul>
          {branches.map((branch) => (
            <li key={branch.id}>
              {branch.name} - {branch.location}
              <button onClick={() => handleSelectBranch(branch.id)}>Select</button>
            </li>
          ))}
        </ul>
        </div>
        </div>
      </div>
      {loading ?  <div className='loader-wrapper'>Redirecting...</div>
: '' }
     
      {/* All Branches Management */}
      <div className='showallbranch-btn-wrapper'>
      <button  className='showallbranch-button' onClick={() => setShowAllBranches(!showAllBranches)}>
        {showAllBranches ? 'Hide All Branches' : 'Show All Branches'}
      </button>
      </div>
      {showAllBranches && (
        <div className='allbranches-list'>
            <div className='allbranches-list-inner'>
          <h2>All Branches</h2>
          <ul>
            {branches.map((branch) => (
              <li key={branch.id}>
                {branch.name} - {branch.location}

                {user.role == 'admin'? <div className='allbrancheslist-btn'>
                <button className='allbranches-edit' onClick={() => handleEdit(branch)}>
                <svg xmlns="http://www.w3.org/2000/svg" height='15px' width='15px' viewBox="0 0 512 512"><path d="M441 58.9L453.1 71c9.4 9.4 9.4 24.6 0 33.9L424 134.1 377.9 88 407 58.9c9.4-9.4 24.6-9.4 33.9 0zM209.8 256.2L344 121.9 390.1 168 255.8 302.2c-2.9 2.9-6.5 5-10.4 6.1l-58.5 16.7 16.7-58.5c1.1-3.9 3.2-7.5 6.1-10.4zM373.1 25L175.8 222.2c-8.7 8.7-15 19.4-18.3 31.1l-28.6 100c-2.4 8.4-.1 17.4 6.1 23.6s15.2 8.5 23.6 6.1l100-28.6c11.8-3.4 22.5-9.7 31.1-18.3L487 138.9c28.1-28.1 28.1-73.7 0-101.8L474.9 25C446.8-3.1 401.2-3.1 373.1 25zM88 64C39.4 64 0 103.4 0 152L0 424c0 48.6 39.4 88 88 88l272 0c48.6 0 88-39.4 88-88l0-112c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 112c0 22.1-17.9 40-40 40L88 464c-22.1 0-40-17.9-40-40l0-272c0-22.1 17.9-40 40-40l112 0c13.3 0 24-10.7 24-24s-10.7-24-24-24L88 64z"></path></svg>

                </button>
                <button className='allbranches-delete' onClick={() => handleDelete(branch.id)}>
                <svg
                 height='15px' width='15px'
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 448 512"
                            aria-hidden="true"
                          >
                            <path d="M170.5 51.6L151.5 80l145 0-19-28.4c-1.5-2.2-4-3.6-6.7-3.6l-93.7 0c-2.7 0-5.2 1.3-6.7 3.6zm147-26.6L354.2 80 368 80l48 0 8 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-8 0 0 304c0 44.2-35.8 80-80 80l-224 0c-44.2 0-80-35.8-80-80l0-304-8 0c-13.3 0-24-10.7-24-24S10.7 80 24 80l8 0 48 0 13.8 0 36.7-55.1C140.9 9.4 158.4 0 177.1 0l93.7 0c18.7 0 36.2 9.4 46.6 24.9zM80 128l0 304c0 17.7 14.3 32 32 32l224 0c17.7 0 32-14.3 32-32l0-304L80 128zm80 64l0 208c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-208c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0l0 208c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-208c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0l0 208c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-208c0-8.8 7.2-16 16-16s16 7.2 16 16z" />
                          </svg>
                </button>
                </div>: '' }
                
              </li>
            ))}
          </ul>
          {user.role == 'admin' ?  <button className='addbranch' onClick={handleAdd}>Add Branch</button>: ''}
         
          </div>
        </div>
      )}


      {/* Add/Edit Branch Form */}
      {showForm && (
        <div className='branch-list-add'> 
        <div className='branch-list-add-inner'> 
        <form onSubmit={handleSubmit}>
          <h2>{formData.id ? 'Edit Branch' : 'Add Branch'}</h2>

         <div className='input-wrapper-brach-flex'>
              <div className='input-wrapper'>
          <input
            type="text"
            name="name"
            value={formData.name}
            placeholder="Branch Name"
            onChange={handleInputChange}
            required
          />
          </div>
          <div className='input-wrapper'>
          <input
            type="text"
            name="location"
            value={formData.location}
            placeholder="Location"
            onChange={handleInputChange}
            required
          />
          </div>
          </div>


<div className='input-wrapper-brach-flex'>
      <div className='input-wrapper input-wrapper-branch'>
          <input
            type="email"
            name="contact_email"
            value={formData.contact_email}
            placeholder="Contact Email"
            onChange={handleInputChange}
          />
          </div>

          <div className='input-wrapper'>
          <input
            type="text"
            name="contact_phone"
            value={formData.contact_phone}
            placeholder="Contact Phone"
            onChange={handleInputChange}
          />
          </div>
          </div>
          {addBranchloading ? <Mainloader/>  :         
            <button className='branchlist-add' type="submit">{formData.id ? 'Update' : 'Add'}</button>
        }
        
          <button className='branchlist-cancel' type="button" onClick={() => setShowForm(false)}>Cancel</button>
        </form>
        </div>
        </div>
      )}
    </div>
    </div>
        : '' }
   </>
  );
};

export default BranchSelectForm;
