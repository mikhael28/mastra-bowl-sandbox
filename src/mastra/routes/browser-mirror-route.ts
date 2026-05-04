import { registerApiRoute } from '@mastra/core/server';
import { mastraclawBrowser } from '../agents/mastraclaw-agent';

/**
 * GET /api/browser-mirror/:agentId
 *
 * Server-Sent Events stream that mirrors the StagehandBrowser via CDP
 * screencast. Each frame the headless browser produces (jpeg, base64) gets
 * pushed as `data: { "type": "frame", "data": "...", "viewport": {...} }`.
 *
 * When the browser isn't running yet (the agent hasn't called any
 * `stagehand_*` tool), we send periodic `inactive` heartbeats so the client
 * can render an empty-state placeholder. When the browser comes online we
 * attach the screencast and start pushing frames.
 *
 * NOTE: only mastraclaw-agent has a browser wired up in this project, so the
 * `agentId` param is currently advisory — we always mirror that one. When
 * other agents grow browsers we can resolve them via the mastra registry.
 */
export const browserMirrorRoute = registerApiRoute(
  '/browser-mirror/:agentId',
  {
    method: 'GET',
    handler: async (c) => {
      const browser: any = mastraclawBrowser;
      const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
          const enc = new TextEncoder();
          const send = (event: unknown) => {
            try {
              controller.enqueue(
                enc.encode(`data: ${JSON.stringify(event)}\n\n`),
              );
            } catch {
              /* controller closed */
            }
          };

          let screencast: any = null;
          let stopped = false;
          let inactivePoll: ReturnType<typeof setInterval> | null = null;

          const cleanup = async () => {
            if (stopped) return;
            stopped = true;
            if (inactivePoll) clearInterval(inactivePoll);
            if (screencast) {
              try {
                if (typeof screencast.stop === 'function') {
                  await screencast.stop();
                }
              } catch {
                /* ignore */
              }
              try {
                if (typeof screencast.removeAllListeners === 'function') {
                  screencast.removeAllListeners();
                }
              } catch {
                /* ignore */
              }
            }
            try {
              controller.close();
            } catch {
              /* already closed */
            }
          };

          // If the client disconnects, Hono signals abort on the request.
          c.req.raw.signal?.addEventListener('abort', () => {
            void cleanup();
          });

          const attachScreencast = async () => {
            try {
              if (
                typeof browser.startScreencastIfBrowserActive === 'function'
              ) {
                const s = await browser.startScreencastIfBrowserActive({
                  format: 'jpeg',
                  quality: 60,
                  maxWidth: 1280,
                  maxHeight: 800,
                });
                if (!s) return false;
                screencast = s;
              } else if (typeof browser.startScreencast === 'function') {
                if (
                  typeof browser.isBrowserRunning === 'function' &&
                  !browser.isBrowserRunning()
                ) {
                  return false;
                }
                screencast = await browser.startScreencast({
                  format: 'jpeg',
                  quality: 60,
                  maxWidth: 1280,
                  maxHeight: 800,
                });
              } else {
                return false;
              }
              if (typeof screencast.start === 'function') {
                await screencast.start();
              }
              screencast.on('frame', (frame: any) => {
                if (stopped) return;
                send({
                  type: 'frame',
                  data: frame.data,
                  viewport: frame.viewport,
                  timestamp: frame.timestamp,
                });
              });
              screencast.on('error', (err: unknown) => {
                send({ type: 'error', message: String(err) });
              });
              if (typeof screencast.on === 'function') {
                screencast.on('url', (url: string) => {
                  send({ type: 'url', url });
                });
              }
              send({ type: 'attached' });
              return true;
            } catch (err) {
              send({ type: 'error', message: String(err) });
              return false;
            }
          };

          // Try to attach immediately; if the browser isn't up yet, poll
          // every second until it is. Each attempt that fails sends an
          // `inactive` heartbeat so the client can show a placeholder.
          const tryAttachLoop = async () => {
            const ok = await attachScreencast();
            if (ok) return;
            send({ type: 'inactive' });
            inactivePoll = setInterval(async () => {
              if (stopped || screencast) return;
              const attached = await attachScreencast();
              if (attached && inactivePoll) {
                clearInterval(inactivePoll);
                inactivePoll = null;
              }
            }, 1500);
          };

          send({ type: 'open' });
          void tryAttachLoop();
        },
      });

      return new Response(stream, {
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
          Connection: 'keep-alive',
          'X-Accel-Buffering': 'no',
        },
      });
    },
  },
);
