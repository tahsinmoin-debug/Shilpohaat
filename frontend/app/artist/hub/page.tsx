'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import io, { Socket } from 'socket.io-client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

interface Artist {
  id: string;
  name: string;
  isOnline: boolean;
  role?: string;
}

interface Message {
  senderId: string;
  message: string;
  timestamp: number;
  isOwnMessage: boolean;
}

export default function CollaborationHubPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [allArtists, setAllArtists] = useState<Artist[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<Artist | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    const socketInstance = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect', () => {
      socketInstance.emit('registerUser', user.uid);
    });

    socketInstance.on('onlineUsers', (users: string[]) => {
      setOnlineUsers(users);
    });

    socketInstance.on('receiveMessage', (data: { senderId: string; message: string; timestamp: number }) => {
      setMessages((prev) => [
        ...prev,
        {
          senderId: data.senderId,
          message: data.message,
          timestamp: data.timestamp,
          isOwnMessage: false,
        },
      ]);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const fetchAllArtists = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/artists/hub-artists`, {
          headers: {
            'x-firebase-uid': user.uid,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const artistList = data.artists.map((artist: any) => ({
            id: artist.firebaseUID || artist._id,
            name: artist.name || artist.email?.split('@')[0] || 'User',
            isOnline: false,
            role: artist.role || 'buyer',
          }));
          setAllArtists(artistList);
        }
      } catch (error) {
        console.error('Error fetching artists:', error);
      }
    };

    fetchAllArtists();
  }, [user]);

  useEffect(() => {
    setAllArtists((prev) =>
      prev.map((artist) => ({
        ...artist,
        isOnline: onlineUsers.includes(artist.id),
      }))
    );
  }, [onlineUsers]);

  useEffect(() => {
    const artistId = searchParams.get('artistId');
    if (artistId && allArtists.length > 0) {
      const artist = allArtists.find((a) => a.id === artistId);
      if (artist) {
        handleSelectRecipient(artist.id);
      }
    }
  }, [searchParams, allArtists]);

  const handleSelectRecipient = async (artistId: string) => {
    const artist = allArtists.find((a) => a.id === artistId);
    if (!artist || !user) return;

    setSelectedRecipient(artist);
    setMessages([]);

    try {
      const response = await fetch(
        `${API_BASE_URL}/messages/conversation/${artistId}`,
        {
          headers: {
            'x-firebase-uid': user.uid,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.messages) {
          const formattedMessages = data.messages.map((msg: any) => ({
            senderId: msg.senderId,
            message: msg.content,
            timestamp: new Date(msg.createdAt).getTime(),
            isOwnMessage: msg.senderId === user.uid,
          }));
          setMessages(formattedMessages);

          if (data.conversation) {
            await fetch(
              `${API_BASE_URL}/messages/${data.conversation._id}/mark-read`,
              {
                method: 'POST',
                headers: {
                  'x-firebase-uid': user.uid,
                },
              }
            );
          }
        }
      }
    } catch (error) {
      console.error('Error fetching message history:', error);
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedRecipientId', artistId);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && allArtists.length > 0 && !selectedRecipient) {
      const savedRecipientId = localStorage.getItem('selectedRecipientId');
      if (savedRecipientId) {
        const artist = allArtists.find((a) => a.id === savedRecipientId);
        if (artist) {
          handleSelectRecipient(savedRecipientId);
        }
      }
    }
  }, [allArtists]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedRecipient || !socket || !user) return;

    const messageData = {
      senderId: user.uid,
      recipientId: selectedRecipient.id,
      message: newMessage,
      timestamp: Date.now(),
    };

    socket.emit('privateMessage', messageData);

    setMessages((prev) => [
      ...prev,
      {
        senderId: user.uid,
        message: newMessage,
        timestamp: messageData.timestamp,
        isOwnMessage: true,
      },
    ]);

    setNewMessage('');
  };

  const filteredArtists = allArtists.filter((artist) =>
    artist.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedArtists = [...filteredArtists].sort((a, b) => {
    if (a.isOnline && !b.isOnline) return -1;
    if (!a.isOnline && b.isOnline) return 1;
    return 0;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Messages</h2>
          <p className="text-sm text-gray-500 mt-1">
            {sortedArtists.length} contacts
          </p>
        </div>

        <div className="p-3 border-b border-gray-200">
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {sortedArtists.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No contacts found
            </div>
          ) : (
            sortedArtists.map((artist) => (
              <div
                key={artist.id}
                onClick={() => handleSelectRecipient(artist.id)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedRecipient?.id === artist.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                      {artist.name.charAt(0).toUpperCase()}
                    </div>
                    {artist.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {artist.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {artist.isOnline ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedRecipient ? (
          <>
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                  {selectedRecipient.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {selectedRecipient.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedRecipient.isOnline ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      msg.isOwnMessage ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.isOwnMessage
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      <p className="break-words">{msg.message}</p>
                      <p
                        className={`text-xs mt-1 ${
                          msg.isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                        }`}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No conversation selected
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Choose a contact from the sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
