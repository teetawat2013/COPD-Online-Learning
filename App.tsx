import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Link, NavLink, useNavigate, useParams, Navigate } from 'react-router-dom';
import Swal from 'sweetalert2';

import { supabase } from './firebase';
import { LESSONS, NAV_ITEMS, LESSON_ICONS } from './constants';
import { Section, type Video, type LessonVideo } from './types';
import { useLearningSystem } from './hooks/useLearningSystem';
import { QuizPage } from './components/QuizPage';
import { BackToTopButton } from './components/BackToTopButton';
import { LungsIcon, LockIcon, YouTubeIcon } from './components/IconComponents';

const getYoutubeVideoInfo = (url: string | undefined): { watchUrl: string; thumbnailUrl: string; } | null => {
    if (!url) return null;
    
    // A more robust regex to find the 11-character video ID from various YouTube URL formats.
    const youtubeIdRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/;
    const match = url.match(youtubeIdRegex);

    if (match && match[1]) {
        const videoId = match[1];
        return {
            watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
            thumbnailUrl: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
        };
    }

    return null;
};


const Layout: React.FC<{ children: React.ReactNode; isLessonUnlocked: (id: number) => boolean; isQuizUnlocked: boolean; dbError: string | null; }> = ({ children, isLessonUnlocked, isQuizUnlocked, dbError }) => {
    return (
        <div className="min-h-screen bg-slate-100 flex flex-col">
            <Header isLessonUnlocked={isLessonUnlocked} isQuizUnlocked={isQuizUnlocked} />
            <main className="container mx-auto p-4 sm:p-6 lg:p-8 flex-grow">
                {dbError && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-800 p-4 mb-6 rounded-r-lg shadow-md" role="alert">
                        <h3 className="font-bold text-lg">พบข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล</h3>
                        <p className="mt-1 text-sm">{dbError}</p>
                        <p className="mt-3 text-sm">
                          <strong>คำแนะนำ:</strong> เนื้อหาบางส่วน (เช่น วิดีโอ) อาจไม่แสดงผล แต่ท่านยังสามารถเรียนบทเรียนเนื้อหาหลักได้ตามปกติ
                        </p>
                    </div>
                )}
                {children}
            </main>
            <Footer />
            <BackToTopButton />
        </div>
    );
};

