import initialListings from '../data/initialListings.json';
import initialWantedPosts from '../data/initialWantedPosts.json';
import initialJobs from '../data/initialJobs.json';
import mosMembers from '../data/mosMembers.json';
import vendorsData from '../data/vendors.json';
import { pushCloudDataDebounced } from '../services/cloudSync.js';

const STORAGE_KEYS = {
  LISTINGS: 'mos_eyeequip_listings',
  WANTED_POSTS: 'mos_eyeequip_wanted_posts',
  JOBS: 'mos_eyeequip_jobs',
  MEMBERS: 'mos_eyeequip_members',
  CUSTOM_MEMBERS: 'mos_eyeequip_custom_members',
  VENDORS: 'mos_eyeequip_vendors',
  CURRENT_DOCTOR: 'mos_eyeequip_current_doctor',
  SAVED_ITEMS: 'mos_eyeequip_saved_items',
  INQUIRIES: 'mos_eyeequip_inquiries',
  VENDOR_REVIEWS: 'mos_eyeequip_vendor_reviews'
};

const TOMBSTONE_KEYS = {
  DELETED_JOBS: 'mos_deleted_job_ids',
  DELETED_LISTINGS: 'mos_deleted_listing_ids',
  DELETED_VENDORS: 'mos_deleted_vendor_ids',
  DELETED_MEMBERS: 'mos_deleted_member_ids'
};

function getDeletedIds(key) {
  try {
    const s = localStorage.getItem(key);
    return s ? JSON.parse(s) : [];
  } catch (e) {
    return [];
  }
}

function recordDeletedId(key, id) {
  try {
    const ids = getDeletedIds(key);
    const strId = String(id).trim();
    if (!ids.includes(strId)) {
      ids.push(strId);
      localStorage.setItem(key, JSON.stringify(ids));
    }
  } catch (e) {}
}

function unrecordDeletedId(key, id) {
  try {
    const strId = String(id).trim().toLowerCase();
    const ids = getDeletedIds(key).filter(x => String(x).trim().toLowerCase() !== strId);
    localStorage.setItem(key, JSON.stringify(ids));
  } catch (e) {}
}

/**
 * Trigger background push to cloud
 */
export function triggerCloudSync() {
  pushCloudDataDebounced(() => ({
    listings: getListings(),
    wantedPosts: getWantedPosts(),
    jobs: getJobs(),
    vendors: getVendors(),
    vendorReviews: getAllVendorReviews(),
    customMembers: getCustomMembers(),
    deletedMemberIds: getDeletedIds(TOMBSTONE_KEYS.DELETED_MEMBERS),
    deletedJobIds: getDeletedIds(TOMBSTONE_KEYS.DELETED_JOBS),
    deletedListingIds: getDeletedIds(TOMBSTONE_KEYS.DELETED_LISTINGS),
    deletedVendorIds: getDeletedIds(TOMBSTONE_KEYS.DELETED_VENDORS),
    lastUpdated: Date.now()
  }));
}

/**
 * Apply cloud data downloaded from cloud storage to local cache using smart bidirectional merge
 */
