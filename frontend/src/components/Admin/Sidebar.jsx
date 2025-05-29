import React from "react";
import { useState , useEffect } from "react";
import { Link } from "react-router-dom";
import { ACCESS_TOKEN } from "../../constants";
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
    faMoon,
    faFeed,
    faMessage,
    faBell,
} from '@fortawesome/free-solid-svg-icons';
import { useLocation , useNavigate } from "react-router-dom";


const Sidebar = ({ isOpen = false, toggleSidebar }) => {
    const [isDarkMode, setIsDarkMode] = React.useState(false);
    const location = useLocation();
    const { user, profile } = location.state || {};
    const [unreadCount, setUnreadCount] = useState(0);
    const accessToken = localStorage.getItem(ACCESS_TOKEN);
    const navigate = useNavigate();
     const BASE_URL = import.meta.env.VITE_users_API_URL;



      useEffect(() => {
            const fetchUnreadNotifications = async () => {
                try {
                    const response = await fetch(`${BASE_URL}/users/notifications/`, {
                        method: 'GET',
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            'Content-Type': 'application/json',
                        },
                    });
                    if (!response.ok) {
                        if (response.status === 401) {
                            toast.error('Unauthorized. Please log in.', { position: 'top-right' });
                            navigate('/logout');
                            return;
                        }
                        throw new Error('Failed to fetch notifications');
                    }
                    const data = await response.json();
                    const unread = data.filter(notif => !notif.is_read).length;
                    
                    setUnreadCount(unread);
                } catch (error) {
                    console.log('Failed to fetch notifications', error ,  { position: 'top-right' });
                }
            };
    
            if (accessToken && user) {
                fetchUnreadNotifications();
            }
        }, [accessToken, user, navigate]);
    
    
console.log(unreadCount);
    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
        document.body.classList.toggle('dark', !isDarkMode);
    };

    return (
      <aside className="bg-white text-gray-700 md:w-1/4 p-4 md:mt-16 mt-2 min-h-screen p-4 flex flex-col md:fixed top-0 left-0 border-r-2 border-customGray sidebar admin-sidebar">        <button
                    className="absolute top-4 right-4 text-blue-600 hover:text-blue-800 md:hidden transition-colors duration-300"
                    onClick={toggleSidebar}
                >
                    <FontAwesomeIcon icon={faTimes} size="lg" />
                </button>

                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                    Quick Links
                </h2>

                <nav className="mt-4 space-y-2">
                    <Link to="/admindashboard" state={{user, profile}} className="flex items-center p-4 rounded-lg shadow-md border-l-4 border-blue-600 bg-transparent hover:bg-black hover:bg-opacity-50  transition-transform transform hover:scale-10 " onClick={toggleSidebar}>
                        <FontAwesomeIcon icon={faTachometerAlt} size="lg" />
                        <span className="ml-3 font-medium text-base  ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}">Dashboard</span>
                    </Link>

                    <Link to="/manageusers" state={{user, profile}} className="flex items-center p-4 rounded-lg shadow-md border-l-4 border-blue-600 bg-transparent hover:bg-black hover:bg-opacity-50  transition-transform transform hover:scale-10 ">     <FontAwesomeIcon icon={faUsers} size="lg" />
                        <span className="ml-3 font-medium text-base ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}">Manage Users</span>
                    </Link>

                    <Link to="/admin-opportunities" state={{ user, profile }} className="flex items-center p-4 rounded-lg shadow-md border-l-4 border-blue-600 bg-transparent hover:bg-black hover:bg-opacity-50  transition-transform transform hover:scale-10 ">
                        <FontAwesomeIcon icon={faBriefcase} size="lg" />
                        <span className="ml-3 font-medium text-base ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}">Manage Opportunities</span>
                    </Link>
                    
                                            <Link to="/admin-notifications" state={{ user, profile }} className="flex items-center p-4 rounded-lg shadow-md border-l-4 border-blue-600 bg-transparent hover:bg-black hover:bg-opacity-50  transition-transform transform hover:scale-10 ">
                             <FontAwesomeIcon icon={faBell} size="lg"  />
                                            <span className="ml-3 font-medium text-base ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}">Notifications</span>    
                                                {unreadCount > 0 && (
                                                    <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                                        {unreadCount}
                                                    </span>
                                                )}
                                            </Link>
                                      

                    <Link to="/events" state={{user, profile}} className="flex items-center p-4 rounded-lg shadow-md border-l-4 border-blue-600 bg-transparent hover:bg-black hover:bg-opacity-50  transition-transform transform hover:scale-10 ">
                        <FontAwesomeIcon icon={faCalendarAlt} size="lg" />
                        <span className="ml-3 font-medium text-base ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}">Manage Events</span>
                    </Link>

                   

                    <Link to="/feedback-list" state={{user , profile}} className="flex items-center p-4 rounded-lg shadow-md border-l-4 border-blue-600 bg-transparent hover:bg-black hover:bg-opacity-50  transition-transform transform hover:scale-10 ">
                        <FontAwesomeIcon icon={faMessage} size="lg" />
                        <span className="ml-3 font-medium text-base ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}">User Feedback</span>
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

        </aside>
    );
};

export default Sidebar;