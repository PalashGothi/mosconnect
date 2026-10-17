import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Phone, 
  Package, 
  Layers, 
  Pill, 
  ChevronRight,
  ExternalLink,
  Info
} from 'lucide-react';
import WhatsAppIcon from './WhatsAppIcon';
import { 
  OPTICURA_PRODUCTS, 
  OPTICURA_CONTACT, 
  getOpticuraProductWhatsAppUrl,
  getGeneralOpticuraWhatsAppUrl 
} from '../data/opticuraProducts';

export default function OpticuraShowcaseModal({ 
  isOpen, 
  onClose, 
  initialProductId = null 
}) {
  const [selectedProduct, setSelectedProduct] = useState(() => {
    if (initialProductId) {
      return OPTICURA_PRODUCTS.find(p => p.id === initialProductId) || OPTICURA_PRODUCTS[0];
    }
    return OPTICURA_PRODUCTS[0];
  });

  // Handle Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div 
        className="modal-card" 
        onClick={e => e.stopPropagation()} 
        style={{ 
          maxWidth: '920px', 
          width: '95%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          borderRadius: '20px',
          boxShadow: '0 25px 60px rgba(15, 23, 42, 0.35)'
        }}
      >
        {/* Top Header Bar */}
        <div 
          style={{ 
            background: 'linear-gradient(135deg, #091a2f 0%, #0d3858 100%)', 
            padding: '18px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid rgba(56, 189, 248, 0.2)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div 
              style={{
                background: '#ffffff',
                padding: '4px 10px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <img 
                src="/images/opticura/opticura-logo.png" 
                alt="Opticura" 
                style={{ height: '32px', width: 'auto', objectFit: 'contain' }}
              />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  Opticura Ophthalmic Formulations
                </h3>
                <span 
                  style={{ 
                    fontSize: '0.7rem', 
                    fontWeight: 700, 
                    background: 'rgba(56, 189, 248, 0.2)', 
                    color: '#38bdf8', 
                    padding: '2px 8px', 
                    borderRadius: '12px',
                    border: '1px solid rgba(56, 189, 248, 0.4)' 
                  }}
                >
                  Caring to Cure
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
                Dedicated ophthalmic pharmaceuticals supporting Maharashtra eye care centers & surgeons
              </p>
            </div>
          </div>

          <button 
            className="modal-close-btn" 
            onClick={onClose}
            id="btn-close-opticura-modal"
            aria-label="Close modal"
            style={{ 
              background: 'rgba(255, 255, 255, 0.15)', 
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Modal Body: Left Selector & Right Product Detail */}
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: '280px 1fr', 
            flex: 1, 
            overflow: 'hidden',
            background: '#f8fafc'
          }}
          className="opticura-modal-split"
        >
          {/* Left: Product List Carousel / Selector */}
          <div 
            className="opticura-modal-sidebar"
            style={{ 
              borderRight: '1px solid #e2e8f0', 
              overflowY: 'auto', 
              padding: '14px 10px',
              background: '#ffffff'
            }}
          >
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0 8px 10px 8px' }}>
              All Products ({OPTICURA_PRODUCTS.length})
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {OPTICURA_PRODUCTS.map(p => {
                const isSelected = selectedProduct?.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProduct(p)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 10px',
                      borderRadius: '10px',
                      border: isSelected ? '1.5px solid #0284c7' : '1px solid #f1f5f9',
                      background: isSelected ? '#f0f9ff' : '#ffffff',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.18s ease'
                    }}
                  >
                    <div 
                      style={{ 
                        width: '44px', 
                        height: '44px', 
                        borderRadius: '8px', 
                        overflow: 'hidden', 
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        flexShrink: 0
                      }}
                    >
                      <img 
                        src={p.image} 
                        alt={p.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.88rem', color: isSelected ? '#0369a1' : '#0f172a' }}>
                          {p.name}
                        </span>
                        <span 
                          style={{ 
                            fontSize: '0.62rem', 
                            fontWeight: 700, 
                            color: p.tagColor, 
                            background: `${p.tagColor}15`, 
                            padding: '1px 5px', 
                            borderRadius: '4px' 
                          }}
                        >
                          {p.tag}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.category}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Doctor Atul WhatsApp Prompt in sidebar */}
            <div 
              style={{ 
                marginTop: '16px', 
                padding: '12px', 
                background: '#f0fdf4', 
                border: '1px solid #bbf7d0', 
                borderRadius: '10px',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#166534' }}>
                Hospital Supply & Samples
              </div>
              <div style={{ fontSize: '0.72rem', color: '#374151', margin: '4px 0 8px 0' }}>
                Directly connect with <strong>{OPTICURA_CONTACT.drName}</strong>
              </div>
              <a 
                href={getGeneralOpticuraWhatsAppUrl('products')}
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  background: '#25D366',
                  color: '#ffffff',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  padding: '6px 12px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  width: '100%'
                }}
              >
                <WhatsAppIcon size={14} />
                <span>WhatsApp: {OPTICURA_CONTACT.whatsappNumber}</span>
              </a>
            </div>
          </div>

          {/* Right: Selected Product In-Depth Specifications */}
          <div className="opticura-modal-content" style={{ overflowY: 'auto', padding: '24px 28px' }}>
            <div className="opticura-modal-detail-grid" style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '24px', alignItems: 'start' }}>
              {/* Product Hero Image */}
              <div 
                style={{ 
                  borderRadius: '16px', 
                  overflow: 'hidden', 
                  border: '1px solid #e2e8f0', 
                  background: '#ffffff',
                  boxShadow: '0 6px 20px rgba(15, 23, 42, 0.06)',
                  padding: '16px',
                  textAlign: 'center'
                }}
              >
                <img 
                  src={selectedProduct.image} 
                  alt={selectedProduct.name}
                  style={{ 
                    width: '100%', 
                    maxHeight: '260px', 
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.12))'
                  }} 
                />
                <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                  <span 
                    style={{ 
                      fontSize: '0.74rem', 
                      fontWeight: 700, 
                      color: selectedProduct.tagColor, 
                      background: `${selectedProduct.tagColor}15`,
                      padding: '3px 10px',
                      borderRadius: '20px'
                    }}
                  >
                    {selectedProduct.tag}
                  </span>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '6px' }}>
                    Pack: <strong>{selectedProduct.packSize}</strong>
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0284c7' }}>
                    {selectedProduct.category}
                  </span>
                </div>

                <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', margin: '0 0 4px 0' }}>
                  {selectedProduct.name}
                </h2>
                <div style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 600, marginBottom: '14px' }}>
                  {selectedProduct.subtitle}
                </div>

                {/* Composition Card */}
                <div 
                  style={{ 
                    padding: '12px 16px', 
                    background: '#f0f9ff', 
                    border: '1px solid #bae6fd', 
                    borderRadius: '10px',
                    marginBottom: '16px'
                  }}
                >
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Active Ophthalmic Composition
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0c4a6e', marginTop: '2px' }}>
                    {selectedProduct.composition}
                  </div>
                </div>

                {/* Clinical Indications */}
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                    Clinical Indications
                  </h4>
                  <p style={{ fontSize: '0.86rem', color: '#334155', lineHeight: 1.55, margin: 0 }}>
                    {selectedProduct.indications}
                  </p>
                </div>

                {/* Key Product Features */}
                <div style={{ marginBottom: '22px' }}>
                  <h4 style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                    Product Highlights & Clinical Advantages
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {selectedProduct.features.map((feat, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.84rem', color: '#334155' }}>
                        <CheckCircle2 size={16} color="#0284c7" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action CTA Row */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <a
                    href={getOpticuraProductWhatsAppUrl(selectedProduct)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-vendor-wa"
                    style={{ flex: 1, minWidth: '220px', padding: '12px 18px', justifyContent: 'center', fontSize: '0.92rem' }}
                  >
                    <WhatsAppIcon size={18} />
                    <span>Inquire / Order on WhatsApp</span>
                  </a>

                  <a
                    href={`tel:+91${OPTICURA_CONTACT.whatsappNumber}`}
                    className="btn-vendor-call"
                    style={{ padding: '12px 18px', fontSize: '0.92rem' }}
                  >
                    <Phone size={16} />
                    <span>Call Dr. Atul Kadhane</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
