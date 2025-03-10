import React, { useState } from 'react';
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

            {searchResults.length > 0 && (
                <div className="mt-4">
                    <h2>Search Results:</h2>
                    <table className="min-w-full border">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="border px-4 py-2">Full Name</th>
                                <th className="border px-4 py-2">Email</th>
                                <th className="border px-4 py-2">User Type</th>
                                <th className="border px-4 py-2">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {searchResults.map(user => (
                                <tr key={user.email}>
                                    <td className="border px-4 py-2">{user.full_name}</td>
                                    <td className="border px-4 py-2">{user.email}</td>
                                    <td className="border px-4 py-2">{user.usertype}</td>
                                    <td className="border px-4 py-2">
                                        <button className="bg-blue-600 text-white px-4 py-2 rounded">
                                            Connect
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {usertype === 'student' && <StudentDashboard />}
            {usertype === 'Alumni' && <AlumniDashboard />}
            {usertype === 'faculty' && <FacultyDashboard />}
            {usertype === 'company' && <CompanyDashboard />}

            {/* Handle unrecognized user types */}
            {!['student', 'Alumni', 'faculty', 'company'].includes(usertype) && (
                <p>Unrecognized user type. Please contact support.</p>
            )}
        </div>
    );
};

export default Dashboard;