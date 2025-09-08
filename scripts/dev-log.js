#!/usr/bin/env node
/*
 Aggregates console logs from Rainbow extension entrypoints (background service worker and popup)
 using Chrome DevTools Protocol. Attach-only: connects to an existing Chrome instance
 listening on a remote debugging port and streams logs as targets appear.

 Usage:
   node scripts/dev-log.js [--port 9222] [--timeout 60000] [--quiet]

 Notes:
  - Start your dev build separately (yarn dev). This script only aggregates logs.
  - Ensure Chrome for Testing (or Chrome) is running with --remote-debugging-port=<port>
  - Load the unpacked extension into that browser so its targets exist.
*/

const path = require('path');
const CDP = require('chrome-remote-interface');

// --- CLI args ---
const args = require('node:util').parseArgs({
  options: {
    port: { type: 'string', default: '9222' },
    quiet: { type: 'boolean', default: false },
    timeout: { type: 'string' },
  },
});

const PORT = parseInt(args.values.port, 10) || 9222;
const QUIET = !!args.values.quiet;
const TIMEOUT_MS = args.values.timeout ? Math.max(0, parseInt(args.values.timeout, 10)) : null;

// --- Minimal color helpers ---
const colors = {
  gray: (s) => `\x1b[90m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  blue: (s) => `\x1b[34m${s}\x1b[0m`,
  magenta: (s) => `\x1b[35m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
};

function logInfo(msg) {
  if (!QUIET) console.log(colors.gray(`[dev:log] ${msg}`));
}

async function waitForCDP(port, timeoutMs) {
  const start = Date.now();
  while (true) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (res.ok) return true;
    } catch {}
    await new Promise((r) => setTimeout(r, 200));
    if (typeof timeoutMs === 'number' && timeoutMs >= 0 && Date.now() - start >= timeoutMs) break;
  }
  return false;
}

function formatTs(ts) {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

function parseHost(url) {
  try {
    const u = new URL(url);
    return u.host || u.hostname || '';
  } catch {
    return '';
  }
}

function formatPrefix(session, executionContextId) {
  if (!session) return colors.gray('[unknown]');
  const label = session.label;
  if (label === 'background') return colors.magenta('background');
  if (label === 'popup') return colors.cyan('popup');
  if (label === 'tab') {
    const ctx = executionContextId ? session.contexts.get(executionContextId) : null;
    const host = session.host || 'page';
    const which = ctx ? (ctx.isDefault ? 'inpage' : 'content') : 'tab';
    const tag = `${which} ${host}`;
    // colorize: inpage blue, content yellow, generic tab gray
    if (which === 'inpage') return colors.blue(tag);
    if (which === 'content') return colors.yellow(tag);
    return colors.gray(tag);
  }
  return colors.gray(label);
}

function previewArgs(args) {
  try {
    return args
      .map((a) => {
        if (!a) return '';
        if (a.value !== undefined) return safeToString(a.value);
        if (a.unserializableValue !== undefined) return String(a.unserializableValue);
        if (a.description) return a.description;
        if (a.type) return `[${a.type}]`;
        return '';
      })
      .filter(Boolean)
      .join(' ');
  } catch (e) {
    return '';
  }
}

function safeToString(v) {
  try {
    if (typeof v === 'string') return v;
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

function classifyTarget(targetInfo) {
  const { type, url = '', title = '' } = targetInfo;
  if (type === 'service_worker' || type === 'shared_worker' || type === 'worker') {
    if (url.startsWith('chrome-extension://')) return 'background';
    return null;
  }
  if (type === 'page') {
    if (url.startsWith('chrome-extension://')) return 'popup'; // treat any extension page as popup window
    // attach to host pages for content/inpage logs
    if (/^https?:\/\//i.test(url) || url.startsWith('file://')) return 'tab';
  }
  return null;
}

async function connectAndStream(port) {
  // Connect to the browser endpoint to discover targets
  const version = await fetch(`http://127.0.0.1:${port}/json/version`).then((r) => r.json());
  const browserWsUrl = version.webSocketDebuggerUrl;
  if (!browserWsUrl) throw new Error('Unable to resolve browser WebSocket URL');

  const browser = await CDP({ target: browserWsUrl });
  const { Target } = browser;
  await Target.setDiscoverTargets({ discover: true });

  // targetId -> { label, sessionId }
  const sessions = new Map();
  const pending = new Set();

  async function attachToTarget(targetInfo) {
    const label = classifyTarget(targetInfo);
    if (!label) return;
    const { targetId } = targetInfo;
    if (sessions.has(targetId) || pending.has(targetId)) return;
    pending.add(targetId);
    try {
      const { sessionId } = await Target.attachToTarget({ targetId, flatten: true });
      const url = targetInfo.url || '';
      const host = parseHost(url);
      const contexts = new Map(); // executionContextId -> { isDefault, origin, name }
      sessions.set(targetId, { label, sessionId, url, host, contexts });
      logInfo(`Attached to ${label} (${targetId})`);
      // enable domains within the session
      await Promise.allSettled([
        browser.send('Runtime.enable', undefined, sessionId),
        browser.send('Log.enable', undefined, sessionId),
      ]);

      // wire events scoped to the session
      browser.on(`Runtime.consoleAPICalled.${sessionId}`, (ev) => {
        const ts = colors.gray(formatTs(Date.now()));
        const s = sessions.get(targetId);
        const prefix = formatPrefix(s, ev.executionContextId);
        const levelColor =
          ev.type === 'error' ? colors.red : ev.type === 'warning' ? colors.yellow : colors.green;
        const text = previewArgs(ev.args || []);
        console.log(`${ts} ${prefix} ${levelColor(ev.type)} ${text}`);
      });

      browser.on(`Runtime.exceptionThrown.${sessionId}`, (ev) => {
        const ts = colors.gray(formatTs(Date.now()));
        const s = sessions.get(targetId);
        const prefix = formatPrefix(s, ev.exceptionDetails?.executionContextId);
        const details = ev.exceptionDetails;
        const msg = details?.exception?.description || details?.text || 'Uncaught exception';
        console.log(`${ts} ${prefix} ${colors.red('exception')} ${msg}`);
      });

      browser.on(`Log.entryAdded.${sessionId}`, (ev) => {
        const ts = colors.gray(formatTs(Date.now()));
        const s = sessions.get(targetId);
        const prefix = formatPrefix(s);
        const entry = ev.entry || {};
        const level = entry.level || 'info';
        const levelColor = level === 'error' ? colors.red : level === 'warning' ? colors.yellow : colors.green;
        const text = entry.text || '';
        console.log(`${ts} ${prefix} ${levelColor(level)} ${text}`);
      });

      browser.on(`Runtime.executionContextCreated.${sessionId}`, ({ context }) => {
        const s = sessions.get(targetId);
        if (!s) return;
        s.contexts.set(context.id, {
          isDefault: !!(context?.auxData?.isDefault),
          origin: context.origin || '',
          name: context.name || '',
        });
      });

      browser.on(`Runtime.executionContextDestroyed.${sessionId}`, ({ executionContextId }) => {
        const s = sessions.get(targetId);
        if (!s) return;
        s.contexts.delete(executionContextId);
      });
    } catch (e) {
      logInfo(`Failed attaching to ${label}: ${e.message || e}`);
    } finally {
      pending.delete(targetId);
    }
  }

  function detachTarget(targetId) {
    const s = sessions.get(targetId);
    if (!s) return;
    try {
      Target.detachFromTarget({ sessionId: s.sessionId });
    } catch {}
    sessions.delete(targetId);
  }

  // React to lifecycle events
  Target.targetCreated(async ({ targetInfo }) => {
    try {
      await attachToTarget(targetInfo);
    } catch (e) {
      logInfo(`Failed attaching to target: ${e.message || e}`);
    }
  });
  // Re-check targets when their info changes (e.g., URL becomes available)
  Target.targetInfoChanged(async ({ targetInfo }) => {
    try {
      await attachToTarget(targetInfo);
      const { targetId } = targetInfo;
      const s = sessions.get(targetId);
      if (s) {
        s.url = targetInfo.url || s.url;
        s.host = parseHost(s.url) || s.host;
      }
    } catch {}
  });

  Target.detachedFromTarget(({ sessionId, targetId }) => {
    if (targetId) sessions.delete(targetId);
  });
  Target.targetDestroyed(({ targetId }) => detachTarget(targetId));

  logInfo(`Connected to Chrome on port ${port}. Waiting for popup/background...`);

  // Also attach to any currently existing targets (in case they were present
  // before discovery was enabled). The 'pending' set avoids double attaches
  // if 'targetCreated' arrives concurrently for the same target.
  try {
    const { targetInfos } = await Target.getTargets();
    for (const ti of targetInfos) await attachToTarget(ti);
  } catch (e) {
    // non-fatal
  }

  // After a short delay, if no session attached, print guidance
  setTimeout(() => {
    if (sessions.size === 0) {
      console.log(
        colors.yellow(
          'No extension targets found yet. Make sure the extension is loaded in this browser.\n' +
            'Tip: open the popup to start streaming its logs.'
        )
      );
    }
  }, 3000);
}

(async () => {
  const max = TIMEOUT_MS ?? null; // null -> wait indefinitely
  logInfo(`Waiting for Chrome DevTools on port ${PORT}...`);
  const ready = await waitForCDP(PORT, max);
  if (!ready) {
    console.error(
      colors.red(
        `Timeout waiting for Chrome DevTools on port ${PORT}. Start Chrome with --remote-debugging-port=${PORT}.`
      )
    );
    process.exit(1);
  }
  await connectAndStream(PORT).catch((e) => {
    console.error(colors.red(`dev:log error: ${e.stack || e.message || e}`));
    process.exit(1);
  });
})();
