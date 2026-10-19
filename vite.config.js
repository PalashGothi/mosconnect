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
              cacheState = {
                ...cacheState,
                ...parsed,
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
