import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [slots, setSlots] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [newSlot, setNewSlot] = useState({ date: '', start_time: '', end_time: '', room: '', supervisor_id: '' });
  const [supervisors, setSupervisors] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  const api = axios.create({
    baseURL: 'https://bracu-thesis-booking.onrender.com/api',
    headers: { Authorization: `Bearer ${token}` }
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchStats(); fetchSlots(); fetchSupervisors(); }, []);

  const fetchStats = async () => {
    try { const res = await api.get('/auth/stats'); setStats(res.data); } catch {}
  };

  const fetchSlots = async () => {
    try { const res = await api.get('/slots'); setSlots(res.data); } catch {}
  };

  const fetchSupervisors = async () => {
    try { const res = await api.get('/supervisors'); setSupervisors(res.data); } catch {}
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/slots', newSlot);
      setMessage('Slot added successfully!');
      setNewSlot({ date: '', start_time: '', end_time: '', room: '', supervisor_id: '' });
      fetchSlots();
      fetchStats();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add slot.');
    }
  };

  const handleDeleteSlot = async (id) => {
    if (!window.confirm('Delete this slot?')) return;
    try {
      await api.delete(`/slots/${id}`);
      setMessage('Slot deleted.');
      fetchSlots();
      fetchStats();
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setError('Could not delete slot.');
    }
  };

  const formatTime = (t) => {
    if (!t) return '';
    const [h, m] = t.split(':');
    const hour = parseInt(h);
    return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const logout = () => { localStorage.clear(); navigate('/login'); };

  const maxSupervisorBookings = stats?.supervisor_stats?.length > 0
    ? Math.max(...stats.supervisor_stats.map(s => s.total_bookings)) || 1
    : 1;

  const maxDeptTotal = stats?.department_stats?.length > 0
    ? Math.max(...stats.department_stats.map(d => d.total)) || 1
    : 1;

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: '#0a0a0b', overflow: 'hidden' }}>
      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0,0) scale(1); }
          33% { transform: translate(30px,-30px) scale(1.05); }
          66% { transform: translate(-20px,20px) scale(0.95); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0,0) scale(1); }
          33% { transform: translate(-40px,20px) scale(1.08); }
          66% { transform: translate(20px,-30px) scale(0.97); }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(16px); }
          to { opacity:1; transform:translateY(0); }
        }
        .admin-input {
          width:100%; padding:10px 14px;
          background:rgba(255,255,255,0.04);
          border:1px solid rgba(255,255,255,0.08);
          border-radius:8px; font-size:13px;
          color:#f0f0ee; font-family:inherit; outline:none;
          transition:border-color 0.2s;
        }
        .admin-input:focus { border-color:#1D9E75; }
        .admin-input option { background:#111; }
        .bar-fill {
          height:100%; border-radius:4px;
          background:linear-gradient(90deg,#1D9E75,#157557);
          transition:width 1s ease;
        }
      `}</style>

      {/* Background */}
      <div style={{position:'fixed',top:'-20%',left:'-10%',width:600,height:600,background:'radial-gradient(circle,rgba(29,158,117,0.07) 0%,transparent 70%)',borderRadius:'50%',pointerEvents:'none',zIndex:0,animation:'float1 8s ease-in-out infinite'}}/>
      <div style={{position:'fixed',bottom:'-20%',right:'-10%',width:500,height:500,background:'radial-gradient(circle,rgba(29,158,117,0.05) 0%,transparent 70%)',borderRadius:'50%',pointerEvents:'none',zIndex:0,animation:'float2 10s ease-in-out infinite'}}/>
      <div style={{position:'fixed',inset:0,backgroundImage:'linear-gradient(rgba(255,255,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.015) 1px,transparent 1px)',backgroundSize:'48px 48px',pointerEvents:'none',zIndex:0}}/>

      <div className="app-layout" style={{position:'relative',zIndex:1}}>
        {/* Sidebar */}
        <div className="sidebar">
          <div className="sidebar-logo">
            <h2>BRACU Admin</h2>
            <p>Management Panel</p>
          </div>
          <div className="sidebar-nav">
            {[
              {id:'overview', label:'Overview', icon:'📊'},
              {id:'slots', label:'Manage Slots', icon:'📅'},
              {id:'bookings', label:'All Bookings', icon:'📋'},
              {id:'students', label:'Students', icon:'👥'},
            ].map(tab => (
              <button key={tab.id}
                className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}>
                <span style={{fontSize:14}}>{tab.icon}</span> {tab.label}
              </button>
            ))}
            <button className="nav-item" onClick={() => navigate('/dashboard')}>
              <span style={{fontSize:14}}>🎓</span> Student View
            </button>
          </div>
          <div className="sidebar-user">
            <p>{user.name}</p>
            <span style={{color:'#1D9E75',fontSize:11}}>Administrator</span>
          </div>
          <button className="logout-btn" onClick={logout}>Sign out</button>
        </div>

        <div className="main-content" style={{animation:'fadeUp 0.5s ease 0.1s both'}}>
          {message && <div className="success-msg" style={{marginBottom:20}}>{message}</div>}
          {error && <div className="error-msg" style={{marginBottom:20}}>{error}</div>}

          {/* OVERVIEW */}
          {activeTab === 'overview' && stats && (
            <>
              <div className="page-header">
                <h1>Admin Dashboard</h1>
                <p>Overview of BRACU Thesis Booking System</p>
              </div>

              {/* Stats */}
              <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:24}}>
                {[
                  {label:'Total Students', value:stats.total_students, color:'#1D9E75'},
                  {label:'Total Slots', value:stats.total_slots, color:'#f0f0ee'},
                  {label:'Booked Slots', value:stats.booked_slots, color:'#f87171'},
                  {label:'Open Slots', value:stats.open_slots, color:'#1D9E75'},
                ].map(s => (
                  <div key={s.label} className="stat-card">
                    <div className="label">{s.label}</div>
                    <div className="value" style={{color:s.color, fontSize:28}}>{s.value}</div>
                  </div>
                ))}
              </div>

              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16}}>
                {/* Supervisor Stats */}
                <div className="card">
                  <h3>Most active supervisors</h3>
                  {stats.supervisor_stats.map(sup => (
                    <div key={sup.name} style={{marginBottom:14}}>
                      <div style={{display:'flex', justifyContent:'space-between', marginBottom:6}}>
                        <span style={{fontSize:13, color:'#f0f0ee'}}>{sup.name}</span>
                        <span style={{fontSize:12, color:'#1D9E75', fontWeight:500}}>{sup.total_bookings} bookings</span>
                      </div>
                      <div style={{height:6, background:'rgba(255,255,255,0.05)', borderRadius:4}}>
                        <div className="bar-fill" style={{width:`${(sup.total_bookings/maxSupervisorBookings)*100}%`}}/>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Department Stats */}
                <div className="card">
                  <h3>Students by department</h3>
                  {stats.department_stats.length === 0 && <div className="empty-state">No students yet.</div>}
                  {stats.department_stats.map(dept => (
                    <div key={dept.department} style={{marginBottom:14}}>
                      <div style={{display:'flex', justifyContent:'space-between', marginBottom:6}}>
                        <span style={{fontSize:13, color:'#f0f0ee'}}>{dept.department}</span>
                        <span style={{fontSize:12, color:'#1D9E75', fontWeight:500}}>{dept.total} students</span>
                      </div>
                      <div style={{height:6, background:'rgba(255,255,255,0.05)', borderRadius:4}}>
                        <div className="bar-fill" style={{width:`${(dept.total/maxDeptTotal)*100}%`}}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Slots booked vs available pie-like */}
              <div className="card">
                <h3>Slot availability</h3>
                <div style={{display:'flex', alignItems:'center', gap:24}}>
                  <div style={{position:'relative', width:120, height:120, flexShrink:0}}>
                    <svg viewBox="0 0 36 36" style={{width:'100%', height:'100%', transform:'rotate(-90deg)'}}>
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3"/>
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1D9E75" strokeWidth="3"
                        strokeDasharray={`${stats.total_slots > 0 ? (stats.booked_slots/stats.total_slots)*100 : 0} 100`}
                        strokeLinecap="round"/>
                    </svg>
                    <div style={{position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column'}}>
                      <div style={{fontSize:20, fontWeight:500, color:'#f0f0ee'}}>{stats.total_slots > 0 ? Math.round((stats.booked_slots/stats.total_slots)*100) : 0}%</div>
                      <div style={{fontSize:10, color:'rgba(255,255,255,0.3)'}}>booked</div>
                    </div>
                  </div>
                  <div style={{display:'flex', flexDirection:'column', gap:12}}>
                    <div style={{display:'flex', alignItems:'center', gap:10}}>
                      <div style={{width:10, height:10, borderRadius:2, background:'#1D9E75'}}/>
                      <span style={{fontSize:13, color:'rgba(255,255,255,0.6)'}}>Booked: <strong style={{color:'#f0f0ee'}}>{stats.booked_slots}</strong></span>
                    </div>
                    <div style={{display:'flex', alignItems:'center', gap:10}}>
                      <div style={{width:10, height:10, borderRadius:2, background:'rgba(255,255,255,0.1)'}}/>
                      <span style={{fontSize:13, color:'rgba(255,255,255,0.6)'}}>Available: <strong style={{color:'#f0f0ee'}}>{stats.open_slots}</strong></span>
                    </div>
                    <div style={{display:'flex', alignItems:'center', gap:10}}>
                      <div style={{width:10, height:10, borderRadius:2, background:'rgba(255,255,255,0.3)'}}/>
                      <span style={{fontSize:13, color:'rgba(255,255,255,0.6)'}}>Total: <strong style={{color:'#f0f0ee'}}>{stats.total_slots}</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* MANAGE SLOTS */}
          {activeTab === 'slots' && (
            <>
              <div className="page-header">
                <h1>Manage Slots</h1>
                <p>Add or remove thesis defense slots</p>
              </div>

              <div className="card" style={{marginBottom:16}}>
                <h3>Add new slot</h3>
                <form onSubmit={handleAddSlot}>
                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12}}>
                    <div>
                      <label style={{display:'block', fontSize:11, color:'rgba(255,255,255,0.4)', marginBottom:6, letterSpacing:'0.05em'}}>DATE</label>
                      <input className="admin-input" type="date" value={newSlot.date}
                        onChange={e => setNewSlot({...newSlot, date: e.target.value})} required />
                    </div>
                    <div>
                      <label style={{display:'block', fontSize:11, color:'rgba(255,255,255,0.4)', marginBottom:6, letterSpacing:'0.05em'}}>ROOM</label>
                      <input className="admin-input" type="text" placeholder="Room 502, UB" value={newSlot.room}
                        onChange={e => setNewSlot({...newSlot, room: e.target.value})} required />
                    </div>
                    <div>
                      <label style={{display:'block', fontSize:11, color:'rgba(255,255,255,0.4)', marginBottom:6, letterSpacing:'0.05em'}}>START TIME</label>
                      <input className="admin-input" type="time" value={newSlot.start_time}
                        onChange={e => setNewSlot({...newSlot, start_time: e.target.value})} required />
                    </div>
                    <div>
                      <label style={{display:'block', fontSize:11, color:'rgba(255,255,255,0.4)', marginBottom:6, letterSpacing:'0.05em'}}>END TIME</label>
                      <input className="admin-input" type="time" value={newSlot.end_time}
                        onChange={e => setNewSlot({...newSlot, end_time: e.target.value})} required />
                    </div>
                  </div>
                  <div style={{marginBottom:12}}>
                    <label style={{display:'block', fontSize:11, color:'rgba(255,255,255,0.4)', marginBottom:6, letterSpacing:'0.05em'}}>SUPERVISOR</label>
                    <select className="admin-input" value={newSlot.supervisor_id}
                      onChange={e => setNewSlot({...newSlot, supervisor_id: e.target.value})} required>
                      <option value="">Select supervisor</option>
                      {supervisors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <button type="submit" className="btn-primary" style={{marginTop:0}}>Add Slot</button>
                </form>
              </div>

              <div className="card">
                <h3>All slots ({slots.length})</h3>
                {slots.map(slot => (
                  <div key={slot.id} className="slot-item">
                    <div>
                      <div className="slot-time">{formatDate(slot.date)} · {formatTime(slot.start_time)} – {formatTime(slot.end_time)}</div>
                      <div className="slot-room">{slot.room}</div>
                      <div className="slot-supervisor">{slot.supervisor_name}</div>
                    </div>
                    <div style={{display:'flex', alignItems:'center', gap:10}}>
                      <span className={slot.status === 'open' ? 'badge-open' : 'badge-booked'}>
                        {slot.status === 'open' ? 'Open' : 'Booked'}
                      </span>
                      {slot.status === 'open' && (
                        <button onClick={() => handleDeleteSlot(slot.id)}
                          style={{background:'rgba(220,50,50,0.08)', border:'1px solid rgba(220,50,50,0.2)', color:'#f87171', borderRadius:6, padding:'4px 10px', fontSize:11, fontFamily:'inherit', cursor:'pointer'}}>
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ALL BOOKINGS */}
          {activeTab === 'bookings' && stats && (
            <>
              <div className="page-header">
                <h1>All Bookings</h1>
                <p>Recent thesis defense bookings</p>
              </div>
              <div className="card">
                <h3>Recent bookings ({stats.total_bookings} total)</h3>
                {stats.recent_bookings.length === 0 && <div className="empty-state">No bookings yet.</div>}
                {stats.recent_bookings.map(b => (
                  <div key={b.id} className="booking-item">
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                      <div>
                        <div className="booking-date">{b.student_name} <span style={{color:'rgba(255,255,255,0.3)', fontWeight:400}}>· {b.student_code}</span></div>
                        <div className="booking-detail">{b.department} · {b.thesis_title}</div>
                        <div className="booking-detail">{formatDate(b.date)} · {formatTime(b.start_time)} – {formatTime(b.end_time)} · {b.room}</div>
                        <div className="booking-supervisor">{b.supervisor_name}</div>
                      </div>
                      <span className="badge-open" style={{flexShrink:0}}>Confirmed</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* STUDENTS */}
          {activeTab === 'students' && stats && (
            <>
              <div className="page-header">
                <h1>Students</h1>
                <p>Registered students overview</p>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:24}}>
                <div className="stat-card">
                  <div className="label">Total registered</div>
                  <div className="value" style={{color:'#1D9E75'}}>{stats.total_students}</div>
                </div>
                <div className="stat-card">
                  <div className="label">Have bookings</div>
                  <div className="value">{stats.total_bookings}</div>
                </div>
                <div className="stat-card">
                  <div className="label">Departments</div>
                  <div className="value">{stats.department_stats.length}</div>
                </div>
              </div>
              <div className="card">
                <h3>Students by department</h3>
                {stats.department_stats.length === 0 && <div className="empty-state">No students registered yet.</div>}
                {stats.department_stats.map(dept => (
                  <div key={dept.department} style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 0', borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                    <div style={{display:'flex', alignItems:'center', gap:12}}>
                      <div style={{width:36, height:36, borderRadius:8, background:'rgba(29,158,117,0.1)', border:'1px solid rgba(29,158,117,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:500, color:'#1D9E75'}}>
                        {dept.department}
                      </div>
                      <span style={{fontSize:14, color:'#f0f0ee'}}>{dept.department} Department</span>
                    </div>
                    <span style={{fontSize:13, color:'#1D9E75', fontWeight:500}}>{dept.total} students</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
