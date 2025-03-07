
import React from 'react';
import { useState } from 'react';

import StudentDashboard from './StudentDashboard';
import AlumniDashboard from './AlumniDashboard';
import FacultyDashboard from './FacultyDashboard';
import CompanyDashboard from './CompanyDashboard';

import UserSearch from '../User_Search';
import { useLocation } from 'react-router-dom';

const Dashboard = () => {

    const location = useLocation();
    const { user } = location.state || {};
    const usertype = user.usertype;
    
    const [searchResults, setSearchResults] = useState([]);
    const handleSearch = (results) => {
        setSearchResults(results);
    };

    return (
        <div>
            <UserSearch onSearch={handleSearch} />

            {/* Display search results if available */}
            {searchResults.length > 0 && (
                <div className="mt-4">
                    <h2>Search Results:</h2>
                    <ul>
                        {searchResults.map(user => (
                            <li key={user.email}>
                                {user.full_name} - {user.email} ({user.usertype})
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            <h1>Welcome to the Dashboard {user.full_name}</h1>
            <h1>usertype: {user.usertype}</h1>
            


            {usertype === 'student' && <StudentDashboard />}
            {usertype === 'Alumni' && <AlumniDashboard />}
            {usertype === 'faculty' && <FacultyDashboard />}
            {usertype === 'company' && <CompanyDashboard />}

            {/* You can add a default case or a message for unrecognized user types */}
            {!['student', 'Alumni', 'faculty', 'company'].includes(usertype) && (
                <p>Unrecognized user type. Please contact support.</p>
            )}
        </div>
    );



};

export default Dashboard;