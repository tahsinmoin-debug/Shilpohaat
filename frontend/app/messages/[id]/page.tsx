'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import Header from '@/app/components/Header';
import { useAuth } from '@/app/components/AuthProvider';

interface Message {
  _id: string;
  sender: { _id: string; name: string } | string;
  content: string;
  createdAt: string;
}

interface Conversation {
  _id: string;
  participants: Array<{ _id: string; name: string; role: string }>;
  messages: Message[];
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.id as string;
  const { user, loading: authLoading, appUser } = useAuth();

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/login'); return; }

    socketRef.current = io('http://localhost:5000');
    if (appUser?._id) socketRef.current.emit('join', appUser._id);

    const fetchChat = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/messages/${conversationId}?firebaseUID=${user.uid}`);
        const data = await res.json();
        if (data.success) setConversation(data.conversation);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };

    fetchChat();
    return () => { socketRef.current?.disconnect(); };
  }, [user, authLoading, conversationId, appUser]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [conversation]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !appUser || !conversation) return;

    try {
      const recipient = conversation.participants.find(p => p._id !== appUser._id);
      const res = await fetch(`http://localhost:5000/api/messages/send?firebaseUID=${user?.uid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId: recipient?._id, content: newMessage.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setConversation(prev => prev ? { ...prev, messages: [...prev.messages, data.message] } : null);
        setNewMessage('');
      }
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="min-h-screen bg-brand-maroon flex items-center justify-center text-white">Loading Chat...</div>;

  const otherUser = conversation?.participants.find(p => p._id !== appUser?._id);

  return (
    <main className="min-h-screen bg-brand-maroon text-white">
      <Header />
      <div className="container mx-auto max-w-2xl p-4">
        <div className="bg-gray-800 p-4 rounded-t-xl border-b border-gray-700 flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-gold rounded-full flex items-center justify-center text-black font-bold">
            {otherUser?.name?.charAt(0) || '?'}
          </div>
          <h2 className="font-bold">{otherUser?.name || 'User'}</h2>
        </div>

        <div className="bg-gray-900/50 h-[500px] overflow-y-auto p-4 flex flex-col gap-3">
          {conversation?.messages.map((msg) => {
            const isMe = (typeof msg.sender === 'string' ? msg.sender : msg.sender._id) === appUser?._id;
            return (
              <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-lg max-w-[80%] ${isMe ? 'bg-brand-gold text-black' : 'bg-gray-700 text-white'}`}>
                  {msg.content}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="bg-gray-800 p-4 rounded-b-xl flex gap-2">
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 bg-gray-700 p-2 rounded outline-none"
            placeholder="Write a message..."
          />
          <button className="bg-brand-gold text-black px-4 py-2 rounded font-bold">Send</button>
        </form>
      </div>
    </main>
  );
}