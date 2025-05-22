import React, { useState } from "react";
import MoreStatus from './moreStatus';
import Sidebar from "./Sidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faMoon, faSun } from '@fortawesome/free-solid-svg-icons';

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
    <div className="bg-gradient-to-b from-gray-50 to-blue-50 min-h-screen flex flex-col ">
      {/* Menu Button for mobile/tablet */}
      <div className="md:hidden flex justify-between items-center p-4 bg-white shadow-md admin-dashboard-h1">
        <button onClick={handleToggleSidebar} className="text-blue-600">
          <FontAwesomeIcon icon={faBars} size="lg" />
        </button>
        <h1 className="text-2xl font-extrabold text-gray-600">
          Admin Dashboard
        </h1>
        <button
          onClick={toggleTheme}
          className="py-2 px-2 h-10 bg-transparent  transition duration-300 display-contents mt-2"
        >
          <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} className="mr-2" />
          
        </button>
      </div>

      <div className="flex flex-1 admin-board">
        {/* Sidebar for Mobile/Table */}
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={handleToggleSidebar} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col max-w-[90rem] mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16 w-full">
          <div className="hidden md:block bg-white shadow-md p-4 sm:p-6 flex justify-between items-center max-w-5xl  mx-auto w-full rounded-xl admin-dashboard-h1">
            <h1 className=" text-2xl  sm:text-xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 ">
              Admin Dashboard
            </h1>
          </div>

          {/* Dashboard Content */}
          <div className="flex-1 max-w-5xl mx-auto w-full mt-6 sm:mt-8 admin-dashboard-content">
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
    </div>
  );
};

export default AdminDashboard;