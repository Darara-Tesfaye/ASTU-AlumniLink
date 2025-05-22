import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faBell, faCog, faBars } from '@fortawesome/free-solid-svg-icons';
import { useLocation } from 'react-router-dom';

const Header = ({ toggleSidebar }) => {
    const location = useLocation();
    const { user } = location.state || {};
    return (
        <header className="bg-white text-black flex justify-between items-center p-4 border-b-2 border-customGray sidebar">
            <div className="flex items-center">
                <button onClick={toggleSidebar} className="md:hidden">
                    <FontAwesomeIcon icon={faBars} className="text-xl" />
                </button>
                <h1 className="text-xl font-bold ml-2 hidden sm:block">ASTU AlumniLink | <span>{user.usertype}</span> Dashboard</h1>
                <h1 className="text-xl font-bold ml-2 block sm:hidden">Dashboard</h1>

            </div>
            <div className="flex items-center space-x-4 ">
                <Link to="/profile" state={{ user }} className='flex gap-2'>
                    <FontAwesomeIcon icon={faUserCircle} className="text-xl" />
                    <p className='hidden md:block'>{user.full_name}</p>
                </Link>

            </div>
        </header>
    );
};

export default Header;