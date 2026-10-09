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
  Lock
} from 'lucide-react';
import Pluckcard from '../components/Pluckcard';
import WhatsAppIcon from '../components/WhatsAppIcon';
import HeroBannerSwitcher from '../components/HeroBannerSwitcher';
import { maskPhone, maskMembershipNo } from '../utils/masking';

export default function BuyPage({ 
  listings, 
  savedItems, 
  onToggleSave, 
  currentDoctor, 
  onOpenWantedBoard,
  onOpenPostAd,
  onNavigateTab,
  onOpenAuth
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCondition, setSelectedCondition] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedDetailListing, setSelectedDetailListing] = useState(null);

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
      {/* Dynamic Auto-Switcher Hero Banner Carousel & Side-by-Side */}
      <HeroBannerSwitcher 
        listingsCount={listings.length}
        currentDoctor={currentDoctor}
        onOpenPostAd={onOpenPostAd}
        onOpenWantedBoard={onOpenWantedBoard}
        onNavigateTab={onNavigateTab}
        onOpenAuth={onOpenAuth}
        onScrollToEquipment={() => {
          const el = document.getElementById('equipment-filter-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

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

      {/* Wanted Board Prompt Strip */}
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
              Post what machine you need on our <strong>Doctors' Wanted Board</strong>. All 3,745 MOS members and verified technicians will be notified.
            </p>
          </div>
        </div>

        <button 
          className="btn-open-common-chat"
          onClick={onOpenWantedBoard}
          id="btn-goto-wanted-board"
        >
          <MessageSquareQuote size={16} />
          <span>Go to Wanted Board</span>
        </button>
      </div>

      {/* Guest Mode Notice Strip */}
      {!currentDoctor && (
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
            <span>Log In with MOS ID</span>
          </button>
        </div>
      )}

      {/* Pluckcard Equipment Grid */}
      {filteredListings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <HelpCircle size={48} style={{ margin: '0 auto 16px auto', color: '#94a3b8' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
            No Equipment Found Matching "{searchQuery}"
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '6px', maxWidth: '500px', margin: '6px auto 20px auto' }}>
            Try adjusting your search filters or post your requirement directly on the common chat board so other doctors can contact you.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button 
              className="btn-open-common-chat"
              onClick={onOpenWantedBoard}
            >
              Post to Wanted Board
            </button>
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
          </div>
        </div>
      ) : (
        <div className="pluckcard-grid">
          {filteredListings.map(listing => (
            <Pluckcard 
              key={listing.id}
              listing={listing}
              isSaved={savedItems.includes(listing.id)}
              onToggleSave={onToggleSave}
              onOpenDetails={setSelectedDetailListing}
              currentDoctor={currentDoctor}
              onOpenAuth={onOpenAuth}
            />
          ))}
        </div>
      )}

      {/* Full Equipment Detail Modal */}
      {selectedDetailListing && (
        <div className="modal-overlay" onClick={() => setSelectedDetailListing(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="brand-pill">{selectedDetailListing.brand}</span>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                  {selectedDetailListing.title}
                </h3>
              </div>
              <button 
                className="modal-close-btn" 
                onClick={() => setSelectedDetailListing(null)}
                id="btn-close-detail-modal"
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{ borderRadius: '12px', overflow: 'hidden', height: '280px', marginBottom: '20px', background: '#0f172a' }}>
                <img 
                  src={selectedDetailListing.image} 
                  alt={selectedDetailListing.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>ASKING PRICE</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
                    {selectedDetailListing.priceFormatted}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="condition-badge mint" style={{ position: 'static' }}>
                    <Sparkles size={12} />
                    <span>{selectedDetailListing.condition}</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 600, marginTop: '4px' }}>
                    {selectedDetailListing.isNegotiable ? 'Negotiable Price' : 'Fixed Price'}
                  </div>
                </div>
              </div>

              {/* Specs & Description */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '8px' }}>Clinical Overview & Specifications</h4>
                <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.6 }}>
                  {selectedDetailListing.description}
                </p>
              </div>

              {/* Included Accessories */}
              {selectedDetailListing.accessories?.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '8px' }}>Included Accessories & Spares</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {selectedDetailListing.accessories.map((acc, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#334155', background: '#f1f5f9', padding: '8px 12px', borderRadius: '8px' }}>
                        <CheckCircle2 size={16} color="#059669" />
                        <span>{acc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Seller Doctor Credentials Card */}
              <div style={{ padding: '16px', background: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: '12px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0d9488', letterSpacing: '0.04em' }}>
                      VERIFIED SELLER (MOS MEMBER)
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                      {selectedDetailListing.sellerName}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#334155', marginTop: '2px' }}>
                      {selectedDetailListing.clinicName || 'Ophthalmic Clinic'} • {selectedDetailListing.sellerCity}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#0d9488', marginTop: '4px', fontWeight: 600 }}>
                      Phone: {maskPhone(selectedDetailListing.sellerMobile, !!currentDoctor)}
                    </div>
                  </div>
                  <span className="mos-seal">
                    MOS #{maskMembershipNo(selectedDetailListing.sellerMembershipNo, !!currentDoctor)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              {currentDoctor ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <a 
                    href={`https://wa.me/91${selectedDetailListing.sellerMobile?.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${selectedDetailListing.sellerName}, I am contacting you regarding your ${selectedDetailListing.title} on MOS Connect.`)}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-vendor-wa"
                  >
                    <WhatsAppIcon size={19} />
                    <span>Connect on WhatsApp</span>
                  </a>
                  <a 
                    href={`tel:+91${selectedDetailListing.sellerMobile?.replace(/\D/g, '')}`}
                    className="btn-vendor-call"
                  >
                    <Phone size={18} />
                    <span>Call Doctor Directly</span>
                  </a>
                </div>
              ) : (
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px dashed #cbd5e1', textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#0f172a', fontWeight: 700, fontSize: '0.95rem', marginBottom: '6px' }}>
                    <Lock size={16} color="#0284c7" />
                    <span>Doctor Contact Information Protected</span>
                  </div>
                  <p style={{ fontSize: '0.84rem', color: '#64748b', marginBottom: '14px', maxWidth: '420px', margin: '0 auto 14px auto' }}>
                    Direct phone numbers and WhatsApp connections are reserved for verified MOS ophthalmic members.
                  </p>
                  <button 
                    className="btn-guest-unlock"
                    onClick={() => {
                      setSelectedDetailListing(null);
                      onOpenAuth();
                    }}
                    style={{ width: '100%', padding: '12px', justifyContent: 'center', fontSize: '0.95rem' }}
                    id="btn-detail-modal-login"
                  >
                    <ShieldCheck size={18} />
                    <span>Log In with MOS ID to Connect with Doctor</span>
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
