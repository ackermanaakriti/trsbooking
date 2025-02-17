import React, { useState } from "react";
import Calendar from "react-calendar";
import axios from "axios";
import "react-calendar/dist/Calendar.css";
import { baseurl } from "../../Global/Baseurl";

const RoomCalendar = () => {
  const selectedbranchid = localStorage.getItem('selectedBranchId')

  const [dateRange, setDateRange] = useState([new Date(), new Date()]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [unavailableRooms, setUnavailableRooms] = useState([]);
  const [isAvailableOpen, setIsAvailableOpen] = useState(true); // Toggle for available rooms
  const [isUnavailableOpen, setIsUnavailableOpen] = useState(true); // Toggle for unavailable rooms

  const handleDateChange = async (selectedDates) => {
    setDateRange(selectedDates);

    console.log("Selected date checking", selectedDates);
    try {
      const selected_date = selectedDates.toLocaleDateString();

      const response = await axios.post(
        `${baseurl}/api/auth/check-room-date-available`,
        {
          selected_date,
        },
        {
          headers: {
            'x-branch-id': selectedbranchid, // Send the selectedBranchId as a header
          }
        }
      );

      if (response.data.success) {
        setAvailableRooms(response.data.availableRooms);
        setUnavailableRooms(response.data.unavailableRooms);
        console.log("Available Rooms:", response.data.availableRooms);
        console.log("Unavailable Rooms:", response.data.unavailableRooms);
      }
    } catch (error) {
      console.error("Error checking room availability:", error.message);
    }
  };

  return (
    <div>
      <h2>Calendar</h2>
      <Calendar onChange={handleDateChange} value={dateRange} />

      {/* Available Rooms */}
      <div className="available_rooms_wrapper">
        <h3 onClick={() => setIsAvailableOpen(!isAvailableOpen)} style={{ cursor: "pointer" }}>
          Available Rooms {isAvailableOpen ? "▲" : "▼"}
        </h3>
        {isAvailableOpen && (
          <ul>
            {availableRooms.map((room) => (
              <li key={room.room_id}>{room.room_name}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Unavailable Rooms */}
      <div className="available_rooms_wrapper">
        <h3 onClick={() => setIsUnavailableOpen(!isUnavailableOpen)} style={{ cursor: "pointer" }}>
          Unavailable Rooms {isUnavailableOpen ? "▲" : "▼"}
        </h3>
        {isUnavailableOpen && (
          <ul>
            {unavailableRooms.map((room) => (
              <li key={room.room_id}>{room.room_name}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default RoomCalendar;
