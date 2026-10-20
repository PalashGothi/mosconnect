/**
 * Vercel Serverless Function: /api/sync
 * Provides zero-CORS cloud sync proxy for production deployments
 */

const CLOUD_STORAGE_BIN = 'https://extendsclass.com/api/json-storage/bin/baefecf';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const upstreamRes = await fetch(`${CLOUD_STORAGE_BIN}?t=${Date.now()}`, {
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
      });
      if (!upstreamRes.ok) {
        return res.status(upstreamRes.status).json({ error: 'Failed to fetch from storage bin' });
      }
      const data = await upstreamRes.json();
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    try {
      const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

      // Smart merge with existing cloud data to prevent accidental wiping of custom members
      let existingData = {};
      try {
        const getRes = await fetch(`${CLOUD_STORAGE_BIN}?t=${Date.now()}`);
        if (getRes.ok) {
          const raw = await getRes.json();
          existingData = (raw && raw.data && typeof raw.data === 'string') ? JSON.parse(raw.data) : (raw || {});
        }
      } catch (e) {}

      // 1. Smart merge customMembers with timestamp resolution
      const existingMembers = Array.isArray(existingData.customMembers) ? existingData.customMembers : [];
      const incomingMembers = Array.isArray(payload.customMembers) ? payload.customMembers : [];
      const memberMap = new Map();
      existingMembers.forEach(m => {
        if (m && m.membershipNo) memberMap.set(String(m.membershipNo).toLowerCase().trim(), m);
      });
      incomingMembers.forEach(m => {
        if (!m || !m.membershipNo) return;
        const key = String(m.membershipNo).toLowerCase().trim();
        const ex = memberMap.get(key);
        if (!ex) {
          memberMap.set(key, m);
        } else {
          const exTime = new Date(ex.updatedAt || ex.createdAt || 0).getTime();
          const inTime = new Date(m.updatedAt || m.createdAt || 0).getTime();
          memberMap.set(key, inTime >= exTime ? { ...ex, ...m } : { ...m, ...ex });
        }
      });

      const deletedIds = [
        ...(Array.isArray(existingData.deletedMemberIds) ? existingData.deletedMemberIds : []),
        ...(Array.isArray(payload.deletedMemberIds) ? payload.deletedMemberIds : [])
      ];
      const deletedSet = new Set(deletedIds.map(id => String(id).toLowerCase().trim()));
      const mergedCustomMembers = Array.from(memberMap.values()).filter(m => !deletedSet.has(String(m.membershipNo).toLowerCase().trim()));

      // 2. Smart merge listings with timestamp resolution and image preservation
      const existingListings = Array.isArray(existingData.listings) ? existingData.listings : [];
      const incomingListings = Array.isArray(payload.listings) ? payload.listings : [];
      const listingMap = new Map();
      existingListings.forEach(l => { if (l && l.id) listingMap.set(String(l.id), l); });
      incomingListings.forEach(l => {
        if (!l || !l.id) return;
        const key = String(l.id);
        const ex = listingMap.get(key);
        if (!ex) {
          listingMap.set(key, l);
        } else {
          const exTime = new Date(ex.updatedAt || ex.createdAt || 0).getTime();
          const inTime = new Date(l.updatedAt || l.createdAt || 0).getTime();
          const keepImg = l.image || ex.image;
          const keepImgs = (l.images && l.images.length > 0) ? l.images : ex.images;
          if (inTime >= exTime) {
            listingMap.set(key, { ...ex, ...l, image: keepImg, images: keepImgs });
          } else {
            listingMap.set(key, { ...l, ...ex, image: keepImg, images: keepImgs });
          }
        }
      });
      const deletedListingIds = [
        ...(Array.isArray(existingData.deletedListingIds) ? existingData.deletedListingIds : []),
        ...(Array.isArray(payload.deletedListingIds) ? payload.deletedListingIds : [])
      ];
      const deletedListingSet = new Set(deletedListingIds.map(id => String(id)));
      const mergedListings = Array.from(listingMap.values()).filter(l => !deletedListingSet.has(String(l.id)));

      // 3. Smart merge vendors with timestamp resolution
      const existingVendors = Array.isArray(existingData.vendors) ? existingData.vendors : [];
      const incomingVendors = Array.isArray(payload.vendors) ? payload.vendors : [];
      const vendorMap = new Map();
      existingVendors.forEach(v => { if (v && v.id) vendorMap.set(String(v.id), v); });
      incomingVendors.forEach(v => {
        if (!v || !v.id) return;
        const key = String(v.id);
        const ex = vendorMap.get(key);
        if (!ex) {
          vendorMap.set(key, v);
        } else {
          const exTime = new Date(ex.updatedAt || ex.createdAt || 0).getTime();
          const inTime = new Date(v.updatedAt || v.createdAt || 0).getTime();
          if (inTime >= exTime) {
            vendorMap.set(key, { ...ex, ...v });
          }
        }
      });
      const deletedVendorIds = [
        ...(Array.isArray(existingData.deletedVendorIds) ? existingData.deletedVendorIds : []),
        ...(Array.isArray(payload.deletedVendorIds) ? payload.deletedVendorIds : [])
      ];
      const deletedVendorSet = new Set(deletedVendorIds.map(id => String(id)));
      const mergedVendors = Array.from(vendorMap.values()).filter(v => !deletedVendorSet.has(String(v.id)));

      // 4. Smart merge jobs with timestamp resolution & permanent approval lock
      const existingJobs = Array.isArray(existingData.jobs) ? existingData.jobs : [];
      const incomingJobs = Array.isArray(payload.jobs) ? payload.jobs : [];
      const jobMap = new Map();
      existingJobs.forEach(j => { if (j && j.id) jobMap.set(String(j.id), j); });
      incomingJobs.forEach(j => {
        if (!j || !j.id) return;
        const key = String(j.id);
        const ex = jobMap.get(key);
        if (!ex) {
          jobMap.set(key, j);
        } else {
          const exTime = new Date(ex.updatedAt || ex.postedAt || ex.createdAt || 0).getTime();
          const inTime = new Date(j.updatedAt || j.postedAt || j.createdAt || 0).getTime();
          // Once approved on any device, keep approved!
          const keepStatus = (ex.status === 'approved' || j.status === 'approved') ? 'approved' : (inTime >= exTime ? j.status : ex.status);
          const keepFlyer = j.flyerImage || ex.flyerImage;
          const keepApprovedAt = ex.approvedAt || j.approvedAt;
          const keepApprovedBy = ex.approvedBy || j.approvedBy;
          if (inTime >= exTime) {
            jobMap.set(key, { ...ex, ...j, status: keepStatus, flyerImage: keepFlyer, approvedAt: keepApprovedAt, approvedBy: keepApprovedBy });
          } else {
            jobMap.set(key, { ...j, ...ex, status: keepStatus, flyerImage: keepFlyer, approvedAt: keepApprovedAt, approvedBy: keepApprovedBy });
          }
        }
      });
      const deletedJobIds = [
        ...(Array.isArray(existingData.deletedJobIds) ? existingData.deletedJobIds : []),
        ...(Array.isArray(payload.deletedJobIds) ? payload.deletedJobIds : [])
      ];
      const deletedJobSet = new Set(deletedJobIds.map(id => String(id)));
      const mergedJobs = Array.from(jobMap.values()).filter(j => !deletedJobSet.has(String(j.id)));

      // Optimize vendor payload to keep essential static fields and avoid payload bloat
      const sanitizedVendors = mergedVendors.map(v => {
        if (!v) return v;
        const idNum = parseInt(String(v.id || '').replace('v-', ''), 10);
        if (!v.isCustom && idNum >= 1 && idNum <= 45) {
          return {
            id: v.id,
            name: v.name,
            company: v.company,
            city: v.city,
            phones: v.phones,
            categories: v.categories,
            verified: v.verified,
            badge: v.badge
          };
        }
        return v;
      });

      const mergedPayload = {
        ...existingData,
        ...payload,
        customMembers: mergedCustomMembers,
        deletedMemberIds: Array.from(deletedSet),
        listings: mergedListings,
        deletedListingIds: Array.from(deletedListingSet),
        vendors: sanitizedVendors,
        deletedVendorIds: Array.from(deletedVendorSet),
        jobs: mergedJobs,
        deletedJobIds: Array.from(deletedJobSet),
        lastUpdated: Date.now()
      };

      // 80KB Quota Safeguard: Ensure total JSON size never exceeds ExtendsClass 100KB limit
      let payloadJson = JSON.stringify(mergedPayload);
      if (payloadJson.length > 80000) {
        mergedPayload.jobs = (mergedPayload.jobs || []).map(j => {
          if (j && j.flyerImage && typeof j.flyerImage === 'string' && j.flyerImage.length > 30000) {
            return { ...j, flyerImage: '' };
          }
          return j;
        });
        payloadJson = JSON.stringify(mergedPayload);
      }

      const upstreamRes = await fetch(CLOUD_STORAGE_BIN, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: payloadJson
      });
      if (!upstreamRes.ok) {
        return res.status(upstreamRes.status).json({ error: 'Failed to update storage bin' });
      }
      return res.status(200).json({ success: true, timestamp: mergedPayload.lastUpdated });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