export function applyCloudRecord(record) {
  if (!record || typeof record !== 'object') return false;
  let changed = false;
  try {
    // 0. MERGE TOMBSTONES FIRST FROM CLOUD
    if (Array.isArray(record.deletedJobIds)) {
      record.deletedJobIds.forEach(id => recordDeletedId(TOMBSTONE_KEYS.DELETED_JOBS, id));
    }
    if (Array.isArray(record.deletedListingIds)) {
      record.deletedListingIds.forEach(id => recordDeletedId(TOMBSTONE_KEYS.DELETED_LISTINGS, id));
    }
    if (Array.isArray(record.deletedVendorIds)) {
      record.deletedVendorIds.forEach(id => recordDeletedId(TOMBSTONE_KEYS.DELETED_VENDORS, id));
    }
    if (Array.isArray(record.deletedMemberIds)) {
      record.deletedMemberIds.forEach(id => recordDeletedId(TOMBSTONE_KEYS.DELETED_MEMBERS, id));
    }

    const deletedJobIds = getDeletedIds(TOMBSTONE_KEYS.DELETED_JOBS);
    const deletedListingIds = getDeletedIds(TOMBSTONE_KEYS.DELETED_LISTINGS);
    const deletedVendorIds = getDeletedIds(TOMBSTONE_KEYS.DELETED_VENDORS);
    const deletedMemberIds = getDeletedIds(TOMBSTONE_KEYS.DELETED_MEMBERS);

    // 1. SMART MERGE LISTINGS
    if (Array.isArray(record.listings)) {
      const localListings = getListings();
      const listingMap = new Map();
      localListings.forEach(l => {
        if (l && l.id && !deletedListingIds.includes(l.id)) {
          listingMap.set(l.id, l);
        }
      });

      record.listings.forEach(cloudL => {
        if (!cloudL || !cloudL.id || deletedListingIds.includes(cloudL.id)) return;
        const existing = listingMap.get(cloudL.id);
        if (!existing) {
          listingMap.set(cloudL.id, cloudL);
          changed = true;
        } else {
          // Preserve local rich images if cloud copy was sanitized
          const keepImage = existing.image || cloudL.image;
          const keepImages = (existing.images && existing.images.length > 0) ? existing.images : cloudL.images;
          listingMap.set(cloudL.id, {
            ...cloudL,
            ...existing,
            image: keepImage,
            images: keepImages
          });
        }
      });
      localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(Array.from(listingMap.values())));
    }

    // 2. SMART MERGE WANTED POSTS
    if (Array.isArray(record.wantedPosts)) {
      const localPosts = getWantedPosts();
      const postMap = new Map();
      localPosts.forEach(p => {
        if (p && p.id) postMap.set(p.id, p);
      });

      record.wantedPosts.forEach(cloudP => {
        if (!cloudP || !cloudP.id) return;
        const existing = postMap.get(cloudP.id);
        if (!existing) {
          postMap.set(cloudP.id, cloudP);
          changed = true;
        } else {
          // Merge replies from both local and cloud
          const exReplies = Array.isArray(existing.replies) ? existing.replies : [];
          const clReplies = Array.isArray(cloudP.replies) ? cloudP.replies : [];
          const replyMap = new Map();
          exReplies.forEach(r => replyMap.set(r.id || `${r.doctorName}-${r.timestamp}`, r));
          clReplies.forEach(r => replyMap.set(r.id || `${r.doctorName}-${r.timestamp}`, r));
          const allReplies = Array.from(replyMap.values());
          if (allReplies.length !== exReplies.length) {
            changed = true;
          }
          postMap.set(cloudP.id, {
            ...cloudP,
            ...existing,
            replies: allReplies
          });
        }
      });
      localStorage.setItem(STORAGE_KEYS.WANTED_POSTS, JSON.stringify(Array.from(postMap.values())));
    }

    // 3. SMART MERGE JOBS
    if (Array.isArray(record.jobs)) {
      const localJobs = getJobs();
      const jobMap = new Map();
      localJobs.forEach(j => {
        if (j && j.id && !deletedJobIds.includes(j.id)) {
          jobMap.set(j.id, j);
        }
      });

      record.jobs.forEach(cloudJ => {
        if (!cloudJ || !cloudJ.id || deletedJobIds.includes(cloudJ.id)) return;
        const existing = jobMap.get(cloudJ.id);
        if (!existing) {
          jobMap.set(cloudJ.id, cloudJ);
          changed = true;
        } else {
          // CRITICAL: If job is approved locally or in cloud, keep approved! Never revert to pending
          const keepStatus = (existing.status === 'approved' || cloudJ.status === 'approved') ? 'approved' : cloudJ.status;
          const keepApprovedAt = existing.approvedAt || cloudJ.approvedAt;
          const keepApprovedBy = existing.approvedBy || cloudJ.approvedBy;
          const keepFlyer = existing.flyerImage || cloudJ.flyerImage;
          if (existing.status !== keepStatus) {
            changed = true;
          }
          jobMap.set(cloudJ.id, {
            ...cloudJ,
            ...existing,
            status: keepStatus,
            approvedAt: keepApprovedAt,
            approvedBy: keepApprovedBy,
            flyerImage: keepFlyer
          });
        }
      });
      localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(Array.from(jobMap.values())));
    }

    // 4. SMART MERGE VENDORS
    if (Array.isArray(record.vendors) && record.vendors.length > 0) {
      const localVendors = getVendors();
      const vendorMap = new Map();
      localVendors.forEach(v => {
        if (v && v.id && !deletedVendorIds.includes(v.id)) {
          vendorMap.set(v.id, v);
        }
      });
      record.vendors.forEach(cloudV => {
        if (!cloudV || !cloudV.id || deletedVendorIds.includes(cloudV.id)) return;
        if (!vendorMap.has(cloudV.id)) {
          vendorMap.set(cloudV.id, cloudV);
          changed = true;
        }
      });
      localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify(Array.from(vendorMap.values())));
    }

    // 5. VENDOR REVIEWS
    if (record.vendorReviews && typeof record.vendorReviews === 'object') {
      const localReviews = getAllVendorReviews();
      const cleanedCloud = {};
      Object.keys(record.vendorReviews).forEach(k => {
        const filtered = filterOutMockReviews(record.vendorReviews[k]);
        if (filtered.length > 0) {
          cleanedCloud[k] = filtered;
        }
      });
      const mergedReviews = { ...localReviews, ...cleanedCloud };
      localStorage.setItem(STORAGE_KEYS.VENDOR_REVIEWS, JSON.stringify(mergedReviews));
    }

    // 6. SMART MERGE CUSTOM MEMBERS & DELETIONS
    const deletedMemberSet = new Set(deletedMemberIds.map(x => String(x).toLowerCase().trim()));

    if (Array.isArray(record.customMembers) && record.customMembers.length > 0) {
      const localCustom = getCustomMembers();
      const customMap = new Map();
      localCustom.forEach(m => {
        if (m && m.membershipNo) {
          customMap.set(String(m.membershipNo).toLowerCase().trim(), m);
        }
      });

      let customUpdated = false;
      record.customMembers.forEach(cloudM => {
        if (!cloudM || !cloudM.membershipNo) return;
        const key = String(cloudM.membershipNo).toLowerCase().trim();
        if (deletedMemberSet.has(key)) return;

        const normalizedType = normalizeMembershipType(cloudM.membershipType);
        const cleanName = formatDoctorName(cloudM.name);
        const existing = customMap.get(key);
        const cloudWithTimestamp = {
          ...cloudM,
          name: cleanName,
          isCustom: true,
          createdAt: cloudM.createdAt || (existing && existing.createdAt) || new Date().toISOString(),
          membershipType: normalizedType
        };
        if (!existing || JSON.stringify(existing) !== JSON.stringify(cloudWithTimestamp)) {
          customMap.set(key, cloudWithTimestamp);
          customUpdated = true;
          changed = true;
        }
      });

      if (customUpdated) {
        localStorage.setItem(STORAGE_KEYS.CUSTOM_MEMBERS, JSON.stringify(Array.from(customMap.values())));
      }
    }

    // Filter out any members deleted from cloud
    const currentMembers = getMembers();
    const filteredMembers = currentMembers.filter(m => {
      const key = String(m.membershipNo || '').toLowerCase().trim();
      return !deletedMemberSet.has(key);
    });
    if (filteredMembers.length !== currentMembers.length) {
      localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(filteredMembers));
      changed = true;
    }
  } catch (e) {
    console.error('Error applying cloud record to localStorage', e);
  }
  return changed;
}

