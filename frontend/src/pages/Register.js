import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Register() {
  const [form, setForm] = useState({ name: '', student_id: '', email: '', password: '', department: 'CSE' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post('http://localhost:8080/api/auth/register', form);
      setSuccess('Registered! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0a0a0b',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute', top: '-20%', left: '-10%',
        width: 600, height: 600,
        background: 'radial-gradient(circle, rgba(29,158,117,0.12) 0%, transparent 70%)',
        animation: 'float1 8s ease-in-out infinite',
        borderRadius: '50%'
      }} />
      <div style={{
        position: 'absolute', bottom: '-20%', right: '-10%',
        width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(29,158,117,0.08) 0%, transparent 70%)',
        animation: 'float2 10s ease-in-out infinite',
        borderRadius: '50%'
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
        pointerEvents: 'none'
      }} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');
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
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .reg-input {
          width: 100%;
          padding: 11px 14px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          font-size: 14px;
          color: #f0f0ee;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .reg-input::placeholder { color: #444; }
        .reg-input:focus {
          border-color: #1D9E75;
          box-shadow: 0 0 0 3px rgba(29,158,117,0.15);
        }
        .reg-btn {
          width: 100%;
          padding: 12px;
          background: #1D9E75;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          margin-top: 8px;
          transition: background 0.2s, transform 0.1s, box-shadow 0.2s;
        }
        .reg-btn:hover { background: #157557; box-shadow: 0 4px 24px rgba(29,158,117,0.3); }
        .reg-btn:active { transform: scale(0.98); }
      `}</style>

      <div style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: 460,
        margin: '0 24px',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 20,
        padding: '44px 40px',
        backdropFilter: 'blur(20px)',
        animation: 'fadeUp 0.7s ease both',
      }}>
        <div style={{fontSize:10, letterSpacing:'0.18em', textTransform:'uppercase', color:'#1D9E75', fontWeight:500, marginBottom:16}}>
          BRAC University
        </div>
        <div style={{fontSize:22, fontWeight:500, color:'#f0f0ee', marginBottom:6, fontFamily:'DM Sans, sans-serif'}}>
          Create account
        </div>
        <div style={{fontSize:13, color:'rgba(255,255,255,0.35)', marginBottom:28}}>
          Register to book your thesis defense slot
        </div>

        {error && <div style={{background:'rgba(220,50,50,0.08)', border:'1px solid rgba(220,50,50,0.2)', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#f87171', marginBottom:16}}>{error}</div>}
        {success && <div style={{background:'rgba(29,158,117,0.08)', border:'1px solid rgba(29,158,117,0.2)', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#1D9E75', marginBottom:16}}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12}}>
            <div>
              <label style={{display:'block', fontSize:11, fontWeight:500, color:'rgba(255,255,255,0.4)', marginBottom:6, letterSpacing:'0.05em'}}>FULL NAME</label>
              <input className="reg-input" type="text" placeholder="Rahul Islam" value={form.name}
                onChange={e => setForm({...form, name: e.target.value})} required />
            </div>
            <div>
              <label style={{display:'block', fontSize:11, fontWeight:500, color:'rgba(255,255,255,0.4)', marginBottom:6, letterSpacing:'0.05em'}}>STUDENT ID</label>
              <input className="reg-input" type="text" placeholder="20301234" value={form.student_id}
                onChange={e => setForm({...form, student_id: e.target.value})} required />
            </div>
          </div>
          <div style={{marginBottom:12}}>
            <label style={{display:'block', fontSize:11, fontWeight:500, color:'rgba(255,255,255,0.4)', marginBottom:6, letterSpacing:'0.05em'}}>UNIVERSITY EMAIL</label>
            <input className="reg-input" type="email" placeholder="you@g.bracu.ac.bd" value={form.email}
              onChange={e => setForm({...form, email: e.target.value})} required />
          </div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12}}>
            <div>
              <label style={{display:'block', fontSize:11, fontWeight:500, color:'rgba(255,255,255,0.4)', marginBottom:6, letterSpacing:'0.05em'}}>DEPARTMENT</label>
              <select className="reg-input" value={form.department} onChange={e => setForm({...form, department: e.target.value})}>
                <option>CSE</option>
                <option>EEE</option>
                <option>BBA</option>
                <option>ECO</option>
                <option>ENH</option>
              </select>
            </div>
            <div>
              <label style={{display:'block', fontSize:11, fontWeight:500, color:'rgba(255,255,255,0.4)', marginBottom:6, letterSpacing:'0.05em'}}>PASSWORD</label>
              <input className="reg-input" type="password" placeholder="••••••••" value={form.password}
                onChange={e => setForm({...form, password: e.target.value})} required />
            </div>
          </div>
          <button type="submit" className="reg-btn">Create account</button>
        </form>

        <div style={{textAlign:'center', marginTop:20, fontSize:13, color:'rgba(255,255,255,0.3)'}}>
          Already have an account? <Link to="/login" style={{color:'#1D9E75', fontWeight:500}}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}