import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEdit, faTrash, faCheck } from '@fortawesome/free-solid-svg-icons';
import { ACCESS_TOKEN } from "../../constants";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ManageEvents = () => {
  const [events, setEvents] = useState([]);
  const [expandedEventId, setExpandedEventId] = useState(null);
  const location = useLocation();
  const { user } = location.state || {};
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_users_API_URL || 'http://127.0.0.1:8000';

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const accessToken = localStorage.getItem(ACCESS_TOKEN);
        const response = await fetch(`${BASE_URL}/events/list/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          }
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
        setEvents(data);
      } catch (error) {
        toast.error('Failed to fetch events', { position: 'top-right' });
      }
    };

    fetchEvents();
  }, [navigate]);

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

  const handleViewMore = (id) => {
    setExpandedEventId(expandedEventId === id ? null : id);
  };

  const handleApprove = async (id) => {
    try {
      const accessToken = localStorage.getItem(ACCESS_TOKEN);
      const response = await fetch(`${BASE_URL}/events/approve/${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ is_approved: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve event');
      }
      const eventName = events.find(event => event.id === id).title;
      setEvents(events.map(event =>
        event.id === id ? { ...event, is_approved: true } : event
      ));
      toast.success(`Event "${eventName}" approved successfully`);
    } catch (error) {
      toast.error('Failed to approve event', { position: 'top-right' });
    }
  };

  const handleCancelApproval = async (id) => {
    try {
      const accessToken = localStorage.getItem(ACCESS_TOKEN);
      const response = await fetch(`${BASE_URL}/events/approve/${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ is_approved: false }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel approval');
      }
      const eventName = events.find(event => event.id === id).title;
      setEvents(events.map(event =>
        event.id === id ? { ...event, is_approved: false } : event
      ));
      toast.success(`Event "${eventName}" approval canceled successfully`);
    } catch (error) {
      toast.error('Failed to cancel approval', { position: 'top-right' });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        const accessToken = localStorage.getItem(ACCESS_TOKEN);
        const response = await fetch(`${BASE_URL}/events/delete/${id}/`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to delete event');
        }
        const eventName = events.find(event => event.id === id).title;
        setEvents(events.filter(event => event.id !== id));
        toast.success(`Event "${eventName}" deleted successfully`);
      } catch (error) {
        toast.error('Failed to delete event', { position: 'top-right' });
      }
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 min-h-screen flex flex-col">
      <ToastContainer />
      <div className="flex flex-1 create-form">
        <Sidebar />
        <div className="flex-1 px-4 sm:px-6 py-4 w-full ml-0">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-6 sm:mb-8 tracking-tight">
            Manage Event Listings
          </h1>
          <div className="bg-white p-4 sm:p-6 sm:px-16 lg:p-8 rounded-xl shadow-xl from-white to-blue-50 border border-blue-100 ml-0 event_table_conatiner">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-4 sm:mb-6 tracking-wide dark_text">
              Event Listings
            </h2>
            {events.length > 0 ? (
              <div className="overflow-x-auto event_table">
                <table className="w-full border-collapse border border-gray-200 event_table">
                  <thead>
                    <tr className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white event_table">
                      <th className="p-3 sm:p-4 text-left event_table">Title</th>
                      <th className="p-3 sm:p-4 text-left event_table">Description</th>
                      <th className="p-3 sm:p-4 text-left event_table">Date</th>
                      <th className="p-3 sm:p-4 text-left event_table">Organizer</th>
                      <th className="p-3 sm:p-4 text-left event_table">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event, index) => {
                      const organizer = getOrganizerDetails(event);
                      return (
                        <React.Fragment key={event.id}>
                          <tr className={`${index % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-blue-100`}>
                            <td className="p-3 sm:p-4 text-gray-800 event_table">{event.title}</td>
                            <td className="p-3 sm:p-4 text-gray-800 event_table">{event.description}</td>
                            <td className="p-3 sm:p-4 text-gray-800 event_table">{new Date(event.date_time).toLocaleString()}</td>
                            <td className="p-3 sm:p-4 text-gray-800 event_table">
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
                            </td>
                            <td className="p-3 sm:p-4 event_table">
                              <button
                                onClick={() => handleViewMore(event.id)}
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                              >
                                {expandedEventId === event.id ? "View Less" : "View More"}
                              </button>
                              {event.is_approved ? (
                                <>
                                  <button
                                    disabled
                                    className="bg-green-400 text-white rounded-lg px-4 py-2 ml-2 mt-2"
                                  >
                                    Approved
                                  </button>
                                  <button
                                    onClick={() => handleCancelApproval(event.id)}
                                    className="bg-yellow-500 text-white rounded-lg px-4 py-2 ml-2 mt-2"
                                  >
                                    Cancel Approval
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleApprove(event.id)}
                                    className="bg-green-500 text-white rounded-lg px-4 py-2 ml-2 mt-2"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleDelete(event.id)}
                                    className="bg-red-500 text-white rounded-lg ml-2 px-4 py-2 mt-2"
                                  >
                                    Delete
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                          {expandedEventId === event.id && (
                            <tr className="bg-blue-100">
                              <td colSpan="5" className="p-4">
                                <h3 className="font-semibold text-center tracking-wide bg-gradient-to-r from-orange-500 to-red-800 text-transparent bg-clip-text">
                                  Event Details
                                </h3>
                                <div
                                  className="underline"
                                  style={{
                                    bottom: '-5px',
                                    left: '0',
                                    alignItems: 'center',
                                    width: '50%',
                                    color: 'orange',
                                    marginTop: '0.5rem',
                                    borderBottom: '3px solid orange',
                                    transform: 'translateX(50%)',
                                  }}
                                ></div>
                                <p><strong>Description:</strong> {event.description}</p>
                                <p><strong>Event Type:</strong> {event.event_type}</p>
                                <p><strong>Venue:</strong> {event.venue || "N/A"}</p>
                                <p><strong>Participants:</strong> {event.participants ? event.participants.join(", ") : "None"}</p>
                                <p><strong>Batch:</strong> {event.batch || "N/A"}</p>
                                <p><strong>Department:</strong> {event.department || "N/A"}</p>
                                <p><strong>Contact Email:</strong> {organizer.user.email}</p>
                                <p><strong>Organizer Name:</strong> {organizer.name}</p>
                                {event.company_profile && (
                                  <p><strong>Contact Person:</strong> {event.company_profile.contact_person_phone_number}</p>
                                )}
                                {event.date_time && (
                                  <p>
                                    <strong>Status:</strong>
                                    {new Date(event.date_time) > new Date() ? (
                                      <span> Upcoming</span>
                                    ) : (
                                      <span> Past</span>
                                    )}
                                  </p>
                                )}
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-600">No events available to manage.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageEvents;