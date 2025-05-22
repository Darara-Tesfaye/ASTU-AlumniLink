import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faClipboardList, faClock, faCommentDots } from '@fortawesome/free-solid-svg-icons';
import { ACCESS_TOKEN } from '../../constants';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EVENT_TYPES = [
  { value: 'online', label: 'Online' },
  { value: 'In-Person', label: 'In-Person' },
];

const CreateEventForm = () => {
  const location = useLocation();
  const { user, profile } = location.state || {};
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [userEvents, setUserEvents] = useState([]);
  const [eventType, setEventType] = useState('online');
  const [venue, setVenue] = useState('');
  const [participantTypes, setParticipantTypes] = useState([]);
  const [department, setDepartment] = useState('');
  const [batch, setBatch] = useState('');
  const [editingEventId, setEditingEventId] = useState(null);
  const [expandedEvents, setExpandedEvents] = useState({});
  const formRef = useRef(null);

  const BASE_URL = import.meta.env.VITE_users_API_URL;
  const accessToken = localStorage.getItem(ACCESS_TOKEN);
  const fetchedEvent = {
    id: '18',
    title: 'Airline registration',
    description: 'nkdsvkjdf',
    date_time: '2026-11-11T01:59:00.000000',
    venue: 'Bole Airport',
    event_type: 'In-Person',
    is_approved: '1',
    created_by_id: '61',
    participants: Array.isArray(JSON.parse('["students"]')) ? JSON.parse('["students"]') : [],
    batch: '2013',
    department: 'Computer Science and Engineering',
  };

  useEffect(() => {
    setUserEvents([fetchedEvent]);
    const fetchUserEvents = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/events/user-events/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        // Normalize participants to ensure it's always an array
        const events = response.data.map((event) => ({
          ...event,
          participants: Array.isArray(event.participants) ? event.participants : [],
        }));
        setUserEvents(events);
      } catch (error) {
        toast.error('Error fetching events: ' + (error.response ? error.response.data.message : 'Please try again.'));
      }
    };
    fetchUserEvents();
  }, [BASE_URL, accessToken]);
