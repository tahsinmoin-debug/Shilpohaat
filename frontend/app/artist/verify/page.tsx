"use client";
import { useState, useEffect } from 'react';
import Header from '../../components/Header';
import { useAuth } from '../../components/AuthProvider';

export default function VerificationPage() {
    const { user } = useAuth();
    const [nidNumber, setNidNumber] = useState('');
    const [status, setStatus] = useState('unsubmitted');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user) {
            fetch(`http://localhost:5000/api/verify/status/${user.uid}`)
                .then(res => res.json())
                .then(data => setStatus(data.nidStatus));
        }
    }, [user]);

    const handleNidSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        
        // Note: For NID image upload, use your existing upload logic/route first
        const res = await fetch('http://localhost:5000/api/verify/submit-nid', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: user?.uid,
                nidNumber: nidNumber,
                nidDocumentUrl: "placeholder_link_after_upload"
            })
        });

        if (res.ok) {
            alert("NID Submitted Successfully!");
            setStatus('pending');
        }
        setIsLoading(false);
    };

    return (
        <main className="min-h-screen bg-gray-900 text-white">
            <Header />
            <div className="container mx-auto px-4 py-12">
                <h1 className="text-3xl font-heading mb-4">Identity Verification</h1>
                
                <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 max-w-xl">
                    <p className="mb-6 text-gray-400">Status: 
                        <span className="ml-2 text-brand-gold font-bold uppercase">{status}</span>
                    </p>

                    {status === 'unsubmitted' && (
                        <form onSubmit={handleNidSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm mb-2">NID Number</label>
                                <input 
                                    className="w-full p-3 bg-gray-700 rounded border border-gray-600 outline-none"
                                    onChange={(e) => setNidNumber(e.target.value)}
                                    placeholder="Enter 10 or 17 digit NID"
                                    required
                                />
                            </div>
                            <button className="w-full py-3 bg-brand-gold text-black font-bold rounded hover:bg-yellow-500 transition">
                                {isLoading ? "Submitting..." : "Submit NID for Verification"}
                            </button>
                        </form>
                    )}

                    {status === 'pending' && (
                        <div className="p-4 bg-blue-500/10 border border-blue-500 text-blue-400 rounded">
                            Your identity is being verified by our team. Please wait 24-48 hours.
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}