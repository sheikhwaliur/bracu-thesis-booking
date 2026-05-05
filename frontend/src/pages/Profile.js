import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Profile() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [form, setForm] = useState({
    name: user.name || '',
    department: user.department || 'CSE',
  });
  const [message, setMessage] = useState('');
  const [avatar, setAvatar] = useState(localStorage.getItem('avatar') || '');

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatar(ev.target.result);
      localStorage.setItem('avatar', ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const updated = { ...user, ...form };
    localStorage.setItem('user', JSON.stringify(updated));
    setMessage('Profile updated!');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div style={{minHeight:'100vh', background:'#0a0a0b', display:'flex', alignItems:'center', justifyContent:'center', padding:24, position:'relative', overflow:'hidden'}}>
      <div style={{position:'fixed', top:'-20%', left:'-10%', width:600, height:600, background:'radial-gradient(circle,rgba(29,158,117,0.07) 0%,transparent 70%)', borderRadius:'50%', pointerEvents:'none', animation:'float1 8s ease-in-out infinite'}}/>
      <div style={{position:'fixed', bottom:'-20%', right:'-10%', width:500, height:500, background:'radial-gradient(circle,rgba(29,158,117,0.05) 0%,transparent 70%)', borderRadius:'50%', pointerEvents:'none', animation:'float2 10s ease-in-out infinite'}}/>
      <style>{`
        @keyframes float1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(30px,-30px) scale(1.05)} 66%{transform:translate(-20px,20px) scale(0.95)} }
        @keyframes float2 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-40px,20px) scale(1.08)} 66%{transform:translate(20px,-30px) scale(0.97)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .prof-input { width:100%; padding:11px 14px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:8px; font-size:14px; color:#f0f0ee; font-family:inherit; outline:none; transition:border-color 0.2s; }
        .prof-input:focus { border-color:#1D9E75; }
      `}</style>

      <div style={{width:'100%', maxWidth:480, animation:'fadeUp 0.6s ease both', position:'relative', zIndex:1}}>
        <Link to="/dashboard" style={{display:'inline-flex', alignItems:'center', gap:6, fontSize:13, color:'rgba(255,255,255,0.4)', marginBottom:24, textDecoration:'none'}}>
          ← Back to dashboard
        </Link>

        <div style={{background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:20, padding:'36px 32px', backdropFilter:'blur(20px)'}}>
          <div style={{fontSize:10, letterSpacing:'0.18em', textTransform:'uppercase', color:'#1D9E75', fontWeight:500, marginBottom:20}}>BRAC University</div>
          <div style={{fontSize:22, fontWeight:500, color:'#f0f0ee', marginBottom:24}}>My Profile</div>

          {message && <div style={{background:'rgba(29,158,117,0.08)', border:'1px solid rgba(29,158,117,0.2)', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#1D9E75', marginBottom:16}}>{message}</div>}

          {/* Avatar */}
          <div style={{display:'flex', alignItems:'center', gap:16, marginBottom:24}}>
            <div style={{width:72, height:72, borderRadius:'50%', background:'rgba(29,158,117,0.1)', border:'2px solid rgba(29,158,117,0.3)', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, color:'#1D9E75', flexShrink:0}}>
              {avatar ? <img src={avatar} alt="avatar" style={{width:'100%', height:'100%', objectFit:'cover'}}/> : user.name?.charAt(0)}
            </div>
            <div>
              <div style={{fontSize:14, fontWeight:500, color:'#f0f0ee'}}>{user.name}</div>
              <div style={{fontSize:12, color:'rgba(255,255,255,0.4)', marginTop:2}}>{user.student_id} · {user.role}</div>
              <label style={{display:'inline-block', marginTop:8, fontSize:12, color:'#1D9E75', cursor:'pointer', border:'1px solid rgba(29,158,117,0.3)', borderRadius:6, padding:'4px 10px'}}>
                Upload photo
                <input type="file" accept="image/*" onChange={handlePhotoChange} style={{display:'none'}}/>
              </label>
            </div>
          </div>

          <div style={{marginBottom:14}}>
            <label style={{display:'block', fontSize:11, fontWeight:500, color:'rgba(255,255,255,0.4)', marginBottom:6, letterSpacing:'0.05em'}}>FULL NAME</label>
            <input className="prof-input" type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}/>
          </div>

          <div style={{marginBottom:14}}>
            <label style={{display:'block', fontSize:11, fontWeight:500, color:'rgba(255,255,255,0.4)', marginBottom:6, letterSpacing:'0.05em'}}>EMAIL</label>
            <input className="prof-input" type="email" value={user.email || ''} disabled style={{opacity:0.5}}/>
          </div>

          <div style={{marginBottom:14}}>
            <label style={{display:'block', fontSize:11, fontWeight:500, color:'rgba(255,255,255,0.4)', marginBottom:6, letterSpacing:'0.05em'}}>STUDENT ID</label>
            <input className="prof-input" value={user.student_id || ''} disabled style={{opacity:0.5}}/>
          </div>

          <div style={{marginBottom:20}}>
            <label style={{display:'block', fontSize:11, fontWeight:500, color:'rgba(255,255,255,0.4)', marginBottom:6, letterSpacing:'0.05em'}}>DEPARTMENT</label>
            <select className="prof-input" value={form.department} onChange={e => setForm({...form, department: e.target.value})}>
              <option>CSE</option>
              <option>EEE</option>
              <option>BBA</option>
              <option>ECO</option>
              <option>ENH</option>
            </select>
          </div>

          <button onClick={handleSave} style={{width:'100%', padding:12, background:'#1D9E75', color:'white', border:'none', borderRadius:8, fontSize:14, fontWeight:500, fontFamily:'inherit', cursor:'pointer', transition:'background 0.2s'}}>
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}