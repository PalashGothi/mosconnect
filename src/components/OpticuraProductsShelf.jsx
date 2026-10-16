import React from 'react';
import { 
  Sparkles, 
  ChevronRight, 
  Eye, 
  Pill, 
  ShieldCheck, 
  ArrowUpRight 
} from 'lucide-react';
import WhatsAppIcon from './WhatsAppIcon';
import { 
  OPTICURA_PRODUCTS, 
  OPTICURA_CONTACT, 
  getOpticuraProductWhatsAppUrl,
  getGeneralOpticuraWhatsAppUrl 
} from '../data/opticuraProducts';

export default function OpticuraProductsShelf({ onOpenProductModal }) {
  return (
    <div 
      className="opticura-shelf-container"
      style={{
        background: 'linear-gradient(135deg, #f0fdf4 0%, #f0f9ff 50%, #eff6ff 100%)',
        border: '1.5px solid #bae6fd',
        borderRadius: '20px',
        padding: '24px 28px',
        marginBottom: '28px',
        boxShadow: '0 4px 20px rgba(2, 132, 199, 0.08)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background Accent Element */}
      <div 
        style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.12) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}
      />

      {/* Shelf Header */}
      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div 
            style={{
              background: '#ffffff',
              padding: '6px 14px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.05)',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <img 
              src="/images/opticura/opticura-logo.png" 
              alt="Opticura" 
              style={{ height: '36px', width: 'auto', objectFit: 'contain' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span 
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  background: '#0284c7',
                  color: '#ffffff',
                  padding: '2px 8px',
                  borderRadius: '12px'
                }}
              >
                PLATFORM SPONSOR & PARTNER
              </span>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0369a1' }}>
                Supported by Opticura — Caring to Cure
              </span>
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', margin: '4px 0 0 0' }}>
              Specialized Ophthalmic Products & Formulations
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '2px 0 0 0' }}>
              Preservative-free eye drops, anti-infectives, post-op steroids & retinal nutrition for Maharashtra eye care centers.
            </p>
          </div>
        </div>

        {/* Doctor Contact Quick WhatsApp Badge */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <a
            href={getGeneralOpticuraWhatsAppUrl('products')}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-vendor-wa"
            style={{ padding: '8px 16px', fontSize: '0.84rem' }}
            id="btn-shelf-contact-atul"
          >
            <WhatsAppIcon size={16} />
            <span>Contact {OPTICURA_CONTACT.drName}: {OPTICURA_CONTACT.whatsappNumber}</span>
          </a>

          <button
            onClick={() => onOpenProductModal && onOpenProductModal()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#ffffff',
              color: '#0284c7',
              border: '1px solid #bae6fd',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
            id="btn-view-all-opticura"
          >
            <span>View All ({OPTICURA_PRODUCTS.length})</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Scrollable Horizontal Cards Shelf */}
      <div 
        className="opticura-products-scroll"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '14px'
        }}
      >
        {OPTICURA_PRODUCTS.map(product => (
          <div
            key={product.id}
            onClick={() => onOpenProductModal && onOpenProductModal(product.id)}
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              padding: '14px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
              position: 'relative'
            }}
            className="opticura-shelf-card"
            title={`Click to view details for ${product.name}`}
          >
            {/* Tag */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <span 
                style={{ 
                  fontSize: '0.65rem', 
                  fontWeight: 700, 
                  color: product.tagColor, 
                  background: `${product.tagColor}15`, 
                  padding: '2px 6px', 
                  borderRadius: '4px' 
                }}
              >
                {product.tag}
              </span>
              <ArrowUpRight size={14} color="#94a3b8" />
            </div>

            {/* Product Image */}
            <div 
              style={{ 
                height: '130px', 
                borderRadius: '8px', 
                background: '#f8fafc', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                overflow: 'hidden',
                marginBottom: '10px'
              }}
            >
              <img 
                src={product.image} 
                alt={product.name}
                style={{ maxHeight: '120px', maxWidth: '90%', objectFit: 'contain' }} 
              />
            </div>

            {/* Title & Details */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                {product.name}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, marginTop: '2px', lineHeight: 1.3 }}>
                {product.composition}
              </div>
            </div>

            {/* Inquire on WhatsApp Mini Button */}
            <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: '#0284c7', fontWeight: 700 }}>
                View Specs →
              </span>
              <a
                href={getOpticuraProductWhatsAppUrl(product)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: '#25D366',
                  color: '#ffffff',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  padding: '4px 8px',
                  borderRadius: '6px',
                  textDecoration: 'none'
                }}
                title="Direct WhatsApp Inquiry"
              >
                <WhatsAppIcon size={12} />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
