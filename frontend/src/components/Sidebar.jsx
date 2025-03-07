// src/components/Sidebar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTachometerAlt, faBook, faBriefcase, faUsers, faSignOutAlt, faCog, faBell, faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';

const Sidebar = () => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
        document.body.classList.toggle('dark', !isDarkMode);
    };
    return (

        <aside className="bg-white text-gray-700 w-64 min-h-screen p-4 flex flex-col border-r-2 border-customGray sidebar">

            <nav>
                <ul className="space-y-2">
                    <li>
                        <Link to="/dashboard" className="flex items-center p-2 hover:bg-gray-600 rounded">
                            <FontAwesomeIcon icon={faTachometerAlt} className="mr-2" />
                            Dashboard
                        </Link>
                    </li>
                    <li>
                        <Link to="/courses" className="flex items-center p-2 hover:bg-gray-600 rounded">
                            <FontAwesomeIcon icon={faBook} className="mr-2" />
                            Courses
                        </Link>
                    </li>
                    <li>
                        <Link to="/projects" className="flex items-center p-2 hover:bg-gray-600 rounded">
                            <FontAwesomeIcon icon={faBriefcase} className="mr-2" />
                            Projects
                        </Link>
                    </li>
                    <li>
                        <Link to="/users" className="flex items-center p-2 hover:bg-gray-600 rounded">
                            <FontAwesomeIcon icon={faUsers} className="mr-2" />
                            Users
                        </Link>
                    </li>

                    <li>
                        <Link to="/notifications" className="flex items-center p-2 hover:bg-gray-600 rounded">
                            <FontAwesomeIcon icon={faBell} className="mr-2" />
                            Notifications
                        </Link>

                    </li>
                    <li>
                        <Link to="/settings" className="flex items-center p-2 hover:bg-gray-600 rounded">
                            <FontAwesomeIcon icon={faCog} className="mr-2" />
                            Settings
                        </Link>
                    </li>

                </ul>
            </nav>
            <div
                className="underline"
                style={{
                    marginTop: '10rem',
                    bottom: '-5px',
                    left: '0',
                    alignItems: 'center',
                    width: '80%',
                    color: '#f2f2f2',
                    borderBottom: '3px solid orange',
                    transform: 'translateX(0%)',
                }}
            ></div>
            <div className='mt-10'>
                <ul>
                    <li>
                        <Link to="/logout" className="flex items-center p-2 hover:bg-gray-600 rounded">
                            <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                            Logout
                        </Link>
                    </li>
                    <button
                        onClick={toggleTheme}
                        className="py-2 px-2 h-10 bg-transparent  transition duration-300 display-contents mt-2"
                    >
                        <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} className="mr-2" />
                        {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                    </button>
                </ul>
            </div>
        </aside>
    );
};

export default Sidebar;