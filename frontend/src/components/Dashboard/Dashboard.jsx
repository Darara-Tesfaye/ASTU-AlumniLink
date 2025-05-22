import React, { useState, useEffect } from 'react';
import UserSearch from '../User_Search';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { ACCESS_TOKEN } from '../../constants';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import StudentDashboard from './StudentDashboard';
import AlumniDashboard from './AlumniDashboard';
import FacultyDashboard from './FacultyDashboard';
import CompanyDashboard from './CompanyDashboard';

const Dashboard = () => {
    const location = useLocation();
    const { user , profile } = location.state || {};
    const accessToken = localStorage.getItem(ACCESS_TOKEN);
    const BASE_URL = import.meta.env.VITE_users_API_URL;
     const usertype = user.usertype;  

    const [connectionStatuses, setConnectionStatuses] = useState({});
    const [searchResults, setSearchResults] = useState([]);
    const [message, setMessage] = useState('');

    const handleSearch = (results) => {
        setSearchResults(results);
    };



    const UserId =user.id;
    const fetchConnectionStatus = async (userId) => {
        try {
            const response = await axios.get(`${BASE_URL}/users/connections/status/`, {
                params: { requestee_id: userId },
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });

            

            setConnectionStatuses(prev => {
                const newStatuses = {
                    ...prev,
                    [userId]: {
                        status: response.data[userId].status,
                        connectedUserId: response.data[userId].connectedUserId || null,  
                        acceptReject: response.data[userId].acceptReject || false,  
                        connectionId: response.data[userId].connectionId,
                        requesterId: response.data[userId].RequesterId
                    }
                };
               


                return newStatuses;
            });
        } catch (error) {
            console.error('Error fetching connection status:', error.message, {
                userId,
                status: error.response?.status,
                data: error.response?.data
            });
        }
    };


    const sendConnectionRequest = async (requesteeId) => {
       
        try {
            await axios.post(`${BASE_URL}/users/connections/`, {
                requestee_id: requesteeId,
            }, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });            

            toast.success('Connection request sent successfully.');
            fetchConnectionStatus(requesteeId);
        } catch (error) {
            console.error('Error sending connection request:', error);
            
            toast.error( error.response?.data?.error || 'Failed to send connection request. Please try again.');
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


    const cancelRejectRequest =async (connectionId) => {
        try{
            await axios.post(`${BASE_URL}/users/connections/cancel-reject/${connectionId}/`, {}, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });

            toast.success('Rejection cancelled, connection is now pending.');
            fetchConnectionStatus(connectionId);
        }catch (error) {
            console.error('Error Cancel rejecting connection:', error.response);
            toast.error('Failed to Cancel reject connection. Please try again.');
        }
       
          
        };
        
   
    useEffect(() => {
        searchResults.forEach(user => {
            if (user.id) {
                fetchConnectionStatus(user.id);
            }
        });
    }, [searchResults]);

    return (
        <div>
            <ToastContainer />

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
                                        {connectionStatuses[user.id] ? (
                                            connectionStatuses[user.id].acceptReject ? (
                                                <>
                                                    <button
                                                        className="bg-green-500 text-white px-4 py-2 rounded"
                                                        onClick={() => acceptConnection(connectionStatuses[user.id].connectionId)} // Pass the connectionId for the specific user
                                                    >
                                                        Accept
                                                    </button>
                                                    <button
                                                        className="bg-red-500 text-white px-4 py-2 rounded ml-2"
                                                        onClick={() => rejectConnection(connectionStatuses[user.id].connectionId, connectionStatuses[user.id].RequesterId)} // Pass in the RequesterId
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            ) : connectionStatuses[user.id].status === 'pending' ? (
                                                <button className="bg-gray-400 text-white px-4 py-2 rounded" disabled>
                                                    Request Pending
                                                </button>
                                            ) : connectionStatuses[user.id].status === 'accepted' ? (
                                                <button className="bg-green-500 text-white px-4 py-2 rounded">
                                                    Connected
                                                </button>
                                            ) : connectionStatuses[user.id].status === 'rejected' ? (
                                                connectionStatuses[user.id].requesterId === UserId? (
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
                                            ) : (
                                                <button
                                                    className="bg-blue-600 text-white px-4 py-2 rounded"
                                                    onClick={() => sendConnectionRequest(user.id)} // Function to send a connection request
                                                >
                                                    Connect
                                                </button>
                                            )
                                        ) : (
                                            <button
                                                className="bg-blue-600 text-white px-4 py-2 rounded"
                                                onClick={() => sendConnectionRequest(user.id)} // Function to send a connection request
                                            >
                                                Connect
                                            </button>
                                        )}
                                    </td>


                                </tr>
                            ))}
                        </tbody>

                    </table>
                </div>
            )}
                    {usertype === 'student' && <StudentDashboard />}
            {usertype === 'Alumni' && <AlumniDashboard />}
            {usertype === 'staff' && <FacultyDashboard />}
            {usertype === 'company' && <CompanyDashboard />}
        </div>
    );
};

export default Dashboard;