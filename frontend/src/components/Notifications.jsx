import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { ACCESS_TOKEN } from '../constants';
import { useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { formatDistanceToNow } from 'date-fns';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const { user } = location.state || {};
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_users_API_URL || 'http://127.0.0.1:8000';
  const accessToken = localStorage.getItem(ACCESS_TOKEN);

  const NOTIFICATION_TYPES = {
    new_resource: 'New Resource Shared',
    connect_request: 'New Connection Request',
    connect_accept: 'Connection Accepted',
    event_announcement: 'New Event Announcement',
    new_message: 'New Message',
    new_opportunity: 'New Opportunity',
    internship_application_status: 'Internship Application Status',
    job_application_status: 'Job Application Status',
    event_deleted: 'Event Deleted',
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/users/notifications/`, {
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
        throw new Error('Failed to fetch notifications');
      }
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      toast.error('Failed to fetch notifications', { position: 'top-right' });
    } finally {
      setLoading(false);
    }
  };
console.log("notifications", notifications)

  const markAsRead = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/users/notifications/${id}/`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_read: true }),
      });
      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
      toast.success('Notification marked as read!', { position: 'top-right' });
      setNotifications((prev) =>
        prev.map((notif) => (notif.id === id ? { ...notif, is_read: true } : notif))
      );
    } catch (error) {
      toast.error(`Failed to mark notification as read: ${error.message}`, {
        position: 'top-right',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (event) => {
    if (!event) return;
    navigate(`/opportunity/${event.id}`, { state: { user, event } });
  };

  const handleViewDetails = (notif) => {
    switch (notif.notification_type) {
      case 'new_message':
        navigate(`/chat/${notif.friendId}`); // Assuming friendId is available in the notification
        break;
      case 'new_opportunity':
        navigate(`/internship-opportunity/${notif.opportunityId}`); // Assuming opportunityId is available
        break;
      default:
        toast.info('No specific view available for this notification.');
    }
  };

  return (
    <div className="max-w-8xl mx-auto p-6 bg-gray-100 dark_body">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>
      <p className="mb-6">
        View your latest notifications, including new opportunities, connection
        requests, and application status updates.
      </p>
      <div className="mb-10">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 dark_text">
          Your Notifications
        </h2>
        {loading ? (
          <p className="text-gray-500">Loading notifications...</p>
        ) : notifications.length > 0 ? (
          <ul className="space-y-4">
            {notifications.map((notif) => (
              <li
                key={notif.id}
                className={`p-4 bg-gray-50 rounded-lg shadow-sm event-box ${
                  notif.is_read ? 'opacity-75' : 'font-semibold'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg text-gray-900">
                      {NOTIFICATION_TYPES[notif.notification_type] || notif.notification_type}
                    </h3>
                    <p className="text-sm text-gray-600">{notif.message}</p>
                    <p className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                    </p>
                    <p>
                      <button
                        onClick={() => handleViewDetails(notif)}
                        className="text-blue-600 hover:underline text-sm mt-2"
                      >
                        View Details
                      </button>
                    </p>
                    <p className="text-sm text-gray-500">
                      Status:{' '}
                      {notif.is_read ? (
                        <span className="text-green-500">Read</span>
                      ) : (
                        <span className="text-red-500">Unread</span>
                      )}
                    </p>
                    {notif.event && (
                      <button
                        onClick={() => handleEventClick(notif.event)}
                        className="text-blue-600 hover:underline text-sm mt-2"
                      >
                        View {notif.event.title}
                      </button>
                    )}
                  </div>
                  <div className="mt-4 sm:mt-0 flex space-x-2">
                    {!notif.is_read && (
                      <button
                        onClick={() => markAsRead(notif.id)}
                        className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        disabled={loading}
                        aria-label={`Mark notification ${notif.id} as read`}
                      >
                        {loading ? 'Marking...' : 'Mark as Read'}
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No notifications found.</p>
        )}
      </div>
    </div>
  );
};

export default Notifications;