// Helper to filter out any fabricated mock reviews
export function filterOutMockReviews(reviewList) {
  if (!Array.isArray(reviewList)) return [];
  return reviewList.filter(r => {
    if (!r) return false;
    if (r.id === 'rev-1' || r.id === 'rev-2' || r.id === 'rev-3' || r.id === 'rev-4') return false;
    if (String(r.id).startsWith('rev-default-')) return false;
    if (r.doctorName === 'Dr. Verified MOS Member') return false;
    return true;
  });
}

// One-time cleanup of initial mock listings, wanted posts, jobs, and fabricated vendor reviews
try {
  const mockCleaned = localStorage.getItem('mos_mock_data_cleaned_v2');
  if (!mockCleaned) {
    localStorage.removeItem(STORAGE_KEYS.LISTINGS);
    localStorage.removeItem(STORAGE_KEYS.WANTED_POSTS);
    localStorage.removeItem(STORAGE_KEYS.JOBS);
    localStorage.setItem('mos_mock_data_cleaned_v2', 'true');
  }
  const fakeReviewsCleaned = localStorage.getItem('mos_fake_reviews_purged_v3');
  if (!fakeReviewsCleaned) {
    localStorage.removeItem(STORAGE_KEYS.VENDOR_REVIEWS);
    localStorage.setItem('mos_fake_reviews_purged_v3', 'true');
  }
} catch (e) {
  // ignore
}

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
export function normalizeMembershipType(type) {
  const t = String(type || '').trim().toLowerCase();
  if (t === 'non mos member' || t === 'non mos' || t === 'non-mos member') {
    return 'NON MOS Member';
  }
  return 'MOS Member';
}

