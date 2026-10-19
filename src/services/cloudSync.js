/**
 * Real-Time Cross-Device Cloud Sync Service
 * Seamlessly syncs listings, wanted posts, jobs, members (custom & deletions), vendors, and reviews
 * across phone, laptop, and tablet using zero-CORS /api/sync endpoint and cloud backup.
 */

const FALLBACK_BIN = 'https://extendsclass.com/api/json-storage/bin/baefecf';

function getApiEndpoint() {
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    return `${window.location.origin}/api/sync`;
  }
  return '/api/sync';
}

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
 * Fetch the latest shared data from Cloud
 */
export async function fetchLatestCloudData() {
  const timestamp = Date.now();
  const apiEndpoint = `${getApiEndpoint()}?t=${timestamp}`;

  // 1. Try internal /api/sync endpoint first (0ms CORS)
  try {
    const res = await fetch(apiEndpoint, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });

    if (res.ok) {
      const json = await res.json();
      if (json && typeof json === 'object') {
        return normalizeRecord(json);
      }
    }
  } catch (err) {
    // API endpoint might be unreachable or offline, attempt direct fallback
  }

  // 2. Direct cloud bin fallback
  try {
    const fallbackUrl = `${FALLBACK_BIN}?t=${timestamp}`;
    const res2 = await fetch(fallbackUrl, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });

    if (res2.ok) {
      const json2 = await res2.json();
      return normalizeRecord(json2);
    }
  } catch (err2) {
    console.warn('[CloudSync] Fallback network error:', err2);
  }

  return null;
}

function normalizeRecord(json) {
  if (!json || typeof json !== 'object') return null;
  if (json.data && typeof json.data === 'string') {
    try {
      return JSON.parse(json.data);
    } catch (e) {}
  }
  if (json.record && typeof json.record === 'object') {
    return json.record;
  }
  return json;
}

/**
 * Sanitize heavy base64 images from cloud payload so uploads remain super-fast and lightweight (<50KB)
 * Note: Local browser retains full image data in localStorage
 */
function sanitizePayloadForCloud(raw) {
  if (!raw || typeof raw !== 'object') return raw;
  try {
    const clone = JSON.parse(JSON.stringify(raw));
    
    if (Array.isArray(clone.jobs)) {
      clone.jobs = clone.jobs.map(job => {
        if (!job) return job;
        const j = { ...job };
        // Preserve compressed flyers up to 600KB so they sync and display across all devices
        if (j.flyerImage && typeof j.flyerImage === 'string' && j.flyerImage.startsWith('data:') && j.flyerImage.length > 600000) {
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
 * Push the full state to Cloud (debounced with fast 150ms timeout)
 */
export function pushCloudDataDebounced(getStateFn, delayMs = 150) {
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
      const apiEndpoint = getApiEndpoint();

      let success = false;

      // 1. Send to /api/sync
      try {
        const res = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          success = true;
        }
      } catch (err) {}

      // 2. If /api/sync not available, push directly to fallback bin
      if (!success) {
        try {
          const res2 = await fetch(FALLBACK_BIN, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          });
          if (res2.ok) {
            success = true;
          }
        } catch (err2) {}
      }

      if (success) {
        notifyListeners({ type: 'push-success', timestamp: Date.now() });
      }
    } catch (err) {
      console.warn('[CloudSync] Network error during pushCloudData:', err);
    } finally {
      isSyncing = false;
    }
  }, delayMs);
}

/**
 * Immediate, non-debounced sync to pull fresh data
 */
export async function forceSyncNow(onDataLoaded) {
  try {
    const fresh = await fetchLatestCloudData();
    if (fresh && onDataLoaded) {
      onDataLoaded(fresh);
      notifyListeners({ type: 'pull-success', data: fresh });
    }
    return fresh;
  } catch (e) {
    return null;
  }
}

/**
 * Initialize cloud sync:
 * 1. Performs initial fetch from cloud
 * 2. Syncs into localStorage
 * 3. Sets up background refresh when window is focused or tab becomes visible
 * 4. Periodic background polling every 4 seconds for real-time live synchronization between phone and laptop
 */
export async function initCloudSync(onDataLoaded) {
  // 1. Initial pull
  const cloudRecord = await fetchLatestCloudData();
  if (cloudRecord && onDataLoaded) {
    onDataLoaded(cloudRecord);
    notifyListeners({ type: 'pull-success', data: cloudRecord });
  }

  // 2. Immediate refresh handler
  const handleRefresh = async () => {
    const fresh = await fetchLatestCloudData();
    if (fresh && onDataLoaded) {
      onDataLoaded(fresh);
      notifyListeners({ type: 'pull-success', data: fresh });
    }
  };

  window.addEventListener('focus', handleRefresh);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      handleRefresh();
    }
  });
  window.addEventListener('online', handleRefresh);

  // 3. Ultra-fast polling every 4 seconds for true live sync without needing to reload or log in/out
  const intervalId = setInterval(handleRefresh, 4000);

  return () => {
    window.removeEventListener('focus', handleRefresh);
    window.removeEventListener('online', handleRefresh);
    clearInterval(intervalId);
  };
}
