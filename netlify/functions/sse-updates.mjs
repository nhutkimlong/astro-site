import { getStore } from '@netlify/blobs';

// Server-Sent Events stream that emits when notifications/gps lastModified changes
// Strategy: long-lived response, poll blobs every 3s, send event when version changes
export default async function handler(request, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive'
  };

  if (request.method === 'OPTIONS') {
    return new Response('', { status: 200, headers });
  }

  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405, headers });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let notificationsVersion = null;
      let gpsVersion = null;
      let isClosed = false;

      const write = (data) => controller.enqueue(encoder.encode(data));

      // Initial hello event
      write(`event: hello\n`);
      write(`data: {"message":"connected"}\n\n`);

      let notificationsStore, gpsStore;
      try {
        notificationsStore = getStore('climb-notifications');
        gpsStore = getStore('climb-gps-settings');
      } catch (e) {
        // Fallback: still keep the stream open but send heartbeat only
        const intervalId = setInterval(() => {
          if (isClosed) return;
          write(`event: ping\n`);
          write(`data: {}\n\n`);
        }, 15000);
        const cancel = () => { clearInterval(intervalId); };
        // Keep alive until client disconnects
        request.signal.addEventListener('abort', () => { isClosed = true; cancel(); controller.close(); });
        return;
      }

      const poll = async () => {
        try {
          const [nVer, gVer, nBump, gBump] = await Promise.all([
            notificationsStore.get('lastModified', { type: 'json' }),
            gpsStore.get('lastModified', { type: 'json' }),
            notificationsStore.get('cacheInvalidated', { type: 'json' }),
            gpsStore.get('cacheInvalidated', { type: 'json' })
          ]);

          const nVersionCandidate = nBump || nVer;
          const gVersionCandidate = gBump || gVer;

          const nChanged = nVersionCandidate && nVersionCandidate !== notificationsVersion;
          const gChanged = gVersionCandidate && gVersionCandidate !== gpsVersion;

          if (nChanged || gChanged) {
            if (nChanged) notificationsVersion = nVersionCandidate || Date.now();
            if (gChanged) gpsVersion = gVersionCandidate || Date.now();
            const payload = {
              notificationsLastModified: notificationsVersion,
              gpsLastModified: gpsVersion
            };
            write(`event: update\n`);
            write(`data: ${JSON.stringify(payload)}\n\n`);
          } else {
            // heartbeat to keep connection
            write(`event: ping\n`);
            write(`data: {}\n\n`);
          }
        } catch (err) {
          write(`event: error\n`);
          write(`data: {"message": "poll_error"}\n\n`);
        }
      };

      // Prime versions so first change triggers an event; also emit an initial update
      try {
        const [n0, g0] = await Promise.all([
          notificationsStore.get('lastModified', { type: 'json' }),
          gpsStore.get('lastModified', { type: 'json' })
        ]);
        notificationsVersion = n0 || null;
        gpsVersion = g0 || null;
        write(`event: snapshot\n`);
        write(`data: ${JSON.stringify({ notificationsLastModified: notificationsVersion, gpsLastModified: gpsVersion })}\n\n`);
      } catch {}

      const intervalId = setInterval(poll, 1000);

      // Close handling
      request.signal.addEventListener('abort', () => {
        isClosed = true;
        clearInterval(intervalId);
        controller.close();
      });
    }
  });

  return new Response(stream, { headers });
}


