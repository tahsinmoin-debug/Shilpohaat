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
            
            const data: { id: string, name: string }[] = await response.json();
            
            const filteredArtists: Artist[] = data
                .filter((artist: { id: string }) => artist.id !== user.uid)
                .map((artist: { id: string, name: string }) => ({
                    id: artist.id,
                    name: artist.name,
                    isOnline: false,
                }));

            setAllArtists(filteredArtists);
        } catch (error) {
            console.error(error);
        }
    }, [user]);

    useEffect(() => {
        if (!loading && (!user || appUser?.role !== 'artist')) {
            router.push(user ? '/' : '/login');
        }
    }, [user, appUser, loading, router]);

    useEffect(() => {
        if (user?.uid) {
            fetchAllArtists();
        }
    }, [user?.uid, fetchAllArtists]);

    useEffect(() => {
        if (!user || loading) return;

        socket = io(SOCKET_SERVER_URL); 

        socket.on('connect', () => {
            if (user?.uid) {
                socket.emit('registerUser', user.uid);
            }
        });

        socket.on('onlineUsers', (userIds: string[]) => {
            setOnlineUserIds(userIds.filter(id => id !== user.uid));
        });

        socket.on('receiveMessage', (messageData: { senderId: string, message: string }) => {
            if (messageData.senderId === selectedRecipientIdRef.current) {
                const newMessage: Message = { 
                    ...messageData, 
                    timestamp: Date.now(), 
                    isOwnMessage: false 
                };
                setMessages(prev => [...prev, newMessage]);
            }
        });

        return () => {
            if (socket) socket.disconnect();
        };
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

        const sentMessage: Message = { 
            ...messageData, 
            timestamp: Date.now(), 
            isOwnMessage: true 
        };
        setMessages(prev => [...prev, sentMessage]);
        setInputMessage('');
    };

    const handleSelectRecipient = (artistId: string) => {
        setSelectedRecipientId(artistId);
        setMessages([]);
    };

    const sortedArtists = allArtists
        .map(artist => ({
            ...artist,
            isOnline: onlineUserIds.includes(artist.id),
        }))
        .sort((a, b) => {
            if (a.isOnline === b.isOnline) return 0;
            if (a.isOnline) return -1; 
            return 1;
        });


    if (loading || !user) {
        return (
            <main>
                <Header />
                <div className="min-h-screen flex items-center justify-center">
                    <p className="text-white text-lg animate-pulse">Connecting to Hub...</p>
                </div>
            </main>
        );
    }
    
    return (
        <main className="min-h-screen bg-gray-900 text-white flex flex-col">
            <Header />
            <div className="container mx-auto px-4 py-8 flex-1 flex flex-col min-h-0">
                <h1 className="text-3xl font-heading text-white mb-6">Collaboration Hub</h1>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
                    
                    {/* ARTIST LIST BAR */}
                    <div className="lg:col-span-1 bg-gray-800 rounded-2xl border border-gray-700 flex flex-col overflow-hidden shadow-2xl">
                        <div className="p-4 border-b border-gray-700 bg-gray-800/50">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-brand-gold">Artists Available</h2>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                            <ul className="space-y-1">
                                {sortedArtists.map((artist) => (
                                    <li key={artist.id}>
                                        <button 
                                            onClick={() => handleSelectRecipient(artist.id)}
                                            className={`w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 ${
                                                selectedRecipientId === artist.id 
                                                ? 'bg-brand-gold text-gray-900 shadow-lg scale-[1.02]' 
                                                : 'hover:bg-gray-700/50 text-gray-300'
                                            }`}
                                        >
                                            <div className="relative">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 ${selectedRecipientId === artist.id ? 'bg-gray-900 text-white border-gray-900' : 'bg-gray-700 text-brand-gold border-gray-600'}`}>
                                                    {artist.name.charAt(0).toUpperCase()}
                                                </div>
                                                {artist.isOnline && (
                                                    <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-gray-800" title="Online"></span>
                                                )}
                                            </div>
                                            <span className="font-semibold truncate">{artist.name}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            {allArtists.length === 0 && (
                                <p className="text-gray-500 text-center text-sm py-10 px-4 italic">No other artists found in the registry.</p>
                            )}
                        </div>
                    </div>
                    
                    {/* CHAT WINDOW */}
                    <div className="lg:col-span-3 bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 flex flex-col overflow-hidden">
                        {/* Chat Header */}
                        <div className="p-4 bg-gray-800 border-b border-gray-700 flex items-center gap-4">
                            {selectedRecipientId ? (
                                <>
                                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center font-bold text-brand-gold border border-gray-600">
                                        {sortedArtists.find(a => a.id === selectedRecipientId)?.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-white leading-tight">
                                            {sortedArtists.find(a => a.id === selectedRecipientId)?.name}
                                        </h2>
                                        <span className="text-xs text-green-400 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                                            Active Session
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <h2 className="text-lg font-bold text-gray-400">Welcome to Message Hub</h2>
                            )}
                        </div>
                        
                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
                            {!selectedRecipientId ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-60">
                                    <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                                    <p className="text-lg font-heading">Start a Collaboration</p>
                                    <p className="text-sm">Select an artist from the left to begin</p>
                                </div>
                            ) : (
                                <>
                                    {messages.length === 0 && (
                                        <div className="text-center py-10 opacity-40">
                                            <p className="text-sm italic">Say hello to start the conversation!</p>
                                        </div>
                                    )}
                                    {messages.map((msg, index) => (
                                        <div 
                                            key={index} 
                                            className={`flex flex-col ${msg.isOwnMessage ? 'items-end' : 'items-start'}`}
                                        >
                                            <div className={`relative max-w-[80%] px-4 py-2.5 rounded-2xl text-sm shadow-md transition-all ${
                                                msg.isOwnMessage 
                                                ? 'bg-brand-gold text-gray-900 rounded-br-none' 
                                                : 'bg-gray-700 text-white rounded-tl-none border border-gray-600'
                                            }`}>
                                                {msg.message}
                                            </div>
                                            <span className="text-[10px] uppercase tracking-tighter mt-1 opacity-50 px-1">
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    ))}
                                </>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                        
                        {/* Input Footer */}
                        <div className="p-4 bg-gray-800/80 border-t border-gray-700">
                            <form onSubmit={sendMessage} className="flex items-center gap-3">
                                <input 
                                    type="text"
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    placeholder={selectedRecipientId ? 'Write something...' : 'Select a contact to type'}
                                    disabled={!selectedRecipientId}
                                    className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold/50 disabled:opacity-30 placeholder-gray-600 text-sm transition-all"
                                />
                                <button 
                                    type="submit"
                                    disabled={!selectedRecipientId || !inputMessage.trim()}
                                    className="w-12 h-12 flex items-center justify-center bg-brand-gold text-gray-900 rounded-xl hover:bg-brand-gold-antique active:scale-95 transition-all disabled:opacity-30 disabled:grayscale group shadow-lg"
                                >
                                    <svg className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}