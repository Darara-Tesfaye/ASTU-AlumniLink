import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { ACCESS_TOKEN } from '../../constants';
import { useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { format } from 'date-fns';
import axios from 'axios';

const ForumList = () => {
  const [allEvents, setAllEvents] = useState([]);
  const [userCreatedEvents, setUserCreatedEvents] = useState([]);
  const [loading, setLoading] = useState({
    allEvents: false,
    userEvents: false
  });
  const location = useLocation();
  const { user, profile } = location.state || {};
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_users_API_URL || 'http://127.0.0.1:8000';
  const accessToken = localStorage.getItem(ACCESS_TOKEN);

  useEffect(() => {
    fetchAllEvents();
    fetchUserCreatedEvents();
  }, []);

  const fetchAllEvents = async () => {
    setLoading(prev => ({...prev, allEvents: true}));
    try {
      const response = await fetch(`${BASE_URL}/events/event-lists/`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Unauthorized. Please log in.', { position: 'top-right' });
          navigate('/login');
          return;
        }
        throw new Error('Failed to fetch events');
      }
      const data = await response.json();
      setAllEvents(data);
    } catch (error) {
      toast.error('Failed to fetch events', { position: 'top-right' });
    } finally {
      setLoading(prev => ({...prev, allEvents: false}));
    }
  };

  const fetchUserCreatedEvents = async () => {
    setLoading(prev => ({...prev, userEvents: true}));
    try {
      const response = await axios.get(`${BASE_URL}/events/user-events/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const events = response.data.map((event) => ({
        ...event,
        participants: Array.isArray(event.participants) ? event.participants : [],
      }));
      setUserCreatedEvents(events);
    } catch (error) {
      toast.error('Error fetching your events: ' + (error.response ? error.response.data.message : 'Please try again.'));
    } finally {
      setLoading(prev => ({...prev, userEvents: false}));
    }
  };

  const getOrganizerDetails = (event) => {
    if (event.company_profile) {
      return {
        name: event.company_profile.company_name,
        user: event.company_profile.user,
        profile: event.company_profile,
        usertype: event.company_profile.user.usertype || 'company'
      };
    } else if (event.alumni_profile) {
      return {
        name: event.alumni_profile.user.full_name,
        user: event.alumni_profile.user,
        profile: event.alumni_profile,
        usertype: event.alumni_profile.user.usertype || 'Alumni'
      };
    } else if (event.staff_profile) {
      return {
        name: event.staff_profile.user.full_name,
        user: event.staff_profile.user,
        profile: event.staff_profile,
        usertype: event.staff_profile.user.usertype || 'Staff'
      };
    }
    return {
      name: 'Unknown',
      user: { id: event.created_by, full_name: 'Unknown', email: '', usertype: 'unknown' },
      profile: {},
      usertype: 'unknown'
    };
  };

  const handleViewEvent = (event) => {
    navigate(`/event_list/${event.id}`, { state: { user, profile, event } });
  };

  const handleJoinDiscussion = (event) => {
    navigate(`/forum/event/${event.id}`, { state: { user, profile, event } });
  };

  const handleManageDiscussion = (event) => {
    navigate(`/admin/forum/event/${event.id}`, { state: { user, profile, event } });
  };

  const isAdminOrCreator = (event) => {
    return user?.id === event.created_by || user?.usertype === 'admin';
  };

  return (
    <div className="max-w-8xl mx-auto p-6 bg-gray-100 dark_body">
      <ToastContainer />
      
      {/* Header and Create Event Button */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Event Dashboard</h1>
        {(user?.usertype === 'Alumni' || user?.usertype === 'staff') && (
          <button
            onClick={() => navigate('/create-event', { state: { user, profile } })}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Create Event
          </button>
        )}
      </div>

      {/* User's Created Events Section */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 dark_text">
          Your Created Events
        </h2>
        {loading.userEvents ? (
          <p className="text-gray-500">Loading your events...</p>
        ) : userCreatedEvents.length > 0 ? (
          <ul className="space-y-4">
            {userCreatedEvents.map((event) => {
              const organizer = getOrganizerDetails(event);
              return (
                <li
                  key={event.id}
                  className="p-4 bg-gray-50 rounded-lg shadow-sm event-box"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-lg text-gray-900">{event.title}</h3>
                      <p className="text-sm text-gray-600">{event.description}</p>
                      <p className="text-sm text-gray-500">
                        <span className="font-semibold">Status:</span> {event.is_approved ? 
                          <span className="text-green-600">Approved</span> : 
                          <span className="text-yellow-600">Pending Approval</span>}
                      </p>
                      <p className="text-sm text-gray-500">
                        Created on: {format(new Date(event.date_time), 'PPP')}
                      </p>
                    </div>
                    <div className="mt-4 sm:mt-0 flex space-x-2">
                      <button
                        onClick={() => handleViewEvent(event)}
                        className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        View Event
                      </button>
                      {isAdminOrCreator(event) && (
                        <button
                          onClick={() => handleManageDiscussion(event)}
                          className="px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          Manage Discussion
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-gray-500">You haven't created any events yet.</p>
        )}
      </div>
      <div className="mb-10">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 dark_text">
          Available Events
        </h2>
        {loading.allEvents ? (
          <p className="text-gray-500">Loading events...</p>
        ) : allEvents.length > 0 ? (
          <ul className="space-y-4">
            {allEvents.map((event) => {
              const organizer = getOrganizerDetails(event);
              return (
                <li
                  key={event.id}
                  className="p-4 bg-gray-50 rounded-lg shadow-sm event-box"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-lg text-gray-900">{event.title}</h3>
                      <p className="text-sm text-gray-600">{event.description}</p>
                      <p className="text-sm text-gray-500">
                        <span className="font-semibold">Created By:</span>{' '}
                        <button
                          onClick={() =>
                            navigate(`/profile/${event.created_by}`, {
                              state: {
                                user: {
                                  user_id: organizer.user.id,
                                  full_name: organizer.user.full_name,
                                  email: organizer.user.email,
                                  usertype: organizer.usertype,
                                },
                                profile: organizer.profile || {},
                                currentUser: user,
                              },
                            })
                          }
                          className="text-blue-500 hover:underline"
                          aria-label={`View profile of ${organizer.name}`}
                        >
                          {organizer.name}
                        </button>
                      </p>
                      <p className="text-sm text-gray-500">
                        Created on: {format(new Date(event.date_time), 'PPP')}
                      </p>
                    </div>
                    <div className="mt-4 sm:mt-0 flex space-x-2">
                      <button
                        onClick={() => handleViewEvent(event)}
                        className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        View More
                      </button>
                      <button
                        onClick={() => handleJoinDiscussion(event)}
                        className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        Join Discussion
                      </button>
                      {isAdminOrCreator(event) && (
                        <button
                          onClick={() => handleManageDiscussion(event)}
                          className="px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          Manage Discussion
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-gray-500">No events found.</p>
        )}
      </div>
    </div>
  );
};

export default ForumList;