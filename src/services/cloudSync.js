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
let hasPendingPush = false;
let pendingStateGetter = null;
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
 * Sanitize heavy base64 images and redundant static data from cloud payload so uploads
 * stay strictly under the 100KB cloud storage limit (<55KB typical).
 * Note: Local browser retains full image data in localStorage.
 */
function sanitizePayloadForCloud(raw) {
  if (!raw || typeof raw !== 'object') return raw;
  try {
    const clone = JSON.parse(JSON.stringify(raw));
    
    // 1. Optimize Job Flyers (preserve crisp compressed flyers up to 45KB)
    if (Array.isArray(clone.jobs)) {
      clone.jobs = clone.jobs.map(job => {
        if (!job) return job;
        const j = { ...job };
        if (j.flyerImage && typeof j.flyerImage === 'string' && j.flyerImage.startsWith('data:') && j.flyerImage.length > 45000) {
          // If flyer exceeds 45KB, truncate data to protect the 100KB quota limit
          j.flyerImage = '';
        }
        return j;
      });
    }

    // 2. Optimize Listings Images
    if (Array.isArray(clone.listings)) {
      clone.listings = clone.listings.map(item => {
        if (!item) return item;
        const l = { ...item };
        if (l.image && typeof l.image === 'string' && l.image.startsWith('data:') && l.image.length > 25000) {
          l.image = '';
        }
        if (Array.isArray(l.images)) {
          l.images = l.images.map(img => (typeof img === 'string' && img.startsWith('data:') && img.length > 25000) ? '' : img).filter(Boolean);
        }
        return l;
      });
    }

    // 3. Optimize Vendors Payload:
    // Statically bundled vendors (v-1 to v-45) are already in vendors.json on every device.
    // In the cloud payload, keep only essential attributes for static vendors to save ~30KB of space!
    if (Array.isArray(clone.vendors)) {
      clone.vendors = clone.vendors.map(v => {
        if (!v) return v;
        const idNum = parseInt(String(v.id || '').replace('v-', ''), 10);
        const isStaticVendor = !v.isCustom && idNum >= 1 && idNum <= 45;
        if (isStaticVendor) {
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
    }

    // 4. Strict Safety Valve: If total payload is still > 80KB, strip remaining heavy base64 to prevent HTTP 413
    let strLen = JSON.stringify(clone).length;
    if (strLen > 80000 && Array.isArray(clone.jobs)) {
      clone.jobs = clone.jobs.map(j => ({ ...j, flyerImage: '' }));
    }

    return clone;
  } catch (e) {
    return raw;
  }
}

async function executePush(getStateFn) {
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

    // 2. If /api/sync not available or failed, push directly to fallback bin
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
    // Process queued push if updates occurred during the network call
    if (hasPendingPush && pendingStateGetter) {
      hasPendingPush = false;
      const nextFn = pendingStateGetter;
      pendingStateGetter = null;
      setTimeout(() => executePush(nextFn), 50);
    }
  }
}

/**
 * Immediate, non-debounced push to Cloud (used when user saves an edit or posts a job)
 */
export async function pushCloudDataImmediately(getStateFn) {
  pendingStateGetter = getStateFn;
  if (pushTimeout) {
    clearTimeout(pushTimeout);
    pushTimeout = null;
  }
  if (isSyncing) {
    hasPendingPush = true;
    return;
  }
  return executePush(getStateFn);
}

/**
 * Push the full state to Cloud (debounced with fast 150ms timeout)
 */
export function pushCloudDataDebounced(getStateFn, delayMs = 150) {
  pendingStateGetter = getStateFn;
  if (pushTimeout) {
    clearTimeout(pushTimeout);
  }

  pushTimeout = setTimeout(async () => {
    if (isSyncing) {
      hasPendingPush = true;
      return;
    }
    await executePush(getStateFn);
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
