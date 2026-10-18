import React, { useState } from 'react';
import { 
  ShieldCheck, 
  X, 
  CheckCircle2, 
  Mail, 
  ArrowRight, 
  AlertCircle,
  UserCheck,
  UserPlus,
  LogIn,
  MapPin
} from 'lucide-react';
import WhatsAppIcon from './WhatsAppIcon';
import OpticuraLogo from './OpticuraLogo';
import { OPTICURA_CONTACT } from '../data/opticuraProducts';
import { verifyDoctorLogin, registerNewDoctorUser } from '../utils/storage';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [contactInfo, setContactInfo] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [city, setCity] = useState('');
  const [showNameFieldOnLogin, setShowNameFieldOnLogin] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [verifiedMemberInfo, setVerifiedMemberInfo] = useState(null);

  if (!isOpen) return null;

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (authMode === 'login') {
      const result = verifyDoctorLogin(contactInfo, doctorName);
      if (result.success) {
        setVerifiedMemberInfo(result.member);
        setIsSuccess(true);
        setTimeout(() => {
          onLoginSuccess(result.member);
          setIsSuccess(false);
          onClose();
        }, 600);
      } else {
        if (result.isNewUserPrompt && !showNameFieldOnLogin) {
          setShowNameFieldOnLogin(true);
          setErrorMessage('Account not found with this Email/Phone. Please enter your Doctor Name to complete sign in.');
        } else {
          setErrorMessage(result.reason || 'Login failed. Please enter a valid Email address or Mobile number.');
        }
      }
    } else {
      // Register New User flow (Requires only Name + Email/Mobile)
      const result = registerNewDoctorUser({
        name: doctorName,
        contact: contactInfo,
        city: city || 'Maharashtra'
      });

      if (result.success) {
        setVerifiedMemberInfo(result.member);
        setIsSuccess(true);
        setTimeout(() => {
          onLoginSuccess(result.member);
          setIsSuccess(false);
          onClose();
        }, 600);
      } else {
        setErrorMessage(result.reason || 'Registration failed. Please provide your Name and Email/Mobile number.');
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
        {/* Close Button */}
        <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10 }}>
          <button className="modal-close-btn" onClick={onClose} id="btn-close-auth-modal">
            <X size={20} />
          </button>
        </div>

        <div className="auth-flow-card">
          {/* Header */}
          <div className="auth-header">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
              <OpticuraLogo variant="card" height={32} />
            </div>
            <div className="auth-seal-icon">
              <ShieldCheck size={30} />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
              Doctor Login
            </h2>
            <p style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '4px' }}>
              Eye Care Professional Network • Supported by Opticura
            </p>

            {/* Auth Mode Tabs (Log In vs New User) */}
            <div 
              style={{ 
                display: 'flex', 
                background: '#f1f5f9', 
                padding: '4px', 
                borderRadius: '10px', 
                marginTop: '16px',
                gap: '4px'
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setErrorMessage('');
                  setShowNameFieldOnLogin(false);
                }}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: authMode === 'login' ? '#ffffff' : 'transparent',
                  color: authMode === 'login' ? '#0f172a' : '#64748b',
                  fontWeight: authMode === 'login' ? 700 : 600,
                  fontSize: '0.86rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: authMode === 'login' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                  cursor: 'pointer'
                }}
                id="tab-auth-login"
              >
                <LogIn size={15} />
                <span>Doctor Login</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setErrorMessage('');
                }}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: authMode === 'register' ? '#ffffff' : 'transparent',
                  color: authMode === 'register' ? '#0f172a' : '#64748b',
                  fontWeight: authMode === 'register' ? 700 : 600,
                  fontSize: '0.86rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: authMode === 'register' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                  cursor: 'pointer'
                }}
                id="tab-auth-register"
              >
                <UserPlus size={15} />
                <span>New User</span>
              </button>
            </div>
          </div>

          {isSuccess ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px auto' }}>
                <CheckCircle2 size={34} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                Welcome, {verifiedMemberInfo?.name}!
              </h3>
              <p style={{ fontSize: '0.86rem', color: '#059669', fontWeight: 600, marginTop: '4px' }}>
                Logged in successfully • Direct platform access granted
              </p>
            </div>
          ) : (
            <form onSubmit={handleLoginSubmit} style={{ marginTop: '16px' }}>
              {errorMessage && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 12px', marginBottom: '14px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '0.82rem', color: '#b91c1c', lineHeight: 1.4 }}>
                    {errorMessage}
                  </span>
                </div>
              )}

              {/* REGISTER TAB: DOCTOR NAME */}
              {(authMode === 'register' || showNameFieldOnLogin) && (
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    <span>Doctor Full Name *</span>
                    <span style={{ color: '#0284c7', fontSize: '0.72rem', fontWeight: 600 }}>Prefix optional</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <UserCheck size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input 
                      type="text"
                      className="form-input"
                      style={{ paddingLeft: '40px', fontSize: '0.9rem', height: '42px', borderRadius: '8px', border: '1px solid #cbd5e1', width: '100%' }}
                      placeholder="e.g. Dr. Rajesh Deshmukh"
                      required
                      value={doctorName}
                      onChange={e => setDoctorName(e.target.value)}
                      id="input-auth-name"
                      autoFocus={authMode === 'register' || showNameFieldOnLogin}
                    />
                  </div>
                </div>
              )}

              {/* PRIMARY FIELD: EMAIL OR MOBILE NUMBER */}
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  <span>Email ID OR Mobile Number *</span>
                  <span style={{ color: '#0284c7', fontSize: '0.72rem', fontWeight: 600 }}>Required</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input 
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '40px', fontSize: '0.9rem', height: '42px', borderRadius: '8px', border: '1px solid #cbd5e1', width: '100%' }}
                    placeholder="e.g. 9822012345 or doctor@gmail.com"
                    required
                    value={contactInfo}
                    onChange={e => setContactInfo(e.target.value)}
                    id="input-auth-contact"
                    autoFocus={authMode === 'login' && !showNameFieldOnLogin}
                  />
                </div>
              </div>

              {/* REGISTER TAB: CITY (OPTIONAL) */}
              {authMode === 'register' && (
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px', display: 'block' }}>
                    <span>City / District (Optional)</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input 
                      type="text"
                      className="form-input"
                      style={{ paddingLeft: '40px', fontSize: '0.9rem', height: '42px', borderRadius: '8px', border: '1px solid #cbd5e1', width: '100%' }}
                      placeholder="e.g. Mumbai, Pune, Nagpur, Nashik"
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      id="input-auth-city"
                    />
                  </div>
                </div>
              )}

              {/* SUBMIT BUTTON */}
              <button 
                type="submit"
                id="btn-submit-auth"
                style={{
                  width: '100%',
                  marginTop: '8px',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: '#ffffff',
                  padding: '12px',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '0.94rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <span>{authMode === 'login' ? (showNameFieldOnLogin ? 'Save Name & Log In' : 'Doctor Login') : 'Register & Enter Platform'}</span>
                <ArrowRight size={17} />
              </button>

              {/* Need assistance / WhatsApp */}
              <div 
                style={{ 
                  marginTop: '18px', 
                  padding: '12px 14px', 
                  background: '#f8fafc', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '10px', 
                  textAlign: 'center' 
                }}
              >
                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 8px 0', lineHeight: 1.4 }}>
                  Need help logging in or accessing the platform? Contact <strong>{OPTICURA_CONTACT.drName}</strong> on WhatsApp.
                </p>
                <a
                  href={`https://wa.me/91${OPTICURA_CONTACT.whatsappNumber}?text=${encodeURIComponent('Hello Dr. Atul Kadhane, I need assistance logging into the MOS Connect platform supported by Opticura.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    background: '#25D366',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    boxShadow: '0 2px 6px rgba(37, 211, 102, 0.25)',
                    width: '100%'
                  }}
                  id="btn-auth-contact-dr-atul"
                >
                  <WhatsAppIcon size={15} />
                  <span>Chat on WhatsApp (+91 {OPTICURA_CONTACT.whatsappNumber})</span>
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
