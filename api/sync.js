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

      const mergedPayload = {
        ...existingData,
        ...payload,
        customMembers: mergedCustomMembers,
        deletedMemberIds: Array.from(deletedSet),
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
