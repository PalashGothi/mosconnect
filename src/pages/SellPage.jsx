import React, { useState } from 'react';
import { 
  PlusCircle, 
  ListChecks, 
  Sparkles, 
  ShieldCheck, 
  Image as ImageIcon, 
  Tag, 
  IndianRupee, 
  Eye, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  Clock,
  MapPin,
  Camera,
  Layers,
  ArrowRight,
  Lock
} from 'lucide-react';
import Pluckcard from '../components/Pluckcard';

// Preset sample photos for quick medical ad creation
const PRESET_EQUIPMENT_PHOTOS = [
  { label: 'Operating Microscope', url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80' },
  { label: 'Phacoemulsification System', url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop&q=80' },
  { label: 'Slit Lamp Stereoscopic', url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80' },
  { label: 'Retinal Fundus Camera / OCT', url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80' },
  { label: 'Autorefractometer / Keratometer', url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=80' },
  { label: 'YAG / Green Laser System', url: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&auto=format&fit=crop&q=80' }
];

export default function SellPage({ 
  currentDoctor, 
  listings, 
  onAddListing, 
  onDeleteListing,
  onUpdateStatus,
  onOpenAuth,
  onViewOnBuyPage
}) {
  const [activeSubTab, setActiveSubTab] = useState('post'); // 'post' or 'my-listings'
  const [successToast, setSuccessToast] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'Microscopes',
    brand: 'Zeiss',
    model: '',
    year: '2021',
    price: '',
    isNegotiable: true,
    condition: 'Like New (Mint)',
    warranty: 'Under Active AMC',
    description: '',
    accessoriesText: 'Foot switch, Dust cover, Manual',
    image: PRESET_EQUIPMENT_PHOTOS[0].url,
    clinicName: 'My Eye Clinic'
  });

  // Filter listings posted by this doctor
  const myDoctorListings = listings.filter(l => 
    currentDoctor && (
      l.sellerMembershipNo === currentDoctor.membershipNo ||
      l.sellerMobile === currentDoctor.mobile ||
      l.sellerName?.toLowerCase() === currentDoctor.name?.toLowerCase()
    )
  );

  const categories = [
    'Microscopes',
    'Phaco Machines',
    'Slit Lamps',
    'OCT & Fundus',
    'Autoref / Biometry',
    'Lasers',
    'Chair Units',
    'Autoclave / CSSD',
    'Cameras & Imaging'
  ];

  const brands = [
    'Zeiss',
    'Alcon',
    'Topcon',
    'Haag-Streit',
    'Leica',
    'Nidek',
    'AMO / Johnson & Johnson',
    'Appasamy',
    'Takagi',
    'Ellex',
    'Huvitz',
    'Other Brand'
  ];

  const handleInputChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleSubmitAd = (e) => {
    e.preventDefault();
    if (!currentDoctor) {
      onOpenAuth();
      return;
    }

    if (!formData.title || !formData.price) {
      alert('Please fill in the equipment title and asking price.');
      return;
    }

    const priceNum = Number(formData.price.replace(/[^\d]/g, '')) || 0;
    const accessoriesArray = formData.accessoriesText
      ? formData.accessoriesText.split(',').map(s => s.trim()).filter(Boolean)
      : ['Standard Accessories'];

    const newListing = {
      id: `list-${Date.now()}`,
      title: formData.title,
      category: formData.category,
      brand: formData.brand,
      model: formData.model || 'Standard Model',
      year: Number(formData.year) || 2021,
      price: priceNum,
      priceFormatted: `₹ ${priceNum.toLocaleString('en-IN')}`,
      isNegotiable: formData.isNegotiable,
      condition: formData.condition,
      warranty: formData.warranty,
      description: formData.description || 'Verified ophthalmic equipment available for immediate clinic inspection.',
      sellerName: currentDoctor.name,
      sellerMembershipNo: currentDoctor.membershipNo,
      sellerCity: currentDoctor.city || 'Maharashtra',
      sellerMobile: currentDoctor.mobile,
      sellerEmail: currentDoctor.email,
      clinicName: formData.clinicName || `${currentDoctor.name}'s Eye Hospital`,
      image: formData.image,
      accessories: accessoriesArray,
      status: 'Available',
      createdAt: new Date().toISOString(),
      views: 1,
      inquiries: 0
    };

    onAddListing(newListing);
    setSuccessToast(`Ad published! "${newListing.title}" is now live on the Buy page as a Pluckcard.`);
    
    // Switch to My Listings
    setActiveSubTab('my-listings');
    setTimeout(() => setSuccessToast(''), 5000);
  };

  // Preview Listing Object for Live Pluckcard
  const previewListing = {
    id: 'preview-sample',
    title: formData.title || 'Equipment Title Preview',
    category: formData.category,
    brand: formData.brand,
    model: formData.model || 'Model / Series',
    year: formData.year || 2022,
    priceFormatted: formData.price ? `₹ ${Number(formData.price.replace(/[^\d]/g, '') || 0).toLocaleString('en-IN')}` : '₹ Price on Request',
    isNegotiable: formData.isNegotiable,
    condition: formData.condition,
    warranty: formData.warranty,
    description: formData.description || 'Equipment specifications, optic clarity, clinical usage and service details will appear here.',
    sellerName: currentDoctor?.name || 'Dr. Verified MOS Member',
    sellerMembershipNo: currentDoctor?.membershipNo || '3761',
    sellerCity: currentDoctor?.city || 'Mumbai, Maharashtra',
    sellerMobile: currentDoctor?.mobile || '9999999999',
    clinicName: formData.clinicName || 'Ophthalmic Clinic',
    image: formData.image,
    accessories: formData.accessoriesText ? formData.accessoriesText.split(',').map(s => s.trim()).filter(Boolean) : ['Foot Pedal', 'Dust Cover'],
    status: 'Available'
  };

  // If user is a guest, render the high-converting Member Seller Gateway instead of raw form
  if (!currentDoctor) {
    return (
      <div className="seller-gateway-container">
        {/* Gateway hero banner */}
        <div className="seller-gateway-hero">
          <div className="seller-gateway-badge">
            <ShieldCheck size={16} />
            <span>Official MOS Doctor Seller Portal</span>
          </div>
          <h2 className="seller-gateway-title">
            List Your Equipment for Sale to <span>3,745 Verified Doctors</span> Across Maharashtra
          </h2>
          <p className="seller-gateway-subtitle">
            Post your surgical microscope, phaco machine, slit lamp, or laser directly to fellow practicing ophthalmologists. Zero commission, verified doctor credentials, and direct WhatsApp buyer inquiries.
          </p>

          <div className="seller-gateway-cta-row">
            <button 
              className="btn-gateway-login-main"
              onClick={onOpenAuth}
              id="btn-seller-gateway-login"
            >
              <Lock size={18} />
              <span>Log In with MOS ID to Post Equipment</span>
            </button>
            <button 
              className="btn-gateway-browse-sample"
              onClick={onViewOnBuyPage}
            >
              <span>Browse Existing Equipment →</span>
            </button>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="seller-benefits-grid">
          <div className="seller-benefit-card">
            <div className="seller-benefit-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
              <Eye size={22} />
            </div>
            <h4>Exclusively Ophthalmology Doctors</h4>
            <p>Direct access to 3,745 verified MOS members in Mumbai, Pune, Nagpur, Nashik looking for equipment.</p>
          </div>

          <div className="seller-benefit-card">
            <div className="seller-benefit-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
              <CheckCircle size={22} />
            </div>
            <h4>Zero Brokerage / 100% Direct</h4>
            <p>Negotiate directly on WhatsApp or call with fellow doctors. No middlemen, no commissions, no delayed payments.</p>
          </div>

          <div className="seller-benefit-card">
            <div className="seller-benefit-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
              <ShieldCheck size={22} />
            </div>
            <h4>Verified Peer Trust</h4>
            <p>Your listing displays an official MOS verified badge with your membership number, establishing immediate trust.</p>
          </div>
        </div>

        {/* Live Preview Teaser Card */}
        <div className="seller-preview-teaser-wrap">
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <span className="brand-pill">PREVIEW YOUR PLUCKCARD</span>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
              How Your Equipment Will Appear to Fellow Doctors
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Your listing gets transformed into an interactive Pluckcard on the Buy page, with verified specifications and direct WhatsApp inquiry buttons.
            </p>
          </div>

          <div style={{ maxWidth: '440px', margin: '0 auto' }}>
            <Pluckcard 
              listing={previewListing}
              isSaved={false}
              onToggleSave={() => {}}
              onOpenDetails={() => {}}
              currentDoctor={{ name: 'Dr. (Your Name)', membershipNo: '••••', city: 'Your City' }}
              onOpenAuth={onOpenAuth}
            />
          </div>

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <button 
              className="btn-gateway-login-main"
              onClick={onOpenAuth}
              style={{ margin: '0 auto' }}
              id="btn-seller-gateway-login-bottom"
            >
              <ShieldCheck size={18} />
              <span>Log In with MOS ID to List Your Equipment</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Top Banner & Tab Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
            Equipment Seller Portal & My Listings
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '2px' }}>
            Post your ad to be displayed as an official Pluckcard on the Buy page and manage your active equipment.
          </p>
        </div>

        {/* Sub-tab Pills */}
        <div style={{ display: 'flex', background: '#e2e8f0', padding: '4px', borderRadius: '9999px' }}>
          <button 
            style={{
              padding: '8px 20px',
              borderRadius: '9999px',
              fontWeight: 700,
              fontSize: '0.86rem',
              background: activeSubTab === 'post' ? '#0f172a' : 'transparent',
              color: activeSubTab === 'post' ? '#ffffff' : '#475569',
              transition: 'all 0.2s ease'
            }}
            onClick={() => setActiveSubTab('post')}
            id="tab-post-new-ad"
          >
            + Post New Equipment Ad
          </button>
          <button 
            style={{
              padding: '8px 20px',
              borderRadius: '9999px',
              fontWeight: 700,
              fontSize: '0.86rem',
              background: activeSubTab === 'my-listings' ? '#0f172a' : 'transparent',
              color: activeSubTab === 'my-listings' ? '#ffffff' : '#475569',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onClick={() => setActiveSubTab('my-listings')}
            id="tab-my-listings"
          >
            <ListChecks size={16} />
            <span>My Equipment Listings ({myDoctorListings.length})</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successToast && (
        <div className="otp-sim-toast" style={{ borderLeftColor: '#10b981', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle size={20} color="#10b981" />
            <span style={{ fontSize: '0.92rem', fontWeight: 600 }}>{successToast}</span>
          </div>
          <button 
            onClick={onViewOnBuyPage}
            style={{ background: '#10b981', color: '#ffffff', padding: '6px 14px', borderRadius: '6px', fontWeight: 700, fontSize: '0.8rem' }}
          >
            View on Buy Page →
          </button>
        </div>
      )}

      {/* VIEW 1: POST NEW AD FORM WITH LIVE PLUCKCARD PREVIEW */}
      {activeSubTab === 'post' && (
        <div className="sell-layout">
            {/* Form Side */}
            <div className="sell-form-card">
              <form onSubmit={handleSubmitAd}>
              {/* Doctor Session Verification Bar */}
              <div style={{ background: '#f0fdfa', border: '1px solid #99f6e4', padding: '14px 18px', borderRadius: '12px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0d9488' }}>
                    POSTING AS VERIFIED SELLER
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                    {currentDoctor?.name || 'Guest Eye Doctor'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#334155' }}>
                    MOS #{currentDoctor?.membershipNo || 'Pending'} • 📍 {currentDoctor?.city || 'Maharashtra'} • +91 {currentDoctor?.mobile || ''}
                  </div>
                </div>
                {!currentDoctor && (
                  <button 
                    type="button" 
                    className="btn-login-gate" 
                    onClick={onOpenAuth}
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  >
                    Verify Doctor ID
                  </button>
                )}
              </div>

              {/* SECTION 1: EQUIPMENT IDENTITY */}
              <div className="form-section-title">
                <Tag size={18} color="#0284c7" />
                <span>1. Equipment Identity & Specifications</span>
              </div>

              <div className="form-group">
                <label className="form-label">Equipment Title / Name *</label>
                <input 
                  type="text"
                  className="form-input"
                  placeholder="e.g. Carl Zeiss OPMI Lumera 700 Surgical Microscope"
                  required
                  value={formData.title}
                  onChange={e => handleInputChange('title', e.target.value)}
                  id="input-sell-title"
                />
              </div>

              <div className="form-row-3">
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select 
                    className="form-select"
                    value={formData.category}
                    onChange={e => handleInputChange('category', e.target.value)}
                    id="select-sell-category"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Brand / Manufacturer *</label>
                  <select 
                    className="form-select"
                    value={formData.brand}
                    onChange={e => handleInputChange('brand', e.target.value)}
                    id="select-sell-brand"
                  >
                    {brands.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Mfg / Purchase Year</label>
                  <input 
                    type="number"
                    className="form-input"
                    placeholder="2021"
                    value={formData.year}
                    onChange={e => handleInputChange('year', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Model Name / Optical Variant</label>
                <input 
                  type="text"
                  className="form-input"
                  placeholder="e.g. Lumera 700 with SCI and Stereo Co-Observer"
                  value={formData.model}
                  onChange={e => handleInputChange('model', e.target.value)}
                />
              </div>

              {/* SECTION 2: PRICING & CONDITION */}
              <div className="form-section-title" style={{ marginTop: '28px' }}>
                <IndianRupee size={18} color="#059669" />
                <span>2. Asking Price & Clinical Condition</span>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Asking Price (₹ INR) *</label>
                  <input 
                    type="text"
                    className="form-input"
                    placeholder="e.g. 18,50,000"
                    required
                    value={formData.price}
                    onChange={e => handleInputChange('price', e.target.value)}
                    id="input-sell-price"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Clinical Condition</label>
                  <select 
                    className="form-select"
                    value={formData.condition}
                    onChange={e => handleInputChange('condition', e.target.value)}
                    id="select-sell-condition"
                  >
                    <option value="Like New (Mint)">Like New (Mint Condition)</option>
                    <option value="Refurbished - Certified">Refurbished - Certified</option>
                    <option value="Excellent Working Condition">Excellent Working Condition</option>
                    <option value="Good Working Condition">Good Working Condition</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '10px' }}>
                  <input 
                    type="checkbox"
                    id="check-negotiable"
                    checked={formData.isNegotiable}
                    onChange={e => handleInputChange('isNegotiable', e.target.checked)}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <label htmlFor="check-negotiable" style={{ fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' }}>
                    Price is Negotiable
                  </label>
                </div>

                <div className="form-group">
                  <label className="form-label">Warranty / AMC Status</label>
                  <input 
                    type="text"
                    className="form-input"
                    placeholder="e.g. Under Active Zeiss AMC / 6 Months Guarantee"
                    value={formData.warranty}
                    onChange={e => handleInputChange('warranty', e.target.value)}
                  />
                </div>
              </div>

              {/* SECTION 3: ACCESSORIES & PHOTOS */}
              <div className="form-section-title" style={{ marginTop: '28px' }}>
                <Camera size={18} color="#6366f1" />
                <span>3. Equipment Photos & Included Accessories</span>
              </div>

              <div className="form-group">
                <label className="form-label">Select Equipment Photo Preset or Paste Custom Photo URL</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
                  {PRESET_EQUIPMENT_PHOTOS.map((preset, idx) => (
                    <div 
                      key={idx}
                      onClick={() => handleInputChange('image', preset.url)}
                      style={{
                        padding: '6px',
                        border: formData.image === preset.url ? '2px solid #0284c7' : '1px solid #e2e8f0',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        background: '#f8fafc',
                        textAlign: 'center'
                      }}
                    >
                      <img src={preset.url} alt={preset.label} style={{ width: '100%', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                      <div style={{ fontSize: '0.72rem', fontWeight: 600, marginTop: '4px', color: '#334155' }}>
                        {preset.label}
                      </div>
                    </div>
                  ))}
                </div>
                <input 
                  type="text"
                  className="form-input"
                  placeholder="https://example.com/photo.jpg"
                  value={formData.image}
                  onChange={e => handleInputChange('image', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Included Accessories (comma separated)</label>
                <input 
                  type="text"
                  className="form-input"
                  placeholder="Foot switch, Dust cover, Beam Splitter, Spare Halogen bulb, Calibration Bar"
                  value={formData.accessoriesText}
                  onChange={e => handleInputChange('accessoriesText', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Clinical Description & Hospital Details</label>
                <textarea 
                  className="form-textarea"
                  rows={4}
                  placeholder="Mention why you are selling (e.g. upgrading to new Centurion), optics condition, service logs, doctor inspection timing..."
                  value={formData.description}
                  onChange={e => handleInputChange('description', e.target.value)}
                ></textarea>
              </div>

              {/* Submit button */}
              <button 
                type="submit"
                className="btn-post-ad"
                style={{ width: '100%', padding: '14px', fontSize: '1rem', marginTop: '16px', justifyContent: 'center' }}
                id="btn-submit-sell-ad"
              >
                <PlusCircle size={20} />
                <span>Publish Ad to Buy Page as Pluckcard</span>
              </button>
            </form>
          </div>

          {/* Live Pluckcard Preview Side */}
          <div className="live-preview-panel">
            <div className="preview-badge-header">
              <Sparkles size={16} color="#0284c7" />
              <span>Live Pluckcard Preview (What Buyers Will See)</span>
            </div>

            <Pluckcard 
              listing={previewListing}
              isSaved={false}
              onToggleSave={() => {}}
              onOpenDetails={() => {}}
              currentDoctor={currentDoctor}
              onOpenAuth={onOpenAuth}
            />

            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#64748b' }}>
              ℹ️ <strong>Peer Protection</strong>: Only verified MOS members can post equipment. Your MOS Membership Number and city will be attached to guarantee genuine clinical origin.
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: MY EQUIPMENT LISTINGS (SELLER PROFILE DASHBOARD) */}
      {activeSubTab === 'my-listings' && (
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                Your Listed Equipments ({myDoctorListings.length})
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Manage advertisements you have posted. You can update availability or mark as sold.
              </p>
            </div>

            <button 
              className="btn-post-ad"
              onClick={() => setActiveSubTab('post')}
            >
              <PlusCircle size={16} />
              <span>+ Post Another Equipment</span>
            </button>
          </div>

          {myDoctorListings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
              <Layers size={48} style={{ margin: '0 auto 12px auto', color: '#cbd5e1' }} />
              <h4>You Have No Active Equipment Listings Yet</h4>
              <p style={{ fontSize: '0.88rem', marginTop: '4px', marginBottom: '16px' }}>
                Post your surgical microscope, phaco machine, or slit lamp to reach 3,745 eye doctors across Maharashtra.
              </p>
              <button 
                className="btn-post-ad"
                onClick={() => setActiveSubTab('post')}
              >
                Post Your First Equipment Ad
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {myDoctorListings.map(item => (
                <div 
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    background: item.status === 'Sold' ? '#f8fafc' : '#ffffff',
                    gap: '16px',
                    flexWrap: 'wrap'
                  }}
                  id={`my-listing-item-${item.id}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="brand-pill">{item.brand}</span>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>{item.title}</h4>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
                        Listed: {item.priceFormatted} • Model: {item.model} • {item.condition}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span 
                      style={{
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        background: item.status === 'Sold' ? '#fee2e2' : item.status === 'Reserved' ? '#fef3c7' : '#ecfdf5',
                        color: item.status === 'Sold' ? '#ef4444' : item.status === 'Reserved' ? '#d97706' : '#059669'
                      }}
                    >
                      ● {item.status || 'Available'}
                    </span>

                    {item.status !== 'Sold' && (
                      <button 
                        style={{ padding: '6px 12px', background: '#f1f5f9', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}
                        onClick={() => onUpdateStatus(item.id, 'Sold')}
                      >
                        Mark Sold
                      </button>
                    )}

                    {item.status === 'Sold' && (
                      <button 
                        style={{ padding: '6px 12px', background: '#ecfdf5', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, color: '#059669' }}
                        onClick={() => onUpdateStatus(item.id, 'Available')}
                      >
                        Re-List as Available
                      </button>
                    )}

                    <button 
                      style={{ padding: '8px', color: '#e11d48' }}
                      onClick={() => onDeleteListing(item.id)}
                      title="Delete Listing"
                      id={`btn-delete-listing-${item.id}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
