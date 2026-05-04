import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('If this email exists, a reset link has been sent.');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Reset password</h1>
        <p className="auth-sub">Enter your email to receive a reset link</p>
        {message && <div className="success-msg">{message}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="you@g.bracu.ac.bd" value={email}
              onChange={e => setEmail(e.target.value)} required />
          </div>
          <button type="submit" className="btn-primary">Send reset link</button>
        </form>
        <p className="auth-link"><Link to="/login">Back to login</Link></p>
      </div>
    </div>
  );
}