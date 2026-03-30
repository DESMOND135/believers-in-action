import React, { useState, useEffect } from 'react';
import './index.css';
import Admin from './Admin';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://believers-in-action-api.onrender.com';

const App = () => {
  const [view, setView] = useState('home'); // 'home' or 'admin' 
  const [sermons, setSermons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Handle native back button navigation
  useEffect(() => {
    const handlePopState = (e) => {
      if (selectedVideo) {
        setSelectedVideo(null);
      } else if (e.state && e.state.view) {
        setView(e.state.view);
      } else {
        setView('home');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [selectedVideo]);

  const navigateTo = (newView) => {
    if (newView !== view) {
      window.history.pushState({ view: newView }, '', window.location.pathname);
      setView(newView);
    }
  };

  const handleOpenVideo = (videoUrl) => {
    window.history.pushState({ videoOpen: true }, '', window.location.pathname);
    setSelectedVideo(videoUrl);
  };

  const handleCloseVideo = () => {
    window.history.back(); // Pops the state, triggering handlePopState to close the video
  };

  // Fetch Sermons from Backend
  useEffect(() => {
    const fetchSermons = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/sermons`);
        if (response.ok) {
          const data = await response.json();
          setSermons(data);
          setIsOffline(false);
        } else {
          setIsOffline(true);
          // Fallback to mock if backend is not running
          setSermons([
            {
              id: "1",
              title: "The Power of Faith",
              description: "A powerful sermon exploring how faith can move mountains and transform lives.",
              video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
              thumbnail_url: "https://images.unsplash.com/photo-1544427928-c49cd03d3600?auto=format&fit=crop&q=80&w=640",
              preach_date: "March 22, 2026",
            },
            {
              id: "2",
              title: "Showers of Blessing",
              description: "Dive deep into our 2026 motto and discover the promise of divine abundance.",
              video_url: "https://www.w3schools.com/html/movie.mp4",
              thumbnail_url: "https://images.unsplash.com/photo-1493612276216-ee3925520721?auto=format&fit=crop&q=80&w=640",
              preach_date: "March 29, 2026",
            }
          ]);
        }
      } catch (error) {
        console.error("Fetch error, using mock data", error);
        setIsOffline(true);
        setSermons([
          {
            id: "1",
            title: "The Power of Faith",
            description: "A powerful sermon exploring how faith can move mountains and transform lives.",
            video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
            thumbnail_url: "https://images.unsplash.com/photo-1544427928-c49cd03d3600?auto=format&fit=crop&q=80&w=640",
            preach_date: "March 22, 2026",
          },
          {
            id: "2",
            title: "Showers of Blessing",
            description: "Dive deep into our 2026 motto and discover the promise of divine abundance.",
            video_url: "https://www.w3schools.com/html/movie.mp4",
            thumbnail_url: "https://images.unsplash.com/photo-1493612276216-ee3925520721?auto=format&fit=crop&q=80&w=640",
            preach_date: "March 29, 2026",
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchSermons();
  }, [view]);

  return (
    <div className="app">
      {/* Navigation */}
      <header className="glass" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
        <nav className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '80px' }}>
          <div 
            onClick={() => navigateTo('home')}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem' }}
          >
            <img src="/logo.png" alt="Believers in Action Logo" style={{ height: '60px', width: '60px', objectFit: 'contain' }} />
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: '800', letterSpacing: '2px', color: 'var(--primary-gold)', lineHeight: '1.1' }}>BELIEVERS IN ACTION</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--soft-cream)', opacity: '0.6', letterSpacing: '1px' }}>Mark 16:15 · Matt 28:19</div>
            </div>
          </div>
          <div className="nav-links" style={{ display: 'flex', gap: '2rem', fontSize: '0.85rem', fontWeight: '500', textTransform: 'uppercase', alignItems: 'center' }}>
            {isOffline && (
              <span style={{ fontSize: '0.65rem', color: '#ff4d4d', background: 'rgba(255, 77, 77, 0.1)', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(255, 77, 77, 0.2)', textTransform: 'none' }}>
                ⚠️ Offline Mode
              </span>
            )}
            <button onClick={() => navigateTo('home')} style={{ color: 'var(--soft-cream)', background: 'none', textDecoration: view === 'home' ? 'underline' : 'none', fontWeight: view === 'home' ? '700' : '400' }}>Home</button>
            <button onClick={() => navigateTo('admin')} style={{ color: 'var(--soft-cream)', background: 'none', textDecoration: view === 'admin' ? 'underline' : 'none', fontWeight: view === 'admin' ? '700' : '400' }}>Pastor's Admin</button>
            <span style={{ color: 'var(--primary-gold)', borderLeft: '1px solid var(--glass-border)', paddingLeft: '1.5rem' }}>📞 678051791</span>
          </div>
        </nav>
      </header>

      {view === 'home' ? (
        <>
          {/* Hero Section */}
          <section className="hero">
            <div className="container animate-up" style={{ textAlign: 'center', padding: '80px 0 80px' }}>
              <img src="/logo.png" alt="BIA Logo" style={{ height: '160px', width: '160px', objectFit: 'contain', marginBottom: '2rem', animation: 'fadeInScale 1s ease-out' }} />
              <h4 style={{ color: 'var(--primary-gold)', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '1rem', fontSize: '0.9rem' }}>
                UDRICK NIH Presents
              </h4>
              <h1 style={{ fontSize: '4.5rem', marginBottom: '1.5rem', lineHeight: '1.1' }}>
                2026: Our Year of <br />
                <span style={{ color: 'var(--primary-gold)' }}>Showers of Blessing</span>
              </h1>
              {new Date().getDay() === 0 && (
                <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '10px', height: '10px', background: '#ff4d4d', borderRadius: '50%', boxShadow: '0 0 10px #ff4d4d', animation: 'pulse 1.5s infinite' }}></span>
                  <span style={{ fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', color: '#ff4d4d' }}>Live Service in Progress</span>
                </div>
              )}
              <div style={{ fontStyle: 'italic', marginBottom: '2.5rem', fontSize: '1.2rem', color: 'var(--soft-cream)', opacity: '0.9' }}>
                "Ezekiel 24:24-30"
              </div>
              <p style={{ maxWidth: '600px', margin: '0 auto 2.5rem', fontSize: '1.1rem', opacity: '0.8' }}>
                Welcome to the digital sanctuary of Believers in Action. Experience the word, find your purpose, and walk in divine abundance.
              </p>
              <button className="btn-primary" onClick={() => document.getElementById('sermons').scrollIntoView({ behavior: 'smooth' })}>Watch Latest Sermon</button>
            </div>
          </section>

          {/* Sermon Gallery */}
          <section id="sermons" className="sermon-gallery container" style={{ padding: '80px 0' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '3rem', textAlign: 'center' }}>Recent Sermons</h2>
            
            <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2.5rem' }}>
              {loading ? (
                <p>Gathering the blessings...</p>
              ) : (
                sermons.map(sermon => (
                  <div key={sermon.id} className="glass card animate-scale" style={{ overflow: 'hidden', cursor: 'pointer' }} onClick={() => handleOpenVideo(sermon.video_url)}>
                    <div style={{ position: 'relative', height: '220px' }}>
                      <img src={sermon.thumbnail_url} alt={sermon.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div className="play-overlay" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.3s' }}>
                        <div style={{ width: '60px', height: '60px', background: 'var(--primary-gold)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ width: 0, height: 0, borderTop: '10px solid transparent', borderBottom: '10px solid transparent', borderLeft: '15px solid var(--charcoal-black)', marginLeft: '5px' }}></div>
                        </div>
                      </div>
                    </div>
                    <div style={{ padding: '2rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--primary-gold)', fontWeight: '600' }}>{sermon.preach_date}</span>
                      <h3 style={{ fontSize: '1.6rem', margin: '0.5rem 0' }}>{sermon.title}</h3>
                      <p style={{ fontSize: '0.95rem', opacity: '0.7', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '1.5rem' }}>{sermon.description}</p>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }} onClick={(e) => { e.stopPropagation(); handleOpenVideo(sermon.video_url); }}>Watch Now</button>
                        <a 
                          href={sermon.download_url} 
                          download 
                          onClick={(e) => e.stopPropagation()}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--soft-cream)', opacity: '0.6', textDecoration: 'none', fontSize: '0.8rem', fontWeight: '600' }}
                        >
                          <span>⬇️ Download</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </>
      ) : (
        <Admin onSermonAdded={() => navigateTo('home')} />
      )}

      {/* Video Modal Player */}
      {selectedVideo && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0, 0, 0, 0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
          <div style={{ position: 'relative', width: '90%', maxWidth: '1000px', background: '#111', borderRadius: '12px', border: '1px solid var(--primary-gold)', boxShadow: '0 20px 50px rgba(0,0,0,0.8)', display: 'flex', flexDirection: 'column' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid rgba(212, 175, 55, 0.2)' }}>
              <span style={{ color: 'var(--primary-gold)', fontSize: '1rem', fontWeight: 'bold', letterSpacing: '2px' }}>NOW PLAYING</span>
              <button onClick={handleCloseVideo} style={{ border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: '50%', width: '36px', height: '36px', fontSize: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.3s' }}>&times;</button>
            </div>
            
            <div style={{ padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <video src={selectedVideo} controls autoPlay playsInline style={{ width: '100%', maxHeight: '60vh', borderRadius: '8px', backgroundColor: 'black', objectFit: 'contain' }} />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 20px', borderTop: '1px solid rgba(212, 175, 55, 0.2)', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '0 0 12px 12px' }}>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    const currentIndex = sermons.findIndex(s => s.video_url === selectedVideo);
                    if (currentIndex > 0) setSelectedVideo(sermons[currentIndex - 1].video_url);
                  }} 
                  style={{ padding: '0.6rem 1.2rem', background: 'rgba(212, 175, 55, 0.15)', color: 'var(--primary-gold)', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: '6px', cursor: 'pointer', opacity: sermons.findIndex(s => s.video_url === selectedVideo) > 0 ? 1 : 0.3, pointerEvents: sermons.findIndex(s => s.video_url === selectedVideo) > 0 ? 'auto' : 'none', fontWeight: 'bold', fontSize: '0.9rem', transition: '0.3s' }}
                >
                  &#8592; Previous Video
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    const currentIndex = sermons.findIndex(s => s.video_url === selectedVideo);
                    if (currentIndex < sermons.length - 1) setSelectedVideo(sermons[currentIndex + 1].video_url);
                  }} 
                  style={{ padding: '0.6rem 1.2rem', background: 'rgba(212, 175, 55, 0.15)', color: 'var(--primary-gold)', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: '6px', cursor: 'pointer', opacity: sermons.findIndex(s => s.video_url === selectedVideo) < sermons.length - 1 ? 1 : 0.3, pointerEvents: sermons.findIndex(s => s.video_url === selectedVideo) < sermons.length - 1 ? 'auto' : 'none', fontWeight: 'bold', fontSize: '0.9rem', transition: '0.3s' }}
                >
                  Next Video &#8594;
                </button>
            </div>

          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--glass-border)', padding: '60px 0', textAlign: 'center' }}>
        <img src="/logo.png" alt="BIA Logo" style={{ height: '80px', width: '80px', objectFit: 'contain', marginBottom: '1.5rem', opacity: '0.8' }} />
        <p style={{ marginBottom: '0.5rem', color: 'var(--primary-gold)', fontSize: '0.85rem', letterSpacing: '2px' }}>BELIEVERS IN ACTION</p>
        <p style={{ marginBottom: '0.5rem', fontSize: '0.8rem', opacity: '0.5', fontStyle: 'italic' }}>Mark 16:15 · Matt 28:19</p>
        <p style={{ marginBottom: '1rem' }}>📞 Contact Pastor: 678051791</p>
        <p style={{ fontSize: '0.9rem', opacity: '0.5' }}>&copy; 2026 Believers in Action. UDRICK NIH. All Rights Reserved.</p>
      </footer>
    </div>
  );
};


export default App;

