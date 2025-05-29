import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { ACCESS_TOKEN } from '../../constants';
import { useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoadingIndicator from '../LoadingIndicator';

const EventDetail = () => {
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState('');
  const location = useLocation();
  const { user, profile, event } = location.state || {};
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_users_API_URL || 'http://127.0.0.1:8000';
  const accessToken = localStorage.getItem(ACCESS_TOKEN);

  const getOrganizerDetails = (event) => {
    if (event?.company_profile) {
      return {
        name: event.company_profile.company_name || 'Unknown',
        user: event.company_profile.user || { id: event.created_by, full_name: 'Unknown', email: '', usertype: 'company' },
        profile: event.company_profile,
        usertype: event.company_profile.user?.usertype || 'company',
      };
    } else if (event?.alumni_profile) {
      return {
        name: event.alumni_profile.user?.full_name || 'Unknown',
        user: event.alumni_profile.user || { id: event.created_by, full_name: 'Unknown', email: '', usertype: 'Alumni' },
        profile: event.alumni_profile,
        usertype: event.alumni_profile.user?.usertype || 'Alumni',
      };
    } else if (event?.staff_profile) {
      return {
        name: event.staff_profile.user?.full_name || 'Unknown',
        user: event.staff_profile.user || { id: event.created_by, full_name: 'Unknown', email: '', usertype: 'Staff' },
        profile: event.staff_profile,
        usertype: event.staff_profile.user?.usertype || 'Staff',
      };
    }
    return {
      name: 'Unknown',
      user: { id: event?.created_by || 0, full_name: 'Unknown', email: '', usertype: 'unknown' },
      profile: {},
      usertype: 'unknown',
    };
  };

  useEffect(() => {
    if (event) {
      const updateCountdown = () => {
        const now = new Date();
        const eventDate = new Date(event.date_time);
        const diffMs = eventDate - now;

        if (diffMs <= 0) {
          setCountdown('Event has started or ended');
          return;
        }

        const years = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365));
        const months = Math.floor((diffMs % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
        const weeks = Math.floor((diffMs % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24 * 7));
        const days = Math.floor((diffMs % (1000 * 60 * 60 * 24 * 7)) / (1000 * 60 * 60 * 24));

        const parts = [];
        if (years > 0) parts.push(`${years} year${years !== 1 ? 's' : ''}`);
        if (months > 0) parts.push(`${months} month${months !== 1 ? 's' : ''}`);
        if (weeks > 0) parts.push(`${weeks} week${weeks !== 1 ? 's' : ''}`);
        if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);

        setCountdown(parts.length > 0 ? parts.join(', ') + ' left' : 'Less than a day left');
      };

      updateCountdown();
      const interval = setInterval(updateCountdown, 1000);
      return () => clearInterval(interval);
    }
  }, [event]);

  if (loading) {
    return (
      <div className="max-w-8xl mx-auto p-6 bg-gray-100 dark_body">
        <LoadingIndicator />
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

  const organizer = getOrganizerDetails(event);

  return (
    <div className="max-w-8xl mx-auto p-6 bg-gray-100 dark_body">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-4">{event.title}</h1>
      <div className="p-4 bg-gray-50 rounded-lg shadow-sm event-box">
        <p className="text-sm text-gray-600 mb-2"><span className="font-semibold">Description:</span> {event.description || 'N/A'}</p>
        <p className="text-sm text-gray-500 mb-2">
          <span className="font-semibold">Created By:</span>{' '}
          <button
            onClick={() =>
              navigate(`/profile/${event.created_by}`, {
                state: {
                  user: {
                    user_id: organizer.user.id,
                    full_name: organizer.name,
                    email: organizer.user.email,
                    usertype: organizer.usertype,
                  },
                  profile: organizer.profile,
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
        <p className="text-sm text-gray-500 mb-2">
          <span className="font-semibold">Date and Time:</span>{' '}
          {new Date(event.date_time).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short',
          })}
        </p>
        <p className="text-sm text-gray-500 mb-2">
          <span className="font-semibold">Countdown:</span> {countdown}
        </p>
        <p className="text-sm text-gray-500 mb-2">
          <span className="font-semibold">Event Type:</span> {event.event_type || 'N/A'}
        </p>
        {event.venue && (
          <p className="text-sm text-gray-500 mb-2">
            <span className="font-semibold">Venue:</span> {event.venue}
          </p>
        )}
        <p className="text-sm text-gray-500 mb-2">
          <span className="font-semibold">Participants:</span>{' '}
          {Array.isArray(event.participants) && event.participants.length > 0 ? event.participants.join(', ') : 'None'}
        </p>
        {event.batch && (
          <p className="text-sm text-gray-500 mb-2">
            <span className="font-semibold">Batch:</span> {event.batch}
          </p>
        )}
        {event.department && (
          <p className="text-sm text-gray-500 mb-2">
            <span className="font-semibold">Department:</span> {event.department}
          </p>
        )}
        <p className="text-sm text-gray-500 mb-2">
          <span className="font-semibold">Approved:</span> {event.is_approved ? 'Yes' : 'No'}
        </p>
        {event.company_profile && (
          <>
            <p className="text-sm text-gray-500 mb-2">
              <span className="font-semibold">Company:</span> {event.company_profile.company_name || 'N/A'}
            </p>
            <p className="text-sm text-gray-500 mb-2">
              <span className="font-semibold">Location:</span>{' '}
              {[
                event.company_profile.company_address,
                event.company_profile.company_city,
                event.company_profile.company_country,
                event.company_profile.postal_code,
              ]
                .filter(Boolean)
                .join(', ') || 'N/A'}
            </p>
            {event.company_profile.website_url && (
              <p className="text-sm text-gray-500 mb-2">
                <span className="font-semibold">Website:</span>{' '}
                <a
                  href={event.company_profile.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {event.company_profile.website_url}
                </a>
              </p>
            )}
            {event.company_profile.contact_person_phone_number && (
              <p className="text-sm text-gray-500 mb-2">
                <span className="font-semibold">Contact Phone:</span>{' '}
                {event.company_profile.contact_person_phone_number}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EventDetail;
