// import React, { useState, useEffect, useRef } from 'react';
// import { useParams, useLocation } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import axios from 'axios';
// import { ACCESS_TOKEN } from '../../constants';

// const EventForum = () => {
//   const { eventId } = useParams();
//   const location = useLocation();
//   const { user, event } = location.state || {};
//   const [messages, setMessages] = useState([]);
//   const [participants, setParticipants] = useState([]);
//   const [newMessage, setNewMessage] = useState('');
//   const [participantStatus, setParticipantStatus] = useState('not_joined');
//   const [countdown, setCountdown] = useState('');
//   const socketRef = useRef(null);
//   const BASE_URL = import.meta.env.VITE_users_API_URL || 'http://localhost:8000';
//   const accessToken = localStorage.getItem(ACCESS_TOKEN);

//   useEffect(() => {
//     fetchMessages();
//     fetchParticipants();
//     fetchParticipantStatus();
//   }, [eventId]);

//   useEffect(() => {
//     if (!accessToken || !user?.id) {
//       console.error('Missing accessToken or user.id');
//       toast.error('Please log in to join the forum');
//       return;
//     }

//     const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
//     const socketUrl = `${protocol}//localhost:8000/ws/discussion_forum/forum/event/${eventId}/?token=${accessToken}`;
//     console.log('Attempting to connect to WebSocket:', socketUrl);

//     socketRef.current = new WebSocket(socketUrl);

//     socketRef.current.onopen = () => {
//       console.log('WebSocket connected successfully');
//       socketRef.current.send(JSON.stringify({
//         type: 'user_online',
//         user_id: user.id,
//       }));
//     };

//     socketRef.current.onmessage = (event) => {
//       try {
//         const data = JSON.parse(event.data);
//         console.log('Received WebSocket message:', data);
//         if (data.error) {
//           toast.error(data.error);
//           return;
//         }
//         if (data.type === 'new_message') {
//           setMessages((prev) => {
//             if (!prev.find((msg) => msg.id === data.message.id)) {
//               return [
//                 ...prev,
//                 {
//                   id: data.message.id,
//                   sender: data.sender,
//                   content: data.message.content,
//                   created_at: data.message.created_at || new Date(),
//                 },
//               ];
//             }
//             return prev;
//           });
//         } else if (data.type === 'event_update') {
//           if (data.action === 'accepted') {
//             setParticipantStatus('accepted');
//             toast.success(data.message);
//           } else if (data.action === 'declined') {
//             setParticipantStatus('not_joined');
//             toast.error(data.message);
//           }
//         }
//       } catch (error) {
//         console.error('Error parsing WebSocket message:', error);
//       }
//     };

//     socketRef.current.onerror = (error) => {
//       console.error('WebSocket error:', error);
//       toast.error('Connection to real-time updates failed');
//     };

//     socketRef.current.onclose = (event) => {
//       console.log('WebSocket disconnected:', event.code, event.reason);
//       if (event.code === 4001) {
//         toast.error('WebSocket authentication failed. Please log in again.');
//         refreshToken().then((newToken) => {
//           if (newToken) {
//             socketRef.current = new WebSocket(`${socketUrl.replace(/token=[^&]*/, `token=${newToken}`)}`);
//           }
//         }).catch(() => {
//           window.location.href = '/logout';
//         });
//       } else if (event.code !== 1000) {
//         toast.error('WebSocket connection lost. Attempting to reconnect...');
//         setTimeout(() => {
//           socketRef.current = new WebSocket(socketUrl);
//         }, 5000);
//       }
//     };

//     return () => {
//       if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
//         socketRef.current.send(JSON.stringify({
//           type: 'user_offline',
//           user_id: user.id,
//         }));
//         socketRef.current.close();
//       }
//     };
//   }, [eventId, accessToken, user?.id]);

//   useEffect(() => {
//     if (event?.date_time) {
//       const updateCountdown = () => {
//         const eventDate = new Date(event.date_time);
//         const now = new Date();
//         const diff = eventDate - now;
//         if (diff <= 0) {
//           setCountdown('Event has started');
//           return;
//         }
//         const hours = Math.floor(diff / (1000 * 60 * 60));
//         const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
//         const seconds = Math.floor((diff % (1000 * 60)) / 1000);
//         setCountdown(`${hours}h ${minutes}m ${seconds}s`);
//       };
//       updateCountdown();
//       const interval = setInterval(updateCountdown, 1000);
//       return () => clearInterval(interval);
//     }
//   }, [event]);

