import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ACCESS_TOKEN } from '../../constants';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UserSearch from '../User_Search';
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMessage, faUserPlus } from '@fortawesome/free-solid-svg-icons';

const FriendList = () => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const accessToken = localStorage.getItem(ACCESS_TOKEN);
  const BASE_URL = import.meta.env.VITE_users_API_URL;
  const [connectionStatuses, setConnectionStatuses] = useState({});
  const location = useLocation();
  const { user } = location.state || {};
  const UserId = user?.id;
  const navigate = useNavigate();

  const fetchConnections = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/users/list-connections/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch connections');
      }
      const data = await response.json();
      console.log('Fetched Connections:', data);
      setConnections(data);
      for (const connection of data) {
        const friendId =
          connection.requester.id === UserId
            ? connection.requestee.id
            : connection.requester.id;
        await fetchConnectionStatus(friendId);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [accessToken, BASE_URL, UserId]);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  useEffect(() => {
    const fetchStatuses = async () => {
      const searchUsers = searchResults.map((u) => ({ id: u.id }));
      for (const user of searchUsers) {
        if (!connectionStatuses[user.id]) {
          await fetchConnectionStatus(user.id);
        }
      }
    };
    fetchStatuses();
  }, [searchResults]);

  const fetchConnectionStatus = async (userId) => {
    try {
      const response = await axios.get(`${BASE_URL}/users/connections/status/`, {
        params: { requestee_id: userId },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const statusData = {
        status: response.data[userId]?.status || 'none',
        connectedUserId: response.data[userId]?.connectedUserId || null,
        acceptReject: response.data[userId]?.acceptReject || false,
        connectionId: response.data[userId]?.connectionId || null,
        requesterId: response.data[userId]?.RequesterId || null,
      };
      console.log(`Status for user ${userId}:`, statusData);
      setConnectionStatuses((prev) => ({
        ...prev,
        [userId]: statusData,
      }));
    } catch (error) {
      console.error('Error fetching connection status:', error.message, {
        userId,
        status: error.response?.status,
        data: error.response?.data,
      });
    }
  };

  const handleSearch = (results) => {
    setSearchResults(results);
  };

  const sendConnectionRequest = async (requesteeId) => {
    try {
      setConnectionStatuses((prev) => ({
        ...prev,
        [requesteeId]: { ...prev[requesteeId], status: 'pending' },
      }));
      await axios.post(
        `${BASE_URL}/users/connections/`,
        { requestee_id: requesteeId },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      toast.success('Connection request sent successfully.');
      await fetchConnectionStatus(requesteeId);
      await fetchConnections();
    } catch (error) {
      console.error('Error sending connection request:', error);
      toast.error(error.response?.data?.error || 'Failed to send connection request.');
      setConnectionStatuses((prev) => ({
        ...prev,
        [requesteeId]: { ...prev[requesteeId], status: 'none' },
      }));
    }
  };

  const acceptConnection = async (connectionId, userId) => {
    console.log(`Trying to accept connection with ID: ${connectionId}`);
    try {
      await axios.post(
        `${BASE_URL}/users/connections/${connectionId}/accept/`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      toast.success('Connection accepted successfully.');
      await fetchConnectionStatus(userId);
      await fetchConnections();
    } catch (error) {
      console.error('Error accepting connection:', error.response);
      toast.error('Failed to accept connection. Please try again.');
    }
  };

  const rejectConnection = async (connectionId, userId) => {
    try {
      await axios.post(
        `${BASE_URL}/users/connections/${connectionId}/reject/`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      toast.success('Connection rejected successfully.');
      await fetchConnectionStatus(userId);
      await fetchConnections();
    } catch (error) {
      console.error('Error rejecting connection:', error.response);
      toast.error('Failed to reject connection.');
    }
  };

  const cancelRejectRequest = async (connectionId, userId) => {
    try {
      await axios.post(
        `${BASE_URL}/users/connections/cancel-reject/${connectionId}/`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      toast.success('Rejection canceled successfully.');
      await fetchConnectionStatus(userId);
      await fetchConnections();
    } catch (error) {
      console.error('Error canceling rejection:', error.response);
      toast.error('Failed to cancel rejection.');
    }
  };

  const renderConnectionButtons = (userId, connectionId, connectionStatus, friend) => {
    const status = connectionStatuses[userId] || {
      status: connectionStatus,
      connectionId,
      acceptReject: false,
      requesterId: UserId,
    };

    if (status.acceptReject) {
      return (
        <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
          <button
            className="bg-green-500 text-white px-4 py-2 rounded flex items-center justify-center hover:bg-green-600 transition"
            onClick={() => acceptConnection(status.connectionId, userId)}
          >
            <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
            Accept
          </button>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded flex items-center justify-center hover:bg-red-600 transition"
            onClick={() => rejectConnection(status.connectionId, userId)}
          >
            <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
            Reject
          </button>
        </div>
      );
    }

    if (status.status === 'pending') {
      return (
        <button
          className="bg-gray-400 text-white px-4 py-2 rounded flex items-center justify-center cursor-not-allowed"
          disabled
        >
          <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
          Request Pending
        </button>
      );
    }

    if (status.status === 'accepted') {
      return (
        <button
          className="bg-green-500 text-white px-4 py-2 rounded flex items-center justify-center cursor-pointer hover:bg-green-600 transition regForm_left"
          onClick={() =>
            navigate(`/chat/${userId}`, {
              state: {
                friend: {
                  id: userId,
                  full_name: friend.full_name,
                  email: friend.email,
                  last_login: friend.last_login,
                  profile_pic:
                  friend.profile?.profile_pic || friend.profile?.profile_picture,
                },
             user: user,
              },
            })
          }
        >
          <FontAwesomeIcon icon={faMessage} className="mr-2 text-orange-500" />
          Message Now
        </button>
      );
    }

    if (status.status === 'rejected') {
      if (status.requesterId === UserId) {
        return (
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded flex items-center justify-center hover:bg-blue-700 transition"
            onClick={() => cancelRejectRequest(status.connectionId, userId)}
          >
            <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
            Cancel Reject
          </button>
        );
      }
      return (
        <button
          className="bg-red-500 text-white px-4 py-2 rounded flex items-center justify-center cursor-not-allowed"
          disabled
        >
          <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
          Rejected
        </button>
      );
    }

    return (
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded flex items-center justify-center hover:bg-blue-700 transition"
        onClick={() => sendConnectionRequest(userId)}
      >
        <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
        Connect
      </button>
    );
  };

  const filteredConnections = connections
    .filter((connection) => connection.status === 'accepted')
    .map((connection) => {
      if (connection.requester.id === UserId) {
        return {
          ...connection,
          friend: connection.requestee,
        };
      } else if (connection.requestee.id === UserId) {
        return {
          ...connection,
          friend: connection.requester,
        };
      }
      return null;
    })
    .filter((connection) => connection !== null);

  const pendingConnections = connections
    .filter((connection) => connection.status === 'pending')
    .map((connection) => {
      if (connection.requester.id === UserId) {
        return {
          ...connection,
          friend: connection.requestee,
        };
      } else if (connection.requestee.id === UserId) {
        return {
          ...connection,
          friend: connection.requester,
        };
      }
      return null;
    })
    .filter((connection) => connection !== null);

  console.log('Search Results:', searchResults);
  console.log('Filtered Connections:', filteredConnections);
  console.log('Pending Connections:', pendingConnections);

  return (
    <div className="container mx-auto p-4 bg-gray-100 rounded-lg shadow-md md:p-6 lg:p-8 regform_body">
      <ToastContainer />
      {/* Search Bar: Fixed on mobile, sticky on desktop */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-gray-100 p-4 md:static md:p-0 regform_body">
        <UserSearch onSearch={handleSearch} />
      </div>
      {/* Add padding-top on mobile to prevent overlap with fixed search bar */}
      <div className="pt-16 md:pt-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Connections Column (2/3 width on desktop) */}
          <div className="md:col-span-2">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl text-center tracking-wide bg-gradient-to-r from-orange-500 to-red-800 text-transparent bg-clip-text mb-4">
              Friend List
            </h2>
            <div
              className="underline mx-auto"
              style={{
                width: '40%',
                borderBottom: '3px solid orange',
                marginBottom: '1rem',
              }}
            ></div>
            {loading && <p className="text-center text-gray-600">Loading...</p>}
           
            <ul className="space-y-4">
              {filteredConnections.length > 0 ? (
                filteredConnections.map((connection) => (
                  <li
                    key={connection.id}
                    className="p-4 contact-form bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4"
                  >
                    <div className="flex items-center space-x-4 sm:flex-1 contact-form">
                      <img
                        src={
                          connection.friend.profile?.profile_pic ||
                          connection.friend.profile?.profile_picture
                            ? `${BASE_URL}${
                                connection.friend.profile.profile_pic ||
                                connection.friend.profile.profile_picture
                              }`
                            : `${BASE_URL}/media/Profile_Picture/default.jpg`
                        }
                        alt="Profile"
                        className="w-16 h-16 rounded-full border border-gray-200 object-cover"
                      />
                      <div>
                        <strong className="text-lg font-semibold">
                          {connection.friend.full_name}
                        </strong>
                        <p className="text-gray-600">{connection.friend.email}</p>
                        <p className="text-sm text-gray-500">
                          <span>Last seen:</span>{' '}
                          {new Date(connection.friend.last_login).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="w-full sm:w-auto">
                      {renderConnectionButtons(
                        connection.friend.id,
                        connection.id,
                        connection.status,
                        connection.friend
                      )}
                    </div>
                  </li>
                ))
              ) : (
                <p className="text-center text-gray-600">
                  No accepted connections found.
                </p>
              )}
            </ul>
          </div>

          {/* Pending Connections and Search Results Column (1/3 width on desktop) */}
          <div className="md:col-span-1">
            <div className="md:sticky md:top-4">
              {/* Pending Connections */}
              {pendingConnections.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-2">Pending Requests</h3>
                  <ul className="space-y-4">
                    {pendingConnections.map((connection) => (
                      <li
                        key={connection.id}
                        className="p-4 contact-form bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4"
                      >
                        <div className="flex items-center space-x-4 sm:flex-1">
                          <img
                            src={
                              connection.friend.profile?.profile_pic ||
                              connection.friend.profile?.profile_picture
                                ? `${BASE_URL}${
                                    connection.friend.profile.profile_pic ||
                                    connection.friend.profile.profile_picture
                                  }`
                                : `${BASE_URL}/media/Profile_Picture/default.jpg`
                            }
                            alt="Profile"
                            className="w-12 h-12 rounded-full border border-gray-200 object-cover"
                          />
                          <div>
                            <strong className="text-md font-semibold">
                              {connection.friend.full_name}
                            </strong>
                            <p className="text-gray-600 text-sm">
                              {connection.friend.email}
                            </p>
                            <p className="text-sm text-gray-500">
                              Last Login:{' '}
                              {new Date(
                                connection.friend.last_login
                              ).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="w-full sm:w-auto">
                          {renderConnectionButtons(
                            connection.friend.id,
                            connection.id,
                            connection.status,
                            connection.friend
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-xl font-semibold mb-2">Search Results</h3>
                  <ul className="space-y-4">
                    {searchResults.map((user) => (
                      <li
                        key={user.id}
                        className="p-4 contact-form bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4"
                      >
                        <div className="flex items-center space-x-4 sm:flex-1">
                          <img
                            src={
                              user.profile?.profile_pic ||
                              user.profile?.profile_picture
                                ? `${BASE_URL}${
                                    user.profile.profile_pic ||
                                    user.profile.profile_picture
                                  }`
                                : `${BASE_URL}/media/Profile_Picture/default.jpg`
                            }
                            alt="Profile"
                            className="w-12 h-12 rounded-full border border-gray-200 object-cover"
                          />
                          <div>
                            <strong className="text-md font-semibold">
                              {user.full_name}
                            </strong>
                            <p className="text-gray-600 text-sm">{user.email}</p>
                            <p className="text-sm text-gray-500">
                              User Type: {user.usertype}
                            </p>
                            <p className="text-sm text-gray-500">
                              Last Login:{' '}
                              {new Date(user.last_login).toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-500 capitalize">
                              Status:{' '}
                              {connectionStatuses[user.id]?.status || 'none'}
                            </p>
                          </div>
                        </div>
                        <div className="w-full sm:w-auto">
                          {renderConnectionButtons(user.id, null, 'none', user)}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendList;