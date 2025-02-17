import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import BookingTable from '../Pages/Booking/BookingTable';
import EditBooking from '../Pages/Booking/EditBooking';
import BookingAdd from '../Pages/Booking/BookingAdd';
import Header from '../Components/Header';
import Roomtable from '../Pages/Room/Roomtable';
import RoomForm from '../Pages/Room/RoomForm';
import InquiryForm from '../Pages/Inquiry/InquiryForm';
import InquiryTable from '../Pages/Inquiry/InquiryTable';
import Login from '../Pages/Login_Register/Login';
import Register from '../Pages/Login_Register/Register';
import Dasboard from '../Pages/Dashboard/Dasboard';
import ViewDetailsBooking from '../Pages/Booking/ViewDetails';
import UserTable from '../Pages/UserDetail/Usertable';
import EditRegister from '../Pages/UserDetail/UserForm';
import BranchSelectForm from '../Pages/Branches/Brancheselectform';

function PrivateRoute({ children }) {
  const user = localStorage.getItem('userData');
  return user ? children : <Navigate to="/" />;
}

function Routers() {
  const user = localStorage.getItem('userData');

  return (
    <Routes>
      {/* Redirect authenticated users from login page */}
      <Route
        path="/"
        element={user ? <Navigate to="/dashboard" /> : <Login />}
      />
      <Route path="/register" element={<Register />} />
      <Route path="/users-data" element={<UserTable />} />
      <Route path="user/edit/:id" element={<EditRegister />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dasboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/booking"
        element={
          <PrivateRoute>
            <BookingTable />
          </PrivateRoute>
        }
      />
      <Route
        path="/bookings/edit/:id"
        element={
          <PrivateRoute>
            <EditBooking />
          </PrivateRoute>
        }
      />
      <Route
        path="/bookings/view/:id"
        element={
          <PrivateRoute>
            <ViewDetailsBooking />
          </PrivateRoute>
        }
      />
      <Route
        path="/bookings/add"
        element={
          <PrivateRoute>
            <BookingAdd />
          </PrivateRoute>
        }
      />

<Route
        path="/branches"
        element={
          <PrivateRoute>
            <BranchSelectForm />
          </PrivateRoute>
        }
      />

      <Route
        path="/rooms"
        element={
          <PrivateRoute>
            <Roomtable />
          </PrivateRoute>
        }
      />
      <Route
        path="/rooms/edit/:id"
        element={
          <PrivateRoute>
            <RoomForm />
          </PrivateRoute>
        }
      />
      <Route
        path="/rooms/add"
        element={
          <PrivateRoute>
            <RoomForm />
          </PrivateRoute>
        }
      />
      <Route
        path="/inquiry"
        element={
          <PrivateRoute>
            <InquiryTable />
          </PrivateRoute>
        }
      />
      <Route
        path="/inquiry/edit/:id"
        element={
          <PrivateRoute>
            <InquiryForm />
          </PrivateRoute>
        }
      />
      <Route
        path="/inquiry/add"
        element={
          <PrivateRoute>
            <InquiryForm />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}


function App() {
  return (
    <Router>
      <Header />
      <Routers />
    </Router>
  );
}

export default App;
