
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ACCESS_TOKEN } from '../../constants';

const ChatPage = () => {
  const { friendId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const friend = state?.friend || {};
  const user = state?.user || {};
  const BASE_URL = import.meta.env.VITE_users_API_URL;
  const accessToken = localStorage.getItem(ACCESS_TOKEN);

  const [mediaType, setMediaType] = useState('audio');
  const [isRecording, setIsRecording] = useState(false);
  const [mediaBlob, setMediaBlob] = useState(null);
  const [mediaUrl, setMediaUrl] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState('');
  const [editMediaBlob, setEditMediaBlob] = useState(null);
  const [editMediaUrl, setEditMediaUrl] = useState(null);
  const [editMediaType, setEditMediaType] = useState('audio');
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const messagesEndRef = useRef(null);
  const editFormRef = useRef(null);

  const profilePic = friend.profile_pic
    ? `${BASE_URL}${friend.profile_pic}`
    : `${BASE_URL}/media/Profile_Picture/default.jpg`;

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const friendIdInt = parseInt(friendId);
        const response = await axios.get(
          `${BASE_URL}/contactapp/${friendIdInt}/`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: { t: new Date().getTime() }
          }
        );
        if (Array.isArray(response.data)) {
          setMessages(response.data);
          response.data.forEach((msg) => {
            if (msg.recipient.id === user.id && !msg.viewed) {
              markMessageViewed(msg.id);
            }
          });
        } else {
          setMessages([]);
        }
      } catch (error) {
        toast.error(error.response?.data?.error || 'Failed to load messages.');
      }
    };
    if (accessToken) {
      fetchMessages();
    } else {
      toast.error('Please log in to view messages.');
      navigate('/login');
    }
  }, [friendId, accessToken, BASE_URL, navigate, user.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setMediaBlob(blob);
        setMediaUrl(url);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      toast.error('Error starting recording: ' + error.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }; const sendMessage = async () => {
    if (!mediaBlob && !message.trim()) {
      toast.error('Please record a media file or type a message.');
      return;
    }

    if (!user.id) {
      toast.error('User ID not found. Please log in again.');
      navigate('/logout');
      return;
    }

    if (!accessToken) {
      toast.error('Authentication token missing. Please log in again.');
      navigate('/logout');
      return;
    }

    try {
      const formData = new FormData();
      const friendIdInt = parseInt(friendId);
      const senderIdInt = parseInt(user.id);
      formData.append('friend_id', friendIdInt);
      formData.append('sender_id', senderIdInt);
      if (mediaBlob) {
        const extension = mediaType === 'audio' ? 'webm' : mediaType === 'video' ? 'webm' : mediaBlob.name?.split('.').pop() || 'webm';
        const mimeType = mediaType === 'audio' ? 'audio/webm' : mediaType === 'video' ? 'video/webm' : mediaBlob.type;
        const file = new File([mediaBlob], `${mediaType}_${Date.now()}.${extension}`, { type: mimeType });
        formData.append('media', file);
        formData.append('media_type', mediaType);
      }
      if (message.trim()) {
        formData.append('text', message);
      }
      
      const response = await axios.post(
        `${BASE_URL}/contactapp/send-media/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        toast.success('Message sent successfully!');
        setMediaBlob(null);
        if (mediaUrl) {
          URL.revokeObjectURL(mediaUrl);
        }
        setMediaUrl(null);
        setMessage('');
        setMessages((prev) => [...prev, response.data.message]);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send message.');
    }
  };

  const updateMessage = async () => {
    if (!editMediaBlob && !editText.trim()) {
      toast.error('Please provide text or media to update.');
      return;
    }

    try {
      const formData = new FormData();
      if (editText.trim()) {
        formData.append('text', editText);
      }
      if (editMediaBlob) {
        const extension = editMediaType === 'audio' ? 'webm' : editMediaType === 'video' ? 'webm' : editMediaBlob.name?.split('.').pop() || 'webm';
        const mimeType = editMediaType === 'audio' ? 'audio/webm' : editMediaType === 'video' ? 'video/webm' : editMediaBlob.type;
        const file = new File([editMediaBlob], `${editMediaType}_${Date.now()}.${extension}`, { type: mimeType });
        formData.append('media', file);
        formData.append('media_type', editMediaType);
      }

      const response = await axios.put(
        `${BASE_URL}/contactapp/update/${editingMessage.id}/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

     
      if (response.data.success) {
        toast.success('Message updated successfully!');
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === editingMessage.id ? response.data.message : msg
          )
        );
        cancelEdit();
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update message.');
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      const response = await axios.delete(
        `${BASE_URL}/contactapp/delete/${messageId}/`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (response.data.success) {
        toast.success('Message deleted successfully!');
        setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete message.');
    }
  };

  const markMessageViewed = async (messageId) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/contactapp/view/`,
        { message_id: messageId },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (response.data.success) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, viewed: true } : msg
          )
        );
      }
    } catch (error) {
      console.error('Error marking message viewed:', error.response?.data || error.message);
    }
  };

  const startEdit = (msg) => {
    setEditingMessage(msg);
    setEditText(msg.text || '');
    setEditMediaBlob(null);
    setEditMediaUrl(null);
    setEditMediaType(msg.media_type || 'audio');
    editFormRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingMessage(null);
    setEditText('');
    setEditMediaBlob(null);
    if (editMediaUrl) {
      URL.revokeObjectURL(editMediaUrl);
    }
    setEditMediaUrl(null);
    setEditMediaType('audio');
  };

  const handleKeyPress = (e, isEdit = false) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      isEdit ? updateMessage() : sendMessage();
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (mediaUrl) {
        URL.revokeObjectURL(mediaUrl);
      }
      if (editMediaUrl) {
        URL.revokeObjectURL(editMediaUrl);
      }
    };
  }, [mediaUrl, editMediaUrl]);

  const isSendDisabled = !mediaBlob && !message.trim();

  const getAbsoluteMediaUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    const absoluteUrl = `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
    return absoluteUrl;
  };

  const handleMediaError = (e, mediaUrl, mediaType) => {
    const error = e.target.error;
    const errorDetails = error
      ? `Code: ${error.code}, Message: ${error.message}`
      : 'Unknown error';
    toast.error(`Failed to play ${mediaType.toLowerCase()}: ${errorDetails}`);
  };

  return (
    <div className="container mx-auto p-4 bg-gray-100 rounded-lg shadow-md md:p-6 lg:p-8 min-h-screen regform_body">
      <ToastContainer />
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 contact-form">
        <div className="flex items-center space-x-4">
          <img
            src={profilePic}
            alt="Friend Profile"
            className="w-16 h-16 rounded-full border border-gray-200 object-cover"
          />
          <div>
            <strong className="text-lg font-semibold">
              {friend.full_name || 'Unknown User'}
            </strong>
            <p className="text-gray-600 text-sm sidebar">
              {friend.email || 'No email available'}
            </p>
            <p className="text-sm text-gray-500">
              Last Login:{' '}
              {friend.last_login
                ? new Date(friend.last_login).toLocaleString()
                : 'Unknown'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 contact-form">
        <h2 className="text-xl font-semibold mb-4">
          Chat with {friend.full_name || 'User'}
        </h2>
        <div className="h-96 bg-gray-50 rounded-lg p-4 mb-4 overflow-y-auto regform_body">
          {messages.length > 0 ? (
            messages.map((msg) => {
              const isEdited = msg.is_edited || false;
              const isViewed = msg.viewed || false;
              
              const absoluteMediaUrl = getAbsoluteMediaUrl(msg.media_url);
              return (
                <div
                  key={msg.id}
                  className={`mb-4 flex  ${msg.sender.id === parseInt(user.id) ? 'justify-end' : 'justify-start'
                    }`}
                >
                  <div
                    className={`max-w-xs p-3 rounded-lg event_table_conatiner ${msg.sender.id === parseInt(user.id) ? 'bg-blue-100' : 'bg-gray-100'
                      } relative`}
                  >
                    <p className="text-sm font-semibold dark_text">
                      {msg.sender.full_name || msg.sender.email}
                    </p>
                    {msg.text && <p>{msg.text}</p>}
                    {msg.media_url && (
                      <div className="mt-2">
                        {msg.media_type === 'audio' ? (
                          <>
                            <audio
                              src={absoluteMediaUrl}
                              controls
                              className="w-full max-w-md"
                              onError={(e) => handleMediaError(e, absoluteMediaUrl, 'Audio')}
                            />
                            </>
                        ) : msg.media_type === 'video' ? (
                          <>
                            <video
                              src={absoluteMediaUrl}
                              controls
                              className="w-full max-w-md rounded-lg"
                              onError={(e) => handleMediaError(e, absoluteMediaUrl, 'Video')}
                            />
                          
                          </>
                        ) : (
                          <a
                            href={absoluteMediaUrl}
                            download
                            className="text-blue-600 hover:underline"
                          >
                            Download {msg.media_url.split('/').pop()}
                          </a>
                        )}
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-500">
                        {new Date(msg.timestamp).toLocaleString()}
                        {isEdited && (
                          <span className="ml-2 italic text-gray-500">
                            Edited
                          </span>
                        )}
                      </p>
                      {msg.sender.id === parseInt(user.id) && (
                        <span className="text-xs text-gray-500">
                          {isViewed ? '✔️ Viewed' : 'Sent'}
                        </span>
                      )}
                    </div>
                    <div className="flex space-x-2 mt-2">
                      {msg.sender.id === parseInt(user.id) && (
                        <button
                          className="text-blue-500 hover:text-blue-700 text-xs"
                          onClick={() => startEdit(msg)}
                        >
                          Edit
                        </button>
                      )}
                      {(msg.sender.id === parseInt(user.id) ||
                        msg.recipient.id === parseInt(user.id)) && (
                          <button
                            className="text-red-500 hover:text-red-700 text-xs"
                            onClick={() => deleteMessage(msg.id)}
                          >
                            Delete
                          </button>
                        )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-gray-500 text-center">
              No messages yet. Start the conversation!
            </p>
          )}
          <div ref={messagesEndRef} />
        </div>

        {editingMessage && (
          <div
            className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
            ref={editFormRef}
          >
            <h3 className="text-lg font-semibold mb-2">Edit Message</h3>
            {editMediaUrl && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold mb-2">Preview</h4>
                {editMediaType === 'audio' ? (
                  <audio
                    src={editMediaUrl}
                    controls
                    className="w-full max-w-md"
                    onError={(e) => handleMediaError(e, editMediaUrl, 'Edit Audio')}
                  />
                ) : editMediaType === 'video' ? (
                  <video
                    src={editMediaUrl}
                    controls
                    className="w-full max-w-md rounded-lg"
                    onError={(e) => handleMediaError(e, editMediaUrl, 'Edit Video')}
                  />
                ) : (
                  <p>File selected (cannot preview)</p>
                )}
                <button
                  className="mt-2 text-red-500 hover:text-red-700"
                  onClick={() => {
                    setEditMediaBlob(null);
                    if (editMediaUrl) {
                      URL.revokeObjectURL(editMediaUrl);
                    }
                    setEditMediaUrl(null);
                  }}
                >
                  Remove
                </button>
              </div>
            )}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-4">
              <select
                value={editMediaType}
                onChange={(e) => setEditMediaType(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent"
                disabled={isRecording}
              >
                <option value="audio">Audio</option>
                <option value="video">Video</option>
                <option value="file">File</option>
              </select>
              {editMediaType !== 'file' ? (
                <button
                  className={`px-4 py-2 rounded text-white ${isRecording
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-green-500 hover:bg-green-600'
                    } transition`}
                  onClick={isRecording ? stopRecording : () => startRecording(true)}
                  disabled={editMediaBlob}
                >
                  {isRecording ? 'Stop Recording' : 'Start Recording'}
                </button>
              ) : (
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setEditMediaBlob(file);
                      setEditMediaUrl(URL.createObjectURL(file));
                    }
                  }}
                  className="p-2 border border-gray-300 rounded-lg"
                  disabled={editMediaBlob}
                />
              )}
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, true)}
                className="flex-1 p-2 regform_body border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Edit message..."
                rows="3"
              />
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                onClick={updateMessage}
              >
                Save
              </button>
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
                onClick={cancelEdit}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {!editingMessage && (
          <>
            {mediaUrl && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold mb-2">Preview</h3>
                {mediaType === 'audio' ? (
                  <audio
                    src={mediaUrl}
                    controls
                    className="w-full max-w-md"
                    onError={(e) => handleMediaError(e, mediaUrl, 'Audio Preview')}
                  />
                ) : mediaType === 'video' ? (
                  <video
                    src={mediaUrl}
                    controls
                    className="w-full max-w-md rounded-lg"
                    onError={(e) => handleMediaError(e, mediaUrl, 'Video Preview')}
                  />
                ) : (
                  <p>File selected (cannot preview)</p>
                )}
                <button
                  className="mt-2 text-red-500 hover:text-red-700"
                  onClick={() => {
                    setMediaBlob(null);
                    if (mediaUrl) {
                      URL.revokeObjectURL(mediaUrl);
                    }
                    setMediaUrl(null);
                  }}
                >
                  Remove
                </button>
              </div>
            )}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-4">
              <select
                value={mediaType}
                onChange={(e) => setMediaType(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isRecording}
              >
                <option value="audio">Audio</option>
                <option value="video">Video</option>
                <option value="file">File</option>
              </select>
              {mediaType !== 'file' ? (
                <button
                  className={`px-4 py-2 rounded text-white ${isRecording
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-green-500 hover:bg-green-600'
                    } transition`}
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={mediaBlob}
                >
                  {isRecording ? 'Stop Recording' : 'Start Recording'}
                </button>
              ) : (
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setMediaBlob(file);
                      setMediaUrl(URL.createObjectURL(file));
                    }
                  }}
                  className="p-2 border border-gray-300 rounded-lg"
                  disabled={mediaBlob}
                />
              )}
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 regform_body p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Type a message or record media..."
                rows="3"
              />
              <button
                className={`bg-blue-600 text-white px-4 py-2 rounded transition ${isSendDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                  }`}
                onClick={sendMessage}
                disabled={isSendDisabled}
                title={isSendDisabled ? 'Please type a message or record media' : 'Send message'}
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
