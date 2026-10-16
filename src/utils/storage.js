import initialListings from '../data/initialListings.json';
import initialWantedPosts from '../data/initialWantedPosts.json';
import initialJobs from '../data/initialJobs.json';
import mosMembers from '../data/mosMembers.json';
import vendorsData from '../data/vendors.json';

const STORAGE_KEYS = {
  LISTINGS: 'mos_eyeequip_listings',
  WANTED_POSTS: 'mos_eyeequip_wanted_posts',
  JOBS: 'mos_eyeequip_jobs',
  MEMBERS: 'mos_eyeequip_members',
  VENDORS: 'mos_eyeequip_vendors',
  CURRENT_DOCTOR: 'mos_eyeequip_current_doctor',
  SAVED_ITEMS: 'mos_eyeequip_saved_items',
  INQUIRIES: 'mos_eyeequip_inquiries',
  VENDOR_REVIEWS: 'mos_eyeequip_vendor_reviews'
};

// Developer / SuperAdmin Stored Credentials (MOS ID: 'admin', Name: 'admin', Contact: 'admin12345')
export const DEVELOPER_ADMIN_ACCOUNT = {
  name: 'Admin',
  membershipNo: 'admin',
  membershipType: 'Super Administrator',
  email: 'admin@mos.org',
  mobile: 'admin12345',
  city: 'Mumbai',
  state: 'Maharashtra',
  isVerified: true,
  role: 'admin',
  lastLogin: new Date().toISOString()
};

// ================= MEMBER MANAGEMENT =================
export function getMembers() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading members from localStorage', e);
  }
  // Initialize with the 3,745 MOS database
  try {
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(mosMembers));
  } catch (err) {
    console.warn('localStorage limit reached, reading from json bundle', err);
  }
  return mosMembers;
}

export function saveMember(newMember) {
  const members = getMembers();
  const index = members.findIndex(m => String(m.membershipNo || '').toLowerCase() === String(newMember.membershipNo || '').toLowerCase());
  let updated;
  if (index >= 0) {
    updated = [...members];
    updated[index] = { ...updated[index], ...newMember };
  } else {
    updated = [newMember, ...members];
  }
  try {
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to persist members to localStorage', e);
  }
  return updated;
}

export function addMembersBulk(newMembersList) {
  const current = getMembers();
  const existingMap = new Map();
  current.forEach(m => existingMap.set(String(m.membershipNo).toLowerCase().trim(), m));

  let addedCount = 0;
  let updatedCount = 0;

  newMembersList.forEach(m => {
    if (!m.membershipNo || !m.name) return;
    const key = String(m.membershipNo).toLowerCase().trim();
    if (existingMap.has(key)) {
      existingMap.set(key, { ...existingMap.get(key), ...m });
      updatedCount++;
    } else {
      existingMap.set(key, m);
      addedCount++;
    }
  });

  const merged = Array.from(existingMap.values());
  try {
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(merged));
  } catch (e) {
    console.error('Failed to save bulk members', e);
  }
  return { updatedList: merged, addedCount, updatedCount };
}

// Verification function without OTP
export function verifyDoctorLogin(inputMembershipNo, inputName, inputContact) {
  if (!inputMembershipNo || !inputName) {
    return { success: false, reason: 'MOS Membership ID and Doctor Name are required.' };
  }
  if (!inputContact) {
    return { success: false, reason: 'Either Email ID or Mobile Number is required.' };
  }

  const cleanId = String(inputMembershipNo || '').trim().toLowerCase();
  const cleanName = String(inputName || '').trim().toLowerCase();
  const cleanContact = String(inputContact || '').trim().toLowerCase();

  // 1. Admin Override Stored Credentials:
  // MOS ID: 'admin', Name: 'admin', Contact number: 'admin12345'
  const isIdAdmin = cleanId === 'admin' || cleanId === 'admin-master';
  const isNameAdmin = cleanName === 'admin' || cleanName.replace(/dr\.?/g, '').trim() === 'admin';
  const isContactAdmin = cleanContact === 'admin12345' || cleanContact === 'admin@mos.org';

  if (isIdAdmin && isNameAdmin && isContactAdmin) {
    return { 
      success: true, 
      member: {
        ...DEVELOPER_ADMIN_ACCOUNT,
        lastLogin: new Date().toISOString()
      } 
    };
  }

  // If someone entered 'admin' ID but wrong name or contact
  if (isIdAdmin) {
    if (!isNameAdmin) {
      return { success: false, reason: 'Invalid admin credentials: Name must be "admin".' };
    }
    if (!isContactAdmin) {
      return { success: false, reason: 'Invalid admin credentials: Contact number must be "admin12345".' };
    }
  }

  const members = getMembers();
  
  // Find member by ID
  const member = members.find(m => String(m.membershipNo).trim().toLowerCase() === cleanId);
  if (!member) {
    return { success: false, reason: `No record found for MOS Membership ID "${inputMembershipNo}". Please check your membership card.` };
  }

  // Check Name (loose match: remove 'Dr.', strip dots/spaces)
  const normalizeName = (str) => (str || '').toLowerCase().replace(/dr\.?/g, '').replace(/[^a-z0-9]/g, '');
  const memberNorm = normalizeName(member.name);
  const inputNorm = normalizeName(inputName);

  if (!memberNorm.includes(inputNorm) && !inputNorm.includes(memberNorm)) {
    return { 
      success: false, 
      reason: `Doctor name does not match the registered name for MOS #${inputMembershipNo}. Registered as: ${member.name}` 
    };
  }

  // Check Email OR Mobile
  const memberEmail = (member.email || '').toLowerCase().trim();
  const memberMobile = (member.mobile || '').replace(/\D/g, '');
  const inputDigits = cleanContact.replace(/\D/g, '');

  const emailMatches = cleanContact.includes('@') && memberEmail && memberEmail === cleanContact;
  const mobileMatches = inputDigits.length >= 6 && memberMobile && (
    memberMobile.endsWith(inputDigits.slice(-6)) || inputDigits.endsWith(memberMobile.slice(-6))
  );

  if (!emailMatches && !mobileMatches) {
    return { 
      success: false, 
      reason: `Neither the entered Email nor Mobile Number matches our records for MOS #${inputMembershipNo}. Please provide your registered email or phone.` 
    };
  }

  return {
    success: true,
    member: {
      ...member,
      isVerified: true,
      role: 'doctor',
      lastLogin: new Date().toISOString()
    }
  };
}

