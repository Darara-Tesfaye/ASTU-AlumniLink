// import React from 'react';
// import { Link } from 'react-router-dom';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faUserCircle, faBell, faCog, faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
// import { useState } from 'react';
// import { useLocation } from 'react-router-dom'
// const Header = () => {
//     const [isDarkMode, setIsDarkMode] = useState(false);
//     const location = useLocation();
//     const { user } = location.state || {};
//     const toggleTheme = () => {
//         setIsDarkMode(!isDarkMode);
//         document.body.classList.toggle('dark', !isDarkMode);
//     };
//     return (
//         <header className="bg-gray-800 text-white flex justify-between items-center p-4">
//             <div className="flex items-center">
//                 <h1 className="text-xl font-bold">Dashboard</h1>
//             </div>
//             <div>
//                 <a href='#' className="transition duration-300 font-bold    hover:text-blue-800">
//                     Home</a>

//             </div>
//             <div className="flex items-center space-x-4">
//                 <Link to="/notifications">
//                     <FontAwesomeIcon icon={faBell} className="text-xl" />
//                 </Link>
//                 <Link to="/settings">
//                     <FontAwesomeIcon icon={faCog} className="text-xl" />
//                 </Link>
//                 <Link to="/profile" className='flex gap-2 justify-center items-center'>
//                     <FontAwesomeIcon icon={faUserCircle} className="text-xl" />
//                     <p className='display-inline'>{user.full_name}</p>
//                 </Link>

//                 <button
//                     onClick={toggleTheme}
//                     className="py-2 px-3 h-10 md:w-1/3 lg:w-1/4 w-1/2 border rounded-md bg-transparent dark:bg-gray-800 text-neutral-1000 dark:text-blue transition duration-300 float-right"
//                 >
//                     <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} className="mr-2" />
//                     {isDarkMode ? '' : ''}
//                 </button>
//             </div>
//             <button className="md:hidden">Menu</button>
//         </header>
//     );
// };

// export default Header;

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
                <h1 className="text-xl font-bold ml-2 hidden sm:block">ASTU AlumniLink | User Dashboard</h1>
                <h1 className="text-xl font-bold ml-2 block sm:hidden">Dashboard</h1>

            </div>
            <div className="flex items-center space-x-4 ">
                <Link to="/profile" className='flex gap-2'>
                    <FontAwesomeIcon icon={faUserCircle} className="text-xl" />
                    <p className='hidden md:block'>{user.full_name}</p>
                </Link>

            </div>
        </header>
    );
};

export default Header;