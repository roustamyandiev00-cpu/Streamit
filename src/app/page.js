'use client';

import React, { useState, useEffect } from 'react';
import {
    Home, Clock, Film, Database, Radio, BarChart2,
    Plus, Zap, Users, MoreVertical, X, PlayCircle, Share2,
    Video, Settings
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useStreamStore } from '../store/useStreamStore';
import PlatformManager from '../components/PlatformManager';

const MAX_FREE_STREAMS = 3;

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState('Home');
    const [showNewStreamModal, setShowNewStreamModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [streamFilter, setStreamFilter] = useState('all'); // 'all', 'drafts', 'scheduled';
    const router = useRouter();
    const { data: session } = useSession();
    const user = session?.user;

    // Zustand store hooks
    const { streams, addStream, setStreams, deleteStream } = useStreamStore();
    const [loading, setLoading] = useState(true);

    // Load streams on mount
    useEffect(() => {
        const loadStreams = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/streams');
                if (response.ok) {
                    const data = await response.json();
                    setStreams(data);
                }
            } catch (error) {
                if (process.env.NODE_ENV === 'development') {
                    console.error('Failed to load streams:', error);
                }
            } finally {
                setLoading(false);
            }
        };

        loadStreams();
    }, [setStreams]);

    // Filter streams based on selected filter
    const filteredStreams = streams.filter(stream => {
        if (streamFilter === 'all') return true;
        if (streamFilter === 'drafts') return stream.status === 'DRAFT';
        if (streamFilter === 'scheduled') return stream.status === 'SCHEDULED';
        return true;
    });

    const handleCreateStream = async (title, type) => {
        if (creating) return;
        setCreating(true);
        try {
            const response = await fetch('/api/streams', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title || "New Untitled Stream",
                    type: type.toUpperCase()
                })
            });

            if (response.ok) {
                const newStream = await response.json();
                addStream(newStream);
                setShowNewStreamModal(false);

                // Auto navigate if studio
                if (type === 'studio') {
                    router.push(`/studio?streamId=${newStream.id}`);
                }
            } else {
                const err = await response.json();
                throw new Error(err.error || 'Failed to create stream');
            }
        } catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.error('Failed to create stream:', error);
            }
            alert(`Error creating stream: ${error.message}`);
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <div className="brand-logo">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="url(#gradient)" />
                            <path d="M2 17L12 22L22 17" stroke="url(#gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M2 12L12 17L22 12" stroke="url(#gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <defs>
                                <linearGradient id="gradient" x1="0" y1="0" x2="24" y2="24">
                                    <stop offset="0%" stopColor="#2563eb" />
                                    <stop offset="100%" stopColor="#1d4ed8" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <span className="brand-name">Streamit</span>
                </div>

                <button
                    className="btn-primary"
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}
                    onClick={() => {
                        // TODO: Implement invite members functionality
                        alert('Invite members feature coming soon!');
                    }}
                >
                    <Users size={16} />
                    Invite members
                </button>

                <nav className="sidebar-nav">
                    {['Home', 'Analytics', 'Insights', 'Platforms', 'History', 'Clips', 'Storage', 'Settings'].map((item) => {
                        // For Analytics and Insights, navigate to separate pages
                        if (item === 'Analytics') {
                            return (
                                <Link
                                    key={item}
                                    href="/analytics"
                                    className={`nav-item ${activeTab === item ? 'active' : ''}`}
                                    style={{ textDecoration: 'none', color: 'inherit' }}
                                >
                                    <span className="nav-icon">{getIconForTab(item)}</span>
                                    {item}
                                </Link>
                            );
                        }
                        if (item === 'Insights') {
                            return (
                                <Link
                                    key={item}
                                    href="/insights"
                                    className={`nav-item ${activeTab === item ? 'active' : ''}`}
                                    style={{ textDecoration: 'none', color: 'inherit' }}
                                >
                                    <span className="nav-icon">{getIconForTab(item)}</span>
                                    {item}
                                </Link>
                            );
                        }
                        if (item === 'Settings') {
                            return (
                                <Link
                                    key={item}
                                    href="/settings"
                                    className={`nav-item ${activeTab === item ? 'active' : ''}`}
                                    style={{ textDecoration: 'none', color: 'inherit' }}
                                >
                                    <span className="nav-icon">{getIconForTab(item)}</span>
                                    {item}
                                </Link>
                            );
                        }
                        if (item === 'Clips') {
                            return (
                                <Link
                                    key={item}
                                    href="/clips"
                                    className={`nav-item ${activeTab === item ? 'active' : ''}`}
                                    style={{ textDecoration: 'none', color: 'inherit' }}
                                >
                                    <span className="nav-icon">{getIconForTab(item)}</span>
                                    {item}
                                </Link>
                            );
                        }
                        // For other items, use tab switching
                        return (
                            <NavItem
                                key={item}
                                icon={getIconForTab(item)}
                                label={item}
                                active={activeTab === item}
                                onClick={() => setActiveTab(item)}
                            />
                        );
                    })}
                </nav>

                <div className="sidebar-footer">
                    <div className="user-profile">
                        <div className="user-avatar">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="user-info">
                            <span className="user-name">{user?.name || 'User'}</span>
                            <span className="user-email">{user?.email || 'user@example.com'}</span>
                        </div>
                    </div>
                    <button
                        className="sign-out-btn"
                        onClick={() => {
                            if (session) {
                                signOut();
                            } else {
                                router.push('/auth/signin');
                            }
                        }}
                    >
                        {session ? 'Sign Out' : 'Sign In'}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <header className="top-bar">
                    <div className="section-tabs" style={{ marginBottom: 0, borderBottom: 'none' }}>
                        <button
                            className={`tab ${streamFilter === 'all' ? 'active' : ''}`}
                            onClick={() => setStreamFilter('all')}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.5rem 1rem', color: streamFilter === 'all' ? '#5c4dff' : '#a1a1aa' }}
                        >
                            All
                        </button>
                        <button
                            className={`tab ${streamFilter === 'drafts' ? 'active' : ''}`}
                            onClick={() => setStreamFilter('drafts')}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.5rem 1rem', color: streamFilter === 'drafts' ? '#5c4dff' : '#a1a1aa' }}
                        >
                            Drafts
                        </button>
                        <button
                            className={`tab ${streamFilter === 'scheduled' ? 'active' : ''}`}
                            onClick={() => setStreamFilter('scheduled')}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.5rem 1rem', color: streamFilter === 'scheduled' ? '#5c4dff' : '#a1a1aa' }}
                        >
                            Scheduled
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <Link href="/pricing" style={{ textDecoration: 'none' }}>
                            <button
                                className="upgrade-btn"
                                style={{ cursor: 'pointer' }}
                            >
                                <Zap size={16} fill="white" />
                                Get more power! Upgrade
                            </button>
                        </Link>
                        {user && !user.isPro && (
                            <div className="usage-meter" style={{ marginRight: '1rem', display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '140px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#a1a1aa' }}>
                                    <span>Free Streams</span>
                                    <span>{filteredStreams.length} / {MAX_FREE_STREAMS}</span>
                                </div>
                                <div style={{ width: '100%', height: '6px', background: '#27272a', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div style={{
                                        width: `${Math.min((filteredStreams.length / MAX_FREE_STREAMS) * 100, 100)}%`,
                                        height: '100%',
                                        background: filteredStreams.length >= MAX_FREE_STREAMS ? '#ef4444' : '#5c4dff',
                                        transition: 'width 0.5s ease'
                                    }} />
                                </div>
                            </div>
                        )}
                        <button
                            className="btn-primary"
                            style={{ background: '#3f414d' }}
                            onClick={() => {
                                if (user && !user.isPro && filteredStreams.length >= MAX_FREE_STREAMS) {
                                    alert('You have reached your weekly stream limit. Please upgrade to Pro for unlimited streams.');
                                    return;
                                }
                                setShowNewStreamModal(true);
                            }}
                        >
                            <Plus size={16} style={{ marginRight: '0.5rem' }} />
                            New Stream
                        </button>
                    </div>
                </header>

                <div className="content-area">
                    {activeTab === 'Home' && (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: '#6b6d7c', fontSize: '0.8rem', fontWeight: 600, paddingLeft: '1rem', paddingRight: '1rem' }}>
                                <span style={{ width: '40%' }}>Stream title</span>
                                <span>Status</span>
                                <span>Channels</span>
                                <span>Last edited</span>
                            </div>

                            {loading ? (
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: '#666' }}>
                                    Loading streams...
                                </div>
                            ) : filteredStreams.length > 0 ? (
                                filteredStreams.map(stream => (
                                    <StreamCard key={stream.id} data={stream} onDelete={deleteStream} />
                                ))
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#666' }}>
                                    <PlayCircle size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                    <h3>No streams yet</h3>
                                    <p>Create your first stream to get started!</p>
                                </div>
                            )}
                        </>
                    )}


                    {activeTab === 'Platforms' && (
                        <div className="platforms-section">
                            <div className="section-header">
                                <h2>Platform Connections</h2>
                                <p>Manage your streaming platform integrations</p>
                            </div>
                            <PlatformManager />
                        </div>
                    )}

                    {activeTab === 'History' && (
                        <div className="feature-placeholder">
                            <Clock size={64} style={{ marginBottom: '1rem', opacity: 0.7, color: '#5c4dff' }} />
                            <h2>Stream History</h2>
                            <p>View all your past streams and their performance</p>
                            <div style={{ marginTop: '2rem', padding: '1rem', background: '#1f2026', borderRadius: '8px', border: '1px solid #2d2e36' }}>
                                <p style={{ color: '#999', fontSize: '0.9rem' }}>This feature will show:</p>
                                <ul style={{ color: '#999', fontSize: '0.9rem', marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                                    <li>Complete stream archive</li>
                                    <li>Stream recordings</li>
                                    <li>Performance metrics</li>
                                    <li>Viewer statistics</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Clips' && (
                        <div className="feature-placeholder">
                            <Film size={64} style={{ marginBottom: '1rem', opacity: 0.7, color: '#5c4dff' }} />
                            <h2>Clips & Highlights</h2>
                            <p>Create and manage video clips from your streams</p>
                            <div style={{ marginTop: '2rem', padding: '1rem', background: '#1f2026', borderRadius: '8px', border: '1px solid #2d2e36' }}>
                                <p style={{ color: '#999', fontSize: '0.9rem' }}>This feature will include:</p>
                                <ul style={{ color: '#999', fontSize: '0.9rem', marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                                    <li>Automatic highlight detection</li>
                                    <li>Manual clip creation</li>
                                    <li>Clip editing tools</li>
                                    <li>Social media sharing</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Storage' && (
                        <div className="feature-placeholder">
                            <Database size={64} style={{ marginBottom: '1rem', opacity: 0.7, color: '#5c4dff' }} />
                            <h2>Storage Management</h2>
                            <p>Manage your uploaded files and media assets</p>
                            <div style={{ marginTop: '2rem', padding: '1rem', background: '#1f2026', borderRadius: '8px', border: '1px solid #2d2e36' }}>
                                <p style={{ color: '#999', fontSize: '0.9rem' }}>Storage features:</p>
                                <ul style={{ color: '#999', fontSize: '0.9rem', marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                                    <li>File uploads and management</li>
                                    <li>Thumbnail library</li>
                                    <li>Storage quota tracking</li>
                                    <li>Asset organization</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>

                {/* New Stream Modal */}
                {showNewStreamModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h2>Create a new stream</h2>
                                <button className="close-btn" onClick={() => setShowNewStreamModal(false)}><X size={20} /></button>
                            </div>

                            <div className="modal-options">
                                <div className="option-card" onClick={() => handleCreateStream('My Studio Stream', 'studio')}>
                                    <div className="option-icon">
                                        <div className="icon-circle studio-icon">
                                            <Plus size={20} />
                                        </div>
                                    </div>
                                    <div className="option-content">
                                        <h3>Restream Studio</h3>
                                        <p>Go live or record — from your browser.</p>
                                    </div>
                                    <div className="option-arrow">›</div>
                                </div>

                                <div className="option-card" onClick={() => handleCreateStream('My RTMP Stream', 'rtmp')}>
                                    <div className="option-icon">
                                        <div className="icon-circle rtmp-icon">
                                            <Radio size={20} />
                                        </div>
                                    </div>
                                    <div className="option-content">
                                        <h3>Encoder | RTMP</h3>
                                        <p>Stream from OBS, Zoom, vMix, etc.</p>
                                    </div>
                                    <div className="option-arrow">›</div>
                                </div>

                                <div className="option-card highlighted" onClick={() => {
                                    setShowNewStreamModal(false);
                                    alert('Video or Playlist feature coming soon! This will allow you to schedule videos or stream recordings.');
                                }}>
                                    <div className="option-icon">
                                        <div className="icon-circle video-icon">
                                            <Video size={20} />
                                        </div>
                                    </div>
                                    <div className="option-content">
                                        <h3>Video or Playlist</h3>
                                        <p>Schedule videos or stream recordings</p>
                                    </div>
                                    <div className="option-arrow">›</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <style jsx>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          backdrop-filter: blur(8px);
          animation: fadeIn 0.2s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .modal-content {
          background: var(--bg-card);
          border: 1px solid var(--border-custom);
          padding: 2.5rem;
          border-radius: var(--radius-lg);
          width: 640px;
          max-width: 90vw;
          box-shadow: var(--shadow-xl);
          animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        .modal-content::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--primary-gradient);
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        .modal-header h2 {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--text-main);
          margin: 0;
          background: var(--primary-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .modal-options {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .option-card {
          background: var(--bg-card);
          border: 1px solid var(--border-custom);
          padding: 1.5rem;
          border-radius: var(--radius);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          gap: 1.25rem;
          position: relative;
          overflow: hidden;
        }
        .option-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
          background: var(--primary-gradient);
          transform: scaleY(0);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .option-card:hover {
          border-color: var(--primary);
          background: var(--bg-card-hover);
          transform: translateX(4px);
          box-shadow: var(--shadow-lg);
        }
        .option-card:hover::before {
          transform: scaleY(1);
        }
        .option-card.highlighted {
          border-color: var(--primary);
          border-width: 2px;
          background: var(--primary-gradient-subtle);
        }
        .option-icon {
          flex-shrink: 0;
        }
        .icon-circle {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }
        .option-card:hover .icon-circle {
          transform: scale(1.1) rotate(5deg);
        }
        .studio-icon { 
          background: var(--primary-gradient-subtle);
          color: var(--primary);
          box-shadow: 0 4px 12px rgba(92, 77, 255, 0.2);
        }
        .rtmp-icon { 
          background: rgba(156, 163, 175, 0.1);
          color: var(--text-muted);
        }
        .video-icon {
          background: var(--primary-gradient-subtle);
          color: var(--primary);
          box-shadow: 0 4px 12px rgba(92, 77, 255, 0.2);
        }
        .option-content {
          flex: 1;
        }
        .option-content h3 {
          font-size: 1.125rem;
          font-weight: 600;
          margin: 0 0 0.375rem 0;
          color: var(--text-main);
          transition: color 0.2s;
        }
        .option-content p {
          font-size: 0.875rem;
          color: var(--text-muted);
          margin: 0;
          line-height: 1.5;
        }
        .option-arrow {
          color: var(--text-muted);
          font-size: 1.5rem;
          font-weight: 300;
          flex-shrink: 0;
          transition: all 0.3s;
        }
        .option-card:hover .option-arrow {
          color: var(--primary);
          transform: translateX(4px);
        }
        .close-btn {
          background: transparent;
          border: 1px solid var(--border-custom);
          color: var(--text-muted);
          cursor: pointer;
          padding: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-sm);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          width: 36px;
          height: 36px;
        }
        .close-btn:hover {
          background: var(--bg-card-hover);
          border-color: var(--border-hover);
          color: var(--text-main);
          transform: rotate(90deg);
        }
      `}</style>
            <style jsx>{`
                .feature-placeholder {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    min-height: 400px;
                    color: #fff;
                    padding: 2rem;
                    text-align: center;
                }
                .feature-placeholder h2 {
                    margin: 0 0 0.5rem 0;
                    font-size: 1.5rem;
                    font-weight: 700;
                }
                .feature-placeholder > p {
                    color: #999;
                    margin: 0 0 2rem 0;
                    font-size: 1rem;
                }
            `}</style>
        </div>
    );
}

function getIconForTab(tab) {
    switch (tab) {
        case 'Home': return <Home size={20} />;
        case 'Analytics': return <BarChart2 size={20} />;
        case 'Insights': return <Zap size={20} />;
        case 'Platforms': return <Share2 size={20} />;
        case 'History': return <Clock size={20} />;
        case 'Clips': return <Film size={20} />;
        case 'Storage': return <Database size={20} />;
        case 'Settings': return <Settings size={20} />;
        default: return <Home size={20} />;
    }
}

function NavItem({ icon, label, active, onClick }) {
    return (
        <a href="#" className={`nav-item ${active ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); onClick(); }}>
            <span className="nav-icon">{icon}</span>
            {label}
        </a>
    );
}

function StreamCard({ data, onDelete }) {
    const [showMenu, setShowMenu] = useState(false);
    const router = useRouter();

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    };

    const getSubtitle = (type) => {
        switch (type) {
            case 'RTMP': return 'RTMP (Default)';
            case 'STUDIO': return 'STUDIO';
            case 'WEBRTC': return 'WebRTC';
            default: return type;
        }
    };

    const handleDelete = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (confirm(`Are you sure you want to delete "${data.title}"?`)) {
            try {
                const response = await fetch(`/api/streams/${data.id}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    onDelete(data.id);
                } else {
                    alert('Failed to delete stream');
                }
            } catch (error) {
                if (process.env.NODE_ENV === 'development') {
                    console.error('Failed to delete stream:', error);
                }
                alert('Error deleting stream');
            }
        }
        setShowMenu(false);
    };

    const handleDuplicate = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            const response = await fetch('/api/streams', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: `${data.title} (Copy)`,
                    type: data.type
                })
            });
            if (response.ok) {
                router.push('/');
            }
        } catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.error('Failed to duplicate stream:', error);
            }
            alert('Error duplicating stream');
        }
        setShowMenu(false);
    };

    return (
        <Link
            href={data.type === 'STUDIO' ? `/studio?streamId=${data.id}` : '#'}
            style={{ textDecoration: 'none', color: 'inherit' }}
            onClick={(e) => {
                if (e.target.closest('.stream-menu')) {
                    e.preventDefault();
                }
            }}
        >
            <div className="stream-card">
                <div className="card-left">
                    <div className="card-thumbnail">
                        {data.type === 'RTMP' ? (
                            <div style={{ display: 'flex', gap: 4 }}>
                                <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid white', opacity: 0.8 }} />
                                <div style={{ width: 14, height: 14, border: '2px solid white', opacity: 0.8 }} />
                            </div>
                        ) : (
                            <div style={{ display: 'flex', gap: 8 }}>
                                <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'white' }} />
                                <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'white', opacity: 0.5 }} />
                            </div>
                        )}
                    </div>
                    <div className="card-info">
                        <h3 style={{ color: '#5c4dff', textDecoration: 'underline', cursor: 'pointer' }}>{data.title}</h3>
                        <p style={{ color: '#a1a1aa', fontSize: '0.85rem' }}>{getSubtitle(data.type)}</p>
                        <p style={{ color: '#a1a1aa', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                            {data.status} • {formatDate(data.createdAt)} • 1
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '3rem', fontSize: '0.9rem', color: '#a1a1aa', position: 'relative' }}>
                    <span className="status-badge">{data.status}</span>
                    <span>--</span>
                    <span>{formatDate(data.createdAt)}</span>
                    <div className="stream-menu" style={{ position: 'relative' }}>
                        <button
                            style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer', padding: '0.25rem' }}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowMenu(!showMenu);
                            }}
                        >
                            <MoreVertical size={18} />
                        </button>
                        {showMenu && (
                            <div
                                style={{
                                    position: 'absolute',
                                    right: 0,
                                    top: '100%',
                                    marginTop: '0.5rem',
                                    background: '#1f2026',
                                    border: '1px solid #2d2e36',
                                    borderRadius: '8px',
                                    padding: '0.5rem',
                                    minWidth: '150px',
                                    zIndex: 1000,
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                                }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    style={{
                                        width: '100%',
                                        textAlign: 'left',
                                        padding: '0.5rem',
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#fff',
                                        cursor: 'pointer',
                                        borderRadius: '4px'
                                    }}
                                    onMouseEnter={(e) => e.target.style.background = '#2a2b33'}
                                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                    onClick={handleDuplicate}
                                >
                                    Duplicate
                                </button>
                                <button
                                    style={{
                                        width: '100%',
                                        textAlign: 'left',
                                        padding: '0.5rem',
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#ff4444',
                                        cursor: 'pointer',
                                        borderRadius: '4px',
                                        marginTop: '0.25rem'
                                    }}
                                    onMouseEnter={(e) => e.target.style.background = '#2a2b33'}
                                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                    onClick={handleDelete}
                                >
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {showMenu && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 999
                    }}
                    onClick={() => setShowMenu(false)}
                />
            )}
        </Link>
    );
}
