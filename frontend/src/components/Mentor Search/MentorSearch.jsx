// import React, { useState, useEffect } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import axios from 'axios';
// import { ACCESS_TOKEN } from '../../constants';

// const MentorSearch = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { user } = location.state || {};
//   const [searchTerm, setSearchTerm] = useState('');
//   const [mentors, setMentors] = useState([]);
//   const [recommendedMentors, setRecommendedMentors] = useState([]);
//   const [connectionStatuses, setConnectionStatuses] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [hasSearched, setHasSearched] = useState(false);
//   const BASE_URL = import.meta.env.VITE_users_API_URL || 'http://localhost:8000';
//   const accessToken = localStorage.getItem(ACCESS_TOKEN);
//   const UserId = user?.id;

//   useEffect(() => {
//     const fetchRecommendedMentors = async () => {
//       try {
//         const response = await fetch(`${BASE_URL}/users/recommended-mentors/`, {
//           headers: { Authorization: `Bearer ${accessToken}` },
//         });
//         if (!response.ok) {
//           throw new Error('Failed to fetch recommended mentors');
//         }
//         const data = await response.json();
//         const sortedMentors = sortMentorsByInterests(data);
//         setRecommendedMentors(sortedMentors);
//         data.forEach(mentor => {
//           if (mentor.id) {
//             fetchConnectionStatus(mentor.id);
//           }
//         });
//       } catch (err) {
//         toast.error('An error occurred while fetching recommended mentors.');
//         console.error('Recommended mentors error:', err);
//       }
//     };

//     if (accessToken) {
//       fetchRecommendedMentors();
//     }
//   }, [accessToken]);
//   const sortMentorsByInterests = (mentors) => {
//     if (!user?.profile?.interests) return mentors;

//     let userInterests = [];
//     try {
//       userInterests = JSON.parse(user.profile.interests);
//     } catch (err) {
//       console.warn('Error parsing user interests:', err);
//       return mentors;
//     }

//     const interestCategories = userInterests.map(interest => interest.category.toLowerCase());

//     return mentors.sort((a, b) => {
//       const aMatches = interestCategories.some(category =>
//         [
//           a.alumni_profile?.professional_field,
//           a.staff_profile?.expertise,
//           a.staff_profile?.position,
//           a.staff_profile?.department,
//         ].some(field => field && field.toLowerCase().includes(category))
//       );
//       const bMatches = interestCategories.some(category =>
//         [
//           b.alumni_profile?.professional_field,
//           b.staff_profile?.expertise,
//           b.staff_profile?.position,
//           b.staff_profile?.department,
//         ].some(field => field && field.toLowerCase().includes(category))
//       );

//       if (aMatches && !bMatches) return -1;
//       if (!aMatches && bMatches) return 1;
//       return a.full_name.localeCompare(b.full_name);
//     });
//   };

//   const handleSearch = async () => {
//     if (!searchTerm.trim()) {
//       toast.error('Please enter a search term to find mentors.');
//       setHasSearched(true);
//       return;
//     }

//     setLoading(true);
//     setHasSearched(true);
//     try {
//       const response = await fetch(`${BASE_URL}/users/search-mentor/?name=${encodeURIComponent(searchTerm)}`);
//       if (!response.ok) {
//         throw new Error('Failed to fetch search results');
//       }
//       const data = await response.json();
//       setMentors(data);
//       data.forEach(mentor => {
//         if (mentor.id) {
//           fetchConnectionStatus(mentor.id);
//         }
//       });
//     } catch (err) {
//       toast.error('An error occurred while searching for mentors.');
//       console.error('Search error:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchConnectionStatus = async (userId) => {
//     console.log(`Fetching connection status for user ID: ${userId}`);
//     try {
//       const response = await axios.get(`${BASE_URL}/users/connections/status/`, {
//         params: { requestee_id: userId },
//         headers: { Authorization: `Bearer ${accessToken}` },
//       });

//       console.log('API Response for connection status:', response.data);

