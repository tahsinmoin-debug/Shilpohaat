"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import Header from '@/app/components/Header';

interface Lesson {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: number;
  order: number;
}

interface LessonProgress {
  lessonId: string;
  completed: boolean;
  watchedDuration: number;
  lastWatchedAt?: string;
}

interface Workshop {
  _id: string;
  title: string;
  description: string;
  type: 'recorded' | 'live';
  lessons?: Lesson[];
  liveSessionUrl?: string;
  instructor: {
    name: string;
  };
}

interface Enrollment {
  _id: string;
  progress: LessonProgress[];
  overallProgress: number;
  isCompleted: boolean;
}

export default function LearningPage() {
  const params = useParams();
  const router = useRouter();
  const workshopId = params.id as string;

  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    fetchLearningContent();
  }, [workshopId]);

  const fetchLearningContent = async () => {
    const user = auth.currentUser;
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5000/api/workshops/${workshopId}/learn?firebaseUID=${user.uid}`
      );
      const data = await res.json();

      if (!data.success) {
        alert(data.message || 'You do not have access to this workshop');
        router.push(`/workshops/${workshopId}`);
        return;
      }

      setWorkshop(data.workshop);
      setEnrollment(data.enrollment);
      setHasAccess(true);

      // Set first lesson as current
      if (data.workshop.type === 'recorded' && data.workshop.lessons?.length > 0) {
        const sortedLessons = [...data.workshop.lessons].sort((a, b) => a.order - b.order);
        setCurrentLesson(sortedLessons[0]);
      }
    } catch (error) {
      console.error('Failed to fetch learning content:', error);
      router.push(`/workshops/${workshopId}`);
    } finally {
      setLoading(false);
    }
  };

  const markLessonComplete = async (lessonId: string) => {
    const user = auth.currentUser;
    if (!user || !enrollment) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/workshops/enrollments/${enrollment._id}/progress?firebaseUID=${user.uid}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lessonId,
            completed: true
          })
        }
      );

      const data = await res.json();

      if (data.success) {
        setEnrollment(data.enrollment);
        alert('Lesson marked as complete! 🎉');
      }
    } catch (error) {
      console.error('Failed to mark lesson complete:', error);
    }
  };

  const isLessonCompleted = (lessonId: string) => {
    if (!enrollment) return false;
    const progress = enrollment.progress.find(p => p.lessonId === lessonId);
    return progress?.completed || false;
  };

  const getVideoEmbedUrl = (url: string) => {
    // Convert YouTube URLs to embed format
    if (url.includes('youtube.com/watch')) {
      const videoId = new URL(url).searchParams.get('v');
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1].split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    // Convert Vimeo URLs to embed format
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1].split('?')[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return url;
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-brand-maroon">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold mx-auto"></div>
          <p className="text-white mt-4">Loading workshop...</p>
        </div>
      </main>
    );
  }

  if (!hasAccess || !workshop) {
    return (
      <main className="min-h-screen bg-brand-maroon">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-white text-xl">Access denied or workshop not found</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900">
      <Header />

      <div className="flex h-[calc(100vh-80px)]">
        {/* Video Player Section */}
        <div className="flex-1 flex flex-col">
          {/* Video */}
          <div className="bg-black aspect-video w-full">
            {workshop.type === 'recorded' && currentLesson ? (
              <iframe
                src={getVideoEmbedUrl(currentLesson.videoUrl)}
                title={currentLesson.title}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            ) : workshop.type === 'live' && workshop.liveSessionUrl ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <p className="text-white text-2xl mb-4">🔴 Live Session</p>
                  <a
                    href={workshop.liveSessionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-brand-gold text-gray-900 px-8 py-3 rounded-lg font-bold hover:bg-yellow-500 inline-block"
                  >
                    Join Live Session
                  </a>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white">
                No video available
              </div>
            )}
          </div>

          {/* Video Info */}
          <div className="bg-gray-800 p-6 border-t border-gray-700">
            <h1 className="text-2xl font-heading text-white mb-2">
              {currentLesson?.title || workshop.title}
            </h1>
            <p className="text-gray-400 mb-4">
              by {workshop.instructor.name}
            </p>
            {currentLesson?.description && (
              <p className="text-gray-300 mb-4">{currentLesson.description}</p>
            )}
            
            {/* Progress Bar */}
            {enrollment && workshop.type === 'recorded' && (
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Course Progress</span>
                  <span>{enrollment.overallProgress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-brand-gold h-2 rounded-full transition-all duration-300"
                    style={{ width: `${enrollment.overallProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {currentLesson && (
              <button
                onClick={() => markLessonComplete(currentLesson._id)}
                disabled={isLessonCompleted(currentLesson._id)}
                className={`px-6 py-2 rounded-lg font-semibold ${
                  isLessonCompleted(currentLesson._id)
                    ? 'bg-green-600 text-white cursor-not-allowed'
                    : 'bg-brand-gold text-gray-900 hover:bg-yellow-500'
                }`}
              >
                {isLessonCompleted(currentLesson._id) ? '✓ Completed' : 'Mark as Complete'}
              </button>
            )}
          </div>
        </div>

        {/* Sidebar - Lessons List */}
        {workshop.type === 'recorded' && workshop.lessons && (
          <div className="w-96 bg-gray-800 border-l border-gray-700 overflow-y-auto">
            <div className="p-4 border-b border-gray-700 sticky top-0 bg-gray-800 z-10">
              <h2 className="text-xl font-heading text-white">Course Content</h2>
              <p className="text-gray-400 text-sm mt-1">
                {workshop.lessons.length} lessons
              </p>
            </div>

            <div className="p-2">
              {[...workshop.lessons]
                .sort((a, b) => a.order - b.order)
                .map((lesson, index) => {
                  const isCompleted = isLessonCompleted(lesson._id);
                  const isCurrent = currentLesson?._id === lesson._id;

                  return (
                    <button
                      key={lesson._id}
                      onClick={() => setCurrentLesson(lesson)}
                      className={`w-full text-left p-4 rounded-lg mb-2 transition-colors ${
                        isCurrent
                          ? 'bg-brand-gold/20 border-2 border-brand-gold'
                          : 'bg-gray-700/50 hover:bg-gray-700 border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            isCompleted
                              ? 'bg-green-600 text-white'
                              : isCurrent
                              ? 'bg-brand-gold text-gray-900'
                              : 'bg-gray-600 text-gray-300'
                          }`}
                        >
                          {isCompleted ? '✓' : index + 1}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3
                            className={`font-semibold mb-1 ${
                              isCurrent ? 'text-brand-gold' : 'text-white'
                            }`}
                          >
                            {lesson.title}
                          </h3>
                          {lesson.duration > 0 && (
                            <p className="text-gray-400 text-xs">
                              ⏱️ {lesson.duration} min
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}