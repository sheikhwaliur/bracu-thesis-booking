import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('https://bracu-thesis-booking.onrender.com/api/auth/login', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      window.location.href = res.data.user.role === 'admin' ? '/admin' : '/dashboard';
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed.');
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

      {/* Animated background blobs */}
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
        position: 'absolute', top: '40%', right: '20%',
        width: 300, height: 300,
        background: 'radial-gradient(circle, rgba(29,158,117,0.06) 0%, transparent 70%)',
        animation: 'float1 12s ease-in-out infinite reverse',
        borderRadius: '50%'
      }} />

      {/* Grid pattern overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
        pointerEvents: 'none'
      }} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@600&display=swap');
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
        @keyframes shimmer {
          0% { opacity: 0.5; }
          50% { opacity: 1; }
          100% { opacity: 0.5; }
        }
        .login-card { animation: fadeUp 0.7s ease both; }
        .login-input {
          width: 100%;
          padding: 11px 14px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          font-size: 14px;
          color: #f0f0ee;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .login-input::placeholder { color: #444; }
        .login-input:focus {
          border-color: #1D9E75;
          box-shadow: 0 0 0 3px rgba(29,158,117,0.15);
          background: rgba(29,158,117,0.04);
        }
        .login-btn {
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
          transition: background 0.2s, transform 0.1s, box-shadow 0.2s;
          margin-top: 8px;
        }
        .login-btn:hover {
          background: #157557;
          box-shadow: 0 4px 24px rgba(29,158,117,0.3);
        }
        .login-btn:active { transform: scale(0.98); }
        .feature-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: rgba(255,255,255,0.35);
          animation: fadeUp 0.6s ease both;
        }
        .feature-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: #1D9E75;
          animation: shimmer 2s ease infinite;
          flex-shrink: 0;
        }
      `}</style>

      {/* Card */}
      <div className="login-card" style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: 860,
        margin: '0 24px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 20,
        overflow: 'hidden',
        backdropFilter: 'blur(20px)',
      }}>

        {/* Left panel */}
        <div style={{
          padding: '52px 44px',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(29,158,117,0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <div style={{
            fontSize: 10,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#1D9E75',
            fontWeight: 500,
            marginBottom: 20,
            animation: 'fadeUp 0.5s ease both',
          }}>BRAC University</div>

          <div style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 38,
            lineHeight: 1.2,
            color: '#f0f0ee',
            marginBottom: 16,
            animation: 'fadeUp 0.6s ease 0.1s both',
          }}>
            Thesis Defense<br /><span style={{color:'#1D9E75'}}>Slot Booking</span>
          </div>

          <p style={{
            fontSize: 14,
            color: 'rgba(255,255,255,0.4)',
            lineHeight: 1.75,
            marginBottom: 36,
            animation: 'fadeUp 0.6s ease 0.2s both',
          }}>
            Schedule your thesis defense seamlessly. Pick a supervisor, choose a time, and confirm your booking in minutes.
          </p>

          <div style={{display:'flex', flexDirection:'column', gap:12}}>
            {['Real-time slot availability', 'Supervisor assignment', 'Instant confirmation email', 'CSE, EEE, BBA & more'].map((f, i) => (
              <div key={f} className="feature-item" style={{animationDelay: `${0.3 + i * 0.1}s`}}>
                <div className="feature-dot" style={{animationDelay: `${i * 0.5}s`}} />
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div style={{padding: '52px 44px', display:'flex', flexDirection:'column', justifyContent:'center'}}>
          <div style={{
            fontSize: 20,
            fontWeight: 500,
            color: '#f0f0ee',
            marginBottom: 6,
            fontFamily: 'DM Sans, sans-serif',
            animation: 'fadeUp 0.6s ease 0.2s both',
          }}>Welcome back</div>
          <div style={{
            fontSize: 13,
            color: 'rgba(255,255,255,0.35)',
            marginBottom: 28,
            animation: 'fadeUp 0.6s ease 0.25s both',
          }}>Sign in to your student account</div>

          {error && (
            <div style={{
              background:'rgba(220,50,50,0.08)',
              border:'1px solid rgba(220,50,50,0.2)',
              borderRadius:8, padding:'10px 14px',
              fontSize:13, color:'#f87171', marginBottom:16
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmit} style={{animation:'fadeUp 0.6s ease 0.3s both'}}>
            <div style={{marginBottom:14}}>
              <label style={{display:'block', fontSize:11, fontWeight:500, color:'rgba(255,255,255,0.4)', marginBottom:6, letterSpacing:'0.05em'}}>
                UNIVERSITY EMAIL
              </label>
              <input className="login-input" type="email" placeholder="you@g.bracu.ac.bd"
                value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            </div>
            <div style={{marginBottom:14}}>
              <label style={{display:'block', fontSize:11, fontWeight:500, color:'rgba(255,255,255,0.4)', marginBottom:6, letterSpacing:'0.05em'}}>
                PASSWORD
              </label>
              <input className="login-input" type="password" placeholder="••••••••"
                value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
            </div>
            <button type="submit" className="login-btn">Sign in</button>
          </form>

          <div style={{textAlign:'center', marginTop:20, fontSize:13, color:'rgba(255,255,255,0.3)', animation:'fadeUp 0.6s ease 0.4s both'}}>
            No account? <Link to="/register" style={{color:'#1D9E75', fontWeight:500}}>Register here</Link>
          </div>
          <div style={{textAlign:'center', marginTop:8, fontSize:13, color:'rgba(255,255,255,0.3)'}}>
            Forgot password? <Link to="/forgot-password" style={{color:'#1D9E75', fontWeight:500}}>Reset it</Link>
          </div>
        </div>
      </div>
    </div>
  );
}