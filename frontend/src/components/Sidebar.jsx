import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTachometerAlt, faBook, faBriefcase, faUsers, faSignOutAlt, faCog, faBell, faSun, faMoon, faHandsHelping, faLongArrowAltRight, faBullhorn, faStream, faPersonRifle, faPersonDress, faPerson, faUserAlt, faPaw } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import UserSearch from './User_Search';
import { useLocation } from 'react-router-dom';
import { ACCESS_TOKEN } from '../constants';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
    const location = useLocation();
    const { user, profile } = location.state || {};
    const usertype = user.usertype;
    const accessToken = localStorage.getItem(ACCESS_TOKEN);
    const navigate = useNavigate();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
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


    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
        document.body.classList.toggle('dark', !isDarkMode);
    };
    return (
        <aside className="bg-white text-gray-700 w-64 min-h-screen p-4 flex flex-col border-r-2 border-customGray sidebar">
            <nav>
                <ul className="space-y-2">

                    <li>
                        <Link to="/dashboard" state={{ user, profile }} className="flex items-center p-2 hover:bg-gray-600 rounded">
                            <FontAwesomeIcon icon={faTachometerAlt} className="mr-2" />
                            Dashboard
                        </Link>
                    </li>
                    <li>
                        <Link to="/profile" state={{ user, profile }} className="flex items-center p-2 hover:bg-gray-600 rounded">
                            <FontAwesomeIcon icon={faUserAlt} className="mr-2" />
                            Your Profile
                        </Link>
                    </li>
                    {usertype === 'student' && (
                        <>
                            <li>
                                <Link to="/find-mentor" state={{ user, profile }} className="flex items-center p-2 hover:bg-gray-600 rounded">
                                    <FontAwesomeIcon icon={faHandsHelping} className="mr-2" />
                                    Find a Mentor
                                </Link>
                            </li>
                            <li>
                                <Link to="/internship-opportunity" state={{ user, profile }} className="flex items-center p-2 hover:bg-gray-600 rounded">
                                    <FontAwesomeIcon icon={faBriefcase} className="mr-2" />
                                    Browse Internship
                                </Link>
                            </li>
                            <li>
                                <Link to="/access-resource" state={{ user, profile }} className="flex items-center p-2 hover:bg-gray-600 rounded">
                                    <FontAwesomeIcon icon={faBook} className="mr-2" />
                                    Access Resources
                                </Link>
                            </li>

                        </>
                    )}
                    {usertype === 'Alumni' && (
                        <>

                            <li>
                                <Link to="/job-opportunity" state={{ user, profile }} className="flex items-center p-2 hover:bg-gray-600 rounded">
                                    <FontAwesomeIcon icon={faBriefcase} className="mr-2" />
                                    Browse  Job
                                </Link>
                            </li>
                            <li>
                                <Link to="/event_list" state={{user, profile}} className="flex items-center p-2 hover:bg-gray-600 rounded">
                                    <FontAwesomeIcon icon={faBriefcase} className="mr-2" />
                                    Events
                                    </Link>
                            </li>
                        </>
                    )}
                    {usertype === 'staff' && (
                        <>
                            <li>
                                <Link to="/resource-share" state={{ user, profile }} className="flex items-center p-2 hover:bg-gray-600 rounded">
                                    <FontAwesomeIcon icon={faBook} className="mr-2" />
                                    Share Resources
                                </Link>
                            </li>

                        </>
                    )}

                    {usertype === 'company' && (
                        <>
                            <li>
                                <Link to="/create-event" state={{ user, profile }} className="flex items-center p-2 hover:bg-gray-600 rounded">
                                    <FontAwesomeIcon icon={faBriefcase} className="mr-2" />
                                    Manage Events
                                </Link>
                            </li>

                            <li>
                                <Link to="/manage-opportunity" state={{ user, profile }} className="flex items-center p-2 hover:bg-gray-600 rounded">
                                    <FontAwesomeIcon icon={faBullhorn} className="mr-2" />
                                    Manage Opportunity
                                </Link>
                            </li>


                        </>
                    )}
                    <li>
                        <Link to="/friendlist" state={{ user, profile }} className="flex items-center p-2 hover:bg-gray-600 rounded">
                            <FontAwesomeIcon icon={faPaw} className="mr-2" />
                            Contact your Friend
                        </Link>
                    </li>

                    <li>
                        <Link to="/notifications" state={{ user, profile }} className="flex items-center p-2 hover:bg-gray-600 rounded">
                            <FontAwesomeIcon icon={faBell} className="mr-2" />
                            Notifications
                            {unreadCount > 0 && (
                                <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                    {unreadCount}
                                </span>
                            )}
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