//   const fetchMessages = async () => {
//     try {
//       const response = await axios.get(`${BASE_URL}/discussion_forum/forum/event/${eventId}/messages/`, {
//         headers: { Authorization: `Bearer ${accessToken}` },
//       });
//       setMessages(response.data);
//     } catch (error) {
//       console.error('Error fetching messages:', error.response?.data);
//       if (error.response?.status === 401) {
//         await refreshToken();
//         fetchMessages();
//       }
//     }
//   };

//   const fetchParticipants = async () => {
//     try {
//       const response = await axios.get(`${BASE_URL}/discussion_forum/events/${eventId}/participants/`, {
//         headers: { Authorization: `Bearer ${accessToken}` },
//       });
//       setParticipants(response.data);
//     } catch (error) {
//       console.error('Error fetching participants:', error.response?.data);
//       if (error.response?.status === 401) {
//         await refreshToken();
//         fetchParticipants();
//       }
//     }
//   };

//   const fetchParticipantStatus = async () => {
//     try {
//       const response = await axios.get(`${BASE_URL}/discussion_forum/events/${eventId}/status/`, {
//         headers: { Authorization: `Bearer ${accessToken}` },
//       });
//       setParticipantStatus(response.data.is_accepted ? 'accepted' : response.data.status === 'not_joined' ? 'not_joined' : 'pending');
//     } catch (error) {
//       console.error('Error fetching participant status:', error.response?.data);
//       if (error.response?.status === 401) {
//         await refreshToken();
//         fetchParticipantStatus();
//       }
//     }
//   };

//   const handleJoinEvent = async () => {
//     try {
//       await axios.post(
//         `${BASE_URL}/discussion_forum/events/${eventId}/join/`,
//         { user_name: user?.full_name || 'Anonymous' },
//         { headers: { Authorization: `Bearer ${accessToken}` } }
//       );
//       setParticipantStatus('pending');
//       toast.success('Join request sent');
//     } catch (error) {
//       console.error('Error joining event:', error.response?.data);
//       toast.error('Failed to join event');
//       if (error.response?.status === 401) {
//         await refreshToken();
//         handleJoinEvent();
//       }
//     }
//   };

//   const handleSendMessage = async () => {
//     if (!newMessage.trim()) {
//       toast.warn('Message cannot be empty');
//       return;
//     }

//     const payload = {
//       type: 'new_message',
//       content: newMessage,
//     };

//     try {
//       socketRef.current.send(JSON.stringify(payload));
//       setNewMessage('');
//     } catch (error) {
//       console.error('Error sending WebSocket message:', error);
//       toast.error('Failed to send message');
//       try {
//         await axios.post(
//           `${BASE_URL}/discussion_forum/forum/event/${eventId}/messages/`,
//           { content: newMessage, sender: user?.full_name || 'Anonymous' },
//           { headers: { Authorization: `Bearer ${accessToken}` } }
//         );
//         setNewMessage('');
//         fetchMessages();
//       } catch (httpError) {
//         console.error('Error sending HTTP message:', httpError.response?.data);
//         if (httpError.response?.status === 401) {
//           await refreshToken();
//           await axios.post(
//             `${BASE_URL}/discussion_forum/forum/event/${eventId}/messages/`,
//             { content: newMessage, sender: user?.full_name || 'Anonymous' },
//             { headers: { Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}` } }
//           );
//           setNewMessage('');
//           fetchMessages();
//         }
//       }
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
//       window.location.href = '/logout';
//       throw error;
//     }
//   };

//   return (
//     <div className="max-w-4xl mx-auto p-6 bg-gray-100 rounded-lg shadow">
//       <h1 className="text-2xl font-bold mb-4 text-center">
//         {event?.title ? `Discussion for Event: ${event.title}` : 'Loading event...'}
//       </h1>
//       <p className="text-center mb-4">Time until event: {countdown}</p>

//       {participantStatus === 'not_joined' && (
//         <div className="text-center mb-4">
//           <button
//             onClick={handleJoinEvent}
//             className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
//           >
//             Join Now
//           </button>
//         </div>
//       )}

//       {participantStatus === 'pending' && (
//         <p className="text-center text-yellow-500 mb-4">Your join request is pending admin approval.</p>
//       )}

//       {participantStatus === 'accepted' && (
//         <>
//           <div className="bg-white rounded-lg shadow p-4 mb-4 h-96 overflow-y-auto">
//             <h2 className="text-lg font-semibold mb-2">Participants</h2>
//             <ul className="mb-4 text-gray-700">
//               {participants.length === 0 ? (
//                 <p className="text-gray-500">No participants yet.</p>
//               ) : (
//                 participants.map((participant) => (
//                   <li key={participant.id}>
//                     {participant.user_name} (Joined: {new Date(participant.joined_at).toLocaleString()})
//                   </li>
//                 ))
//               )}
//             </ul>

