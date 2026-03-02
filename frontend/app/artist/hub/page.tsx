'use client';

import Header from '../../components/Header';
import { useAuth } from '../../components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import { API_BASE_URL as API_HOST } from '@/lib/config';

interface Artist {
    id: string;
    name: string;
    isOnline: boolean;
}

interface Message {
    senderId: string;
    message: string;
    timestamp: number;
    isOwnMessage?: boolean;
}

const SOCKET_SERVER_URL = API_HOST;
const API_BASE_URL = `${API_HOST}/api`;
let socket: any;

export default function CollaborationHubPage() {
    const { user, appUser, loading } = useAuth();
    const router = useRouter();
    
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [allArtists, setAllArtists] = useState<Artist[]>([]);
    const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
    const [selectedRecipientId, setSelectedRecipientId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const selectedRecipientIdRef = useRef(selectedRecipientId);
    
    useEffect(() => {
        selectedRecipientIdRef.current = selectedRecipientId;
    }, [selectedRecipientId]);

    const fetchAllArtists = useCallback(async () => {
        if (!user) return;
        try {
            const response = await fetch(`${API_BASE_URL}/artist/hub-artists`);
            if (!response.ok) throw new Error('Failed to fetch artists');
            
            // Backend now sends array directly
            const data: Artist[] = await response.json();
            
            const filteredArtists = data
                .filter(artist => artist.id !== user.uid)
                .map(artist => ({ ...artist, isOnline: false }));

            setAllArtists(filteredArtists);
        } catch (error) {
            console.error("Hub Fetch Error:", error);
        }
    }, [user]);

    useEffect(() => {
        if (!loading && (!user || appUser?.role !== 'artist')) {
            router.push(user ? '/' : '/login');
        }
    }, [user, appUser, loading, router]);

    useEffect(() => {
        if (user?.uid) fetchAllArtists();
    }, [user?.uid, fetchAllArtists]);

    useEffect(() => {
        if (!user || loading) return;

        socket = io(SOCKET_SERVER_URL); 
        socket.on('connect', () => {
            if (user?.uid) socket.emit('registerUser', user.uid);
        });

        socket.on('onlineUsers', (userIds: string[]) => {
            setOnlineUserIds(userIds.filter(id => id !== user.uid));
        });

        socket.on('receiveMessage', (messageData: { senderId: string, message: string }) => {
            if (messageData.senderId === selectedRecipientIdRef.current) {
                setMessages(prev => [...prev, { ...messageData, timestamp: Date.now(), isOwnMessage: false }]);
            }
        });

        return () => { if (socket) socket.disconnect(); };
    }, [loading, user]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputMessage.trim() || !selectedRecipientId || !user) return;

        const messageData = {
            recipientId: selectedRecipientId,
            senderId: user.uid,
            message: inputMessage.trim(),
        };

        socket.emit('privateMessage', messageData);
        setMessages(prev => [...prev, { ...messageData, timestamp: Date.now(), isOwnMessage: true }]);
        setInputMessage('');
    };

    const handleSelectRecipient = (artistId: string) => {
        setSelectedRecipientId(artistId);
        setMessages([]);
    };

    const sortedArtists = allArtists
        .map(artist => ({ ...artist, isOnline: onlineUserIds.includes(artist.id) }))
        .sort((a, b) => (a.isOnline === b.isOnline ? 0 : a.isOnline ? -1 : 1));

    return (
        <main className="min-h-screen bg-gray-950 text-white flex flex-col">
            <Header />
            <div className="container mx-auto px-4 py-8 flex-1 flex flex-col min-h-0 max-w-6xl">
                
                <header className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-heading text-white">Collaboration Hub</h1>
                        <p className="text-gray-500 text-sm">Connect and create with fellow artists in real-time.</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1 min-h-[550px] mb-6">
                    
                    {/* SIDEBAR */}
                    <aside className="lg:col-span-1 bg-gray-900 border border-gray-800 rounded-3xl flex flex-col overflow-hidden shadow-2xl">
                        <div className="p-4 border-b border-gray-800 bg-gray-900/50 text-center">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold">Artist Registry</h2>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                            <ul className="space-y-1">
                                {sortedArtists.map((artist) => (
                                    <li key={artist.id}>
                                        <button 
                                            onClick={() => handleSelectRecipient(artist.id)}
                                            className={`w-full text-left p-4 rounded-2xl transition-all flex items-center gap-3 ${
                                                selectedRecipientId === artist.id 
                                                ? 'bg-brand-gold text-gray-950 shadow-lg' 
                                                : 'hover:bg-gray-800 text-gray-400'
                                            }`}
                                        >
                                            <div className="relative">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${selectedRecipientId === artist.id ? 'bg-gray-950 text-white' : 'bg-gray-800 text-brand-gold'}`}>
                                                    {artist.name.charAt(0).toUpperCase()}
                                                </div>
                                                {artist.isOnline && (
                                                    <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-gray-900 animate-pulse"></span>
                                                )}
                                            </div>
                                            <span className="font-semibold text-sm truncate">{artist.name}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </aside>
                    
                    {/* CHAT WINDOW */}
                    <section className="lg:col-span-3 bg-gray-900 rounded-3xl shadow-2xl border border-gray-800 flex flex-col overflow-hidden relative">
                        <div className="p-5 bg-gray-900 border-b border-gray-800 flex items-center justify-between">
                            {selectedRecipientId ? (
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-brand-gold/10 flex items-center justify-center font-bold text-brand-gold text-xs border border-brand-gold/20">
                                        {sortedArtists.find(a => a.id === selectedRecipientId)?.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h2 className="text-md font-bold text-white uppercase tracking-tight">{sortedArtists.find(a => a.id === selectedRecipientId)?.name}</h2>
                                        <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Secure Session</span>
                                    </div>
                                </div>
                            ) : (
                                <h2 className="text-sm font-bold text-gray-600 uppercase tracking-widest">Select a collaborator to begin</h2>
                            )}
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#0a0a0b] custom-scrollbar">
                            {!selectedRecipientId ? (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                                    <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                    <p className="text-sm font-medium">Choose an artist from the registry</p>
                                </div>
                            ) : (
                                <>
                                    {messages.map((msg, index) => (
                                        <div key={index} className={`flex flex-col ${msg.isOwnMessage ? 'items-end' : 'items-start'}`}>
                                            <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                                msg.isOwnMessage 
                                                ? 'bg-brand-gold text-gray-950 rounded-br-none shadow-md' 
                                                : 'bg-gray-800 text-gray-200 rounded-bl-none border border-gray-700'
                                            }`}>
                                                {msg.message}
                                            </div>
                                            <span className="text-[9px] text-gray-600 mt-1 uppercase font-black tracking-tighter px-1">
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </>
                            )}
                        </div>
                        
                        <div className="p-5 bg-gray-900 border-t border-gray-800">
                            <form onSubmit={sendMessage} className="flex items-center gap-3">
                                <input 
                                    type="text" value={inputMessage} onChange={(e) => setInputMessage(e.target.value)}
                                    placeholder={selectedRecipientId ? 'Send message...' : 'Registry inactive'}
                                    disabled={!selectedRecipientId}
                                    className="flex-1 px-5 py-3.5 bg-black border border-gray-800 rounded-2xl focus:border-brand-gold outline-none text-sm transition-all disabled:opacity-20 shadow-inner"
                                />
                                <button 
                                    type="submit" disabled={!selectedRecipientId || !inputMessage.trim()}
                                    className="w-14 h-14 flex items-center justify-center bg-brand-gold text-gray-950 rounded-2xl hover:bg-yellow-500 transition-all active:scale-90 disabled:opacity-20 shadow-lg"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 12h14M12 5l7 7-7 7"/></svg>
                                </button>
                            </form>
                        </div>
                    </section>
                </div>
            </div>
            
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 3px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #1f2937; border-radius: 10px; }
            `}</style>
        </main>
    );
}
