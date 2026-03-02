'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../components/AuthProvider';
import Header from '../components/Header';
import io from 'socket.io-client';
import { API_BASE_URL as API_HOST } from '@/lib/config';

const SOCKET_URL = API_HOST;
const API_URL = `${API_HOST}/api`;

interface Contact {
  id: string;
  name: string;
  isOnline: boolean;
}

interface Message {
  senderId: string;
  message: string;
  timestamp: number;
  isOwnMessage: boolean;
  imageUrl?: string;
  type?: 'text' | 'image';
}

export default function MessagesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasAutoSelected = useRef(false);
  const selectedContactRef = useRef<Contact | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keep ref in sync with state
  useEffect(() => {
    selectedContactRef.current = selectedContact;
  }, [selectedContact]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    const fetchContacts = async () => {
      try {
        console.log('=== FETCHING CONTACTS ===');
        console.log('User UID:', user.uid);
        const response = await fetch(`${API_URL}/artist/hub-artists`, {
          headers: { 'x-firebase-uid': user.uid },
        });
        if (response.ok) {
          const data = await response.json();
          console.log('Raw data from API:', data);
          // The API returns an array directly, not wrapped in an object
          const artistsArray = Array.isArray(data) ? data : [];
          const contactList = artistsArray
            .filter((c: any) => c.id !== user.uid)
            .map((c: any) => ({
              id: c.id,
              name: c.name || 'User',
              isOnline: false,
            }));
          console.log('Processed contacts:', contactList);
          setContacts(contactList);
        } else {
          console.error('Failed to fetch contacts:', response.status);
        }
      } catch (error) {
        console.error('Error fetching contacts:', error);
      }
    };

    fetchContacts();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const socketInstance = io(SOCKET_URL);

    socketInstance.on('connect', () => {
      console.log('Socket connected');
      socketInstance.emit('registerUser', user.uid);
    });

    socketInstance.on('onlineUsers', (users: string[]) => {
      console.log('Online users updated:', users);
      setOnlineUsers(users.filter(id => id !== user.uid));
    });

    socketInstance.on('receiveMessage', (data: any) => {
      console.log('Received message:', data);
      // Add message to state if it's from the currently selected contact
      setMessages(prev => {
        const currentContact = selectedContactRef.current;
        const isRelevant = currentContact && data.senderId === currentContact.id;
        if (isRelevant) {
          return [...prev, {
            senderId: data.senderId,
            message: data.message,
            timestamp: data.timestamp || Date.now(),
            isOwnMessage: false,
            imageUrl: data.imageUrl,
            type: data.type || 'text',
          }];
        }
        return prev;
      });
    });

    socketInstance.on('messageSent', (data: any) => {
      console.log('Message sent confirmation:', data);
      // Message was successfully saved to database
    });

    socketInstance.on('messageFailed', (data: any) => {
      console.error('Message failed:', data);
      alert('Failed to send message: ' + data.message);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user]); // Remove selectedContact from dependencies

  useEffect(() => {
    setContacts(prev =>
      prev.map(c => ({ ...c, isOnline: onlineUsers.includes(c.id) }))
    );
  }, [onlineUsers]);

  // Only auto-scroll when new messages arrive, not on initial load
  const prevMessagesLengthRef = useRef(0);
  const isInitialLoadRef = useRef(true);
  
  useEffect(() => {
    // Only scroll to bottom when a NEW message is added (not on initial history load)
    if (messages.length > prevMessagesLengthRef.current && !isInitialLoadRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevMessagesLengthRef.current = messages.length;
    isInitialLoadRef.current = false;
  }, [messages]);

  const handleSelectContact = useCallback(async (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    if (!contact || !user) return;

    console.log('=== SELECTING CONTACT ===');
    console.log('Contact ID:', contactId);
    console.log('Contact name:', contact.name);

    setSelectedContact(contact);
    setMessages([]);
    isInitialLoadRef.current = true; // Mark as initial load
    setShowSidebar(false); // Hide sidebar on mobile when contact selected

    try {
      console.log('Fetching message history from:', `${API_URL}/messages/conversation/${contactId}`);
      const response = await fetch(`${API_URL}/messages/conversation/${contactId}`, {
        headers: { 'x-firebase-uid': user.uid },
      });

      console.log('Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Message history response:', data);
        
        if (data.success && data.messages) {
          const formattedMessages = data.messages.map((msg: any) => ({
            senderId: msg.senderId,
            message: msg.content,
            timestamp: new Date(msg.createdAt).getTime(),
            isOwnMessage: msg.senderId === user.uid,
            imageUrl: msg.imageUrl,
            type: msg.type || (msg.imageUrl ? 'image' : 'text'),
          }));
          console.log('Formatted messages:', formattedMessages);
          setMessages(formattedMessages);

          if (data.conversation) {
            await fetch(`${API_URL}/messages/${data.conversation._id}/mark-read`, {
              method: 'POST',
              headers: { 'x-firebase-uid': user.uid },
            });
          }
        } else {
          console.log('No messages found or empty conversation');
        }
      } else {
        console.error('Failed to fetch message history:', response.status);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }, [contacts, user]);

  // Auto-select artist from query parameter
  useEffect(() => {
    if (hasAutoSelected.current) return;
    
    const artistId = searchParams.get('artistId');
    console.log('=== AUTO-SELECT DEBUG ===');
    console.log('artistId from URL:', artistId);
    console.log('contacts loaded:', contacts.length);
    console.log('user:', user?.uid);
    console.log('hasAutoSelected:', hasAutoSelected.current);
    
    if (artistId && contacts.length > 0 && user) {
      console.log('All contacts:', contacts.map(c => ({ id: c.id, name: c.name })));
      const contact = contacts.find(c => c.id === artistId);
      console.log('Found matching contact:', contact);
      
      if (contact) {
        console.log('AUTO-SELECTING CONTACT:', contact.name);
        hasAutoSelected.current = true;
        handleSelectContact(contact.id);
      } else {
        console.log('NO MATCHING CONTACT FOUND!');
        console.log('Looking for ID:', artistId);
        console.log('Available IDs:', contacts.map(c => c.id));
      }
    }
  }, [searchParams, contacts, user, handleSelectContact]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedContact || !socket || !user) return;

    const messageData = {
      senderId: user.uid,
      recipientId: selectedContact.id,
      message: newMessage.trim(),
      timestamp: Date.now(),
    };

    socket.emit('privateMessage', messageData);

    setMessages(prev => [...prev, {
      senderId: user.uid,
      message: newMessage.trim(),
      timestamp: messageData.timestamp,
      isOwnMessage: true,
    }]);

    setNewMessage('');
    setShowEmojiPicker(false);
  };

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedContact || !socket || !user) return;

    try {
      // Upload image to backend
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_URL}/upload/message-image`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const imageUrl = data.url;

        // Send image message
        const messageData = {
          senderId: user.uid,
          recipientId: selectedContact.id,
          message: imageUrl,
          timestamp: Date.now(),
          type: 'image',
          imageUrl: imageUrl,
        };

        socket.emit('privateMessage', messageData);

        setMessages(prev => [...prev, {
          senderId: user.uid,
          message: imageUrl,
          timestamp: messageData.timestamp,
          isOwnMessage: true,
          imageUrl: imageUrl,
          type: 'image',
        }]);
      } else {
        const errorData = await response.json();
        console.error('Upload error:', errorData);
        alert('Failed to upload image. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Common emojis for quick access
  const commonEmojis = ['😊', '😂', '❤️', '👍', '🙏', '🎨', '✨', '🔥', '💯', '👏', '🤝', '💪', '🌟', '🎉', '😍', '🥰', '😎', '🤔', '👌', '✅'];

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort: Online users first, then by name
  const sortedContacts = [...filteredContacts].sort((a, b) => {
    // First priority: online status
    if (a.isOnline && !b.isOnline) return -1;
    if (!a.isOnline && b.isOnline) return 1;
    // Second priority: alphabetical by name
    return a.name.localeCompare(b.name);
  });

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-900">
        <Header />
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold"></div>
        </div>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="h-screen bg-gray-900 text-white flex flex-col overflow-hidden">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Contacts Sidebar */}
        <div className={`${showSidebar ? 'flex' : 'hidden'} md:flex w-full md:w-80 lg:w-96 bg-gray-800 border-r border-gray-700 flex-col absolute md:relative inset-0 z-10 md:z-0 h-full`}>
          {/* Sidebar Header - Fixed */}
          <div className="flex-shrink-0 p-4 border-b border-gray-700 bg-gray-800">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold text-white">Messages</h2>
              {selectedContact && (
                <button
                  onClick={() => setShowSidebar(false)}
                  className="md:hidden text-gray-400 hover:text-white transition-colors"
                  aria-label="Close sidebar"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <p className="text-sm text-gray-400 mb-3">
              {sortedContacts.length} {sortedContacts.length === 1 ? 'contact' : 'contacts'}
              {sortedContacts.filter(c => c.isOnline).length > 0 && (
                <span className="text-green-400 ml-2">
                  • {sortedContacts.filter(c => c.isOnline).length} online
                </span>
              )}
            </p>
            
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent text-white placeholder-gray-400 transition-all"
            />
          </div>

          {/* Contacts List - Scrollable */}
          <div className="flex-1 overflow-y-scroll scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 hover:scrollbar-thumb-gray-500">
            {sortedContacts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <svg className="w-16 h-16 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-gray-400 text-sm">No contacts found</p>
              </div>
            ) : (
              sortedContacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => handleSelectContact(contact.id)}
                  className={`p-4 border-b border-gray-700 cursor-pointer transition-all hover:bg-gray-700/50 ${
                    selectedContact?.id === contact.id ? 'bg-gray-700 border-l-4 border-l-brand-gold' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-gold to-brand-gold-antique flex items-center justify-center text-gray-900 font-semibold text-lg shadow-lg">
                        {contact.name.charAt(0).toUpperCase()}
                      </div>
                      {contact.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-gray-800 shadow-sm"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-white">{contact.name}</p>
                      <p className={`text-xs font-medium ${contact.isOnline ? 'text-green-400' : 'text-gray-500'}`}>
                        {contact.isOnline ? '● Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-gray-900 min-w-0 h-full overflow-hidden">
          {selectedContact ? (
            <>
              {/* Chat Header - Fixed */}
              <div className="flex-shrink-0 bg-gray-800 border-b border-gray-700 p-4 shadow-sm">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowSidebar(true)}
                    className="md:hidden text-gray-400 hover:text-white mr-2 transition-colors"
                    aria-label="Show contacts"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div className="relative flex-shrink-0">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-brand-gold to-brand-gold-antique flex items-center justify-center text-gray-900 font-semibold text-lg shadow-lg">
                      {selectedContact.name.charAt(0).toUpperCase()}
                    </div>
                    {selectedContact.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate text-lg">{selectedContact.name}</h3>
                    <p className={`text-sm font-medium ${selectedContact.isOnline ? 'text-green-400' : 'text-gray-500'}`}>
                      {selectedContact.isOnline ? '● Active now' : 'Offline'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages Area - Scrollable, takes remaining space */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-900 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <svg className="mx-auto h-16 w-16 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <p className="text-gray-500 text-sm">No messages yet</p>
                      <p className="text-gray-600 text-xs mt-1">Start the conversation!</p>
                    </div>
                  </div>
                ) : (
                  messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.isOwnMessage ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                    >
                      <div
                        className={`max-w-[75%] sm:max-w-md px-4 py-2.5 rounded-2xl break-words shadow-sm ${
                          msg.isOwnMessage
                            ? 'bg-brand-gold text-gray-900 rounded-br-sm'
                            : 'bg-gray-700 text-white rounded-bl-sm'
                        }`}
                      >
                        {msg.type === 'image' || msg.imageUrl ? (
                          <div>
                            <img 
                              src={msg.imageUrl || msg.message} 
                              alt="Shared image" 
                              className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => window.open(msg.imageUrl || msg.message, '_blank')}
                            />
                            <p className={`text-xs mt-1.5 ${msg.isOwnMessage ? 'text-gray-700' : 'text-gray-400'}`}>
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        ) : (
                          <div>
                            <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                            <p className={`text-xs mt-1.5 ${msg.isOwnMessage ? 'text-gray-700' : 'text-gray-400'}`}>
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Box - Fixed at Bottom, Always Visible */}
              <div className="flex-shrink-0 bg-gray-800 border-t border-gray-700 p-4">
                {/* Emoji Picker */}
                {showEmojiPicker && (
                  <div className="mb-3 p-3 bg-gray-700 rounded-lg border border-gray-600">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Quick Emojis</span>
                      <button
                        onClick={() => setShowEmojiPicker(false)}
                        className="text-gray-400 hover:text-white"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="grid grid-cols-10 gap-2">
                      {commonEmojis.map((emoji, index) => (
                        <button
                          key={index}
                          onClick={() => handleEmojiSelect(emoji)}
                          className="text-2xl hover:bg-gray-600 rounded p-1 transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex space-x-2 items-center">
                  {/* Emoji Button */}
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-3 text-gray-400 hover:text-brand-gold hover:bg-gray-700 rounded-xl transition-all flex-shrink-0"
                    aria-label="Add emoji"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>

                  {/* Image Upload Button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 text-gray-400 hover:text-brand-gold hover:bg-gray-700 rounded-xl transition-all flex-shrink-0"
                    aria-label="Attach image"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />

                  {/* Message Input */}
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent text-white placeholder-gray-400 transition-all"
                  />

                  {/* Send Button */}
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="px-5 py-3 bg-brand-gold text-gray-900 rounded-xl hover:bg-brand-gold-antique disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed font-semibold transition-all shadow-md hover:shadow-lg disabled:shadow-none flex-shrink-0"
                    aria-label="Send message"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center max-w-sm">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-800 flex items-center justify-center">
                  <svg className="w-10 h-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-300 mb-2">No conversation selected</h3>
                <p className="text-sm text-gray-500 mb-6">Choose a contact from the sidebar to start messaging</p>
                <button
                  onClick={() => setShowSidebar(true)}
                  className="md:hidden px-6 py-3 bg-brand-gold text-gray-900 rounded-lg hover:bg-brand-gold-antique font-semibold transition-all shadow-md hover:shadow-lg"
                >
                  View Contacts
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
