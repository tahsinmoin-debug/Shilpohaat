"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/components/AuthProvider';
import Header from '@/app/components/Header';

interface Lesson {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  order: number;
}

interface WorkshopContent {
  _id: string;
  title: string;
  lessons: Lesson[];
  instructor: {
    name: string;
  };
}

export default function LearnWorkshopPage() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [workshop, setWorkshop] = useState<WorkshopContent | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchContent = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/workshops/${id}/learn?firebaseUID=${user.uid}`);
        const data = await res.json();

        if (data.success) {
          setWorkshop(data.workshop);
          // Set the first lesson as active by default
          if (data.workshop.lessons && data.workshop.lessons.length > 0) {
            setActiveLesson(data.workshop.lessons.sort((a: Lesson, b: Lesson) => a.order - b.order)[0]);
          }
        } else {
          setError(data.message || "Access denied.");
        }
      } catch (err) {
        setError("Failed to load content.");
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [id, user, authLoading, router]);

  if (loading || authLoading) return <div className="p-20 text-white bg-[#0b1926] min-h-screen">Loading Classroom...</div>;
  if (error) return <div className="p-20 text-red-500 bg-[#0b1926] min-h-screen">{error}</div>;
  if (!workshop) return null;

  // Helper to determine if URL is YouTube or Direct
  const renderVideo = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.split('v=')[1] || url.split('/').pop();
      return (
        <iframe
          className="w-full aspect-video rounded-xl"
          src={`https://www.youtube.com/embed/${videoId}`}
          allowFullScreen
        />
      );
    }
    return (
      <video controls className="w-full aspect-video rounded-xl bg-black">
        <source src={url} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    );
  };

  return (
    <main className="min-h-screen bg-[#0b1926] text-white">
      <Header />
      
      <div className="flex flex-col lg:flex-row h-[calc(100-64px)]">
        {/* LEFT SIDE: Video Player & Info */}
        <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {activeLesson ? (
            <>
              {renderVideo(activeLesson.videoUrl)}
              <h1 className="text-2xl font-bold mt-6 text-brand-gold">{activeLesson.title}</h1>
              <p className="text-gray-400 mt-2 whitespace-pre-line">{activeLesson.description}</p>
              <div className="mt-8 p-4 bg-[#152635] rounded-lg border border-gray-700">
                <h3 className="font-bold mb-2">About this Workshop</h3>
                <p className="text-sm text-gray-300">Instructor: {workshop.instructor.name}</p>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-64 bg-[#152635] rounded-xl text-gray-400">
              No lessons uploaded yet for this workshop.
            </div>
          )}
        </div>

        {/* RIGHT SIDE: Lesson Sidebar */}
        <div className="w-full lg:w-96 bg-[#152635] border-l border-gray-700 overflow-y-auto">
          <div className="p-4 border-b border-gray-700 bg-[#1e2f3e]">
            <h2 className="font-bold text-lg">Workshop Content</h2>
            <p className="text-xs text-gray-400">{workshop.lessons.length} Lessons</p>
          </div>
          
          <div className="divide-y divide-gray-700">
            {workshop.lessons
              .sort((a, b) => a.order - b.order)
              .map((lesson, index) => (
                <button
                  key={lesson._id}
                  onClick={() => setActiveLesson(lesson)}
                  className={`w-full text-left p-4 hover:bg-[#1e2f3e] transition-colors flex gap-4 ${
                    activeLesson?._id === lesson._id ? 'bg-[#0b1926] border-l-4 border-brand-gold' : ''
                  }`}
                >
                  <span className="text-gray-500 font-mono">{index + 1}</span>
                  <div>
                    <p className={`text-sm font-medium ${activeLesson?._id === lesson._id ? 'text-brand-gold' : 'text-white'}`}>
                      {lesson.title}
                    </p>
                    <p className="text-xs text-gray-500">Video Tutorial</p>
                  </div>
                </button>
              ))}
          </div>
        </div>
      </div>
    </main>
  );
}