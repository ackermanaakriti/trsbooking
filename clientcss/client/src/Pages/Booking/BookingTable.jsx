import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { baseurl, token } from '../../Global/Baseurl';
import { DeleteIcon, EditIcon, editIcon } from '../../Components/Icons';
import DeleteModal from '../../Components/DeleteModal';
import { FaEdit, FaEye } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import Loading from '../../Components/Loading';


const BookingTable = () => {
  const navigate = useNavigate();
  const selectedbranchid = localStorage.getItem('selectedBranchId')

  const queryClient = useQueryClient();
  const user = JSON.parse(localStorage.getItem('userData'));
  const tokens = localStorage.getItem('token');
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);

  // Filter states
  const [filterStatus, setFilterStatus] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);


  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch bookings
  const fetchBookings = async () => {
    const response = await fetch(`${baseurl}/api/auth/getallbookings`, {
      headers: { Authorization: `Bearer ${token}`,
      'x-branch-id': selectedbranchid,
    },
    });
    if (!response.ok) throw new Error('Error fetching bookings');
    return response.json();
  };

  const { data: bookings, isLoading, isError } = useQuery('bookings', fetchBookings);

  // Delete booking mutation
  const deleteBookingMutation = useMutation(
    async (id) => {
      const response = await fetch(`${baseurl}/api/auth/deletebooking/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}`,
        'x-branch-id': selectedbranchid,

       },
      });
      if (!response.ok) throw new Error('Error deleting booking');
      return id;
    },
    {
      onSuccess: (id) => {
        queryClient.setQueryData('bookings', (oldData) => ({
          ...oldData,
          bookings: oldData.bookings.filter((booking) => booking.id !== id),
        }));
      },
    }
  );

  const editBooking = (id) => {
    navigate(`/bookings/edit/${id}`);
  };
  const viewBooking = (id) => {
    navigate(`/bookings/view/${id}`);
  };
  const handleAddBooking = () => {
    navigate(`/bookings/add`);
  };

  const handleDeleteBooking = (id) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      deleteBookingMutation.mutate(id);
    }
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    if (newStatus === 'checkedout') {
      const booking = bookings.bookings.find((b) => b.id === bookingId);
      setSelectedBooking(booking);
      setShowCheckoutModal(true);
    } else {
      const response = await fetch(`${baseurl}/api/auth/updatebooking/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'x-branch-id': selectedbranchid,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Error updating status');

      queryClient.invalidateQueries('bookings');
    }
  };

  const handleCheckoutSubmit = async () => {
    const response = await fetch(`${baseurl}/api/auth/updatebooking/${selectedBooking.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'x-branch-id': selectedbranchid,
        
      },
      body: JSON.stringify({
        status: 'checkedout',
        total_checkedout_price: totalPrice,
        checkout_remarks: remarks,
      }),
    });

    if (!response.ok) throw new Error('Error during checkout');

    setShowCheckoutModal(false);
    setSelectedBooking(null);
    setRemarks('');
    setTotalPrice(0);
    queryClient.invalidateQueries('bookings');
  };

  const filteredBookings = bookings?.bookings
  ?.filter((booking) => {
    const checkInDate = new Date(booking.check_in_date); // Convert to Date object
    const checkOutDate = new Date(booking.check_out_date); // Convert to Date object
    const startDate = filterStartDate ? new Date(filterStartDate) : null;
    const endDate = filterEndDate ? new Date(filterEndDate) : null;

    const matchesStatus = filterStatus ? booking.status === filterStatus : true;

    const overlapsDateRange = startDate && endDate
      ? (checkInDate <= endDate && checkOutDate >= startDate) // Overlapping logic
      : true; // If no date range is selected, include all

    return matchesStatus && overlapsDateRange;
  })
  ?.sort((a, b) => {
    const dateA = new Date(a.check_in_date);
    const dateB = new Date(b.check_in_date);
    return dateB - dateA; // Most recent first
  });

  

  // Pagination logic
  const totalPages = Math.ceil((filteredBookings?.length || 0) / itemsPerPage);
  const paginatedBookings = filteredBookings?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );


  const handleCloseModal = () => {
    setModalVisible(false);
  };


  const handleDeleteSuccess = () => {
    console.log('Item deleted successfully!');
    // Refresh data or perform additional actions
  };


  return (
    <> 
    {isLoading ? <Loading/>: 
     <div className="main-container-wrapper">
     <div className="main-container-inner">
       <div className="main-header-wrapper">
         <div className="main-header-wrapper-inner">
           <button className='button' onClick={handleAddBooking}>Add Booking</button>
           <div className='container-header'>
             <h2>Bookings</h2>
           </div>
         </div>
         <div className='filter-data-wrapper'>
             {/* Filter by Start Date */}
             <div className='input-wrapper'>
             <input
               type="date"
               value={filterStartDate}
               onChange={(e) => setFilterStartDate(e.target.value)}
               placeholder="Start Date"
             />
             </div>
             {/* Filter by End Date */}
             <div className='input-wrapper'>
             <input
               type="date"
               value={filterEndDate}
               onChange={(e) => setFilterEndDate(e.target.value)}
               placeholder="End Date"
             />
             </div>
             {/* Filter by Status */}
             <div className='input-wrapper'>
             <select
               value={filterStatus}
               onChange={(e) => setFilterStatus(e.target.value)}
             >
               <option value="">Filter by Status</option>
               <option value="booked">Booked</option>
               <option value="checkedin">Checked In</option>
               <option value="checkedout">Checked Out</option>
             </select>
             </div>
           </div>
       </div>
       <div className="main-content-wrapper">
         <div className="main-content-wrapper-inner">
         <div className="main-table-wrapper">
           <table>
             <thead>
               <tr>
                 <th>S.N</th>
                 <th>Name</th>
                 <th>Check-in Date</th>
                 <th>Check-out Date</th>
                 <th>Phone Number</th>
                 <th>Status</th>
                 <th>Guest Status</th>
                 
                 <th>Action</th>
               </tr>
             </thead>
             <tbody>
               {paginatedBookings && paginatedBookings.length > 0 ? (
                 paginatedBookings.map((booking, index) => (
                   <tr key={booking.id}>
                     <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                     <td>{booking.name}</td>
                     <td>{booking.check_in_date}</td>
                     <td>{booking.check_out_date}</td>
                     <td>{booking.phone_number}</td>
                     <td>
                       {(user?.role == 'office_staff' )|| (user?.role == 'admin') ? (
                         <select
                         className='table-select'
                           value={booking.status}
                           onChange={(e) =>
                             handleStatusChange(booking.id, e.target.value)
                           }
                         >
                           <option value="booked">Booked</option>
                           <option value="checkedin">Checked In</option>
                           <option value="checkedout">Checked Out</option>
                         </select>
                       ) : (
                         booking.status
                       )}
                     </td>
                     <td>
                     {booking.recurring_guest ? (
                      <span>Recurring Guest</span>
                          ) : (
                       <span>New Guest</span>
                          )}
                     </td>
                     <td>
                       {booking.status === 'Checked_in' && (
                         <button
                           onClick={() => handleStatusChange(booking.id, 'Checked_out')}
                         >
                           Checkout
                         </button>
                       )}
                       <button onClick={() => editBooking(booking.id)}>
                         <span className='icon-wrapper'>
                          <FaEdit/>
                         </span>
                       </button>
                       <button onClick={() => viewBooking(booking.id)}>
                         <span className='icon-wrapper'>
                         <FaEye/>
                         </span>
                      
                       </button>
                       <button
                         onClick={() => handleDeleteBooking(booking.id)}
                         disabled={deleteBookingMutation.isLoading}
                       >
                         {deleteBookingMutation.isLoading ? 'Deleting...' : 
                         <span className='icon-wrapper'><MdDeleteForever />

                           </span>}
                       </button>
                     </td>
                   </tr>
                 ))
               ) : (
                 <tr>
                   <td colSpan="7">No data available</td>
                 </tr>
               )}
             </tbody>
           </table>
         </div>
         {/* Pagination Controls */}
         <div className="pagination">
           <button
             onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
             disabled={currentPage === 1}
           >
             Previous
           </button>
           <span>
             Page {currentPage} of {totalPages}
           </span>
           <button
             onClick={() =>
               setCurrentPage((prev) => Math.min(prev + 1, totalPages))
             }
             disabled={currentPage === totalPages}
           >
             Next
           </button>
         </div>
       </div>
     </div>
     </div>
     {showCheckoutModal && (
       <div className="checkout-modal">
         <div className='checkout-modal-inner'> 
           <div className='checkout-modal-inner-inner'> 
         <h3>Checkout Data </h3>
         <div className='input-wrapper'> 
           <label>Checkout Price</label>
         <input
           type="number"
           placeholder="Total received price"
           value={totalPrice}
           onChange={(e) => setTotalPrice(Number(e.target.value))}
         />
         </div>
         <div className='input-wrapper'> 
           <label>Remarks</label>
         <textarea
           placeholder="Enter remarks"
           value={remarks}
           onChange={(e) => setRemarks(e.target.value)}
         />
         </div>
         <div className='button-wrapper'> 
         <button className='button' onClick={handleCheckoutSubmit}>Submit</button>
         <button className='button' onClick={() => setShowCheckoutModal(false)}>Close</button>
         </div>
       </div>
       </div>
       </div>
     )}


{isModalVisible && (
 <DeleteModal
   mainurl="item-id"
   onClose={handleCloseModal}
   onSuccess={handleDeleteSuccess}
 />
)}
   </div>
    }
   
    </>
  
  );
};

export default BookingTable;


