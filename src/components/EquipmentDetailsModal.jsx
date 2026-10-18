import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Phone, 
  MapPin, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Building2, 
  Clock, 
  HelpCircle, 
  Lock, 
  Tag, 
  Wrench, 
  ArrowRight,
  Share2
} from 'lucide-react';
import WhatsAppIcon from './WhatsAppIcon';
import { maskMembershipNo, maskDoctorName, maskPrice } from '../utils/masking';

export default function EquipmentDetailsModal({ 
  isOpen, 
  onClose, 
  listing, 
  currentDoctor, 
  onOpenAuth 
}) {
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [copiedShare, setCopiedShare] = useState(false);

  // Reset image index when listing changes
  useEffect(() => {
    setActiveImgIndex(0);
  }, [listing?.id]);

  // Handle Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !listing) return null;

  // Build images list
  const images = (listing.images && listing.images.length > 0)
    ? listing.images
    : (listing.image ? [listing.image] : []);

  const cleanPhone = listing.sellerMobile 
    ? listing.sellerMobile.replace(/\D/g, '') 
    : '';

  const waMessage = encodeURIComponent(
    `Hello ${listing.sellerName}, I am contacting you regarding your listing "${listing.title}" (Model: ${listing.model}, Listed for ${listing.priceFormatted || '₹ ' + listing.price}) on the MOS Connect Ophthalmology Platform. Is this equipment still available for inspection?`
  );

  const waUrl = `https://wa.me/91${cleanPhone}?text=${waMessage}`;
  const callUrl = `tel:+91${cleanPhone}`;

  const handleNextImg = () => {
    setActiveImgIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImg = () => {
    setActiveImgIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div 
        className="modal-card" 
        onClick={e => e.stopPropagation()} 
        style={{ 
          maxWidth: '1000px', 
          width: '95%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          borderRadius: '20px',
          boxShadow: '0 25px 60px rgba(15, 23, 42, 0.4)',
          background: '#ffffff'
        }}
      >
        {/* Top Header Bar */}
        <div 
          style={{ 
            background: 'linear-gradient(135deg, #091a2f 0%, #0d3858 100%)', 
            padding: '16px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid rgba(56, 189, 248, 0.2)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span 
              style={{ 
                fontSize: '0.75rem', 
                fontWeight: 700, 
                background: 'rgba(56, 189, 248, 0.2)', 
                color: '#38bdf8', 
                padding: '4px 10px', 
                borderRadius: '20px',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              {listing.category || 'Ophthalmic Equipment'}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '0.85rem' }}>
              <ShieldCheck size={16} color="#10b981" />
              <span style={{ color: '#e2e8f0', fontWeight: 600 }}>
                Verified MOS Doctor Listing #{listing.sellerMembershipNo || 'Member'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button 
              onClick={handleShare}
              title="Share Equipment Link"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: '#ffffff',
                borderRadius: '8px',
                padding: '8px 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.8rem',
                fontWeight: 600
              }}
            >
              <Share2 size={15} />
              <span>{copiedShare ? 'Copied!' : 'Share'}</span>
            </button>

            <button 
              className="modal-close-btn" 
              onClick={onClose}
              id="btn-close-equipment-details"
              title="Close (Esc)"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                color: '#ffffff',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div 
          style={{ 
            overflowY: 'auto', 
            flex: 1, 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '24px',
            padding: '24px',
            background: '#f8fafc'
          }}
        >
          {/* Left Column: Image Gallery */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Main Image Stage */}
            <div 
              style={{ 
                position: 'relative', 
                width: '100%', 
                height: '360px', 
                background: '#0f172a', 
                borderRadius: '16px', 
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
              }}
            >
              {images.length > 0 && images[activeImgIndex] ? (
                <img 
                  src={images[activeImgIndex]} 
                  alt={`${listing.title} view ${activeImgIndex + 1}`}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'contain',
                    transition: 'all 0.3s ease'
                  }} 
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', color: '#94a3b8', padding: '24px', textAlign: 'center' }}>
                  <Building2 size={44} color="#38bdf8" />
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                    {listing.brand || 'Ophthalmic'} {listing.model || listing.category}
                  </span>
                  <span style={{ fontSize: '0.82rem', color: '#94a3b8', maxWidth: '300px' }}>
                    No photos attached by seller. Direct inspection and pictures available on request from doctor.
                  </span>
                </div>
              )}

              {/* Condition Badge in Image */}
              <div 
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  background: 'rgba(15, 23, 42, 0.85)',
                  backdropFilter: 'blur(8px)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <Sparkles size={13} />
                <span>{listing.condition || 'Verified Condition'}</span>
              </div>

              {/* Photo Count Pill */}
              {images.length > 1 && (
                <div 
                  style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '12px',
                    background: 'rgba(0, 0, 0, 0.75)',
                    color: '#ffffff',
                    padding: '3px 8px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }}
                >
                  {activeImgIndex + 1} / {images.length} Photos
                </div>
              )}

              {/* Left & Right Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button 
                    onClick={handlePrevImg}
                    style={{
                      position: 'absolute',
                      left: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(255, 255, 255, 0.85)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                      color: '#0f172a'
                    }}
                    title="Previous Photo"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <button 
                    onClick={handleNextImg}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(255, 255, 255, 0.85)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                      color: '#0f172a'
                    }}
                    title="Next Photo"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div 
                style={{ 
                  display: 'flex', 
                  gap: '8px', 
                  overflowX: 'auto', 
                  paddingBottom: '6px' 
                }}
              >
                {images.map((imgSrc, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImgIndex(idx)}
                    style={{
                      border: activeImgIndex === idx ? '2px solid #0284c7' : '2px solid transparent',
                      borderRadius: '8px',
                      padding: 0,
                      background: '#e2e8f0',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      flexShrink: 0,
                      width: '64px',
                      height: '56px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      opacity: activeImgIndex === idx ? 1 : 0.65
                    }}
                  >
                    <img 
                      src={imgSrc} 
                      alt={`Thumbnail ${idx + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Verified AMC & Assurance Card */}
            <div 
              style={{ 
                background: '#ecfdf5', 
                border: '1px solid #a7f3d0', 
                borderRadius: '12px', 
                padding: '14px 16px',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start'
              }}
            >
              <ShieldCheck size={24} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#065f46', margin: 0 }}>
                  {listing.warranty || 'Direct Verified Clinical Condition'}
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#047857', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                  Peer-to-peer verified transaction between licensed ophthalmic surgeons. Inspection available at seller clinic before transfer.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Specifications & Doctor Connect */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Title & Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0284c7', background: '#e0f2fe', padding: '3px 8px', borderRadius: '4px' }}>
                  {listing.brand || 'Ophthalmic'}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Mfg / Installed: <strong>{listing.year || '2021'}</strong>
                  {listing.yearOfPurchase && <span> • Purchased: <strong>{listing.yearOfPurchase}</strong></span>}
                </span>
              </div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0', lineHeight: 1.3 }}>
                {listing.title}
              </h2>
              <div style={{ fontSize: '0.9rem', color: '#475569' }}>
                Model: <strong style={{ color: '#0f172a' }}>{listing.model || 'Standard Configuration'}</strong>
              </div>
            </div>

            {/* Price Box */}
            <div 
              style={{ 
                background: '#ffffff', 
                border: '1.5px solid #e2e8f0', 
                borderRadius: '12px', 
                padding: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Asking Price (Direct Seller)
                  </span>
                  <div>
                    {currentDoctor ? (
                      <span style={{ fontSize: '1.65rem', fontWeight: 900, color: '#0f172a' }}>
                        {listing.priceFormatted || `₹ ${Number(listing.price || 0).toLocaleString('en-IN')}`}
                      </span>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                        <Lock size={18} color="#0284c7" />
                        <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>₹ ••••••••</span>
                        <span style={{ fontSize: '0.7rem', background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '4px', fontWeight: 700 }}>
                          Members Only
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span 
                    style={{ 
                      fontSize: '0.8rem', 
                      fontWeight: 700, 
                      padding: '4px 10px', 
                      borderRadius: '6px',
                      background: listing.isNegotiable ? '#f0fdf4' : '#f8fafc',
                      color: listing.isNegotiable ? '#16a34a' : '#475569',
                      border: `1px solid ${listing.isNegotiable ? '#bbf7d0' : '#cbd5e1'}`
                    }}
                  >
                    {listing.isNegotiable ? 'Negotiable with Doctor' : 'Non-Negotiable / Fixed Price'}
                  </span>
                </div>
              </div>
            </div>

            {/* Specifications Grid */}
            <div 
              style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, 1fr)', 
                gap: '10px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '14px'
              }}
            >
              <div>
                <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Manufacturer</span>
                <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>{listing.brand || 'Specialist'}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Operational Condition</span>
                <strong style={{ fontSize: '0.85rem', color: '#0284c7' }}>{listing.condition || 'Tested Working'}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Warranty / AMC Status</span>
                <strong style={{ fontSize: '0.85rem', color: '#059669' }}>{listing.warranty || 'Verified Inspection'}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Current Maintenance</span>
                <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>{listing.currentMaintenance || 'Nil (Zero Issues)'}</strong>
              </div>
              {listing.reasonForSale && (
                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Reason for Sale</span>
                  <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>{listing.reasonForSale}</strong>
                </div>
              )}
            </div>

            {/* Included Accessories */}
            {listing.accessories && listing.accessories.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Wrench size={14} color="#0284c7" />
                  <span>Included Accessories & Components</span>
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {listing.accessories.map((acc, idx) => (
                    <span 
                      key={idx}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '0.8rem',
                        color: '#334155',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <CheckCircle2 size={12} color="#10b981" />
                      <span>{acc}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Clinical Overview / Description */}
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Seller Clinical Notes & Details
              </h4>
              <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.5, background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' }}>
                {listing.description}
              </p>
            </div>

            {/* Seller Doctor Contact Box */}
            <div 
              style={{ 
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
                borderRadius: '14px', 
                padding: '18px', 
                color: '#ffffff',
                boxShadow: '0 4px 15px rgba(15, 23, 42, 0.15)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
                      {maskDoctorName(listing.sellerName, !!currentDoctor)}
                    </span>
                    <CheckCircle2 size={16} color="#10b981" />
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                    <MapPin size={13} color="#38bdf8" />
                    <span>{listing.sellerCity || 'Maharashtra'}</span>
                    {listing.clinicName && <span> • {currentDoctor ? listing.clinicName : 'Verified Eye Hospital'}</span>}
                  </div>
                  {listing.callingHours && (
                    <div style={{ fontSize: '0.78rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '4px' }}>
                      <Clock size={12} />
                      <span>Preferred Calling Time: <strong>{listing.callingHours}</strong></span>
                    </div>
                  )}
                </div>

                <div 
                  style={{
                    background: 'rgba(56, 189, 248, 0.15)',
                    border: '1px solid rgba(56, 189, 248, 0.4)',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#38bdf8',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <ShieldCheck size={14} />
                  <span>MOS #{maskMembershipNo(listing.sellerMembershipNo, !!currentDoctor)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              {currentDoctor ? (
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <a 
                    href={waUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn-pluckcard-wa"
                    style={{ flex: 1, justifyContent: 'center', padding: '10px 16px', fontSize: '0.9rem', borderRadius: '8px' }}
                    id={`btn-modal-wa-${listing.id}`}
                  >
                    <WhatsAppIcon size={18} />
                    <span>Chat on WhatsApp</span>
                  </a>

                  <a 
                    href={callUrl} 
                    className="btn-pluckcard-call"
                    style={{ flex: 1, justifyContent: 'center', padding: '10px 16px', fontSize: '0.9rem', borderRadius: '8px' }}
                    id={`btn-modal-call-${listing.id}`}
                  >
                    <Phone size={16} />
                    <span>Call: +91 {listing.sellerMobile}</span>
                  </a>
                </div>
              ) : (
                <div>
                  <button 
                    type="button"
                    className="btn-pluckcard-unlock-full"
                    onClick={() => {
                      onClose();
                      onOpenAuth();
                    }}
                    style={{ width: '100%', justifyContent: 'center', padding: '12px 16px', fontSize: '0.9rem', borderRadius: '8px' }}
                    id={`btn-modal-unlock-${listing.id}`}
                  >
                    <Lock size={16} />
                    <span>Log In with MOS ID to Connect with Doctor</span>
                  </button>
                  <p style={{ fontSize: '0.72rem', color: '#94a3b8', textAlign: 'center', margin: '6px 0 0 0' }}>
                    Direct phone and WhatsApp links are available to verified MOS ophthalmologists.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
