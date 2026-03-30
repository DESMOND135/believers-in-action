import React, { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://believers-in-action-api.onrender.com';

const Admin = ({ onSermonAdded }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [sermons, setSermons] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [editId, setEditId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = React.useRef(null);

  const [backendStatus, setBackendStatus] = useState('checking'); // 'checking', 'online', 'offline'

  // Fetch sermons for the admin list
  const fetchSermons = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sermons`);
      if (response.ok) {
        const data = await response.json();
        setSermons(data);
        setBackendStatus('online');
      } else {
        setBackendStatus('offline');
      }
    } catch (err) {
      console.error("Error fetching sermons", err);
      setBackendStatus('offline');
    }
  };

  useEffect(() => {
    if (isLoggedIn) fetchSermons();
    else {
      // Check status even if not logged in to show warning early
      const checkStatus = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/`);
          setBackendStatus(res.ok ? 'online' : 'offline');
        } catch {
          setBackendStatus('offline');
        }
      };
      checkStatus();
    }
  }, [isLoggedIn]);

  const handleLogin = (e) => {
    e.preventDefault();
    const adminToken = import.meta.env.VITE_ADMIN_TOKEN || 'udrick2026';
    if (password === adminToken) {
      setIsLoggedIn(true);
    } else {
      alert('Unauthorized access. Only UDRICK NIH can login.');
    }
  };

  const handleEdit = (sermon) => {
    setEditId(sermon.id);
    setTitle(sermon.title);
    setDescription(sermon.description);
    // Format date string for input
    const d = new Date(sermon.preach_date);
    const dateStr = !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : '';
    setDate(dateStr);
  };

  const cancelEdit = () => {
    setEditId(null);
    setTitle('');
    setDescription('');
    setDate('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('preach_date', date);
      
      if (!editId && fileInputRef.current?.files[0]) {
        formData.append('file', fileInputRef.current.files[0]);
      }

      const endpoint = editId ? `/api/sermons/${editId}` : '/api/upload';
      const method = editId ? 'PUT' : 'POST';
      
      // For PUT, we'll still use query params as the backend expects them for metadata update
      // For POST, we use the multipart form data
      let url = `${API_BASE_URL}${endpoint}`;
      if (editId) {
        url += `?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}&preach_date=${encodeURIComponent(date)}`;
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          'X-Admin-Token': password
        },
        body: editId ? null : formData
      });

      if (response.ok) {
        setMessage(editId ? 'Sermon updated successfully!' : 'Sermon published successfully!');
        if (!editId) {
          setTitle('');
          setDescription('');
          setDate('');
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
        fetchSermons();
      } else {
        let errorMsg = 'Check credentials.';
        try {
          const errorData = await response.json();
          errorMsg = errorData.detail || errorMsg;
        } catch (e) {
          errorMsg = `Server Error (${response.status})`;
        }
        setMessage(`Action failed: ${errorMsg}`);
      }
    } catch (err) {
      setMessage(`Error: ${err.message || 'Connection failed. Check if backend is awake.'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this sermon? This action cannot be undone.")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/sermons/${id}`, {
        method: 'DELETE',
        headers: {
          'X-Admin-Token': password
        }
      });

      if (response.ok) {
        alert("Sermon removed successfully.");
        fetchSermons();
      } else {
        alert("Failed to delete sermon.");
      }
    } catch (err) {
      alert("Error connecting to backend.");
    }
  };

  if (!isLoggedIn) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
        <div className="glass" style={{ padding: '3rem', width: '400px', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '2rem' }}>UDRICK NIH Admin Access</h2>
          <form onSubmit={handleLogin}>
            {backendStatus === 'offline' && (
              <div style={{ background: 'rgba(255,0,0,0.1)', color: '#ff4d4d', padding: '0.8rem', borderRadius: '4px', marginBottom: '1.5rem', fontSize: '0.85rem', border: '1px solid rgba(255,0,0,0.2)' }}>
                ⚠️ Backend currently unreachable. It might be sleeping or down.
              </div>
            )}
            <input 
              type="password" 
              placeholder="Enter Private Key" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '1rem', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--primary-gold)', color: 'white', marginBottom: '1.5rem', borderRadius: '4px' }}
            />
            <button className="btn-primary" style={{ width: '100%' }}>Secure Login</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '60px 0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '3rem' }}>
        {/* Form Form */}
        <div className="glass" style={{ padding: '2.5rem' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{editId ? 'Edit Sermon Information' : 'Publish New Sermon'}</h2>
          {editId && <p style={{ fontSize: '0.8rem', color: 'var(--primary-gold)', marginBottom: '1.5rem', cursor: 'pointer' }} onClick={cancelEdit}>&times; Cancel Edit Mode</p>}
          
          {message && <div style={{ background: 'rgba(0,255,0,0.1)', border: '1px solid green', padding: '1rem', marginBottom: '2rem', color: '#4ade80' }}>{message}</div>}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', opacity: '0.7' }}>Title</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '4px' }}
              />
            </div>

            <div style={{ marginBottom: '1.2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', opacity: '0.7' }}>Description</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows="3"
                style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '4px' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', opacity: '0.7' }}>Date</label>
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '4px' }}
                />
              </div>
              {!editId && (
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', opacity: '0.7' }}>Video</label>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    required={!editId} 
                    style={{ width: '100%', color: 'white', fontSize: '0.8rem' }} 
                  />
                </div>
              )}
            </div>

            <button 
               className="btn-primary" 
               style={{ width: '100%', background: uploading ? '#444' : 'var(--primary-gold)' }}
               disabled={uploading}
            >
              {uploading ? 'Processing...' : (editId ? 'Update Sermon' : 'Publish Sermon')}
            </button>
          </form>
        </div>

        {/* Management List */}
        <div className="glass" style={{ padding: '2.5rem' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '2rem' }}>Manage Content</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {sermons.map(sermon => (
              <div key={sermon.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid var(--glass-border)' }}>
                <div style={{ maxWidth: '60%' }}>
                  <div style={{ fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sermon.title}</div>
                  <div style={{ fontSize: '0.8rem', opacity: '0.6' }}>{sermon.preach_date}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    onClick={() => handleEdit(sermon)}
                    style={{ background: 'rgba(212, 175, 55, 0.1)', color: 'var(--primary-gold)', padding: '0.4rem 0.8rem', borderRadius: '4px', border: '1px solid rgba(212, 175, 55, 0.2)', fontSize: '0.8rem' }}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(sermon.id)}
                    style={{ background: 'rgba(255,0,0,0.1)', color: '#ff4d4d', padding: '0.4rem 0.8rem', borderRadius: '4px', border: '1px solid rgba(255,0,0,0.2)', fontSize: '0.8rem' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};


export default Admin;
