import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

const CLOUD_STORAGE_BIN = 'https://extendsclass.com/api/json-storage/bin/baefecf';
const STATE_FILE = path.resolve(__dirname, 'src/data/liveSyncState.json');

function syncApiPlugin() {
  let cacheState = {
    listings: [],
    wantedPosts: [],
    jobs: [],
    vendors: [],
    vendorReviews: {},
    customMembers: [],
    deletedMemberIds: [],
    deletedJobIds: [],
    deletedListingIds: [],
    deletedVendorIds: [],
    lastUpdated: Date.now()
  };

  // Load existing state from disk if present
  try {
    if (fs.existsSync(STATE_FILE)) {
      const saved = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
      if (saved && typeof saved === 'object') {
        cacheState = { ...cacheState, ...saved };
      }
    }
  } catch (e) {}

  // Fetch initial state from cloud in background
  fetch(`${CLOUD_STORAGE_BIN}?t=${Date.now()}`, { headers: { 'Cache-Control': 'no-cache' } })
    .then(r => r.json())
    .then(data => {
      if (data && typeof data === 'object') {
        cacheState = { ...cacheState, ...data };
      }
    })
    .catch(() => {});

  return {
    name: 'mos-sync-api-middleware',
    configureServer(server) {
      server.middlewares.use('/api/sync', (req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
          res.statusCode = 200;
          res.end();
          return;
        }

        if (req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          res.end(JSON.stringify(cacheState));
          return;
        }

        if (req.method === 'POST' || req.method === 'PUT') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body);

              // Smart merge customMembers
              const existingMembers = Array.isArray(cacheState.customMembers) ? cacheState.customMembers : [];
              const incomingMembers = Array.isArray(parsed.customMembers) ? parsed.customMembers : [];

              const memberMap = new Map();
              existingMembers.forEach(m => {
                if (m && m.membershipNo) memberMap.set(String(m.membershipNo).toLowerCase().trim(), m);
              });
              incomingMembers.forEach(m => {
                if (m && m.membershipNo) memberMap.set(String(m.membershipNo).toLowerCase().trim(), m);
              });

              const deletedIds = [
                ...(Array.isArray(cacheState.deletedMemberIds) ? cacheState.deletedMemberIds : []),
                ...(Array.isArray(parsed.deletedMemberIds) ? parsed.deletedMemberIds : [])
              ];
              const deletedSet = new Set(deletedIds.map(id => String(id).toLowerCase().trim()));
              const mergedCustomMembers = Array.from(memberMap.values()).filter(m => !deletedSet.has(String(m.membershipNo).toLowerCase().trim()));

              // Smart merge listings
              const existingListings = Array.isArray(cacheState.listings) ? cacheState.listings : [];
              const incomingListings = Array.isArray(parsed.listings) ? parsed.listings : [];
              const listingMap = new Map();
              existingListings.forEach(l => { if (l && l.id) listingMap.set(String(l.id), l); });
              incomingListings.forEach(l => { if (l && l.id) listingMap.set(String(l.id), l); });
              const deletedListingIds = [
                ...(Array.isArray(cacheState.deletedListingIds) ? cacheState.deletedListingIds : []),
                ...(Array.isArray(parsed.deletedListingIds) ? parsed.deletedListingIds : [])
              ];
              const deletedListingSet = new Set(deletedListingIds.map(id => String(id)));
              const mergedListings = Array.from(listingMap.values()).filter(l => !deletedListingSet.has(String(l.id)));

              // Smart merge vendors
              const existingVendors = Array.isArray(cacheState.vendors) ? cacheState.vendors : [];
              const incomingVendors = Array.isArray(parsed.vendors) ? parsed.vendors : [];
              const vendorMap = new Map();
              existingVendors.forEach(v => { if (v && v.id) vendorMap.set(String(v.id), v); });
              incomingVendors.forEach(v => { if (v && v.id) vendorMap.set(String(v.id), v); });
              const deletedVendorIds = [
                ...(Array.isArray(cacheState.deletedVendorIds) ? cacheState.deletedVendorIds : []),
                ...(Array.isArray(parsed.deletedVendorIds) ? parsed.deletedVendorIds : [])
              ];
              const deletedVendorSet = new Set(deletedVendorIds.map(id => String(id)));
              const mergedVendors = Array.from(vendorMap.values()).filter(v => !deletedVendorSet.has(String(v.id)));

              // Smart merge jobs
              const existingJobs = Array.isArray(cacheState.jobs) ? cacheState.jobs : [];
              const incomingJobs = Array.isArray(parsed.jobs) ? parsed.jobs : [];
              const jobMap = new Map();
              existingJobs.forEach(j => { if (j && j.id) jobMap.set(String(j.id), j); });
              incomingJobs.forEach(j => { if (j && j.id) jobMap.set(String(j.id), j); });
              const deletedJobIds = [
                ...(Array.isArray(cacheState.deletedJobIds) ? cacheState.deletedJobIds : []),
                ...(Array.isArray(parsed.deletedJobIds) ? parsed.deletedJobIds : [])
              ];
              const deletedJobSet = new Set(deletedJobIds.map(id => String(id)));
              const mergedJobs = Array.from(jobMap.values()).filter(j => !deletedJobSet.has(String(j.id)));

              cacheState = {
                ...cacheState,
                ...parsed,
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

              // Persist locally
              try {
                fs.writeFileSync(STATE_FILE, JSON.stringify(cacheState, null, 2), 'utf8');
              } catch (err) {}

              // Asynchronously push to upstream cloud storage bin
              fetch(CLOUD_STORAGE_BIN, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cacheState)
              }).catch(err => {
                console.warn('[SyncPlugin] Upstream cloud backup sync failed:', err.message);
              });

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, lastUpdated: cacheState.lastUpdated }));
            } catch (err) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
            }
          });
          return;
        }

        res.statusCode = 405;
        res.end();
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), syncApiPlugin()],
  server: {
    port: 5173,
    host: true
  }
});
