'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { API_BASE_URL } from '@/lib/config';

interface Recommendation {
  _id: string;
  title: string;
  price: number;
  images: string[];
  artist?: { name: string };
  aiReason?: string;
}

interface Message {
  type: 'user' | 'bot';
  content: string;
  recommendations?: Recommendation[];
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      type: 'bot',
      content:
        'Hi! 👋 I\'m your AI Art Curator. Tell me what you\'re looking for, and I\'ll recommend the perfect artworks from ShilpoHaat. You can say things like "I want modern art under 5000 taka" or "Show me traditional paintings".',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    category: '',
    budget_min: '',
    budget_max: '',
    materials: '',
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage = input.trim();
    setMessages((prev) => [...prev, { type: 'user', content: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/recommendations/quick`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMessage }),
      });

      const data = await response.json();

      if (data.success && data.recommendations && data.recommendations.length > 0) {
        setMessages((prev) => [
          ...prev,
          {
            type: 'bot',
            content: data.aiExplanation || 'Here are my top recommendations for you:',
            recommendations: data.recommendations,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            type: 'bot',
            content: 'Sorry, I couldn\'t find artworks matching that description. Try being more specific about the style, budget, or material!',
          },
        ]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          type: 'bot',
          content: 'Oops! Something went wrong. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilteredSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });

      const data = await response.json();

      if (data.success && data.recommendations && data.recommendations.length > 0) {
        setMessages((prev) => [
          ...prev,
          {
            type: 'user',
            content: `Looking for ${preferences.category || 'any'} art${preferences.budget_max ? ` under ৳${preferences.budget_max}` : ''}`,
          },
          {
            type: 'bot',
            content: data.aiExplanation || 'Based on your preferences, here are my top picks:',
            recommendations: data.recommendations,
          },
        ]);
        setShowPreferences(false);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          type: 'bot',
          content: 'Something went wrong with the search. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Chatbot Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 ${
          isOpen ? 'bg-brand-gold text-gray-900' : 'bg-brand-gold hover:scale-110'
        }`}
        aria-label="AI Art Recommender"
        title="Ask me for art recommendations!"
      >
        <div className="text-2xl">🎨</div>
      </button>

      {/* Chatbot Modal */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-24px)] h-[600px] rounded-2xl shadow-2xl flex flex-col z-50 border border-white/10 bg-[rgba(6,21,35,0.9)] backdrop-blur-xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-maroon to-brand-maroon/80 text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
            <div>
              <h3 className="font-heading text-lg">Art Recommender</h3>
              <p className="text-xs text-gray-200">Powered by AI</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-brand-gold transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[rgba(10,27,43,0.75)]">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xs px-4 py-2 rounded-xl border ${
                    msg.type === 'user'
                      ? 'bg-brand-gold text-gray-900 border-brand-gold/60'
                      : 'bg-[rgba(255,255,255,0.08)] text-[#e9f3ff] border-white/10'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>

                  {/* Recommendations Grid */}
                  {msg.recommendations && msg.recommendations.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {msg.recommendations.map((rec) => (
                        <Link
                          key={rec._id}
                          href={`/artworks/${rec._id}`}
                          className="flex gap-2 p-2 rounded-lg border border-white/10 bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] transition-colors cursor-pointer"
                        >
                          <div className="w-16 h-16 rounded relative flex-shrink-0">
                            <Image
                              src={rec.images?.[0] || 'https://placehold.co/64x64'}
                              alt={rec.title}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover rounded"
                            />
                          </div>
                          <div className="flex-1 text-xs">
                            <p className="font-semibold text-[#f5f9ff] line-clamp-1">{rec.title}</p>
                            <p className="text-gray-200">
                              <strong>৳{rec.price?.toLocaleString()}</strong>
                            </p>
                            <p className="text-gray-300 line-clamp-1">{rec.artist?.name}</p>
                            {rec.aiReason && (
                              <p className="text-brand-gold text-xs italic mt-1">{rec.aiReason}</p>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[rgba(255,255,255,0.08)] px-4 py-2 rounded-xl">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Filter Options Toggle */}
          {!showPreferences && (
            <div className="px-4 py-2 border-t border-white/10">
              <button
                onClick={() => setShowPreferences(true)}
                className="text-xs text-brand-gold hover:text-white font-semibold"
              >
                + Advanced Search
              </button>
            </div>
          )}

          {/* Advanced Search Form */}
          {showPreferences && (
            <div className="px-4 py-3 bg-[rgba(255,255,255,0.06)] border-t border-white/10 space-y-2">
              <select
                value={preferences.category}
                onChange={(e) => setPreferences({ ...preferences, category: e.target.value })}
                className="w-full px-2 py-1 text-xs border border-white/15 bg-[rgba(4,22,36,0.6)] text-[#e9f3ff] rounded"
              >
                <option value="">Any Category</option>
                <option value="Abstract">Abstract</option>
                <option value="Portrait">Portrait</option>
                <option value="Landscape">Landscape</option>
                <option value="Modern Art">Modern Art</option>
                <option value="Traditional Art">Traditional Art</option>
              </select>

              <div className="flex gap-1">
                <input
                  type="number"
                  placeholder="Min ৳"
                  value={preferences.budget_min}
                  onChange={(e) => setPreferences({ ...preferences, budget_min: e.target.value })}
                  className="w-1/2 px-2 py-1 text-xs border border-white/15 bg-[rgba(4,22,36,0.6)] text-[#e9f3ff] rounded"
                />
                <input
                  type="number"
                  placeholder="Max ৳"
                  value={preferences.budget_max}
                  onChange={(e) => setPreferences({ ...preferences, budget_max: e.target.value })}
                  className="w-1/2 px-2 py-1 text-xs border border-white/15 bg-[rgba(4,22,36,0.6)] text-[#e9f3ff] rounded"
                />
              </div>

              <input
                type="text"
                placeholder="Material (e.g., Oil, Watercolor)"
                value={preferences.materials}
                onChange={(e) => setPreferences({ ...preferences, materials: e.target.value })}
                className="w-full px-2 py-1 text-xs border border-white/15 bg-[rgba(4,22,36,0.6)] text-[#e9f3ff] rounded"
              />

              <div className="flex gap-1">
                <button
                  onClick={handleFilteredSearch}
                  disabled={loading}
                  className="flex-1 px-2 py-1 bg-brand-gold text-gray-900 text-xs font-semibold rounded hover:bg-brand-gold-antique disabled:opacity-50"
                >
                  Search
                </button>
                <button
                  onClick={() => setShowPreferences(false)}
                  className="flex-1 px-2 py-1 bg-[rgba(255,255,255,0.12)] text-[#e9f3ff] text-xs rounded hover:bg-[rgba(255,255,255,0.2)]"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="border-t border-white/10 p-4 flex gap-2 bg-[rgba(6,21,35,0.9)]">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for recommendations..."
              className="flex-1 px-3 py-2 border border-white/15 bg-[rgba(4,22,36,0.7)] text-[#e9f3ff] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 py-2 bg-brand-gold text-gray-900 rounded-lg font-semibold hover:bg-brand-gold-antique disabled:opacity-50 transition-colors"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
