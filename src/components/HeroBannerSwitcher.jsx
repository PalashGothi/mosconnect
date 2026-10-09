import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  Columns, 
  Layers, 
  ArrowRight, 
  Sparkles, 
  Briefcase, 
  Wrench, 
  PlusCircle, 
  Globe, 
  Users, 
  ExternalLink,
  CheckCircle2,
  Lock,
  Tag,
  Stethoscope
} from 'lucide-react';
import mosConnectBanner from '../assets/mos-connect-banner.jpg';

export default function HeroBannerSwitcher({
  listingsCount = 0,
  currentDoctor = null,
  onOpenPostAd,
  onOpenWantedBoard,
  onNavigateTab,
  onOpenAuth,
  onScrollToEquipment
}) {
  const [currentSlide, setCurrentSlide] = useState(0); // 0 = Marketplace, 1 = MOS Connect
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [viewMode, setViewMode] = useState('carousel'); // 'carousel' or 'split'
  const [progress, setProgress] = useState(0);

  const SLIDE_DURATION = 5500; // 5.5 seconds
  const PROGRESS_INTERVAL = 50; // update progress every 50ms

  // Auto-play timer with smooth progress bar
  useEffect(() => {
    if (!isAutoPlay || isHovered || viewMode === 'split') {
      return;
    }

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setCurrentSlide(curr => (curr === 0 ? 1 : 0));
          return 0;
        }
        return prev + (PROGRESS_INTERVAL / SLIDE_DURATION) * 100;
      });
    }, PROGRESS_INTERVAL);

    return () => clearInterval(timer);
  }, [isAutoPlay, isHovered, viewMode, currentSlide]);

  const handleNext = () => {
    setCurrentSlide(prev => (prev === 0 ? 1 : 0));
    setProgress(0);
  };

  const handlePrev = () => {
    setCurrentSlide(prev => (prev === 0 ? 1 : 0));
    setProgress(0);
  };

  const handleSelectSlide = (index) => {
    setCurrentSlide(index);
    setProgress(0);
  };

  const toggleAutoPlay = () => {
    setIsAutoPlay(prev => !prev);
    setProgress(0);
  };

  const handlePillClick = (action) => {
    switch (action) {
      case 'buy':
      case 'equipment':
        if (onScrollToEquipment) {
          onScrollToEquipment();
        } else if (onNavigateTab) {
          onNavigateTab('buy');
        }
        break;
      case 'sell':
        if (onOpenPostAd) onOpenPostAd();
        break;
      case 'jobs':
      case 'opportunities':
        if (onNavigateTab) onNavigateTab('jobs');
        break;
      case 'vendors':
      case 'services':
        if (onNavigateTab) onNavigateTab('vendors');
        break;
      case 'network':
        if (onOpenWantedBoard) {
          onOpenWantedBoard();
        } else if (onNavigateTab) {
          onNavigateTab('wanted');
        }
        break;
      case 'login':
        if (onOpenAuth) onOpenAuth();
        break;
      default:
        break;
    }
  };

  // Render Slide 0: Marketplace Hero
  const renderMarketplaceSlide = (isSplit = false) => (
    <div className={`hero-banner-inner slide-marketplace ${isSplit ? 'split-mode' : ''}`}>
      <div className="hero-content">
        <div className="hero-badge">
          <ShieldCheck size={15} />
          <span>100% Peer-to-Peer Doctor Verified</span>
        </div>
        <h2 className="hero-title">
          Buy & Sell <span>Ophthalmology Equipment</span> Across Maharashtra
        </h2>
        <p className="hero-desc">
          Directly connect with 3,745 MOS verified eye doctors. Inspect surgical microscopes, phacoemulsifiers, OCT systems, and slit lamps with complete transparency, clinical logs, and service history.
        </p>

        <div className="hero-action-pills-row">
          <button 
            type="button" 
            className="hero-cta-btn primary"
            onClick={onScrollToEquipment}
            id="hero-btn-browse"
          >
            <span>Browse Equipment</span>
            <ArrowRight size={15} />
          </button>

          <button 
            type="button" 
            className="hero-cta-btn secondary"
            onClick={onOpenPostAd}
            id="hero-btn-sell"
          >
            <PlusCircle size={15} />
            <span>Post Ad to Sell</span>
          </button>

          <button 
            type="button" 
            className="hero-cta-btn outline"
            onClick={onOpenWantedBoard}
            id="hero-btn-wanted"
          >
            <Users size={15} />
            <span>Doctors Wanted Board</span>
          </button>
        </div>

        <div className="hero-stats-row">
          <div className="hero-stat-item">
            <span className="hero-stat-num">3,745</span>
            <span className="hero-stat-label">MOS Approved Doctors</span>
          </div>
          <div className="hero-stat-item">
            <span className="hero-stat-num">{listingsCount} Active</span>
            <span className="hero-stat-label">Equipment Pluckcards</span>
          </div>
          <div className="hero-stat-item">
            <span className="hero-stat-num">45+ Techs</span>
            <span className="hero-stat-label">Verified Tech Directory</span>
          </div>
          <div className="hero-stat-item">
            <span className="hero-stat-num">0%</span>
            <span className="hero-stat-label">Direct Connect Fee</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Render Slide 1: Official MOS Connect Graphic Banner
  const renderMosConnectSlide = (isSplit = false) => (
    <div className={`hero-banner-inner slide-mosconnect ${isSplit ? 'split-mode' : ''}`}>
      <div className="mosconnect-grid">
        {/* Visual Graphic Side */}
        <div className="mosconnect-visual-side">
          <div className="mosconnect-image-container">
            <img 
              src={mosConnectBanner} 
              alt="MOS CONNECT - One Platform. One Community. Endless Possibilities. Maharashtra Ophthalmological Society" 
              className="mosconnect-banner-img"
            />
            <div className="mosconnect-img-badge">
              <Sparkles size={14} />
              <span>Official MOS Society Portal</span>
            </div>
          </div>
        </div>

        {/* Interactive Feature Panel Side */}
        <div className="mosconnect-info-side">
          <div className="mosconnect-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
              <div className="mosconnect-seal-badge" style={{ marginBottom: 0 }}>
                <span className="mos-seal-dot"></span>
                <span>Maharashtra Ophthalmological Society</span>
              </div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: 'rgba(56, 189, 248, 0.12)',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                padding: '3px 10px',
                borderRadius: '9999px',
                fontSize: '0.72rem',
                color: '#7dd3fc',
                fontWeight: 700
              }}>
                <span>Supported By</span>
                <strong style={{ color: '#ffffff', letterSpacing: '0.03em' }}>OPTICURA</strong>
              </div>
            </div>
            <h2 className="mosconnect-main-title">
              MOS <span>CONNECT</span>
            </h2>
            <p className="mosconnect-motto">
              One Platform. One Community. Endless Possibilities.
            </p>
          </div>

          <p className="mosconnect-summary-text">
            The official unified ecosystem for 3,745+ eye surgeons and hospitals in Maharashtra. Seamlessly access peer-to-peer equipment deals, ophthalmic career opportunities, verified biomedical engineers, and doctor networking.
          </p>

          {/* Interactive Feature Pills (Clickable shortcuts) */}
          <div className="mosconnect-interactive-pills">
            <div className="pills-title">Direct Portal Shortcuts:</div>
            <div className="pills-flex-wrap">
              <button 
                type="button" 
                className="banner-hotspot-pill"
                onClick={() => handlePillClick('buy')}
                title="Search and inspect available equipment"
              >
                <Tag size={13} />
                <span>BUY</span>
              </button>

              <button 
                type="button" 
                className="banner-hotspot-pill"
                onClick={() => handlePillClick('sell')}
                title="Post your ophthalmic equipment ad"
              >
                <PlusCircle size={13} />
                <span>SELL</span>
              </button>

              <button 
                type="button" 
                className="banner-hotspot-pill highlight"
                onClick={() => handlePillClick('jobs')}
                title="Browse ophthalmic jobs & fellowships"
              >
                <Briefcase size={13} />
                <span>OPPORTUNITIES</span>
              </button>

              <button 
                type="button" 
                className="banner-hotspot-pill"
                onClick={() => handlePillClick('vendors')}
                title="45+ verified ophthalmic equipment engineers"
              >
                <Wrench size={13} />
                <span>VENDORS</span>
              </button>

              <button 
                type="button" 
                className="banner-hotspot-pill"
                onClick={() => handlePillClick('equipment')}
                title="Ophthalmology equipment catalog"
              >
                <Stethoscope size={13} />
                <span>EQUIPMENT</span>
              </button>

              <button 
                type="button" 
                className="banner-hotspot-pill highlight"
                onClick={() => handlePillClick('jobs')}
                title="Doctor & staff job vacancies"
              >
                <Briefcase size={13} />
                <span>JOBS</span>
              </button>

              <button 
                type="button" 
                className="banner-hotspot-pill"
                onClick={() => handlePillClick('services')}
                title="Laser, phaco & microscope service technicians"
              >
                <Wrench size={13} />
                <span>SERVICES</span>
              </button>

              <button 
                type="button" 
                className="banner-hotspot-pill"
                onClick={() => handlePillClick('network')}
                title="Community Wanted Chat & Doctor Inquiries"
              >
                <Users size={13} />
                <span>MEMBER NETWORK</span>
              </button>
            </div>
          </div>

          {/* Login CTA Bar */}
          <div className="mosconnect-cta-bar">
            {currentDoctor ? (
              <div className="mosconnect-logged-status">
                <CheckCircle2 size={16} className="text-emerald" />
                <span>Logged in as <strong>{currentDoctor.name}</strong> ({currentDoctor.membershipNo || currentDoctor.mosId || 'Verified Member'})</span>
              </div>
            ) : (
              <button 
                type="button" 
                className="mosconnect-login-capsule"
                onClick={() => handlePillClick('login')}
                id="banner-btn-login"
              >
                <Globe size={16} />
                <span>LOGIN TO <strong>www.mosconnect.in</strong></span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div 
      className="hero-carousel-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Floating Control Bar */}
      <div className="hero-floating-controls">
        {/* Slide Selection Pills */}
        <div className="hero-slide-nav-pills">
          <button 
            type="button"
            className={`hero-nav-pill ${currentSlide === 0 && viewMode === 'carousel' ? 'active' : ''}`}
            onClick={() => { setViewMode('carousel'); handleSelectSlide(0); }}
            id="nav-pill-marketplace"
          >
            <span className="nav-pill-num">01</span>
            <span className="nav-pill-text">Equipment Exchange</span>
          </button>

          <button 
            type="button"
            className={`hero-nav-pill ${currentSlide === 1 && viewMode === 'carousel' ? 'active' : ''}`}
            onClick={() => { setViewMode('carousel'); handleSelectSlide(1); }}
            id="nav-pill-mosconnect"
          >
            <span className="nav-pill-num">02</span>
            <span className="nav-pill-text">MOS CONNECT Official</span>
            <span className="nav-pill-badge">Official</span>
          </button>
        </div>

        {/* Carousel Action Buttons */}
        <div className="hero-controls-right">
          {/* View Mode Toggle: Carousel vs Side-by-Side */}
          <button 
            type="button"
            className={`hero-mode-toggle-btn ${viewMode === 'split' ? 'active' : ''}`}
            onClick={() => setViewMode(prev => prev === 'carousel' ? 'split' : 'carousel')}
            title={viewMode === 'carousel' ? 'Switch to Side-by-Side Dual View' : 'Switch to Auto-Switcher Carousel'}
            id="btn-toggle-hero-mode"
          >
            {viewMode === 'carousel' ? (
              <>
                <Columns size={14} />
                <span>Side-by-Side</span>
              </>
            ) : (
              <>
                <Layers size={14} />
                <span>Auto-Switcher</span>
              </>
            )}
          </button>

          {viewMode === 'carousel' && (
            <>
              {/* Play / Pause Toggle */}
              <button 
                type="button"
                className={`hero-ctrl-icon-btn ${!isAutoPlay ? 'paused' : ''}`}
                onClick={toggleAutoPlay}
                title={isAutoPlay ? 'Pause Auto-Switcher' : 'Resume Auto-Switcher'}
                id="btn-hero-autoplay"
              >
                {isAutoPlay ? <Pause size={14} /> : <Play size={14} />}
                <span className="autoplay-status-label">{isAutoPlay ? 'Auto-Switching' : 'Paused'}</span>
              </button>

              {/* Prev / Next Arrows */}
              <div className="hero-arrows-group">
                <button 
                  type="button"
                  className="hero-arrow-btn"
                  onClick={handlePrev}
                  aria-label="Previous Slide"
                  id="btn-hero-prev"
                >
                  <ChevronLeft size={16} />
                </button>
                <button 
                  type="button"
                  className="hero-arrow-btn"
                  onClick={handleNext}
                  aria-label="Next Slide"
                  id="btn-hero-next"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Slide Track / Split View */}
      {viewMode === 'split' ? (
        <div className="hero-split-layout">
          {renderMarketplaceSlide(true)}
          {renderMosConnectSlide(true)}
        </div>
      ) : (
        <div className="hero-carousel-track">
          {currentSlide === 0 ? renderMarketplaceSlide(false) : renderMosConnectSlide(false)}
        </div>
      )}

      {/* Dynamic Progress Bar (in carousel mode) */}
      {viewMode === 'carousel' && isAutoPlay && (
        <div className="hero-carousel-progress-wrapper">
          <div 
            className="hero-carousel-progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
