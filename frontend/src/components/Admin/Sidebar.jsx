import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTachometerAlt,
    faSignOutAlt,
    faUsers,
    faBriefcase,
    faCalendarAlt,
    faComment,
    faFileAlt,
    faTimes,
    faUserCircle,
    faGraduationCap,
    faChartPie,
    faSun,
    faMoon
} from '@fortawesome/free-solid-svg-icons';
import { useLocation } from "react-router-dom";


const Sidebar = ({ isOpen = false, toggleSidebar }) => {
    const [isDarkMode, setIsDarkMode] = React.useState(false);
    const location = useLocation();
    const { user, profile } = location.state || {};

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
        document.body.classList.toggle('dark', !isDarkMode);
    };

    return (
        <div className={`relative h-full ${isDarkMode ? "bg-gray-800 text-white" : "bg-white text-black"}`}>
            {/* Sidebar */}
            <div
                className={`admin-sidebar bg-white text-black w-64 md:w-72 ml-2 space-y-12 px-4 py-6 lg:w-80 fixed inset-y-0 left-0 z-50 transition-transform h-full 
                    ${isOpen ? "translate-x-0" : "-translate-x-full"} ${isDarkMode ? "bg-gray-800 text-white" : "bg-white text-black"} 
                    md:translate-x-0 overflow-y-auto` }
            >


                {/* Close Button */}
                <button
                    className="absolute top-4 right-4 text-blue-600 hover:text-blue-800 md:hidden transition-colors duration-300"
                    onClick={toggleSidebar}
                >
                    <FontAwesomeIcon icon={faTimes} size="lg" />
                </button>

                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                    Quick Links
                </h2>

                <nav className="mt-4 space-y-4">
                    <Link to="/admindashboard" className="flex items-center p-4 rounded-lg shadow-md border-l-4 border-blue-600 bg-transparent hover:bg-black hover:bg-opacity-50  transition-transform transform hover:scale-10 ">
                        <FontAwesomeIcon icon={faTachometerAlt} size="lg" />
                        <span className="ml-3 font-medium text-base  ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}">Dashboard</span>
                    </Link>

                    <Link to="/manage-user" className="flex items-center p-4 rounded-lg shadow-md border-l-4 border-blue-600 bg-transparent hover:bg-black hover:bg-opacity-50  transition-transform transform hover:scale-10 ">     <FontAwesomeIcon icon={faUsers} size="lg" />
                        <span className="ml-3 font-medium text-base ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}">Manage Users</span>
                    </Link>

                    <Link to="/admin-opportunities" state={{ user, profile }} className="flex items-center p-4 rounded-lg shadow-md border-l-4 border-blue-600 bg-transparent hover:bg-black hover:bg-opacity-50  transition-transform transform hover:scale-10 ">
                        <FontAwesomeIcon icon={faBriefcase} size="lg" />
                        <span className="ml-3 font-medium text-base ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}">Manage Opportunities</span>
                    </Link>

                    <Link to="/events" className="flex items-center p-4 rounded-lg shadow-md border-l-4 border-blue-600 bg-transparent hover:bg-black hover:bg-opacity-50  transition-transform transform hover:scale-10 ">
                        <FontAwesomeIcon icon={faCalendarAlt} size="lg" />
                        <span className="ml-3 font-medium text-base ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}">Manage Events</span>
                    </Link>

                    <Link to="/dashboard-admin" className="flex items-center p-4 rounded-lg shadow-md border-l-4 border-blue-600 bg-transparent hover:bg-black hover:bg-opacity-50  transition-transform transform hover:scale-10 ">
                        <FontAwesomeIcon icon={faComment} size="lg" />
                        <span className="ml-3 font-medium text-base ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}">Manage Discussions</span>
                    </Link>

                    <Link to="/dashboard-admin" className="flex items-center p-4 rounded-lg shadow-md border-l-4 border-blue-600 bg-transparent hover:bg-black hover:bg-opacity-50  transition-transform transform hover:scale-10 ">
                        <FontAwesomeIcon icon={faFileAlt} size="lg" />
                        <span className="ml-3 font-medium text-base ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}">Manage Resources</span>
                    </Link>

                    <Link to="/dashboard-admin" className="flex items-center p-4 rounded-lg shadow-md border-l-4 border-blue-600 bg-transparent hover:bg-black hover:bg-opacity-50  transition-transform transform hover:scale-10 ">
                        <FontAwesomeIcon icon={faChartPie} size="lg" />
                        <span className="ml-3 font-medium text-base ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}">User Status</span>
                    </Link>

                    <Link to="/logout" className="flex items-center p-4 rounded-lg shadow-md border-l-4 border-blue-600 bg-transparent hover:bg-black hover:bg-opacity-50  transition-transform transform hover:scale-10 ">
                        <FontAwesomeIcon icon={faSignOutAlt} size="lg" />
                        <span className="ml-3 font-medium text-base ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}">Logout</span>
                    </Link>

                    <button
                        onClick={toggleTheme}
                        className="py-2 px-2 h-10 bg-transparent  transition duration-300 display-contents mt-2"
                    >
                        <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} className="mr-2" />
                        {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                    </button>

                </nav>


            </div>
        </div>
    );
};

export default Sidebar;