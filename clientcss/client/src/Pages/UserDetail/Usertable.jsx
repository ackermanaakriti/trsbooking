import React from 'react';
import { useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { baseurl, token } from '../../Global/Baseurl';
import Loading from '../../Components/Loading';


const UserTable = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const selectedbranchid = localStorage.getItem('selectedBranchId')

  const fethcuser = async () => {
    const response = await fetch(`${baseurl}/api/auth/getalluser`, {
      headers: { Authorization: `Bearer ${token}`,
      'x-branch-id': selectedbranchid, },
    });
    if (!response.ok) throw new Error('Error fetching user');
    return response.json();
  };

  // Fetch bookings
  const { data, isLoading, isError } = useQuery('alluser', fethcuser);

  // Delete booking mutation
  const deleteUserMutation = useMutation(
    async (id) => {
      const response = await fetch(`${baseurl}/api/auth/deleteuser/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}`,
        'x-branch-id': selectedbranchid, },
      });
      if (!response.ok) throw new Error('Error deleting inquiry');
      return id; // Return the booking ID to remove it from the list
    },
    {
      // Invalidate the room query after a successful deletion
      onSuccess: (id) => {
        // Update the room data after successful deletion
        queryClient.setQueryData('alluser', (oldData) =>
          oldData.filter((room) => room.id !== id) // Filter out the deleted room
        );
      },
    }
  );

  const editInquiry = (id) => {
    navigate(`/user/edit/${id}`);
  };

  const handleAddInquiry = () => {
    navigate(`/register`);
  };

  const handledeleteInquiry = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUserMutation.mutate(id); // Call mutation to delete the booking
    }
  };

  return (
   <>
   {isLoading ? <Loading/> :<div className="main-container">
      <div className="main-container-inner">
        <div className="main-header-wrapper">
          <div className="main-header-wrapper-inner">
            <button  className='button' onClick={handleAddInquiry}>Add</button>
            <div className='container-header'>
              <h2>User</h2>
            </div>
            <div></div>
          </div>
        </div>
        <div className="main-content-wrapper">
          <div className="main-content-wrapper-inner"></div>
          <div className="main-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>S.N</th>
                  <th>Name</th>
                  <th>Eamil</th>
                  <th>Role</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data?.map((inquiry, index) => (
                  <tr key={inquiry.id}>
                    <td>{index + 1}</td>
                    <td>{inquiry.name}</td>
                    <td>{inquiry.email}</td>
                    <td>{inquiry.role}</td>
                    <td>
                      <button onClick={() => editInquiry(inquiry.id)}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M441 58.9L453.1 71c9.4 9.4 9.4 24.6 0 33.9L424 134.1 377.9 88 407 58.9c9.4-9.4 24.6-9.4 33.9 0zM209.8 256.2L344 121.9 390.1 168 255.8 302.2c-2.9 2.9-6.5 5-10.4 6.1l-58.5 16.7 16.7-58.5c1.1-3.9 3.2-7.5 6.1-10.4zM373.1 25L175.8 222.2c-8.7 8.7-15 19.4-18.3 31.1l-28.6 100c-2.4 8.4-.1 17.4 6.1 23.6s15.2 8.5 23.6 6.1l100-28.6c11.8-3.4 22.5-9.7 31.1-18.3L487 138.9c28.1-28.1 28.1-73.7 0-101.8L474.9 25C446.8-3.1 401.2-3.1 373.1 25zM88 64C39.4 64 0 103.4 0 152L0 424c0 48.6 39.4 88 88 88l272 0c48.6 0 88-39.4 88-88l0-112c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 112c0 22.1-17.9 40-40 40L88 464c-22.1 0-40-17.9-40-40l0-272c0-22.1 17.9-40 40-40l112 0c13.3 0 24-10.7 24-24s-10.7-24-24-24L88 64z"></path></svg>
                      </button>
                      <button
                        onClick={() => handledeleteInquiry(inquiry .id)}
                        disabled={deleteUserMutation.isLoading}
                      >
                        {deleteUserMutation.isLoading ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 512 512"
                            aria-hidden="true"
                          >
                            <path d="M304 48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zm0 416a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM48 304a48 48 0 1 0 0-96 48 48 0 1 0 0 96zm464-48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM142.9 437A48 48 0 1 0 75 369.1 48 48 0 1 0 142.9 437zm0-294.2A48 48 0 1 0 75 75a48 48 0 1 0 67.9 67.9zM369.1 437A48 48 0 1 0 437 369.1 48 48 0 1 0 369.1 437z" />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 448 512"
                            aria-hidden="true"
                          >
                            <path d="M170.5 51.6L151.5 80l145 0-19-28.4c-1.5-2.2-4-3.6-6.7-3.6l-93.7 0c-2.7 0-5.2 1.3-6.7 3.6zm147-26.6L354.2 80 368 80l48 0 8 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-8 0 0 304c0 44.2-35.8 80-80 80l-224 0c-44.2 0-80-35.8-80-80l0-304-8 0c-13.3 0-24-10.7-24-24S10.7 80 24 80l8 0 48 0 13.8 0 36.7-55.1C140.9 9.4 158.4 0 177.1 0l93.7 0c18.7 0 36.2 9.4 46.6 24.9zM80 128l0 304c0 17.7 14.3 32 32 32l224 0c17.7 0 32-14.3 32-32l0-304L80 128zm80 64l0 208c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-208c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0l0 208c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-208c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0l0 208c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-208c0-8.8 7.2-16 16-16s16 7.2 16 16z" />
                          </svg>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div> }
    
    </>
  );
};

export default UserTable;
