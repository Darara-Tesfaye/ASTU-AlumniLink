import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const MentorSearch = () => {
    const location = useLocation();
    const { user, profile } = location.state || {};
    const [searchTerm, setSearchTerm] = useState('');
    const [mentors, setMentors] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const BASE_URL = import.meta.env.VITE_users_API_URL;
    const department = profile?.department;

    useEffect(() => {
        const fetchRecommendations = async () => {
            if (department) {
                setLoading(true);
                try {
                    const encodedDepartment = encodeURIComponent(department);
                    const response = await fetch(`${BASE_URL}/users/search-mentor/?department=${encodedDepartment}`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch recommendations');
                    }
                    const data = await response.json();
                    setRecommendations(data);
                } catch (err) {
                    setError('Failed to fetch recommended users.');
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchRecommendations();
    }, [department, BASE_URL]);

    const handleSearch = async () => {
        setLoading(true);
        setError('');

        if (!searchTerm.trim()) {
            setError('Please enter a name to search for.');
            setLoading(false);
            return;
        }
        console.log('Filters:', {
            searchTerm,
            departmentFilter,
            department,
        });

        try {
            const filterParam = departmentFilter === 'department' ? `&department=${encodeURIComponent(department)}` : '';
            const response = await fetch(`${BASE_URL}/users/search-mentor/?name=${encodeURIComponent(searchTerm)}${filterParam}`);
            if (!response.ok) {
                throw new Error('Failed to fetch search results');
            }
            const data = await response.json();
            console.log(data);
            setMentors(data);
        } catch (err) {
            setError('An error occurred while searching for mentors.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Mentor Search</h1>
      
            <div className="mb-4 flex items-center">
                <select 
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="border rounded p-2 mr-2"
                >
                    <option value="all">All Mentors</option>
                    <option value="department">From Your Department</option>
                </select>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Enter mentor's name"
                    className="border rounded p-2 mr-2 w-1/3"
                />
                <button 
                    onClick={handleSearch} 
                    className="bg-blue-500 text-white rounded p-2 hover:bg-blue-600"
                >
                    Search
                </button>
            </div>

            {loading && <p>Loading...</p>}
            {error && <p className="text-red-500">{error}</p>}

            <h2 className="text-xl mt-6">Search Results</h2>
            {mentors.length > 0 ? (
                <table className="min-w-full border-collapse border border-gray-300 mt-2">
                    <thead>
                        <tr className="bg-gray-200">
                        <th className="border border-gray-300 p-2">#</th>
                            <th className="border border-gray-300 p-2">Full Name</th>
                            <th className="border border-gray-300 p-2">Email</th>
                            <th className="border border-gray-300 p-2">User Type</th>
                            <th className="border border-gray-300 p-2">Department</th>
                            <th className="border border-gray-300 p-2">Professional Field</th>                       
                            <th className="border border-gray-300 p-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mentors.map((mentor, index) => (
                            <tr key={mentor.id} className="hover:bg-gray-100">
                                <td className="border border-gray-300 p-2">{index + 1}</td>
                                <td className="border border-gray-300 p-2">{mentor.full_name || mentor.email}</td>
                                <td className="border border-gray-300 p-2">{mentor.email}</td>
                                <td className="border border-gray-300 p-2">{mentor.alumni_profile?.user.usertype || mentor.staff_profile?.user.usertype}</td>
                                <td className="border border-gray-300 p-2">{mentor.staff_profile?.department || mentor.alumni_profile?.field_of_study}</td>
                                <td className="border border-gray-300 p-2">{mentor.alumni_profile?.professional_field || mentor.staff_profile?.expertise}</td>
                                <td className="border border-gray-300 p-2">
                                    <button 
                                        className="bg-green-500 text-white rounded p-1 hover:bg-green-600"
                                            >
                                        Connect
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                !loading && <p>No mentors found.</p>
            )}

            <h2 className="text-xl mt-6">Recommended Mentors</h2>
            {recommendations.length > 0 ? (
                <table className="min-w-full border-collapse border border-gray-300 mt-2">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border border-gray-300 p-2">#</th>
                            <th className="border border-gray-300 p-2">Full Name</th>
                            <th className="border border-gray-300 p-2">Email</th>
                            <th className="border border-gray-300 p-2">User Type</th>
                            <th className="border border-gray-300 p-2">Department</th>
                            <th className="border border-gray-300 p-2">Professional Field</th>                         
                            
                            <th className="border border-gray-300 p-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recommendations.map((mentor, index) => (
                            <tr key={mentor.id} className="hover:bg-gray-100">
                                <td className="border border-gray-300 p-2">{index + 1}</td>
                                <td className="border border-gray-300 p-2">{mentor.full_name || mentor.email}</td>
                                <td className="border border-gray-300 p-2">{mentor.email}</td>
                                <td className="border border-gray-300 p-2">{mentor.alumni_profile?.user.usertype || mentor.staff_profile?.user.usertype}</td>
                                <td className="border border-gray-300 p-2">{mentor.staff_profile?.department || mentor.alumni_profile?.field_of_study}</td>
                                <td className="border border-gray-300 p-2">{mentor.alumni_profile?.professional_field || mentor.staff_profile?.expertise}</td>
                                
                                <td className="border border-gray-300 p-2">
                                    <button 
                                        className="bg-green-500 text-white rounded p-1 hover:bg-green-600"
                                        onClick={() => console.log(`Connect with ${mentor.full_name}`)}
                                    >
                                        Connect
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                !loading && <p>No recommended mentors available.</p>
            )}
        </div>
    );
};

export default MentorSearch;