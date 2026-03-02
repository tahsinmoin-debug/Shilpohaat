'use client';

import Header from '../components/Header';
import { useAuth } from '../components/AuthProvider';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import { API_BASE_URL as API_HOST } from '@/lib/config';

interface Contact {
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

export default function MessagesPage() {
    const { user, appUser, loading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [allContacts, setAllContacts] = useState<Contact[]>([]);
    const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
    const [selectedRecipientId, setSelectedRecipientId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const selectedRecipientIdRef = useRef(selectedRecipientId);
    
    useEffect(() => {
        selectedRecipientIdRef.current = selectedRecipientId;
    }, [selectedRecipientId]);

    const fetchAllContacts = useCallback(async () => {
        if (!user) return;
        try {
            const response = await fetch(`${API_BASE_URL}/artist/hub-artists`);
            if (!response.ok) throw new Error('Failed to fetch users');
            
            // Backend sends array of all users directly
            const data: Contact[] = await response.json();
            
            const filteredUsers = data
                .filter(contact => contact.id !== user.uid)
                .map(contact => ({ ...contact, isOnline: false }));

            setAllContacts(filteredUsers);
        } catch (error) {
            console.error("Contacts Fetch Error:", error);
        }
    }, [user]);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (user?.uid) fetchAllContacts();
    }, [user?.uid, fetchAllContacts]);

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

    const handleSelectRecipient = async (contactId: string) => {
        setSelectedRecipientId(contactId);
        setMessages([]);
        
        // Load message history from database
        if (!user) return;
        
        try {
            const response = await fetch(`${API_BASE_URL}/messages/conversation/${contactId}`, {
                headers: {
                    'x-firebase-uid': user.uid
                }
            });
            
            if (response.ok) {
                const data = await respo