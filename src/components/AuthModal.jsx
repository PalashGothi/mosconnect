import React, { useState } from 'react';
import { 
  ShieldCheck, 
  X, 
  CheckCircle2, 
  Mail, 
  ArrowRight, 
  AlertCircle,
  UserCheck
} from 'lucide-react';
import { verifyDoctorLogin } from '../utils/storage';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [membershipNo, setMembershipNo] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [verifiedMemberInfo, setVerifiedMemberInfo] = useState(null);

  if (!isOpen) return null;

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    const result = verifyDoctorLogin(membershipNo, doctorName, contactInfo);
    if (result.success) {
      setVerifiedMemberInfo(result.member);
      setIsSuccess(true);
      setTimeout(() => {
        onLoginSuccess(result.member);
        setIsSuccess(false);
        onClose();
      }, 700);
    } else {
      setErrorMessage(result.reason || 'Verification failed. Please ensure your MOS details are accurate.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
        {/* Close Button */}
        <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10 }}>
          <button className="modal-close-btn" onClick={onClose} id="btn-close-auth-modal">
            <X size={20} />
          </button>
        </div>

        <div className="auth-flow-card">
          {/* Header */}
          <div className="auth-header">
            <div className="auth-seal-icon">
              <ShieldCheck size={32} />
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a' }}>
              MOS Eye Doctor Login
            </h2>
            <p style={{ fontSize: '0.86rem', color: '#64748b', marginTop: '4px' }}>
              Direct credential verification for approved members of Maharashtra Ophthalmological Society
            </p>
          </div>

          {isSuccess ? (
            <div style={{ textAlign: 'center', padding: '28px 0' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                <CheckCircle2 size={38} />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
                Welcome, {verifiedMemberInfo?.name}!
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#059669', fontWeight: 600, marginTop: '6px' }}>
                {verifiedMemberInfo?.role === 'admin' ? 'Super Administrator Access Granted' : 'MOS Membership Verified Successfully'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleLoginSubmit}>
              {errorMessage && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px 14px', marginBottom: '16px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <AlertCircle size={18} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '0.84rem', color: '#b91c1c', lineHeight: 1.45 }}>
                    {errorMessage}
                  </span>
                </div>
              )}

              {/* FIELD 1: MOS MEMBERSHIP ID */}
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>MOS Membership ID *</span>
                  <span style={{ color: '#0284c7', fontSize: '0.75rem', fontWeight: 600 }}>Mandatory</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <ShieldCheck size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input 
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '42px' }}
                    placeholder="e.g. 3760, 3761, 03751A"
                    required
                    value={membershipNo}
                    onChange={e => setMembershipNo(e.target.value)}
                    id="input-login-mos-id"
                    autoFocus
                  />
                </div>
              </div>

              {/* FIELD 2: DOCTOR NAME */}
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Doctor Full Name *</span>
                  <span style={{ color: '#0284c7', fontSize: '0.75rem', fontWeight: 600 }}>Mandatory</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <UserCheck size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input 
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '42px' }}
                    placeholder="e.g. Dr. Aishwarya Patil"
                    required
                    value={doctorName}
                    onChange={e => setDoctorName(e.target.value)}
                    id="input-login-name"
                  />
                </div>
              </div>

              {/* FIELD 3: EMAIL OR PHONE NUMBER */}
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Registered Email OR Mobile Number *</span>
                  <span style={{ color: '#0284c7', fontSize: '0.75rem', fontWeight: 600 }}>At least one required</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input 
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '42px' }}
                    placeholder="e.g. doctor@email.com or 9822012345"
                    required
                    value={contactInfo}
                    onChange={e => setContactInfo(e.target.value)}
                    id="input-login-contact"
                  />
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <button 
                type="submit"
                id="btn-submit-verify-login"
                style={{
                  width: '100%',
                  marginTop: '12px',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: '#ffffff',
                  padding: '13px',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.96rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
                  cursor: 'pointer'
                }}
              >
                <span>Verify & Login (Direct Access)</span>
                <ArrowRight size={18} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