// Clean & normalize Doctor names to prevent duplicate "Dr. Dr" prefixes
export function formatDoctorName(name) {
  if (!name || typeof name !== 'string') return '';
  let str = name.trim();
  if (!str) return '';

  // Remove any repeated prefixes case-insensitively (e.g. "Dr.", "Dr", "DR", "dr.", "Doctor", "Dr. Dr", etc.)
  str = str.replace(/^(?:(?:dr|doctor)\.?\s*)+/i, '').trim();

  // Return clean single "Dr. " prefix
  return str ? `Dr. ${str}` : name.trim();
}

export function getCustomMembers() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_MEMBERS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        let changed = false;
        const cleaned = parsed.map(m => {
          if (!m) return m;
          const cleanName = formatDoctorName(m.name);
          if (cleanName && cleanName !== m.name) {
            changed = true;
            return { ...m, name: cleanName };
          }
          return m;
        });
        if (changed) {
          try {
            localStorage.setItem(STORAGE_KEYS.CUSTOM_MEMBERS, JSON.stringify(cleaned));
          } catch (err) {}
        }
        return cleaned;
      }
    }
  } catch (e) {}
  return [];
}

export function saveCustomMember(member) {
  try {
    const list = getCustomMembers();
    const id = String(member.membershipNo || '').trim().toLowerCase();
    const clean = {
      ...member,
      name: formatDoctorName(member.name),
      isCustom: true,
      createdAt: member.createdAt || new Date().toISOString()
    };
    const idx = list.findIndex(m => String(m.membershipNo || '').trim().toLowerCase() === id);
    let updated;
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = { ...updated[idx], ...clean };
    } else {
      updated = [clean, ...list];
    }
    localStorage.setItem(STORAGE_KEYS.CUSTOM_MEMBERS, JSON.stringify(updated));
    return updated;
  } catch (e) {
    return [];
  }
}

export function getMembers() {
  const deletedIds = getDeletedIds(TOMBSTONE_KEYS.DELETED_MEMBERS);
  const deletedSet = new Set(deletedIds.map(x => String(x).toLowerCase().trim()));
  const customMembers = getCustomMembers();
  const customMap = new Map();
  customMembers.forEach(cm => {
    if (cm && cm.membershipNo) {
      customMap.set(String(cm.membershipNo).toLowerCase().trim(), cm);
    }
  });

  let rawList = [];
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        rawList = parsed;
      }
    }
  } catch (e) {
    console.error('Error reading members from localStorage', e);
  }

  if (rawList.length === 0) {
    rawList = mosMembers;
  }

  let needsSave = false;
  const resultMap = new Map();

  rawList.forEach(m => {
    if (!m || !m.membershipNo) return;
    const key = String(m.membershipNo).toLowerCase().trim();
    if (deletedSet.has(key)) {
      needsSave = true;
      return;
    }

    const normType = normalizeMembershipType(m.membershipType);
    const cleanName = formatDoctorName(m.name);
    if (m.membershipType !== normType || m.name !== cleanName) {
      needsSave = true;
    }

    resultMap.set(key, {
      ...m,
      name: cleanName,
      membershipType: normType
    });
  });

  // Overlay custom members
  customMap.forEach((cm, key) => {
    if (deletedSet.has(key)) return;
    const existing = resultMap.get(key);
    const cleanName = formatDoctorName(cm.name);
    resultMap.set(key, {
      ...(existing || {}),
      ...cm,
      name: cleanName,
      isCustom: true,
      createdAt: cm.createdAt || (existing && existing.createdAt),
      membershipType: normalizeMembershipType(cm.membershipType)
    });
    if (!existing || (existing && existing.name !== cleanName)) {
      needsSave = true;
    }
  });

  const finalMembers = Array.from(resultMap.values());

  if (needsSave || !localStorage.getItem(STORAGE_KEYS.MEMBERS)) {
    try {
      localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(finalMembers));
    } catch (err) {
      console.warn('localStorage limit reached, saving delta in custom members', err);
    }
  }

  return finalMembers;
}

export function saveMember(newMember) {
  if (!newMember || !newMember.membershipNo) return getMembers();
  const rawId = String(newMember.membershipNo).trim();
  unrecordDeletedId(TOMBSTONE_KEYS.DELETED_MEMBERS, rawId);

  const cleanMember = {
    ...newMember,
    name: formatDoctorName(newMember.name),
    isCustom: true,
    createdAt: newMember.createdAt || new Date().toISOString(),
    membershipType: normalizeMembershipType(newMember.membershipType)
  };

  saveCustomMember(cleanMember);

  const members = getMembers();
  const index = members.findIndex(m => String(m.membershipNo || '').toLowerCase() === String(cleanMember.membershipNo || '').toLowerCase());
  let updated;
  if (index >= 0) {
    updated = [...members];
    updated[index] = { ...updated[index], ...cleanMember };
  } else {
    updated = [cleanMember, ...members];
  }

  try {
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to persist members to localStorage', e);
  }

  triggerCloudSync();
  return updated;
}

