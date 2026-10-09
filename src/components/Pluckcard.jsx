import React, { useState } from 'react';
import { 
  Heart, 
  Share2, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Tag, 
  Info,
  Calendar,
  Sparkles,
  Building2,
  X,
  Lock
} from 'lucide-react';
import WhatsAppIcon from './WhatsAppIcon';
import { maskMembershipNo, maskDoctorName, maskTeaser } from '../utils/masking';

export default function Pluckcard({ 
  listing, 
  isSaved, 
  onToggleSave, 
  onOpenDetails, 
  currentDoctor,
  onOpenAuth
}) {
  const [copiedShare, setCopiedShare] = useState(false);

  const cleanPhone = listing.sellerMobile 
    ? listing.sellerMobile.replace(/\D/g, '') 
    : '';

  const waMessage = encodeURIComponent(
    `Hello ${listing.sellerName}, I am contacting you regarding your listing "${listing.title}" (Model: ${listing.model}, Listed for ${listing.priceFormatted}) on the MOS Connect Ophthalmology Platform. Is this equipment still available for inspection?`
  );

  const waUrl = `https://wa.me/91${cleanPhone}?text=${waMessage}`;
  const callUrl = `tel:+91${cleanPhone}`;

  const handleShare = (e) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const getConditionClass = (condition = '') => {
    const c = condition.toLowerCase();
    if (c.includes('mint') || c.includes('like new')) return 'mint';
    if (c.includes('refurbished')) return 'refurbished';
    return '';
  };

  return (
    <div className="pluckcard" id={`pluckcard-${listing.id}`}>
      {/* Top Media Area */}
      <div className="pluckcard-media">
        <img 
          src={listing.image || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80'} 
          alt={listing.title} 
          loading="lazy"
        />

        {/* Condition Ribbon */}
        <div className={`condition-badge ${getConditionClass(listing.condition)}`}>
          <Sparkles size={12} />
          <span>{listing.condition || 'Verified Working'}</span>
        </div>

        {/* Floating Wishlist Button */}
        <button 
          className={`save-btn-floating ${isSaved ? 'saved' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(listing.id);
          }}
          title={isSaved ? 'Remove from Saved' : 'Save Equipment'}
          id={`btn-save-${listing.id}`}
        >
          <Heart size={18} fill={isSaved ? '#f43f5e' : 'none'} color={isSaved ? '#f43f5e' : '#475569'} />
        </button>

        {/* Verified Seller Strip Overlay */}
        <div className="seller-strip">
          <div className="seller-strip-info">
            <div className="seller-strip-name">
              <span>{maskDoctorName(listing.sellerName, !!currentDoctor)}</span>
              <CheckCircle2 size={13} color="#10b981" />
            </div>
            <div className="seller-strip-loc">
              <MapPin size={11} style={{ display: 'inline', marginRight: '3px' }} />
              <span>{listing.sellerCity || 'Maharashtra'}</span>
              {listing.clinicName && <span> • {currentDoctor ? listing.clinicName : 'Verified Clinic'}</span>}
            </div>
          </div>
          
          <div className="mos-seal">
            <ShieldCheck size={12} />
            <span>MOS #{maskMembershipNo(listing.sellerMembershipNo, !!currentDoctor)}</span>
          </div>
        </div>
      </div>

      {/* Pluckcard Content */}
      <div className="pluckcard-content">
        <div className="pluckcard-header">
          <div className="brand-category-row">
            <span className="brand-pill">{listing.brand || 'Ophthalmic'}</span>
            <span className="year-text">Mfg / Installed: {listing.year || '2021'}</span>
          </div>
          <h3 className="pluckcard-title" title={listing.title}>
            {listing.title}
          </h3>
          <div className="model-name">
            Model: <strong>{listing.model || 'Standard Configuration'}</strong>
          </div>
        </div>

        {/* Key Accessories / Features Chips */}
        {listing.accessories && listing.accessories.length > 0 && (
          <div className="pluckcard-specs-list">
            {listing.accessories.slice(0, 3).map((acc, idx) => (
              <span key={idx} className="spec-chip">
                ✓ {acc}
              </span>
            ))}
            {listing.accessories.length > 3 && (
              <span className="spec-chip" style={{ color: '#0284c7', fontWeight: 600 }}>
                +{listing.accessories.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Short description snippet */}
        <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.45, marginBottom: '14px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {maskTeaser(listing.description, !!currentDoctor, 85)}
        </p>

        {/* Warranty Tag */}
        {listing.warranty && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: '#059669', background: '#ecfdf5', padding: '4px 8px', borderRadius: '6px', marginBottom: '12px', width: 'fit-content', fontWeight: 600 }}>
            <ShieldCheck size={12} />
            <span>{listing.warranty}</span>
          </div>
        )}

        {/* Pluckcard Footer */}
        <div className="pluckcard-footer">
          <div className="price-row">
            {currentDoctor ? (
              <span className="pluckcard-price">
                {listing.priceFormatted || `₹ ${Number(listing.price || 0).toLocaleString('en-IN')}`}
              </span>
            ) : (
              <div 
                className="pluckcard-price-masked" 
                onClick={onOpenAuth}
                title="Log in with MOS ID to view verified price"
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Lock size={14} color="#0284c7" />
                <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>₹ ••••••••</span>
                <span style={{ fontSize: '0.7rem', background: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>Member Only</span>
              </div>
            )}
            <span className="price-negotiable-badge">
              {listing.isNegotiable ? 'Negotiable' : 'Fixed Price'}
            </span>
          </div>

          {/* Action buttons */}
          <div className="pluckcard-action-bar">
            {currentDoctor ? (
              <>
                <a 
                  href={waUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn-pluckcard-wa"
                  title="Chat directly on WhatsApp with doctor"
                  id={`btn-wa-${listing.id}`}
                >
                  <WhatsAppIcon size={16} />
                  <span>WhatsApp</span>
                </a>

                <a 
                  href={callUrl} 
                  className="btn-pluckcard-call"
                  title="Call doctor directly"
                  id={`btn-call-${listing.id}`}
                >
                  <Phone size={14} />
                  <span>Call Doctor</span>
                </a>

                <button 
                  className="btn-pluckcard-detail"
                  onClick={() => onOpenDetails(listing)}
                  title="View full specs and hospital details"
                  id={`btn-detail-${listing.id}`}
                >
                  <Info size={15} />
                </button>
              </>
            ) : (
              <>
                <button 
                  type="button"
                  className="btn-pluckcard-unlock-full"
                  onClick={onOpenAuth}
                  title="Log in with MOS credentials to view asking price and doctor contact"
                  id={`btn-unlock-${listing.id}`}
                >
                  <Lock size={14} />
                  <span>Log In to View Price & Connect</span>
                </button>

                <button 
                  className="btn-pluckcard-detail"
                  onClick={onOpenAuth}
                  title="Log in to view full specs"
                  id={`btn-detail-${listing.id}`}
                >
                  <Lock size={14} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
