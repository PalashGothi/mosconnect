import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import HomePage from './pages/HomePage';
import BuyPage from './pages/BuyPage';
import SellPage from './pages/SellPage';
import VendorsPage from './pages/VendorsPage';
import JobsPage from './pages/JobsPage';
import AdminPage from './pages/AdminPage';
import AdminSecurityModal from './components/AdminSecurityModal';
import CommonChatBoard from './components/CommonChatBoard';
import OpticuraLogo from './components/OpticuraLogo';
import { 
  getListings, 
  saveListing, 
  deleteListing, 
  getWantedPosts, 
  saveWantedPost, 
  addReplyToPost, 
  getJobs,
  saveJob,
  updateJobStatus,
  deleteJob,
  getMembers,
  saveMember,
  updateMember,
  deleteMember,
  addMembersBulk,
  getVendors,
  saveVendor,
  deleteVendor,
  getCurrentDoctor, 
  setCurrentDoctor, 
  getSavedItems, 
  toggleSaveItem,
  applyCloudRecord
} from './utils/storage';
import { initCloudSync, forceSyncNow } from './services/cloudSync';
import { 
  Eye, 
  ShieldCheck, 
  PhoneCall, 
  Mail, 
  Heart, 
  Activity,
  CheckCircle2,
  Briefcase,
  Lock
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'buy', 'wanted', 'sell', 'jobs', 'vendors', 'admin'
  const [currentDoctor, setCurrentDoctorState] = useState(null);
  const [listings, setListings] = useState([]);
  const [wantedPosts, setWantedPosts] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [members, setMembers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(() => {
    try {
      return sessionStorage.getItem('mos_admin_unlocked') === 'true';
    } catch (e) {
      return false;
    }
  });
  const [isAdminSecurityOpen, setIsAdminSecurityOpen] = useState(false);

  const refreshAllState = () => {
    setListings(getListings());
    setWantedPosts(getWantedPosts());
    setJobs(getJobs());
    setMembers(getMembers());
    setVendors(getVendors());
    setSavedItems(getSavedItems());
  };

  // Initialize data on mount
  useEffect(() => {
    setCurrentDoctorState(getCurrentDoctor());
    refreshAllState();

    // Connect to real-time cloud sync for seamless cross-device live updates
    let cleanupFn = null;
    initCloudSync((cloudRecord) => {
      applyCloudRecord(cloudRecord);
      refreshAllState();
    }).then(cleanup => {
      cleanupFn = cleanup;
    }).catch(err => {
      console.warn('Cloud sync init error', err);
    });

    // Cross-tab and window local storage sync
    const handleStorageChange = (e) => {
      if (e.key === 'mos_eyeequip_current_doctor') {
        setCurrentDoctorState(getCurrentDoctor());
      }
      refreshAllState();
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      if (typeof cleanupFn === 'function') {
        cleanupFn();
      }
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Listing Handlers
  const handleAddListing = (newListing) => {
    const updated = saveListing(newListing);
    setListings(updated);
  };

  const handleDeleteListing = (id) => {
    if (window.confirm('Are you sure you want to delete this equipment listing?')) {
      const updated = deleteListing(id);
      setListings(updated);
    }
  };

  const handleUpdateStatus = (id, status) => {
    const item = listings.find(l => l.id === id);
    if (item) {
      const updatedItem = { ...item, status };
      const updated = saveListing(updatedItem);
      setListings(updated);
    }
  };

  const handleUpdateListing = (updatedListing) => {
    const updated = saveListing(updatedListing);
    setListings(updated);
  };

  // Jobs Handlers
  const handleAddJob = (newJob) => {
    const updated = saveJob(newJob);
    setJobs(updated);
  };

  const handleUpdateJobStatus = (jobId, status, adminName) => {
    const updated = updateJobStatus(jobId, status, adminName);
    setJobs(updated);
  };

  const handleDeleteJob = (jobId) => {
    if (window.confirm('Are you sure you want to delete this job posting?')) {
      const updated = deleteJob(jobId);
      setJobs(updated);
    }
  };

  // Member Management Handlers
  const handleAddMember = (newMember) => {
    const updated = saveMember(newMember);
    setMembers(updated);
  };

  const handleUpdateMember = (updatedMember, oldMembershipNo) => {
    const updated = updateMember(updatedMember, oldMembershipNo);
    setMembers(updated);
  };

  const handleDeleteMember = (membershipNo, name) => {
    const docName = name || `MOS #${membershipNo}`;
    if (window.confirm(`Are you sure you want to delete ${docName} from the registered members database? This action will sync across all devices.`)) {
      const updated = deleteMember(membershipNo);
      setMembers(updated);
    }
  };

  const handleBulkAddMembers = (membersList) => {
    const result = addMembersBulk(membersList);
    setMembers(result.updatedList);
    return result;
  };

  // Vendor Management Handlers
  const handleAddVendor = (newVendor) => {
    const updated = saveVendor(newVendor);
    setVendors(updated);
  };

  const handleDeleteVendor = (id) => {
    if (window.confirm('Are you sure you want to remove this vendor/technician directory entry?')) {
      const updated = deleteVendor(id);
      setVendors(updated);
    }
  };

  const handleUpdateVendor = (updatedVendor) => {
    const updated = saveVendor(updatedVendor);
    setVendors(updated);
  };

  // Wanted Board Handlers
  const handleAddWantedPost = (newPost) => {
    const updated = saveWantedPost(newPost);
    setWantedPosts(updated);
  };

  const handleAddWantedReply = (postId, reply) => {
    const updated = addReplyToPost(postId, reply);
    setWantedPosts(updated);
  };

  // Save Wishlist Handler
  const handleToggleSave = (id) => {
    const updated = toggleSaveItem(id);
    setSavedItems(updated);
  };

  // Auth Handlers
  const handleLoginSuccess = (doctor) => {
    setCurrentDoctor(doctor);
    setCurrentDoctorState(doctor);
    forceSyncNow((cloudRecord) => {
      applyCloudRecord(cloudRecord);
      refreshAllState();
    });
  };

  // Tab Navigation with Admin Panel 2nd Layer Protection
  const handleTabChange = (tab) => {
    if (tab === 'admin') {
      if (currentDoctor?.role !== 'admin') {
        return;
      }
      if (!isAdminUnlocked) {
        setIsAdminSecurityOpen(true);
        return;
      }
    }
    setActiveTab(tab);
  };

  const handleAdminSecuritySuccess = () => {
    setIsAdminUnlocked(true);
    try {
      sessionStorage.setItem('mos_admin_unlocked', 'true');
    } catch (e) {}
    setIsAdminSecurityOpen(false);
    setActiveTab('admin');
  };

  const handleAdminSecurityClose = () => {
    setIsAdminSecurityOpen(false);
  };

  const handleLockAdminPanel = () => {
    setIsAdminUnlocked(false);
    try {
      sessionStorage.removeItem('mos_admin_unlocked');
    } catch (e) {}
    setActiveTab('buy');
  };

  const handleLogout = () => {
    setCurrentDoctor(null);
    setCurrentDoctorState(null);
    setIsAdminUnlocked(false);
    try {
      sessionStorage.removeItem('mos_admin_unlocked');
    } catch (e) {}
    if (activeTab === 'admin') {
      setActiveTab('buy');
    }
    forceSyncNow((cloudRecord) => {
      applyCloudRecord(cloudRecord);
      refreshAllState();
    });
  };

  const approvedJobsCount = jobs.filter(j => j.status === 'approved').length;
  const pendingJobsCount = jobs.filter(j => j.status === 'pending').length;

  return (
    <div className="app-container">
      {/* Sticky Navigation Bar */}
      <Navbar 
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        currentDoctor={currentDoctor}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onOpenPostAd={() => handleTabChange('sell')}
        listingsCount={listings.length}
        wantedCount={wantedPosts.length}
        vendorsCount={vendors.length}
        jobsCount={approvedJobsCount}
        pendingJobsCount={pendingJobsCount}
      />

      {/* Main Page Routing */}
      <main className="main-content">
        {activeTab === 'home' && (
          <HomePage 
            onNavigateTab={(tab) => handleTabChange(tab)}
            onOpenAuth={() => setIsAuthOpen(true)}
            currentDoctor={currentDoctor}
            listingsCount={listings.length}
            vendorsCount={vendors.length}
            jobsCount={approvedJobsCount}
            wantedCount={wantedPosts.length}
          />
        )}

        {activeTab === 'buy' && (
          <BuyPage 
            listings={listings}
            savedItems={savedItems}
            onToggleSave={handleToggleSave}
            currentDoctor={currentDoctor}
            onOpenWantedBoard={() => handleTabChange('wanted')}
            onOpenPostAd={() => handleTabChange('sell')}
            onNavigateTab={(tab) => handleTabChange(tab)}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {activeTab === 'wanted' && (
          <CommonChatBoard 
            posts={wantedPosts}
            onAddPost={handleAddWantedPost}
            onAddReply={handleAddWantedReply}
            currentDoctor={currentDoctor}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {activeTab === 'sell' && (
          <SellPage 
            currentDoctor={currentDoctor}
            listings={listings}
            onAddListing={handleAddListing}
            onUpdateListing={handleUpdateListing}
            onDeleteListing={handleDeleteListing}
            onUpdateStatus={handleUpdateStatus}
            onOpenAuth={() => setIsAuthOpen(true)}
            onViewOnBuyPage={() => handleTabChange('buy')}
          />
        )}

        {activeTab === 'jobs' && (
          <JobsPage 
            jobs={jobs}
            currentDoctor={currentDoctor}
            onAddJob={handleAddJob}
            onUpdateJob={handleAddJob}
            onOpenAuth={() => setIsAuthOpen(true)}
            onOpenAdminPanel={() => handleTabChange('admin')}
          />
        )}

        {activeTab === 'vendors' && (
          <VendorsPage 
            vendors={vendors}
            currentDoctor={currentDoctor}
            onOpenAuth={() => setIsAuthOpen(true)}
            onOpenAdminPanel={() => handleTabChange('admin')}
          />
        )}

        {activeTab === 'admin' && currentDoctor?.role === 'admin' && (
          isAdminUnlocked ? (
            <AdminPage 
              currentDoctor={currentDoctor}
              jobs={jobs}
              members={members}
              vendors={vendors}
              listings={listings}
              onUpdateJobStatus={handleUpdateJobStatus}
              onDeleteJob={handleDeleteJob}
              onAddMember={handleAddMember}
              onUpdateMember={handleUpdateMember}
              onDeleteMember={handleDeleteMember}
              onBulkAddMembers={handleBulkAddMembers}
              onAddVendor={handleAddVendor}
              onDeleteVendor={handleDeleteVendor}
              onUpdateVendor={handleUpdateVendor}
              onLockAdminPanel={handleLockAdminPanel}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '90px 20px', minHeight: '65vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px', boxShadow: '0 8px 24px rgba(239, 68, 68, 0.2)' }}>
                <Lock size={36} />
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>Admin Panel Locked</h2>
              <p style={{ color: '#64748b', maxWidth: '440px', margin: '8px auto 24px auto', fontSize: '0.92rem', lineHeight: 1.5 }}>
                Second-layer administrator verification is required to access the moderation console.
              </p>
              <button 
                onClick={() => setIsAdminSecurityOpen(true)}
                style={{
                  background: 'linear-gradient(135deg, #0284c7 0%, #0f172a 100%)',
                  color: '#ffffff',
                  padding: '13px 28px',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.94rem',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)'
                }}
                id="btn-unlock-locked-admin"
              >
                <Lock size={16} />
                <span>Enter Admin Credentials to Unlock</span>
              </button>
            </div>
          )
        )}
      </main>

      {/* Doctor Verification / Auth Modal */}
      <AuthModal 
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Admin Panel 2nd-Layer Security Modal */}
      <AdminSecurityModal 
        isOpen={isAdminSecurityOpen}
        onClose={handleAdminSecurityClose}
        onSuccess={handleAdminSecuritySuccess}
      />

      {/* Professional Ophthalmology Platform Footer */}
      <footer className="app-footer">
        <div className="footer-inner">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ffffff', marginBottom: '12px' }}>
              <div className="brand-icon-wrapper" style={{ width: '36px', height: '36px' }}>
                <Eye size={20} />
              </div>
              <h3 style={{ fontSize: '1.25rem', color: '#ffffff' }}>MOS <span>Connect</span></h3>
            </div>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: '#94a3b8', maxWidth: '380px' }}>
              Equipment marketplace, career exchange, and verified service directory for eye care specialists across Maharashtra. Supported by Opticura — caring to cure.
            </p>
            <div style={{ marginTop: '14px' }}>
              <OpticuraLogo variant="card" height={28} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '14px', color: '#10b981', fontSize: '0.82rem', fontWeight: 600 }}>
              <ShieldCheck size={16} />
              <span>Verified MOS Member Authentication System</span>
            </div>
          </div>

          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', marginBottom: '14px', fontWeight: 700 }}>Quick Navigation</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.86rem' }}>
              <span style={{ cursor: 'pointer' }} onClick={() => setActiveTab('home')}>Home</span>
              <span style={{ cursor: 'pointer' }} onClick={() => setActiveTab('buy')}>Buy Equipment Pluckcards</span>
              <span style={{ cursor: 'pointer' }} onClick={() => setActiveTab('wanted')}>Post Your Requirement Here</span>
              <span style={{ cursor: 'pointer' }} onClick={() => setActiveTab('sell')}>Sell Equipment / Post Ad</span>
              <span style={{ cursor: 'pointer' }} onClick={() => setActiveTab('jobs')}>Jobs & Fellowship</span>
              <span style={{ cursor: 'pointer' }} onClick={() => setActiveTab('vendors')}>Local Vendors & Technicians</span>
              {currentDoctor?.role === 'admin' && (
                <span style={{ cursor: 'pointer', color: '#38bdf8', fontWeight: 700 }} onClick={() => setActiveTab('admin')}>
                  ⚡ Admin Console & Approvals
                </span>
              )}
            </div>
          </div>

          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', marginBottom: '14px', fontWeight: 700 }}>Specializations</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.86rem' }}>
              <span>Phacoemulsification & Cataract</span>
              <span>Vitreoretinal Surgery</span>
              <span>Glaucoma & Perimetry</span>
              <span>Cornea & Refractive Lasik</span>
              <span>Optometry & Refraction</span>
            </div>
          </div>

          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', marginBottom: '14px', fontWeight: 700 }}>Non-MOS Inquiries</h4>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '10px' }}>
              If you are not an MOS member and interested in joining or utilizing this platform, please reach out directly:
            </p>
            <a 
              href="https://wa.me/919890617789?text=Hello%20Dr.%20Atul%20Kadhane,%20I%20am%20interested%20in%20the%20MOS%20Connect%20platform%20(Supported%20by%20Opticura)."
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(34, 197, 94, 0.15)',
                border: '1px solid #22c55e',
                color: '#4ade80',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                textDecoration: 'none'
              }}
            >
              <span>💬 Contact Dr. Atul Kadhane: 9890617789</span>
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <div>
            © 2026 MOS Connect. Developed for the Maharashtra Ophthalmological Society. All rights reserved.
          </div>
          <div>
            Peer-to-Peer Verified Healthcare Equipment & Career Portal
          </div>
        </div>
      </footer>
    </div>
  );
}