export function updateMember(updatedMember, oldMembershipNo = null) {
  if (!updatedMember || !updatedMember.membershipNo) return getMembers();
  const newId = String(updatedMember.membershipNo).trim();
  const oldId = oldMembershipNo ? String(oldMembershipNo).trim() : newId;

  if (oldId && oldId.toLowerCase() !== newId.toLowerCase()) {
    deleteMember(oldId);
  }

  return saveMember(updatedMember);
}

export function deleteMember(membershipNo) {
  if (!membershipNo) return getMembers();
  const rawId = String(membershipNo).trim();
  const lowerId = rawId.toLowerCase();

  // 1. Record tombstone
  recordDeletedId(TOMBSTONE_KEYS.DELETED_MEMBERS, rawId);

  // 2. Remove from custom members
  try {
    const custom = getCustomMembers();
    const updatedCustom = custom.filter(m => String(m.membershipNo || '').trim().toLowerCase() !== lowerId);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_MEMBERS, JSON.stringify(updatedCustom));
  } catch (e) {}

  // 3. Remove from local full members
  const members = getMembers();
  const updated = members.filter(m => String(m.membershipNo || '').trim().toLowerCase() !== lowerId);

  try {
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete member from localStorage', e);
  }

  triggerCloudSync();
  return updated;
}

export function addMembersBulk(newMembersList) {
  const current = getMembers();
  const existingMap = new Map();
  current.forEach(m => existingMap.set(String(m.membershipNo).toLowerCase().trim(), m));

  let addedCount = 0;
  let updatedCount = 0;
  const newCustom = [];

  newMembersList.forEach(m => {
    if (!m.membershipNo || !m.name) return;
    const clean = {
      ...m,
      membershipType: normalizeMembershipType(m.membershipType)
    };
    unrecordDeletedId(TOMBSTONE_KEYS.DELETED_MEMBERS, clean.membershipNo);
    newCustom.push(clean);

    const key = String(clean.membershipNo).toLowerCase().trim();
    if (existingMap.has(key)) {
      existingMap.set(key, { ...existingMap.get(key), ...clean });
      updatedCount++;
    } else {
      existingMap.set(key, clean);
      addedCount++;
    }
  });

  newCustom.forEach(cm => saveCustomMember(cm));

  const merged = Array.from(existingMap.values());
  try {
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(merged));
  } catch (e) {
    console.error('Failed to save bulk members', e);
  }

  triggerCloudSync();
  return { updatedList: merged, addedCount, updatedCount };
}

