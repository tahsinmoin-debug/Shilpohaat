'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';

interface NewMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewMessageModal({ isOpen, onClose }: NewMessageModalProps) {
  const [recipientId, setRecipientId] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const currentUser = auth.currentUser;

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientId.trim() || !message.trim() || !currentUser) return;

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/messages/send?firebaseUID=${currentUser.uid}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipientId: recipientId.trim(),
            content: message.trim(),
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert('✅ Message sent successfully!');
        onClose();
        router.push(`/messages/${data.conversationId}`);
      } else {
        alert('❌ Failed to send message: ' + data.message);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('❌ Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">New Message</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSend}>
          {/* Recipient ID */}
          <div className="mb-4">
            <label className="block text-gray-400 text-sm mb-2">
              Recipient User ID
            </label>
            <input
              type="text"
              value={recipientId}
              onChange={(e) => setRecipientId(e.target.value)}
              placeholder="Enter MongoDB User ID (e.g., 674d8e9f...)"
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-gold"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              💡 Tip: Get this from the artist's profile or use Postman to find user IDs
            </p>
          </div>

          {/* Message */}
          <div className="mb-6">
            <label className="block text-gray-400 text-sm mb-2">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              rows={4}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-gold resize-none"
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !recipientId.trim() || !message.trim()}
              className="flex-1 bg-brand-gold text-gray-900 py-2 px-4 rounded-lg font-semibold hover:bg-brand-gold-antique disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}