console.log(userEvents);
  const handleParticipantTypeChange = (e) => {
    const value = e.target.value;
    setParticipantTypes((prev) =>
      prev.includes(value) ? prev.filter((type) => type !== value) : [...prev, value]
    );
  };

  const validateForm = () => {
    const currentDateTime = new Date();
    if (new Date(dateTime) <= currentDateTime) {
      toast.error('Please select a future date and time.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const eventData = {
      title,
      description,
      date_time: dateTime,
      venue: eventType === 'online' ? null : venue,
      event_type: eventType,
      participants: participantTypes,
      department: department || null,
      batch: batch || null,
    };
    if (eventData.participants.length >= 2) {
      eventData.batch = null;
      eventData.department = null;
    }
    console.log('Event Data:', eventData);

    try {
      if (editingEventId) {
        try {
          const response = await axios.put(
            `${BASE_URL}/events/update/${editingEventId}/`,
            eventData,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );
          if (response.status === 200) {
            toast.success('Event updated successfully!');
            setUserEvents((prev) =>
              prev.map((event) =>
                event.id === editingEventId ? { ...event, ...eventData } : event
              )
            );
            resetForm();
          }
        } catch (error) {
          console.error('Error updating event:', error.response?.data); // Log the error details
          toast.error('Failed to update event: ' + (error.response?.data?.detail || 'Unknown error'));
        }
      }
      else {
        const response = await axios.post(`${BASE_URL}/events/create-events/`, eventData, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (response.status === 201) {
          toast.success('Event created successfully!');
          setUserEvents((prev) => [...prev, response.data]);
          resetForm();
        }
      }
    } catch (error) {
      toast.error(
        `Error ${editingEventId ? 'updating' : 'creating'} event: ` +
          (error.response ? error.response.data.message : 'Please try again.')
      );
    }
  };

  const handleDelete = async (eventId) => {
    try {
      await axios.delete(`${BASE_URL}/events/delete/${eventId}/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setUserEvents((prev) => prev.filter((event) => event.id !== eventId));
      toast.success('Event deleted successfully!');
    } catch (error) {
      toast.error('Error deleting event: ' + (error.response ? error.response.data.message : 'Please try again.'));
    }
  };

  const handleEdit = (event) => {
    setEditingEventId(event.id);
    setTitle(event.title);
    setDescription(event.description);
    setDateTime(event.date_time.slice(0, 16));
    setEventType(event.event_type);
    setVenue(event.venue || '');
    setParticipantTypes(Array.isArray(event.participants) ? event.participants : []);
    setDepartment(event.department || '');
    setBatch(event.batch || '');
    formRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  const handleViewToggle = (eventId) => {
    setExpandedEvents((prev) => ({
      ...prev,
      [eventId]: !prev[eventId],
    }));
  };
 

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDateTime('');
    setEventType('online');
    setVenue('');
    setParticipantTypes([]);
    setDepartment('');
    setBatch('');
    setEditingEventId(null);
  };

  const showDepartmentAndBatch = (participantTypes) => {
    if (!Array.isArray(participantTypes)) {
      return false;
    }
    const hasStudents = participantTypes.includes('students');
    const hasAlumni = participantTypes.includes('alumni');
    const hasOtherTypes = participantTypes.some((type) => ['staff', 'company'].includes(type));
    return (hasStudents && !hasAlumni && !hasOtherTypes) || (hasAlumni && !hasStudents && !hasOtherTypes);
  };

  return (
    <div className="max-w-8xl mx-auto mb-12 p-8 bg-white rounded-xl shadow-lg create-form">
      <ToastContainer />
      {/* Your Events Section */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 dark_text">Your Events</h2>
        {userEvents.length > 0 ? (
          <ul className="space-y-4">
            {userEvents.map((event) => (
              <li key={event.id} className="p-4 bg-gray-50 rounded-lg shadow-sm event-box">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{event.title}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(event.date_time).toLocaleString()}
                    </p>
                    <p className="text-sm text-black-500">Status: {event.is_approved ? <span className='bg-green-500'> Approved</span>  : <span className='bg-amber-500 text-white'>Pending Approval</span>}</p>
                   
                    {expandedEvents[event.id] && (
                      <div className="mt-2 text-gray-600">
                        <p><strong>Description:</strong> {event.description}</p>
                        {event.venue && (
                          <p><strong>Venue:</strong> {event.venue}</p>
                        )}
                        <p><strong>Event Type:</strong> {event.event_type}</p>
                        <p>
                          <strong>Participants:</strong>{' '}
                          {Array.isArray(event.participants) ? event.participants.join(', ') : 'None'}
                        </p>
                        {event.department && (
                          <p><strong>Department:</strong> {event.department}</p>
                        )}
                        {event.batch && <p><strong>Batch:</strong> {event.batch}</p>}
                      </div>
                    )}
                  </div>
                  <div className="mt-4 sm:mt-0 flex space-x-2">
                    <button
                      onClick={() => handleEdit(event)}
                      className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => handleViewToggle(event.id)}
                      className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      {expandedEvents[event.id] ? 'View Less' : 'View More'}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No events found.</p>
        )}
      </div>

      {/* Create Event Form */}
      <div ref={formRef}>
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
          {editingEventId ? 'Edit Event' : 'Create a New Event'}
        </h1>
        <p className="text-center text-gray-600 mb-8 dark_text">
          {editingEventId
            ? 'Update the event details below.'
            : 'Plan an exciting event for students, alumni, and more. Fill out the details below to get started!'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title and Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1 dark_text">
                Event Title <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
                <FontAwesomeIcon icon={faClipboardList} className="text-blue-500 mx-3" />
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full p-3 border-0 rounded-lg focus:ring-0 bg-transparent"
                  placeholder="Enter event title"
                />
              </div>
            </div>
            <div className="relative">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1 dark_text">
                Event Description <span className="text-red-500">*</span>
              </label>
              <div className="flex items-start border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
                <FontAwesomeIcon icon={faCommentDots} className="text-blue-500 mx-3 mt-3" />
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="w-full p-3 border-0 rounded-lg focus:ring-0 bg-transparent"
                  rows="4"
                  placeholder="Describe your event"
                />
              </div>
            </div>
          </div>

          {/* DateTime and Event Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <label htmlFor="dateTime" className="block text-sm font-medium text-gray-700 mb-1 dark_text">
                Event Date & Time <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
                <FontAwesomeIcon icon={faClock} className="text-blue-500 mx-3" />
                <input
                  type="datetime-local"
                  id="dateTime"
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                  required
                  className="w-full p-3 border-0 rounded-lg focus:ring-0 bg-transparent"
                />
              </div>
            </div>
            <div className="relative">
              <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 mb-1 dark_text">
                Event Type <span className="text-red-500">*</span>
              </label>
              <select
                id="eventType"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-transparent"
              >
                {EVENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Venue (Conditional) */}
          {eventType === 'In-Person' && (
            <div className="relative">
              <label htmlFor="venue" className="block text-sm font-medium text-gray-700 mb-1 dark_text">
                Venue <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-blue-500 mx-3" />
                <input
                  type="text"
                  id="venue"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  required
                  className="w-full p-3 border-0 rounded-lg focus:ring-0 bg-transparent"
                  placeholder="Enter the event location"
                />
              </div>
            </div>
          )}

          {/* Participant Types */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 dark_text">Participant Type</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['student', 'Alumni', 'staff', 'company'].map((type) => (
                <label key={type} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    value={type}
                    checked={participantTypes.includes(type)}
                    onChange={handleParticipantTypeChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-700 capitalize">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Department and Batch (Conditional) */}
          {showDepartmentAndBatch(participantTypes) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="died in a tragic accidentbatch" className="block text-sm font-medium text-gray-700 mb-1 dark_text">
                  Batch (Academic Year)
                </label>
                <input
                  type="text"
                  id="batch"
                  value={batch}
                  onChange={(e) => setBatch(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-transparent"
                  placeholder="Enter academic year (e.g., 2023)"
                />
              </div>
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1 dark_text">
                  Department
                </label>
                <select
                  id="department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-transparent"
                >
                  <option value="">Select a Department</option>
                  <option value="All">All Departments</option>
                  <option value="Applied Biology Program">Applied Biology Program</option>
                  <option value="Applied Chemistry">Applied Chemistry</option>
                  <option value="Applied Physics">Applied Physics</option>
                  <option value="Applied Geology">Applied Geology</option>
                  <option value="Applied Mathematics">Applied Mathematics</option>
                  <option value="Industrial Chemistry">Industrial Chemistry</option>
                  <option value="Pharmacy Program">Pharmacy Program</option>
                  <option value="Computer Science and Engineering">Computer Science and Engineering</option>
                  <option value="Electronics & Communication Engineering">Electronics & Communication Engineering</option>
                  <option value="Electrical Power and Control Engineering">Electrical Power and Control Engineering</option>
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Architecture">Architecture</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Water Resources Engineering">Water Resources Engineering</option>
                  <option value="Chemical Engineering">Chemical Engineering</option>
                  <option value="Material Science and Engineering">Material Science and Engineering</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                </select>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            {editingEventId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 bg-gray-500 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 transition duration-200"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            >
              {editingEventId ? 'Update Event' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventForm;