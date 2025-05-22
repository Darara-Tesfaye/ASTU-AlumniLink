import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEdit, faTrash, faCheck } from '@fortawesome/free-solid-svg-icons';
import { ACCESS_TOKEN } from "../../constants";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ManageEvents = () => {
  const [events, setEvents] = useState([]);
  const [expandedEventId, setExpandedEventId] = useState(null);
  const BASE_URL = import.meta.env.VITE_users_API_URL;


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
          throw new Error('Failed to fetch events');
        }
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);
  console.log(events);

  const handleViewMore = (id) => {
    // Toggle the expanded state for the clicked event
    setExpandedEventId(expandedEventId === id ? null : id);
  };

  const handleApprove = async (id) => {
    try {
      const accessToken = localStorage.getItem(ACCESS_TOKEN);


      const response = await fetch(`http://127.0.0.1:8000/events/approve/${id}/`, {
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
      setEvents(events.filter(event => event.id !== id));
      toast.success(`Event "${eventName}" approved successfully`);

      // Update the local state to reflect the approved event
      setEvents(events.map(event =>
        event.id === id ? { ...event, is_approved: true } : event
      ));
    } catch (error) {
      console.error("Error approving event:", error);
    }
  };

  const handleCancelApproval = async (id) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/events/approve/${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
        },
        body: JSON.stringify({ is_approved: false }),
      });

      if (!response.ok) {
        toast.error('Failed to cancel approval');
      } const eventName = events.find(event => event.id === id).title;
      setEvents(events.filter(event => event.id !== id));
      toast.success(`Event "${eventName}" approval canceled successfully`);
      // Update the local state to reflect the canceled approval  
      setEvents(events.map(event =>
        event.id === id ? { ...event, is_approved: false } : event
      ));
    } catch (error) {
      console.error("Error canceling approval:", error);
    }
  };

  const handleDelete = async (id) => {

    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        const accessToken = localStorage.getItem(ACCESS_TOKEN);

        const response = await fetch(`http://127.0.0.1:8000/events/delete/${id}/`, {
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

        // Update the local state to remove the deleted event    
        setEvents(events.filter(event => event.id !== id));
      } catch (error) {
        console.error("Error deleting event:", error);
      }
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 min-h-screen flex flex-col ">
      <ToastContainer />
      <div className="flex flex-1 create-form">
        <Sidebar isSidebarOpen={true} setIsSidebarOpen={() => { }} />
        <div className="flex-1 max-w-[90rem] mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16 w-full ml-0 md:ml-16 lg:ml-80">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-6 sm:mb-8 tracking-tight">
            Manage Event Listings
          </h1>

          {/* Events Table Card */}
          <div className="bg-white p-4 sm:p-6 sm:px-16 lg:p-8 rounded-xl shadow-xl from-white to-blue-50 border border-blue-100 ml-0 event_table_conatiner">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-4 sm:mb-6 tracking-wide black_text">
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
                      <th className="p-3 sm:p-4 text-left event_table">Location</th>
                      <th className="p-3 sm:p-4 text-left event_table">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event, index) => (
                      <React.Fragment key={event.id}>
                        <tr className={`${index % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-blue-100`}>
                          <td className="p-3 sm:p-4 text-gray-800 event_table">{event.title}</td>
                          <td className="p-3 sm:p-4 text-gray-800 event_table">{event.description}</td>
                          <td className="p-3 sm:p-4 text-gray-800 event_table">{new Date(event.date_time).toLocaleString()}</td>
                          <td className="p-3 sm:p-4 text-gray-800 event_table">{event.company_profile.company_name}</td>
                          <td className="p-3 sm:p-4 text-gray-800 event_table">{event.venue}</td>


                          <td className="p-3 sm:p-4 event_table">
                            <button onClick={() => handleViewMore(event.id)} className="bg-blue-500 text-white px-4 py-2 rounded-lg">
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
                                <button onClick={() => handleDelete(event.id)} className="bg-red-500 text-white rounded-lg ml-2 px-4 py-2 mt-2">
                                  Delete
                                </button>
                              </>
                            )}
                          </td>

                        </tr>
                        {expandedEventId === event.id && (
                          <tr className="bg-blue-100">
                            <td colSpan="6" className="p-4">
                              <h3 className="font-semibold text-center tracking-wide bg-gradient-to-r from-orange-500 to-red-800 text-transparent bg-clip-text">Event Details</h3>
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
                              <p><strong>Participants:</strong> {event.participants ? event.participants.join(", ") : "None"}</p>
                              <p><strong>Batch:</strong> {event.batch || "N/A"}</p>
                              <p><strong>Department:</strong> {event.department || "N/A"}</p>
                              <p><strong>Contact Email:</strong> {event.company_profile.user.email}</p>
                              <p><strong>Company Name:</strong> {event.company_profile.company_name}</p>
                              <p><strong>Contact Person:</strong> {event.company_profile.contact_person_phone_number}</p>
                              {event.date_time && (
                                <p>
                                  <strong>Status</strong>
                                  {new Date(event.date_time) > new Date() ? (
                                    <span> - Upcoming</span>
                                  ) : (
                                    <span> - Past</span>
                                  )}
                                </p>
                              )}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
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