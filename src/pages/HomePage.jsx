import React from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  ShoppingBag, 
  MessageSquareQuote, 
  Wrench, 
  Briefcase, 
  PlusCircle, 
  CheckCircle2, 
  Lock, 
  Eye, 
  MapPin, 
  Phone, 
  ExternalLink
} from 'lucide-react';
import mosConnectBanner from '../assets/mos-connect-banner.jpg';
import OpticuraLogo from '../components/OpticuraLogo';
import WhatsAppIcon from '../components/WhatsAppIcon';
import { 
  OPTICURA_PRODUCTS, 
  OPTICURA_CONTACT 
} from '../data/opticuraProducts';

export default function HomePage({ 
  onNavigateTab, 
  onOpenAuth, 
  currentDoctor,
  listingsCount = 0,
  vendorsCount = 45,
  jobsCount = 0,
  wantedCount = 0
}) {

  return (
    <div className="home-page-container">
      {/* 1. FULL-SPACE HERO BANNER (With Dr. Atul Kadhane & MOS CONNECT Graphic) */}
      <section className="home-hero-full-section">
        <div className="home-banner-card">
          <div className="home-banner-wrapper-flanked">
            {/* Left Clickable Display: Non-MOS Member Access */}
            <div className="home-flank-card left" id="home-flank-left">
              <div className="flank-badge">ACCESS REQUEST</div>
              <h3 className="flank-title">
                Not an MOS member but want to use the application?
              </h3>
              <p className="flank-desc">
                Connect directly for clinic onboarding, equipment inspection, or institutional access.
              </p>
              <a
                href={`https://wa.me/91${OPTICURA_CONTACT.whatsappNumber}?text=${encodeURIComponent('Hello Dr. Atul Kadhane, I am not an MOS member but want to use the MOS Connect application.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-flank-wa"
                id="btn-flank-wa-left"
              >
                <WhatsAppIcon size={16} />
                <span>Contact on WhatsApp</span>
              </a>
            </div>

            {/* Center Graphic */}
            <div className="home-banner-image-wrapper">
              <img 
                src={mosConnectBanner} 
                alt="MOS CONNECT - One Platform. One Community. Endless Possibilities. Supported by Opticura" 
                className="home-banner-full-img"
              />
            </div>

            {/* Right Clickable Display: Register Local Vendor */}
            <div className="home-flank-card right" id="home-flank-right">
              <div className="flank-badge" style={{ background: 'rgba(20, 184, 166, 0.2)', color: '#5eead4', borderColor: 'rgba(20, 184, 166, 0.4)' }}>
                LOCAL VENDOR NETWORK
              </div>
              <h3 className="flank-title">
                Want to register as a local vendor?
              </h3>
              <p className="flank-desc">
                List your biomedical engineering, repair & AMC services for 3,745+ eye doctors across Maharashtra.
              </p>
              <a
                href={`https://wa.me/91${OPTICURA_CONTACT.whatsappNumber}?text=${encodeURIComponent('Hello Dr. Atul Kadhane, I want to register as a local vendor / equipment technician on MOS Connect.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-flank-wa"
                style={{ background: '#0d9488' }}
                id="btn-flank-wa-right"
              >
                <WhatsAppIcon size={16} />
                <span>Contact on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Quick Action Navigation Strip Below Graphic (5 Buttons) */}
          <div className="home-hero-action-bar">
            <div className="home-hero-action-grid">
              <button 
                type="button"
                className="home-action-btn primary"
                onClick={() => onNavigateTab('buy')}
                id="btn-home-buy-equipment"
              >
                <ShoppingBag size={18} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>Buy Equipment</div>
                  <div style={{ fontSize: '0.74rem', opacity: 0.85 }}>Pre-Owned Machines</div>
                </div>
                <ArrowRight size={16} style={{ marginLeft: 'auto' }} />
              </button>

              <button 
                type="button"
                className="home-action-btn sell-accent"
                onClick={() => onNavigateTab('sell')}
                id="btn-home-sell-equipment"
              >
                <PlusCircle size={18} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>Sell Equipment</div>
                  <div style={{ fontSize: '0.74rem', opacity: 0.85 }}>Post Pre-Owned Machines</div>
                </div>
                <ArrowRight size={16} style={{ marginLeft: 'auto' }} />
              </button>

              <button 
                type="button"
                className="home-action-btn secondary"
                onClick={() => onNavigateTab('wanted')}
                id="btn-home-post-requirement"
              >
                <MessageSquareQuote size={18} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>Post Your Requirement</div>
                  <div style={{ fontSize: '0.74rem', opacity: 0.85 }}>Broadcast Needed Devices</div>
                </div>
                <ArrowRight size={16} style={{ marginLeft: 'auto' }} />
              </button>

              <button 
                type="button"
                className="home-action-btn tertiary"
                onClick={() => onNavigateTab('vendors')}
                id="btn-home-view-vendors"
              >
                <Wrench size={18} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>Local Vendors & Technicians</div>
                  <div style={{ fontSize: '0.74rem', opacity: 0.85 }}>Zeiss, Phaco & AMC Techs</div>
                </div>
                <ArrowRight size={16} style={{ marginLeft: 'auto' }} />
              </button>

              <button 
                type="button"
                className="home-action-btn quaternary"
                onClick={() => onNavigateTab('jobs')}
                id="btn-home-view-jobs"
              >
                <Briefcase size={18} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>Jobs & Fellowship</div>
                  <div style={{ fontSize: '0.74rem', opacity: 0.85 }}>Surgeon & Hospital Hiring</div>
                </div>
                <ArrowRight size={16} style={{ marginLeft: 'auto' }} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. OPTICURA PRODUCTS */}
      <section className="home-opticura-section" id="opticura-products-section">
        <div className="home-section-header" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: '#ffffff', padding: '6px 14px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
              <img 
                src="/images/opticura/opticura-logo.png" 
                alt="Opticura - Caring to Cure" 
                style={{ height: '36px', width: 'auto', objectFit: 'contain' }}
              />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#0284c7', letterSpacing: '0.08em' }}>
                  Supported by Opticura
                </span>
              </div>
              <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 0 0' }}>
                Opticura Products
              </h2>
            </div>
          </div>
        </div>

        {/* 8 Product Cards Grid - Images Only */}
        <div className="home-products-grid">
          {OPTICURA_PRODUCTS.map((prod) => (
            <div 
              key={prod.id} 
              className="home-product-image-card"
              id={`home-product-${prod.id}`}
            >
              <img 
                src={prod.image} 
                alt={prod.name} 
                className="home-product-pure-img"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </section>

      {/* 3. PLATFORM PORTALS & FUNCTIONALITIES SHOWCASE */}
      <section className="home-portals-section">
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(2, 132, 199, 0.1)', color: '#0284c7', padding: '4px 14px', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '10px' }}>
            <Sparkles size={14} />
            <span>MOS CONNECT ECOSYSTEM</span>
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>
            One Platform. <span>Endless Possibilities.</span>
          </h2>
          <p style={{ fontSize: '0.92rem', color: '#64748b', maxWidth: '620px', margin: '8px auto 0 auto' }}>
            Access all four pillars of the ophthalmic network designed for 3,745+ eye doctors across Maharashtra.
          </p>
        </div>

        <div className="home-portals-grid">
          {/* Card 1: Equipment Marketplace */}
          <div className="home-portal-card" onClick={() => onNavigateTab('buy')}>
            <div className="portal-card-icon" style={{ background: '#f0f9ff', color: '#0284c7' }}>
              <ShoppingBag size={26} />
            </div>
            <div className="portal-card-tag">MARKETPLACE</div>
            <h3 className="portal-card-title">Buy Pre-Owned Equipment</h3>
            <p className="portal-card-desc">
              Inspect phaco machines, Zeiss surgical microscopes, slit lamps, and autoclaves directly from fellow eye surgeons with verified clinical logs.
            </p>
            <div className="portal-card-footer">
              <span className="portal-card-link">Explore Equipment Marketplace</span>
              <ArrowRight size={16} />
            </div>
          </div>

          {/* Card 2: Post Your Requirement */}
          <div className="home-portal-card" onClick={() => onNavigateTab('wanted')}>
            <div className="portal-card-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
              <MessageSquareQuote size={26} />
            </div>
            <div className="portal-card-tag" style={{ color: '#d97706', background: '#fef3c7' }}>DOCTORS' BOARD</div>
            <h3 className="portal-card-title">Post Your Requirement Here</h3>
            <p className="portal-card-desc">
              Can't find a specific machine or OT probe? Broadcast what you need on the live doctors' requirement board for immediate peer response.
            </p>
            <div className="portal-card-footer">
              <span className="portal-card-link" style={{ color: '#d97706' }}>Open Requirement Board</span>
              <ArrowRight size={16} />
            </div>
          </div>

          {/* Card: Sell Equipment */}
          <div className="home-portal-card" onClick={() => onNavigateTab('sell')}>
            <div className="portal-card-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
              <PlusCircle size={26} />
            </div>
            <div className="portal-card-tag" style={{ color: '#059669', background: '#ecfdf5' }}>SELL EQUIPMENT</div>
            <h3 className="portal-card-title">Sell Pre-Owned Equipment</h3>
            <p className="portal-card-desc">
              Have an extra phaco unit, surgical microscope, perimeter, or slit lamp? List your machine directly to 3,745+ eye surgeons with zero brokerage.
            </p>
            <div className="portal-card-footer">
              <span className="portal-card-link" style={{ color: '#059669' }}>Post Equipment for Sale</span>
              <ArrowRight size={16} />
            </div>
          </div>

          {/* Card: Local Vendors & Technicians */}
          <div className="home-portal-card" onClick={() => onNavigateTab('vendors')}>
            <div className="portal-card-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
              <Wrench size={26} />
            </div>
            <div className="portal-card-tag" style={{ color: '#16a34a', background: '#f0fdf4' }}>SERVICE NETWORK</div>
            <h3 className="portal-card-title">Local Vendors & Technicians</h3>
            <p className="portal-card-desc">
              Direct contacts for local equipment vendors, former Zeiss & Appasamy technicians, phaco handpiece repair, probe recoring, and autoclave AMC across Maharashtra.
            </p>
            <div className="portal-card-footer">
              <span className="portal-card-link" style={{ color: '#16a34a' }}>View Local Vendors</span>
              <ArrowRight size={16} />
            </div>
          </div>

          {/* Card: Jobs & Careers */}
          <div className="home-portal-card" onClick={() => onNavigateTab('jobs')}>
            <div className="portal-card-icon" style={{ background: '#faf5ff', color: '#9333ea' }}>
              <Briefcase size={26} />
            </div>
            <div className="portal-card-tag" style={{ color: '#9333ea', background: '#faf5ff' }}>CAREER HUB</div>
            <h3 className="portal-card-title">Jobs & Fellowship</h3>
            <p className="portal-card-desc">
              Hospital vacancies, vitreoretina fellowships, anterior segment surgeons, and optometrist openings across Maharashtra eye care centers.
            </p>
            <div className="portal-card-footer">
              <span className="portal-card-link" style={{ color: '#9333ea' }}>Browse Job Openings</span>
              <ArrowRight size={16} />
            </div>
          </div>
        </div>
      </section>

      {/* 4. NON-MEMBER INQUIRY PROMPT */}
      <section className="home-nonmember-strip">
        <div className="home-nonmember-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(34, 197, 94, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e', flexShrink: 0 }}>
              <Phone size={22} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Not an MOS Member Interested in this Platform?
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '3px 0 0 0' }}>
                For non-member access, vendor directory listings, or Opticura institutional pharmaceutical supply, connect directly with Dr. Atul Kadhane.
              </p>
            </div>
          </div>

          <a 
            href={`https://wa.me/91${OPTICURA_CONTACT.whatsappNumber}?text=${encodeURIComponent('Hello Dr. Atul Kadhane, I am interested in accessing or listing on the MOS Connect platform supported by Opticura.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-contact-dr-atul-large"
          >
            <WhatsAppIcon size={18} />
            <span>WhatsApp Dr. Atul Kadhane: {OPTICURA_CONTACT.whatsappNumber}</span>
          </a>
        </div>
      </section>

    </div>
  );
}
