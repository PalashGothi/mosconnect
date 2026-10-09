import React, { useState } from 'react';
import { 
  MessageSquareQuote, 
  PlusCircle, 
  Send, 
  CheckCircle2, 
  MapPin, 
  Clock, 
  Tag, 
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  CornerDownRight,
  MessageCircle
} from 'lucide-react';

export default function CommonChatBoard({ 
  posts, 
  onAddPost, 
  onAddReply, 
  currentDoctor, 
  onOpenAuth 
}) {
  const [showPostModal, setShowPostModal] = useState(false);
  const [activeReplyPostId, setActiveReplyPostId] = useState(null);
  const [replyText, setReplyText] = useState('');

  // New post form state
  const [formData, setFormData] = useState({
    equipmentName: '',
    category: 'Microscopes',
    targetBudget: '',
    urgency: 'Immediate (Within 2 weeks)',
    description: ''
  });

  const categories = [
    'Microscopes',
    'Phaco Machines',
    'Slit Lamps',
    'OCT & Fundus',
    'Autoref / Biometry',
    'Lasers',
    'Chair Units',
    'Autoclave / CSSD',
    'Cameras & Imaging',
    'Other Equipment'
  ];

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!currentDoctor) {
      onOpenAuth();
      return;
    }
    if (!formData.equipmentName.trim()) return;

    const newPost = {
      id: `req-${Date.now()}`,
      doctorName: currentDoctor.name || 'Dr. MOS Member',
      membershipNo: currentDoctor.membershipNo || 'Verified',
      doctorCity: currentDoctor.city || 'Maharashtra',
      equipmentName: formData.equipmentName,
      category: formData.category,
      targetBudget: formData.targetBudget || 'Flexible / Open to Offers',
      urgency: formData.urgency,
      description: formData.description,
      createdAt: new Date().toISOString(),
      replies: []
    };

    onAddPost(newPost);
    setFormData({
      equipmentName: '',
      category: 'Microscopes',
      targetBudget: '',
      urgency: 'Immediate (Within 2 weeks)',
      description: ''
    });
    setShowPostModal(false);
  };

  const handleSendReply = (postId) => {
    if (!currentDoctor) {
      onOpenAuth();
      return;
    }
    if (!replyText.trim()) return;

    const newReply = {
      id: `rep-${Date.now()}`,
      authorName: currentDoctor.name,
      authorMembershipNo: currentDoctor.membershipNo,
      message: replyText.trim(),
      createdAt: new Date().toISOString()
    };

    onAddReply(postId, newReply);
    setReplyText('');
    setActiveReplyPostId(null);
  };

  return (
    <div className="chat-container">
      {/* Header Banner */}
      <div className="chat-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
            <MessageSquareQuote size={18} />
            <span>COMMUNITY WANTED BOARD & EQUIPMENT INQUIRIES</span>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>
            Looking for Equipment You Couldn't Find?
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '4px', maxWidth: '700px' }}>
            Post what machine you need below. All 3,745 MOS ophthalmologists and verified technicians across Maharashtra can see your request and assist you directly.
          </p>
        </div>

        <button 
          className="btn-post-ad"
          style={{ background: '#10b981', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)' }}
          onClick={() => {
            if (!currentDoctor) {
              onOpenAuth();
            } else {
              setShowPostModal(true);
            }
          }}
          id="btn-open-wanted-modal"
        >
          <PlusCircle size={18} />
          <span>Post Equipment Wanted</span>
        </button>
      </div>

      {/* Thread Feed */}
      <div className="chat-thread-list">
        {posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
            <HelpCircle size={40} style={{ margin: '0 auto 12px auto', color: '#94a3b8' }} />
            <h3>No Wanted Posts Yet</h3>
            <p style={{ fontSize: '0.9rem', marginTop: '4px' }}>Be the first doctor to post an equipment request!</p>
          </div>
        ) : (
          posts.map(post => (
            <div key={post.id} className="chat-card" id={`wanted-post-${post.id}`}>
              <div className="chat-card-top">
                <div className="chat-author">
                  <div className="avatar-circle" style={{ width: '38px', height: '38px', background: 'linear-gradient(135deg, #0284c7, #0369a1)' }}>
                    {post.doctorName.replace('Dr.', '').trim().charAt(0)}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="chat-author-name">{post.doctorName}</span>
                      <span className="mos-seal" style={{ padding: '2px 7px', fontSize: '0.68rem' }}>
                        MOS #{post.membershipNo}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <MapPin size={11} />
                      <span>{post.doctorCity || 'Maharashtra'}</span>
                      <span>•</span>
                      <Clock size={11} />
                      <span>{new Date(post.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span className="chat-equipment-badge">
                    {post.category}
                  </span>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: 700, 
                    padding: '3px 8px', 
                    borderRadius: '9999px',
                    background: post.urgency?.toLowerCase().includes('urgent') || post.urgency?.toLowerCase().includes('immediate') ? '#fee2e2' : '#f1f5f9',
                    color: post.urgency?.toLowerCase().includes('urgent') || post.urgency?.toLowerCase().includes('immediate') ? '#ef4444' : '#475569'
                  }}>
                    ⚡ {post.urgency || 'Needed'}
                  </span>
                </div>
              </div>

              {/* Requirement Subject & Specs */}
              <div style={{ marginTop: '10px' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                  Wanted: {post.equipmentName}
                </h4>
                <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.5, marginBottom: '10px' }}>
                  {post.description}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.82rem' }}>
                  <div className="chat-budget-tag">
                    <span>Budget:</span>
                    <strong>{post.targetBudget}</strong>
                  </div>

                  <button 
                    onClick={() => setActiveReplyPostId(activeReplyPostId === post.id ? null : post.id)}
                    style={{ 
                      fontSize: '0.82rem', 
                      color: '#0284c7', 
                      fontWeight: 600, 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '4px' 
                    }}
                    id={`btn-reply-toggle-${post.id}`}
                  >
                    <CornerDownRight size={14} />
                    <span>{post.replies?.length > 0 ? `View ${post.replies.length} Replies / Reply` : 'Reply to Doctor'}</span>
                  </button>
                </div>
              </div>

              {/* Threaded Replies Section */}
              {((post.replies && post.replies.length > 0) || activeReplyPostId === post.id) && (
                <div className="chat-replies-section">
                  {post.replies?.map(rep => (
                    <div key={rep.id} className="reply-bubble">
                      <div className="reply-header">
                        <span className="reply-author">
                          {rep.authorName} <span style={{ color: '#059669', fontSize: '0.72rem', fontWeight: 600 }}>({rep.authorMembershipNo?.startsWith('Vendor') ? 'Verified Technician' : `MOS #${rep.authorMembershipNo}`})</span>
                        </span>
                        <span>{new Date(rep.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div style={{ color: '#1e293b', lineHeight: 1.4 }}>
                        {rep.message}
                      </div>
                    </div>
                  ))}

                  {/* Inline Reply Box */}
                  {activeReplyPostId === post.id && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                      <input 
                        type="text" 
                        className="form-input"
                        style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                        placeholder={`Write reply to ${post.doctorName}...`}
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleSendReply(post.id); }}
                        autoFocus
                        id={`input-reply-${post.id}`}
                      />
                      <button 
                        onClick={() => handleSendReply(post.id)}
                        style={{
                          background: '#0284c7',
                          color: '#ffffff',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                        id={`btn-send-reply-${post.id}`}
                      >
                        <Send size={14} />
                        <span>Send</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal: Post Wanted Equipment */}
      {showPostModal && (
        <div className="modal-overlay" onClick={() => setShowPostModal(false)}>
          <div className="modal-card" style={{ maxWidth: '560px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Post Wanted Equipment Request</h3>
              <button className="modal-close-btn" onClick={() => setShowPostModal(false)}>
                &times;
              </button>
            </div>
            
            <form onSubmit={handleCreatePost} style={{ padding: '24px' }}>
              <div style={{ background: '#f0fdfa', border: '1px solid #99f6e4', padding: '10px 14px', borderRadius: '8px', marginBottom: '18px', fontSize: '0.82rem', color: '#0f766e' }}>
                Posting as: <strong>{currentDoctor?.name}</strong> (MOS #{currentDoctor?.membershipNo} • {currentDoctor?.city})
              </div>

              <div className="form-group">
                <label className="form-label">Equipment Name & Model Required *</label>
                <input 
                  type="text"
                  className="form-input"
                  placeholder="e.g. Carl Zeiss Lumera T or Alcon Infiniti Phaco Handpiece"
                  required
                  value={formData.equipmentName}
                  onChange={e => setFormData({ ...formData, equipmentName: e.target.value })}
                  id="input-wanted-title"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select 
                    className="form-select"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Target Budget (Approx.)</label>
                  <input 
                    type="text"
                    className="form-input"
                    placeholder="e.g. ₹ 12 - 15 Lakhs"
                    value={formData.targetBudget}
                    onChange={e => setFormData({ ...formData, targetBudget: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Urgency</label>
                <select 
                  className="form-select"
                  value={formData.urgency}
                  onChange={e => setFormData({ ...formData, urgency: e.target.value })}
                >
                  <option value="Immediate (Within 2 weeks)">Immediate (Within 2 weeks)</option>
                  <option value="Urgent (Within 1 month)">Urgent (Within 1 month)</option>
                  <option value="Flexible / Planning ahead">Flexible / Planning ahead</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Details / Specific Requirements</label>
                <textarea 
                  className="form-textarea"
                  rows={4}
                  placeholder="Mention preferred brands, acceptable age/condition, preferred location or whether you need warranty..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button 
                  type="button" 
                  className="btn-pluckcard-call" 
                  onClick={() => setShowPostModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-post-ad"
                  id="btn-submit-wanted-post"
                >
                  <span>Publish to Common Board</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
