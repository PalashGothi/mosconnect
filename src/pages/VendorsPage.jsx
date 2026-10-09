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
  Award
} from 'lucide-react';
import vendorsData from '../data/vendors.json';
import WhatsAppIcon from '../components/WhatsAppIcon';

export default function VendorsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');

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
    vendorsData.forEach(v => {
      if (v.city) {
        // split multiple cities like "Pune / Mumbai"
        v.city.split('/').forEach(c => citySet.add(c.trim()));
      }
    });
    return ['All', ...Array.from(citySet).sort()];
  }, []);

  // Filter vendors based on search, category and city
  const filteredVendors = useMemo(() => {
    return vendorsData.filter(v => {
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
  }, [searchQuery, selectedCategory, selectedCity]);

  return (
    <div>
      {/* Directory Hero Banner */}
      <div className="hero-banner" style={{ background: 'linear-gradient(135deg, #091a2f 0%, #0d3858 100%)' }}>
        <div className="hero-content">
          <div className="hero-badge" style={{ background: 'rgba(13, 148, 136, 0.2)', borderColor: '#14b8a6', color: '#5eead4' }}>
            <Award size={15} />
            <span>Official MOS Equipment Engineering Directory</span>
          </div>
          <h2 className="hero-title">
            Verified <span>Engineers & Technicians</span> for Ophthalmic Devices
          </h2>
          <p className="hero-desc">
            Direct contacts for 45+ specialized biomedical engineers, former Zeiss & Appasamy technicians, Phaco probe repair specialists, autoclave engineers, and certified ophthalmic optics experts across Maharashtra.
          </p>

          <div className="hero-stats-row">
            <div className="hero-stat-item">
              <span className="hero-stat-num">{vendorsData.length} Engineers</span>
              <span className="hero-stat-label">Verified Specialists</span>
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
              <span className="hero-stat-num">Doctor Tested</span>
              <span className="hero-stat-label">Peer Recommendations</span>
            </div>
          </div>
        </div>
      </div>

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
          Showing <strong>{filteredVendors.length}</strong> verified engineers and technicians
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
          {filteredVendors.map(vendor => {
            const primaryPhone = vendor.phones?.[0]?.replace(/\D/g, '') || '';
            const waText = encodeURIComponent(
              `Hello ${vendor.name} (${vendor.company}), I found your profile in the MOS Connect Ophthalmic Service Directory. I need assistance with ophthalmic equipment service/spares.`
            );
            const waLink = `https://wa.me/91${primaryPhone.slice(-10)}?text=${waText}`;
            const callLink = `tel:+91${primaryPhone.slice(-10)}`;

            return (
              <div key={vendor.id} className="vendor-card" id={`vendor-card-${vendor.id}`}>
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
                <div style={{ fontSize: '0.78rem', color: '#475569', marginBottom: '14px', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
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

                {/* Contact Actions */}
                <div className="vendor-card-footer">
                  <a 
                    href={waLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-vendor-wa"
                    id={`btn-wa-vendor-${vendor.id}`}
                  >
                    <WhatsAppIcon size={17} />
                    <span>WhatsApp</span>
                  </a>

                  <a 
                    href={callLink}
                    className="btn-vendor-call"
                    id={`btn-call-vendor-${vendor.id}`}
                  >
                    <Phone size={15} />
                    <span>Call: {vendor.phones?.[0]?.replace('+91', '') || 'Contact'}</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
