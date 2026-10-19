/**
 * Real-Time Cloud Sync Service
 * Provides instant cross-device synchronization between phone, laptop, and tablet
 * for listings, wanted posts, jobs, members (custom & deletions), vendors, and reviews.
 */

const STORAGE_ENDPOINT = import.meta.env.VITE_CLOUD_STORAGE_URL || 'https://extendsclass.com/api/json-storage/bin/baefecf';

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
  if (!STORAGE_ENDPOINT) return null;

  try {
    const bustUrl = `${STORAGE_ENDPOINT}?t=${Date.now()}`;
    const res = await fetch(bustUrl, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });

    if (!res.ok) {
      console.warn(`[CloudSync] Fetch error (${res.status}):`, await res.text());
      return null;
    }

    const json = await res.json();
    // Handle both direct object and wrapped response forms
    if (json && typeof json === 'object') {
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
    return null;
  } catch (err) {
    console.warn('[CloudSync] Network error during fetchLatestCloudData:', err);
    return null;
  }
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
 * Push the full state to Cloud (debounced to avoid unnecessary network flooding)
 */
export function pushCloudDataDebounced(getStateFn, delayMs = 300) {
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

      const res = await fetch(STORAGE_ENDPOINT, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        console.warn(`[CloudSync] Push error (${res.status}):`, await res.text());
      } else {
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
 * 4. Periodic background polling every 12 seconds for seamless multi-device live sync
 */
export async function initCloudSync(onDataLoaded) {
  // 1. Initial pull
  const cloudRecord = await fetchLatestCloudData();
  if (cloudRecord && onDataLoaded) {
    onDataLoaded(cloudRecord);
    notifyListeners({ type: 'pull-success', data: cloudRecord });
  }

  // 2. Refresh on window focus & tab visibility change
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

  // 3. High-frequency polling every 12 seconds for true live sync between phone and laptop
  const intervalId = setInterval(handleRefresh, 12000);

  return () => {
    window.removeEventListener('focus', handleRefresh);
    window.removeEventListener('online', handleRefresh);
    clearInterval(intervalId);
  };
}