// Helper for loose, human-friendly doctor name matching
export function matchDoctorNames(registeredName, inputName) {
  if (!registeredName || !inputName) return false;

  // 1. Clean prefixes: Dr, Dr., Doctor, Prof, Shri, Smt, etc.
  const clean = (str) => {
    return String(str || '')
      .toLowerCase()
      .replace(/\b(dr|prof|doctor|shri|smt|mrs?|ms)\b\.?/gi, ' ')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const regClean = clean(registeredName);
  const inpClean = clean(inputName);

  // If input was purely 'dr.' or empty, don't hard reject
  if (!inpClean) return true;

  // 2. Direct string contains (spaces removed)
  const regNoSpace = regClean.replace(/\s+/g, '');
  const inpNoSpace = inpClean.replace(/\s+/g, '');
  if (regNoSpace && inpNoSpace) {
    if (regNoSpace.includes(inpNoSpace) || inpNoSpace.includes(regNoSpace)) {
      return true;
    }
  }

  // 3. Token-based word match (handles missing middle names, initials, reversed order)
  const regTokens = regClean.split(' ').filter(w => w.length >= 2);
  const inpTokens = inpClean.split(' ').filter(w => w.length >= 2);

  if (inpTokens.length === 0) return true;

  // Check if any significant word of the input (>=3 letters) matches any registered token
  const hasMatchingWord = inpTokens.some(inpWord => {
    if (inpWord.length < 3) return false;
    return regTokens.some(regWord => 
      regWord === inpWord || 
      regWord.startsWith(inpWord) || 
      inpWord.startsWith(regWord)
    );
  });

  if (hasMatchingWord) return true;

  // Exact token match for shorter words
  if (inpTokens.some(inpWord => regTokens.includes(inpWord))) {
    return true;
  }

  return false;
}

// Verification function without OTP - Requires MOS ID / User ID + Doctor Name + Email/Mobile (MOS ID is compulsory)
export function verifyDoctorLogin(inputMembershipNo = '', inputName = '', inputContact = '') {
  let membershipNo = '';
  let name = '';
  let contact = '';

  if (arguments.length === 2) {
    contact = inputMembershipNo || '';
    name = inputName || '';
  } else {
    membershipNo = inputMembershipNo || '';
    name = inputName || '';
    contact = inputContact || '';
  }

  if (!membershipNo || !String(membershipNo).trim()) {
    return { success: false, reason: 'MOS ID / User ID (for non mos members) is compulsory.' };
  }
  if (!name || !String(name).trim()) {
    return { success: false, reason: 'Doctor Name is required.' };
  }
  if (!contact || !String(contact).trim()) {
    return { success: false, reason: 'Registered Email OR Mobile Number is required.' };
  }

  const norm = str => String(str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const digits = str => String(str || '').replace(/\D/g, '');
  const last10Digits = str => digits(str).slice(-10);

  const cleanId = String(membershipNo || '').trim().toLowerCase();
  const cleanIdNorm = norm(cleanId);
  const cleanIdDigits = digits(cleanId);

  const cleanName = String(name || '').trim().toLowerCase();
  const cleanContact = String(contact || '').trim().toLowerCase();
  const inputDigits = digits(cleanContact);
  const inputLast10 = last10Digits(cleanContact);
  const isIdProvided = !!cleanId;

  // 1. Admin Override Stored Credentials:
  // ID: 'admin', Name: 'admin', Contact: 'admin12345' or 'admin@mos.org'
  const isIdAdmin = cleanId === 'admin' || cleanId === 'admin-master' || cleanId === '3545';
  const isNameAdmin = cleanName === 'admin' || cleanName.replace(/dr\.?/g, '').trim() === 'admin';
  const isContactAdmin = cleanContact === 'admin12345' || cleanContact === 'admin@mos.org' || cleanContact === 'admin';

  if (isIdAdmin && isNameAdmin && isContactAdmin) {
    return { 
      success: true, 
      member: {
        ...DEVELOPER_ADMIN_ACCOUNT,
        lastLogin: new Date().toISOString()
      } 
    };
  }

  // 2. Direct Support for Dr. Atul Kadhane (Opticura Leadership)
  const isAtulContact = inputDigits.includes('9890617789') || cleanContact.includes('atul.kadhane') || cleanContact === 'opticura' || cleanContact === 'atul';
  const isAtulName = matchDoctorNames('Dr. Atul Kadhane', name) || cleanName.includes('atul') || cleanName.includes('kadhane');
  const isAtulId = cleanId === '3545' || cleanId === 'admin' || cleanId === 'user-3545';

  if ((isAtulContact || isAtulName) && isAtulId) {
    return {
      success: true,
      member: {
        sNo: '217',
        membershipNo: '3545',
        membershipType: 'MOS Member & Platform Administrator',
        name: 'Dr. Atul Kadhane',
        email: 'atul.kadhane@opticura.in',
        mobile: '9890617789',
        city: 'Amravati / Mumbai',
        state: 'Maharashtra',
        isVerified: true,
        role: 'admin',
        ratifiedYear: '2025',
        lastLogin: new Date().toISOString()
      }
    };
  }

  const members = getMembers();

  // 3. Database lookup in Approved Members
  const matchedMember = members.find(m => {
    const mId = String(m.membershipNo || '').trim().toLowerCase();
    const mIdNorm = norm(mId);
    const mIdDigits = digits(mId);

    const mEmail = (m.email || '').toLowerCase().trim();
    const mMobile = (m.mobile || '').trim();
    const mDigits = digits(mMobile);
    const mLast10 = last10Digits(mMobile);

    // 1. Check ID Match (if user entered an ID)
    let idMatches = false;
    if (isIdProvided) {
      idMatches = 
        mId === cleanId || 
        mIdNorm === cleanIdNorm ||
        mId.endsWith(cleanId) || 
        cleanId.endsWith(mId) ||
        (cleanIdDigits.length >= 3 && mIdDigits.endsWith(cleanIdDigits)) ||
        (cleanIdDigits.length >= 3 && cleanIdDigits.endsWith(mIdDigits));
      
      // If user typed an ID, but it doesn't match this record at all, skip
      if (!idMatches) return false;
    }

    // 2. Check Name Match
    const nameMatches = matchDoctorNames(m.name, name);

    // 3. Check Contact Match (Email or Phone or ID)
    let contactMatches = false;
    if (cleanContact.includes('@')) {
      // Email entered
      if (mEmail && (mEmail === cleanContact || mEmail.includes(cleanContact) || cleanContact.includes(mEmail))) {
        contactMatches = true;
      }
    } else if (inputLast10.length >= 7) {
      // Phone number entered
      if (mLast10 && (mLast10 === inputLast10 || mDigits.endsWith(inputDigits) || inputDigits.endsWith(mDigits))) {
        contactMatches = true;
      }
    }

    // Also check if contact entered matches membership ID (e.g. USER-5038)
    if (!contactMatches && cleanContact) {
      if (cleanContact === mId || norm(cleanContact) === mIdNorm || (inputDigits.length >= 4 && inputDigits === mIdDigits)) {
        contactMatches = true;
      }
    }

    // Final matching decision:
    // If ID was provided and matched:
    //   -> Either Name matches OR Contact matches!
    if (isIdProvided && idMatches) {
      return nameMatches || contactMatches;
    }

    // If ID was NOT provided:
    //   -> Name must match AND Contact must match
    return nameMatches && contactMatches;
  });

  if (matchedMember) {
    const isDoctorAtul = 
      String(matchedMember.membershipNo) === '3545' || 
      String(matchedMember.mobile) === '9890617789' ||
      matchDoctorNames('Dr. Atul Kadhane', matchedMember.name);

    return {
      success: true,
      member: {
        ...matchedMember,
        isVerified: true,
        role: isDoctorAtul ? 'admin' : (matchedMember.role || 'doctor'),
        membershipType: isDoctorAtul ? 'MOS Member & Platform Administrator' : normalizeMembershipType(matchedMember.membershipType),
        lastLogin: new Date().toISOString()
      }
    };
  }

  return { 
    success: false, 
    reason: 'Credentials could not be verified in the approved eye doctor directory. Please verify your Name and Mobile/Email, or contact Dr. Atul Kadhane on WhatsApp for access.' 
  };
}

// Dedicated helper to register a new user with just Name and Email/Mobile
export function registerNewDoctorUser({ name, contact, city = 'Maharashtra' }) {
  if (!name || !String(name).trim()) {
    return { success: false, reason: 'Doctor name is required.' };
  }
  if (!contact || !String(contact).trim()) {
    return { success: false, reason: 'Email ID or Mobile Number is required.' };
  }

  const cleanContact = String(contact || '').trim().toLowerCase();
  const inputDigits = cleanContact.replace(/\D/g, '');
  const members = getMembers();

  const formattedName = formatDoctorName(name);
  const newMember = {
    sNo: String(members.length + 1),
    membershipNo: `USER-${Math.floor(1000 + Math.random() * 9000)}`,
    membershipType: 'NON MOS Member',
    name: formattedName,
    email: cleanContact.includes('@') ? cleanContact : '',
    mobile: inputDigits || cleanContact,
    city: city.trim() || 'Maharashtra',
    state: 'Maharashtra',
    isVerified: true,
    role: 'doctor',
    ratifiedYear: '2026',
    lastLogin: new Date().toISOString()
  };

  saveMember(newMember);
  return {
    success: true,
    member: newMember
  };
}

// ================= JOB POSTINGS MANAGEMENT =================
export function getJobs() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.JOBS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading jobs from localStorage', e);
  }
  localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(initialJobs));
  return initialJobs;
}

