// // import React, { useState, useEffect, useRef } from 'react';
// // import { useParams, useLocation } from 'react-router-dom';
// // import { toast } from 'react-toastify';
// // import axios from 'axios';
// // import { ACCESS_TOKEN } from '../../constants';

// // const AdminForumDashboard = () => {
// //   const { eventId } = useParams();
// //   const location = useLocation();
// //   const { event } = location.state || {};
// //   const [activeTab, setActiveTab] = useState('messages');
// //   const [messages, setMessages] = useState([]);
// //   const [participants, setParticipants] = useState([]);
// //   const [isLoading, setIsLoading] = useState(false);
// //   const socketRef = useRef(null);
// //   const BASE_URL = import.meta.env.VITE_users_API_URL || 'http://localhost:8000';
// //   const accessToken = localStorage.getItem(ACCESS_TOKEN);
// //   const POLLING_INTERVAL = 5000; 

// //   useEffect(() => {
// //     const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
// //     const socketUrl = `${protocol}//localhost:8000/ws/discussion_forum/admin/forum/${eventId}/?token=${accessToken}`;
// //     console.log('Attempting to connect to WebSocket:', socketUrl);
// //     console.log('Attempting to connect to WebSocket:', socketUrl);

// //     socketRef.current = new WebSocket(socketUrl);

// //     socketRef.current.onopen = () => {
// //       console.log('Admin WebSocket connected');
// //     };

// //     socketRef.current.onmessage = (event) => {
// //       try {
// //         const data = JSON.parse(event.data);
// //         handleWebSocketMessage(data);
// //       } catch (error) {
// //         console.error('Error parsing WebSocket message:', error);
// //       }
// //     };

// //     socketRef.current.onclose = (event) => {
// //       console.log('WebSocket disconnected. Code:', event.code, 'Reason:', event.reason);
// //       console.log('WebSocket readyState:', socketRef.current.readyState);
// //       if (event.code === 4001) {
// //         toast.error('WebSocket authentication failed. Please log in again.');
// //         refreshToken().then((newToken) => {
// //           if (newToken) {
// //             socketRef.current = new WebSocket(`${socketUrl.replace(/token=[^&]*/, `token=${newToken}`)}`);
// //             console.log('Reconnecting to WebSocket with new token:', socketUrl);
// //           }
// //         }).catch(() => {
// //           window.location.href = '/login';
// //         });
// //       } else if (event.code !== 1000) {
// //         toast.error('WebSocket connection lost. Attempting to reconnect...');
// //         setTimeout(() => {
// //           socketRef.current = new WebSocket(socketUrl);
// //           console.log('Reconnecting to WebSocket:', socketUrl);
// //         }, 5000);
// //       } else if (event.code === 1006) {
// //         toast.error('WebSocket connection closed unexpectedly. Please refresh the page.');
// //       }
// //     };

// //     socketRef.current.onerror = (error) => {
// //       console.error('WebSocket error:', error);
// //       toast.error('Connection to real-time updates failed');
// //     };


// //     const pollingInterval = setInterval(() => {
// //       fetchData();
// //       console.log('WebSocket readyState:', socketRef.current.readyState);
// //     }, POLLING_INTERVAL);

// //     return () => {
// //       if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
// //         socketRef.current.close();
// //       }
// //       clearInterval(pollingInterval);
// //     };
// //   }, [eventId, accessToken]);

// //   const handleWebSocketMessage = (data) => {
// //     console.log('Received WebSocket message:', data);
// //     switch (data.type) {
// //       case 'new_message':
// //         setMessages((prev) => {
// //           // Avoid duplicates
// //           if (!prev.find((msg) => msg.id === data.message.id)) {
// //             return [data.message, ...prev];
// //           }
// //           return prev;
// //         });
// //         break;
// //       case 'message_deleted':
// //         setMessages((prev) => prev.filter((msg) => msg.id !== data.message_id));
// //         break;
// //       case 'accepted':
// //       case 'declined':
// //         fetchParticipants();
// //         toast.info(data.message);
// //         break;
// //       case 'user_online':
// //         setParticipants((prev) =>
// //           prev.map((p) =>
// //             p.user_id === data.user_id ? { ...p, is_online: true } : p
// //           )
// //         );
// //         break;
// //       case 'user_offline':
// //         setParticipants((prev) =>
// //           prev.map((p) =>
// //             p.user_id === data.user_id ? { ...p, is_online: false } : p
// //           )
// //         );
// //         break;
// //       default:
// //         console.log('Unhandled WebSocket message:', data);
// //     }
// //   };

