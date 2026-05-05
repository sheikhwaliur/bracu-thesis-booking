import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

export default function Dashboard() {
  const [slots, setSlots] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [myWaitlist, setMyWaitlist] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [activeTab, setActiveTab] = useState('slots');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [thesisTitle, setThesisTitle] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filterSupervisor, setFilterSupervisor] = useState('');
  const [filterRoom, setFilterRoom] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [thesisInfo, setThesisInfo] = useState(() => {
    const saved = localStorage.getItem('thesisInfo');
    return saved ? JSON.parse(saved) : { title: '', supervisor: '', description: '', phases: {} };
  });
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  const api = axios.create({
    baseURL: 'https://bracu-thesis-booking.onrender.com/api',
    headers: { Authorization: `Bearer ${token}` }
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchSlots(); fetchMyBookings(); fetchSupervisors(); fetchWaitlist(); }, []);

  const fetchSlots = async () => { try { const res = await api.get('/slots'); setSlots(res.data); } catch {} };
  const fetchMyBookings = async () => { try { const res = await api.get('/bookings/mine'); setMyBookings(res.data); } catch {} };
  const fetchSupervisors = async () => { try { const res = await api.get('/supervisors'); setSupervisors(res.data); } catch {} };
  const fetchWaitlist = async () => { try { const res = await api.get('/waitlist/mine'); setMyWaitlist(res.data); } catch {} };

  const handleBook = async () => {
    setError('');
    try {
      await api.post('/bookings', { slot_id: selectedSlot.id, thesis_title: thesisTitle });
      setMessage('Slot booked successfully!');
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
      await api.delete('/bookings/' + bookingId);
      setMessage('Booking cancelled.');
      fetchSlots(); fetchMyBookings(); fetchWaitlist();
      setTimeout(() => setMessage(''), 3000);
    } catch { setError('Could not cancel booking.'); }
  };

  const joinWaitlist = async (slotId) => {
    setError('');
    try {
      const res = await api.post('/waitlist', { slot_id: slotId });
      setMessage('Added to waitlist! Position: #' + res.data.position);
      fetchWaitlist();
      setTimeout(() => setMessage(''), 4000);
    } catch (err) { setError(err.response?.data?.error || 'Could not join waitlist.'); }
  };

  const leaveWaitlist = async (slotId) => {
    try {
      await api.delete('/waitlist/' + slotId);
      setMessage('Removed from waitlist.');
      fetchWaitlist();
      setTimeout(() => setMessage(''), 3000);
    } catch { setError('Could not leave waitlist.'); }
  };

  const downloadBookingPDF = (b) => {
    import('jspdf').then(({ jsPDF }) => {
      const doc = new jsPDF();
      doc.setFillColor(10, 10, 11);
      doc.rect(0, 0, 210, 297, 'F');
      doc.setTextColor(29, 158, 117);
      doc.setFontSize(22);
      doc.text('BRAC University', 105, 30, { align: 'center' });
      doc.setTextColor(240, 240, 238);
      doc.setFontSize(14);
      doc.text('Thesis Defense Booking Confirmation', 105, 42, { align: 'center' });
      doc.setDrawColor(29, 158, 117);
      doc.line(20, 50, 190, 50);
      const labels = ['Student Name','Student ID','Thesis Title','Defense Date','Time','Room','Supervisor'];
      const values = [user.name||'', user.student_id||'', b.thesis_title||'', formatDate(b.date), formatTime(b.start_time)+' - '+formatTime(b.end_time), b.room, b.supervisor_name||''];
      labels.forEach((label, i) => {
        doc.setTextColor(136, 136, 132); doc.text(label, 20, 65 + i * 14);
        doc.setTextColor(240, 240, 238); doc.text(values[i], 80, 65 + i * 14);
      });
      doc.setTextColor(29, 158, 117); doc.setFontSize(10);
      doc.text('Official booking confirmation from BRACU Thesis Portal', 105, 270, { align: 'center' });
      doc.save('BRACU_Thesis_Booking_' + user.student_id + '.pdf');
    });
  };

  const formatTime = (t) => {
    if (!t) return '';
    const [h, m] = t.split(':');
    const hour = parseInt(h);
    return (hour > 12 ? hour - 12 : hour) + ':' + m + ' ' + (hour >= 12 ? 'PM' : 'AM');
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric', year:'numeric' });
  const logout = () => { localStorage.clear(); navigate('/login'); };

  const selectedDateStr = selectedDate.toISOString().split('T')[0];
  const filteredSlots = slots.filter(s => {
    const dateMatch = (filterSupervisor||filterRoom||filterStatus) ? true : s.date && s.date.startsWith(selectedDateStr);
    const supervisorMatch = filterSupervisor ? s.supervisor_name === filterSupervisor : true;
    const roomMatch = filterRoom ? s.room === filterRoom : true;
    const statusMatch = filterStatus ? s.status === filterStatus : true;
    return dateMatch && supervisorMatch && roomMatch && statusMatch;
  });
  const slotDates = slots.map(s => s.date && s.date.split('T')[0]);
  const openSlots = slots.filter(s => s.status === 'open');
  const phases = thesisInfo.phases || {};
  const phaseCount = Object.values(phases).filter(Boolean).length + (myBookings.length > 0 ? 1 : 0);
  const progressPct = Math.min(Math.round((phaseCount / 4) * 100), 100);

  return (
    <div style={{position:'relative', minHeight:'100vh', background:'#0a0a0b', overflow:'hidden'}}>
      <style>{`
        @keyframes float1{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(30px,-30px) scale(1.05)}66%{transform:translate(-20px,20px) scale(0.95)}}
        @keyframes float2{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(-40px,20px) scale(1.08)}66%{transform:translate(20px,-30px) scale(0.97)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .react-calendar{width:100%!important;background:transparent!important;border:none!important;font-family:inherit!important}
        .react-calendar__tile{background:none!important;color:rgba(255,255,255,0.5)!important;border-radius:8px!important;padding:10px!important;font-size:13px!important;border:none!important}
        .react-calendar__tile:hover{background:rgba(255,255,255,0.05)!important;color:white!important}
        .react-calendar__tile--now{background:transparent!important;color:rgba(255,255,255,0.5)!important;border:none!important;outline:none!important;box-shadow:none!important}
        .react-calendar__tile--active,.react-calendar__tile--active:hover{background:#1D9E75!important;color:white!important}
        .react-calendar__tile.has-slot::after{content:'';display:block;width:4px;height:4px;background:#1D9E75;border-radius:50%;margin:2px auto 0}
        .react-calendar__tile--active.has-slot::after{background:white}
        .react-calendar__navigation button{background:none!important;color:rgba(255,255,255,0.7)!important;font-size:14px!important;font-family:inherit!important;border:none!important;border-radius:8px!important}
        .react-calendar__navigation button:hover{background:rgba(255,255,255,0.05)!important}
        .react-calendar__navigation button:disabled{background:none!important;color:rgba(255,255,255,0.2)!important}
        .react-calendar__month-view__weekdays{color:rgba(255,255,255,0.25)!important;font-size:11px!important}
        .react-calendar__month-view__weekdays abbr{text-decoration:none!important}
        .react-calendar__month-view__days__day--weekend{color:rgba(255,255,255,0.5)!important}
        .react-calendar__month-view__days__day--neighboringMonth{color:rgba(255,255,255,0.15)!important}
        .filter-select{width:100%;padding:9px 12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:8px;font-size:13px;color:#f0f0ee;font-family:inherit;outline:none}
        .filter-select option{background:#111}
        .slots-scroll::-webkit-scrollbar{width:4px}
        .slots-scroll::-webkit-scrollbar-track{background:transparent}
        .slots-scroll::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:4px}
        @keyframes shimmer{0%,100%{opacity:0.3}50%{opacity:1}}
        .nav-btn{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:8px;font-size:13px;color:rgba(255,255,255,0.5);margin-bottom:3px;cursor:pointer;transition:all 0.2s ease;border:1px solid transparent;background:none;width:100%;text-align:left;font-family:inherit;position:relative;overflow:hidden}
        .nav-btn::before{content:'';position:absolute;left:0;top:0;bottom:0;width:2px;background:#1D9E75;border-radius:0 2px 2px 0;transform:scaleY(0);transition:transform 0.2s ease}
        .nav-btn:hover{background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.8);border-color:rgba(255,255,255,0.06);transform:translateX(2px)}
        .nav-btn.active{background:rgba(29,158,117,0.08);color:#1D9E75;border-color:rgba(29,158,117,0.2);font-weight:500;transform:translateX(2px)}
        .nav-btn.active::before{transform:scaleY(1)}
      `}</style>

      <div style={{position:'fixed',top:'-20%',left:'-10%',width:600,height:600,background:'radial-gradient(circle,rgba(29,158,117,0.07) 0%,transparent 70%)',borderRadius:'50%',pointerEvents:'none',zIndex:0,animation:'float1 8s ease-in-out infinite'}}/>
      <div style={{position:'fixed',bottom:'-20%',right:'-10%',width:500,height:500,background:'radial-gradient(circle,rgba(29,158,117,0.05) 0%,transparent 70%)',borderRadius:'50%',pointerEvents:'none',zIndex:0,animation:'float2 10s ease-in-out infinite'}}/>
      <div style={{position:'fixed',top:'40%',right:'15%',width:350,height:350,background:'radial-gradient(circle,rgba(29,158,117,0.04) 0%,transparent 70%)',borderRadius:'50%',pointerEvents:'none',zIndex:0,animation:'float1 12s ease-in-out infinite reverse'}}/>
      <div style={{position:'fixed',inset:0,backgroundImage:'linear-gradient(rgba(255,255,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.015) 1px,transparent 1px)',backgroundSize:'48px 48px',pointerEvents:'none',zIndex:0}}/>

      <div className="app-layout" style={{position:'relative',zIndex:1}}>
        <div className="sidebar">
          <div className="sidebar-logo">
            <div>
              <h2>BRACU Thesis</h2>
              <p>Slot Booking Portal</p>
            </div>
            <button className="logout-btn mobile-only" onClick={logout}>Sign out</button>
          </div>
          <div className="sidebar-nav">
            {[
              {id:'slots', label:'Book a slot'},
              {id:'bookings', label:'My bookings'},
              {id:'supervisors', label:'Supervisors'},
              {id:'thesis', label:'My thesis'},
            ].map(tab => (
              <button key={tab.id} className={'nav-btn ' + (activeTab===tab.id ? 'active' : '')} onClick={() => setActiveTab(tab.id)}>
                {tab.label}
              </button>
            ))}
            <button className={'nav-btn ' + (showNotifications ? 'active' : '')} onClick={() => setShowNotifications(!showNotifications)} style={{color:showNotifications?'#f87171':'rgba(255,255,255,0.5)'}}>
              Notifications
              {myBookings.length > 0 && (
                <span style={{marginLeft:'auto',background:'#f87171',borderRadius:'50%',width:16,height:16,fontSize:9,display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:600,flexShrink:0}}>
                  {myBookings.length}
                </span>
              )}
            </button>
          </div>
          <div className="sidebar-user desktop-only" onClick={() => navigate('/profile')} style={{cursor:'pointer'}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{width:32,height:32,borderRadius:'50%',background:'rgba(29,158,117,0.1)',border:'1px solid rgba(29,158,117,0.2)',overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,color:'#1D9E75',flexShrink:0}}>
                {localStorage.getItem('avatar') ? <img src={localStorage.getItem('avatar')} alt="avatar" style={{width:'100%',height:'100%',objectFit:'cover'}}/> : user.name && user.name.charAt(0)}
              </div>
              <div><p>{user.name}</p><span>{user.student_id} · {user.role==='admin'?'Admin':'Student'}</span></div>
            </div>
          </div>
         
        </div>

        <div className="main-content" style={{animation:'fadeUp 0.5s ease 0.1s both'}}>
          {message && <div className="success-msg" style={{marginBottom:20}}>{message}</div>}
          {error && <div className="error-msg" style={{marginBottom:20}}>{error}</div>}

          {activeTab==='slots' && (
            <>
              <div className="page-header"><h1>Book a defense slot</h1><p>Select a date and pick an available time slot</p></div>
              <div className="stats-grid">
                <div className="stat-card"><div className="label">Open slots</div><div className="value" style={{color:'#1D9E75'}}>{openSlots.length}</div></div>
                <div className="stat-card"><div className="label">Total slots</div><div className="value">{slots.length}</div></div>
                <div className="stat-card"><div className="label">My bookings</div><div className="value">{myBookings.length}</div></div>
              </div>
              <div className="card" style={{marginBottom:16}}>
                <h3>Search & filter</h3>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
                  <div>
                    <label style={{display:'block',fontSize:11,color:'rgba(255,255,255,0.4)',marginBottom:6,letterSpacing:'0.05em'}}>SUPERVISOR</label>
                    <select className="filter-select" value={filterSupervisor} onChange={e => setFilterSupervisor(e.target.value)}>
                      <option value="">All supervisors</option>
                      {supervisors.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{display:'block',fontSize:11,color:'rgba(255,255,255,0.4)',marginBottom:6,letterSpacing:'0.05em'}}>ROOM</label>
                    <select className="filter-select" value={filterRoom} onChange={e => setFilterRoom(e.target.value)}>
                      <option value="">All rooms</option>
                      {[...new Set(slots.map(s => s.room))].map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{display:'block',fontSize:11,color:'rgba(255,255,255,0.4)',marginBottom:6,letterSpacing:'0.05em'}}>STATUS</label>
                    <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                      <option value="">All slots</option>
                      <option value="open">Open only</option>
                      <option value="booked">Booked only</option>
                    </select>
                  </div>
                </div>
                {(filterSupervisor||filterRoom||filterStatus) && (
                  <button onClick={() => {setFilterSupervisor('');setFilterRoom('');setFilterStatus('');}} style={{marginTop:10,background:'none',border:'1px solid rgba(255,255,255,0.08)',borderRadius:6,padding:'5px 12px',fontSize:12,color:'rgba(255,255,255,0.4)',fontFamily:'inherit',cursor:'pointer'}}>Clear filters</button>
                )}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                <div className="card">
                  <h3>Select a date</h3>
                  <Calendar onChange={setSelectedDate} value={selectedDate} tileClassName={({date}) => { const d = date.toISOString().split('T')[0]; return slotDates.includes(d) ? 'has-slot' : null; }}/>
                </div>
                <div className="card" style={{display:'flex',flexDirection:'column',maxHeight:520,overflow:'hidden'}}>
                  <h3 style={{flexShrink:0}}>{filterSupervisor||filterRoom||filterStatus ? 'Filtered slots ('+filteredSlots.length+')' : 'Slots for '+selectedDate.toLocaleDateString('en-US',{month:'short',day:'numeric'})}</h3>
                  <div className="slots-scroll" style={{overflowY:'auto',flex:1,paddingRight:4}}>
                    {filteredSlots.length===0 && <div className="empty-state">No slots found.<br/>Try different filters or another date.</div>}
                    {filteredSlots.map(slot => (
                      <div className="slot-item" key={slot.id}>
                        <div>
                          <div className="slot-time">{formatTime(slot.start_time)} - {formatTime(slot.end_time)}</div>
                          <div className="slot-room">{slot.room}</div>
                          <div className="slot-supervisor">{slot.supervisor_name}</div>
                          {slot.status==='open' && <button className="book-btn" onClick={() => setSelectedSlot(slot)}>Book this slot</button>}
                        </div>
                        <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:6}}>
                          <span className={slot.status==='open'?'badge-open':'badge-booked'}>{slot.status==='open'?'Open':'Booked'}</span>
                          {slot.status==='booked' && (() => {
                            const inWaitlist = myWaitlist.find(w => w.slot_id===slot.id);
                            return inWaitlist ? (
                              <div style={{textAlign:'right'}}>
                                <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',marginBottom:4}}>Position #{inWaitlist.position}</div>
                                <button onClick={() => leaveWaitlist(slot.id)} style={{background:'rgba(220,50,50,0.08)',border:'1px solid rgba(220,50,50,0.2)',color:'#f87171',borderRadius:6,padding:'4px 10px',fontSize:11,fontFamily:'inherit',cursor:'pointer'}}>Leave waitlist</button>
                              </div>
                            ) : (
                              <button onClick={() => joinWaitlist(slot.id)} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.6)',borderRadius:6,padding:'4px 10px',fontSize:11,fontFamily:'inherit',cursor:'pointer'}}>Join waitlist</button>
                            );
                          })()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab==='bookings' && (
            <>
              <div className="page-header"><h1>My bookings</h1><p>Your scheduled thesis defense slots</p></div>
              <div className="card">
                <h3>Scheduled defenses</h3>
                {myBookings.length===0 && <div className="empty-state">No bookings yet. Go book a slot!</div>}
                {myBookings.map(b => (
                  <div className="booking-item" key={b.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <div>
                      <div className="booking-date">{formatDate(b.date)}</div>
                      <div className="booking-detail">{formatTime(b.start_time)} - {formatTime(b.end_time)} · {b.room}</div>
                      <div className="booking-detail" style={{marginTop:2}}>{b.thesis_title}</div>
                      <div className="booking-supervisor">{b.supervisor_name}</div>
                    </div>
                    <div style={{display:'flex',gap:8,flexShrink:0}}>
                      <button onClick={() => downloadBookingPDF(b)} style={{background:'rgba(29,158,117,0.08)',border:'1px solid rgba(29,158,117,0.2)',color:'#1D9E75',borderRadius:8,padding:'6px 14px',fontSize:12,fontFamily:'inherit',cursor:'pointer'}}>📄 PDF</button>
                      <button onClick={() => handleCancel(b.id)} style={{background:'rgba(220,50,50,0.08)',border:'1px solid rgba(220,50,50,0.2)',color:'#f87171',borderRadius:8,padding:'6px 14px',fontSize:12,fontFamily:'inherit',cursor:'pointer'}}>Cancel</button>
                    </div>
                  </div>
                ))}
              </div>
              {myWaitlist.length>0 && (
                <div className="card" style={{marginTop:16}}>
                  <h3>My waitlist ({myWaitlist.length})</h3>
                  {myWaitlist.map(w => (
                    <div key={w.id} className="booking-item" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <div>
                        <div className="booking-date">{formatDate(w.date)}</div>
                        <div className="booking-detail">{formatTime(w.start_time)} - {formatTime(w.end_time)} · {w.room}</div>
                        <div className="booking-supervisor">{w.supervisor_name}</div>
                        <div style={{fontSize:11,color:'rgba(255,255,255,0.3)',marginTop:3}}>Position: <strong style={{color:'#1D9E75'}}>#{w.position}</strong></div>
                      </div>
                      <button onClick={() => leaveWaitlist(w.slot_id)} style={{background:'rgba(220,50,50,0.08)',border:'1px solid rgba(220,50,50,0.2)',color:'#f87171',borderRadius:8,padding:'6px 14px',fontSize:12,fontFamily:'inherit',cursor:'pointer',flexShrink:0}}>Leave</button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab==='supervisors' && (
            <>
              <div className="page-header"><h1>Supervisors</h1><p>Available thesis supervisors</p></div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))',gap:16}}>
                {supervisors.map(sup => (
                  <div className="card" key={sup.id} style={{display:'flex',alignItems:'center',gap:16}}>
                    <div style={{width:48,height:48,borderRadius:'50%',background:'rgba(29,158,117,0.1)',border:'1px solid rgba(29,158,117,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,fontWeight:500,color:'#1D9E75',flexShrink:0}}>
                      {sup.name.split(' ').map(n => n[0]).slice(0,2).join('')}
                    </div>
                    <div>
                      <div style={{fontSize:14,fontWeight:500,color:'var(--text)'}}>{sup.name}</div>
                      <div style={{fontSize:12,color:'var(--text3)',marginTop:3}}>{sup.department} Department</div>
                      <div style={{fontSize:12,color:'#1D9E75',marginTop:3}}>{sup.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab==='thesis' && (
            <>
              <div className="page-header"><h1>My thesis</h1><p>Track your thesis journey from proposal to defense</p></div>
              <div className="card" style={{marginBottom:16}}>
                <h3>Defense progress</h3>
                <div style={{marginBottom:20}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                    <span style={{fontSize:12,color:'rgba(255,255,255,0.4)'}}>Overall progress</span>
                    <span style={{fontSize:12,color:'#1D9E75',fontWeight:500}}>{progressPct}%</span>
                  </div>
                  <div style={{height:6,background:'rgba(255,255,255,0.05)',borderRadius:4}}>
                    <div style={{height:'100%',borderRadius:4,background:'linear-gradient(90deg,#1D9E75,#157557)',width:progressPct+'%',transition:'width 0.5s ease'}}/>
                  </div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
                  {[
                    {key:'proposal',label:'Proposal',icon:'📋',desc:'Topic approved by supervisor'},
                    {key:'draft',label:'Draft',icon:'✏️',desc:'First draft submitted'},
                    {key:'final',label:'Final',icon:'📄',desc:'Final version ready'},
                    {key:'defense',label:'Defense',icon:'🎓',desc:'Defense slot booked'},
                  ].map((phase, index) => {
                    const isCompleted = phases[phase.key];
                    const prevPhases = ['proposal','draft','final','defense'].slice(0,index);
                    const canComplete = prevPhases.every(p => phases[p]);
                    const isDefense = phase.key==='defense';
                    const autoDefense = isDefense && myBookings.length>0;
                    return (
                      <div key={phase.key} style={{padding:16,background:isCompleted||autoDefense?'rgba(29,158,117,0.08)':'rgba(255,255,255,0.02)',border:'1px solid '+(isCompleted||autoDefense?'rgba(29,158,117,0.3)':'rgba(255,255,255,0.07)'),borderRadius:12,transition:'all 0.3s ease',position:'relative',overflow:'hidden'}}>
                        {(isCompleted||autoDefense) && <div style={{position:'absolute',top:0,right:0,width:40,height:40,background:'rgba(29,158,117,0.15)',borderRadius:'0 12px 0 40px'}}/>}
                        <div style={{fontSize:24,marginBottom:8}}>{phase.icon}</div>
                        <div style={{fontSize:13,fontWeight:500,color:isCompleted||autoDefense?'#1D9E75':'#f0f0ee',marginBottom:4}}>{phase.label}</div>
                        <div style={{fontSize:11,color:'rgba(255,255,255,0.3)',marginBottom:12,lineHeight:1.5}}>{isDefense&&autoDefense?'Booked: '+formatDate(myBookings[0].date):phase.desc}</div>
                        {isDefense ? (
                          <div style={{fontSize:11,color:autoDefense?'#1D9E75':'rgba(255,255,255,0.3)',fontWeight:500}}>{autoDefense?'✓ Slot booked':'Book a slot first'}</div>
                        ) : (
                          <button onClick={() => { if(!canComplete&&!isCompleted) return; setThesisInfo(prev => ({...prev,phases:{...prev.phases,[phase.key]:!isCompleted}})); }}
                            style={{background:isCompleted?'rgba(220,50,50,0.08)':canComplete?'#1D9E75':'rgba(255,255,255,0.03)',border:isCompleted?'1px solid rgba(220,50,50,0.2)':canComplete?'none':'1px solid rgba(255,255,255,0.06)',color:isCompleted?'#f87171':canComplete?'white':'rgba(255,255,255,0.2)',borderRadius:6,padding:'5px 10px',fontSize:11,fontFamily:'inherit',cursor:canComplete||isCompleted?'pointer':'not-allowed',transition:'all 0.2s'}}>
                            {isCompleted?'Mark incomplete':canComplete?'✓ Mark complete':'Complete previous first'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
                {myBookings.length>0 && (() => {
                  const diffDays = Math.ceil((new Date(myBookings[0].date) - new Date()) / (1000*60*60*24));
                  return (
                    <div style={{marginTop:16,padding:16,background:'rgba(29,158,117,0.06)',border:'1px solid rgba(29,158,117,0.15)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                      <div>
                        <div style={{fontSize:12,color:'rgba(255,255,255,0.4)',marginBottom:4}}>Defense countdown</div>
                        <div style={{fontSize:22,fontWeight:500,color:'#1D9E75'}}>{diffDays===0?'Today! 🎓':diffDays===1?'Tomorrow! 🟡':diffDays>0?diffDays+' days to go':'Completed ✅'}</div>
                      </div>
                      <div style={{textAlign:'right'}}>
                        <div style={{fontSize:13,color:'#f0f0ee'}}>{formatDate(myBookings[0].date)}</div>
                        <div style={{fontSize:12,color:'rgba(255,255,255,0.4)',marginTop:3}}>{formatTime(myBookings[0].start_time)} · {myBookings[0].room}</div>
                      </div>
                    </div>
                  );
                })()}
              </div>
              <div className="card" style={{maxWidth:600}}>
                <h3>Thesis information</h3>
                <div className="form-group">
                  <label>Thesis title</label>
                  <input type="text" placeholder="Enter your thesis title" value={thesisInfo.title} onChange={e => setThesisInfo({...thesisInfo,title:e.target.value})}/>
                </div>
                <div className="form-group">
                  <label>Supervisor</label>
                  <select value={thesisInfo.supervisor} onChange={e => setThesisInfo({...thesisInfo,supervisor:e.target.value})}>
                    <option value="">Select supervisor</option>
                    {supervisors.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Abstract / description</label>
                  <textarea placeholder="Brief description of your thesis..." value={thesisInfo.description} onChange={e => setThesisInfo({...thesisInfo,description:e.target.value})} style={{width:'100%',padding:'11px 14px',background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:8,fontSize:14,color:'var(--text)',fontFamily:'inherit',outline:'none',resize:'vertical',minHeight:120}}/>
                </div>
                <button className="btn-primary" onClick={() => { localStorage.setItem('thesisInfo', JSON.stringify(thesisInfo)); setMessage('Thesis info saved!'); setTimeout(() => setMessage(''), 3000); }}>Save information</button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile Bottom Nav */}
<div className="mobile-bottom-nav" style={{
  position:'fixed', bottom:0, left:0, right:0, zIndex:50,
  background:'rgba(10,10,11,0.85)',
  backdropFilter:'blur(30px)',
  WebkitBackdropFilter:'blur(30px)',
  borderTop:'1px solid rgba(29,158,117,0.15)',
  padding:'8px 12px 20px',
  gap:4,
  display:'none',
  boxShadow:'0 -8px 32px rgba(29,158,117,0.08)',
}}>
  <div style={{
    position:'absolute', top:-1, left:0, right:0, height:1,
    background:'linear-gradient(90deg, transparent 0%, #1D9E75 50%, transparent 100%)',
    animation:'shimmer 2s ease-in-out infinite',
    opacity:0.8,
  }}/>
  <style>{`
    @keyframes ripple {
      0% { transform: scale(0); opacity: 0.6; }
      100% { transform: scale(4); opacity: 0; }
    }
    .bottom-tab { position: relative; overflow: hidden; }
    .bottom-tab .ripple-circle {
      position: absolute;
      width: 20px; height: 20px;
      border-radius: 50%;
      background: rgba(29,158,117,0.4);
      transform: scale(0);
      animation: ripple 0.6s ease-out forwards;
      pointer-events: none;
    }
  `}</style>
  {[
    {id:'slots', label:'Book', icon:'🗓️'},
    {id:'bookings', label:'Bookings', icon:'📋'},
    {id:'supervisors', label:'Supervisors', icon:'🎓'},
    {id:'thesis', label:'Thesis', icon:'📝'},
    {id:'notif', label:'Alerts', icon:'🔔'},
  ].map(tab => (
    <button key={tab.id}
      className="bottom-tab"
      onClick={(e) => {
        const btn = e.currentTarget;
        const circle = document.createElement('span');
        circle.className = 'ripple-circle';
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - 10;
        const y = e.clientY - rect.top - 10;
        circle.style.left = x + 'px';
        circle.style.top = y + 'px';
        btn.appendChild(circle);
        setTimeout(() => circle.remove(), 600);
        if (tab.id === 'notif') {
          setShowNotifications(true);
        } else {
          setActiveTab(tab.id);
        }
      }}
      style={{
        flex:1, display:'flex', flexDirection:'column', alignItems:'center',
        gap:4, padding:'6px 4px', background:'none', border:'none',
        cursor:'pointer', fontFamily:'inherit', position:'relative',
        transition:'all 0.2s ease',
      }}>
      <div style={{
        width:32, height:32, borderRadius:10, display:'flex',
        alignItems:'center', justifyContent:'center', fontSize:18,
        background: (activeTab===tab.id && tab.id!=='notif') ? 'rgba(29,158,117,0.15)' : 'transparent',
        boxShadow: (activeTab===tab.id && tab.id!=='notif') ? '0 0 12px rgba(29,158,117,0.3)' : 'none',
        transition:'all 0.2s ease',
      }}>
        {tab.icon}
        {tab.id==='notif' && myBookings.length>0 && (
          <span style={{position:'absolute',top:2,right:'50%',marginRight:-20,background:'#f87171',borderRadius:'50%',width:14,height:14,fontSize:9,display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:600}}>
            {myBookings.length}
          </span>
        )}
      </div>
      <span style={{
        fontSize:10,
        color: activeTab===tab.id && tab.id!=='notif' ? '#1D9E75' : 'rgba(255,255,255,0.4)',
        fontWeight: activeTab===tab.id && tab.id!=='notif' ? 500 : 400,
        transition:'color 0.2s',
      }}>{tab.label}</span>
      {activeTab===tab.id && tab.id!=='notif' && (
        <div style={{position:'absolute',top:0,left:'50%',transform:'translateX(-50%)',width:20,height:2,background:'#1D9E75',borderRadius:99,boxShadow:'0 0 8px #1D9E75'}}/>
      )}
    </button>
  ))}
</div>

      {showNotifications && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,zIndex:100,background:'rgba(0,0,0,0.5)',backdropFilter:'blur(4px)'}} onClick={() => setShowNotifications(false)}>
          <div style={{position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:'90%',maxWidth:360,background:'rgba(20,20,24,0.99)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:14,padding:20,zIndex:101}} onClick={e => e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
              <div style={{fontSize:12,fontWeight:500,color:'rgba(255,255,255,0.4)',letterSpacing:'0.06em'}}>NOTIFICATIONS</div>
              <button onClick={() => setShowNotifications(false)} style={{background:'none',border:'none',color:'rgba(255,255,255,0.4)',cursor:'pointer',fontSize:16}}>✕</button>
            </div>
            {myBookings.length===0 && <div style={{fontSize:13,color:'rgba(255,255,255,0.3)',textAlign:'center',padding:'16px 0'}}>No notifications</div>}
            {myBookings.map(b => {
              const diffDays = Math.ceil((new Date(b.date) - new Date()) / (1000*60*60*24));
              return (
                <div key={b.id} style={{padding:'10px 12px',background:'rgba(29,158,117,0.06)',border:'1px solid rgba(29,158,117,0.15)',borderRadius:8,marginBottom:8}}>
                  <div style={{fontSize:13,color:'#f0f0ee',fontWeight:500}}>{diffDays===0?'🔴 Defense TODAY!':diffDays===1?'🟡 Defense TOMORROW!':diffDays>0?'🟢 In '+diffDays+' days':'✅ Completed'}</div>
                  <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',marginTop:4}}>{formatDate(b.date)} · {formatTime(b.start_time)}</div>
                  <div style={{fontSize:11,color:'#1D9E75',marginTop:2}}>{b.supervisor_name}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedSlot && (
        <div className="modal-overlay" onClick={() => setSelectedSlot(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Confirm booking</h2>
            <p style={{fontSize:13,color:'var(--text2)',marginBottom:16}}>
              {formatDate(selectedSlot.date)}<br/>
              {formatTime(selectedSlot.start_time)} - {formatTime(selectedSlot.end_time)} · {selectedSlot.room}<br/>
              <span style={{color:'#1D9E75'}}>{selectedSlot.supervisor_name}</span>
            </p>
            <div className="form-group">
              <label>Thesis title</label>
              <input type="text" placeholder="Enter your thesis title" value={thesisTitle} onChange={e => setThesisTitle(e.target.value)}/>
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