export function saveJob(newJob) {
  unrecordDeletedId(TOMBSTONE_KEYS.DELETED_JOBS, newJob.id);
  const jobs = getJobs();
  const index = jobs.findIndex(j => j.id === newJob.id);
  let updated;
  if (index >= 0) {
    updated = [...jobs];
    updated[index] = newJob;
  } else {
    updated = [newJob, ...jobs];
  }
  try {
    localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save jobs to localStorage:', err);
  }
  triggerCloudSync();
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
  triggerCloudSync();
  return updated;
}

export function deleteJob(jobId) {
  recordDeletedId(TOMBSTONE_KEYS.DELETED_JOBS, jobId);
  const jobs = getJobs();
  const updated = jobs.filter(j => j.id !== jobId);
  localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(updated));
  triggerCloudSync();
  return updated;
}

// ================= LISTINGS MANAGEMENT =================
export function getListings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.LISTINGS);
    let current = [];
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        current = parsed;
      }
    }
    
    // Auto-merge any initial listings that do not exist yet in local storage, or enrich with images
    const existingMap = new Map(current.map(l => [l.id, l]));
    let hasNew = false;
    for (const init of initialListings) {
      if (!existingMap.has(init.id)) {
        current.push(init);
        hasNew = true;
      } else {
        const item = existingMap.get(init.id);
        if ((!item.images || item.images.length === 0) && init.images && init.images.length > 0) {
          item.images = init.images;
          if (init.reasonForSale) item.reasonForSale = init.reasonForSale;
          if (init.callingHours) item.callingHours = init.callingHours;
          hasNew = true;
        }
      }
    }

    if (current.length > 0) {
      if (hasNew || !saved) {
        localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(current));
        triggerCloudSync();
      }
      return current;
    }
  } catch (e) {
    console.error('Error reading listings from localStorage', e);
  }
  localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(initialListings));
  return initialListings;
}

