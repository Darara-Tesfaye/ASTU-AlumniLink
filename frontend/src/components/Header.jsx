import React from 'react';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user } = useAuth(); // Get user data from context

  return (
    <header className="bg-gray-800 text-white p-4 flex flex-col md:flex-row justify-between items-center">
      <div className="flex items-center mb-4 md:mb-0">
        <h1 className="text-2xl font-bold">ASTU Alumni</h1>
        <nav className="ml-6">
          <ul className="flex space-x-4">
            <li><a href="#" className="hover:underline">Home</a></li>
            <li><a href="#" className="hover:underline">Friends</a></li>
            <li><a href="#" className="hover:underline">Messages</a></li>
            <li><a href="#" className="hover:underline">Notifications</a></li>
          </ul>
        </nav>
      </div>

      <div className="flex items-center">
        <input
          type="text"
          placeholder="Search..."
          className="px-4 py-2 rounded-md bg-gray-700 placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-500"
        />
        
        {user && (
          <div className="flex items-center ml-4">
            <span className="mr-2">{user.name}</span>
            <img
              src={user.photoUrl} // Assume user has a photoUrl property
              alt="User"
              className="w-10 h-10 rounded-full border-2 border-white"
            />
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;