'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';

interface UserResult {
  _id: string;
  name: string;
  role: string;
}

interface NewMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewMessageModal({ isOpen, onClose }: NewMessageModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<UserResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserResult | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const currentUser = auth.currentUser;

  // Search for users as user types
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchTerm.length >= 2 && !selectedUser) {
        try {
          const res = await fetch(`http://localhost:5000/api/auth/search?name=${searchTerm}`);
          const data = await res.json();
          if (data.success) setResults(data.users);
        } catch (err) {
          console.error("Search failed", err);
        }
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedUser]);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !message.trim() || !currentUser) return;

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/messages/send?firebaseUID=${currentUser.uid}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipientId: selectedUser._id,
            content: message.trim(),
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        onClose();
        router.push(`/messages/${data.conversationId}`);
        // Reset states
        setSelectedUser(null);
        setSearchTerm('');
        setMessage('');
      }
    } catch (error) {
      alert('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl border border-white/10 p-6">
        <h2 className="text-2xl font-heading text-brand-gold mb-6">New Message</h2>
        
        <form onSubmit={handleSend}>
          {/* Recipient Search */}
          <div className="mb-4 relative">
            <label className="block text-gray-400 text-sm mb-2">Recipient Name</label>
            
            {selectedUser ? (
              <div className="flex items-center justify-between bg-brand-gold/20 border border-brand-gold/30 rounded-lg px-4 py-2 text-brand-gold">
                <span>{selectedUser.name}</span>
                <button type="button" onClick={() => { setSelectedUser(null); setSearchTerm(''); }}>✕</button>
              </div>
            ) : (
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for a name (e.g. Nasima)..."
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-gold outline-none"
                autoComplete="off"
              />
            )}

            {/* Search Results Dropdown */}
            {!selectedUser && results.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 bg-gray-700 border border-white/10 rounded-lg shadow-xl z-10 max-h-40 overflow-y-auto">
                {results.map((user) => (
                  <button
                    key={user._id}
                    type="button"
                    onClick={() => setSelectedUser(user)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-600 border-b border-white/5 last:border-0"
                  >
                    <p className="text-white font-medium">{user.name}</p>
                    <p className="text-xs text-gray-400 capitalize">{user.role}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Message Content */}
          <div className="mb-6">
            <label className="block text-gray-400 text-sm mb-2">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message..."
              rows={4}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-gold outline-none resize-none"
              required
            />
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-600">Cancel</button>
            <button
              type="submit"
              disabled={loading || !selectedUser || !message.trim()}
              className="flex-1 bg-brand-gold text-black py-2 rounded-lg font-bold hover:bg-yellow-500 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}