// //   const fetchData = async () => {
// //     if (!accessToken) {
// //       console.error('No access token available');
// //       return;
// //     }
// //     setIsLoading(true);
// //     try {
// //       const endpoints = {
// //         messages: `${BASE_URL}/discussion_forum/admin/forum/event/${eventId}/messages/`,
// //         participants: `${BASE_URL}/discussion_forum/events/${eventId}/participants/`,
// //       };

// //       const response = await axios.get(endpoints[activeTab], {
// //         headers: { Authorization: `Bearer ${accessToken}` },
// //       });

// //       switch (activeTab) {
// //         case 'messages':
// //           setMessages(response.data);
// //           break;
// //         case 'participants':
// //           setParticipants(
// //             response.data.map((p) => ({ ...p, is_online: p.is_online || false }))
// //           );
// //           break;
// //       }
// //     } catch (error) {
// //       console.error(`Failed to load ${activeTab} data:`, error);
// //       toast.error(`Failed to load ${activeTab} data`);
// //       if (error.response?.status === 401) {
// //         try {
// //           await refreshToken();
// //           fetchData();
// //         } catch (refreshError) {
// //           console.error('Token refresh failed:', refreshError);
// //         }
// //       }
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   const handleAcceptParticipant = async (participantId) => {
// //     try {
// //       await axios.post(
// //         `${BASE_URL}/discussion_forum/participants/${participantId}/accept/`,
// //         {},
// //         { headers: { Authorization: `Bearer ${accessToken}` } }
// //       );
// //       toast.success('Participant accepted');
// //       fetchParticipants();
// //     } catch (error) {
// //       console.error('Failed to accept participant:', error);
// //       toast.error('Failed to accept participant');
// //     }
// //   };

// //   const handleDeclineParticipant = async (participantId) => {
// //     try {
// //       await axios.post(
// //         `${BASE_URL}/discussion_forum/participants/${participantId}/decline/`,
// //         {},
// //         { headers: { Authorization: `Bearer ${accessToken}` } }
// //       );
// //       toast.success('Participant declined');
// //       fetchParticipants();
// //     } catch (error) {
// //       console.error('Failed to decline participant:', error);
// //       toast.error('Failed to decline participant');
// //     }
// //   };

// //   const handleDeleteMessage = async (messageId) => {
// //     try {
// //       await axios.delete(
// //         `${BASE_URL}/discussion_forum/admin/forum/messages/${messageId}/`,
// //         { headers: { Authorization: `Bearer ${accessToken}` } }
// //       );
// //       toast.success('Message deleted successfully');
// //     } catch (error) {
// //       console.error('Failed to delete message:', error);
// //       toast.error('Failed to delete message');
// //     }
// //   };

// //   const refreshToken = async () => {
// //     try {
// //       const response = await axios.post(`${BASE_URL}/api/token/refresh/`, {
// //         refresh: localStorage.getItem('refreshToken'),
// //       });
// //       const newAccessToken = response.data.access;
// //       localStorage.setItem(ACCESS_TOKEN, newAccessToken);
// //       console.log('Token refreshed');
// //       return newAccessToken;
// //     } catch (error) {
// //       console.error('Token refresh failed:', error.response?.data);
// //       window.location.href = '/login';
// //       throw error;
// //     }
// //   };

// //   useEffect(() => {
// //     fetchData();
// //   }, [eventId, activeTab]);

// //   console.log('Messages:', messages);
// //   console.log('Participants:', participants);

// //   return (
// //     <div className="container mx-auto p-4">
// //       <div className="flex justify-between items-center mb-6">
// //         <div>
// //           <h1 className="text-3xl font-bold">Forum Admin Dashboard</h1>
// //           <h2 className="text-xl mt-2">
// //             Event: {event?.title || 'Loading...'}
// //           </h2>
// //         </div>
// //         <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg">
// //           {socketRef.current?.readyState === WebSocket.OPEN ? (
// //             <span className="flex items-center">
// //               <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
// //               Real-time updates active
// //             </span>
// //           ) : (
// //             <span className="flex items-center">
// //               <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
// //               Reconnecting...
// //             </span>
// //           )}
// //         </div>
// //       </div>

// //       <div className="flex border-b mb-6">
// //         {['messages', 'participants'].map((tab) => (
// //           <button
// //             key={tab}
// //             className={`px-4 py-2 font-medium ${
// //               activeTab === tab
// //                 ? 'border-b-2 border-blue-500 text-blue-600'
// //                 : 'text-gray-500 hover:text-gray-700'
// //             }`}
// //             onClick={() => setActiveTab(tab)}
// //           >
// //             {tab.charAt(0).toUpperCase() + tab.slice(1)}
// //           </button>
// //         ))}
// //       </div>

// //       {isLoading ? (
// //         <div className="flex justify-center items-center h-64">
// //           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
// //         </div>
// //       ) : (
// //         <>
// //           {activeTab === 'messages' && (
// //             <div className="bg-white rounded-lg shadow overflow-hidden">
// //               <table className="min-w-full divide-y divide-gray-200">
// //                 <thead className="bg-gray-50">
// //                   <tr>
// //                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
// //                       Sender
// //                     </th>
// //                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
// //                       Message
// //                     </th>
// //                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
// //                       Date
// //                     </th>
// //                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
// //                       Actions
// //                     </th>
// //                   </tr>
// //                 </thead>
// //                 <tbody className="bg-white divide-y divide-gray-200">
// //                   {messages.map((message) => (
// //                     <tr key={message.id}>
// //                       <td className="px-6 py-4 whitespace-nowrap">
// //                         <div className="text-sm font-medium text-gray-900">
// //                           {message.sender}
// //                         </div>
// //                       </td>
// //                       <td className="px-6 py-4">
// //                         <div className="text-sm text-gray-900">
// //                           {message.content}
// //                         </div>
// //                       </td>
// //                       <td className="px-6 py-4 whitespace-nowrap">
// //                         <div className="text-sm text-gray-500">
// //                           {new Date(message.created_at).toLocaleString()}
// //                         </div>
// //                       </td>
// //                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
// //                         <button
// //                           onClick={() => handleDeleteMessage(message.id)}
// //                           className="text-red-600 hover:text-red-900"
// //                         >
// //                           Delete
// //                         </button>
// //                       </td>
// //                     </tr>
// //                   ))}
// //                 </tbody>
// //               </table>
// //             </div>
// //           )}

// //           {activeTab === 'participants' && (
// //             <div className="bg-white rounded-lg shadow overflow-hidden">
// //               <table className="min-w-full divide-y divide-gray-200">
// //                 <thead className="bg-gray-50">
// //                   <tr>
// //                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
// //                       User Name
// //                     </th>
// //                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
// //                       Joined At
// //                     </th>
// //                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
// //                       Status
// //                     </th>
// //                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
// //                       Online
// //                     </th>
// //                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
// //                       Actions
// //                     </th>
// //                   </tr>
// //                 </thead>
// //                 <tbody className="bg-white divide-y divide-gray-200">
// //                   {participants.map((participant) => (
// //                     <tr key={participant.id}>
// //                       <td className="px-6 py-4 whitespace-nowrap">
// //                         <div className="text-sm font-medium text-gray-900">
// //                           {participant.user_name}
// //                         </div>
// //                       </td>
// //                       <td className="px-6 py-4 whitespace-nowrap">
// //                         <div className="text-sm text-gray-500">
// //                           {new Date(participant.joined_at).toLocaleString()}
// //                         </div>
// //                       </td>
// //                       <td className="px-6 py-4 whitespace-nowrap">
// //                         <div className="text-sm text-gray-500">
// //                           {participant.is_accepted ? 'Accepted' : 'Pending'}
// //                         </div>
// //                       </td>
// //                       <td className="px-6 py-4 whitespace-nowrap">
// //                         <div className="text-sm">
// //                           {participant.is_online ? (
// //                             <span className="text-green-600">Online</span>
// //                           ) : (
// //                             <span className="text-red-600">Offline</span>
// //                           )}
// //                         </div>
// //                       </td>
// //                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
// //                         {!participant.is_accepted && (
// //                           <>
// //                             <button
// //                               onClick={() => handleAcceptParticipant(participant.id)}
// //                               className="text-green-600 hover:text-green-900 mr-4"
// //                             >
// //                               Accept
// //                             </button>
// //                             <button
// //                               onClick={() => handleDeclineParticipant(participant.id)}
// //                               className="text-red-600 hover:text-red-900"
// //                             >
// //                               Decline
// //                             </button>
// //                           </>
// //                         )}
// //                       </td>
// //                     </tr>
// //                   ))}
// //                 </tbody>
// //               </table>
// //             </div>
// //           )}
// //         </>
// //       )}
// //     </div>
// //   );
// // };

// // export default AdminForumDashboard;






// import React, { useState, useEffect, useRef } from 'react';
// import { useParams, useLocation } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import axios from 'axios';
// import { ACCESS_TOKEN } from '../../constants';

// const AdminForumDashboard = () => {
//   const { eventId } = useParams();
//   const location = useLocation();
//   const { event } = location.state || {};
//   const [activeTab, setActiveTab] = useState('messages');
//   const [messages, setMessages] = useState([]);
//   const [participants, setParticipants] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const socketRef = useRef(null);
//   const BASE_URL = import.meta.env.VITE_users_API_URL || 'http://localhost:8000';
//   const accessToken = localStorage.getItem(ACCESS_TOKEN);

//   useEffect(() => {
//     fetchData();
//   }, [eventId, activeTab]);

//   useEffect(() => {
//     if (!accessToken) {
//       console.error('Missing accessToken');
//       toast.error('Please log in as admin');
//       return;
//     }

//     const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
//     const socketUrl = `${protocol}//localhost:8000/ws/discussion_forum/admin/forum/${eventId}/?token=${accessToken}`;
//     console.log('Attempting to connect to WebSocket:', socketUrl);

//     socketRef.current = new WebSocket(socketUrl);

//     socketRef.current.onopen = () => {
//       console.log('Admin WebSocket connected');
//     };

//     socketRef.current.onmessage = (event) => {
//       try {
//         const data = JSON.parse(event.data);
//         console.log('Received WebSocket message:', data);
//         if (data.error) {
//           toast.error(data.error);
//           return;
//         }
//         switch (data.type) {
//           case 'new_message':
//             setMessages((prev) => {
//               if (!prev.find((msg) => msg.id === data.message.id)) {
//                 return [data.message, ...prev];
//               }
//               return prev;
//             });
//             break;
//           case 'message_deleted':
//             setMessages((prev) => prev.filter((msg) => msg.id !== data.message_id));
//             break;
//           case 'accepted':
//           case 'declined':
//             fetchParticipants();
//             toast.info(data.message);
//             break;
//           case 'user_online':
//             setParticipants((prev) =>
//               prev.map((p) =>
//                 p.user_id === data.user_id ? { ...p, is_online: true } : p
//               )
//             );
//             break;
//           case 'user_offline':
//             setParticipants((prev) =>
//               prev.map((p) =>
//                 p.user_id === data.user_id ? { ...p, is_online: false } : p
//               )
//             );
//             break;
//           default:
//             console.log('Unhandled WebSocket message:', data);
//         }
//       } catch (error) {
//         console.error('Error parsing WebSocket message:', error);
//       }
//     };

//     socketRef.current.onclose = (event) => {
//       console.log('WebSocket disconnected. Code:', event.code, 'Reason:', event.reason);
//       if (event.code === 4001) {
//         toast.error('WebSocket authentication failed. Please log in again.');
//         refreshToken().then((newToken) => {
//           if (newToken) {
//             socketRef.current = new WebSocket(`${socketUrl.replace(/token=[^&]*/, `token=${newToken}`)}`);
//           }
//         }).catch(() => {
//           window.location.href = '/login';
//         });
//       } else if (event.code !== 1000) {
//         toast.error('WebSocket connection lost. Attempting to reconnect...');
//         setTimeout(() => {
//           socketRef.current = new WebSocket(socketUrl);
//         }, 5000);
//       }
//     };

//     socketRef.current.onerror = (error) => {
//       console.error('WebSocket error:', error);
//       toast.error('Connection to real-time updates failed');
//     };

//     return () => {
//       if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
//         socketRef.current.close();
//       }
//     };
//   }, [eventId, accessToken]);

//   const fetchData = async () => {
//     setIsLoading(true);
//     try {
//       const endpoints = {
//         messages: `${BASE_URL}/discussion_forum/admin/forum/event/${eventId}/messages/`,
//         participants: `${BASE_URL}/discussion_forum/events/${eventId}/participants/`,
//       };

//       const response = await axios.get(endpoints[activeTab], {
//         headers: { Authorization: `Bearer ${accessToken}` },
//       });

//       switch (activeTab) {
//         case 'messages':
//           setMessages(response.data);
//           break;
//         case 'participants':
//           setParticipants(
//             response.data.map((p) => ({ ...p, is_online: p.is_online || false }))
//           );
//           break;
//       }
//     } catch (error) {
//       toast.error(`Failed to load ${activeTab} data`);
//       console.error(error);
//       if (error.response?.status === 401) {
//         await refreshToken();
//         fetchData();
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleAcceptParticipant = async (participantId) => {
//     try {
//       await axios.post(
//         `${BASE_URL}/discussion_forum/participants/${participantId}/accept/`,
//         {},
//         { headers: { Authorization: `Bearer ${accessToken}` } }
//       );
//       toast.success('Participant accepted');
//       fetchParticipants();
//     } catch (error) {
//       toast.error('Failed to accept participant');
//       console.error(error);
//     }
//   };

//   const handleDeclineParticipant = async (participantId) => {
//     try {
//       await axios.post(
//         `${BASE_URL}/discussion_forum/participants/${participantId}/decline/`,
//         {},
//         { headers: { Authorization: `Bearer ${accessToken}` } }
//       );
//       toast.success('Participant declined');
//       fetchParticipants();
//     } catch (error) {
//       toast.error('Failed to decline participant');
//       console.error(error);
//     }
//   };

//   const handleDeleteMessage = async (messageId) => {
//     try {
//       await axios.delete(
//         `${BASE_URL}/discussion_forum/admin/forum/messages/${messageId}/`,
//         { headers: { Authorization: `Bearer ${accessToken}` } }
//       );
//       toast.success('Message deleted successfully');
//     } catch (error) {
//       toast.error('Failed to delete message');
//       console.error(error);
//     }
//   };

//   const refreshToken = async () => {
//     try {
//       const response = await axios.post(`${BASE_URL}/api/token/refresh/`, {
//         refresh: localStorage.getItem('refreshToken'),
//       });
//       const newAccessToken = response.data.access;
//       localStorage.setItem(ACCESS_TOKEN, newAccessToken);
//       console.log('Token refreshed');
//       return newAccessToken;
//     } catch (error) {
//       console.error('Token refresh failed:', error.response?.data);
//       window.location.href = '/login';
//       throw error;
//     }
//   };

//   return (
//     <div className="container mx-auto p-4">
//       <div className="flex justify-between items-center mb-6">
//         <div>
//           <h1 className="text-3xl font-bold">Forum Admin Dashboard</h1>
//           <h2 className="text-xl mt-2">
//             Event: {event?.title || 'Loading...'}
//           </h2>
//         </div>
//         <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg">
//           {socketRef.current?.readyState === WebSocket.OPEN ? (
//             <span className="flex items-center">
//               <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
//               Real-time updates active
//             </span>
//           ) : (
//             <span className="flex items-center">
//               <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
//               Reconnecting...
//             </span>
//           )}
//         </div>
//       </div>

//       <div className="flex border-b mb-6">
//         {['messages', 'participants'].map((tab) => (
//           <button
//             key={tab}
//             className={`px-4 py-2 font-medium ${
//               activeTab === tab
//                 ? 'border-b-2 border-blue-500 text-blue-600'
//                 : 'text-gray-500 hover:text-gray-700'
//             }`}
//             onClick={() => setActiveTab(tab)}
//           >
//             {tab.charAt(0).toUpperCase() + tab.slice(1)}
//           </button>
//         ))}
//       </div>

//       {isLoading ? (
//         <div className="flex justify-center items-center h-64">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//         </div>
//       ) : (
//         <>
//           {activeTab === 'messages' && (
//             <div className="bg-white rounded-lg shadow overflow-hidden">
//               <table className="min-w-full divide-y divide-gray-200">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Sender
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Message
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Date
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Actions
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {messages.map((message) => (
//                     <tr key={message.id}>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm font-medium text-gray-900">
//                           {message.sender}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="text-sm text-gray-900">
//                           {message.content}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm text-gray-500">
//                           {new Date(message.created_at).toLocaleString()}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                         <button
//                           onClick={() => handleDeleteMessage(message.id)}
//                           className="text-red-600 hover:text-red-900"
//                         >
//                           Delete
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}

//           {activeTab === 'participants' && (
//             <div className="bg-white rounded-lg shadow overflow-hidden">
//               <table className="min-w-full divide-y divide-gray-200">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       User Name
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Joined At
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Status
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Online
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Actions
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {participants.map((participant) => (
//                     <tr key={participant.id}>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm font-medium text-gray-900">
//                           {participant.user_name}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm text-gray-500">
//                           {new Date(participant.joined_at).toLocaleString()}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm text-gray-500">
//                           {participant.is_accepted ? 'Accepted' : 'Pending'}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm">
//                           {participant.is_online ? (
//                             <span className="text-green-600">Online</span>
//                           ) : (
//                             <span className="text-red-600">Offline</span>
//                           )}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                         {!participant.is_accepted && (
//                           <>
//                             <button
//                               onClick={() => handleAcceptParticipant(participant.id)}
//                               className="text-green-600 hover:text-green-900 mr-4"
//                             >
//                               Accept
//                             </button>
//                             <button
//                               onClick={() => handleDeclineParticipant(participant.id)}
//                               className="text-red-600 hover:text-red-900"
//                             >
//                               Decline
//                             </button>
//                           </>
//                         )}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   );
// };

// export default AdminForumDashboard;



// src/components/AdminForumDashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { ACCESS_TOKEN } from '../../constants';

const AdminForumDashboard = () => {
  const { eventId } = useParams();
  const location = useLocation();
  const { event } = location.state || {};
  const [activeTab, setActiveTab] = useState('messages');
  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const socketRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const BASE_URL = import.meta.env.VITE_users_API_URL || 'http://localhost:8000';
  const accessToken = localStorage.getItem(ACCESS_TOKEN);

  useEffect(() => {
    fetchData();
  }, [eventId, activeTab]);

  useEffect(() => {
    if (!accessToken) {
      console.error('Missing accessToken');
      toast.error('Please log in as admin');
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    const socketUrl = `${protocol}localhost:8000/ws/discussion_forum/admin/forum/${eventId}/?token=${accessToken}`;
    console.log('Connecting to WebSocket:', socketUrl);

    const connectWebSocket = () => {
      socketRef.current = new WebSocket(socketUrl);

      socketRef.current.onopen = () => {
        console.log('Admin WebSocket connected');
      };

      socketRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received:', data);
          if (data.error) {
            toast.error(data.error);
            return;
          }
          switch (data.type) {
            case 'new_message':
              setMessages((prev) => {
                if (!prev.find((msg) => msg.id === data.message.id)) {
                  return [
                    {
                      id: data.message.id,
                      sender: data.sender,
                      content: data.message.content,
                      created_at: data.message.created_at,
                    },
                    ...prev,
                  ];
                }
                return prev;
              });
              break;
            case 'message_deleted':
              setMessages((prev) => prev.filter((msg) => msg.id !== data.message_id));
              break;
            case 'accepted':
            case 'declined':
              fetchData();
              toast.info(data.message);
              break;
            case 'user_online':
              setParticipants((prev) =>
                prev.map((p) =>
                  p.user_id === data.user_id ? { ...p, is_online: true } : p
                )
              );
              break;
            case 'user_offline':
              setParticipants((prev) =>
                prev.map((p) =>
                  p.user_id === data.user_id ? { ...p, is_online: false } : p
                )
              );
              break;
            default:
              console.log('Unhandled message:', data);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      socketRef.current.onclose = (e) => {
        console.log('WebSocket closed:', e.code, e.reason);
        if (e.code === 4001) {
          toast.error('Authentication failed. Logging in...');
          refreshToken().then((newToken) => {
            if (newToken) {
              socketRef.current = new WebSocket(`${socketUrl.replace(/token=[^&]*/, `token=${newToken}`)}`);
            }
          }).catch(() => {
            window.location.href = '/login';
          });
        } else if (e.code !== 1000) {
          console.warn('Reconnecting WebSocket in 5 seconds...');
          setTimeout(connectWebSocket, 5000);
        }
      };

      socketRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast.error('WebSocket connection failed');
      };
    };

    connectWebSocket();

    return () => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }
    };
  }, [eventId, accessToken]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0 && socketRef.current?.readyState === WebSocket.OPEN) {
          const reader = new FileReader();
          reader.onload = () => {
            const audioData = reader.result.split(',')[1]; // Base64 data
            socketRef.current.send(JSON.stringify({
              type: 'audio_broadcast',
              audio_data: audioData,
            }));
          };
          reader.readAsDataURL(event.data);
        }
      };
      mediaRecorderRef.current.start(1000); // Send chunks every 1 second
      setIsRecording(true);
      toast.success('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      toast.success('Recording stopped');
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const endpoints = {
        messages: `${BASE_URL}/discussion_forum/admin/forum/event/${eventId}/messages/`,
        participants: `${BASE_URL}/discussion_forum/events/${eventId}/participants/`,
      };
      const response = await axios.get(endpoints[activeTab], {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (activeTab === 'messages') {
        setMessages(response.data);
      } else {
        setParticipants(response.data.map((p) => ({ ...p, is_online: p.is_online || false })));
      }
    } catch (error) {
      console.error(`Error fetching ${activeTab}:`, error.response?.data);
      toast.error(`Failed to load ${activeTab}`);
      if (error.response?.status === 401) {
        await refreshToken();
        fetchData();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptParticipant = async (participantId) => {
    try {
      await axios.post(
        `${BASE_URL}/discussion_forum/participants/${participantId}/accept/`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      toast.success('Participant accepted');
      fetchData();
    } catch (error) {
      console.error('Error accepting participant:', error.response?.data);
      toast.error('Failed to accept participant');
    }
  };

  const handleDeclineParticipant = async (participantId) => {
    try {
      await axios.post(
        `${BASE_URL}/discussion_forum/participants/${participantId}/decline/`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      toast.success('Participant declined');
      fetchData();
    } catch (error) {
      console.error('Error declining participant:', error.response?.data);
      toast.error('Failed to decline participant');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await axios.delete(
        `${BASE_URL}/discussion_forum/admin/forum/messages/${messageId}/`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      toast.success('Message deleted');
    } catch (error) {
      console.error('Error deleting message:', error.response?.data);
      toast.error('Failed to delete message');
    }
  };

  const refreshToken = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/api/token/`, {
        refresh: localStorage.getItem('token'),
      });
      const newAccessToken = response.data.access_token;
      localStorage.setItem('Authorization', `Bearer ${newAccessToken}`);
      console.log('Token refreshed');
      return newAccessToken;
    } catch (error) {
      console.error('Error:', error.response?.data);
      window.location.href = '/login';
      throw error;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Forum Admin Dashboard</h1>
          <h2 className="text-xl mt-2">
            Event: {event?.title || 'Loading...'}
          </h2>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded">
            {socketRef.current?.readyState === WebSocket.OPEN ? (
              <span className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                Real-time online
              </span>
            ) : (
              <span className="flex items-center">
                <div className="w-3 h-3 bg-red-600 mr-2 rounded-full"></div>
                Reconnecting...
              </span>
            )}
          </div>
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`px-4 py-2 rounded ${
              isRecording ? 'bg-red-600 hover:bg-red-800' : 'bg-green-600 hover:bg-green-800'
            } text-white`}
          >
            {isRecording ? 'Stop Broadcasting' : 'Start Broadcasting Audio'}
          </button>
        </div>
      </div>

      <div className="flex justify-between border-b mb-4">
        {['messages', 'participants'].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 ${activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {activeTab === 'messages' && (
            <div className="bg-white rounded shadow p-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Sender</th>
                    <th className="px-4 text-left text-gray-600">Message</th>
                    <th className="py-2 text-left">Date</th>
                    <th className="text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {messages.map((message) => (
                    <tr key={message.id}>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="text-sm font-medium">{message.sender}</div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="text-sm">{message.content}</div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{new Date(message.created_at).toLocaleString()}</div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <button
                          onClick={() => handleDeleteMessage(message.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'participants' && (
            <div className="bg-white rounded shadow p-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">User</th>
                    <th className="px-4 text-left text-gray-600">Joined</th>
                    <th className="py-2 text-left">Status</th>
                    <th className="text-sm font-medium text-gray-600">Online</th>
                    <th className="text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {participants.map((participant) => (
                    <tr key={participant.id}>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="text-sm font-medium">{participant.user_name}</div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{new Date(participant.joined_at).toLocaleString()}</div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="text-sm">{participant.is_accepted ? 'Accepted' : 'Pending'}</div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="text-sm">
                          {participant.is_online ? (
                            <span className="text-green-600">Online</span>
                          ) : (
                            <span className="text-red-600">Offline</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                        {!participant.is_accepted && (
                          <>
                            <button
                              onClick={() => handleAcceptParticipant(participant.id)}
                              className="text-green-600 hover:text-green-800 mr-2"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleDeclineParticipant(participant.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Decline
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminForumDashboard;