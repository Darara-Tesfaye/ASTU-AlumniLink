import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { ACCESS_TOKEN } from '../../constants';

const MentorSearch = () => {
    const location = useLocation();
    const { user, profile } = location.state || {};
    const [searchTerm, setSearchTerm] = useState('');
    const [mentors, setMentors] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [connectionStatuses, setConnectionStatuses] = useState({});
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const BASE_URL = import.meta.env.VITE_users_API_URL;
    const department = profile?.department;
    const accessToken = localStorage.getItem(ACCESS_TOKEN);

    const UserId = user.id;



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
                    HandleSearch(data);
                } catch (err) {
                    toast.error('Failed to fetch recommended users.');
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchRecommendations();
    }, [department, BASE_URL]);

    const fetchConnectionStatus = async (userId) => {
        console.log(`Fetching connection status for user ID: ${userId}`);
        try {
            const response = await axios.get(`${BASE_URL}/users/connections/status/`, {
                params: { requestee_id: userId },
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
    
            console.log('API Response for connection status:', response.data); // Add logging here
    
            if (response.data[userId]) {
                const fetchedStatus = response.data[userId];
                setConnectionStatuses(prev => ({
                    ...prev,
                    [userId]: {
                        status: fetchedStatus.status,
                        connectedUserId: fetchedStatus.connectedUserId || null,
                        acceptReject: fetchedStatus.acceptReject || false,
                        connectionId: fetchedStatus.connectionId,
                        requesterId: fetchedStatus.RequesterId
                    },
                }));
            } else {
                console.warn(`No connection status found for user ID: ${userId}`); // Log a warning if not found
            }
        } catch (error) {
            console.error('Error fetching connection status:', error.message, {
                userId,
                status: error.response?.status,
                data: error.response?.data
            });
        }
    };
    useEffect(() => {
        searchResults.forEach(mentor => {
            if (mentor.id) {
                fetchConnectionStatus(mentor.id);
            }
        });
    }, [searchResults]);

    console.log("Connection Status",  connectionStatuses);

    const sendConnectionRequest = async (requesteeId) => {
        try {
            console.log(`Bearer ${accessToken}`);
            await axios.post(`${BASE_URL}/users/connections/`, {
                requestee_id: requesteeId,
            }, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            toast.success('Connection request sent successfully.');
            fetchConnectionStatus(requesteeId);
        } catch (error) {
            console.error('Error sending connection request:', error);
            toast.error('Failed to send connection request. Please try again.');
        }
    };
    const acceptConnection = async (connectionId) => {
        console.log(`Trying to accept connection with ID: ${connectionId}`); // Debug log

        try {
            await axios.post(`${BASE_URL}/users/connections/${connectionId}/accept/`, {}, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });

            toast.success('Connection accepted successfully.');
            fetchConnectionStatus(connectionId);
        } catch (error) {
            console.error('Error accepting connection:', error.response); // Better logging
            toast.error('Failed to accept connection. Please try again.');
        }
    };

    const rejectConnection = async (connectionId) => {
        try {
            await axios.post(`${BASE_URL}/users/connections/${connectionId}/reject/`, {}, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });

            toast.success('Connection rejected successfully.');
            fetchConnectionStatus(connectionId); // Refresh the connection status after rejection
        } catch (error) {
            console.error('Error rejecting connection:', error.response);
            toast.error('Failed to reject connection. Please try again.');
        }
    };


    const cancelRejectRequest = async (connectionId) => {
        try {
            await axios.post(`${BASE_URL}/users/connections/cancel-reject/${connectionId}/`, {}, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });

            toast.success('Rejection cancelled, connection is now pending.');
            fetchConnectionStatus(connectionId);
        } catch (error) {
            console.error('Error Cancel rejecting connection:', error.response);
            toast.error('Failed to Cancel reject connection. Please try again.');
        }


    };
    // const HandleSearch = (results) => {
    //     setSearchResults(results);
    // };
    const HandleSearch = (results) => {
        setSearchResults(results);
        results.forEach(mentor => {
            if (mentor.id) {
                fetchConnectionStatus(mentor.id); // Fetch status immediately after setting.
            }
        });
    };
    // const handleSearch = async () => {
    //     setLoading(true);
       

       

    //     if (!searchTerm.trim()) {
    //         toast.error('Please enter a name to search for.');
    //         setLoading(false);
    //         return;
    //     }
    //     console.log('Filters:', {
    //         searchTerm,
    //         departmentFilter,
    //         department,
    //     });

    //     try {
    //         const filterParam = departmentFilter === 'department' ? `&department=${encodeURIComponent(department)}` : '';
    //         const response = await fetch(`${BASE_URL}/users/search-mentor/?name=${encodeURIComponent(searchTerm)}${filterParam}`);
    //         if (!response.ok) {
    //             throw new Error('Failed to fetch search results');
    //         }
    //         const data = await response.json();
    //         setMentors(data);
    //     } catch (err) {
    //         toast.error('An error occurred while searching for mentors.');
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const handleSearch = async () => {
        setLoading(true);
        
        if (!searchTerm.trim()) {
            toast.error('Please enter a name to search for.');
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
            setMentors(data);
    
            // Call HandleSearch here to process the search results
            HandleSearch(data); // Pass the fetched data to HandleSearch
    
        } catch (err) {
            toast.error('An error occurred while searching for mentors.');
        } finally {
            setLoading(false);
        }
    };

    return (

        <div className="p-6">
            <ToastContainer />

            <h1 className="text-2xl font-bold mb-4">Mentor Search</h1>

            <div className="mb-4 flex items-center">
                <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="border rounded p-2 mr-2 mentor_search w-1/3 sm:w-1/6"
                >
                    <option value="all">All Mentors</option>
                    <option value="department">From Your Department</option>
                </select>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Enter mentor's name"
                    className="border rounded p-2 mr-2 w-1/3 mentor_search"
                />
                <button
                    onClick={handleSearch}
                    className="bg-blue-500 text-white rounded p-2 hover:bg-blue-600"
                >
                    Search
                </button>
            </div>

            {loading && <p>Loading...</p>}
           
            <h2 className="text-xl mt-6">Search Results</h2>
            {mentors.length > 0 ? (
                <table className="min-w-full border-collapse border border-gray-300 mt-2">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border border-gray-300 p-2 mentor_search">#</th>
                            <th className="border border-gray-300 p-2 mentor_search">Full Name</th>
                            <th className="border border-gray-300 p-2 mentor_search">Email</th>
                            <th className="border border-gray-300 p-2 mentor_search">User Type</th>
                            <th className="border border-gray-300 p-2 mentor_search">Department</th>
                            <th className="border border-gray-300 p-2 mentor_search">Professional Field</th>
                            <th className="border border-gray-300 p-2 mentor_search">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mentors.map((mentor, index) => (
                            <tr key={mentor.id} className="hover:bg-gray-100 mentor_search_tr">
                                <td className="border border-gray-300 p-2">{index + 1}</td>
                                <td className="border border-gray-300 p-2">{mentor.full_name}</td>
                                <td className="border border-gray-300 p-2">{mentor.email}</td>
                                <td className="border border-gray-300 p-2">{mentor.alumni_profile?.user.usertype || mentor.staff_profile?.user.usertype}</td>
                                <td className="border border-gray-300 p-2">{mentor.staff_profile?.department || mentor.alumni_profile?.field_of_study}</td>
                                <td className="border border-gray-300 p-2">{mentor.alumni_profile?.professional_field || mentor.staff_profile?.expertise}</td>
                                <td className="border px-4 py-2">
                                    {connectionStatuses[mentor.id] ? (
                                        connectionStatuses[mentor.id].acceptReject ? (
                                            <>
                                                <button
                                                    className="bg-green-500 text-white px-4 py-2 rounded"
                                                    onClick={() => acceptConnection(connectionStatuses[mentor.id].connectionId)} // Pass the connectionId for the specific user
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    className="bg-red-500 text-white px-4 py-2 rounded ml-2"
                                                    onClick={() => rejectConnection(connectionStatuses[mentor.id].connectionId, connectionStatuses[user.id].RequesterId)} // Pass in the RequesterId
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        ) : connectionStatuses[mentor.id].status === 'pending' ? (
                                            <button className="bg-gray-400 text-white px-4 py-2 rounded" disabled>
                                                Request Pending
                                            </button>
                                        ) : connectionStatuses[mentor.id].status === 'accepted' ? (
                                            <button className="bg-green-500 text-white px-4 py-2 rounded">
                                                Connected
                                            </button>
                                        )
                                             : connectionStatuses[mentor.id].status === 'rejected' ? (
                                                connectionStatuses[mentor.id].requesterId === UserId ? (
                                                    <button
                                                        className="bg-blue-600 text-white px-4 py-2 rounded"
                                                        onClick={() => cancelRejectRequest(connectionStatuses[user.id].connectionId)}
                                                    >
                                                        Cancel Reject
                                                    </button>
                                                ) : (
                                                    <button className="bg-red-500 text-white px-4 py-2 rounded">
                                                        Rejected
                                                    </button>
                                                )
                                            ) 
                                            :
                                            (
                                                <button
                                                    className="bg-blue-600 text-white px-4 py-2 rounded"
                                                    onClick={() => sendConnectionRequest(mentor.id)} // Function to send a connection request
                                                >
                                                    Connect
                                                </button>
                                            )
                                    ) : (
                                        <button
                                            className="bg-blue-600 text-white px-4 py-2 rounded"
                                            onClick={() => sendConnectionRequest(mentor.id)} // Function to send a connection request
                                        >
                                            Connect
                                        </button>
                                    )}
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
                            <th className="border border-gray-300 p-2 mentor_search">#</th>
                            <th className="border border-gray-300 p-2 mentor_search">Full Name</th>
                            <th className="border border-gray-300 p-2 mentor_search">Email</th>
                            <th className="border border-gray-300 p-2 mentor_search">User Type</th>
                            <th className="border border-gray-300 p-2 mentor_search">Department</th>
                            <th className="border border-gray-300 p-2 mentor_search">Professional Field</th>

                            <th className="border border-gray-300 p-2 mentor_search">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recommendations.map((mentor, index) => (
                            <tr key={mentor.id} className="hover:bg-gray-100 mentor_search_tr">
                                <td className="border border-gray-300 p-2">{index + 1}</td>
                                <td className="border border-gray-300 p-2">{mentor.alumni_profile?.user.full_name || mentor.staff_profile.user.full_name}</td>
                                <td className="border border-gray-300 p-2">{mentor.email}</td>
                                <td className="border border-gray-300 p-2">{mentor.alumni_profile?.user.usertype || mentor.staff_profile?.user.usertype}</td>
                                <td className="border border-gray-300 p-2">{mentor.staff_profile?.department || mentor.alumni_profile?.field_of_study}</td>
                                <td className="border border-gray-300 p-2">{mentor.alumni_profile?.professional_field || mentor.staff_profile?.expertise}</td>

                                <td className="border px-4 py-2">
                                    {connectionStatuses[mentor.id] ? (
                                        connectionStatuses[mentor.id].acceptReject ? (
                                            <>
                                                <button
                                                    className="bg-green-500 text-white px-4 py-2 rounded"
                                                    onClick={() => acceptConnection(connectionStatuses[mentor.id].connectionId)} // Pass the connectionId for the specific user
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    className="bg-red-500 text-white px-4 py-2 rounded ml-2"
                                                    onClick={() => rejectConnection(connectionStatuses[mentor.id].connectionId, connectionStatuses[user.id].RequesterId)} // Pass in the RequesterId
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        ) : connectionStatuses[mentor.id].status === 'pending' ? (
                                            <button className="bg-gray-400 text-white px-4 py-2 rounded" disabled>
                                                Request Pending
                                            </button>
                                        ) : connectionStatuses[mentor.id].status === 'accepted' ? (
                                            <button className="bg-green-500 text-white px-4 py-2 rounded">
                                                Connected
                                            </button>
                                        )
                                             : connectionStatuses[mentor.id].status === 'rejected' ? (
                                                connectionStatuses[mentor.id].requesterId === UserId ? (
                                                    <button
                                                        className="bg-blue-600 text-white px-4 py-2 rounded"
                                                        onClick={() => cancelRejectRequest(connectionStatuses[user.id].connectionId)}
                                                    >
                                                        Cancel Reject
                                                    </button>
                                                ) : (
                                                    <button className="bg-red-500 text-white px-4 py-2 rounded">
                                                        Rejected
                                                    </button>
                                                )
                                            ) 
                                            :
                                            (
                                                <button
                                                    className="bg-blue-600 text-white px-4 py-2 rounded"
                                                    onClick={() => sendConnectionRequest(mentor.id)} // Function to send a connection request
                                                >
                                                    Connect
                                                </button>
                                            )
                                    ) : (
                                        <button
                                            className="bg-blue-600 text-white px-4 py-2 rounded"
                                            onClick={() => sendConnectionRequest(mentor.id)} // Function to send a connection request
                                        >
                                            Connect
                                        </button>
                                    )}
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