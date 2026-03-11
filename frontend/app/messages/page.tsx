'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import Header from '../components/Header';
import { useAuth } from '../components/AuthProvider';
import { API_BASE_URL } from '@/lib/config';

interface Contact {
  id: string;
  mongoId?: string;
  name: string;
  conversationId?: string;
}

interface ChatMessage {
  senderId: string;
  message: string;
  timestamp: number;
  isOwnMessage: boolean;
  type?: 'text' | 'image';
  imageUrl?: string | null;
}

interface ConversationSummary {
  _id: string;
  otherParticipant?: {
    _id: string;
    firebaseUID?: string;
    name?: string;
    email?: string;
  };
}

interface ConversationDetail {
  _id: string;
  messages: Array<{
    _id: string;
    content: string;
    createdAt?: string;
    sender?: {
      _id: string;
      firebaseUID?: string;
    };
  }>;
}

const API_ROOT = `${API_BASE_URL}/api`;

export default function MessagesPage() {
  const { user, loading } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentUserMongoId, setCurrentUserMongoId] = useState<string | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedContactRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    selectedContactRef.current = selectedContactId;
  }, [selectedContactId]);

  const refreshConversations = useCallback(async () => {
    if (!user) return;
    try {
      const conversationsRes = await fetch(`${API_ROOT}/messages/conversations?firebaseUID=${user.uid}`);
      if (!conversationsRes.ok) return;

      const conversationsData = await conversationsRes.json();
      const conversations: ConversationSummary[] = conversationsData?.conversations || [];

      setContacts((prev) => {
        const byFirebaseUid = new Map<string, Contact>(prev.map((c) => [c.id, c]));

        conversations.forEach((conv) => {
          const firebaseUID = conv.otherParticipant?.firebaseUID;
          if (!firebaseUID) return;

          const existing = byFirebaseUid.get(firebaseUID);
          byFirebaseUid.set(firebaseUID, {
            id: firebaseUID,
            mongoId: existing?.mongoId || conv.otherParticipant?._id,
            name: existing?.name || conv.otherParticipant?.name || conv.otherParticipant?.email || 'User',
            conversationId: conv._id,
          });
        });

        return Array.from(byFirebaseUid.values());
      });
    } catch (error) {
      console.error('Failed to refresh conversations', error);
    }
  }, [user]);

  useEffect(() => {
    if (loading || !user) return;

    const socketInstance = io(API_BASE_URL, {
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect', () => {
      socketInstance.emit('registerUser', user.uid);
    });

    socketInstance.on('receiveMessage', (data: { senderId: string; message: string; timestamp?: number; type?: 'text' | 'image'; imageUrl?: string | null }) => {
      void refreshConversations();
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

    socketInstance.on('connect_error', (err) => {
      console.error('Socket connect error:', err.message);
    });

    setSocket(socketInstance);
    return () => socketInstance.disconnect();
  }, [loading, user, refreshConversations]);

  useEffect(() => {
    if (!user) return;

    const fetchContactsAndConversations = async () => {
      try {
        const [meRes, contactsRes, conversationsRes] = await Promise.all([
          fetch(`${API_ROOT}/auth/me?firebaseUID=${user.uid}`),
          fetch(`${API_ROOT}/artist/hub-artists`),
          fetch(`${API_ROOT}/messages/conversations?firebaseUID=${user.uid}`),
        ]);

        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData?.success && meData?.user?._id) {
            setCurrentUserMongoId(meData.user._id);
          }
        }

        const contactsData: Contact[] = contactsRes.ok ? await contactsRes.json() : [];
        const conversationsData = conversationsRes.ok ? await conversationsRes.json() : { conversations: [] };
        const conversations: ConversationSummary[] = conversationsData?.conversations || [];

        const byFirebaseUid = new Map<string, Contact>();

        contactsData
          .filter((contact) => contact.id !== user.uid)
          .forEach((contact) => {
            byFirebaseUid.set(contact.id, {
              ...contact,
            });
          });

        conversations.forEach((conv) => {
          const firebaseUID = conv.otherParticipant?.firebaseUID;
          const mongoId = conv.otherParticipant?._id;
          const fallbackName = conv.otherParticipant?.name || conv.otherParticipant?.email || 'User';
          if (!firebaseUID) return;

          const existing = byFirebaseUid.get(firebaseUID);
          byFirebaseUid.set(firebaseUID, {
            id: firebaseUID,
            mongoId: existing?.mongoId || mongoId,
            name: existing?.name || fallbackName,
            conversationId: conv._id,
          });
        });

        setContacts(Array.from(byFirebaseUid.values()));
      } catch (error) {
        console.error('Failed to load contacts/conversations', error);
      }
    };

    void fetchContactsAndConversations();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      void refreshConversations();
    }, 5000);

    return () => clearInterval(interval);
  }, [user, refreshConversations]);

  const sortedContacts = useMemo(() => {
    const filtered = contacts
      .filter((contact) => contact.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [contacts, searchQuery]);

  const selectedContact = sortedContacts.find((c) => c.id === selectedContactId) || contacts.find((c) => c.id === selectedContactId) || null;

  const handleSelectContact = async (contactId: string) => {
    setSelectedContactId(contactId);

    const selected = contacts.find((contact) => contact.id === contactId);
    if (!user) {
      setActiveConversationId(null);
      setMessages([]);
      return;
    }

    let conversationId = selected?.conversationId || null;

    if (!conversationId) {
      try {
        const res = await fetch(`${API_ROOT}/messages/conversations?firebaseUID=${user.uid}`);
        if (res.ok) {
          const data = await res.json();
          const conversations: ConversationSummary[] = data?.conversations || [];
          const matched = conversations.find((conv) => conv.otherParticipant?.firebaseUID === contactId);
          if (matched?._id) {
            conversationId = matched._id;
            setContacts((prev) => prev.map((contact) => (
              contact.id === contactId
                ? { ...contact, conversationId: matched._id, mongoId: contact.mongoId || matched.otherParticipant?._id }
                : contact
            )));
          }
        }
      } catch (error) {
        console.error('Failed to resolve conversation ID', error);
      }
    }

    if (!conversationId) {
      setActiveConversationId(null);
      setMessages([]);
      return;
    }

    setActiveConversationId(conversationId);

    try {
      const res = await fetch(`${API_ROOT}/messages/${conversationId}?firebaseUID=${user.uid}`);
      const data = await res.json();
      if (!res.ok || !data?.success) {
        setMessages([]);
        return;
      }

      const conversation: ConversationDetail = data.conversation;
      const parsedMessages: ChatMessage[] = (conversation.messages || []).map((msg) => ({
        senderId: msg.sender?.firebaseUID || '',
        message: msg.content || '',
        timestamp: msg.createdAt ? new Date(msg.createdAt).getTime() : Date.now(),
        isOwnMessage: !!currentUserMongoId && msg.sender?._id === currentUserMongoId,
        type: 'text',
        imageUrl: null,
      }));

      setMessages(parsedMessages);
    } catch (error) {
      console.error('Failed to load conversation', error);
      setMessages([]);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedContactId || !user) return;

    const selected = contacts.find((contact) => contact.id === selectedContactId);
    if (!selected?.mongoId) {
      console.error('Recipient mongo ID not found');
      return;
    }

    try {
      const res = await fetch(`${API_ROOT}/messages/send?firebaseUID=${user.uid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: selected.mongoId,
          content: newMessage.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data?.success) {
        console.error('Failed to send message:', data?.message || 'Unknown error');
        return;
      }

      const createdTimestamp = data?.message?.createdAt
        ? new Date(data.message.createdAt).getTime()
        : Date.now();

      setMessages((prev) => [
        ...prev,
        {
          senderId: user.uid,
          message: newMessage.trim(),
          timestamp: createdTimestamp,
          isOwnMessage: true,
          type: 'text',
          imageUrl: null,
        },
      ]);

      if (data.conversationId) {
        setActiveConversationId(data.conversationId);
        setContacts((prev) =>
          prev.map((contact) =>
            contact.id === selectedContactId
              ? { ...contact, conversationId: data.conversationId }
              : contact
          )
        );
      }

      if (socket) {
        socket.emit('privateMessage', {
          senderId: user.uid,
          recipientId: selectedContactId,
          message: newMessage.trim(),
          timestamp: createdTimestamp,
          type: 'text',
          imageUrl: null,
          skipPersistence: true,
        });
      }

      void refreshConversations();

      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
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
            <h1 className="text-2xl font-semibold text-white mb-1">Messages</h1>
            <p className="text-base text-gray-400">{sortedContacts.length} contacts</p>
          </div>

          <div className="px-4 py-3 border-b border-white/10">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contacts..."
              className="w-full rounded-2xl bg-white/10 border border-white/10 px-4 py-3 text-base text-gray-200 placeholder:text-gray-400 outline-none"
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
                    <div className="w-12 h-12 rounded-full bg-sky-400 text-black font-bold text-xl flex items-center justify-center">
                      {contact.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <p className="text-lg font-semibold leading-tight">{contact.name}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <section className="flex-1 flex flex-col bg-[#111f33]">
          <div className="h-24 border-b border-white/10 px-8 flex items-center gap-4">
            {selectedContact ? (
              <>
                <div className="w-12 h-12 rounded-full bg-sky-400 text-black font-bold text-xl flex items-center justify-center">
                  {selectedContact.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{selectedContact.name}</h2>
                </div>
              </>
            ) : (
              <h2 className="text-lg text-gray-500">Select a contact to start chatting</h2>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-8 bg-[#08152c]">
            {!selectedContact ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <p className="text-2xl">No conversation selected</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <p className="text-2xl mb-2">No messages yet</p>
                <p className="text-base">Start the conversation!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${msg.isOwnMessage ? 'bg-sky-500 text-black' : 'bg-white/10 text-white'}`}>
                      {msg.type === 'image' && msg.imageUrl ? (
                        <img src={msg.imageUrl} alt="Message upload" className="max-h-72 rounded-lg mb-2" />
                      ) : null}
                      {msg.message ? <p className="text-base">{msg.message}</p> : null}
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
              className="flex-1 rounded-2xl bg-white/10 border border-white/10 px-5 py-4 text-base placeholder:text-gray-400 outline-none disabled:opacity-40"
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
