import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Wrench, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Star, 
  Building2, 
  ExternalLink,
  Tag,
  CheckCircle2,
  SlidersHorizontal,
  ThumbsUp,
  Award,
  Lock,
  RotateCw,
  MessageSquarePlus,
  X,
  Check
} from 'lucide-react';
import vendorsData from '../data/vendors.json';
import WhatsAppIcon from '../components/WhatsAppIcon';
import OpticuraLogo from '../components/OpticuraLogo';
import { maskPhone } from '../utils/masking';
import { getVendorReviews, saveVendorReview } from '../utils/storage';

export default function VendorsPage({ vendors, currentDoctor, onOpenAuth, onOpenAdminPanel }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');

  // Flip card tracking (Set of vendor IDs currently flipped to reviews back side)
  const [flippedVendorIds, setFlippedVendorIds] = useState(new Set());
  
  // Review prompt modal state
  const [reviewModalVendor, setReviewModalVendor] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewName, setReviewName] = useState(currentDoctor?.name || '');
  const [reviewCity, setReviewCity] = useState(currentDoctor?.city || '');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState(false);
  const [reviewsVersion, setReviewsVersion] = useState(0);

  const toggleFlip = (vendorId) => {
    setFlippedVendorIds(prev => {
      const next = new Set(prev);
      if (next.has(vendorId)) {
        next.delete(vendorId);
      } else {
        next.add(vendorId);
      }
      return next;
    });
  };

  const handleContactAction = (vendor, actionType, directUrl) => {
    if (!currentDoctor) {
      onOpenAuth();
      return;
    }
    
    // Open the communication link (WhatsApp or Phone call)
    if (actionType === 'wa') {
      window.open(directUrl, '_blank', 'noopener,noreferrer');
    } else if (actionType === 'call') {
      window.location.href = directUrl;
    }

    // Prompt user to leave a review for the vendor
    setTimeout(() => {
      openReviewModal(vendor);
    }, 400);
  };

  const openReviewModal = (vendor) => {
    setReviewModalVendor(vendor);
    setReviewRating(5);
    setReviewName(currentDoctor?.name || 'Dr. ');
    setReviewCity(currentDoctor?.city || 'Maharashtra');
    setReviewComment('');
    setReviewSuccessMsg(false);
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!reviewModalVendor) return;
    if (!reviewComment.trim()) {
      alert('Please enter a brief review or feedback regarding this technician.');
      return;
    }

    saveVendorReview(reviewModalVendor.id, {
      doctorName: reviewName.trim() || 'Dr. Anonymous MOS Member',
      membershipNo: currentDoctor?.membershipNo || 'Verified Surgeon',
      city: reviewCity.trim() || 'Maharashtra',
      rating: reviewRating,
      comment: reviewComment.trim()
    });

    setReviewSuccessMsg(true);
    setReviewsVersion(v => v + 1);

    // Auto flip card to back so user sees their review immediately
    setFlippedVendorIds(prev => new Set(prev).add(reviewModalVendor.id));

    setTimeout(() => {
      setReviewModalVendor(null);
      setReviewSuccessMsg(false);
    }, 1200);
  };

  const activeVendors = useMemo(() => {
    return vendors && vendors.length > 0 ? vendors : vendorsData;
  }, [vendors]);

  const filterCategories = [
    'All',
    'Zeiss Specialists',
    'Phaco & Probes',
    'Autoclave / CSSD',
    'OCT & Fundus',
    'Microscopes',
    'Autoref / Biometry',
    'Lasers',
    'Chair Units',
    'Cameras & Imaging',
    'Screen & Electronics',
    'EMR Software'
  ];

  // Distinct cities from vendors
  const cities = useMemo(() => {
    const citySet = new Set();
    activeVendors.forEach(v => {
      if (v.city) {
        v.city.split('/').forEach(c => citySet.add(c.trim()));
      }
    });
    return ['All', ...Array.from(citySet).sort()];
  }, [activeVendors]);

  // Filter vendors based on search, category and city
  const filteredVendors = useMemo(() => {
    return activeVendors.filter(v => {
      // Category filter
      if (selectedCategory !== 'All') {
        if (selectedCategory === 'Zeiss Specialists') {
          const hasZeiss = v.brands?.some(b => b.toLowerCase().includes('zeiss')) || 
                           v.description?.toLowerCase().includes('zeiss') ||
                           v.name?.toLowerCase().includes('zeiss');
          if (!hasZeiss) return false;
        } else if (selectedCategory === 'Phaco & Probes') {
          const hasPhaco = v.categories?.includes('Phaco Machines') || 
                           v.description?.toLowerCase().includes('phaco');
          if (!hasPhaco) return false;
        } else if (selectedCategory === 'Autoclave / CSSD') {
          const hasAutoclave = v.categories?.includes('Autoclave / CSSD') || 
                              v.description?.toLowerCase().includes('autoclave') ||
                              v.description?.toLowerCase().includes('cssd');
          if (!hasAutoclave) return false;
        } else if (selectedCategory === 'OCT & Fundus') {
          const hasOct = v.categories?.includes('OCT & Fundus') || 
                         v.description?.toLowerCase().includes('oct');
          if (!hasOct) return false;
        } else if (selectedCategory === 'Microscopes') {
          const hasMicro = v.categories?.includes('Microscopes') || 
                           v.description?.toLowerCase().includes('microscope');
          if (!hasMicro) return false;
        } else if (selectedCategory === 'Autoref / Biometry') {
          const hasAutoref = v.categories?.includes('Autoref / Biometry') || 
                             v.description?.toLowerCase().includes('autoref');
          if (!hasAutoref) return false;
        } else if (selectedCategory === 'Lasers') {
          const hasLaser = v.categories?.includes('Lasers') || 
                           v.description?.toLowerCase().includes('laser');
          if (!hasLaser) return false;
        } else if (selectedCategory === 'Chair Units') {
          const hasChair = v.categories?.includes('Chair Units') || 
                           v.description?.toLowerCase().includes('chair unit');
          if (!hasChair) return false;
        } else if (selectedCategory === 'Cameras & Imaging') {
          const hasCamera = v.categories?.includes('Cameras & Imaging') || 
                            v.description?.toLowerCase().includes('camera');
          if (!hasCamera) return false;
        } else if (selectedCategory === 'Screen & Electronics') {
          const hasElec = v.categories?.includes('Screen & Electronics') || 
                          v.description?.toLowerCase().includes('screen') ||
                          v.description?.toLowerCase().includes('electronic');
          if (!hasElec) return false;
        } else if (selectedCategory === 'EMR Software') {
          const hasEmr = v.categories?.includes('EMR Software') || 
                         v.description?.toLowerCase().includes('emr');
          if (!hasEmr) return false;
        }
      }

      // City filter
      if (selectedCity !== 'All') {
        const matchesCity = v.city?.toLowerCase().includes(selectedCity.toLowerCase()) ||
                            v.coverage?.toLowerCase().includes(selectedCity.toLowerCase());
        if (!matchesCity) return false;
      }

      // Search query (equipment, brand, name, services, notes)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches = 
          v.name?.toLowerCase().includes(q) ||
          v.company?.toLowerCase().includes(q) ||
          v.description?.toLowerCase().includes(q) ||
          v.city?.toLowerCase().includes(q) ||
          v.badge?.toLowerCase().includes(q) ||
          v.brands?.some(b => b.toLowerCase().includes(q)) ||
          v.categories?.some(c => c.toLowerCase().includes(q)) ||
          v.services?.some(s => s.toLowerCase().includes(q));
        if (!matches) return false;
      }

      return true;
    });
  }, [activeVendors, searchQuery, selectedCategory, selectedCity]);

  return (
    <div>
      {/* Directory Hero Banner */}
      <div className="hero-banner" style={{ background: 'linear-gradient(135deg, #091a2f 0%, #0d3858 100%)' }}>
        <div className="hero-content">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
            <div className="hero-badge" style={{ background: 'rgba(13, 148, 136, 0.2)', borderColor: '#14b8a6', color: '#5eead4', marginBottom: 0 }}>
              <Award size={15} />
              <span>Biomedical Equipment Engineering Directory • Supported by Opticura</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <OpticuraLogo variant="hero" height={34} />

              {currentDoctor?.role === 'admin' && (
                <button
                  onClick={onOpenAdminPanel}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    color: '#ffffff',
                    border: '1px solid #38bdf8',
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <ShieldCheck size={14} />
                  <span>+ Add / Manage Vendors</span>
                </button>
              )}
            </div>
          </div>

          <h2 className="hero-title" style={{ marginTop: '16px' }}>
            Local Vendors <span>& Technicians</span> for Ophthalmic Devices
          </h2>
          <p className="hero-desc">
            Direct contacts for local equipment vendors, specialized biomedical engineers, former Zeiss & Appasamy technicians, Phaco probe repair specialists, autoclave engineers, and certified ophthalmic optics experts across Maharashtra. Click any card to flip and view peer reviews!
          </p>

          <div className="hero-stats-row">
            <div className="hero-stat-item">
              <span className="hero-stat-num">{activeVendors.length} Local Vendors</span>
              <span className="hero-stat-label">Local Specialists</span>
            </div>
            <div className="hero-stat-item">
              <span className="hero-stat-num">All Maharashtra</span>
              <span className="hero-stat-label">Coverage & Outstation</span>
            </div>
            <div className="hero-stat-item">
              <span className="hero-stat-num">Zeiss • Alcon • AMO</span>
              <span className="hero-stat-label">Major Brands Serviced</span>
            </div>
            <div className="hero-stat-item">
              <span className="hero-stat-num">⭐ 3D Flip Reviews</span>
              <span className="hero-stat-label">Doctor Feedback on Call</span>
            </div>
          </div>
        </div>
      </div>

      {/* Guest Mode Notice Strip */}
      {!currentDoctor && (
        <div className="guest-mode-notice-banner" style={{ marginTop: '24px' }}>
          <div className="guest-notice-left">
            <div className="guest-notice-icon">
              <Lock size={20} />
            </div>
            <div>
              <div className="guest-notice-title">
                Guest Mode — Local Vendor & Technician Contacts Masked
              </div>
              <div className="guest-notice-sub">
                Browse local vendors, brand specializations, and service locations. Direct phone numbers and WhatsApp connections are protected for eye care doctors.
              </div>
            </div>
          </div>
          <button 
            className="btn-guest-unlock"
            onClick={onOpenAuth}
            id="btn-guest-unlock-vendors"
          >
            <ShieldCheck size={16} />
            <span>Doctor Login</span>
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="filter-search-container">
        <div className="search-input-row">
          <div className="search-input-wrapper">
            <Search size={20} className="search-icon-svg" />
            <input 
              type="text"
              className="main-search-input"
              placeholder="Search by equipment (e.g. Phaco, Zeiss, Autoclave, OCT, Microscope, Probe, Camera, Canon)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              id="input-vendor-search"
            />
          </div>

          <select 
            className="filter-select"
            value={selectedCity}
            onChange={e => setSelectedCity(e.target.value)}
            id="select-vendor-city"
          >
            <option value="All">All Cities / Regions</option>
            {cities.filter(c => c !== 'All').map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Category Pills */}
        <div className="category-pills">
          {filterCategories.map(cat => (
            <button 
              key={cat}
              className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
              id={`vendor-cat-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
            >
              <span>{cat}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Vendor Cards Count & Results */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
          Showing <strong>{filteredVendors.length}</strong> local vendors & technicians • <em>Click card or rating to flip & view reviews</em>
        </div>

        {(searchQuery || selectedCategory !== 'All' || selectedCity !== 'All') && (
          <button 
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setSelectedCity('All');
            }}
            style={{ fontSize: '0.8rem', color: '#0284c7', fontWeight: 600 }}
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Vendors Grid */}
      {filteredVendors.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <Wrench size={48} style={{ margin: '0 auto 16px auto', color: '#94a3b8' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
            No Technician Found Matching Your Query
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '6px' }}>
            Try searching for broader terms like "Zeiss", "Phaco", "Microscope", or clear city filters.
          </p>
        </div>
      ) : (
        <div className="vendor-grid">
          {(currentDoctor ? filteredVendors : filteredVendors.slice(0, 3)).map(vendor => {
            const primaryPhone = vendor.phones?.[0]?.replace(/\D/g, '') || '';
            const waText = encodeURIComponent(
              `Hello ${vendor.name} (${vendor.company}), I found your profile in the MOS Connect Ophthalmic Service Directory (Supported by Opticura). I need assistance with ophthalmic equipment service/spares.`
            );
            const waLink = `https://wa.me/91${primaryPhone.slice(-10)}?text=${waText}`;
            const callLink = `tel:+91${primaryPhone.slice(-10)}`;
            const isFlipped = flippedVendorIds.has(vendor.id);
            const reviews = getVendorReviews(vendor.id);
            const avgRating = reviews.length > 0
              ? (reviews.reduce((sum, r) => sum + (r.rating || 5), 0) / reviews.length).toFixed(1)
              : '5.0';

            return (
              <div 
                key={`${vendor.id}-${reviewsVersion}`} 
                className={`vendor-flip-wrapper ${isFlipped ? 'is-flipped' : ''}`}
                id={`vendor-card-wrapper-${vendor.id}`}
              >
                <div className="vendor-flip-inner">
                  {/* FRONT SIDE OF VENDOR CARD */}
                  <div 
                    className="vendor-card-front"
                    onClick={(e) => {
                      // Flip card if user didn't click directly on a contact button or link
                      if (!e.target.closest('button') && !e.target.closest('a')) {
                        toggleFlip(vendor.id);
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="vendor-card-header">
                      <div>
                        <h3 className="vendor-name">{vendor.name}</h3>
                        <div className="vendor-company">{vendor.company}</div>
                      </div>
                      {vendor.badge && (
                        <span className="vendor-badge-pill">
                          {vendor.badge}
                        </span>
                      )}
                    </div>

                    {/* Rating Pill with Flip Trigger */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '8px 0 12px 0' }}>
                      <button 
                        type="button"
                        className="vendor-flip-trigger-pill"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFlip(vendor.id);
                        }}
                        title="Click to flip card and view doctor reviews"
                      >
                        <Star size={13} fill="#166534" />
                        <span>⭐ {avgRating} ({reviews.length} Reviews)</span>
                        <RotateCw size={12} style={{ marginLeft: '2px' }} />
                      </button>

                      <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                        Click card to flip ↻
                      </span>
                    </div>

                    {/* Location & Coverage */}
                    <div className="vendor-location-info">
                      <MapPin size={14} color="#0284c7" />
                      <span><strong>{vendor.city}</strong></span>
                      {vendor.coverage && <span style={{ color: '#64748b' }}>• {vendor.coverage}</span>}
                    </div>

                    {/* Equipment Categories & Brands Chips */}
                    <div className="vendor-tags-row">
                      {vendor.categories?.map((cat, i) => (
                        <span key={i} className="vendor-cat-chip">
                          🔧 {cat}
                        </span>
                      ))}
                      {vendor.brands?.map((b, i) => (
                        <span key={i} className="vendor-brand-chip">
                          {b}
                        </span>
                      ))}
                    </div>

                    {/* Description & Doctor Recommendations */}
                    <p className="vendor-desc">
                      {vendor.description}
                    </p>

                    {/* Experience & Address */}
                    <div style={{ fontSize: '0.78rem', color: '#475569', marginBottom: '14px', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', border: '1px solid #f1f5f9', marginTop: 'auto' }}>
                      {vendor.experience && (
                        <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '2px' }}>
                          Experience: {vendor.experience}
                        </div>
                      )}
                      {vendor.address && (
                        <div style={{ color: '#64748b' }}>
                          📍 {vendor.address}
                        </div>
                      )}
                    </div>

                    {/* Contact Actions (Triggers Review Prompt Modal on click) */}
                    <div className="vendor-card-footer" onClick={e => e.stopPropagation()}>
                      {currentDoctor ? (
                        <>
                          <button 
                            type="button"
                            onClick={() => handleContactAction(vendor, 'wa', waLink)}
                            className="btn-vendor-wa"
                            id={`btn-wa-vendor-${vendor.id}`}
                            style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                          >
                            <WhatsAppIcon size={17} />
                            <span>WhatsApp</span>
                          </button>

                          <button 
                            type="button"
                            onClick={() => handleContactAction(vendor, 'call', callLink)}
                            className="btn-vendor-call"
                            id={`btn-call-vendor-${vendor.id}`}
                            style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                          >
                            <Phone size={15} />
                            <span>Call: {vendor.phones?.[0]?.replace('+91', '') || 'Contact'}</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            type="button"
                            className="btn-vendor-wa"
                            onClick={onOpenAuth}
                            id={`btn-wa-vendor-${vendor.id}`}
                            title="Log in with MOS credentials to connect on WhatsApp"
                            style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                          >
                            <Lock size={15} />
                            <span>WhatsApp</span>
                          </button>

                          <button 
                            type="button"
                            className="btn-vendor-call"
                            onClick={onOpenAuth}
                            id={`btn-call-vendor-${vendor.id}`}
                            title="Log in with MOS credentials to call engineer"
                            style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                          >
                            <Lock size={14} />
                            <span>Call: {maskPhone(primaryPhone, false)}</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* BACK SIDE OF VENDOR CARD (DOCTOR REVIEWS & RATINGS) */}
                  <div className="vendor-card-back">
                    <div className="vendor-reviews-header">
                      <div>
                        <div style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Doctor Reviews & Ratings
                        </div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: '2px 0 0 0' }}>
                          {vendor.name}
                        </h4>
                      </div>

                      <button 
                        type="button"
                        className="btn-card-turnback"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFlip(vendor.id);
                        }}
                      >
                        <RotateCw size={13} />
                        <span>Flip Back</span>
                      </button>
                    </div>

                    {/* Overall Score Summary */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '8px', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8' }}>{avgRating}</span>
                        <div style={{ color: '#fbbf24', fontSize: '0.85rem' }}>★★★★★</div>
                      </div>
                      <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                        {reviews.length} Verified Surgeon Feedback
                      </span>
                    </div>

                    {/* Scrollable Reviews List */}
                    <div className="vendor-reviews-scroll">
                      {reviews.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94a3b8', fontSize: '0.85rem' }}>
                          No reviews yet. Be the first surgeon to share feedback!
                        </div>
                      ) : (
                        reviews.map((rev) => (
                          <div key={rev.id} className="vendor-review-item">
                            <div className="vendor-review-meta">
                              <span className="vendor-review-author">{rev.doctorName}</span>
                              <span className="vendor-review-stars">
                                {'★'.repeat(rev.rating || 5)}{'☆'.repeat(5 - (rev.rating || 5))}
                              </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b', marginBottom: '6px' }}>
                              <span>{rev.membershipNo ? `MOS #${rev.membershipNo}` : ''} {rev.city ? `• ${rev.city}` : ''}</span>
                              <span>{rev.date}</span>
                            </div>
                            <p className="vendor-review-text">
                              "{rev.comment}"
                            </p>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Bottom Action Strip on Back */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                      <button 
                        type="button"
                        className="btn-add-review-cta"
                        onClick={(e) => {
                          e.stopPropagation();
                          openReviewModal(vendor);
                        }}
                      >
                        <MessageSquarePlus size={15} />
                        <span>+ Write Review</span>
                      </button>

                      <button 
                        type="button"
                        className="btn-card-turnback"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFlip(vendor.id);
                        }}
                        style={{ whiteSpace: 'nowrap' }}
                      >
                        <span>Profile</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Membership Gate for Technicians */}
          {!currentDoctor && filteredVendors.length > 3 && (
            <div className="pluckcard-locked-gate-card" id="vendors-lock-gate">
              <div className="locked-gate-icon">
                <Lock size={30} />
              </div>
              <span className="locked-gate-tag">MOS MEMBER EXCLUSIVE SERVICE DIRECTORY</span>
              <h3 className="locked-gate-title">
                +{filteredVendors.length - 3} More Biomedical Technicians & Engineers Protected
              </h3>
              <p className="locked-gate-desc">
                Direct contact numbers, WhatsApp service dispatch links, and local vendor coverage areas across Maharashtra are restricted to registered eye doctors.
              </p>
              <button 
                className="btn-locked-gate-login"
                onClick={onOpenAuth}
                id="btn-gate-login-vendors"
              >
                <ShieldCheck size={18} />
                <span>Doctor Login to Access Full Directory ({filteredVendors.length})</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Review Modal Prompt */}
      {reviewModalVendor && (
        <div className="modal-overlay" onClick={() => setReviewModalVendor(null)}>
          <div 
            className="modal-card" 
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '480px', padding: '0', overflow: 'hidden' }}
          >
            <div className="modal-header" style={{ background: 'linear-gradient(135deg, #091a2f 0%, #0d2847 100%)', color: '#ffffff', padding: '18px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
                  <Star size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                    Leave Technician Review
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    {reviewModalVendor.name} • {reviewModalVendor.company}
                  </div>
                </div>
              </div>

              <button 
                className="btn-modal-close"
                onClick={() => setReviewModalVendor(null)}
                style={{ color: '#ffffff' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} style={{ padding: '22px' }}>
              {reviewSuccessMsg ? (
                <div style={{ textAlign: 'center', padding: '20px 10px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
                    <Check size={28} />
                  </div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Thank You Doctor!</h4>
                  <p style={{ fontSize: '0.86rem', color: '#64748b', marginTop: '6px' }}>
                    Your review has been saved to the technician's record and card back.
                  </p>
                </div>
              ) : (
                <>
                  <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '16px', lineHeight: 1.5 }}>
                    Help fellow ophthalmic surgeons across Maharashtra by sharing your experience regarding punctuality, technical skill, spare parts quality, and AMC pricing.
                  </p>

                  {/* Rating Selector */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                      Overall Rating (1 - 5 Stars):
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          style={{
                            background: reviewRating >= star ? '#fef3c7' : '#f1f5f9',
                            border: reviewRating >= star ? '1px solid #f59e0b' : '1px solid #cbd5e1',
                            borderRadius: '8px',
                            padding: '8px 14px',
                            fontSize: '1.1rem',
                            cursor: 'pointer',
                            color: reviewRating >= star ? '#d97706' : '#94a3b8'
                          }}
                        >
                          ★
                        </button>
                      ))}
                      <span style={{ alignSelf: 'center', fontSize: '0.85rem', fontWeight: 700, color: '#0284c7', marginLeft: '6px' }}>
                        {reviewRating === 5 ? '5.0 — Excellent' : `${reviewRating}.0 / 5.0`}
                      </span>
                    </div>
                  </div>

                  {/* Doctor Name & City */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        Your Name:
                      </label>
                      <input 
                        type="text" 
                        value={reviewName}
                        onChange={e => setReviewName(e.target.value)}
                        placeholder="Dr. Full Name"
                        required
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        Hospital / City:
                      </label>
                      <input 
                        type="text" 
                        value={reviewCity}
                        onChange={e => setReviewCity(e.target.value)}
                        placeholder="e.g. Pune / Mumbai"
                        required
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>

                  {/* Review Text */}
                  <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Your Clinical Experience / Feedback:
                    </label>
                    <textarea 
                      rows={3}
                      value={reviewComment}
                      onChange={e => setReviewComment(e.target.value)}
                      placeholder="e.g., Calibrated our Zeiss Lumera microscope and repaired Phaco handpiece within 24 hours. Very courteous and skilled technician."
                      required
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontFamily: 'inherit', resize: 'vertical' }}
                    />
                  </div>

                  {/* Buttons */}
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button 
                      type="button" 
                      onClick={() => setReviewModalVendor(null)}
                      style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <CheckCircle2 size={15} />
                      <span>Post Verified Review</span>
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
