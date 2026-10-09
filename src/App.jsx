import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import BuyPage from './pages/BuyPage';
import SellPage from './pages/SellPage';
import VendorsPage from './pages/VendorsPage';
import JobsPage from './pages/JobsPage';
import AdminPage from './pages/AdminPage';
import CommonChatBoard from './components/CommonChatBoard';
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
  addMembersBulk,
  getCurrentDoctor, 
  setCurrentDoctor, 
  getSavedItems, 
  toggleSaveItem 
} from './utils/storage';
import { 
  Eye, 
  ShieldCheck, 
  PhoneCall, 
  Mail, 
  Heart, 
  Activity,
  CheckCircle2,
  Briefcase
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('buy'); // 'buy', 'wanted', 'sell', 'jobs', 'vendors', 'admin'
  const [currentDoctor, setCurrentDoctorState] = useState(null);
  const [listings, setListings] = useState([]);
  const [wantedPosts, setWantedPosts] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [members, setMembers] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Initialize data on mount
  useEffect(() => {
    setCurrentDoctorState(getCurrentDoctor());
    setListings(getListings());
    setWantedPosts(getWantedPosts());
    setJobs(getJobs());
    setMembers(getMembers());
    setSavedItems(getSavedItems());
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

  const handleBulkAddMembers = (membersList) => {
    const result = addMembersBulk(membersList);
    setMembers(result.updatedList);
    return result;
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
  };

  const handleLogout = () => {
    setCurrentDoctor(null);
    setCurrentDoctorState(null);
    if (activeTab === 'admin') {
      setActiveTab('buy');
    }
  };

  const approvedJobsCount = jobs.filter(j => j.status === 'approved').length;
  const pendingJobsCount = jobs.filter(j => j.status === 'pending').length;

  return (
    <div className="app-container">
      {/* Sticky Navigation Bar */}
      <Navbar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentDoctor={currentDoctor}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onOpenPostAd={() => setActiveTab('sell')}
        listingsCount={listings.length}
        wantedCount={wantedPosts.length}
        vendorsCount={45}
        jobsCount={approvedJobsCount}
        pendingJobsCount={pendingJobsCount}
      />

      {/* Main Page Routing */}
      <main className="main-content">
        {activeTab === 'buy' && (
          <BuyPage 
            listings={listings}
            savedItems={savedItems}
            onToggleSave={handleToggleSave}
            currentDoctor={currentDoctor}
            onOpenWantedBoard={() => setActiveTab('wanted')}
            onOpenPostAd={() => setActiveTab('sell')}
            onNavigateTab={(tab) => setActiveTab(tab)}
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
            onDeleteListing={handleDeleteListing}
            onUpdateStatus={handleUpdateStatus}
            onOpenAuth={() => setIsAuthOpen(true)}
            onViewOnBuyPage={() => setActiveTab('buy')}
          />
        )}

        {activeTab === 'jobs' && (
          <JobsPage 
            jobs={jobs}
            currentDoctor={currentDoctor}
            onAddJob={handleAddJob}
            onOpenAuth={() => setIsAuthOpen(true)}
            onOpenAdminPanel={() => setActiveTab('admin')}
          />
        )}

        {activeTab === 'vendors' && (
          <VendorsPage />
        )}

        {activeTab === 'admin' && currentDoctor?.role === 'admin' && (
          <AdminPage 
            currentDoctor={currentDoctor}
            jobs={jobs}
            members={members}
            listings={listings}
            onUpdateJobStatus={handleUpdateJobStatus}
            onDeleteJob={handleDeleteJob}
            onAddMember={handleAddMember}
            onBulkAddMembers={handleBulkAddMembers}
          />
        )}
      </main>

      {/* Doctor Verification / Auth Modal */}
      <AuthModal 
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
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
              Official equipment marketplace, career exchange, and verified service directory for eye care specialists. Enabling peer-to-peer equipment exchange, hospital recruitment, and service support for 3,745+ ophthalmologists across Maharashtra.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '16px', color: '#10b981', fontSize: '0.82rem', fontWeight: 600 }}>
              <ShieldCheck size={16} />
              <span>Approved MOS Member Authentication System</span>
            </div>
          </div>

          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', marginBottom: '14px', fontWeight: 700 }}>Quick Navigation</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.86rem' }}>
              <span style={{ cursor: 'pointer' }} onClick={() => setActiveTab('buy')}>Buy Equipment Pluckcards</span>
              <span style={{ cursor: 'pointer' }} onClick={() => setActiveTab('wanted')}>Doctors' Wanted Board</span>
              <span style={{ cursor: 'pointer' }} onClick={() => setActiveTab('sell')}>Sell Equipment / Post Ad</span>
              <span style={{ cursor: 'pointer' }} onClick={() => setActiveTab('jobs')}>Ophthalmic Job Board</span>
              <span style={{ cursor: 'pointer' }} onClick={() => setActiveTab('vendors')}>45+ Technicians Directory</span>
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
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', marginBottom: '14px', fontWeight: 700 }}>MOS Coordination</h4>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '12px' }}>
              For queries related to member approval records, vacancy moderation, or vendor submissions, reach out through the member portal.
            </p>
            <div style={{ fontSize: '0.82rem', color: '#38bdf8' }}>
              Maharashtra Ophthalmological Society
            </div>
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