//             <h2 className="text-lg font-semibold mb-2">Messages</h2>
//             {messages.length === 0 ? (
//               <p className="text-gray-500 text-center">No messages yet.</p>
//             ) : (
//               messages.map((message) => (
//                 <div key={message.id} className="border-b pb-2">
//                   <div className="flex justify-between">
//                     <span className="font-semibold">{message.sender}</span>
//                     <span className="text-sm text-gray-500">{new Date(message.created_at).toLocaleString()}</span>
//                   </div>
//                   <p className="text-gray-700">{message.content}</p>
//                 </div>
//               ))
//             )}
//           </div>

//           <div className="flex gap-2">
//             <input
//               type="text"
//               value={newMessage}
//               onChange={(e) => setNewMessage(e.target.value)}
//               placeholder="Type your message..."
//               className="flex-1 p-2 border rounded focus:ring focus:ring-blue-300"
//             />
//             <button
//               onClick={handleSendMessage}
//               className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
//             >
//               Send
//             </button>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default EventForum;

// src/components/EventForum.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { ACCESS_TOKEN } from '../../constants';

const EventForum = () => {
  const { eventId } = useParams();
  const location = useLocation();
  const { user, event } = location.state || {};
  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [participantStatus, setParticipantStatus] = useState('not_joined');
  const [countdown, setCountdown] = useState('');
  const socketRef = useRef(null);
  const audioRef = useRef(null);
  const BASE_URL = import.meta.env.VITE_users_API_URL || 'http://localhost:8000';
  const accessToken = localStorage.getItem(ACCESS_TOKEN);

  useEffect(() => {
    fetchMessages();
    fetchParticipants();
    fetchParticipantStatus();
  }, [eventId]);

  useEffect(() => {
    if (!accessToken || !user?.id) {
      console.error('Missing accessToken or user.id');
      toast.error('Please log in');
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    const socketUrl = `${protocol}localhost:8000/ws/discussion_forum/forum/event/${eventId}/?token=${accessToken}`;
    console.log('Connecting to WebSocket:', socketUrl);

    const connectWebSocket = () => {
      socketRef.current = new WebSocket(socketUrl);

      socketRef.current.onopen = () => {
        console.log('WebSocket connected');
        socketRef.current.send(JSON.stringify({
          type: 'user_online',
          user_id: user.id,
        }));
      };

      socketRef.current.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received:', data);
          if (data.error) {
            toast.error(data.error);
            return;
          }
          if (data.type === 'new_message') {
            setMessages((prev) => {
              if (!prev.find((msg) => msg.id === data.message.id)) {
                return [
                  ...prev,
                  {
                    id: data.message.id,
                    sender: data.sender,
                    content: data.message.content,
                    created_at: data.message.created_at || new Date(),
                  },
                ];
              }
              return prev;
            });
          } else if (data.type === 'event_update') {
            if (data.action === 'accepted') {
              setParticipantStatus('accepted');
              toast.success(data.message);
            } else if (data.action === 'declined') {
              setParticipantStatus('not_joined');
              toast.error(data.message);
            }
          } else if (data.type === 'audio_broadcast') {
            try {
              const audioData = Uint8Array.from(atob(data.audio_data), c => c.charCodeAt(0));
              const blob = new Blob([audioData], { type: 'audio/webm' });
              const audioUrl = URL.createObjectURL(blob);
              if (audioRef.current) {
                audioRef.current.src = audioUrl;
                audioRef.current.play().catch((e) => console.error('Audio playback failed:', e));
              }
            } catch (error) {
              console.error('Error playing audio:', error);
              toast.error('Failed to play audio broadcast');
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      socketRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast.error('WebSocket connection failed');
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
            window.location.href = '/logout';
          });
        } else if (e.code !== 1000) {
          console.warn('Reconnecting WebSocket in 5 seconds...');
          setTimeout(connectWebSocket, 5000);
        }
      };
    };

    connectWebSocket();

    return () => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({
          type: 'user_offline',
          user_id: user.id,
        }));
        socketRef.current.close();
      }
    };
  }, [eventId, accessToken, user?.id]);

  useEffect(() => {
    if (event?.date_time) {
      const updateCountdown = () => {
        const eventDate = new Date(event.date_time);
        const now = new Date();
        const diff = eventDate - now;
        if (diff <= 0) {
          setCountdown('Event has started');
          return;
        }
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setCountdown(`${hours}h ${minutes}m ${seconds}s`);
      };
      updateCountdown();
      const interval = setInterval(updateCountdown, 1000);
      return () => clearInterval(interval);
    }
  }, [event]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/discussion_forum/forum/event/${eventId}/messages/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error.response?.data);
      if (error.response?.status === 401) {
        await refreshToken();
        fetchMessages();
      }
    }
  };

  const fetchParticipants = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/discussion_forum/events/${eventId}/participants/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setParticipants(response.data);
    } catch (error) {
      console.error('Error fetching participants:', error.response?.data);
      if (error.response?.status === 401) {
        await refreshToken();
        fetchParticipants();
      }
    }
  };

  const fetchParticipantStatus = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/discussion_forum/events/${eventId}/status/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setParticipantStatus(response.data.is_accepted ? 'accepted' : response.data.status === 'not_joined' ? 'not_joined' : 'pending');
    } catch (error) {
      console.error('Error fetching participant status:', error.response?.data);
      if (error.response?.status === 401) {
        await refreshToken();
        fetchParticipantStatus();
      }
    }
  };

  const handleJoinEvent = async () => {
    try {
      await axios.post(
        `${BASE_URL}/discussion_forum/events/${eventId}/join/`,
        { user_name: user?.full_name || 'Anonymous' },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setParticipantStatus('pending');
      toast.success('Join request sent');
    } catch (error) {
      console.error('Error joining event:', error.response?.data);
      toast.error('Failed to join event');
      if (error.response?.status === 401) {
        await refreshToken();
        handleJoinEvent();
      }
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      toast.warn('Message cannot be empty');
      return;
    }
    const payload = {
      type: 'new_message',
      content: newMessage,
    };
    try {
      socketRef.current.send(JSON.stringify(payload));
      setNewMessage('');
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      toast.error('Failed to send message');
      try {
        await axios.post(
          `${BASE_URL}/discussion_forum/forum/event/${eventId}/messages/`,
          { content: newMessage, sender: user?.full_name || 'Anonymous' },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        setNewMessage('');
        fetchMessages();
      } catch (httpError) {
        console.error('Error sending HTTP message:', httpError.response?.data);
        if (httpError.response?.status === 401) {
          await refreshToken();
          await axios.post(
            `${BASE_URL}/discussion_forum/forum/event/${eventId}/messages/`,
            { content: newMessage, sender: user?.full_name || 'Anonymous' },
            { headers: { Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}` } }
          );
          setNewMessage('');
          fetchMessages();
        }
      }
    }
  };

  const refreshToken = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/api/token/refresh/`, {
        refresh: localStorage.getItem('refreshToken'),
      });
      const newAccessToken = response.data.access;
      localStorage.setItem(ACCESS_TOKEN, newAccessToken);
      console.log('Token refreshed');
      return newAccessToken;
    } catch (error) {
      console.error('Token refresh failed:', error.response?.data);
      window.location.href = '/logout';
      throw error;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-100 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4 text-center">
        {event?.title ? `Discussion for Event: ${event.title}` : 'Loading event...'}
      </h1>
      <p className="text-center mb-4">Time until event: {countdown}</p>

      {participantStatus === 'not_joined' && (
        <div className="text-center mb-4">
          <button
            onClick={handleJoinEvent}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Join Now
          </button>
        </div>
      )}

      {participantStatus === 'pending' && (
        <p className="text-center text-yellow-500 mb-4">Your join request is pending admin approval.</p>
      )}

      {participantStatus === 'accepted' && (
        <>
          <div className="bg-white rounded-lg shadow p-4 mb-4 h-96 overflow-y-auto">
            <h2 className="text-lg font-semibold mb-2">Participants</h2>
            <ul className="mb-4 text-gray-700">
              {participants.length === 0 ? (
                <p className="text-gray-500">No participants yet.</p>
              ) : (
                participants.map((participant) => (
                  <li key={participant.id}>
                    {participant.user_name} (Joined: {new Date(participant.joined_at).toLocaleString()})
                  </li>
                ))
              )}
            </ul>

            <h2 className="text-lg font-semibold mb-2">Messages</h2>
            {messages.length === 0 ? (
              <p className="text-gray-500 text-center">No messages yet.</p>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="border-b pb-2">
                  <div className="flex justify-between">
                    <span className="font-semibold">{message.sender}</span>
                    <span className="text-sm text-gray-500">{new Date(message.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-gray-700">{message.content}</p>
                </div>
              ))
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-2 border rounded focus:ring focus:ring-blue-300"
            />
            <button
              onClick={handleSendMessage}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Send
            </button>
          </div>
          <audio ref={audioRef} controls className="mt-4 w-full" />
        </>
      )}
    </div>
  );
};

export default EventForum;