//       if (response.data[userId]) {
//         const fetchedStatus = response.data[userId];
//         setConnectionStatuses(prev => ({
//           ...prev,
//           [userId]: {
//             status: fetchedStatus.status,
//             connectionId: fetchedStatus.connectionId || null,
//             acceptReject: fetchedStatus.acceptReject || false,
//             requesterId: fetchedStatus.RequesterId,
//           },
//         }));
//       } else {
//         console.warn(`No connection status found for user ID: ${userId}`);
//         setConnectionStatuses(prev => ({
//           ...prev,
//           [userId]: { status: 'none', connectionId: null, acceptReject: false, requesterId: null },
//         }));
//       }
//     } catch (error) {
//       console.error('Error fetching connection status:', error.message, {
//         userId,
//         status: error.response?.status,
//         data: error.response?.data,
//       });
//     }
//   };

//   const sendConnectionRequest = async (requesteeId) => {
//     try {
//       await axios.post(
//         `${BASE_URL}/users/connections/`,
//         { requestee_id: requesteeId },
//         { headers: { Authorization: `Bearer ${accessToken}` } }
//       );
//       toast.success('Connection request sent successfully.');
//       setConnectionStatuses(prev => ({
//         ...prev,
//         [requesteeId]: { status: 'pending', connectionId: null, acceptReject: false, requesterId: UserId },
//       }));
//     } catch (error) {
//       console.error('Error sending connection request:', error);
//       toast.error('Failed to send connection request. Please try again.');
//     }
//   };

//   const acceptConnection = async (connectionId, mentorId) => {
//     try {
//       await axios.post(
//         `${BASE_URL}/users/connections/${connectionId}/accept/`,
//         {},
//         { headers: { Authorization: `Bearer ${accessToken}` } }
//       );
//       toast.success('Connection accepted successfully.');
//       setConnectionStatuses(prev => ({
//         ...prev,
//         [mentorId]: { status: 'accepted', connectionId, acceptReject: false, requesterId: prev[mentorId]?.requesterId },
//       }));
//     } catch (error) {
//       console.error('Error accepting connection:', error.response);
//       toast.error('Failed to accept connection. Please try again.');
//     }
//   };

//   const rejectConnection = async (connectionId, mentorId) => {
//     try {
//       await axios.post(
//         `${BASE_URL}/users/connections/${connectionId}/reject/`,
//         {},
//         { headers: { Authorization: `Bearer ${accessToken}` } }
//       );
//       toast.success('Connection rejected successfully.');
//       setConnectionStatuses(prev => ({
//         ...prev,
//         [mentorId]: { status: 'rejected', connectionId, acceptReject: false, requesterId: prev[mentorId]?.requesterId },
//       }));
//     } catch (error) {
//       console.error('Error rejecting connection:', error.response);
//       toast.error('Failed to reject connection. Please try again.');
//     }
//   };

//   const cancelRejectRequest = async (connectionId, mentorId) => {
//     try {
//       await axios.post(
//         `${BASE_URL}/users/connections/cancel-reject/${connectionId}/`,
//         {},
//         { headers: { Authorization: `Bearer ${accessToken}` } }
//       );
//       toast.success('Rejection cancelled successfully.');
//       setConnectionStatuses(prev => ({
//         ...prev,
//         [mentorId]: { status: 'none', connectionId: null, acceptReject: false, requesterId: null },
//       }));
//     } catch (error) {
//       console.error('Error cancelling rejection:', error.response);
//       toast.error('Failed to cancel rejection. Please try again.');
//     }
//   };

