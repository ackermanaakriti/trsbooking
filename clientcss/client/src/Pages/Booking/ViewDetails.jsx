import React, { useEffect, useState } from "react";
import { baseurl } from "../../Global/Baseurl";
import { useParams } from "react-router";
import axios from "axios";

const ViewDetailsBooking = () => {
  const selectedbranchid = localStorage.getItem('selectedBranchId')

    const [booking,setBooking]= useState('')
    const {id}= useParams()
    const fetchBookingData = async () => {
        const response = await axios.get(`${baseurl}/api/auth/getbooking/${id}`,{ headers: { 'x-branch-id': selectedbranchid, },});
        const bookingData = response.data;
        setBooking(bookingData)
        console.log(response)
      };

       useEffect(() => {
          fetchBookingData();
        }, [id]);

  return (
    <div className="booking-details">
      <h1>Booking Details</h1>
      <div className="user-info">
        <h2>User Information</h2>
        <p><strong>Name:</strong> {booking?.name}</p>
        <p><strong>Email:</strong> {booking?.email}</p>
        <p><strong>Phone Number:</strong> {booking?.phone_number}</p>
        <p><strong>Address:</strong> {booking?.address}</p>
        <p><strong>Additional Note:</strong> {booking?.additional_note}</p>
      </div>

      <div className="date-info">
        <h2>Stay Information</h2>
        <p><strong>Check-In Date:</strong> {booking?.check_in_date}</p>
        <p><strong>Check-Out Date:</strong> {booking?.check_out_date}</p>
      </div>

      <div className="date-info">
        
        <p><strong>Advance Amount:</strong> {booking?.advance_amount}</p>
      </div>


      <div className="complementaries">
  <h2>Complementary Services</h2>
  {Object.entries(booking?.complementaries || {}).map(([day, services], index) => (
    <div key={index}>
      <p><strong>Day:</strong> {day}</p>
      <p><strong>Services:</strong> {services.join(", ")}</p>
    </div>
  ))}
</div>


      <div className="room-details">
        <h2>Room Details</h2>
        {booking?.room_details?.map((room, index) => (
          <div key={index} className="room">
            <p><strong>Room Name:</strong> {room?.room_name}</p>
            <p><strong>Number of People:</strong> {room?.no_of_person}</p>
            <p><strong>Total Price:</strong> {room?.total_price}</p>
          </div>
        ))}
         <p><strong>Total All Room Price:</strong> {booking?.total_price}</p>
      </div>
      <div className="room-details">
        <h2>Check out details</h2>
        <p><strong>Checkout Total price:</strong> {booking?.total_checkedout_price}</p>
        <p><strong>Checkout remarks:</strong> {booking?.checkout_remarks}</p>
      </div>
      <div className="room-details">
        <h2>Status: {booking?.status}</h2>
       
      </div>

      <div className="price-info">
        <h2>Grand Total Price</h2>
        <p><strong>Amount:</strong> {booking?.grand_total}</p>
      </div>
      

      <p className="created-at"><strong>Created At:</strong> {new Date(booking.created_at).toLocaleString()}</p>
    </div>
  );
};

export default ViewDetailsBooking;
