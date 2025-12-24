'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import { auth } from '@/lib/firebase';
import NewMessageModal from '../components/NewMessageModal';

interface Conversation {
  _id: string;
  otherParticipant: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Use onAuthStateChanged for more reliable login detection
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push('/login');
      } else {
        fetchConversations(user.uid);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchConversations = async (uid: string) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/messages/conversations?firebaseUID=${uid}`
      );
      const data = await response.json();

      if (data.success) {
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-maroon to-gray-900">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Header with New Message Button */}
        <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 font-heading">Messages</h1>
            <p className="text-gray-400">
              Chat with artists and buyers about artworks
            </p>
          </div>
          <button
            onClick={() => setIsNewMessageOpen(true)}
            className="bg-brand-gold text-gray-900 px-6 py-3 rounded-lg font-bold hover:bg-yellow-500 flex items-center gap-2 transition-all shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Message
          </button>
        </div>

        {/* Conversations List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold"></div>
            <p className="text-gray-400 mt-4 font-medium">Loading your chats...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-12 text-center border border-white/5">
            <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
               <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No messages yet</h3>
            <p className="text-gray-400 mb-8 max-w-sm mx-auto">
              Connect with the art community. Start a conversation with an artist or buyer.
            </p>
            <button
              onClick={() => setIsNewMessageOpen(true)}
              className="bg-brand-gold text-gray-900 px-8 py-3 rounded-lg font-bold hover:bg-yellow-500 transition-colors"
            >
              Send Your First Message
            </button>
          </div>
        ) : (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/5">
            {conversations.map((conv) => (
              <button
                key={conv._id}
                onClick={() => router.push(`/messages/${conv._id}`)}
                className="w-full p-5 hover:bg-white/5 transition-all border-b border-white/5 last:border-b-0 flex items-center gap-4 group"
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-full bg-brand-gold flex items-center justify-center text-gray-900 font-bold text-xl shadow-inner group-hover:scale-105 transition-transform">
                    {conv.otherParticipant?.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-white truncate text-lg">
                      {conv.otherParticipant?.name || 'Unknown User'}
                    </h3>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {formatTime(conv.lastMessageTime)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <p className={`text-sm truncate flex-1 ${conv.unreadCount > 0 ? 'text-white font-medium' : 'text-gray-400'}`}>
                      {conv.lastMessage || 'No messages yet'}
                    </p>
                    {conv.unreadCount > 0 && (
                      <span className="bg-brand-gold text-gray-900 text-[10px] font-black rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center animate-pulse">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-1">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gray-300 uppercase tracking-wider font-semibold">
                      {conv.otherParticipant?.role || 'user'}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <NewMessageModal
        isOpen={isNewMessageOpen}
        onClose={() => setIsNewMessageOpen(false)}
      />
    </main>
  );
}