//   const MentorTable = ({ mentors, title }) => (
//     <>
//       <h2 className="text-xl font-semibold mt-6 mb-4">{title}</h2>
//       {mentors.length > 0 ? (
//         <div className="overflow-x-auto">
//           <table className="min-w-full border-collapse border border-gray-300">
//             <thead>
//               <tr className="bg-gray-200">
//                 <th className="border border-gray-300 p-3 text-left text-sm font-semibold">#</th>
//                 <th className="border border-gray-300 p-3 text-left text-sm font-semibold">Full Name</th>
//                 <th className="border border-gray-300 p-3 text-left text-sm font-semibold">Email</th>
//                 <th className="border border-gray-300 p-3 text-left text-sm font-semibold">User Type</th>
//                 <th className="border border-gray-300 p-3 text-left text-sm font-semibold">Department</th>
//                 <th className="border border-gray-300 p-3 text-left text-sm font-semibold">Professional Field</th>
//                 <th className="border border-gray-300 p-3 text-left text-sm font-semibold">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {mentors.map((mentor, index) => (
//                 <tr key={mentor.id} className="hover:bg-gray-100">
//                   <td className="border border-gray-300 p-3">{index + 1}</td>
//                   <td className="border border-gray-300 p-3">
//                     <button
//                       onClick={() =>
//                         navigate(`/profile/${mentor.id}`, {
//                           state: {
//                             user: {
//                               user_id: mentor.id,
//                               full_name: mentor.full_name,
//                               email: mentor.email,
//                               usertype:
//                                 mentor.alumni_profile?.user.usertype ||
//                                 mentor.staff_profile?.user.usertype ||
//                                 'unknown',
//                             },
//                             profile: mentor.alumni_profile || mentor.staff_profile || {},
//                           },
//                         })
//                       }
//                       className="text-blue-500 hover:underline"
//                       aria-label={`View profile of ${mentor.full_name}`}
//                     >
//                       {mentor.full_name}
//                     </button>
//                   </td>
//                   <td className="border border-gray-300 p-3">{mentor.email}</td>
//                   <td className="border border-gray-300 p-3">
//                     {mentor.alumni_profile?.user.usertype || mentor.staff_profile?.user.usertype || 'N/A'}
//                   </td>
//                   <td className="border border-gray-300 p-3">
//                     {mentor.staff_profile?.department || mentor.alumni_profile?.field_of_study || 'N/A'}
//                   </td>
//                   <td className="border border-gray-300 p-3">
//                     {mentor.alumni_profile?.professional_field || mentor.staff_profile?.expertise || 'N/A'}
//                   </td>
//                   <td className="border border-gray-300 p-3">
//                     {connectionStatuses[mentor.id] ? (
//                       connectionStatuses[mentor.id].acceptReject ? (
//                         <div className="flex gap-2">
//                           <button
//                             className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
//                             onClick={() =>
//                               acceptConnection(connectionStatuses[mentor.id].connectionId, mentor.id)
//                             }
//                             aria-label={`Accept connection request from ${mentor.full_name}`}
//                           >
//                             Accept
//                           </button>
//                           <button
//                             className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
//                             onClick={() =>
//                               rejectConnection(connectionStatuses[mentor.id].connectionId, mentor.id)
//                             }
//                             aria-label={`Reject connection request from ${mentor.full_name}`}
//                           >
//                             Reject
//                           </button>
//                         </div>
//                       ) : connectionStatuses[mentor.id].status === 'pending' ? (
//                         <button
//                           className="bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed"
//                           disabled
//                           aria-label="Connection request pending"
//                         >
//                           Request Pending
//                         </button>
//                       ) : connectionStatuses[mentor.id].status === 'accepted' ? (
//                         <button
//                           className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
//                           onClick={() =>
//                             navigate(`/chat/${mentor.id}`, {
//                               state: {
//                                 friend: {
//                                   id: mentor.id,
//                                   full_name: mentor.full_name,
//                                   email: mentor.email,
//                                   profile_pic:
//                                     mentor.alumni_profile?.profile_picture ||
//                                     mentor.staff_profile?.profile_picture,
//                                 },
//                                 user,
//                               },
//                             })
//                           }
//                           aria-label={`Message ${mentor.full_name}`}
//                         >
//                           Message
//                         </button>
//                       ) : connectionStatuses[mentor.id].status === 'rejected' ? (
//                         connectionStatuses[mentor.id].requesterId === UserId ? (
//                           <button
//                             className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//                             onClick={() =>
//                               cancelRejectRequest(connectionStatuses[mentor.id].connectionId, mentor.id)
//                             }
//                             aria-label={`Cancel rejected connection with ${mentor.full_name}`}
//                           >
//                             Cancel Reject
//                           </button>
//                         ) : (
//                           <button
//                             className="bg-red-500 text-white px-4 py-2 rounded cursor-not-allowed"
//                             disabled
//                             aria-label="Connection rejected"
//                           >
//                             Rejected
//                           </button>
//                         )
//                       ) : (
//                         <button
//                           className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//                           onClick={() => sendConnectionRequest(mentor.id)}
//                           aria-label={`Send connection request to ${mentor.full_name}`}
//                         >
//                           Connect
//                         </button>
//                       )
//                     ) : (
//                       <button
//                         className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//                         onClick={() => sendConnectionRequest(mentor.id)}
//                         aria-label={`Send connection request to ${mentor.full_name}`}
//                       >
//                         Connect
//                       </button>
//                     )}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       ) : (
//         <p className="text-gray-600">No mentors found.</p>
//       )}
//     </>
//   );

