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
import OpticuraProductsShelf from '../components/OpticuraProductsShelf';
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
  onOpenAuth
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCondition, setSelectedCondition] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [isOpticuraModalOpen, setIsOpticuraModalOpen] = useState(false);
  const [selectedOpticuraId, setSelectedOpticuraId] = useState(null);

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

      {/* Opticura Ophthalmic Formulations Shelf */}
      <OpticuraProductsShelf 
        onOpenProductModal={(pId) => {
          setSelectedOpticuraId(pId);
          setIsOpticuraModalOpen(true);
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

      {/* Requirement Board Prompt Strip */}
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
              Post Your Requirement
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
          {(currentDoctor ? filteredListings : filteredListings.slice(0, 3)).map(listing => (
            <Pluckcard 
              key={listing.id}
              listing={listing}
              isSaved={savedItems.includes(listing.id)}
              onToggleSave={onToggleSave}
              onOpenDetails={() => {
                setSelectedOpticuraId(null);
                setIsOpticuraModalOpen(true);
              }}
              currentDoctor={currentDoctor}
              onOpenAuth={onOpenAuth}
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
                <span>Log In with MOS ID to Unlock All ({filteredListings.length})</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Opticura Ophthalmic Products Showcase Modal */}
      <OpticuraShowcaseModal
        isOpen={isOpticuraModalOpen}
        onClose={() => setIsOpticuraModalOpen(false)}
        initialProductId={selectedOpticuraId}
      />
    </div>
  );
}
