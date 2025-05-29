import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { ACCESS_TOKEN } from '../constants';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMessage, faUserPlus } from '@fortawesome/free-solid-svg-icons';

const BASE_URL = import.meta.env.VITE_users_API_URL || 'http://localhost:8000';

const UserProfilePage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { user, profile, currentUser } = state || {};
  const [connectionStatus, setConnectionStatus] = useState({
    status: 'none',
    connectionId: null,
    acceptReject: false,
    requesterId: null,
  });
 
  const accessToken = localStorage.getItem(ACCESS_TOKEN);

  useEffect(() => {
    const fetchConnectionStatus = async () => {
      if (!user?.user_id || !accessToken) return;
      try {
        const response = await axios.get(`${BASE_URL}/users/connections/status/`, {
          params: { requestee_id: user.user_id },
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const statusData = {
          status: response.data[user.user_id]?.status || 'none',
          connectionId: response.data[user.user_id]?.connectionId || null,
          acceptReject: response.data[user.user_id]?.acceptReject || false,
          requesterId: response.data[user.user_id]?.RequesterId || null,
        };
        console.log(`Connection status for user ${user.user_id}:`, statusData);
        setConnectionStatus(statusData);
      } catch (error) {
        console.error('Error fetching connection status:', error);
      }
    };

    fetchConnectionStatus();
  }, [accessToken, user?.user_id]);

  const sendConnectionRequest = async () => {
    try {
      setConnectionStatus((prev) => ({ ...prev, status: 'pending' }));
      await axios.post(
        `${BASE_URL}/users/connections/`,
        { requestee_id: user.user_id },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      toast.success('Connection request sent successfully');
      setConnectionStatus((prev) => ({
        ...prev,
        status: 'pending',
        requesterId: currentUser?.user.id,
      }));
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send connection request');
      setConnectionStatus((prev) => ({ ...prev, status: 'none' }));
    }
  };

  const acceptConnection = async () => {
    try {
      await axios.post(
        `${BASE_URL}/users/connections/${connectionStatus.connectionId}/accept/`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      toast.success('Connection accepted successfully');
      setConnectionStatus((prev) => ({ ...prev, status: 'accepted', acceptReject: false }));
    } catch (error) {
      toast.error('Failed to accept connection');
      console.error('Error accepting connection:', error);
    }
  };

  const rejectConnection = async () => {
    try {
      await axios.post(
        `${BASE_URL}/users/connections/${connectionStatus.connectionId}/reject/`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      toast.success('Connection rejected successfully');
      setConnectionStatus((prev) => ({ ...prev, status: 'rejected', acceptReject: false }));
    } catch (error) {
      toast.error('Failed to reject connection');
      console.error('Error rejecting connection:', error);
    }
  };

  const cancelRejectRequest = async () => {
    try {
      await axios.post(
        `${BASE_URL}/users/connections/cancel-reject/${connectionStatus.connectionId}/`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      toast.success('Rejection canceled successfully');
      setConnectionStatus((prev) => ({ ...prev, status: 'none' }));
    } catch (error) {
      toast.error('Failed to cancel rejection');
      console.error('Error canceling rejection:', error);
    }
  };

  const renderConnectionButtons = () => {
    if (connectionStatus.acceptReject) {
      return (
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center justify-center hover:bg-green-600 transition duration-200"
            onClick={acceptConnection}
            aria-label="Accept connection request"
          >
            <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
            Accept
          </button>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center justify-center hover:bg-red-600 transition duration-200"
            onClick={rejectConnection}
            aria-label="Reject connection request"
          >
            <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
            Reject
          </button>
        </div>
      );
    }

    if (connectionStatus.status === 'pending') {
      return (
        <button
          className="bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center justify-center cursor-not-allowed"
          disabled
          aria-label="Connection request pending"
        >
          <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
          Request Pending
        </button>
      );
    }

    if (connectionStatus.status === 'accepted') {
      return (
        <button
          className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center justify-center hover:bg-green-600 transition duration-200"
          onClick={() =>
            navigate(`/chat/${user.user_id}`, {
              state: {
                friend: {
                  id: user.user_id,
                  full_name: user.full_name,
                  email: user.email,
                  last_login: user.last_login,
                  profile_pic: profile.profile_pic || profile.profile_picture,
                },
                user: currentUser?.user,
              },
            })
          }
          aria-label="Message now"
        >
          <FontAwesomeIcon icon={faMessage} className="mr-2 text-orange-500" />
          Message Now
        </button>
      );
    }

    if (connectionStatus.status === 'rejected') {
      if (connectionStatus.requesterId === currentUser?.user.id) {
        return (
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center hover:bg-blue-700 transition duration-200"
            onClick={cancelRejectRequest}
            aria-label="Cancel rejected connection"
          >
            <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
            Cancel Reject
          </button>
        );
      }
      return (
        <button
          className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center justify-center cursor-not-allowed"
          disabled
          aria-label="Connection rejected"
        >
          <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
          Rejected
        </button>
      );
    }

    return (
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center hover:bg-blue-700 transition duration-200"
        onClick={sendConnectionRequest}
        aria-label="Send connection request"
      >
        <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
        Connect
      </button>
    );
  };

  const renderProfileDetails = () => {
    if (!user?.usertype) {
      return <p className="text-gray-500">No user type specified.</p>;
    }

    switch (user.usertype) {
      case 'student':
        return (
          <div className="space-y-3">
            <p><strong className="font-medium">Student ID:</strong> {profile?.student_id || 'N/A'}</p>
            <p><strong className="font-medium">Department:</strong> {profile?.department || 'N/A'}</p>
            <p><strong className="font-medium">Admission Year:</strong> {profile?.admission_year || 'N/A'}</p>
            <p><strong className="font-medium">Graduation Year:</strong> {profile?.graduation_year || 'N/A'}</p>
            <p><strong className="font-medium">Phone Number:</strong> {profile?.phone_number || 'N/A'}</p>
            <p><strong className="font-medium">Bio:</strong> {profile?.bio || 'N/A'}</p>
            <p>
              <strong className="font-medium">Achievements:</strong>{' '}
              {profile?.achievements
                ? JSON.parse(profile.achievements).map(a => a.title).join(', ') || 'None'
                : 'None'}
            </p>
            <p>
              <strong className="font-medium">Activities:</strong>{' '}
              {profile?.activities
                ? JSON.parse(profile.activities).map(a => a.name).join(', ') || 'None'
                : 'None'}
            </p>
            <p>
              <strong className="font-medium">Interests:</strong>{' '}
              {profile?.interests
                ? JSON.parse(profile.interests).map(i => i.category).join(', ') || 'None'
                : 'None'}
            </p>
            <p>
              <strong className="font-medium">Skills:</strong>{' '}
              {profile?.skills
                ? JSON.parse(profile.skills).map(s => s.name).join(', ') || 'None'
                : 'None'}
            </p>
            <p>
              <strong className="font-medium">Professional Experiences:</strong>{' '}
              {profile?.professional_experiences
                ? JSON.parse(profile.professional_experiences).map(p => p.position).join(', ') || 'None'
                : 'None'}
            </p>
          </div>
        );
      case 'Alumni':
        return (
          <div className="space-y-3">
            <p><strong className="font-medium">Student ID:</strong> {profile?.student_id || 'N/A'}</p>
            <p><strong className="font-medium">Field of Study:</strong> {profile?.field_of_study || 'N/A'}</p>
            <p><strong className="font-medium">Graduated Year:</strong> {profile?.graduated_year || 'N/A'}</p>
            <p><strong className="font-medium">Employment Status:</strong> {profile?.employment_status || 'N/A'}</p>
            <p><strong className="font-medium">Professional Field:</strong> {profile?.professional_field || 'N/A'}</p>
            <p><strong className="font-medium">Company:</strong> {profile?.company || 'N/A'}</p>
            <p><strong className="font-medium">Job Title:</strong> {profile?.job_title || 'N/A'}</p>
            <p><strong className="font-medium">Phone Number:</strong> {profile?.phone_number || 'N/A'}</p>
            <p><strong className="font-medium">Bio:</strong> {profile?.bio || 'N/A'}</p>
            <p>
              <strong className="font-medium">Work History:</strong>{' '}
              {profile?.work_history
                ? JSON.parse(profile.work_history).map(w => w.position).join(', ') || 'None'
                : 'None'}
            </p>
          </div>
        );
      case 'staff':
        return (
          <div className="space-y-3">
            <p><strong className="font-medium">Position:</strong> {profile?.position || 'N/A'}</p>
            <p><strong className="font-medium">Department:</strong> {profile?.department || 'N/A'}</p>
            <p><strong className="font-medium">Qualifications:</strong> {profile?.qualifications || 'N/A'}</p>
            <p><strong className="font-medium">Expertise:</strong> {profile?.expertise || 'N/A'}</p>
            <p><strong className="font-medium">Years of Experience:</strong> {profile?.years_of_experience || 'N/A'}</p>
          </div>
        );
      case 'company':
        return (
          <div className="space-y-3">
            <p><strong className="font-medium">Company Name:</strong> {profile?.company_name || user?.full_name || 'N/A'}</p>
            <p><strong className="font-medium">Address:</strong> {profile?.company_address || 'N/A'}</p>
            <p><strong className="font-medium">City:</strong> {profile?.company_city || 'N/A'}</p>
            <p><strong className="font-medium">Country:</strong> {profile?.company_country || 'N/A'}</p>
            <p><strong className="font-medium">Postal Code:</strong> {profile?.postal_code || 'N/A'}</p>
            <p><strong className="font-medium">Contact Phone:</strong> {profile?.contact_person_phone_number || 'N/A'}</p>
            <p>
              <strong className="font-medium">Website:</strong>{' '}
              {profile?.website_url ? (
                <a
                  href={profile.website_url}
                  className="text-blue-500 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {profile.website_url}
                </a>
              ) : (
                'N/A'
              )}
            </p>
            <p><strong className="font-medium">Bio:</strong> {profile?.bio || 'N/A'}</p>
          </div>
        );
      case 'admin':
      case 'faculty':
        return (
          <div className="space-y-3">
            <p><strong className="font-medium">Role:</strong> {user.usertype}</p>
            <p><strong className="font-medium">Bio:</strong> {profile?.bio || 'N/A'}</p>
          </div>
        );
      default:
        return <p className="text-gray-500">No profile details available for this user type.</p>;
    }
  };

  if (!user || !profile) {
    return (
      <div className="container mx-auto p-4 sm:p-6 text-center">
        <p className="text-lg text-gray-600">No user data available</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition duration-200"
          aria-label="Go back to previous page"
        >
          Go Back
        </button>
      </div>
    );
  }

  const isAdmin = currentUser?.user?.usertype === 'admin';

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-4xl">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition duration-200 text-sm sm:text-base"
        aria-label="Go back to previous page"
      >
        Back
      </button>
      <div className="bg-white shadow-lg rounded-lg p-6 sm:p-8 mb-6  contact-form">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
          <div className="flex justify-center sm:justify-start">
            <img
              src={
                profile?.profile_picture
                  ? `${BASE_URL}${profile.profile_picture}`
                  : `${BASE_URL}/media/Profile_Picture/default.jpg`
              }
              alt={`${user.full_name}'s profile`}
              className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-2 border-gray-200 object-cover"
              onError={(e) => {
                e.target.src = `${BASE_URL}/media/Profile_Picture/default.jpg`;
              }}
            />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">{user.full_name}</h1>
            <p className="text-gray-600 mb-2">
              <strong className="font-medium">Email:</strong> {user.email || 'N/A'}
            </p>
            <p className="text-gray-600 mb-2">
              <strong className="font-medium">User Type:</strong> {user.usertype || 'N/A'}
            </p>
            {user.usertype === 'company' && (
              <p className="text-gray-600 mb-4">
                <strong className="font-medium">Verified:</strong> {user.is_verified ? 'Yes' : 'No'}
              </p>
            )}
            <div className="mt-4">{renderProfileDetails()}</div>
          </div>
        </div>
      </div>
      {!isAdmin && accessToken && (
        <div className="bg-white shadow-lg rounded-lg p-6 sm:p-8  contact-form">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 dark_text">
            Connect with {user.full_name}
          </h2>
          {renderConnectionButtons()}
        </div>
      )}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default UserProfilePage;