//   return (
//     <div className="p-6 max-w-7xl mx-auto">
//       <ToastContainer />
//       <h1 className="text-2xl font-bold mb-6">Mentor Search</h1>
//       <div className="mb-6 flex items-center gap-4">
//         <input
//           type="text"
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           placeholder="Search for mentors by name, skills, or expertise..."
//           className="border border-gray-300 rounded-lg p-3 flex-grow text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
//           aria-label="Search mentors by name, skills, or expertise"
//         />
//         <button
//           onClick={handleSearch}
//           className="bg-blue-500 text-white rounded-lg p-3 hover:bg-blue-600 transition duration-200 text-sm sm:text-base"
//           aria-label="Search mentors"
//         >
//           Search
//         </button>
//       </div>

//       {loading && <p className="text-gray-600">Loading...</p>}

//       {hasSearched && <MentorTable mentors={mentors} title="Search Results" />}

//       <MentorTable mentors={recommendedMentors} title="Recommended Mentors" />
//     </div>
//   );
// };

// export default MentorSearch;


import React, { useState, useEffect } from 'react';
import { useNavigate , useLocation} from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { ACCESS_TOKEN } from '../../constants';

const MentorSearch = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile } = location.state || {};
  const [searchTerm, setSearchTerm] = useState('');
  const [mentors, setMentors] = useState([]);
  const [recommendedMentors, setRecommendedMentors] = useState([]);
  const [connectionStatuses, setConnectionStatuses] = useState({});
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const BASE_URL = import.meta.env.VITE_users_API_URL || 'http://localhost:8000';
  const accessToken = localStorage.getItem(ACCESS_TOKEN);
  const currentUser = {user}

  const UserId = currentUser?.id;


  useEffect(() => {
    const fetchRecommendedMentors = async () => {
      try {
        const response = await fetch(`${BASE_URL}/users/recommended-mentors/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch recommended mentors');
        }
        const data = await response.json();
        const sortedMentors = sortMentorsByInterests(data);
        setRecommendedMentors(sortedMentors);
        data.forEach(mentor => {
          if (mentor.id) {
            fetchConnectionStatus(mentor.id);
          }
        });
      } catch (err) {
        toast.error('An error occurred while fetching recommended mentors.');
        console.error('Recommended mentors error:', err);
      }
    };

    if (accessToken) {
      fetchRecommendedMentors();
    }
  }, [accessToken]);

  const sortMentorsByInterests = (mentors) => {
    if (!currentUser?.profile?.interests) return mentors;

    let userInterests = [];
    try {
      userInterests = JSON.parse(currentUser.profile.interests);
    } catch (err) {
      console.warn('Error parsing user interests:', err);
      return mentors;
    }

    const interestCategories = userInterests.map(interest => interest.category.toLowerCase());

    return mentors.sort((a, b) => {
      const aMatches = interestCategories.some(category =>
        [
          a.alumni_profile?.professional_field,
          a.staff_profile?.expertise,
          a.staff_profile?.position,
          a.staff_profile?.department,
        ].some(field => field && field.toLowerCase().includes(category))
      );
      const bMatches = interestCategories.some(category =>
        [
          b.alumni_profile?.professional_field,
          b.staff_profile?.expertise,
          b.staff_profile?.position,
          b.staff_profile?.department,
        ].some(field => field && field.toLowerCase().includes(category))
      );

      if (aMatches && !bMatches) return -1;
      if (!aMatches && bMatches) return 1;
      return a.full_name.localeCompare(b.full_name);
    });
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error('Please enter a search term to find mentors.');
      setHasSearched(true);
      return;
    }

    setLoading(true);
    setHasSearched(true);
    try {
      const response = await fetch(`${BASE_URL}/users/search-mentor/?name=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch search results');
      }
      const data = await response.json();
      setMentors(data);
      data.forEach(mentor => {
        if (mentor.id) {
          fetchConnectionStatus(mentor.id);
        }
      });
    } catch (err) {
      toast.error('An error occurred while searching for mentors.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchConnectionStatus = async (userId) => {
    console.log(`Fetching connection status for user ID: ${userId}`);
    try {
      const response = await axios.get(`${BASE_URL}/users/connections/status/`, {
        params: { requestee_id: userId },
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      console.log('API Response for connection status:', response.data);

      if (response.data[userId]) {
        const fetchedStatus = response.data[userId];
        setConnectionStatuses(prev => ({
          ...prev,
          [userId]: {
            status: fetchedStatus.status,
            connectionId: fetchedStatus.connectionId || null,
            acceptReject: fetchedStatus.acceptReject || false,
            requesterId: fetchedStatus.RequesterId,
          },
        }));
      } else {
        console.warn(`No connection status found for user ID: ${userId}`);
        setConnectionStatuses(prev => ({
          ...prev,
          [userId]: { status: 'none', connectionId: null, acceptReject: false, requesterId: null },
        }));
      }
    } catch (error) {
      console.error('Error fetching connection status:', error.message, {
        userId,
        status: error.response?.status,
        data: error.response?.data,
      });
    }
  };

  const sendConnectionRequest = async (requesteeId) => {
    try {
      await axios.post(
        `${BASE_URL}/users/connections/`,
        { requestee_id: requesteeId },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      toast.success('Connection request sent successfully.');
      setConnectionStatuses(prev => ({
        ...prev,
        [requesteeId]: { status: 'pending', connectionId: null, acceptReject: false, requesterId: UserId },
      }));
    } catch (error) {
      console.error('Error sending connection request:', error);
      toast.error('Failed to send connection request. Please try again.');
    }
  };

  const acceptConnection = async (connectionId, mentorId) => {
    try {
      await axios.post(
        `${BASE_URL}/users/connections/${connectionId}/accept/`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      toast.success('Connection accepted successfully.');
      setConnectionStatuses(prev => ({
        ...prev,
        [mentorId]: { status: 'accepted', connectionId, acceptReject: false, requesterId: prev[mentorId]?.requesterId },
      }));
    } catch (error) {
      console.error('Error accepting connection:', error.response);
      toast.error('Failed to accept connection. Please try again.');
    }
  };

  const rejectConnection = async (connectionId, mentorId) => {
    try {
      await axios.post(
        `${BASE_URL}/users/connections/${connectionId}/reject/`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      toast.success('Connection rejected successfully.');
      setConnectionStatuses(prev => ({
        ...prev,
        [mentorId]: { status: 'rejected', connectionId, acceptReject: false, requesterId: prev[mentorId]?.requesterId },
      }));
    } catch (error) {
      console.error('Error rejecting connection:', error.response);
      toast.error('Failed to reject connection. Please try again.');
    }
  };

  const cancelRejectRequest = async (connectionId, mentorId) => {
    try {
      await axios.post(
        `${BASE_URL}/users/connections/cancel-reject/${connectionId}/`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      toast.success('Rejection cancelled successfully.');
      setConnectionStatuses(prev => ({
        ...prev,
        [mentorId]: { status: 'none', connectionId: null, acceptReject: false, requesterId: null },
      }));
    } catch (error) {
      console.error('Error cancelling rejection:', error.response);
      toast.error('Failed to cancel rejection. Please try again.');
    }
  };

  const MentorTable = ({ mentors, title }) => (
    <>
      <h2 className="text-xl font-semibold mt-6 mb-4">{title}</h2>
      {mentors.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr className=" bg-transparent">
                <th className="border border-gray-300 p-3 text-left text-sm font-semibold">#</th>
                <th className="border border-gray-300 p-3 text-left text-sm font-semibold">Full Name</th>
                <th className="border border-gray-300 p-3 text-left text-sm font-semibold">Email</th>
                <th className="border border-gray-300 p-3 text-left text-sm font-semibold">User Type</th>
                <th className="border border-gray-300 p-3 text-left text-sm font-semibold">Department</th>
                <th className="border border-gray-300 p-3 text-left text-sm font-semibold">Professional Field</th>
                <th className="border border-gray-300 p-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mentors.map((mentor, index) => (
                <tr key={mentor.id} className="">
                  <td className="border border-gray-300 p-3">{index + 1}</td>
                  <td className="border border-gray-300 p-3">
                    <button
                      onClick={() =>
                        navigate(`/profile/${mentor.id}`, {
                          state: {
                            user: {
                              user_id: mentor.id,
                              full_name: mentor.full_name,
                              email: mentor.email,
                              usertype:
                                mentor.alumni_profile?.user.usertype ||
                                mentor.staff_profile?.user.usertype ||
                                'unknown',
                            },
                            profile: mentor.alumni_profile || mentor.staff_profile || {},
                            currentUser: currentUser,
                          },
                        })
                      }
                      className="text-blue-500 hover:underline"
                      aria-label={`View profile of ${mentor.full_name}`}
                    >
                      {mentor.full_name}
                    </button>
                  </td>
                  <td className="border border-gray-300 p-3">{mentor.email}</td>
                  <td className="border border-gray-300 p-3">
                    {mentor.alumni_profile?.user.usertype || mentor.staff_profile?.user.usertype || 'N/A'}
                  </td>
                  <td className="border border-gray-300 p-3">
                    {mentor.staff_profile?.department || mentor.alumni_profile?.field_of_study || 'N/A'}
                  </td>
                  <td className="border border-gray-300 p-3">
                    {mentor.alumni_profile?.professional_field || mentor.staff_profile?.expertise || 'N/A'}
                  </td>
                  <td className="border border-gray-300 p-3">
                    {connectionStatuses[mentor.id] ? (
                      connectionStatuses[mentor.id].acceptReject ? (
                        <div className="flex gap-2">
                          <button
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                            onClick={() =>
                              acceptConnection(connectionStatuses[mentor.id].connectionId, mentor.id)
                            }
                            aria-label={`Accept connection request from ${mentor.full_name}`}
                          >
                            Accept
                          </button>
                          <button
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                            onClick={() =>
                              rejectConnection(connectionStatuses[mentor.id].connectionId, mentor.id)
                            }
                            aria-label={`Reject connection request from ${mentor.full_name}`}
                          >
                            Reject
                          </button>
                        </div>
                      ) : connectionStatuses[mentor.id].status === 'pending' ? (
                        <button
                          className="bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed"
                          disabled
                          aria-label="Connection request pending"
                        >
                          Request Pending
                        </button>
                      ) : connectionStatuses[mentor.id].status === 'accepted' ? (
                        <button
                          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                          onClick={() =>
                            navigate(`/chat/${mentor.id}`, {
                              state: {
                                friend: {
                                  id: mentor.id,
                                  full_name: mentor.full_name,
                                  email: mentor.email,
                                  profile_pic:
                                    mentor.alumni_profile?.profile_picture ||
                                    mentor.staff_profile?.profile_picture,
                                },
                                user: currentUser,
                              },
                            })
                          }
                          aria-label={`Message ${mentor.full_name}`}
                        >
                          Message
                        </button>
                      ) : connectionStatuses[mentor.id].status === 'rejected' ? (
                        connectionStatuses[mentor.id].requesterId === UserId ? (
                          <button
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            onClick={() =>
                              cancelRejectRequest(connectionStatuses[mentor.id].connectionId, mentor.id)
                            }
                            aria-label={`Cancel rejected connection with ${mentor.full_name}`}
                          >
                            Cancel Reject
                          </button>
                        ) : (
                          <button
                            className="bg-red-500 text-white px-4 py-2 rounded cursor-not-allowed"
                            disabled
                            aria-label="Connection rejected"
                          >
                            Rejected
                          </button>
                        )
                      ) : (
                        <button
                          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                          onClick={() => sendConnectionRequest(mentor.id)}
                          aria-label={`Send connection request to ${mentor.full_name}`}
                        >
                          Connect
                        </button>
                      )
                    ) : (
                      <button
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        onClick={() => sendConnectionRequest(mentor.id)}
                        aria-label={`Send connection request to ${mentor.full_name}`}
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
      ) : (
        <p className="text-gray-600">No mentors found.</p>
      )}
    </>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto dark_body">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-6">Mentor Search</h1>
      <div className="mb-6 flex items-center gap-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for mentors by name, skills, or expertise..."
          className="border bg-transparent border-gray-300 rounded-lg p-3 flex-grow text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Search mentors by name, skills, or expertise"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white rounded-lg p-3 hover:bg-blue-600 transition duration-200 text-sm sm:text-base"
          aria-label="Search mentors"
        >
          Search
        </button>
      </div>

      {loading && <p className="text-gray-600">Loading...</p>}

      {hasSearched && <MentorTable mentors={mentors} title="Search Results" />}

      <MentorTable mentors={recommendedMentors} title="Recommended Mentors" />
    </div>
  );
};

export default MentorSearch;