// ================= JOB POSTINGS MANAGEMENT =================
export function getJobs() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.JOBS);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error reading jobs from localStorage', e);
  }
  localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(initialJobs));
  return initialJobs;
}

export function saveJob(newJob) {
  const jobs = getJobs();
  const index = jobs.findIndex(j => j.id === newJob.id);
  let updated;
  if (index >= 0) {
    updated = [...jobs];
    updated[index] = newJob;
  } else {
    updated = [newJob, ...jobs];
  }
  localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(updated));
  return updated;
}

export function updateJobStatus(jobId, status, adminName = 'MOS Admin') {
  const jobs = getJobs();
  const updated = jobs.map(job => {
    if (job.id === jobId) {
      return {
        ...job,
        status,
        approvedAt: status === 'approved' ? new Date().toISOString() : job.approvedAt,
        approvedBy: status === 'approved' ? adminName : job.approvedBy
      };
    }
    return job;
  });
  localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(updated));
  return updated;
}

export function deleteJob(jobId) {
  const jobs = getJobs();
  const updated = jobs.filter(j => j.id !== jobId);
  localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(updated));
  return updated;
}

// ================= LISTINGS MANAGEMENT =================
export function getListings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.LISTINGS);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error reading listings from localStorage', e);
  }
  localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(initialListings));
  return initialListings;
}

export function saveListing(newListing) {
  const listings = getListings();
  const index = listings.findIndex(l => l.id === newListing.id);
  let updated;
  if (index >= 0) {
    updated = [...listings];
    updated[index] = newListing;
  } else {
    updated = [newListing, ...listings];
  }
  localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(updated));
  return updated;
}

export function deleteListing(id) {
  const listings = getListings();
  const updated = listings.filter(l => l.id !== id);
  localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(updated));
  return updated;
}

// ================= WANTED POSTS (COMMON CHAT) =================
export function getWantedPosts() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.WANTED_POSTS);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error reading wanted posts from localStorage', e);
  }
  localStorage.setItem(STORAGE_KEYS.WANTED_POSTS, JSON.stringify(initialWantedPosts));
  return initialWantedPosts;
}

export function saveWantedPost(newPost) {
  const posts = getWantedPosts();
  const updated = [newPost, ...posts];
  localStorage.setItem(STORAGE_KEYS.WANTED_POSTS, JSON.stringify(updated));
  return updated;
}

export function addReplyToPost(postId, reply) {
  const posts = getWantedPosts();
  const updated = posts.map(post => {
    if (post.id === postId) {
      return {
        ...post,
        replies: [...(post.replies || []), reply]
      };
    }
    return post;
  });
  localStorage.setItem(STORAGE_KEYS.WANTED_POSTS, JSON.stringify(updated));
  return updated;
}

// ================= DOCTOR SESSION =================
export function getCurrentDoctor() {
  try {
    // One-time cleanup of legacy auto-login default doctor
    const legacyCleaned = localStorage.getItem('mos_legacy_auto_doc_cleared');
    if (!legacyCleaned) {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_DOCTOR);
      localStorage.setItem('mos_legacy_auto_doc_cleared', 'true');
      return null;
    }

    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_DOCTOR);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error reading doctor from localStorage', e);
  }
  return null;
}

