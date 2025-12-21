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
  const [firebaseUID, setFirebaseUID] = useState<string | null>(null);
  const router = useRouter();
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setFirebaseUID(currentUser.uid);
    fetchConversations();
  }, [currentUser]);

  const fetchConversations = async () => {
    if (!currentUser) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/messages/conversations?firebaseUID=${currentUser.uid}`
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
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

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
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading text-white mb-2">Messages</h1>
            <p className="text-gray-400">
              Chat with artists and buyers about artworks
            </p>
          </div>
          <button
            onClick={() => setIsNewMessageOpen(true)}
            className="bg-brand-gold text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-brand-gold-antique flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Message
          </button>
        </div>

        {/* Conversations List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold mx-auto"></div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <svg
              className="w-16 h-16 text-gray-600 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-white mb-2">
              No messages yet
            </h3>
            <p className="text-gray-400 mb-4">
              Start a conversation with an artist or buyer
            </p>
            <button
              onClick={() => setIsNewMessageOpen(true)}
              className="bg-brand-gold text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-brand-gold-antique"
            >
              Send Your First Message
            </button>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            {conversations.map((conv) => (
              <button
                key={conv._id}
                onClick={() => router.push(`/messages/${conv._id}`)}
                className="w-full p-4 hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-b-0 flex items-center gap-4"
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-brand-gold flex items-center justify-center text-gray-900 font-bold text-lg">
                    {conv.otherParticipant.name.charAt(0).toUpperCase()}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-white truncate">
                      {conv.otherParticipant.name}
                    </h3>
                    <span className="text-xs text-gray-400 ml-2">
                      {formatTime(conv.lastMessageTime)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-400 truncate flex-1">
                      {conv.lastMessage}
                    </p>
                    {conv.unreadCount > 0 && (
                      <span className="bg-brand-gold text-gray-900 text-xs font-bold rounded-full px-2 py-1 min-w-[20px] text-center">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 capitalize">
                    {conv.otherParticipant.role}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* New Message Modal */}
      <NewMessageModal
        isOpen={isNewMessageOpen}
        onClose={() => setIsNewMessageOpen(false)}
      />
    </main>
  );
}