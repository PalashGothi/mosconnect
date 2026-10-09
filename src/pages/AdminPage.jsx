import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Briefcase, 
  UploadCloud, 
  PlusCircle, 
  Search, 
  CheckCircle2, 
  XCircle, 
  X,
  Download, 
  FileSpreadsheet, 
  Trash2, 
  AlertCircle, 
  MapPin, 
  Mail, 
  Phone,
  Eye,
  Layers,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import * as XLSX from 'xlsx';

export default function AdminPage({ 
  currentDoctor, 
  jobs, 
  members, 
  listings, 
  onUpdateJobStatus, 
  onDeleteJob,
  onAddMember,
  onBulkAddMembers 
}) {
  const [activeAdminTab, setActiveAdminTab] = useState('jobs'); // 'jobs' or 'members'
  const [jobStatusFilter, setJobStatusFilter] = useState('pending'); // 'pending', 'approved', 'rejected', 'all'
  
  // Member Search & Pagination State
  const [memberSearch, setMemberSearch] = useState('');
  const [memberTypeFilter, setMemberTypeFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Manual Member Modal State
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [manualMember, setManualMember] = useState({
    membershipNo: '',
    membershipType: 'Life Membership',
    name: '',
    email: '',
    mobile: '',
    address: '',
    city: 'Mumbai',
    state: 'Maharashtra',
    ratifiedYear: '2026'
  });

  // Excel Upload State
  const [uploadStats, setUploadStats] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Statistics
  const pendingJobsCount = useMemo(() => jobs.filter(j => j.status === 'pending').length, [jobs]);
  const approvedJobsCount = useMemo(() => jobs.filter(j => j.status === 'approved').length, [jobs]);

  // Filtered Jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter(j => {
      if (jobStatusFilter === 'all') return true;
      return j.status === jobStatusFilter;
    }).sort((a, b) => new Date(b.postedAt || 0) - new Date(a.postedAt || 0));
  }, [jobs, jobStatusFilter]);

  // Filtered Members
  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      if (memberTypeFilter !== 'All' && m.membershipType !== memberTypeFilter) return false;
      if (memberSearch.trim()) {
        const q = memberSearch.toLowerCase().trim();
        return (
          m.membershipNo?.toLowerCase().includes(q) ||
          m.name?.toLowerCase().includes(q) ||
          m.email?.toLowerCase().includes(q) ||
          m.mobile?.includes(q) ||
          m.city?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [members, memberSearch, memberTypeFilter]);

  const totalPages = Math.ceil(filteredMembers.length / pageSize) || 1;
  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredMembers.slice(start, start + pageSize);
  }, [filteredMembers, currentPage]);

  // Handle Manual Member Submit
  const handleManualMemberSubmit = (e) => {
    e.preventDefault();
    if (!manualMember.membershipNo.trim() || !manualMember.name.trim()) return;

    const newMem = {
      sNo: String(members.length + 1),
      membershipNo: manualMember.membershipNo.trim(),
      membershipType: manualMember.membershipType || 'Life Membership',
      name: manualMember.name.trim().startsWith('Dr.') ? manualMember.name.trim() : `Dr. ${manualMember.name.trim()}`,
      email: manualMember.email.trim().toLowerCase(),
      mobile: manualMember.mobile.trim().replace(/\D/g, ''),
      address: manualMember.address.trim(),
      city: manualMember.city.trim() || 'Maharashtra',
      state: manualMember.state.trim() || 'Maharashtra',
      ratifiedYear: manualMember.ratifiedYear || '2026'
    };

    onAddMember(newMem);
    setShowAddMemberModal(false);
    setManualMember({
      membershipNo: '',
      membershipType: 'Life Membership',
      name: '',
      email: '',
      mobile: '',
      address: '',
      city: 'Mumbai',
      state: 'Maharashtra',
      ratifiedYear: '2026'
    });
    setUploadStats({ message: `Member ${newMem.name} (#${newMem.membershipNo}) added successfully!` });
    setTimeout(() => setUploadStats(null), 4000);
  };

  // Handle Excel Upload
  const handleExcelUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError('');
    setUploadStats(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Convert to array of objects
        const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        if (!rawRows || rawRows.length === 0) {
          setUploadError('The uploaded Excel spreadsheet appears to be empty.');
          setIsUploading(false);
          return;
        }

        // Map column headers flexible to MOS format
        const parsedMembers = [];
        rawRows.forEach((row, idx) => {
          // Normalize keys
          const keys = Object.keys(row);
          const findVal = (terms) => {
            const k = keys.find(key => terms.some(t => key.toLowerCase().replace(/[^a-z]/g, '').includes(t)));
            return k ? String(row[k]).trim() : '';
          };

          const memNo = findVal(['membershipno', 'memberno', 'memno', 'membership']);
          const name = findVal(['name', 'doctorname', 'drname']);
          
          if (memNo && name) {
            const email = findVal(['email', 'mail']);
            const mobile = findVal(['mobile', 'phone', 'contact']).replace(/\D/g, '');
            const type = findVal(['membershiptype', 'type']) || 'Life Membership';
            const city = findVal(['city']) || 'Maharashtra';
            const state = findVal(['state']) || 'Maharashtra';
            const address = findVal(['address', 'clinic']);
            const ratified = findVal(['ratifiedyear', 'ratified', 'year']);

            parsedMembers.push({
              sNo: String(members.length + idx + 1),
              membershipNo: memNo,
              membershipType: type,
              name: name.startsWith('Dr.') ? name : `Dr. ${name}`,
              email: email.toLowerCase(),
              mobile: mobile,
              address: address,
              city: city,
              state: state,
              ratifiedYear: ratified
            });
          }
        });

        if (parsedMembers.length === 0) {
          setUploadError('Could not find required columns ("Membership No", "Name") in the Excel sheet. Please download the sample template.');
          setIsUploading(false);
          return;
        }

        const result = onBulkAddMembers(parsedMembers);
        setUploadStats({
          message: `Successfully processed ${parsedMembers.length} records! Added ${result.addedCount} new members, updated ${result.updatedCount} existing.`
        });
        setIsUploading(false);
        setTimeout(() => setUploadStats(null), 6000);
      } catch (err) {
        console.error('Error parsing excel file', err);
        setUploadError(`Failed to parse Excel file: ${err.message}`);
        setIsUploading(false);
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  // Download Sample MOS Excel Template
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'S.No': '1',
        'Membership No': '3801',
        'Membership Type': 'Life Membership',
        'Name': 'Dr. Rajesh Deshmukh',
        'Email': 'rajesh.deshmukh@gmail.com',
        'Mobile': '9820000001',
        'Address': 'Deshmukh Eye Clinic, Shivaji Chowk',
        'City': 'Pune',
        'State': 'Maharashtra',
        'Ratified Year': '2026'
      },
      {
        'S.No': '2',
        'Membership No': '3802',
        'Membership Type': 'Life Membership',
        'Name': 'Dr. Meera Kulkarni',
        'Email': 'meera.kulkarni@gmail.com',
        'Mobile': '9820000002',
        'Address': 'Kulkarni Netralaya, Near Railway Station',
        'City': 'Nashik',
        'State': 'Maharashtra',
        'Ratified Year': '2026'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'MOS_Members_Template');
    XLSX.writeFile(workbook, 'MOS_Member_Approved_Template.xlsx');
  };

  return (
    <div>
      {/* Admin Header */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderRadius: '16px', padding: '32px', color: '#ffffff', marginBottom: '28px', border: '1px solid #334155' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid #38bdf8', padding: '4px 12px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', marginBottom: '10px' }}>
              <ShieldCheck size={14} />
              <span>SUPERADMINISTRATION CONSOLE</span>
            </div>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff' }}>
              MOS Connect Control Center
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '4px' }}>
              Logged in as: <strong>{currentDoctor?.name}</strong> ({currentDoctor?.membershipNo})
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setActiveAdminTab('jobs')}
              style={{
                padding: '9px 18px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.86rem',
                background: activeAdminTab === 'jobs' ? '#0284c7' : '#334155',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              id="admin-tab-jobs"
            >
              <Briefcase size={16} />
              <span>Job Approvals ({pendingJobsCount})</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('members')}
              style={{
                padding: '9px 18px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.86rem',
                background: activeAdminTab === 'members' ? '#0284c7' : '#334155',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              id="admin-tab-members"
            >
              <Users size={16} />
              <span>Member Management ({members.length})</span>
            </button>
          </div>
        </div>

        {/* Admin KPI Metrics Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#38bdf8' }}>{pendingJobsCount}</div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Jobs Awaiting Approval</div>
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981' }}>{approvedJobsCount}</div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Active Approved Jobs</div>
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>{members.length.toLocaleString('en-IN')}</div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Approved MOS Eye Doctors</div>
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f59e0b' }}>{listings.length}</div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Active Equipment Pluckcards</div>
          </div>
        </div>
      </div>

      {/* Global Alerts / Notifications */}
      {uploadStats && (
        <div className="otp-sim-toast" style={{ borderLeftColor: '#10b981', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 size={20} color="#10b981" />
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{uploadStats.message}</span>
          </div>
        </div>
      )}

      {uploadError && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '14px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={20} color="#ef4444" />
          <span style={{ fontSize: '0.88rem', color: '#b91c1c', fontWeight: 600 }}>{uploadError}</span>
        </div>
      )}

      {/* VIEW 1: JOB APPROVALS TAB */}
      {activeAdminTab === 'jobs' && (
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
                Job Vacancy Submissions Moderation
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Only jobs approved by administrators become visible on the public careers board.
              </p>
            </div>

            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => setJobStatusFilter('pending')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  background: jobStatusFilter === 'pending' ? '#f59e0b' : '#f1f5f9',
                  color: jobStatusFilter === 'pending' ? '#ffffff' : '#475569'
                }}
                id="filter-jobs-pending"
              >
                Pending Review ({pendingJobsCount})
              </button>

              <button 
                onClick={() => setJobStatusFilter('approved')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  background: jobStatusFilter === 'approved' ? '#10b981' : '#f1f5f9',
                  color: jobStatusFilter === 'approved' ? '#ffffff' : '#475569'
                }}
                id="filter-jobs-approved"
              >
                Approved & Live ({approvedJobsCount})
              </button>

              <button 
                onClick={() => setJobStatusFilter('all')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  background: jobStatusFilter === 'all' ? '#0f172a' : '#f1f5f9',
                  color: jobStatusFilter === 'all' ? '#ffffff' : '#475569'
                }}
                id="filter-jobs-all"
              >
                All Jobs ({jobs.length})
              </button>
            </div>
          </div>

          {/* Job Items List */}
          {filteredJobs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 20px', color: '#64748b' }}>
              <CheckCircle2 size={44} style={{ margin: '0 auto 10px auto', color: '#10b981' }} />
              <h4>No jobs in this category</h4>
              <p style={{ fontSize: '0.86rem', marginTop: '4px' }}>All submitted jobs have been processed.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredJobs.map(job => (
                <div 
                  key={job.id}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '20px',
                    background: job.status === 'pending' ? '#fffdf5' : '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                  id={`admin-job-row-${job.id}`}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="brand-pill">{job.specialization}</span>
                        <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>{job.title}</h4>
                      </div>
                      <div style={{ fontSize: '0.88rem', color: '#0284c7', fontWeight: 600, marginTop: '2px' }}>
                        {job.hospital} • {job.city}, {job.state} • Type: {job.jobType}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span 
                        style={{
                          padding: '4px 12px',
                          borderRadius: '9999px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          background: job.status === 'approved' ? '#ecfdf5' : job.status === 'pending' ? '#fef3c7' : '#fee2e2',
                          color: job.status === 'approved' ? '#059669' : job.status === 'pending' ? '#d97706' : '#ef4444'
                        }}
                      >
                        {job.status === 'approved' ? '✓ Approved' : job.status === 'pending' ? '⏳ Pending Approval' : '✕ Rejected'}
                      </span>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.5 }}>
                    {job.description}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '0.82rem', color: '#64748b', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px' }}>
                    <span>Experience: <strong>{job.experience}</strong></span>
                    <span>Salary: <strong>{job.salary || 'Negotiable'}</strong></span>
                    <span>Submitted by: <strong>{job.postedBy?.name}</strong> (MOS #{job.postedBy?.membershipNo})</span>
                    <span>Contact: {job.contactPhone || job.contactEmail}</span>
                  </div>

                  {/* Admin Actions */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                    {job.status !== 'approved' && (
                      <button
                        onClick={() => onUpdateJobStatus(job.id, 'approved', currentDoctor?.name)}
                        style={{
                          background: '#059669',
                          color: '#ffffff',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '0.84rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer'
                        }}
                        id={`btn-approve-job-${job.id}`}
                      >
                        <CheckCircle2 size={16} />
                        <span>Approve & Publish Live</span>
                      </button>
                    )}

                    {job.status !== 'rejected' && (
                      <button
                        onClick={() => onUpdateJobStatus(job.id, 'rejected', currentDoctor?.name)}
                        style={{
                          background: '#fee2e2',
                          color: '#ef4444',
                          padding: '8px 14px',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '0.84rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer'
                        }}
                        id={`btn-reject-job-${job.id}`}
                      >
                        <XCircle size={16} />
                        <span>Reject</span>
                      </button>
                    )}

                    <button
                      onClick={() => onDeleteJob(job.id)}
                      style={{
                        padding: '8px 12px',
                        color: '#64748b',
                        background: '#f1f5f9',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                      title="Delete job"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: MEMBER DIRECTORY & EXCEL IMPORT */}
      {activeAdminTab === 'members' && (
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          {/* Header Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
                Approved MOS Ophthalmologists Registry
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Add members manually or upload the approved Excel spreadsheet to expand doctor authentication.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={handleDownloadTemplate}
                style={{
                  background: '#f1f5f9',
                  color: '#334155',
                  padding: '9px 16px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
                id="btn-download-excel-template"
              >
                <Download size={15} />
                <span>Download Sample Template</span>
              </button>

              <label
                style={{
                  background: '#0d9488',
                  color: '#ffffff',
                  padding: '9px 16px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
                id="label-upload-excel"
              >
                <UploadCloud size={16} />
                <span>{isUploading ? 'Importing...' : 'Upload Members Excel (.xlsx)'}</span>
                <input 
                  type="file" 
                  accept=".xlsx, .xls"
                  onChange={handleExcelUpload}
                  style={{ display: 'none' }} 
                  disabled={isUploading}
                  id="input-file-excel-upload"
                />
              </label>

              <button
                onClick={() => setShowAddMemberModal(true)}
                className="btn-post-ad"
                style={{ padding: '9px 16px', fontSize: '0.84rem' }}
                id="btn-add-member-manually"
              >
                <PlusCircle size={16} />
                <span>+ Add Member Manually</span>
              </button>
            </div>
          </div>

          {/* Member Search & Filter Bar */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="text"
                className="main-search-input"
                style={{ paddingLeft: '42px', fontSize: '0.9rem' }}
                placeholder="Search by MOS ID (e.g. 3760), Doctor Name, Mobile, or City..."
                value={memberSearch}
                onChange={e => {
                  setMemberSearch(e.target.value);
                  setCurrentPage(1);
                }}
                id="input-admin-member-search"
              />
            </div>

            <select
              className="filter-select"
              value={memberTypeFilter}
              onChange={e => {
                setMemberTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">All Membership Types</option>
              <option value="Life Membership">Life Membership</option>
              <option value="Associate Member">Associate Member</option>
            </select>
          </div>

          {/* Members Table */}
          <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                  <th style={{ padding: '12px 16px' }}>MOS ID</th>
                  <th style={{ padding: '12px 16px' }}>Doctor Name</th>
                  <th style={{ padding: '12px 16px' }}>Membership Type</th>
                  <th style={{ padding: '12px 16px' }}>Contact Phone</th>
                  <th style={{ padding: '12px 16px' }}>Email</th>
                  <th style={{ padding: '12px 16px' }}>City</th>
                  <th style={{ padding: '12px 16px' }}>State</th>
                </tr>
              </thead>
              <tbody>
                {paginatedMembers.map((m, idx) => (
                  <tr key={`${m.membershipNo}-${idx}`} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 800, color: '#0284c7' }}>
                      #{m.membershipNo}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>
                      {m.name}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, background: '#ecfdf5', color: '#059669', padding: '3px 8px', borderRadius: '6px' }}>
                        {m.membershipType || 'Life Membership'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#334155' }}>
                      +91 {m.mobile || '—'}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#64748b' }}>
                      {m.email || '—'}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#334155' }}>
                      {m.city || '—'}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#64748b' }}>
                      {m.state || 'Maharashtra'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', fontSize: '0.84rem', color: '#64748b' }}>
            <span>
              Showing {filteredMembers.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, filteredMembers.length)} of {filteredMembers.length} doctors
            </span>

            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(p => p - 1)}
                style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: currentPage <= 1 ? '#f1f5f9' : '#ffffff', cursor: currentPage <= 1 ? 'not-allowed' : 'pointer' }}
              >
                <ChevronLeft size={16} />
              </button>

              <span style={{ fontWeight: 700, padding: '0 8px' }}>
                Page {currentPage} of {totalPages}
              </span>

              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: currentPage >= totalPages ? '#f1f5f9' : '#ffffff', cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer' }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD MEMBER MANUALLY */}
      {showAddMemberModal && (
        <div className="modal-overlay" onClick={() => setShowAddMemberModal(false)}>
          <div className="modal-card" style={{ maxWidth: '580px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Add Member Manually to MOS Register</h3>
              <button className="modal-close-btn" onClick={() => setShowAddMemberModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleManualMemberSubmit} style={{ padding: '24px' }}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">MOS Membership ID *</label>
                  <input 
                    type="text"
                    className="form-input"
                    placeholder="e.g. 3850 or 03850A"
                    required
                    value={manualMember.membershipNo}
                    onChange={e => setManualMember({ ...manualMember, membershipNo: e.target.value })}
                    id="input-add-member-id"
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Membership Type</label>
                  <select 
                    className="form-select"
                    value={manualMember.membershipType}
                    onChange={e => setManualMember({ ...manualMember, membershipType: e.target.value })}
                  >
                    <option value="Life Membership">Life Membership</option>
                    <option value="Associate Member">Associate Member</option>
                    <option value="Annual Member">Annual Member</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Doctor Full Name *</label>
                <input 
                  type="text"
                  className="form-input"
                  placeholder="e.g. Dr. Rajesh Deshmukh"
                  required
                  value={manualMember.name}
                  onChange={e => setManualMember({ ...manualMember, name: e.target.value })}
                  id="input-add-member-name"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Email ID</label>
                  <input 
                    type="email"
                    className="form-input"
                    placeholder="doctor@gmail.com"
                    value={manualMember.email}
                    onChange={e => setManualMember({ ...manualMember, email: e.target.value })}
                    id="input-add-member-email"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Mobile Number</label>
                  <input 
                    type="text"
                    className="form-input"
                    placeholder="98XXXXXXXX"
                    value={manualMember.mobile}
                    onChange={e => setManualMember({ ...manualMember, mobile: e.target.value })}
                    id="input-add-member-mobile"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input 
                    type="text"
                    className="form-input"
                    placeholder="e.g. Pune, Mumbai, Nashik"
                    value={manualMember.city}
                    onChange={e => setManualMember({ ...manualMember, city: e.target.value })}
                    id="input-add-member-city"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">State</label>
                  <input 
                    type="text"
                    className="form-input"
                    placeholder="Maharashtra"
                    value={manualMember.state}
                    onChange={e => setManualMember({ ...manualMember, state: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Clinic / Hospital Address</label>
                <input 
                  type="text"
                  className="form-input"
                  placeholder="Clinic Name, Road, Area"
                  value={manualMember.address}
                  onChange={e => setManualMember({ ...manualMember, address: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button 
                  type="button" 
                  className="btn-pluckcard-call" 
                  onClick={() => setShowAddMemberModal(false)}
                >
                  Cancel
                </button>

                <button 
                  type="submit" 
                  className="btn-post-ad"
                  id="btn-submit-add-member"
                >
                  <span>Save Member to Database</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
