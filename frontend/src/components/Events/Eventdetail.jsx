import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { ACCESS_TOKEN } from '../../constants';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { formatDistanceStrict, parseISO } from 'date-fns';

const EventDetail = () => {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState('');
  const location = useLocation();
  const { user } = location.state || {};
  const navigate = useNavigate();
  const { pk } = useParams();
  const BASE_URL = import.meta.env.VITE_users_API_URL || 'http://127.0.0.1:8000/users';
  const accessToken = localStorage.getItem(ACCESS_TOKEN);

  useEffect(() => {
    fetchEvent();
  }, [pk]);

  useEffect(() => {
    if (event) {
      const updateCountdown = () => {
        const now = new Date();
        const eventDate = parseISO(event.date_time);
        if (eventDate > now) {
          setCountdown(formatDistanceStrict(eventDate, now, { addSuffix: false }));
        } else {
          setCountdown('Event has started');
        }
      };
      updateCountdown();
      const interval = setInterval(updateCountdown, 1000);
      return () => clearInterval(interval);
    }
  }, [event]);

  const fetchEvent = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/event-lists/${pk}/`, {
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
        if (response.status === 404) {
          toast.error('Event not found.', { position: 'top-right' });
          navigate('/event-lists');
          return;
        }
        throw new Error('Failed to fetch event');
      }
      const data = await response.json();
      setEvent(data);
    } catch (error) {
      toast.error('Failed to fetch event', { position: 'top-right' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-8xl mx-auto p-6 bg-gray-100 dark_body">
        <p className="text-gray-500">Loading event...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-8xl mx-auto p-6 bg-gray-100 dark_body">
        <p className="text-gray-500">Event not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-8xl mx-auto p-6 bg-gray-100 dark_body">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-4">{event.title}</h1>
      <div className="p-4 bg-gray-50 rounded-lg shadow-sm event-box">
        <p className="text-sm text-gray-600">{event.description}</p>
        <p className="text-sm text-gray-500">
          Created by: {event.created_by.full_name || event.created_by.username}
        </p>
        <p className="text-sm text-gray-500">
          Countdown: {countdown}
        </p>
        <p className="text-sm text-gray-500">
          Type: {event.event_type}
        </p>
        {event.venue && (
          <p className="text-sm text-gray-500">
            Venue: {event.venue}
          </p>
        )}
        <p className="text-sm text-gray-500">
          Participants: {event.participants.join(', ')}
        </p>
        {event.batch && (
          <p className="text-sm text-gray-500">
            Batch: {event.batch}
          </p>
        )}
        {event.department && (
          <p className="text-sm text-gray-500">
            Department: {event.department}
          </p>
        )}
        <p className="text-sm text-gray-500">
          Approved: {event.is_approved ? 'Yes' : 'No'}
        </p>
      </div>
    </div>
  );
};

export default EventDetail;