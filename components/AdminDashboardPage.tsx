import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { supabase } from '../firebase';
import { type Video, type LessonVideo } from '../types';
import { UserShieldIcon, PowerIcon } from './IconComponents';

export const AdminDashboardPage: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [lessonVideo, setLessonVideo] = useState<LessonVideo>({ url: '', title: '' });
  const [loading, setLoading] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const navigate = useNavigate();

  // State for forms
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  
  const fetchData = useCallback(async (offline = false) => {
    try {
      if (offline) {
          // Mock data for offline mode
          setVideos([
              { id: '1', title: 'ตัวอย่าง: การออกกำลังกายปอด (Offline Mode)', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
              { id: '2', title: 'ตัวอย่าง: การหายใจอย่างถูกวิธี (Offline Mode)', url: 'https://www.youtube.com/watch?v=example' }
          ]);
          setLessonVideo({ title: 'ตัวอย่าง: วิดีโอประกอบบทเรียน (Offline)', url: 'https://www.youtube.com/watch?v=example' });
          return;
      }

      const { data: videosData, error: videosError } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (videosError) throw videosError;
      setVideos(videosData || []);

      const { data: lessonVideoData, error: lessonVideoError } = await supabase
        .from('lesson_videos')
        .select('*')
        .eq('id', 1)
        .maybeSingle();
        
      if (lessonVideoError) throw lessonVideoError;
      if (lessonVideoData) {
        setLessonVideo(lessonVideoData);
      }
    } catch (e: any) {
      console.warn("Fetch error, switching to mock data view:", e);
      // If real fetch fails, don't block the UI, show current state or empty
       Swal.fire({
           icon: 'warning',
           title: 'โหลดข้อมูลไม่สำเร็จ',
           text: 'ไม่สามารถดึงข้อมูลจากเซิร์ฟเวอร์ได้ในขณะนี้',
           toast: true,
           position: 'top-end',
           showConfirmButton: false,
           timer: 3000
       });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const checkSessionAndFetch = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const isBypass = localStorage.getItem('admin_bypass') === 'true';
      
      if (session) {
        await fetchData(false);
      } else if (isBypass) {
        setIsOfflineMode(true);
        await fetchData(true); // Fetch mock data
      } else {
        navigate('/admin/login', { replace: true });
      }
    };

    checkSessionAndFetch();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_OUT' || !session) && localStorage.getItem('admin_bypass') !== 'true') {
        navigate('/admin/login', { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, fetchData]);

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVideoTitle || !newVideoUrl) return;
    
    if (isOfflineMode) {
        Swal.fire('Demo Mode', 'การบันทึกข้อมูลถูกปิดใช้งานในโหมด Demo/Offline', 'info');
        return;
    }

    const { data, error } = await supabase
        .from('videos')
        .insert([{ title: newVideoTitle, url: newVideoUrl }])
        .select();

    if (error) {
        Swal.fire('เกิดข้อผิดพลาด!', error.message, 'error');
    } else if (data) {
        Swal.fire('สำเร็จ!', 'เพิ่มวิดีโอเรียบร้อยแล้ว', 'success');
        setNewVideoTitle('');
        setNewVideoUrl('');
        setVideos(currentVideos => [...data, ...currentVideos]);
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (isOfflineMode) {
        Swal.fire('Demo Mode', 'การลบข้อมูลถูกปิดใช้งานในโหมด Demo/Offline', 'info');
        return;
    }

    const result = await Swal.fire({
        title: 'แน่ใจหรือไม่?',
        text: "คุณจะไม่สามารถกู้คืนวิดีโอนี้ได้!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'ใช่, ลบเลย!',
        cancelButtonText: 'ยกเลิก'
    });
    
    if (result.isConfirmed) {
        const { error } = await supabase.from('videos').delete().match({ id });
        if (error) {
            Swal.fire('เกิดข้อผิดพลาด!', error.message, 'error');
        } else {
            Swal.fire('ลบแล้ว!', 'วิดีโอถูกลบเรียบร้อย', 'success');
            setVideos(currentVideos => currentVideos.filter(video => video.id !== id));
        }
    }
  };
  
  const handleUpdateLessonVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isOfflineMode) {
        Swal.fire('Demo Mode', 'การบันทึกข้อมูลถูกปิดใช้งานในโหมด Demo/Offline', 'info');
        return;
    }
    
    const { error } = await supabase
        .from('lesson_videos')
        .upsert({ id: 1, title: lessonVideo.title, url: lessonVideo.url })
        .eq('id', 1);
    if (error) {
        Swal.fire('เกิดข้อผิดพลาด!', error.message, 'error');
    } else {
        Swal.fire('สำเร็จ!', 'อัปเดตวิดีโอประกอบบทเรียนแล้ว', 'success');
    }
  };

  const handleSignOut = async () => {
    if (isOfflineMode) {
        localStorage.removeItem('admin_bypass');
        navigate('/admin/login');
        return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      Swal.fire('Error signing out', error.message, 'error');
    }
    // The onAuthStateChange listener will handle navigation
  };


  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <header className="flex justify-between items-center border-b pb-4 mb-6">
          <div className="flex items-center">
            <UserShieldIcon className="text-3xl text-cyan-500 mr-3" />
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
                <div className="flex items-center space-x-2">
                    <p className="text-sm text-slate-500">ผู้ดูแลระบบ (Admin Mode)</p>
                    {isOfflineMode && <span className="px-2 py-0.5 rounded text-xs bg-yellow-100 text-yellow-800 font-bold border border-yellow-300">Offline / Demo</span>}
                </div>
            </div>
          </div>
          <button onClick={handleSignOut} className="px-4 py-2 bg-slate-200 text-slate-700 font-semibold rounded-md hover:bg-slate-300 flex items-center">
            <PowerIcon /> <span className="ml-2 hidden sm:inline">Sign Out</span>
          </button>
        </header>

        {loading ? (
          <p className="text-center py-4">Loading content...</p>
        ) : (
          <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Manage Videos Section */}
            <section>
              <h2 className="text-xl font-semibold mb-4 border-b pb-2">จัดการสื่อวิดิทัศน์</h2>
              <form onSubmit={handleAddVideo} className="mb-6 p-4 bg-slate-50 rounded-md">
                <h3 className="font-bold mb-2">เพิ่มวิดีโอใหม่</h3>
                <div className="space-y-3">
                  <input type="text" placeholder="ชื่อวิดีโอ" value={newVideoTitle} onChange={e => setNewVideoTitle(e.target.value)} className="w-full p-2 border rounded-md" required />
                  <input type="url" placeholder="ลิงก์ YouTube (Watch หรือ Embed ก็ได้)" value={newVideoUrl} onChange={e => setNewVideoUrl(e.target.value)} className="w-full p-2 border rounded-md" required />
                  <button type="submit" className="w-full px-4 py-2 bg-cyan-500 text-white font-semibold rounded-md hover:bg-cyan-600 disabled:opacity-50">เพิ่มวิดีโอ</button>
                </div>
              </form>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {videos.length > 0 ? (
                  videos.map(video => (
                    <div key={video.id} className="flex justify-between items-center p-2 border rounded-md">
                      <span className="truncate pr-2">{video.title}</span>
                      <button onClick={() => handleDeleteVideo(video.id)} className="px-3 py-1 bg-red-100 text-red-600 text-sm font-semibold rounded-md hover:bg-red-200">ลบ</button>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-center py-4">ยังไม่มีวิดีโอ</p>
                )}
              </div>
            </section>

            {/* Manage Lesson 3 Video Section */}
            <section>
              <h2 className="text-xl font-semibold mb-4 border-b pb-2">จัดการวิดีโอประกอบบทที่ 3</h2>
              <form onSubmit={handleUpdateLessonVideo} className="p-4 bg-slate-50 rounded-md">
                 <div className="space-y-3">
                   <label className="block text-sm font-medium">ชื่อวิดีโอ</label>
                   <input type="text" value={lessonVideo.title} onChange={e => setLessonVideo({...lessonVideo, title: e.target.value})} className="w-full p-2 border rounded-md" required />
                   <label className="block text-sm font-medium">ลิงก์ YouTube (Watch หรือ Embed ก็ได้)</label>
                   <input type="url" value={lessonVideo.url} onChange={e => setLessonVideo({...lessonVideo, url: e.target.value})} className="w-full p-2 border rounded-md" required />
                   <button type="submit" className="w-full px-4 py-2 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600 disabled:opacity-50">อัปเดตวิดีโอ</button>
                 </div>
              </form>
            </section>
          </main>
        )}
      </div>
    </div>
  );
};
