'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import Header from '@/app/components/Header';
import { auth } from '@/lib/firebase';

interface Message {
  _id: string;
  sender: {
    _id: string;
    name: string;
  };
  content: string;
  createdAt: string;
  isRead: boolean;
}

interface Conversation {
  _id: string;
  participants: Array<{
    _id: string;
    name: string;
    email: string;
    role: string;
  }>;
  messages: Message[];
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.id as string;

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUser = auth.currentUser;

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages]);

  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    // Initialize socket connection
    socketRef.current = io('http://localhost:5000');

    // Join with current user ID
    fetch(
      `http://localhost:5000/api/auth/me?firebaseUID=${currentUser.uid}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          socketRef.current?.emit('join', data.user._id);
        }
      });

    // Listen for incoming messages
    socketRef.current.on('receiveMessage', (message: Message) => {
      setConversation((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: [...prev.messages, message],
        };
      });
    });

    // Listen for typing indicator
    socketRef.current.on('userTyping', ({ isTyping: typing }) => {
      setIsTyping(typing);
    });

    // Fetch conversation
    fetchConversation();

    return () => {
      socketRef.current?.disconnect();
    };
  }, [currentUser, conversationId]);

  const fetchConversation = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/messages/${conversationId}?firebaseUID=${currentUser?.uid}`
      );
      const data = await response.json();

      if (data.success) {
        setConversation(data.conversation);
        
        // Mark as read
        await fetch(
          `http://localhost:5000/api/messages/${conversationId}/read?firebaseUID=${currentUser?.uid}`,
          {
            method: 'PATCH',
          }
        );
      }
    } catch (error) {
      console.error('Failed to fetch conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      // Get current user from backend
      const userRes = await fetch(
        `http://localhost:5000/api/auth/me?firebaseUID=${currentUser?.uid}`
      );
      const userData = await userRes.json();

      // Get recipient
      const recipient = conversation?.participants.find(
        (p) => p._id !== userData.user._id
      );

      // Send message via API
      const response = await fetch(
        `http://localhost:5000/api/messages/send?firebaseUID=${currentUser?.uid}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipientId: recipient?._id,
            content: newMessage.trim(),
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        // Update local state
        setConversation((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            messages: [...prev.messages, data.message],
          };
        });

        // Emit via socket for real-time
        socketRef.current?.emit('sendMessage', {
          recipientId: recipient?._id,
          message: data.message,
        });

        setNewMessage('');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleTyping = () => {
    const recipient = conversation?.participants.find(
      (p) => p._id !== currentUser?.uid
    );
    socketRef.current?.emit('typing', {
      recipientId: recipient?._id,
      senderId: currentUser?.uid,
      isTyping: true,
    });

    setTimeout(() => {
      socketRef.current?.emit('typing', {
        recipientId: recipient?._id,
        senderId: currentUser?.uid,
        isTyping: false,
      });
    }, 3000);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-brand-maroon to-gray-900">
        <Header />
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold mx-auto"></div>
        </div>
      </main>
    );
  }

  if (!conversation) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-brand-maroon to-gray-900">
        <Header />
        <div className="text-center py-12 text-white">
          <p>Conversation not found</p>
        </div>
      </main>
    );
  }

  // Get other participant for header
  const otherParticipant = conversation.participants.find((p) => {
    // You'll need to fetch current user's MongoDB ID
    return p.email !== currentUser?.email;
  });

  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-maroon to-gray-900">
      <Header />
      <div className="container mx-auto px-4 py-4 h-[calc(100vh-80px)] flex flex-col">
        {/* Chat Header */}
        <div className="bg-gray-800 rounded-t-lg p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/messages')}
              className="text-gray-400 hover:text-white"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div className="w-10 h-10 rounded-full bg-brand-gold flex items-center justify-center text-gray-900 font-bold">
              {otherParticipant?.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-white font-semibold">
                {otherParticipant?.name}
              </h2>
              <p className="text-xs text-gray-400 capitalize">
                {otherParticipant?.role}
              </p>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 bg-gray-800 overflow-y-auto p-4 space-y-4">
          {conversation.messages.map((message, index) => {
            const isOwnMessage = message.sender.email === currentUser?.email;

            return (
              <div
                key={message._id || index}
                className={`flex ${
                  isOwnMessage ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    isOwnMessage
                      ? 'bg-brand-gold text-gray-900'
                      : 'bg-gray-700 text-white'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isOwnMessage ? 'text-gray-700' : 'text-gray-400'
                    }`}
                  >
                    {new Date(message.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form
          onSubmit={handleSendMessage}
          className="bg-gray-800 rounded-b-lg p-4 border-t border-gray-700"
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleTyping}
              placeholder="Type a message..."
              className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-gold"
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="bg-brand-gold text-gray-900 px-6 py-2 rounded-lg font-semibold hover:bg-brand-gold-antique disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}