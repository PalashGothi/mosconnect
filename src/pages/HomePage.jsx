import React, { useState } from 'react';
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
  ExternalLink,
  ChevronRight,
  Layers,
  Pill,
  Star
} from 'lucide-react';
import mosConnectBanner from '../assets/mos-connect-banner.jpg';
import OpticuraLogo from '../components/OpticuraLogo';
import WhatsAppIcon from '../components/WhatsAppIcon';
import OpticuraShowcaseModal from '../components/OpticuraShowcaseModal';
import { 
  OPTICURA_PRODUCTS, 
  OPTICURA_CONTACT, 
  getOpticuraProductWhatsAppUrl,
  getGeneralOpticuraWhatsAppUrl 
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
  const [selectedOpticuraProduct, setSelectedOpticuraProduct] = useState(null);
  const [isOpticuraModalOpen, setIsOpticuraModalOpen] = useState(false);

  const handleOpenProduct = (product) => {
    setSelectedOpticuraProduct(product);
    setIsOpticuraModalOpen(true);
  };

  return (
    <div className="home-page-container">
      {/* 1. FULL-SPACE HERO BANNER (With Dr. Atul Kadhane & MOS CONNECT Graphic) */}
      <section className="home-hero-full-section">
        <div className="home-banner-card">
          <div className="home-banner-image-wrapper">
            <img 
              src={mosConnectBanner} 
              alt="MOS CONNECT - One Platform. One Community. Endless Possibilities. Supported by Opticura" 
              className="home-banner-full-img"
            />
          </div>

          {/* Quick Action Navigation Strip Below Graphic */}
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
                  <div style={{ fontSize: '0.74rem', opacity: 0.85 }}>Verified Pre-Owned Machines</div>
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
                  <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>45+ Engineers Directory</div>
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

      {/* 2. OPTICURA OPHTHALMIC PRODUCTS CATALOGUE */}
      <section className="home-opticura-section" id="opticura-products-section">
        <div className="home-section-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
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
                    Dedicated Ophthalmic Formulations
                  </span>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '9999px' }}>
                    Caring to Cure
                  </span>
                </div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 0 0' }}>
                  Opticura <span>Pharmaceuticals</span> Range
                </h2>
              </div>
            </div>

            {/* Direct Order WhatsApp Helpline with Dr. Atul Kadhane */}
            <a 
              href={getGeneralOpticuraWhatsAppUrl('home_header')}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#25D366',
                color: '#ffffff',
                padding: '9px 18px',
                borderRadius: '9999px',
                fontWeight: 700,
                fontSize: '0.85rem',
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(37, 211, 102, 0.35)',
                transition: 'all 0.2s ease'
              }}
            >
              <WhatsAppIcon size={18} />
              <span>Hospital Supply / WhatsApp: {OPTICURA_CONTACT.whatsappNumber}</span>
            </a>
          </div>

          <p style={{ fontSize: '0.92rem', color: '#64748b', maxWidth: '800px', lineHeight: 1.6, margin: 0 }}>
            Precision post-op steroids, NSAIDs, advanced lubricating tear formulations, anti-infectives, and retinal nutraceuticals tailored for clinical excellence. Click any formulation to view clinical indications, pharmacology, and pack specifications.
          </p>
        </div>

        {/* 8 Product Cards Grid */}
        <div className="home-products-grid">
          {OPTICURA_PRODUCTS.map((prod) => (
            <div 
              key={prod.id} 
              className="home-product-card"
              onClick={() => handleOpenProduct(prod)}
              id={`home-product-${prod.id}`}
            >
              <div className="home-product-image-container">
                <img 
                  src={prod.image} 
                  alt={prod.name} 
                  className="home-product-img"
                  loading="lazy"
                />
                <span 
                  className="home-product-badge"
                  style={{ 
                    background: `${prod.tagColor}15`, 
                    color: prod.tagColor, 
                    border: `1px solid ${prod.tagColor}35` 
                  }}
                >
                  {prod.tag}
                </span>
              </div>

              <div className="home-product-body">
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase', marginBottom: '2px' }}>
                  {prod.category}
                </div>
                <h3 className="home-product-name">{prod.name}</h3>
                <div className="home-product-composition">{prod.composition}</div>

                <div className="home-product-highlights-chips">
                  {prod.highlights?.slice(0, 2).map((h, i) => (
                    <span key={i} className="home-product-chip">
                      ✓ {h}
                    </span>
                  ))}
                </div>

                <div className="home-product-footer">
                  <span className="home-product-pack">
                    📦 Pack: <strong>{prod.packSize}</strong>
                  </span>
                  
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <a
                      href={getOpticuraProductWhatsAppUrl(prod)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="btn-order-wa-pill"
                      title="Direct order via WhatsApp"
                    >
                      <WhatsAppIcon size={14} />
                      <span>Order</span>
                    </a>

                    <button 
                      type="button" 
                      className="btn-product-details-pill"
                      onClick={() => handleOpenProduct(prod)}
                    >
                      <span>Specs</span>
                      <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              </div>
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

          {/* Card 3: 45+ Biomedical Technicians */}
          <div className="home-portal-card" onClick={() => onNavigateTab('vendors')}>
            <div className="portal-card-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
              <Wrench size={26} />
            </div>
            <div className="portal-card-tag" style={{ color: '#16a34a', background: '#f0fdf4' }}>SERVICE NETWORK</div>
            <h3 className="portal-card-title">45+ Biomedical Engineers</h3>
            <p className="portal-card-desc">
              Direct contacts for former Zeiss & Appasamy technicians, phaco handpiece repair, probe recoring, and autoclave AMC across Maharashtra.
            </p>
            <div className="portal-card-footer">
              <span className="portal-card-link" style={{ color: '#16a34a' }}>View Verified Engineers</span>
              <ArrowRight size={16} />
            </div>
          </div>

          {/* Card 4: Jobs & Careers */}
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

      {/* Opticura Product Details Modal */}
      <OpticuraShowcaseModal 
        isOpen={isOpticuraModalOpen}
        onClose={() => setIsOpticuraModalOpen(false)}
        initialProductId={selectedOpticuraProduct?.id}
      />
    </div>
  );
}