export function setCurrentDoctor(doctor) {
  if (doctor) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_DOCTOR, JSON.stringify(doctor));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_DOCTOR);
  }
}

// ================= WISHLIST =================
export function getSavedItems() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SAVED_ITEMS);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function toggleSaveItem(id) {
  const items = getSavedItems();
  let updated;
  if (items.includes(id)) {
    updated = items.filter(item => item !== id);
  } else {
    updated = [...items, id];
  }
  localStorage.setItem(STORAGE_KEYS.SAVED_ITEMS, JSON.stringify(updated));
  return updated;
}

// ================= VENDORS & TECHNICIANS =================
export function getVendors() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.VENDORS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading vendors from localStorage', e);
  }
  // Initialize with vendors data
  try {
    localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify(vendorsData));
  } catch (err) {
    console.warn('localStorage error setting vendors', err);
  }
  return vendorsData;
}

export function saveVendor(newVendor) {
  const vendors = getVendors();
  let updated;
  if (newVendor.id) {
    const index = vendors.findIndex(v => v.id === newVendor.id);
    if (index >= 0) {
      updated = [...vendors];
      updated[index] = { ...updated[index], ...newVendor };
    } else {
      updated = [newVendor, ...vendors];
    }
  } else {
    const createdVendor = {
      ...newVendor,
      id: `v-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    updated = [createdVendor, ...vendors];
  }
  try {
    localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save vendor to localStorage', e);
  }
  return updated;
}

export function deleteVendor(id) {
  const vendors = getVendors();
  const updated = vendors.filter(v => v.id !== id);
  try {
    localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete vendor from localStorage', e);
  }
  return updated;
}

// ================= VENDOR REVIEWS & RATINGS =================
const INITIAL_VENDOR_REVIEWS = {
  'v-1': [
    {
      id: 'rev-1',
      doctorName: 'Dr. Amit Khare',
      membershipNo: '1842',
      city: 'Pune',
      rating: 5,
      comment: 'Prompt response on a Sunday when our Zeiss Lumera microscope halogen unit failed. Arrived within 3 hours.',
      date: '12 Oct 2026'
    },
    {
      id: 'rev-2',
      doctorName: 'Dr. Snehal Deshmukh',
      membershipNo: '2904',
      city: 'Mumbai',
      rating: 5,
      comment: 'Repaired our Phaco handpiece and recalibrated pressure sensors. Flawless OT performance since then.',
      date: '28 Sep 2026'
    }
  ],
  'v-2': [
    {
      id: 'rev-3',
      doctorName: 'Dr. Rajesh Kulkarni',
      membershipNo: '3115',
      city: 'Nashik',
      rating: 5,
      comment: 'Very knowledgeable regarding ophthalmic electronics and PCB repair. Fixed our Topcon slit lamp power unit.',
      date: '04 Oct 2026'
    }
  ],
  'v-3': [
    {
      id: 'rev-4',
      doctorName: 'Dr. Priya Shinde',
      membershipNo: '2240',
      city: 'Nagpur',
      rating: 5,
      comment: 'Reliable AMC service for our OT equipment. Highly courteous engineers with genuine spare parts.',
      date: '18 Sep 2026'
    }
  ]
};

export function getAllVendorReviews() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.VENDOR_REVIEWS);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error reading vendor reviews from localStorage', e);
  }
  try {
    localStorage.setItem(STORAGE_KEYS.VENDOR_REVIEWS, JSON.stringify(INITIAL_VENDOR_REVIEWS));
  } catch (e) {
    console.warn('Failed to initialize vendor reviews', e);
  }
  return INITIAL_VENDOR_REVIEWS;
}

export function getVendorReviews(vendorId) {
  const all = getAllVendorReviews();
  return all[vendorId] || [
    {
      id: `rev-default-${vendorId}`,
      doctorName: 'Dr. Verified MOS Member',
      membershipNo: 'MOS Surgeon',
      city: 'Maharashtra',
      rating: 5,
      comment: 'Verified service engineer recommended for ophthalmic surgical equipment maintenance and AMC support.',
      date: 'Recent'
    }
  ];
}

export function saveVendorReview(vendorId, review) {
  const all = getAllVendorReviews();
  const existing = all[vendorId] || [];
  const newReview = {
    ...review,
    id: `rev-${Date.now()}`,
    date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  };
  const updatedList = [newReview, ...existing];
  all[vendorId] = updatedList;

  try {
    localStorage.setItem(STORAGE_KEYS.VENDOR_REVIEWS, JSON.stringify(all));
  } catch (e) {
    console.error('Failed to save vendor review to localStorage', e);
  }
  return updatedList;
}

