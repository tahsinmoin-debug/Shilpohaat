"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/app/components/AuthProvider';
import Header from '@/app/components/Header';

export default function ArtistEnrollmentView() {
  const { id } = useParams();
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetch(`http://localhost:5000/api/workshops/${id}/enrollments?firebaseUID=${user.uid}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) setStudents(data.enrollments);
          setLoading(false);
        });
    }
  }, [id, user]);

  return (
    <main className="min-h-screen bg-[#0b1926] text-white">
      <Header />
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Enrolled Students</h1>
        
        <div className="bg-[#152635] rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#1e2f3e] text-brand-gold">
              <tr>
                <th className="p-4">Student Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Enrollment Date</th>
              </tr>
            </thead>
            <tbody>
              {students.length > 0 ? students.map((enrollment: any) => (
                <tr key={enrollment._id} className="border-b border-gray-700">
                  <td className="p-4">{enrollment.user.name}</td>
                  <td className="p-4">{enrollment.user.email}</td>
                  <td className="p-4">{new Date(enrollment.createdAt).toLocaleDateString()}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3} className="p-10 text-center text-gray-500">No students enrolled yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}