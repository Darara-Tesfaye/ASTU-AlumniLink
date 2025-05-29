import { useEffect, useRef, useState, useCallback } from 'react';

export default function useWebSocket(forumId, user) {
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const handleIncomingMessage = useCallback((data) => {
    switch(data.type) {
      case 'auth_response':
        setIsAdmin(data.isAdmin);
        break;
      case 'message':
        setMessages(prev => [...prev, data]);
        setUnreadCount(prev => prev + 1);
        break;
      case 'typing_indicator':
        setTypingUsers(data.users.filter(u => u.id !== user.id));
        break;
      case 'message_deleted':
        setMessages(prev => prev.filter(msg => msg.id !== data.messageId));
        break;
      case 'read_receipt':
        setMessages(prev => prev.map(msg => 
          msg.id === data.messageId 
            ? { ...msg, readBy: [...(msg.readBy || []), data.user] }
            : msg
        ));
        break;
      case 'initial_messages':
        setMessages(data.messages);
        break;
    }
  }, [user.id]);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/forum/${forumId}/`;
    
    socketRef.current = new WebSocket(wsUrl);

    socketRef.current.onopen = () => {
      socketRef.current.send(JSON.stringify({
        type: 'auth',
        token: localStorage.getItem('access_token'),
        userId: user.id
      }));
    };

    socketRef.current.onmessage = (e) => {
      const data = JSON.parse(e.data);
      handleIncomingMessage(data);
    };

    socketRef.current.onclose = () => {
      clearTimeout(typingTimeoutRef.current);
    };

    return () => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }
      clearTimeout(typingTimeoutRef.current);
    };
  }, [forumId, user.id, handleIncomingMessage]);

  const sendMessage = (content) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'message',
        content,
        forumId
      }));
    }
  };

  const sendTyping = useCallback((isTyping) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      clearTimeout(typingTimeoutRef.current);
      
      if (isTyping) {
        socketRef.current.send(JSON.stringify({
          type: 'typing',
          isTyping: true,
          forumId
        }));
        
        typingTimeoutRef.current = setTimeout(() => {
          sendTyping(false);
        }, 3000);
      } else {
        socketRef.current.send(JSON.stringify({
          type: 'typing',
          isTyping: false,
          forumId
        }));
      }
    }
  }, [forumId]);

  const markAsRead = (messageId) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'read_receipt',
        messageId,
        forumId
      }));
      setUnreadCount(0);
    }
  };

  const deleteMessage = (messageId) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'delete_message',
        messageId,
        forumId
      }));
    }
  };

  return { 
    messages, 
    sendMessage, 
    typingUsers,
    unreadCount,
    markAsRead,
    sendTyping,
    isAdmin,
    deleteMessage
  };
}