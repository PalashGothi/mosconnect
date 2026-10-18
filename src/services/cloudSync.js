/**
 * Cloud Sync Service with JSONBin.io
 * Provides cross-device real-time sync for listings, wanted posts, jobs, vendors, and reviews.
 */

const BIN_ID = import.meta.env.VITE_JSONBIN_BIN_ID || '6ad3a1cbffd5d1605373e7a7';
const API_KEY = import.meta.env.VITE_JSONBIN_API_KEY || '$2a$10$xstrCmJ3IrQNIUIhtnkvye.WkiWDevXbvNd0k1NVE1vgNtCZFKB/K';
const BASE_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

let isSyncing = false;
let pushTimeout = null;
const listeners = new Set();

export function subscribeCloudSync(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notifyListeners(data) {
  listeners.forEach(fn => {
    try {
      fn(data);
    } catch (e) {
      console.error('Error in cloud sync listener', e);
    }
  });
}

/**
 * Fetch the latest shared data from JSONBin
 */
export async function fetchLatestCloudData() {
  if (!BIN_ID || !API_KEY) return null;

  try {
    const res = await fetch(`${BASE_URL}/latest`, {
      method: 'GET',
      headers: {
        'X-Master-Key': API_KEY,
        'Cache-Control': 'no-cache'
      }
    });

    if (!res.ok) {
      console.warn(`[JSONBin] Fetch error (${res.status}):`, await res.text());
      return null;
    }

    const json = await res.json();
    return json.record || null;
  } catch (err) {
    console.warn('[JSONBin] Network error during fetchLatestCloudData:', err);
    return null;
  }
}

/**
 * Sanitize heavy base64 strings from cloud payload so JSONBin free plan (<100KB) does not reject with 403
 */
function sanitizePayloadForCloud(raw) {
  if (!raw || typeof raw !== 'object') return raw;
  try {
    const clone = JSON.parse(JSON.stringify(raw));
    
    if (Array.isArray(clone.jobs)) {
      clone.jobs = clone.jobs.map(job => {
        if (!job) return job;
        const j = { ...job };
        if (j.flyerImage && typeof j.flyerImage === 'string' && j.flyerImage.startsWith('data:') && j.flyerImage.length > 5000) {
          j.flyerImage = '';
        }
        return j;
      });
    }

    if (Array.isArray(clone.listings)) {
      clone.listings = clone.listings.map(item => {
        if (!item) return item;
        const l = { ...item };
        if (l.image && typeof l.image === 'string' && l.image.startsWith('data:') && l.image.length > 5000) {
          l.image = '';
        }
        if (Array.isArray(l.images)) {
          l.images = l.images.map(img => (typeof img === 'string' && img.startsWith('data:') && img.length > 5000) ? '' : img).filter(Boolean);
        }
        return l;
      });
    }

    return clone;
  } catch (e) {
    return raw;
  }
}

/**
 * Push the full state to JSONBin (debounced to avoid rate limits)
 */
export function pushCloudDataDebounced(getStateFn, delayMs = 600) {
  if (pushTimeout) {
    clearTimeout(pushTimeout);
  }

  pushTimeout = setTimeout(async () => {
    if (isSyncing) return;
    try {
      isSyncing = true;
      const rawPayload = getStateFn();
      if (!rawPayload) return;

      const payload = sanitizePayloadForCloud(rawPayload);

      const res = await fetch(BASE_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': API_KEY
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        console.warn(`[JSONBin] Push error (${res.status}):`, await res.text());
      } else {
        notifyListeners({ type: 'push-success', timestamp: Date.now() });
      }
    } catch (err) {
      console.warn('[JSONBin] Network error during pushCloudData:', err);
    } finally {
      isSyncing = false;
    }
  }, delayMs);
}

/**
 * Initialize cloud sync:
 * 1. Performs initial fetch from cloud bin
 * 2. Syncs into localStorage
 * 3. Sets up background refresh when window is focused
 */
export async function initCloudSync(onDataLoaded) {
  const cloudRecord = await fetchLatestCloudData();

  if (cloudRecord) {
    if (onDataLoaded) {
      onDataLoaded(cloudRecord);
    }
    notifyListeners({ type: 'pull-success', data: cloudRecord });
  }

  // Auto-refresh when user switches back to this tab/window
  const handleFocus = async () => {
    const fresh = await fetchLatestCloudData();
    if (fresh && onDataLoaded) {
      onDataLoaded(fresh);
      notifyListeners({ type: 'pull-success', data: fresh });
    }
  };

  window.addEventListener('focus', handleFocus);

  // Periodic poll every 90 seconds
  const intervalId = setInterval(async () => {
    const fresh = await fetchLatestCloudData();
    if (fresh && onDataLoaded) {
      onDataLoaded(fresh);
      notifyListeners({ type: 'pull-success', data: fresh });
    }
  }, 90000);

  return () => {
    window.removeEventListener('focus', handleFocus);
    clearInterval(intervalId);
  };
}