export function saveListing(newListing) {
  unrecordDeletedId(TOMBSTONE_KEYS.DELETED_LISTINGS, newListing.id);
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
  triggerCloudSync();
  return updated;
}

export function deleteListing(id) {
  recordDeletedId(TOMBSTONE_KEYS.DELETED_LISTINGS, id);
  const listings = getListings();
  const updated = listings.filter(l => l.id !== id);
  localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(updated));
  triggerCloudSync();
  return updated;
}

// ================= WANTED POSTS (COMMON CHAT) =================
export function getWantedPosts() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.WANTED_POSTS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
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
  triggerCloudSync();
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
  triggerCloudSync();
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
      const parsed = JSON.parse(saved);
      // Ensure Dr. Atul Kadhane always has Admin rights
      if (parsed && (
        String(parsed.membershipNo) === '3545' || 
        String(parsed.mobile) === '9890617789' ||
        String(parsed.name || '').toLowerCase().includes('atul kadhane')
      )) {
        if (parsed.role !== 'admin') {
          parsed.role = 'admin';
          parsed.membershipType = 'MOS Member & Platform Administrator';
          localStorage.setItem(STORAGE_KEYS.CURRENT_DOCTOR, JSON.stringify(parsed));
        }
      }
      return parsed;
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
        return parsed.map(v => {
          if (!v) return v;
          const { rating, ...rest } = v;
          return rest;
        });
      }
    }
  } catch (e) {
    console.error('Error reading vendors from localStorage', e);
  }
  // Initialize with vendors data without rating
  const cleanVendors = vendorsData.map(v => {
    if (!v) return v;
    const { rating, ...rest } = v;
    return rest;
  });
  try {
    localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify(cleanVendors));
  } catch (err) {
    console.warn('localStorage error setting vendors', err);
  }
  return cleanVendors;
}

export function saveVendor(newVendor) {
  if (newVendor.id) {
    unrecordDeletedId(TOMBSTONE_KEYS.DELETED_VENDORS, newVendor.id);
  }
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
    triggerCloudSync();
  } catch (e) {
    console.error('Failed to save vendor to localStorage', e);
  }
  return updated;
}

export function deleteVendor(id) {
  recordDeletedId(TOMBSTONE_KEYS.DELETED_VENDORS, id);
  const vendors = getVendors();
  const updated = vendors.filter(v => v.id !== id);
  try {
    localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify(updated));
    triggerCloudSync();
  } catch (e) {
    console.error('Failed to delete vendor from localStorage', e);
  }
  return updated;
}

// ================= VENDOR REVIEWS & RATINGS =================
const INITIAL_VENDOR_REVIEWS = {};

export function getAllVendorReviews() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.VENDOR_REVIEWS);
    if (saved) {
      const parsed = JSON.parse(saved);
      const cleaned = {};
      Object.keys(parsed).forEach(k => {
        const filtered = filterOutMockReviews(parsed[k]);
        if (filtered.length > 0) {
          cleaned[k] = filtered;
        }
      });
      return cleaned;
    }
  } catch (e) {
    console.error('Error reading vendor reviews from localStorage', e);
  }
  return INITIAL_VENDOR_REVIEWS;
}

export function getVendorReviews(vendorId) {
  const all = getAllVendorReviews();
  return all[vendorId] || [];
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
    triggerCloudSync();
  } catch (e) {
    console.error('Failed to save vendor review to localStorage', e);
  }
  return updatedList;
}

