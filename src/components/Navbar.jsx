import React, { useState } from 'react';
import { 
  Eye, 
  PlusCircle, 
  ShieldCheck, 
  Wrench, 
  ShoppingBag, 
  MessageSquareQuote, 
  User, 
  LogOut, 
  ChevronDown, 
  Activity,
  CheckCircle2,
  PhoneCall,
  Briefcase,
  Settings,
  Sparkles,
  Zap,
  Menu,
  X
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  currentDoctor, 
  onOpenAuth, 
  onLogout,
  onOpenPostAd,
  listingsCount = 0,
  wantedCount = 0,
  vendorsCount = 45,
  jobsCount = 0,
  pendingJobsCount = 0
}) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAdmin = currentDoctor?.role === 'admin';

  const handleMobileNavClick = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Official MOS Announcement Strip */}
      <div className="mos-top-bar">
        <div className="verified-label">
          <ShieldCheck size={14} color="#38bdf8" />
          <span>Official Peer-to-Peer Marketplace & Service Network | Maharashtra Ophthalmological Society</span>
        </div>
        <div className="active-members-count">
          <span className="pulse-dot"></span>
          <span><strong>3,745</strong> Verified Eye Doctors Active</span>
        </div>
      </div>

      {/* Main Sticky Navbar */}
      <nav className="navbar">
        {/* Brand */}
        <div className="nav-brand" onClick={() => setActiveTab('buy')}>
          <div className="brand-icon-wrapper">
            <Eye size={24} strokeWidth={2.5} />
          </div>
          <div className="brand-info">
            <h1>MOS <span>Connect</span></h1>
            <span className="brand-tagline">Equipment, Careers & Service Network</span>
          </div>
        </div>

        {/* Center Nav Links */}
        <div className="nav-links">
          <button 
            className={`nav-item ${activeTab === 'buy' ? 'active' : ''}`}
            onClick={() => setActiveTab('buy')}
            id="nav-tab-buy"
          >
            <ShoppingBag size={18} />
            <span>Buy Equipment</span>
            {listingsCount > 0 && <span className="nav-badge">{listingsCount}</span>}
          </button>

          <button 
            className={`nav-item ${activeTab === 'wanted' ? 'active' : ''}`}
            onClick={() => setActiveTab('wanted')}
            id="nav-tab-wanted"
          >
            <MessageSquareQuote size={18} />
            <span>Wanted Board</span>
            {wantedCount > 0 && <span className="nav-badge verified-badge">{wantedCount}</span>}
          </button>

          <button 
            className={`nav-item ${activeTab === 'sell' ? 'active' : ''}`}
            onClick={() => setActiveTab('sell')}
            id="nav-tab-sell"
          >
            <PlusCircle size={18} />
            <span>Sell Equipment</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'jobs' ? 'active' : ''}`}
            onClick={() => setActiveTab('jobs')}
            id="nav-tab-jobs"
          >
            <Briefcase size={18} />
            <span>Jobs</span>
            {jobsCount > 0 && <span className="nav-badge" style={{ background: '#0284c7' }}>{jobsCount}</span>}
          </button>

          <button 
            className={`nav-item ${activeTab === 'vendors' ? 'active' : ''}`}
            onClick={() => setActiveTab('vendors')}
            id="nav-tab-vendors"
          >
            <Wrench size={18} />
            <span>Vendors & Technicians</span>
            <span className="nav-badge" style={{ background: '#0d9488' }}>{vendorsCount}+</span>
          </button>

          {/* ADMIN PANEL TAB (Visible for Admin) */}
          {isAdmin && (
            <button 
              className={`nav-item ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => setActiveTab('admin')}
              id="nav-tab-admin"
              style={{
                background: activeTab === 'admin' ? '#0f172a' : '#f8fafc',
                color: activeTab === 'admin' ? '#ffffff' : '#0f172a',
                border: '1px solid #cbd5e1'
              }}
            >
              <Settings size={18} color={activeTab === 'admin' ? '#38bdf8' : '#0284c7'} />
              <span>Admin Panel</span>
              {pendingJobsCount > 0 && (
                <span className="nav-badge" style={{ background: '#f59e0b', color: '#ffffff' }}>
                  {pendingJobsCount}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Right Nav Actions */}
        <div className="nav-actions">
          <button 
            className="btn-post-ad"
            onClick={onOpenPostAd}
            id="btn-post-ad-header"
          >
            <PlusCircle size={17} />
            <span>Post Equipment Ad</span>
          </button>

          {currentDoctor ? (
            <div style={{ position: 'relative' }}>
              <button 
                className="user-profile-btn"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                id="btn-user-profile-menu"
                style={isAdmin ? { borderColor: '#38bdf8', background: '#f0f9ff' } : {}}
              >
                <div 
                  className="avatar-circle"
                  style={isAdmin ? { background: 'linear-gradient(135deg, #0284c7 0%, #0f172a 100%)' } : {}}
                >
                  {isAdmin ? <ShieldCheck size={18} /> : (currentDoctor.name ? currentDoctor.name.replace('Dr.', '').trim().charAt(0) : 'D')}
                </div>
                <div className="doctor-info-preview">
                  <div className="doctor-name" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span>{currentDoctor.name || 'Doctor'}</span>
                    {isAdmin && (
                      <span style={{ fontSize: '0.65rem', background: '#0284c7', color: '#ffffff', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>
                        ADMIN
                      </span>
                    )}
                  </div>
                  <div className="doctor-mos-tag">
                    <CheckCircle2 size={11} />
                    <span>MOS #{currentDoctor.membershipNo}</span>
                  </div>
                </div>
                <ChevronDown size={14} color="#64748b" />
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div 
                  style={{
                    position: 'absolute',
                    top: '110%',
                    right: 0,
                    width: '280px',
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 10px 30px rgba(15, 23, 42, 0.15)',
                    padding: '12px',
                    zIndex: 200,
                    animation: 'scaleUp 0.15s ease'
                  }}
                >
                  <div style={{ padding: '8px 10px 12px 10px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a' }}>
                      {currentDoctor.name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#0d9488', fontWeight: '600', marginTop: '2px' }}>
                      {currentDoctor.membershipType || 'Life Membership'} (MOS #{currentDoctor.membershipNo})
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                      📍 {currentDoctor.city || 'Maharashtra'}
                    </div>
                  </div>

                  <div style={{ padding: '6px 0' }}>
                    {isAdmin && (
                      <button 
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '9px 12px',
                          fontSize: '0.85rem',
                          fontWeight: '700',
                          color: '#0284c7',
                          background: '#f0f9ff',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '4px'
                        }}
                        onClick={() => {
                          setActiveTab('admin');
                          setShowProfileMenu(false);
                        }}
                        id="dropdown-open-admin-panel"
                      >
                        <Settings size={16} color="#0284c7" />
                        <span>Admin Console & Approvals</span>
                      </button>
                    )}

                    <button 
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '9px 12px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        color: '#334155',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onClick={() => {
                        setActiveTab('sell');
                        setShowProfileMenu(false);
                      }}
                    >
                      <PlusCircle size={16} color="#0284c7" />
                      <span>My Equipment Listings</span>
                    </button>

                    <button 
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '9px 12px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        color: '#334155',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onClick={() => {
                        setActiveTab('jobs');
                        setShowProfileMenu(false);
                      }}
                    >
                      <Briefcase size={16} color="#0d9488" />
                      <span>My Posted Job Vacancies</span>
                    </button>

                    <button 
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '9px 12px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        color: '#334155',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onClick={() => {
                        setShowProfileMenu(false);
                        onOpenAuth();
                      }}
                      id="dropdown-switch-doctor"
                    >
                      <User size={16} color="#10b981" />
                      <span>Switch Verified Doctor</span>
                    </button>
                  </div>

                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '6px' }}>
                    <button 
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '9px 12px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        color: '#e11d48',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onClick={() => {
                        setShowProfileMenu(false);
                        onLogout();
                      }}
                      id="dropdown-logout"
                    >
                      <LogOut size={16} />
                      <span>Log Out Session</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button 
              className="btn-login-gate"
              onClick={onOpenAuth}
              id="btn-login-gate-header"
            >
              <ShieldCheck size={18} color="#38bdf8" />
              <span>Doctor Login (MOS)</span>
            </button>
          )}

          {/* Mobile Menu Hamburger Toggle */}
          <button 
            className="mobile-hamburger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            id="btn-mobile-menu-toggle"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Slide-Down Drawer Menu */}
        {mobileMenuOpen && (
          <div className="mobile-drawer-menu" id="mobile-drawer-menu">
            <div className="mobile-drawer-links">
              <button 
                className={`mobile-drawer-item ${activeTab === 'buy' ? 'active' : ''}`}
                onClick={() => handleMobileNavClick('buy')}
              >
                <div className="mobile-drawer-item-left">
                  <ShoppingBag size={20} />
                  <span>Buy Equipment</span>
                </div>
                {listingsCount > 0 && <span className="nav-badge">{listingsCount}</span>}
              </button>

              <button 
                className={`mobile-drawer-item ${activeTab === 'wanted' ? 'active' : ''}`}
                onClick={() => handleMobileNavClick('wanted')}
              >
                <div className="mobile-drawer-item-left">
                  <MessageSquareQuote size={20} />
                  <span>Wanted Board</span>
                </div>
                {wantedCount > 0 && <span className="nav-badge verified-badge">{wantedCount}</span>}
              </button>

              <button 
                className={`mobile-drawer-item ${activeTab === 'sell' ? 'active' : ''}`}
                onClick={() => handleMobileNavClick('sell')}
              >
                <div className="mobile-drawer-item-left">
                  <PlusCircle size={20} />
                  <span>Sell Equipment</span>
                </div>
              </button>

              <button 
                className={`mobile-drawer-item ${activeTab === 'jobs' ? 'active' : ''}`}
                onClick={() => handleMobileNavClick('jobs')}
              >
                <div className="mobile-drawer-item-left">
                  <Briefcase size={20} />
                  <span>Jobs & Fellowships</span>
                </div>
                {jobsCount > 0 && <span className="nav-badge" style={{ background: '#0284c7' }}>{jobsCount}</span>}
              </button>

              <button 
                className={`mobile-drawer-item ${activeTab === 'vendors' ? 'active' : ''}`}
                onClick={() => handleMobileNavClick('vendors')}
              >
                <div className="mobile-drawer-item-left">
                  <Wrench size={20} />
                  <span>Vendors & Technicians</span>
                </div>
                <span className="nav-badge" style={{ background: '#0d9488' }}>{vendorsCount}+</span>
              </button>

              {isAdmin && (
                <button 
                  className={`mobile-drawer-item admin-drawer-item ${activeTab === 'admin' ? 'active' : ''}`}
                  onClick={() => handleMobileNavClick('admin')}
                >
                  <div className="mobile-drawer-item-left">
                    <Settings size={20} color="#38bdf8" />
                    <span>Admin Panel</span>
                  </div>
                  {pendingJobsCount > 0 && (
                    <span className="nav-badge" style={{ background: '#f59e0b', color: '#ffffff' }}>
                      {pendingJobsCount}
                    </span>
                  )}
                </button>
              )}
            </div>

            {/* Mobile Drawer Auth Strip */}
            <div className="mobile-drawer-footer">
              {currentDoctor ? (
                <div className="mobile-drawer-user-info">
                  <div className="mobile-drawer-user-row">
                    <div className="avatar-circle" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
                      {isAdmin ? <ShieldCheck size={16} /> : (currentDoctor.name ? currentDoctor.name.replace('Dr.', '').trim().charAt(0) : 'D')}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>{currentDoctor.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>MOS #{currentDoctor.membershipNo}</div>
                    </div>
                  </div>
                  <button 
                    className="btn-mobile-logout"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onLogout();
                    }}
                  >
                    <LogOut size={16} />
                    <span>Log Out</span>
                  </button>
                </div>
              ) : (
                <button 
                  className="btn-mobile-login"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth();
                  }}
                >
                  <ShieldCheck size={18} color="#38bdf8" />
                  <span>Doctor Login (MOS ID)</span>
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Floating Sticky Mobile Bottom Navigation Bar */}
      <div className="mobile-bottom-bar" id="mobile-bottom-bar">
        <button 
          className={`bottom-nav-item ${activeTab === 'buy' ? 'active' : ''}`}
          onClick={() => handleMobileNavClick('buy')}
          aria-label="Buy Equipment"
        >
          <ShoppingBag size={20} />
          <span>Buy</span>
          {listingsCount > 0 && <span className="bottom-nav-dot"></span>}
        </button>

        <button 
          className={`bottom-nav-item ${activeTab === 'wanted' ? 'active' : ''}`}
          onClick={() => handleMobileNavClick('wanted')}
          aria-label="Wanted Board"
        >
          <MessageSquareQuote size={20} />
          <span>Wanted</span>
          {wantedCount > 0 && <span className="bottom-nav-dot"></span>}
        </button>

        <button 
          className={`bottom-nav-item bottom-sell-accent ${activeTab === 'sell' ? 'active' : ''}`}
          onClick={() => handleMobileNavClick('sell')}
          aria-label="Sell Equipment"
        >
          <div className="sell-icon-bubble">
            <PlusCircle size={22} />
          </div>
          <span>Sell</span>
        </button>

        <button 
          className={`bottom-nav-item ${activeTab === 'jobs' ? 'active' : ''}`}
          onClick={() => handleMobileNavClick('jobs')}
          aria-label="Jobs"
        >
          <Briefcase size={20} />
          <span>Jobs</span>
          {jobsCount > 0 && <span className="bottom-nav-dot"></span>}
        </button>

        <button 
          className={`bottom-nav-item ${activeTab === 'vendors' || activeTab === 'admin' ? 'active' : ''}`}
          onClick={() => handleMobileNavClick(isAdmin ? 'admin' : 'vendors')}
          aria-label={isAdmin ? 'Admin' : 'Vendors'}
        >
          {isAdmin ? <Settings size={20} /> : <Wrench size={20} />}
          <span>{isAdmin ? 'Admin' : 'Vendors'}</span>
        </button>
      </div>
    </>
  );
}
