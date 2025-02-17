import { useState } from "react";
import { FaUser } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { setUser } from "../Global/Redux/AuthSlice";
import { useDispatch } from "react-redux";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('userData'));

const navigate = useNavigate()
 const dispatch = useDispatch();
  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

 const handleUsers =()=>
 { 
  navigate('/users-data')
 }
 
  const handleLogout = () => {
 
  
    // Clear the user state
    dispatch(setUser({ user: null, token: null }));
    localStorage.removeItem("userData");
    localStorage.removeItem("token");
    // Optional: Redirect to login page or home page
    window.location.href = "/"; // Adjust the path based on your routing
  };
  
  return (
    <div className="header-wrapper" style={{ display: "flex", borderBottom: "1px solid #ccc" }}>
      <div className="logoContainer">
          <a href="/dashboard">
            <img src="/logo-new.png" alt="" />
          </a>
      </div>
      <div>
      <Link to="/dashboard" className="navMenu" style={{ padding: "10px", textDecoration: "none" }}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm320 96c0-26.9-16.5-49.9-40-59.3L280 88c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 204.7c-23.5 9.5-40 32.5-40 59.3c0 35.3 28.7 64 64 64s64-28.7 64-64zM144 176a32 32 0 1 0 0-64 32 32 0 1 0 0 64zm-16 80a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm288 32a32 32 0 1 0 0-64 32 32 0 1 0 0 64zM400 144a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"/></svg>
        Dashboard
      </Link>
      <Link to="/rooms" className="navMenu" style={{ padding: "10px", textDecoration: "none" }}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path d="M32 32c17.7 0 32 14.3 32 32l0 256 224 0 0-160c0-17.7 14.3-32 32-32l224 0c53 0 96 43 96 96l0 224c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-32-224 0-32 0L64 416l0 32c0 17.7-14.3 32-32 32s-32-14.3-32-32L0 64C0 46.3 14.3 32 32 32zm144 96a80 80 0 1 1 0 160 80 80 0 1 1 0-160z"/></svg>
        Rooms
      </Link>
      <Link to="/booking" className="navMenu" style={{ padding: "10px", textDecoration: "none" }}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M96 0C43 0 0 43 0 96L0 416c0 53 43 96 96 96l288 0 32 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l0-64c17.7 0 32-14.3 32-32l0-320c0-17.7-14.3-32-32-32L384 0 96 0zm0 384l256 0 0 64L96 448c-17.7 0-32-14.3-32-32s14.3-32 32-32zm32-240c0-8.8 7.2-16 16-16l192 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-192 0c-8.8 0-16-7.2-16-16zm16 48l192 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-192 0c-8.8 0-16-7.2-16-16s7.2-16 16-16z"/></svg>
        Booking
      </Link>
      <Link to="/inquiry" className="navMenu" style={{ padding: "10px", textDecoration: "none" }}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M304 128a80 80 0 1 0 -160 0 80 80 0 1 0 160 0zM96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM49.3 464l349.5 0c-8.9-63.3-63.3-112-129-112l-91.4 0c-65.7 0-120.1 48.7-129 112zM0 482.3C0 383.8 79.8 304 178.3 304l91.4 0C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7L29.7 512C13.3 512 0 498.7 0 482.3z"/></svg>
        Inquiry
      </Link>
      </div>
      <div className="profile-settings">
      <span className="icon" onClick={toggleMenu}>
        <FaUser />
      </span>
      {isMenuOpen && (
        <div className="dropdown-menu">
          <button onClick={handleLogout}>Logout</button>
          {user?.role == 'admin'?  <button onClick={handleUsers}>User</button> : '' }
         
        </div>
      )}
      </div>
    </div>
  );
};

export default Header;
