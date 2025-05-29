import React, { useState } from "react";
import MoreStatus from './moreStatus';
const AdminDashboard = ({ isOpen = false, toggleSidebar }) => {
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);


  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle('dark', !isDarkMode);
  };

  return (
    <div className="bg-gradient-to-b from-gray-50 to-blue-50 min-h-screen admin-board">   
   
        <div className=" px-4 sm:px-6 py-8 admin-board ">
          <div className="hidden md:block bg-white shadow-md p-4 sm:p-6 flex justify-between items-center mt-0  rounded-xl admin-dashboard-h1">
            <h1 className=" text-2xl  sm:text-xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 ">
              Admin Dashboard
            </h1>
          </div>
          <div className=" mt-2 admin-dashboard-content">
            <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-xl shadow-lg admin-dashboard-content">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">
                Welcome, Admin!
              </h2>
              <p className="text-sm sm:text-base mb-6 ">
                Use the sidebar to manage users, jobs, events, discussions, internships, and more.
              </p>
              <MoreStatus />
            </div>
          </div>
        </div>
      </div>

  );
};

export default AdminDashboard;