const Header: React.FC<{ isLessonUnlocked: (id: number) => boolean; isQuizUnlocked: boolean; }> = ({ isLessonUnlocked, isQuizUnlocked }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();

    const closeMobileMenu = () => setMobileMenuOpen(false);

    const CustomNavLink: React.FC<{item: any, isSubItem?: boolean}> = ({ item, isSubItem = false }) => {
        const lessonId = item.section.startsWith('lesson') ? parseInt(item.section.replace('lesson', '')) : 0;
        const isLocked = (lessonId > 0 && !isLessonUnlocked(lessonId)) || (item.section === Section.Quiz && !isQuizUnlocked);

        if (isLocked) {
            return (
                <span className={`flex items-center w-full text-left p-2 rounded-md transition-colors duration-200 text-slate-400 cursor-not-allowed ${isSubItem ? 'pl-10' : ''}`}>
                    {item.icon} {item.label} <LockIcon />
                </span>
            );
        }

        return (
            <NavLink
                to={item.path}
                onClick={closeMobileMenu}
                className={({ isActive }) => `flex items-center w-full text-left p-2 rounded-md transition-colors duration-200 ${isSubItem ? 'pl-10' : ''} ${isActive ? 'bg-cyan-500 text-white' : 'text-slate-600 hover:bg-cyan-100 hover:text-cyan-800'}`}
            >
                {item.icon} {item.label}
            </NavLink>
        );
    };
    
    return (
        <header className="bg-white shadow-md sticky top-0 z-40">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="flex items-center cursor-pointer">
                        <LungsIcon />
                        <h1 className="ml-3 text-xl font-bold text-cyan-600">บทเรียนออนไลน์ COPD</h1>
                    </Link>
                    <nav className="hidden md:flex items-baseline space-x-4">
                        {NAV_ITEMS.map((item) => (
                            item.subItems ? (
                                <div key={item.section} className="relative group">
                                    <span className={`px-3 py-2 rounded-md text-sm font-medium flex items-center cursor-default ${location.pathname.startsWith('/lesson') ? 'text-cyan-600' : 'text-slate-600'}`}>
                                        {item.icon} {item.label}
                                    </span>
                                    <div className="absolute left-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                                        <div className="py-1">
                                            {item.subItems.map(sub => <CustomNavLink key={sub.section} item={sub} />)}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <CustomNavLink key={item.section} item={item} />
                            )
                        ))}
                    </nav>
                    <div className="-mr-2 flex md:hidden">
                        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="bg-cyan-500 inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-cyan-600 focus:outline-none">
                            <i className="fa-solid fa-bars"></i>
                        </button>
                    </div>
                </div>
            </div>
            {mobileMenuOpen && (
                <div className="md:hidden p-2">
                    {NAV_ITEMS.map(item => (
                        <div key={item.section}>
                            {!item.subItems && <CustomNavLink item={item} />}
                            {item.subItems && (
                                <>
                                <span className={`flex items-center w-full text-left p-2 rounded-md text-slate-600`}>{item.icon} {item.label}</span>
                                {item.subItems.map(sub => <CustomNavLink key={sub.section} item={sub} isSubItem />)}
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </header>
    );
};

const HomePage: React.FC<{ progress: number, completedCount: number, totalLessons: number }> = ({ progress, completedCount, totalLessons }) => {
    const navigate = useNavigate();
    return (
    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md animate-fade-in">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-cyan-800 leading-tight">บทเรียนออนไลน์การส่งเสริมการรับรู้สมรรถนะแห่งตน<br/>และการฝึกบริหารการหายใจ สำหรับผู้ป่วยโรคปอดอุดกั้นเรื้อรัง</h2>
        
        <div className="max-w-md mx-auto mt-8">
            <h3 className="text-lg font-semibold text-center mb-2">ความคืบหน้าโดยรวม</h3>
            <div className="w-full bg-slate-200 rounded-full h-6">
                <div className="bg-cyan-500 h-6 rounded-full flex items-center justify-center text-white font-bold" style={{ width: `${progress}%` }}>
                    {progress}%
                </div>
            </div>
            <p className="text-center mt-2 text-slate-500">เรียนจบบทเรียนแล้ว {completedCount}/{totalLessons} บท</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {LESSONS.map(lesson => (
                <div key={lesson.id} onClick={() => navigate(`/lesson/${lesson.id}`)} className="bg-slate-50 p-6 rounded-lg text-center cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300">
                    <div className="mb-4">{LESSON_ICONS[lesson.id]}</div>
                    <h4 className="font-bold text-cyan-700">{lesson.title}</h4>
                </div>
            ))}
        </div>
    </div>
    )
};

const LessonPageWrapper: React.FC<{ isLessonUnlocked: (id: number) => boolean; isLessonCompleted: (id: number) => boolean; onComplete: (id: number) => void; lessonVideo?: LessonVideo }> = ({ isLessonUnlocked, isLessonCompleted, onComplete, lessonVideo }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const lessonId = parseInt(id || '1', 10);
    const lesson = LESSONS.find(l => l.id === lessonId);

    if (!lesson) {
        return <Navigate to="/" replace />;
    }

    if (!isLessonUnlocked(lesson.id)) {
        return (
            <div className="text-center p-8 bg-white rounded-lg shadow-md">
                <LockIcon />
                <h2 className="text-2xl font-bold my-4">บทเรียนนี้ถูกล็อคอยู่</h2>
                <p className="text-slate-600 mb-6">กรุณาทำบทเรียนก่อนหน้าให้เสร็จสิ้น</p>
                <button
                    onClick={() => navigate(`/lesson/${lessonId - 1}`)}
                    className="px-6 py-2 bg-cyan-500 text-white font-semibold rounded-full hover:bg-cyan-600 transition-colors"
                >
                    กลับไปบทเรียนก่อนหน้า
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md animate-fade-in-up">
            <h2 className="text-3xl font-bold mb-6 text-cyan-800">{lesson.title}</h2>
            <div className="prose prose-lg max-w-none text-slate-700">
                {lesson.content}
            </div>
             {lesson.hasDynamicVideo && lessonVideo && lessonVideo.url && (
                <div className="mt-8">
                    <h3 className="text-2xl font-bold text-cyan-700 mb-4">{lessonVideo.title || 'วิดีโอประกอบ'}</h3>
                    {(() => {
                        const videoInfo = getYoutubeVideoInfo(lessonVideo.url);
                        if (!videoInfo) return null;
                        return (
                             <a href={videoInfo.watchUrl} target="_blank" rel="noopener noreferrer" className="block group">
                                <div className="relative aspect-video w-full overflow-hidden rounded-lg shadow-md">
                                    <img src={videoInfo.thumbnailUrl} alt={lessonVideo.title || 'Lesson Video'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 group-hover:bg-opacity-10 transition-all duration-300">
                                       <YouTubeIcon className="text-white text-5xl opacity-80 group-hover:opacity-100 transform group-hover:scale-110 transition-transform duration-300" />
                                    </div>
                                </div>
                            </a>
                        );
                    })()}
                </div>
            )}
            <div className="mt-10 text-center">
                <button
                    onClick={() => onComplete(lesson.id)}
                    disabled={isLessonCompleted(lesson.id)}
                    className="px-8 py-3 bg-green-500 text-white font-bold rounded-full hover:bg-green-600 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed text-lg"
                >
                    {isLessonCompleted(lesson.id) ? '✓ เรียนจบบทนี้แล้ว' : 'ทำเครื่องหมายว่าเรียนจบแล้ว'}
                </button>
            </div>
        </div>
    );
};

const VideosPage: React.FC<{ videos: Video[] }> = ({ videos }) => {
    return (
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md animate-fade-in-up">
            <h2 className="text-3xl font-bold text-cyan-800 mb-6">สื่อวิดิทัศน์</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {videos.length > 0 ? (
                    videos.map(video => {
                        const videoInfo = getYoutubeVideoInfo(video.url);
                        if (!videoInfo) return null;
                        return (
                            <a key={video.id} href={videoInfo.watchUrl} target="_blank" rel="noopener noreferrer" className="block group">
                                <div className="relative aspect-video w-full overflow-hidden rounded-lg shadow-md">
                                    <img src={videoInfo.thumbnailUrl} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 group-hover:bg-opacity-10 transition-all duration-300">
                                       <YouTubeIcon className="text-white text-5xl opacity-80 group-hover:opacity-100 transform group-hover:scale-110 transition-transform duration-300" />
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-cyan-700 mt-3 group-hover:text-cyan-800">{video.title}</h3>
                            </a>
                        );
                    })
                ) : (
                    <p className="text-center text-slate-500 py-10 md:col-span-2">กำลังโหลดวิดีโอ หรือยังไม่มีวิดีโอในระบบ</p>
                )}
            </div>
        </div>
    );
};

const Footer: React.FC = () => (
    <footer className="bg-white mt-8 py-6">
      <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
        <p>© 2025 บทเรียนออนไลน์การส่งเสริมการรับรู้สมรรถนะแห่งตนและการฝึกบริหารการหายใจ สำหรับผู้ป่วยโรคปอดอุดกั้นเรื้อรัง</p>
        <p className="mt-2">พัฒนาโดย บุษบา วงค์นาง และ เพ็ญศรี อุทรา โรงพยาบาลแม่ออน ร่วมกับ อรรถวิทย์ จันทร์ศิริ คณะพยาบาลศาสตร์แมคคอร์มิค มหาวิทยาลัยพายัพ | All rights reserved.</p>
      </div>
    </footer>
);

const App: React.FC = () => {
    const { progress, completeLesson, saveQuizScore, resetProgress, isLessonCompleted, isLessonUnlocked, isQuizUnlocked, overallProgress } = useLearningSystem();
    const navigate = useNavigate();
    
    const [videos, setVideos] = useState<Video[]>([]);
    const [lessonVideo, setLessonVideo] = useState<LessonVideo | null>(null);
    const [dbError, setDbError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAndSubscribe = async () => {
            setDbError(null);
            
            // Try fetching videos
            try {
                const { data: videosData, error: videosError } = await supabase
                    .from('videos')
                    .select('*')
                    .order('created_at', { ascending: false });
                
                if (videosError) throw videosError;
                setVideos(videosData || []);
            } catch (error: any) {
                // Log error but don't show a blocking alert for videos
                console.warn('Unable to fetch videos (App can still function):', error.message || error);
            }

            // Try fetching lesson video
            try {
                const { data: lessonVideoData, error: lessonVideoError } = await supabase
                    .from('lesson_videos')
                    .select('url, title')
                    .eq('id', 1)
                    .maybeSingle();
                
                if (lessonVideoError) throw lessonVideoError;
                setLessonVideo(lessonVideoData);
            } catch (error: any) {
                // Log error but don't show a blocking alert for lesson videos
                console.warn('Unable to fetch lesson video (App can still function):', error.message || error);
            }
        };

        fetchAndSubscribe();
        
        const channel = supabase.channel('db-changes');
        
        const subscription = channel
            .on('postgres_changes', { event: '*', schema: 'public', table: 'videos' }, () => fetchAndSubscribe())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'lesson_videos' }, () => fetchAndSubscribe())
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handleCompleteLesson = (lessonId: number) => {
      if(!isLessonCompleted(lessonId)) {
        completeLesson(lessonId);
        Swal.fire({
            title: 'เรียนจบแล้ว!',
            text: `ยินดีด้วย! คุณเรียนจบบทที่ ${lessonId} แล้ว`,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            allowOutsideClick: false,
        });
        const nextLessonId = lessonId + 1;
        if (nextLessonId <= LESSONS.length) {
            setTimeout(() => navigate(`/lesson/${nextLessonId}`), 1500);
        } else {
             setTimeout(() => navigate('/quiz'), 1500);
        }
      }
    };

    const location = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    return (
        <>
            <Routes>
                <Route path="/*" element={
                    <Layout isLessonUnlocked={isLessonUnlocked} isQuizUnlocked={isQuizUnlocked} dbError={dbError}>
                        <Routes>
                            <Route path="/" element={<HomePage progress={overallProgress} completedCount={progress.completedLessons.length} totalLessons={LESSONS.length} />} />
                            <Route path="/lesson/:id" element={<LessonPageWrapper isLessonUnlocked={isLessonUnlocked} isLessonCompleted={isLessonCompleted} onComplete={handleCompleteLesson} lessonVideo={lessonVideo ?? undefined} />} />
                            <Route path="/quiz" element={<QuizPage isUnlocked={isQuizUnlocked} score={progress.quizScore} saveQuizScore={saveQuizScore} resetProgress={resetProgress} goToHome={() => navigate('/')} goToLessons={() => navigate('/lesson/1')} />} />
                            <Route path="/videos" element={<VideosPage videos={videos} />} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </Layout>
                } />
            </Routes>
        </>
    );
};

export default App;
