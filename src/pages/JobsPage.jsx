import React, { useState, useMemo } from 'react';
import { 
  Briefcase, 
  Search, 
  MapPin, 
  IndianRupee, 
  Clock, 
  CheckCircle2, 
  Building2, 
  PlusCircle, 
  Mail, 
  Phone, 
  ShieldCheck, 
  AlertCircle,
  X,
  Send,
  Eye,
  Calendar,
  Sparkles,
  Award,
  Layers,
  FileText,
  Lock
} from 'lucide-react';
import WhatsAppIcon from '../components/WhatsAppIcon';
import { maskPhone, maskEmail, maskMembershipNo } from '../utils/masking';

export default function JobsPage({ 
  jobs, 
  currentDoctor, 
  onAddJob, 
  onOpenAuth,
  onOpenAdminPanel
}) {
  const [activeTab, setActiveTab] = useState('browse'); // 'browse', 'my-jobs'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [selectedJobType, setSelectedJobType] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedJobDetail, setSelectedJobDetail] = useState(null);
  const [submissionSuccess, setSubmissionSuccess] = useState('');

  // Form State for Posting Job
  const [formData, setFormData] = useState({
    title: '',
    hospital: '',
    city: currentDoctor?.city || 'Mumbai',
    state: 'Maharashtra',
    specialization: 'Phaco / Cataract',
    jobType: 'Full Time',
    experience: '2+ Years',
    salary: '₹ 1,50,000 - ₹ 2,50,000 / month',
    description: '',
    requirementsText: 'MS / DNB in Ophthalmology, MMC Registration',
    contactEmail: currentDoctor?.email || '',
    contactPhone: currentDoctor?.mobile || '',
    contactWhatsApp: currentDoctor?.mobile || ''
  });

  const specializations = [
    'All',
    'Phaco / Cataract',
    'Vitreoretina',
    'Glaucoma',
    'Cornea',
    'Pediatric / Strabismus',
    'Refractive / Lasik',
    'Optometry',
    'OT Technician',
    'General Ophthalmology'
  ];

  const jobTypes = [
    'All',
    'Full Time',
    'Part Time',
    'Visiting Consultant',
    'Fellowship'
  ];

  // Distinct cities from jobs
  const cities = useMemo(() => {
    const set = new Set(jobs.map(j => j.city).filter(Boolean));
    return ['All', ...Array.from(set).sort()];
  }, [jobs]);

  // Approved public jobs (or user viewing all if admin)
  const publicJobs = useMemo(() => {
    return jobs.filter(j => j.status === 'approved');
  }, [jobs]);

  // Filtered public jobs
  const filteredJobs = useMemo(() => {
    return publicJobs.filter(job => {
      if (selectedSpecialty !== 'All' && job.specialization !== selectedSpecialty) {
        return false;
      }
      if (selectedJobType !== 'All' && job.jobType !== selectedJobType) {
        return false;
      }
      if (selectedCity !== 'All' && !job.city?.toLowerCase().includes(selectedCity.toLowerCase())) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches = 
          job.title?.toLowerCase().includes(q) ||
          job.hospital?.toLowerCase().includes(q) ||
          job.city?.toLowerCase().includes(q) ||
          job.description?.toLowerCase().includes(q) ||
          job.specialization?.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    }).sort((a, b) => new Date(b.postedAt || 0) - new Date(a.postedAt || 0));
  }, [publicJobs, selectedSpecialty, selectedJobType, selectedCity, searchQuery]);

  // Jobs posted by this doctor
  const myPostedJobs = useMemo(() => {
    if (!currentDoctor) return [];
    return jobs.filter(j => 
      j.postedBy?.membershipNo === currentDoctor.membershipNo ||
      j.postedBy?.email?.toLowerCase() === currentDoctor.email?.toLowerCase() ||
      (currentDoctor.role === 'admin' && j.postedBy?.membershipNo === 'ADMIN-MASTER')
    );
  }, [jobs, currentDoctor]);

  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (!currentDoctor) {
      onOpenAuth();
      return;
    }

    const requirementsArray = formData.requirementsText
      ? formData.requirementsText.split(',').map(s => s.trim()).filter(Boolean)
      : ['MS / DNB in Ophthalmology', 'MMC Registered'];

    const newJob = {
      id: `job-${Date.now()}`,
      title: formData.title,
      hospital: formData.hospital,
      city: formData.city,
      state: formData.state || 'Maharashtra',
      specialization: formData.specialization,
      jobType: formData.jobType,
      experience: formData.experience,
      salary: formData.salary,
      description: formData.description,
      requirements: requirementsArray,
      contactEmail: formData.contactEmail,
      contactPhone: formData.contactPhone,
      contactWhatsApp: formData.contactWhatsApp,
      postedBy: {
        name: currentDoctor.name,
        membershipNo: currentDoctor.membershipNo,
        email: currentDoctor.email,
        mobile: currentDoctor.mobile
      },
      status: currentDoctor.role === 'admin' ? 'approved' : 'pending',
      postedAt: new Date().toISOString(),
      approvedAt: currentDoctor.role === 'admin' ? new Date().toISOString() : null,
      approvedBy: currentDoctor.role === 'admin' ? currentDoctor.name : null
    };

    onAddJob(newJob);
    setShowPostModal(false);
    
    if (currentDoctor.role === 'admin') {
      setSubmissionSuccess(`Job "${newJob.title}" posted and approved immediately as Administrator.`);
    } else {
      setSubmissionSuccess(`Job vacancy submitted successfully! It is now pending review by the MOS Admin and will appear publicly once approved.`);
      setActiveTab('my-jobs');
    }

    setTimeout(() => setSubmissionSuccess(''), 6000);
  };

  return (
    <div>
      {/* Hero Banner */}
      <div className="hero-banner" style={{ background: 'linear-gradient(135deg, #091a2f 0%, #1e3a5f 100%)' }}>
        <div className="hero-content">
          <div className="hero-badge" style={{ background: 'rgba(56, 189, 248, 0.15)', borderColor: '#38bdf8', color: '#38bdf8' }}>
            <Briefcase size={15} />
            <span>Official Ophthalmic Careers & Vacancies</span>
          </div>
          <h2 className="hero-title">
            Ophthalmic <span>Job Board & Fellowships</span> Across Maharashtra
          </h2>
          <p className="hero-desc">
            Direct recruitment for eye hospitals, retina institutes, and surgical clinics. Connect with qualified vitreoretina consultants, phaco surgeons, optometrists, and ophthalmic OT teams verified by MOS.
          </p>

          <div className="hero-stats-row">
            <div className="hero-stat-item">
              <span className="hero-stat-num">{publicJobs.length} Live</span>
              <span className="hero-stat-label">Approved Positions</span>
            </div>
            <div className="hero-stat-item">
              <span className="hero-stat-num">3,745</span>
              <span className="hero-stat-label">Eye Care Doctors</span>
            </div>
            <div className="hero-stat-item">
              <span className="hero-stat-num">Admin Verified</span>
              <span className="hero-stat-label">Quality Moderation</span>
            </div>
            <div className="hero-stat-item">
              <span className="hero-stat-num">0% Agency Fees</span>
              <span className="hero-stat-label">Direct Hospital Apply</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Header & Post Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', background: '#e2e8f0', padding: '4px', borderRadius: '9999px' }}>
          <button 
            style={{
              padding: '8px 20px',
              borderRadius: '9999px',
              fontWeight: 700,
              fontSize: '0.86rem',
              background: activeTab === 'browse' ? '#0f172a' : 'transparent',
              color: activeTab === 'browse' ? '#ffffff' : '#475569',
              transition: 'all 0.2s ease'
            }}
            onClick={() => setActiveTab('browse')}
            id="tab-browse-jobs"
          >
            Browse Open Positions ({publicJobs.length})
          </button>

          <button 
            style={{
              padding: '8px 20px',
              borderRadius: '9999px',
              fontWeight: 700,
              fontSize: '0.86rem',
              background: activeTab === 'my-jobs' ? '#0f172a' : 'transparent',
              color: activeTab === 'my-jobs' ? '#ffffff' : '#475569',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onClick={() => {
              if (!currentDoctor) {
                onOpenAuth();
              } else {
                setActiveTab('my-jobs');
              }
            }}
            id="tab-my-posted-jobs"
          >
            <FileText size={15} />
            <span>My Posted Vacancies ({myPostedJobs.length})</span>
          </button>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {currentDoctor?.role === 'admin' && (
            <button
              onClick={onOpenAdminPanel}
              style={{
                background: '#0d9488',
                color: '#ffffff',
                padding: '9px 18px',
                borderRadius: '9999px',
                fontWeight: 700,
                fontSize: '0.86rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}
              id="btn-goto-admin-approvals"
            >
              <ShieldCheck size={16} />
              <span>Admin Approvals Panel</span>
            </button>
          )}

          <button 
            className="btn-post-ad"
            onClick={() => {
              if (!currentDoctor) {
                onOpenAuth();
              } else {
                setShowPostModal(true);
              }
            }}
            id="btn-post-job-cta"
          >
            <PlusCircle size={18} />
            <span>Post a Job Vacancy</span>
          </button>
        </div>
      </div>

      {/* Success alert message */}
      {submissionSuccess && (
        <div className="otp-sim-toast" style={{ borderLeftColor: '#10b981', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 size={20} color="#10b981" />
            <span style={{ fontSize: '0.92rem', fontWeight: 600 }}>{submissionSuccess}</span>
          </div>
        </div>
      )}

      {/* TAB 1: BROWSE PUBLIC JOBS */}
      {activeTab === 'browse' && (
        <div>
          {/* Guest Mode Notice Strip */}
          {!currentDoctor && (
            <div className="guest-mode-notice-banner">
              <div className="guest-notice-left">
                <div className="guest-notice-icon">
                  <Lock size={20} />
                </div>
                <div>
                  <div className="guest-notice-title">
                    Guest Mode — Hospital & HR Contact Information Masked
                  </div>
                  <div className="guest-notice-sub">
                    All ophthalmic job openings, specialties, and requirements are viewable. Direct hospital phone numbers, emails, and WhatsApp application links are protected for MOS members.
                  </div>
                </div>
              </div>
              <button 
                className="btn-guest-unlock"
                onClick={onOpenAuth}
                id="btn-guest-unlock-jobs"
              >
                <ShieldCheck size={16} />
                <span>Log In with MOS ID</span>
              </button>
            </div>
          )}

          {/* Search & Filters */}
          <div className="filter-search-container">
            <div className="search-input-row">
              <div className="search-input-wrapper">
                <Search size={20} className="search-icon-svg" />
                <input 
                  type="text"
                  className="main-search-input"
                  placeholder="Search jobs by specialty (e.g. Retina, Cataract, Optometry), hospital, or city..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  id="input-jobs-search"
                />
              </div>

              <select 
                className="filter-select"
                value={selectedJobType}
                onChange={e => setSelectedJobType(e.target.value)}
                id="select-job-type-filter"
              >
                {jobTypes.map(t => (
                  <option key={t} value={t}>{t === 'All' ? 'All Job Types' : t}</option>
                ))}
              </select>

              <select 
                className="filter-select"
                value={selectedCity}
                onChange={e => setSelectedCity(e.target.value)}
                id="select-job-city-filter"
              >
                {cities.map(c => (
                  <option key={c} value={c}>{c === 'All' ? 'All Cities' : c}</option>
                ))}
              </select>
            </div>

            {/* Specialization Filter Pills */}
            <div className="category-pills">
              {specializations.map(spec => (
                <button 
                  key={spec}
                  className={`category-pill ${selectedSpecialty === spec ? 'active' : ''}`}
                  onClick={() => setSelectedSpecialty(spec)}
                  id={`spec-pill-${spec.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                >
                  <span>{spec}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Results Summary */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', fontSize: '0.88rem', color: '#64748b' }}>
            <span>Showing <strong>{filteredJobs.length}</strong> active ophthalmic positions</span>
            {(searchQuery || selectedSpecialty !== 'All' || selectedJobType !== 'All' || selectedCity !== 'All') && (
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSpecialty('All');
                  setSelectedJobType('All');
                  setSelectedCity('All');
                }}
                style={{ color: '#0284c7', fontWeight: 600 }}
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* Job Cards Grid */}
          {filteredJobs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <Briefcase size={48} style={{ margin: '0 auto 16px auto', color: '#94a3b8' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                No Positions Matching Your Criteria
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '6px' }}>
                Try broadening your specialty filters or post a job vacancy for your clinic.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '24px' }}>
              {filteredJobs.map(job => {
                const cleanPhone = job.contactPhone ? job.contactPhone.replace(/\D/g, '') : '';
                const waPhone = job.contactWhatsApp ? job.contactWhatsApp.replace(/\D/g, '') : cleanPhone;
                const waText = encodeURIComponent(
                  `Hello, I saw your job opening "${job.title}" at ${job.hospital} on the MOS Connect portal. I am interested in applying. Kindly let me know how to share my CV.`
                );

                return (
                  <div key={job.id} className="vendor-card" style={{ padding: '22px' }} id={`job-card-${job.id}`}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <span className="brand-pill" style={{ background: '#f0fdfa', color: '#0d9488' }}>
                        {job.specialization}
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 9px', borderRadius: '9999px', background: '#f1f5f9', color: '#334155' }}>
                        {job.jobType}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.3, marginBottom: '4px' }}>
                      {job.title}
                    </h3>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', fontWeight: 600, color: '#0284c7', marginBottom: '10px' }}>
                      <Building2 size={16} />
                      <span>{job.hospital}</span>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: '0.8rem', color: '#64748b', marginBottom: '14px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={13} color="#64748b" />
                        <span>{job.city}, {job.state}</span>
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Briefcase size={13} color="#64748b" />
                        <span>{job.experience}</span>
                      </span>
                      {job.salary && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#059669', fontWeight: 700 }}>
                          <IndianRupee size={13} />
                          <span>{job.salary}</span>
                        </span>
                      )}
                    </div>

                    <p style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.5, marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {job.description}
                    </p>

                    <div style={{ marginTop: 'auto', borderTop: '1px solid #f1f5f9', paddingTop: '14px', display: 'flex', gap: '8px' }}>
                      {currentDoctor ? (
                        <>
                          {waPhone && (
                            <a 
                              href={`https://wa.me/91${waPhone.slice(-10)}?text=${waText}`}
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="btn-pluckcard-wa"
                              style={{ flex: 1, padding: '9px 10px', fontSize: '0.82rem' }}
                            >
                              <WhatsAppIcon size={16} />
                              <span>WhatsApp</span>
                            </a>
                          )}

                          {cleanPhone && (
                            <a 
                              href={`tel:+91${cleanPhone.slice(-10)}`}
                              className="btn-pluckcard-call"
                              style={{ padding: '9px 12px' }}
                              title="Call Hospital / Doctor"
                            >
                              <Phone size={15} />
                            </a>
                          )}

                          {job.contactEmail && (
                            <a 
                              href={`mailto:${job.contactEmail}?subject=${encodeURIComponent(`Application: ${job.title} - via MOS Connect`)}`}
                              className="btn-pluckcard-call"
                              style={{ padding: '9px 12px' }}
                              title="Email CV"
                            >
                              <Mail size={15} />
                            </a>
                          )}
                        </>
                      ) : (
                        <>
                          <button 
                            type="button"
                            className="btn-pluckcard-wa"
                            style={{ flex: 1, padding: '9px 10px', fontSize: '0.82rem' }}
                            onClick={onOpenAuth}
                            title="Log in with MOS credentials to apply on WhatsApp"
                          >
                            <Lock size={14} />
                            <span>WhatsApp</span>
                          </button>

                          <button 
                            type="button"
                            className="btn-pluckcard-call"
                            style={{ padding: '9px 12px' }}
                            onClick={onOpenAuth}
                            title="Log in with MOS credentials to call hospital"
                          >
                            <Lock size={13} />
                          </button>

                          <button 
                            type="button"
                            className="btn-pluckcard-call"
                            style={{ padding: '9px 12px' }}
                            onClick={onOpenAuth}
                            title="Log in with MOS credentials to email CV"
                          >
                            <Mail size={14} />
                          </button>
                        </>
                      )}

                      <button 
                        className="btn-pluckcard-detail"
                        style={{ padding: '9px 14px', fontSize: '0.82rem' }}
                        onClick={() => setSelectedJobDetail(job)}
                      >
                        Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY POSTED VACANCIES (STATUS REVIEW) */}
      {activeTab === 'my-jobs' && (
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                Your Posted Job Vacancies ({myPostedJobs.length})
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Track approval status of your hospital vacancies. Jobs require MOS Administrator approval before appearing publicly.
              </p>
            </div>

            <button 
              className="btn-post-ad"
              onClick={() => setShowPostModal(true)}
            >
              <PlusCircle size={16} />
              <span>+ Post Another Job</span>
            </button>
          </div>

          {myPostedJobs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 20px', color: '#64748b' }}>
              <Briefcase size={44} style={{ margin: '0 auto 12px auto', color: '#cbd5e1' }} />
              <h4>You haven't posted any job vacancies yet</h4>
              <p style={{ fontSize: '0.88rem', marginTop: '4px', marginBottom: '16px' }}>
                Looking for a surgeon, optometrist, or OT assistant for your hospital?
              </p>
              <button 
                className="btn-post-ad"
                onClick={() => setShowPostModal(true)}
              >
                Post Your First Job Opening
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {myPostedJobs.map(job => (
                <div 
                  key={job.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    background: job.status === 'pending' ? '#fffbeb' : '#ffffff',
                    gap: '16px',
                    flexWrap: 'wrap'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="brand-pill">{job.specialization}</span>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>{job.title}</h4>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '3px' }}>
                      {job.hospital} • {job.city} • Posted: {new Date(job.postedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span 
                      style={{
                        padding: '5px 12px',
                        borderRadius: '9999px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        background: job.status === 'approved' ? '#ecfdf5' : job.status === 'pending' ? '#fef3c7' : '#fee2e2',
                        color: job.status === 'approved' ? '#059669' : job.status === 'pending' ? '#d97706' : '#ef4444'
                      }}
                    >
                      {job.status === 'approved' ? '✓ Approved & Live' : job.status === 'pending' ? '⏳ Pending Admin Review' : '✕ Rejected'}
                    </span>

                    <button 
                      style={{ padding: '7px 14px', background: '#f1f5f9', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}
                      onClick={() => setSelectedJobDetail(job)}
                    >
                      View Post
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: POST A JOB */}
      {showPostModal && (
        <div className="modal-overlay" onClick={() => setShowPostModal(false)}>
          <div className="modal-card" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Post Ophthalmic Job Vacancy</h3>
              <button className="modal-close-btn" onClick={() => setShowPostModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handlePostSubmit} style={{ padding: '24px' }}>
              <div style={{ background: '#f0fdfa', border: '1px solid #99f6e4', padding: '12px 16px', borderRadius: '10px', marginBottom: '18px', fontSize: '0.82rem', color: '#0f766e' }}>
                <div style={{ fontWeight: 700 }}>
                  Posting Hospital / Clinic: <strong>{currentDoctor?.name}</strong> (MOS #{currentDoctor?.membershipNo})
                </div>
                <div style={{ marginTop: '2px', color: '#0d9488' }}>
                  ℹ️ All job postings are verified by MOS Administrators before appearing on the public careers board.
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Job Title / Position Name *</label>
                <input 
                  type="text"
                  className="form-input"
                  placeholder="e.g. Consultant Vitreoretina Surgeon or Optometrist"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  id="input-post-job-title"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Hospital / Clinic Name *</label>
                  <input 
                    type="text"
                    className="form-input"
                    placeholder="e.g. Netra Eye Institute"
                    required
                    value={formData.hospital}
                    onChange={e => setFormData({ ...formData, hospital: e.target.value })}
                    id="input-post-job-hospital"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input 
                    type="text"
                    className="form-input"
                    placeholder="e.g. Pune, Mumbai, Nashik"
                    required
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    id="input-post-job-city"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Specialization</label>
                  <select 
                    className="form-select"
                    value={formData.specialization}
                    onChange={e => setFormData({ ...formData, specialization: e.target.value })}
                  >
                    {specializations.filter(s => s !== 'All').map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Job Type</label>
                  <select 
                    className="form-select"
                    value={formData.jobType}
                    onChange={e => setFormData({ ...formData, jobType: e.target.value })}
                  >
                    {jobTypes.filter(t => t !== 'All').map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Experience Required</label>
                  <input 
                    type="text"
                    className="form-input"
                    placeholder="e.g. 2+ Years / Freshers welcome"
                    value={formData.experience}
                    onChange={e => setFormData({ ...formData, experience: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Salary / Compensation</label>
                  <input 
                    type="text"
                    className="form-input"
                    placeholder="e.g. ₹ 2,00,000 / month / Negotiable"
                    value={formData.salary}
                    onChange={e => setFormData({ ...formData, salary: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Job Description & Responsibilities</label>
                <textarea 
                  className="form-textarea"
                  rows={3}
                  placeholder="Describe the clinical setup, expected surgical volume, OT equipment available, and working schedule..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
              </div>

              <div className="form-group">
                <label className="form-label">Key Requirements (comma separated)</label>
                <input 
                  type="text"
                  className="form-input"
                  placeholder="MS/DNB Ophthalmology, MMC Registered, Phaco experience"
                  value={formData.requirementsText}
                  onChange={e => setFormData({ ...formData, requirementsText: e.target.value })}
                />
              </div>

              <div className="form-row-3">
                <div className="form-group">
                  <label className="form-label">Contact Email</label>
                  <input 
                    type="email"
                    className="form-input"
                    placeholder="hr@hospital.com"
                    value={formData.contactEmail}
                    onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Call Number</label>
                  <input 
                    type="text"
                    className="form-input"
                    placeholder="98XXXXXXXX"
                    value={formData.contactPhone}
                    onChange={e => setFormData({ ...formData, contactPhone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">WhatsApp Number</label>
                  <input 
                    type="text"
                    className="form-input"
                    placeholder="98XXXXXXXX"
                    value={formData.contactWhatsApp}
                    onChange={e => setFormData({ ...formData, contactWhatsApp: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button 
                  type="button" 
                  className="btn-pluckcard-call" 
                  onClick={() => setShowPostModal(false)}
                >
                  Cancel
                </button>

                <button 
                  type="submit" 
                  className="btn-post-ad"
                  id="btn-submit-post-job"
                >
                  <span>Submit Vacancy for Approval</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL MODAL: JOB DETAILS */}
      {selectedJobDetail && (
        <div className="modal-overlay" onClick={() => setSelectedJobDetail(null)}>
          <div className="modal-card" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="brand-pill">{selectedJobDetail.specialization}</span>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                  {selectedJobDetail.title}
                </h3>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedJobDetail(null)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                  {selectedJobDetail.hospital}
                </div>
                <div style={{ display: 'flex', gap: '14px', fontSize: '0.85rem', color: '#64748b', marginTop: '6px' }}>
                  <span>📍 {selectedJobDetail.city}, {selectedJobDetail.state}</span>
                  <span>•</span>
                  <span>💼 {selectedJobDetail.jobType}</span>
                  <span>•</span>
                  <span>⭐ {selectedJobDetail.experience}</span>
                </div>
                {selectedJobDetail.salary && (
                  <div style={{ marginTop: '8px', fontSize: '1.05rem', fontWeight: 800, color: '#059669' }}>
                    {selectedJobDetail.salary}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '18px' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '6px' }}>Role Description</h4>
                <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.6 }}>
                  {selectedJobDetail.description}
                </p>
              </div>

              {selectedJobDetail.requirements?.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px' }}>Candidate Requirements</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {selectedJobDetail.requirements.map((req, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.86rem', color: '#334155' }}>
                        <CheckCircle2 size={16} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{req}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ padding: '12px 16px', background: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: '10px', marginBottom: '20px', fontSize: '0.82rem', color: '#0d9488' }}>
                <div>Verified Posting by: <strong>{selectedJobDetail.postedBy?.name}</strong> (MOS #{maskMembershipNo(selectedJobDetail.postedBy?.membershipNo, !!currentDoctor)})</div>
                <div style={{ marginTop: '4px', color: '#334155', fontSize: '0.8rem' }}>
                  Contact: {maskPhone(selectedJobDetail.contactPhone, !!currentDoctor)} • {maskEmail(selectedJobDetail.contactEmail, !!currentDoctor)}
                </div>
              </div>

              {/* Direct Apply Buttons */}
              {currentDoctor ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {selectedJobDetail.contactWhatsApp && (
                    <a 
                      href={`https://wa.me/91${selectedJobDetail.contactWhatsApp.replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(`Hello, I saw your job opening "${selectedJobDetail.title}" at ${selectedJobDetail.hospital} on MOS Connect.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-vendor-wa"
                    >
                      <WhatsAppIcon size={18} />
                      <span>Apply via WhatsApp</span>
                    </a>
                  )}

                  {selectedJobDetail.contactPhone && (
                    <a 
                      href={`tel:+91${selectedJobDetail.contactPhone.replace(/\D/g, '').slice(-10)}`}
                      className="btn-vendor-call"
                    >
                      <Phone size={17} />
                      <span>Call Hospital</span>
                    </a>
                  )}
                </div>
              ) : (
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px dashed #cbd5e1', textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#0f172a', fontWeight: 700, fontSize: '0.95rem', marginBottom: '6px' }}>
                    <Lock size={16} color="#0284c7" />
                    <span>Hospital Contact Information Protected</span>
                  </div>
                  <p style={{ fontSize: '0.84rem', color: '#64748b', marginBottom: '14px', maxWidth: '420px', margin: '0 auto 14px auto' }}>
                    Direct phone numbers, hospital HR contacts, and WhatsApp apply links are reserved for verified ophthalmologists.
                  </p>
                  <button 
                    className="btn-guest-unlock"
                    onClick={() => {
                      setSelectedJobDetail(null);
                      onOpenAuth();
                    }}
                    style={{ width: '100%', padding: '12px', justifyContent: 'center', fontSize: '0.95rem' }}
                    id="btn-job-modal-login"
                  >
                    <ShieldCheck size={18} />
                    <span>Log In with MOS ID to Apply Directly</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
