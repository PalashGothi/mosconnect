import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  ArrowUpDown, 
  CheckCircle2, 
  ShieldCheck, 
  HelpCircle,
  MessageSquareQuote,
  Eye,
  Building2,
  Phone,
  X,
  Sparkles,
  Calendar,
  MapPin, 
  Lock,
  Edit2
} from 'lucide-react';
import Pluckcard from '../components/Pluckcard';
import EquipmentDetailsModal from '../components/EquipmentDetailsModal';
import WhatsAppIcon from '../components/WhatsAppIcon';
import OpticuraLogo from '../components/OpticuraLogo';
import OpticuraShowcaseModal from '../components/OpticuraShowcaseModal';
import { maskPhone, maskMembershipNo, maskDoctorName, maskPrice } from '../utils/masking';

export default function BuyPage({ 
  listings, 
  savedItems, 
  onToggleSave, 
  currentDoctor, 
  onOpenWantedBoard,
  onOpenPostAd,
  onNavigateTab,
  onOpenAuth,
  onUpdateListing
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCondition, setSelectedCondition] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedListing, setSelectedListing] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isOpticuraModalOpen, setIsOpticuraModalOpen] = useState(false);
  const [selectedOpticuraId, setSelectedOpticuraId] = useState(null);
  const [editingListing, setEditingListing] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [successToast, setSuccessToast] = useState('');
  const [editFormData, setEditFormData] = useState({
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
    accessoriesText: '',
    clinicName: '',
    sellerCity: '',
    sellerMobile: '',
    status: 'Available'
  });

  const editCategories = [
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

  const editBrands = [
    'Zeiss',
    'Alcon',
    'Topcon',
    'Haag-Streit',
    'Leica',
    'Nidek',
    'Appasamy Associates',
    'Heidelberg Engineering',
    'Keeler',
    'Takagi',
    'Bausch + Lomb',
    'Tomey',
    'Canon Medical',
    'Optopol',
    'Other'
  ];

  const handleStartEdit = (item) => {
    setEditingListing(item);
    setEditFormData({
      title: item.title || '',
      category: item.category || 'Microscopes',
      brand: item.brand || 'Zeiss',
      model: item.model || '',
      year: item.year || '2021',
      price: item.price ? String(item.price) : '',
      isNegotiable: item.isNegotiable !== false,
      condition: item.condition || 'Like New (Mint)',
      warranty: item.warranty || 'Under Active AMC',
      description: item.description || '',
      accessoriesText: Array.isArray(item.accessories) ? item.accessories.join(', ') : (item.accessories || ''),
      clinicName: item.clinicName || '',
      sellerCity: item.sellerCity || currentDoctor?.city || 'Maharashtra',
      sellerMobile: item.sellerMobile || currentDoctor?.mobile || '',
      status: item.status || 'Available'
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingListing) return;
    const priceNum = Number(String(editFormData.price || '').replace(/[^\d]/g, '')) || 0;
    const accessoriesArray = editFormData.accessoriesText
      ? editFormData.accessoriesText.split(',').map(s => s.trim()).filter(Boolean)
      : (editingListing.accessories || ['Standard Accessories']);

    const updatedListing = {
      ...editingListing,
      title: editFormData.title.trim(),
      category: editFormData.category,
      brand: editFormData.brand,
      model: editFormData.model.trim() || 'Standard Model',
      year: Number(editFormData.year) || 2021,
      price: priceNum,
      priceFormatted: `₹ ${priceNum.toLocaleString('en-IN')}`,
      isNegotiable: editFormData.isNegotiable,
      condition: editFormData.condition,
      warranty: editFormData.warranty,
      description: editFormData.description.trim(),
      accessories: accessoriesArray,
      clinicName: editFormData.clinicName.trim(),
      sellerCity: editFormData.sellerCity.trim(),
      sellerMobile: editFormData.sellerMobile.trim(),
      status: editFormData.status || editingListing.status || 'Available',
      image: editingListing.image,
      images: editingListing.images,
      updatedAt: new Date().toISOString()
    };

    if (onUpdateListing) {
      onUpdateListing(updatedListing);
    }
    setShowEditModal(false);
    setEditingListing(null);
    setSuccessToast(`Price & Ad updated! "${updatedListing.title}" (${updatedListing.priceFormatted}) has been saved and synced to cloud.`);
    setTimeout(() => setSuccessToast(''), 5000);
  };

  const handleOpenEquipmentDetails = (listing) => {
    setSelectedListing(listing);
    setIsDetailsModalOpen(true);
  };

  const categories = [
    'All',
    'Microscopes',
    'Phaco Machines',
    'Slit Lamps',
    'OCT & Fundus',
    'Autoref / Biometry',
    'Lasers',
    'Chair Units',
    'Autoclave / CSSD'
  ];

  // Distinct cities from listings
  const cities = useMemo(() => {
    const set = new Set(listings.map(l => l.sellerCity).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [listings]);

  // Filter and sort listings
  const filteredListings = useMemo(() => {
    return listings.filter(item => {
      // Category filter
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }
      // Condition filter
      if (selectedCondition !== 'All') {
        if (selectedCondition === 'Mint' && !item.condition?.toLowerCase().includes('mint')) return false;
        if (selectedCondition === 'Refurbished' && !item.condition?.toLowerCase().includes('refurbished')) return false;
        if (selectedCondition === 'Excellent' && !item.condition?.toLowerCase().includes('excellent')) return false;
      }
      // City filter
      if (selectedCity !== 'All' && !item.sellerCity?.toLowerCase().includes(selectedCity.toLowerCase())) {
        return false;
      }
      // Text query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches = 
          item.title?.toLowerCase().includes(q) ||
          item.brand?.toLowerCase().includes(q) ||
          item.model?.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          item.sellerName?.toLowerCase().includes(q) ||
          item.sellerCity?.toLowerCase().includes(q) ||
          item.category?.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'price-low') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'price-high') return (b.price || 0) - (a.price || 0);
      return 0;
    });
  }, [listings, searchQuery, selectedCategory, selectedCondition, selectedCity, sortBy]);

  return (
    <div>
      {/* Equipment Marketplace Hero Banner */}
      <div className="hero-banner" style={{ background: 'linear-gradient(135deg, #091a2f 0%, #0d3858 100%)' }}>
        <div className="hero-content">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div className="hero-badge" style={{ background: 'rgba(56, 189, 248, 0.15)', borderColor: '#38bdf8', color: '#38bdf8', marginBottom: 0 }}>
              <ShieldCheck size={15} />
              <span>Pre-Owned Ophthalmic Equipment Marketplace • Supported by Opticura</span>
            </div>

            <OpticuraLogo variant="hero" height={32} />
          </div>

          <h2 className="hero-title" style={{ marginTop: '16px' }}>
            Buy Equipment
          </h2>
          <p className="hero-desc">
            Directly connect with 3,745+ eye surgeons across Maharashtra. Inspect surgical microscopes, phacoemulsifiers, OCT systems, and slit lamps with complete transparency, clinical logs, and zero brokerage.
          </p>

          <div className="hero-stats-row">
            <div className="hero-stat-item">
              <span className="hero-stat-num">3,745</span>
              <span className="hero-stat-label">MOS Approved Doctors</span>
            </div>
            <div className="hero-stat-item">
              <span className="hero-stat-num">{listings.length > 0 ? `${listings.length} Active` : 'Available OT'}</span>
              <span className="hero-stat-label">{listings.length > 0 ? 'Equipment Pluckcards' : 'Equipment Exchange'}</span>
            </div>
            <div className="hero-stat-item">
              <span className="hero-stat-num">0%</span>
              <span className="hero-stat-label">Direct Connect Fee</span>
            </div>
            <div className="hero-stat-item">
              <span className="hero-stat-num">100% Direct</span>
              <span className="hero-stat-label">Peer to Peer</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div id="equipment-filter-section" className="filter-search-container">
        <div className="search-input-row">
          <div className="search-input-wrapper">
            <Search size={20} className="search-icon-svg" />
            <input 
              type="text"
              className="main-search-input"
              placeholder="Search by equipment (e.g. Zeiss Lumera, Alcon Infiniti, Topcon, Slit Lamp, YAG Laser)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              id="input-buy-search"
            />
          </div>

          <select 
            className="filter-select"
            value={selectedCondition}
            onChange={e => setSelectedCondition(e.target.value)}
            id="select-condition-filter"
          >
            <option value="All">All Conditions</option>
            <option value="Mint">Mint / Like New</option>
            <option value="Refurbished">Refurbished - Certified</option>
            <option value="Excellent">Excellent Working</option>
          </select>

          <select 
            className="filter-select"
            value={selectedCity}
            onChange={e => setSelectedCity(e.target.value)}
            id="select-city-filter"
          >
            <option value="All">All Cities (Maharashtra)</option>
            {cities.filter(c => c !== 'All').map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select 
            className="filter-select"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            id="select-sort-filter"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>

        {/* Category Filter Pills */}
        <div className="category-pills">
          {categories.map(cat => (
            <button 
              key={cat}
              className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
              id={`cat-pill-${cat.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <span>{cat}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Requirement Board Prompt Strip (Only when listings are present) */}
      {listings.length > 0 && (
        <div className="wanted-board-prompt-banner">
          <div className="wanted-prompt-left">
            <div className="wanted-prompt-icon">
              <MessageSquareQuote size={22} />
            </div>
            <div>
              <h4 className="wanted-prompt-title">
                Can't find the exact equipment or model you are looking for?
              </h4>
              <p className="wanted-prompt-desc">
                Post what machine or equipment you need on our <strong>Doctors' Requirement Board</strong>. All 3,745 MOS members and verified technicians will be notified.
              </p>
            </div>
          </div>

          <button 
            className="btn-open-common-chat"
            onClick={onOpenWantedBoard}
            id="btn-goto-wanted-board"
          >
            <MessageSquareQuote size={16} />
            <span>Post Your Requirement Here</span>
          </button>
        </div>
      )}

      {/* Guest Mode Notice Strip (Only when listings exist) */}
      {!currentDoctor && listings.length > 0 && (
        <div className="guest-mode-notice-banner">
          <div className="guest-notice-left">
            <div className="guest-notice-icon">
              <Lock size={20} />
            </div>
            <div>
              <div className="guest-notice-title">
                Guest Mode — Doctor & Engineer Contacts Masked
              </div>
              <div className="guest-notice-sub">
                Equipment photos, clinical specs, and pricing are openly viewable. Direct WhatsApp chat and phone numbers are protected for verified MOS members.
              </div>
            </div>
          </div>
          <button 
            className="btn-guest-unlock"
            onClick={onOpenAuth}
            id="btn-guest-unlock-buy"
          >
            <ShieldCheck size={16} />
            <span>Doctor Login</span>
          </button>
        </div>
      )}

      {/* Pluckcard Equipment Grid */}
      {filteredListings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <HelpCircle size={48} style={{ margin: '0 auto 16px auto', color: '#94a3b8' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
            {listings.length === 0 
              ? 'No Pre-Owned Equipment Listed Yet' 
              : `No Equipment Found Matching "${searchQuery}"`}
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '6px', maxWidth: '520px', margin: '6px auto 20px auto' }}>
            {listings.length === 0
              ? 'Be the first doctor to list an ophthalmic machine, slit lamp, phaco unit, or clinic equipment for sale directly to peers.'
              : 'Try adjusting your search filters or post your requirement directly on the requirement board.'}
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              className="btn-open-common-chat"
              onClick={onOpenWantedBoard}
            >
              Post Your Requirement
            </button>
            {listings.length > 0 && (
              <button 
                className="btn-pluckcard-call"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setSelectedCondition('All');
                  setSelectedCity('All');
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="pluckcard-grid">
          {(currentDoctor ? filteredListings : filteredListings.slice(0, 3)).map(listing => (
            <Pluckcard 
              key={listing.id}
              listing={listing}
              isSaved={savedItems.includes(listing.id)}
              onToggleSave={onToggleSave}
              onOpenDetails={handleOpenEquipmentDetails}
              currentDoctor={currentDoctor}
              onOpenAuth={onOpenAuth}
              onEditListing={handleStartEdit}
            />
          ))}

          {/* Membership Gate Locked Card for Guests */}
          {!currentDoctor && filteredListings.length > 3 && (
            <div className="pluckcard-locked-gate-card" id="card-marketplace-lock-gate">
              <div className="locked-gate-icon">
                <Lock size={32} />
              </div>
              <span className="locked-gate-tag">MOS MEMBER EXCLUSIVE</span>
              <h3 className="locked-gate-title">
                +{filteredListings.length - 3} More Verified Machines Protected
              </h3>
              <p className="locked-gate-desc">
                Asking prices, doctor negotiation terms, and the remaining {filteredListings.length - 3} active listings are restricted to verified Maharashtra Ophthalmological Society members.
              </p>
              <ul className="locked-gate-benefits">
                <li>✓ Reveal all Asking Prices & Negotiation terms</li>
                <li>✓ Direct WhatsApp & Call to Seller Doctors</li>
                <li>✓ Optical clarity inspection & AMC logs</li>
              </ul>
              <button 
                className="btn-locked-gate-login"
                onClick={onOpenAuth}
                id="btn-gate-login-buy"
              >
                <ShieldCheck size={18} />
                <span>Doctor Login to Unlock All ({filteredListings.length})</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Equipment Details Modal with Full Specs, Photos & Contact */}
      <EquipmentDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        listing={selectedListing}
        currentDoctor={currentDoctor}
        onOpenAuth={onOpenAuth}
        onEditListing={handleStartEdit}
      />

      {/* Opticura Ophthalmic Products Showcase Modal */}
      <OpticuraShowcaseModal
        isOpen={isOpticuraModalOpen}
        onClose={() => setIsOpticuraModalOpen(false)}
        initialProductId={selectedOpticuraId}
      />

      {/* Success Notification Toast */}
      {successToast && (
        <div 
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
            color: '#ffffff',
            padding: '14px 20px',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '0.9rem',
            fontWeight: 600,
            maxWidth: '420px',
            animation: 'fadeIn 0.3s ease-out'
          }}
        >
          <CheckCircle2 size={20} color="#34d399" />
          <span>{successToast}</span>
          <button 
            type="button" 
            onClick={() => setSuccessToast('')} 
            style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', marginLeft: 'auto', display: 'flex' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Edit Listing Modal for Owner Doctors / Admin */}
      {showEditModal && editingListing && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)} style={{ zIndex: 1200 }}>
          <div 
            className="modal-card" 
            onClick={e => e.stopPropagation()} 
            style={{ 
              maxWidth: '750px', 
              width: '95%', 
              maxHeight: '90vh', 
              overflowY: 'auto', 
              borderRadius: '16px',
              padding: 0
            }}
          >
            <div 
              style={{ 
                background: 'linear-gradient(135deg, #091a2f 0%, #0d3858 100%)', 
                color: '#ffffff', 
                padding: '18px 24px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                borderBottom: '1px solid rgba(56, 189, 248, 0.2)'
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc' }}>
                  Edit Equipment Listing & Price
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                  Update asking price, condition, availability, or clinical details. Changes sync instantly across devices.
                </p>
              </div>
              <button 
                type="button"
                className="modal-close-btn"
                onClick={() => setShowEditModal(false)}
                style={{ 
                  background: 'rgba(255, 255, 255, 0.1)', 
                  border: 'none', 
                  borderRadius: '50%', 
                  color: '#fff', 
                  width: '32px', 
                  height: '32px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  cursor: 'pointer' 
                }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ padding: '24px' }}>
              <div className="form-group">
                <label className="form-label">Equipment Title *</label>
                <input 
                  type="text"
                  className="form-input"
                  required
                  value={editFormData.title}
                  onChange={e => setEditFormData({ ...editFormData, title: e.target.value })}
                  placeholder="e.g. Carl Zeiss OPMI Lumera T Surgical Microscope"
                  id="input-buy-edit-title"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select 
                    className="form-select"
                    value={editFormData.category}
                    onChange={e => setEditFormData({ ...editFormData, category: e.target.value })}
                    id="select-buy-edit-category"
                  >
                    {editCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Brand / Manufacturer *</label>
                  <select 
                    className="form-select"
                    value={editFormData.brand}
                    onChange={e => setEditFormData({ ...editFormData, brand: e.target.value })}
                    id="select-buy-edit-brand"
                  >
                    {editBrands.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Model / Series</label>
                  <input 
                    type="text"
                    className="form-input"
                    value={editFormData.model}
                    onChange={e => setEditFormData({ ...editFormData, model: e.target.value })}
                    placeholder="e.g. Lumera T, Centurion"
                    id="input-buy-edit-model"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Year of Manufacture</label>
                  <input 
                    type="number"
                    className="form-input"
                    value={editFormData.year}
                    onChange={e => setEditFormData({ ...editFormData, year: e.target.value })}
                    min="1995"
                    max={new Date().getFullYear()}
                    id="input-buy-edit-year"
                  />
                </div>
              </div>

              {/* Price Row Highlighted */}
              <div className="form-row" style={{ background: '#f0f9ff', padding: '16px', borderRadius: '12px', border: '1px solid #bae6fd', marginBottom: '16px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 800, color: '#0369a1' }}>
                    Asking Price (₹ INR) *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 800, color: '#0284c7' }}>₹</span>
                    <input 
                      type="text"
                      className="form-input"
                      required
                      style={{ paddingLeft: '28px', fontWeight: 800, fontSize: '1.05rem', borderColor: '#0284c7' }}
                      value={editFormData.price}
                      onChange={e => setEditFormData({ ...editFormData, price: e.target.value })}
                      placeholder="e.g. 1450000"
                      id="input-buy-edit-price"
                    />
                  </div>
                  {editFormData.price && (
                    <div style={{ fontSize: '0.8rem', color: '#0369a1', fontWeight: 700, marginTop: '4px' }}>
                      Display Price: ₹ {Number(String(editFormData.price).replace(/[^\d]/g, '') || 0).toLocaleString('en-IN')}
                    </div>
                  )}
                </div>

                <div className="form-group" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <label className="form-label">Price Flexibility</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '6px' }}>
                    <input 
                      type="checkbox"
                      checked={editFormData.isNegotiable}
                      onChange={e => setEditFormData({ ...editFormData, isNegotiable: e.target.checked })}
                    />
                    <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#334155' }}>Price is Negotiable</span>
                  </label>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Condition *</label>
                  <select 
                    className="form-select"
                    value={editFormData.condition}
                    onChange={e => setEditFormData({ ...editFormData, condition: e.target.value })}
                  >
                    <option value="Like New (Mint)">Like New (Mint) - Spotless Optics</option>
                    <option value="Excellent">Excellent - Light Clinical Use</option>
                    <option value="Good Working Condition">Good Working Condition</option>
                    <option value="Refurbished / Serviced">Refurbished / Certified Serviced</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Warranty / AMC Status</label>
                  <select 
                    className="form-select"
                    value={editFormData.warranty}
                    onChange={e => setEditFormData({ ...editFormData, warranty: e.target.value })}
                  >
                    <option value="Under Active AMC">Under Active OEM AMC</option>
                    <option value="6 Months Warranty">6 Months Service Warranty</option>
                    <option value="Direct Clinical Condition">Direct Clinical Transfer (Test on Site)</option>
                    <option value="As Is Condition">As Is Condition</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Availability Status</label>
                  <select 
                    className="form-select"
                    value={editFormData.status}
                    onChange={e => setEditFormData({ ...editFormData, status: e.target.value })}
                    id="select-buy-edit-status"
                  >
                    <option value="Available">● Available for Sale</option>
                    <option value="Reserved">● Reserved / Advance Received</option>
                    <option value="Sold">● Sold Out</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Location / City</label>
                  <input 
                    type="text"
                    className="form-input"
                    value={editFormData.sellerCity}
                    onChange={e => setEditFormData({ ...editFormData, sellerCity: e.target.value })}
                    placeholder="e.g. Pune, Mumbai, Nagpur"
                    id="input-buy-edit-city"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Clinic / Hospital Name</label>
                  <input 
                    type="text"
                    className="form-input"
                    value={editFormData.clinicName}
                    onChange={e => setEditFormData({ ...editFormData, clinicName: e.target.value })}
                    placeholder="e.g. Netralaya Eye Clinic"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Mobile / WhatsApp</label>
                  <input 
                    type="text"
                    className="form-input"
                    value={editFormData.sellerMobile}
                    onChange={e => setEditFormData({ ...editFormData, sellerMobile: e.target.value })}
                    placeholder="98XXXXXXXX"
                    id="input-buy-edit-mobile"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Clinical Description & Optical Clarity</label>
                <textarea 
                  className="form-textarea"
                  rows={3}
                  value={editFormData.description}
                  onChange={e => setEditFormData({ ...editFormData, description: e.target.value })}
                  placeholder="Detail machine usage, surgical history, laser hours, probe condition..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Included Accessories (comma separated)</label>
                <input 
                  type="text"
                  className="form-input"
                  value={editFormData.accessoriesText}
                  onChange={e => setEditFormData({ ...editFormData, accessoriesText: e.target.value })}
                  placeholder="Foot pedal, Dust cover, Monitor arm, Spare handpiece"
                />
              </div>

              <div className="admin-modal-actions" style={{ marginTop: '24px' }}>
                <button 
                  type="button" 
                  className="btn-pluckcard-call" 
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>

                <button 
                  type="submit" 
                  className="btn-post-ad"
                  id="btn-buy-save-edit-listing"
                  style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' }}
                >
                  <CheckCircle2 size={16} />
                  <span>Save & Sync Price</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
