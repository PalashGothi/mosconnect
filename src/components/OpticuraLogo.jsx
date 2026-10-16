import React from 'react';

export default function OpticuraLogo({ 
  variant = 'card', // 'card', 'header', 'compact', 'inline'
  height = 36,
  showBadge = true,
  className = ''
}) {
  return (
    <div 
      className={`opticura-brand-pill ${variant} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        padding: variant === 'card' ? '6px 14px' : '4px 10px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(2, 132, 199, 0.25)',
        borderRadius: '50px',
        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
        verticalAlign: 'middle',
        transition: 'all 0.25s ease'
      }}
      title="Supported by Opticura — Caring to Cure"
    >
      <img 
        src="/images/opticura/opticura-logo.png" 
        alt="Opticura - Caring to Cure" 
        style={{ 
          height: `${height}px`, 
          width: 'auto',
          objectFit: 'contain',
          display: 'block'
        }} 
      />
      {showBadge && (
        <span 
          style={{
            fontSize: '0.72rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: '#0284c7',
            borderLeft: '1.5px solid #cbd5e1',
            paddingLeft: '8px',
            whiteSpace: 'nowrap'
          }}
        >
          Supported by Opticura
        </span>
      )}
    </div>
  );
}
