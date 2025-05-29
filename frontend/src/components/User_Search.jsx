import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch} from '@fortawesome/free-solid-svg-icons';

import { ACCESS_TOKEN } from '../constants'

const UserSearch = ({ onSearch }) => {
    const [searchType, setSearchType] = useState('student');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchUsers = async (searchTerm, searchType) => {
        const BASE_URL = import.meta.env.VITE_users_API_URL;
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${BASE_URL}/users/search/?search=${searchTerm}&type=${searchType}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
                },
            });
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('No users found');
                }
                throw new Error('Network response was not ok');
            }
            const result = await response.json();
            if (result.length === 0) {
                setError('No users found');
            } else {
                onSearch(result);
            }
        } catch (error) {
            setError('Error fetching data: ' + error.message);
        } finally {
            setLoading(false);
        }

    };

    const handleSearch = () => {
        setLoading(true);
        setError('');
        if (!searchTerm.trim()) {
            setError('Please enter a name to search for.');
            setLoading(false);
            return;
        }
        fetchUsers(searchTerm, searchType);
     
    };

    return (
        <div className="flex flex-col mb-4 items-end user_search">
            <div className="flex  space-x-2">
                <div className='border rounded flex br-2 '>
                <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                    className="p-2 border rounded border-r-0 bg-transparent"
                >   <option value="all">All</option>              
                    <option value="Alumni">Alumni</option>
                    <option value="staff">Faculty</option>
                    <option value="student">Student</option>
                    <option value="company">Company</option>
                </select>
                <div className="flex-1 relative">
                
                <FontAwesomeIcon icon={faSearch} className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />                
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder='Search here ...'
                    className="p-2 pl-10 border rounded  
                 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-transparent"
                />
                </div>
                </div>
                <button
                    onClick={handleSearch}
                    className="p-2 bg-blue-600 text-white rounded"
                    disabled={loading} 
                >
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </div>
            {error && <p className="text-red-500 mt-2">{error}</p>} 

        </div>
    );
};


export default UserSearch;