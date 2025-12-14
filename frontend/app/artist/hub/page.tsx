'use client';

import Header from '../../components/Header';
import { useAuth } from '../../components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import io from 'socket.io-client';

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

const SOCKET_SERVER_URL = 'http://localhost:5000';
const API_BASE_URL = 'http://localhost:5000/api';
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
    
    // 💡 NEW: Ref to hold the current recipient ID
    const selectedRecipientIdRef = useRef(selectedRecipientId);
    
    // 💡 NEW: Update the Ref whenever selectedRecipientId changes
    useEffect(() => {
        selectedRecipientIdRef.current = selectedRecipientId;
    }, [selectedRecipientId]);
    

    const fetchAllArtists = useCallback(async () => {
        if (!user) return;
        try {
            const response = await fetch(`${API_BASE_URL}/artist/hub-artists`);
            if (!response.ok) throw new Error('Failed to fetch artists');
            
            const data: { id: string, name: string }[] = await response.json();
            
            const filteredArtists: Artist[] = data.artists
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
            // console.log("SUCCESS: Socket Connected!"); // Removed diagnostic
            if (user?.uid) {
                // console.log("Attempting to register UID:", user.uid); // Removed diagnostic
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
                
                
                console.log(`[RECEIVER] Received and displayed message from: ${messageData.senderId}`); // <-- NEW LOG
            } else {
                 console.log(`[RECEIVER] Message received but ignored (Not current chat): ${messageData.senderId}`); // <-- NEW LOG
            }
        });

        return () => {
            if (socket) {
                socket.disconnect();
            }
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
                    <p className="text-white text-lg">Loading...</p>
                </div>
            </main>
        );
    }
    
    return (
        <main className="min-h-screen bg-gray-900 text-white flex flex-col">
            <Header />
            <div className="container mx-auto px-4 py-12 flex-1 flex flex-col">
                <h1 className="text-3xl font-heading text-white mb-8">Artist Messaging Hub</h1>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1">
                    
                    <div className="lg:col-span-1 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                        <div className="bg-gray-800 rounded-lg p-4 shadow-xl border border-gray-700">
                            <h2 className="text-xl font-semibold mb-3 border-b border-gray-700 pb-2">All Artists ({allArtists.length})</h2>
                            <ul className="space-y-2">
                                {sortedArtists.map((artist) => (
                                    <li key={artist.id}>
                                        <button 
                                            onClick={() => handleSelectRecipient(artist.id)}
                                            className={`w-full text-left p-3 rounded-lg transition-colors flex justify-between items-center ${
                                                selectedRecipientId === artist.id 
                                                ? 'bg-brand-gold text-gray-900 font-medium' 
                                                : 'hover:bg-gray-700 text-gray-300'
                                            }`}
                                        >
                                            <span className="truncate">{artist.name}</span>
                                            {artist.isOnline && (
                                                <span className="h-2 w-2 bg-green-500 rounded-full ml-2 flex-shrink-0" aria-label="Online"></span>
                                            )}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            {allArtists.length === 0 && (
                                <p className="text-gray-500 text-sm mt-4">No artists registered yet.</p>
                            )}
                        </div>
                    </div>
                    
                    <div className="lg:col-span-3 bg-gray-800 rounded-lg p-6 shadow-xl border border-gray-700 flex flex-col max-h-[calc(100vh-200px)]">
                        <h2 className="text-2xl font-heading mb-4 text-brand-gold border-b border-gray-700 pb-2">
                            {selectedRecipientId ? `Chatting with: ${sortedArtists.find(a => a.id === selectedRecipientId)?.name || selectedRecipientId}` : 'Select an Artist to Chat'}
                        </h2>
                        
                        <div className="flex-1 overflow-y-auto rounded-lg p-4 mb-4 space-y-4">
                            {!selectedRecipientId ? (
                                <div className="text-gray-500 text-center py-10">
                                    Choose an artist from the list to start a conversation.
                                </div>
                            ) : (
                                messages.map((msg, index) => (
                                    <div 
                                        key={index} 
                                        className={`flex ${msg.isOwnMessage ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-xl ${
                                            msg.isOwnMessage 
                                            ? 'bg-brand-gold text-gray-900 rounded-br-none' 
                                            : 'bg-gray-700 text-white rounded-tl-none'
                                        }`}>
                                            <p className="text-sm">{msg.message}</p>
                                            <span className={`block text-xs mt-1 ${msg.isOwnMessage ? 'text-gray-700' : 'text-gray-400'}`}>
                                                {new Date(msg.timestamp).toLocaleTimeString()}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                        
                        <form onSubmit={sendMessage} className="flex gap-3">
                            <input 
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                placeholder={selectedRecipientId ? 'Type your message...' : 'Select an artist first...'}
                                disabled={!selectedRecipientId}
                                className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold disabled:opacity-50"
                            />
                            <button 
                                type="submit"
                                disabled={!selectedRecipientId || !inputMessage.trim()}
                                className="px-6 py-2 bg-brand-gold text-gray-900 font-semibold rounded-lg hover:bg-brand-gold-antique transition-colors disabled:opacity-50"
                            >
                                Send
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    );
}