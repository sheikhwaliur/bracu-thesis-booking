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
    baseURL: 'http://localhost:8080/api',
    headers: { Authorization: `Bearer ${token}` }
  });

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

  const handleCancel = async (bookingId, slotId) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await api.delete(`/bookings/${bookingId}`);
      setMessage('Booking cancelled.');
      fetchSlots();
      fetchMyBookings();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
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
    <div className="app-layout">
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
            <button key={tab.id} className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}>
              <span style={{fontSize: 14}}>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>
        <div className="sidebar-user">
          <p>{user.name}</p>
          <span>{user.student_id} · {user.role === 'admin' ? 'Admin' : 'Student'}</span>
        </div>
        <button className="logout-btn" onClick={logout}>Sign out</button>
      </div>

      <div className="main-content">
        {message && <div className="success-msg" style={{marginBottom: 20}}>{message}</div>}
        {error && <div className="error-msg" style={{marginBottom: 20}}>{error}</div>}

        {activeTab === 'slots' && (
          <>
            <div className="page-header">
              <h1>Book a defense slot</h1>
              <p>Select a date and pick an available time slot</p>
            </div>
            <div className="stats-grid">
              <div className="stat-card"><div className="label">Open slots</div><div className="value" style={{color:'#1D9E75'}}>{openSlots.length}</div></div>
              <div className="stat-card"><div className="label">Total slots</div><div className="value">{slots.length}</div></div>
              <div className="stat-card"><div className="label">My bookings</div><div className="value">{myBookings.length}</div></div>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 16}}>
              <div className="card">
                <h3>Select a date</h3>
                <div className="calendar-wrapper">
                  <Calendar
                    onChange={setSelectedDate}
                    value={selectedDate}
                    tileClassName={({ date }) => {
                      const d = date.toISOString().split('T')[0];
                      return slotDates.includes(d) ? 'has-slot' : null;
                    }}
                  />
                </div>
              </div>
              <div className="card">
                <h3>Slots for {selectedDate.toLocaleDateString('en-US', {month:'short', day:'numeric'})}</h3>
                {filteredSlots.length === 0 && <div className="empty-state">No slots on this date.</div>}
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
                  <button onClick={() => handleCancel(b.id, b.slot_id)}
                    style={{background:'rgba(220,50,50,0.08)', border:'1px solid rgba(220,50,50,0.2)', color:'#f87171', borderRadius:8, padding:'6px 14px', fontSize:12, fontFamily:'inherit', cursor:'pointer'}}>
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
                    <div style={{fontSize:12, color:'var(--green)', marginTop:3}}>{sup.email}</div>
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
            <div className="card" style={{maxWidth: 600}}>
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
                <textarea placeholder="Brief description of your thesis..." value={thesisInfo.description}
                  onChange={e => setThesisInfo({...thesisInfo, description: e.target.value})}
                  style={{width:'100%', padding:'11px 14px', background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:8, fontSize:14, color:'var(--text)', fontFamily:'inherit', outline:'none', resize:'vertical', minHeight:120}} />
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
                    <div style={{fontSize:13, color:'var(--green)', marginTop:4}}>{b.supervisor_name}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {selectedSlot && (
        <div className="modal-overlay" onClick={() => setSelectedSlot(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Confirm booking</h2>
            <p style={{fontSize:13, color:'var(--text2)', marginBottom:16}}>
              {formatDate(selectedSlot.date)}<br/>
              {formatTime(selectedSlot.start_time)} – {formatTime(selectedSlot.end_time)} · {selectedSlot.room}<br/>
              <span style={{color:'var(--green)'}}>{selectedSlot.supervisor_name}</span>
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