'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import Header from '@/app/components/Header';
import { auth } from '@/lib/firebase';
import { API_BASE_URL } from '@/lib/config';

interface Message {
  _id: string;
  sender: {
    _id: string;
    name: string;
    email: string;
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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }

      // 1. Get Mongo User ID first
      try {
        const userRes = await fetch(`http://localhost:5000/api/auth/me?firebaseUID=${user.uid}`);
        const userData = await userRes.json();
        if (userData.success) {
          setCurrentUserId(userData.user._id);
          
          // 2. Initialize Socket
          socketRef.current = io(API_BASE_URL);
          socketRef.current.emit('join', userData.user._id);
        }

        // 3. Fetch Conversation
        const res = await fetch(`http://localhost:5000/api/messages/${conversationId}?firebaseUID=${user.uid}`);
        const data = await res.json();
        if (data.success) {
          setConversation(data.conversation);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      socketRef.current?.disconnect();
    };
  }, [conversationId, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!newMessage.trim() || !user || !conversation) return;

    setSending(true);
    try {
      const recipient = conversation.participants.find(p => p._id !== currentUserId);
      const res = await fetch(`http://localhost:5000/api/messages/send?firebaseUID=${user.uid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: recipient?._id,
          content: newMessage.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setConversation(prev => prev ? { ...prev, messages: [...prev.messages, data.message] } : null);
        setNewMessage('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-maroon flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-brand-gold"></div>
      </div>
    );
  }

  // Find the other person's name safely
  const otherParticipant = conversation?.participants.find(p => p._id !== currentUserId);

  return (
    <main className="min-h-screen bg-brand-maroon text-white">
      <Header />
      <div className="container mx-auto max-w-3xl p-4 mt-8">
        {/* Chat Header */}
        <div className="bg-gray-800 p-4 rounded-t-xl border-b border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-gold rounded-full flex items-center justify-center text-black font-bold text-xl">
            {otherParticipant?.name?.charAt(0) || '?'}
          </div>
          <div>
            <h2 className="font-bold text-lg">{otherParticipant?.name || 'Loading user...'}</h2>
            <p className="text-xs text-gray-400 capitalize">{otherParticipant?.role || ''}</p>
          </div>
        </div>

        {/* Messages Area */}
        <div className="bg-gray-900/50 h-[500px] overflow-y-auto p-6 flex flex-col gap-4">
          {conversation?.messages.map((msg) => {
            const isMe = (typeof msg.sender === 'string' ? msg.sender : msg.sender?._id) === currentUserId;
            return (
              <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] p-3 rounded-2xl ${isMe ? 'bg-brand-gold text-black rounded-tr-none' : 'bg-gray-700 text-white rounded-tl-none'}`}>
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-[10px] mt-1 opacity-50 ${isMe ? 'text-black' : 'text-gray-300'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input form */}
        <form onSubmit={handleSendMessage} className="bg-gray-800 p-4 rounded-b-xl flex gap-2 border-t border-white/10">
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-700 border-none rounded-lg px-4 py-2 text-white focus:ring-1 focus:ring-brand-gold outline-none"
          />
          <button 
            type="submit" 
            disabled={sending || !newMessage.trim()}
            className="bg-brand-gold text-black px-6 py-2 rounded-lg font-bold hover:bg-yellow-500 disabled:opacity-50"
          >
            {sending ? '...' : 'Send'}
          </button>
        </form>
      </div>
    </main>
  );
}
