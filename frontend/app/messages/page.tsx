'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import Header from '../components/Header';
import { useAuth } from '../components/AuthProvider';
import { API_BASE_URL } from '@/lib/config';

interface Contact {
  id: string;
  name: string;
  isOnline: boolean;
}

interface ChatMessage {
  senderId: string;
  message: string;
  timestamp: number;
  isOwnMessage: boolean;
  type?: 'text' | 'image';
  imageUrl?: string | null;
}

const API_ROOT = `${API_BASE_URL}/api`;

export default function MessagesPage() {
  const { user, loading } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedContactRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    selectedContactRef.current = selectedContactId;
  }, [selectedContactId]);

  useEffect(() => {
    if (loading || !user) return;

    const socketInstance = io(API_BASE_URL, {
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect', () => {
      socketInstance.emit('registerUser', user.uid);
    });

    socketInstance.on('onlineUsers', (users: string[]) => {
      setOnlineUsers(users.filter((id) => id !== user.uid));
    });

    socketInstance.on('receiveMessage', (data: { senderId: string; message: string; timestamp?: number; type?: 'text' | 'image'; imageUrl?: string | null }) => {
      if (data.senderId !== selectedContactRef.current) return;
      setMessages((prev) => [
        ...prev,
        {
          senderId: data.senderId,
          message: data.message || '',
          timestamp: data.timestamp || Date.now(),
          isOwnMessage: false,
          type: data.type || 'text',
          imageUrl: data.imageUrl || null,
        },
      ]);
    });

    setSocket(socketInstance);
    return () => socketInstance.disconnect();
  }, [loading, user]);

  useEffect(() => {
    if (!user) return;
    const fetchContacts = async () => {
      try {
        const response = await fetch(`${API_ROOT}/artist/hub-artists`);
        if (!response.ok) return;
        const data: Contact[] = await response.json();
        setContacts(
          data
            .filter((contact) => contact.id !== user.uid)
            .map((contact) => ({ ...contact, isOnline: false }))
        );
      } catch (error) {
        console.error('Failed to load contacts', error);
      }
    };

    fetchContacts();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sortedContacts = useMemo(() => {
    const filtered = contacts
      .map((contact) => ({ ...contact, isOnline: onlineUsers.includes(contact.id) }))
      .filter((contact) => contact.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return filtered.sort((a, b) => {
      if (a.isOnline && !b.isOnline) return -1;
      if (!a.isOnline && b.isOnline) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [contacts, onlineUsers, searchQuery]);

  const selectedContact = sortedContacts.find((c) => c.id === selectedContactId) || contacts.find((c) => c.id === selectedContactId) || null;

  const handleSelectContact = (contactId: string) => {
    setSelectedContactId(contactId);
    setMessages([]);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedContactId || !socket || !user) return;

    const payload = {
      senderId: user.uid,
      recipientId: selectedContactId,
      message: newMessage.trim(),
      timestamp: Date.now(),
      type: 'text' as const,
      imageUrl: null,
    };

    socket.emit('privateMessage', payload);
    setMessages((prev) => [
      ...prev,
      {
        senderId: user.uid,
        message: payload.message,
        timestamp: payload.timestamp,
        isOwnMessage: true,
        type: 'text',
        imageUrl: null,
      },
    ]);
    setNewMessage('');
  };

  const handleImageUpload = async (file: File) => {
    if (!selectedContactId || !socket || !user) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch(`${API_ROOT}/upload/message-image`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error('Failed to upload image');

      const payload = {
        senderId: user.uid,
        recipientId: selectedContactId,
        message: '',
        timestamp: Date.now(),
        type: 'image' as const,
        imageUrl: data.url as string,
      };

      socket.emit('privateMessage', payload);
      setMessages((prev) => [
        ...prev,
        {
          senderId: user.uid,
          message: '',
          timestamp: payload.timestamp,
          isOwnMessage: true,
          type: 'image',
          imageUrl: payload.imageUrl,
        },
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-950 text-white">
        <Header />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b1422] text-white">
      <Header />

      <div className="h-[calc(100vh-84px)] border-t border-white/10 flex">
        <aside className="w-[340px] md:w-[420px] border-r border-white/10 bg-[#1b2637] flex flex-col">
          <div className="p-6 border-b border-white/10">
            <h1 className="text-4xl font-heading text-white mb-2">Messages</h1>
            <p className="text-3xl text-gray-400">{sortedContacts.length} contacts</p>
          </div>

          <div className="px-4 py-3 border-b border-white/10">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contacts..."
              className="w-full rounded-2xl bg-white/10 border border-white/10 px-4 py-3 text-xl text-gray-200 placeholder:text-gray-400 outline-none"
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            {sortedContacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => handleSelectContact(contact.id)}
                className={`w-full text-left p-5 border-b border-white/10 transition-colors ${
                  selectedContactId === contact.id ? 'bg-white/10 border-l-4 border-l-cyan-400' : 'hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-sky-400 text-black font-bold text-4xl flex items-center justify-center">
                      {contact.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <p className="text-4xl font-semibold leading-tight">{contact.name}</p>
                    <p className="text-3xl text-gray-400">{contact.isOnline ? 'Online' : 'Offline'}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <section className="flex-1 flex flex-col bg-[#111f33]">
          <div className="h-28 border-b border-white/10 px-8 flex items-center gap-4">
            {selectedContact ? (
              <>
                <div className="w-16 h-16 rounded-full bg-sky-400 text-black font-bold text-4xl flex items-center justify-center">
                  {selectedContact.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-4xl font-heading">{selectedContact.name}</h2>
                  <p className="text-3xl text-gray-400">{selectedContact.isOnline ? 'Online' : 'Offline'}</p>
                </div>
              </>
            ) : (
              <h2 className="text-3xl text-gray-500">Select a contact to start chatting</h2>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-8 bg-[#08152c]">
            {!selectedContact ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <p className="text-4xl">No conversation selected</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <p className="text-5xl mb-3">No messages yet</p>
                <p className="text-3xl">Start the conversation!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${msg.isOwnMessage ? 'bg-sky-500 text-black' : 'bg-white/10 text-white'}`}>
                      {msg.type === 'image' && msg.imageUrl ? (
                        <img src={msg.imageUrl} alt="Message upload" className="max-h-72 rounded-lg mb-2" />
                      ) : null}
                      {msg.message ? <p className="text-xl">{msg.message}</p> : null}
                      <p className="text-sm opacity-70 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className="h-28 border-t border-white/10 px-6 flex items-center gap-4 bg-[#1a2638]">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={!selectedContactId || uploading}
              className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center disabled:opacity-40"
              title="Upload image"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-8-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file);
              }}
            />

            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={selectedContactId ? 'Type a message...' : 'Select a contact first'}
              disabled={!selectedContactId}
              className="flex-1 rounded-2xl bg-white/10 border border-white/10 px-5 py-4 text-2xl placeholder:text-gray-400 outline-none disabled:opacity-40"
            />
            <button
              onClick={handleSendMessage}
              disabled={!selectedContactId || !newMessage.trim()}
              className="px-6 py-3 rounded-2xl bg-sky-500 text-black font-bold disabled:opacity-40"
            >
              Send
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
