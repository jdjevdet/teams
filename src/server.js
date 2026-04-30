import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { config } from "./config.js";
import { generateEpg } from "./generator.js";
import { nextZonedRun } from "./time.js";

let lastRefresh = null;
let lastError = null;
let refreshPromise = null;

const server = createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);

  try {
    if (url.pathname === "/" || url.pathname === "/health") {
      sendJson(response, 200, {
        ok: !lastError,
        epg: "/epg.xml",
        lastRefresh,
        lastError: lastError ? lastError.message : null,
        timezone: config.timezone
      });
      return;
    }

    if (url.pathname === "/refresh") {
      if (config.refreshToken && url.searchParams.get("token") !== config.refreshToken) {
        sendText(response, 401, "Unauthorized");
        return;
      }
      const result = await refreshEpg();
      sendJson(response, 200, summarize(result));
      return;
    }

    if (url.pathname === "/epg.xml") {
      await ensureEpgExists();
      const xml = await readFile(config.outputPath, "utf8");
      response.writeHead(200, {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=300"
      });
      response.end(xml);
      return;
    }

    sendText(response, 404, "Not found");
  } catch (error) {
    lastError = error;
    sendJson(response, 500, { ok: false, error: error.message });
  }
});

server.listen(config.port, () => {
  console.log(`Teams EPG listening on port ${config.port}`);
  scheduleNextRefresh();
  refreshEpg().catch((error) => {
    lastError = error;
    console.error(error);
  });
});

async function ensureEpgExists() {
  try {
    await readFile(config.outputPath, "utf8");
  } catch {
    await refreshEpg();
  }
}

async function refreshEpg() {
  if (!refreshPromise) {
    refreshPromise = generateEpg()
      .then((result) => {
        lastRefresh = new Date().toISOString();
        lastError = null;
        return result;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

function scheduleNextRefresh() {
  const nextRun = nextZonedRun(new Date(), config.timezone, config.refreshHour, config.refreshMinute);
  const delay = Math.max(1000, nextRun.getTime() - Date.now());
  console.log(`Next EPG refresh scheduled for ${nextRun.toISOString()}`);
  setTimeout(async () => {
    try {
      await refreshEpg();
    } catch (error) {
      lastError = error;
      console.error(error);
    } finally {
      scheduleNextRefresh();
    }
  }, delay);
}

function summarize(result) {
  return {
    ok: true,
    date: result.dateKey,
    teams: result.teamCount,
    events: result.eventCount,
    outputPath: result.outputPath
  };
}

function sendJson(response, status, value) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(value, null, 2));
}

function sendText(response, status, value) {
  response.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
  response.end(value);
}
