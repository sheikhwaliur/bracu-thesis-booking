import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

export default function Dashboard() {
  const [slots, setSlots] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [activeTab, setActiveTab] = useState('slots');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [thesisTitle, setThesisTitle] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [thesisInfo, setThesisInfo] = useState({ title: '', supervisor: '', description: '' });
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  const api = axios.create({
    baseURL: 'https://bracu-thesis-booking.onrender.com/api',
    headers: { Authorization: `Bearer ${token}` }
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchSlots(); fetchMyBookings(); fetchSupervisors(); }, []);

  const fetchSlots = async () => {
    try { const res = await api.get('/slots'); setSlots(res.data); } catch {}
  };

  const fetchMyBookings = async () => {
    try { const res = await api.get('/bookings/mine'); setMyBookings(res.data); } catch {}
  };

  const fetchSupervisors = async () => {
    try { const res = await api.get('/supervisors'); setSupervisors(res.data); } catch {}
  };

  const handleBook = async () => {
    setError('');
    try {
      await api.post('/bookings', { slot_id: selectedSlot.id, thesis_title: thesisTitle });
      setMessage('Slot booked! A confirmation email has been sent.');
      setSelectedSlot(null);
      setThesisTitle('');
      fetchSlots();
      fetchMyBookings();
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setError(err.response?.data?.error || 'Booking failed.');
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await api.delete(`/bookings/${bookingId}`);
      setMessage('Booking cancelled.');
      fetchSlots();
      fetchMyBookings();
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setError('Could not cancel booking.');
    }
  };

  const formatTime = (t) => {
    if (!t) return '';
    const [h, m] = t.split(':');
    const hour = parseInt(h);
    return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  const logout = () => { localStorage.clear(); navigate('/login'); };

  const selectedDateStr = selectedDate.toISOString().split('T')[0];
  const filteredSlots = slots.filter(s => s.date && s.date.startsWith(selectedDateStr));
  const slotDates = slots.map(s => s.date?.split('T')[0]);
  const openSlots = slots.filter(s => s.status === 'open');

  return (
    <div style={{position:'relative', minHeight:'100vh', background:'#0a0a0b', overflow:'hidden'}}>

      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-40px, 20px) scale(1.08); }
          66% { transform: translate(20px, -30px) scale(0.97); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .react-calendar { width: 100% !important; background: transparent !important; border: none !important; font-family: inherit !important; }
        .react-calendar__tile { background: none !important; color: rgba(255,255,255,0.5) !important; border-radius: 8px !important; padding: 10px !important; font-size: 13px !important; border: none !important; }
        .react-calendar__tile:hover { background: rgba(255,255,255,0.05) !important; color: white !important; }
        .react-calendar__tile--now { background: transparent !important; color: rgba(255,255,255,0.5) !important; border: none !important; outline: none !important; box-shadow: none !important; }
        .react-calendar__tile--now:hover { background: rgba(255,255,255,0.05) !important; color: white !important; }
        .react-calendar__tile--now:focus { background: transparent !important; }
        .react-calendar__tile--active, .react-calendar__tile--active:hover { background: #1D9E75 !important; color: white !important; }
        .react-calendar__tile.has-slot::after { content: ''; display: block; width: 4px; height: 4px; background: #1D9E75; border-radius: 50%; margin: 2px auto 0; }
        .react-calendar__tile--active.has-slot::after { background: white; }
        .react-calendar__navigation button { background: none !important; color: rgba(255,255,255,0.7) !important; font-size: 14px !important; font-family: inherit !important; border: none !important; border-radius: 8px !important; }
        .react-calendar__navigation button:hover { background: rgba(255,255,255,0.05) !important; }
        .react-calendar__navigation button:disabled { background: none !important; color: rgba(255,255,255,0.2) !important; }
        .react-calendar__month-view__weekdays { color: rgba(255,255,255,0.25) !important; font-size: 11px !important; }
        .react-calendar__month-view__weekdays abbr { text-decoration: none !important; }
        .react-calendar__month-view__days__day--weekend { color: rgba(255,255,255,0.5) !important; }
        .react-calendar__month-view__days__day--neighboringMonth { color: rgba(255,255,255,0.15) !important; }
      `}</style>

      {/* Background blobs */}
      <div style={{position:'fixed', top:'-20%', left:'-10%', width:600, height:600, background:'radial-gradient(circle, rgba(29,158,117,0.07) 0%, transparent 70%)', borderRadius:'50%', pointerEvents:'none', zIndex:0, animation:'float1 8s ease-in-out infinite'}}/>
      <div style={{position:'fixed', bottom:'-20%', right:'-10%', width:500, height:500, background:'radial-gradient(circle, rgba(29,158,117,0.05) 0%, transparent 70%)', borderRadius:'50%', pointerEvents:'none', zIndex:0, animation:'float2 10s ease-in-out infinite'}}/>
      <div style={{position:'fixed', top:'40%', right:'15%', width:350, height:350, background:'radial-gradient(circle, rgba(29,158,117,0.04) 0%, transparent 70%)', borderRadius:'50%', pointerEvents:'none', zIndex:0, animation:'float1 12s ease-in-out infinite reverse'}}/>
      <div style={{position:'fixed', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)', backgroundSize:'48px 48px', pointerEvents:'none', zIndex:0}}/>

      <div className="app-layout" style={{position:'relative', zIndex:1}}>
        <div className="sidebar">
          <div className="sidebar-logo">
            <h2>BRACU Thesis</h2>
            <p>Slot Booking Portal</p>
          </div>
          <div className="sidebar-nav">
            {[
              { id: 'slots', label: 'Book a slot', icon: '📅' },
              { id: 'bookings', label: 'My bookings', icon: '📋' },
              { id: 'supervisors', label: 'Supervisors', icon: '👨‍🏫' },
              { id: 'thesis', label: 'My thesis', icon: '📝' },
            ].map(tab => (
              <button key={tab.id}
                className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}>
                <span style={{fontSize:14}}>{tab.icon}</span> {tab.label}
              </button>
            ))}
          </div>
          <div className="sidebar-user">
            <p>{user.name}</p>
            <span>{user.student_id} · {user.role === 'admin' ? 'Admin' : 'Student'}</span>
          </div>
          <button className="logout-btn" onClick={logout}>Sign out</button>
        </div>

        <div className="main-content" style={{animation:'fadeUp 0.5s ease 0.1s both'}}>
          {message && <div className="success-msg" style={{marginBottom:20}}>{message}</div>}
          {error && <div className="error-msg" style={{marginBottom:20}}>{error}</div>}

          {activeTab === 'slots' && (
            <>
              <div className="page-header">
                <h1>Book a defense slot</h1>
                <p>Select a date and pick an available time slot</p>
              </div>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="label">Open slots</div>
                  <div className="value" style={{color:'#1D9E75'}}>{openSlots.length}</div>
                </div>
                <div className="stat-card">
                  <div className="label">Total slots</div>
                  <div className="value">{slots.length}</div>
                </div>
                <div className="stat-card">
                  <div className="label">My bookings</div>
                  <div className="value">{myBookings.length}</div>
                </div>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
                <div className="card">
                  <h3>Select a date</h3>
                  <Calendar
                    onChange={setSelectedDate}
                    value={selectedDate}
                    tileClassName={({ date }) => {
                      const d = date.toISOString().split('T')[0];
                      return slotDates.includes(d) ? 'has-slot' : null;
                    }}
                  />
                </div>
                <div className="card">
                  <h3>Slots for {selectedDate.toLocaleDateString('en-US', {month:'short', day:'numeric'})}</h3>
                  {filteredSlots.length === 0 && <div className="empty-state">No slots on this date.<br/>Try a date with a green dot.</div>}
                  {filteredSlots.map(slot => (
                    <div className="slot-item" key={slot.id}>
                      <div>
                        <div className="slot-time">{formatTime(slot.start_time)} – {formatTime(slot.end_time)}</div>
                        <div className="slot-room">{slot.room}</div>
                        <div className="slot-supervisor">{slot.supervisor_name}</div>
                        {slot.status === 'open' && (
                          <button className="book-btn" onClick={() => setSelectedSlot(slot)}>Book this slot</button>
                        )}
                      </div>
                      <span className={slot.status === 'open' ? 'badge-open' : 'badge-booked'}>
                        {slot.status === 'open' ? 'Open' : 'Booked'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'bookings' && (
            <>
              <div className="page-header">
                <h1>My bookings</h1>
                <p>Your scheduled thesis defense slots</p>
              </div>
              <div className="card">
                <h3>Scheduled defenses</h3>
                {myBookings.length === 0 && <div className="empty-state">No bookings yet. Go book a slot!</div>}
                {myBookings.map(b => (
                  <div className="booking-item" key={b.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <div>
                      <div className="booking-date">{formatDate(b.date)}</div>
                      <div className="booking-detail">{formatTime(b.start_time)} – {formatTime(b.end_time)} · {b.room}</div>
                      <div className="booking-detail" style={{marginTop:2}}>{b.thesis_title}</div>
                      <div className="booking-supervisor">{b.supervisor_name}</div>
                    </div>
                    <button onClick={() => handleCancel(b.id)}
                      style={{background:'rgba(220,50,50,0.08)', border:'1px solid rgba(220,50,50,0.2)', color:'#f87171', borderRadius:8, padding:'6px 14px', fontSize:12, fontFamily:'inherit', cursor:'pointer', flexShrink:0}}>
                      Cancel
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'supervisors' && (
            <>
              <div className="page-header">
                <h1>Supervisors</h1>
                <p>Available thesis supervisors in your department</p>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:16}}>
                {supervisors.map(sup => (
                  <div className="card" key={sup.id} style={{display:'flex', alignItems:'center', gap:16}}>
                    <div style={{width:48, height:48, borderRadius:'50%', background:'rgba(29,158,117,0.1)', border:'1px solid rgba(29,158,117,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:500, color:'#1D9E75', flexShrink:0}}>
                      {sup.name.split(' ').map(n => n[0]).slice(0,2).join('')}
                    </div>
                    <div>
                      <div style={{fontSize:14, fontWeight:500, color:'var(--text)'}}>{sup.name}</div>
                      <div style={{fontSize:12, color:'var(--text3)', marginTop:3}}>{sup.department} Department</div>
                      <div style={{fontSize:12, color:'#1D9E75', marginTop:3}}>{sup.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'thesis' && (
            <>
              <div className="page-header">
                <h1>My thesis</h1>
                <p>Keep track of your thesis details</p>
              </div>
              <div className="card" style={{maxWidth:600}}>
                <h3>Thesis information</h3>
                <div className="form-group">
                  <label>Thesis title</label>
                  <input type="text" placeholder="Enter your thesis title" value={thesisInfo.title}
                    onChange={e => setThesisInfo({...thesisInfo, title: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Supervisor</label>
                  <select value={thesisInfo.supervisor} onChange={e => setThesisInfo({...thesisInfo, supervisor: e.target.value})}>
                    <option value="">Select supervisor</option>
                    {supervisors.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Abstract / description</label>
                  <textarea
                    placeholder="Brief description of your thesis..."
                    value={thesisInfo.description}
                    onChange={e => setThesisInfo({...thesisInfo, description: e.target.value})}
                    style={{width:'100%', padding:'11px 14px', background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:8, fontSize:14, color:'var(--text)', fontFamily:'inherit', outline:'none', resize:'vertical', minHeight:120}}
                  />
                </div>
                <button className="btn-primary" onClick={() => setMessage('Thesis info saved!')}>Save information</button>
              </div>
              {myBookings.length > 0 && (
                <div className="card" style={{maxWidth:600, marginTop:16}}>
                  <h3>Defense booking</h3>
                  {myBookings.map(b => (
                    <div key={b.id}>
                      <div style={{fontSize:14, fontWeight:500, color:'var(--text)'}}>{formatDate(b.date)}</div>
                      <div style={{fontSize:13, color:'var(--text2)', marginTop:4}}>{formatTime(b.start_time)} – {formatTime(b.end_time)} · {b.room}</div>
                      <div style={{fontSize:13, color:'#1D9E75', marginTop:4}}>{b.supervisor_name}</div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {selectedSlot && (
        <div className="modal-overlay" onClick={() => setSelectedSlot(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Confirm booking</h2>
            <p style={{fontSize:13, color:'var(--text2)', marginBottom:16}}>
              {formatDate(selectedSlot.date)}<br/>
              {formatTime(selectedSlot.start_time)} – {formatTime(selectedSlot.end_time)} · {selectedSlot.room}<br/>
              <span style={{color:'#1D9E75'}}>{selectedSlot.supervisor_name}</span>
            </p>
            <div className="form-group">
              <label>Thesis title</label>
              <input type="text" placeholder="Enter your thesis title" value={thesisTitle}
                onChange={e => setThesisTitle(e.target.value)} />
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setSelectedSlot(null)}>Cancel</button>
              <button className="btn-confirm" onClick={handleBook}>Confirm booking</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}