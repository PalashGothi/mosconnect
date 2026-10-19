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

      // Smart merge customMembers
      const existingMembers = Array.isArray(existingData.customMembers) ? existingData.customMembers : [];
      const incomingMembers = Array.isArray(payload.customMembers) ? payload.customMembers : [];

      const memberMap = new Map();
      existingMembers.forEach(m => {
        if (m && m.membershipNo) memberMap.set(String(m.membershipNo).toLowerCase().trim(), m);
      });
      incomingMembers.forEach(m => {
        if (m && m.membershipNo) memberMap.set(String(m.membershipNo).toLowerCase().trim(), m);
      });

      const deletedIds = [
        ...(Array.isArray(existingData.deletedMemberIds) ? existingData.deletedMemberIds : []),
        ...(Array.isArray(payload.deletedMemberIds) ? payload.deletedMemberIds : [])
      ];
      const deletedSet = new Set(deletedIds.map(id => String(id).toLowerCase().trim()));
      const mergedCustomMembers = Array.from(memberMap.values()).filter(m => !deletedSet.has(String(m.membershipNo).toLowerCase().trim()));

      // Smart merge listings
      const existingListings = Array.isArray(existingData.listings) ? existingData.listings : [];
      const incomingListings = Array.isArray(payload.listings) ? payload.listings : [];
      const listingMap = new Map();
      existingListings.forEach(l => { if (l && l.id) listingMap.set(String(l.id), l); });
      incomingListings.forEach(l => { if (l && l.id) listingMap.set(String(l.id), l); });
      const deletedListingIds = [
        ...(Array.isArray(existingData.deletedListingIds) ? existingData.deletedListingIds : []),
        ...(Array.isArray(payload.deletedListingIds) ? payload.deletedListingIds : [])
      ];
      const deletedListingSet = new Set(deletedListingIds.map(id => String(id)));
      const mergedListings = Array.from(listingMap.values()).filter(l => !deletedListingSet.has(String(l.id)));

      // Smart merge vendors
      const existingVendors = Array.isArray(existingData.vendors) ? existingData.vendors : [];
      const incomingVendors = Array.isArray(payload.vendors) ? payload.vendors : [];
      const vendorMap = new Map();
      existingVendors.forEach(v => { if (v && v.id) vendorMap.set(String(v.id), v); });
      incomingVendors.forEach(v => { if (v && v.id) vendorMap.set(String(v.id), v); });
      const deletedVendorIds = [
        ...(Array.isArray(existingData.deletedVendorIds) ? existingData.deletedVendorIds : []),
        ...(Array.isArray(payload.deletedVendorIds) ? payload.deletedVendorIds : [])
      ];
      const deletedVendorSet = new Set(deletedVendorIds.map(id => String(id)));
      const mergedVendors = Array.from(vendorMap.values()).filter(v => !deletedVendorSet.has(String(v.id)));

      // Smart merge jobs
      const existingJobs = Array.isArray(existingData.jobs) ? existingData.jobs : [];
      const incomingJobs = Array.isArray(payload.jobs) ? payload.jobs : [];
      const jobMap = new Map();
      existingJobs.forEach(j => { if (j && j.id) jobMap.set(String(j.id), j); });
      incomingJobs.forEach(j => { if (j && j.id) jobMap.set(String(j.id), j); });
      const deletedJobIds = [
        ...(Array.isArray(existingData.deletedJobIds) ? existingData.deletedJobIds : []),
        ...(Array.isArray(payload.deletedJobIds) ? payload.deletedJobIds : [])
      ];
      const deletedJobSet = new Set(deletedJobIds.map(id => String(id)));
      const mergedJobs = Array.from(jobMap.values()).filter(j => !deletedJobSet.has(String(j.id)));

      const mergedPayload = {
        ...existingData,
        ...payload,
        customMembers: mergedCustomMembers,
        deletedMemberIds: Array.from(deletedSet),
        listings: mergedListings,
        deletedListingIds: Array.from(deletedListingSet),
        vendors: mergedVendors,
        deletedVendorIds: Array.from(deletedVendorSet),
        jobs: mergedJobs,
        deletedJobIds: Array.from(deletedJobSet),
        lastUpdated: Date.now()
      };

      const upstreamRes = await fetch(CLOUD_STORAGE_BIN, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mergedPayload)
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
