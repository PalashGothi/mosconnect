import React, { useState } from 'react';
import { ShieldAlert, Lock, UserCheck, KeyRound, Eye, EyeOff, X, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import OpticuraLogo from './OpticuraLogo';

export default function AdminSecurityModal({ isOpen, onClose, onSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const cleanUser = String(username || '').trim().toUpperCase();
    const cleanPass = String(password || '');

    // Credentials required by user:
    // Username: YASH
    // Password: YAsh2027!
    if (cleanUser === 'YASH' && cleanPass === 'YAsh2027!') {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setUsername('');
        setPassword('');
        setError('');
        onSuccess();
      }, 500);
    } else {
      setError('Invalid Username or Password. Access to the Admin Panel is restricted.');
    }
  };

  const handleCancel = () => {
    setError('');
    setUsername('');
    setPassword('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleCancel}>
      <div 
        className="modal-card" 
        style={{ 
          maxWidth: '440px',
          border: '1.5px solid #0284c7',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(2, 132, 199, 0.15)'
        }} 
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10 }}>
          <button 
            className="modal-close-btn" 
            onClick={handleCancel}
            id="btn-close-admin-security-modal"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="auth-flow-card" style={{ padding: '24px 20px 20px 20px' }}>
          {/* Header */}
          <div className="auth-header" style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
              <OpticuraLogo variant="card" height={30} />
            </div>

            <div 
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0f172a 0%, #0369a1 100%)',
                color: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px auto',
                boxShadow: '0 8px 20px rgba(2, 132, 199, 0.3)'
              }}
            >
              <ShieldAlert size={30} />
            </div>

            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
              Admin Panel Security Check
            </h2>
            <p style={{ fontSize: '0.84rem', color: '#64748b', lineHeight: 1.45, margin: 0 }}>
              Second-layer verification required. Please enter administrative credentials to access the moderation console.
            </p>
          </div>

          {isSuccess ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div 
                style={{ 
                  width: '60px', 
                  height: '60px', 
                  borderRadius: '50%', 
                  background: '#ecfdf5', 
                  color: '#10b981', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  margin: '0 auto 14px auto' 
                }}
              >
                <CheckCircle2 size={36} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                Access Authorized
              </h3>
              <p style={{ fontSize: '0.86rem', color: '#059669', fontWeight: 600, marginTop: '4px' }}>
                Opening MOS Admin Panel...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div 
                  style={{ 
                    background: '#fef2f2', 
                    border: '1px solid #fecaca', 
                    borderRadius: '8px', 
                    padding: '12px 14px', 
                    marginBottom: '16px', 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: '10px' 
                  }}
                  id="admin-security-error-banner"
                >
                  <AlertCircle size={18} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '0.84rem', color: '#b91c1c', lineHeight: 1.4 }}>
                    {error}
                  </span>
                </div>
              )}

              {/* USERNAME FIELD */}
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.84rem', color: '#334155', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Admin Username *</span>
                  <span style={{ color: '#0284c7', fontSize: '0.74rem', fontWeight: 600 }}>Security Layer 2</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <UserCheck 
                    size={18} 
                    style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} 
                  />
                  <input 
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '42px', fontSize: '0.92rem' }}
                    placeholder="Enter admin username"
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    id="input-admin-sec-username"
                    autoFocus
                  />
                </div>
              </div>

              {/* PASSWORD FIELD */}
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.84rem', color: '#334155' }}>
                  <span>Admin Password *</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <KeyRound 
                    size={18} 
                    style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} 
                  />
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    style={{ paddingLeft: '42px', paddingRight: '42px', fontSize: '0.92rem' }}
                    placeholder="Enter admin password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    id="input-admin-sec-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title={showPassword ? 'Hide password' : 'Show password'}
                    id="btn-toggle-admin-sec-password"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn-pluckcard-call"
                  style={{ flex: 1, padding: '12px', borderRadius: '10px', fontSize: '0.88rem' }}
                  id="btn-admin-sec-cancel"
                >
                  Cancel
                </button>

                <button 
                  type="submit"
                  id="btn-admin-sec-submit"
                  style={{
                    flex: 2,
                    background: 'linear-gradient(135deg, #0284c7 0%, #0f172a 100%)',
                    color: '#ffffff',
                    padding: '12px',
                    borderRadius: '10px',
                    fontWeight: 800,
                    fontSize: '0.92rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
                    cursor: 'pointer',
                    border: 'none'
                  }}
                >
                  <Lock size={16} />
                  <span>Unlock Admin Panel</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
