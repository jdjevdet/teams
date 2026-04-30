const V1_BASE_URL = "https://www.thesportsdb.com/api/v1/json";
const V2_BASE_URL = "https://www.thesportsdb.com/api/v2/json";

export async function fetchLeagueTeams(apiKey, league) {
  assertApiKey(apiKey);
  const data = await fetchJson(`${V2_BASE_URL}/list/teams/${league.id}`, {
    headers: {
      "X-API-KEY": apiKey,
      "X_API_KEY": apiKey,
      "Content-Type": "application/json"
    }
  });
  const teams = data.teams || data.team || data.list || data.data || [];
  return teams
    .map((team) => ({
      id: team.idTeam,
      name: team.strTeam,
      badge: team.strBadge || ""
    }))
    .filter((team) => team.name);
}

export async function fetchLeagueEventsForDate(apiKey, league, dateKey) {
  assertApiKey(apiKey);
  const url = new URL(`${V1_BASE_URL}/${apiKey}/eventsday.php`);
  url.searchParams.set("d", dateKey);
  url.searchParams.set("l", league.scheduleName);
  const data = await fetchJson(url);
  return (data.events || data.event || []).map((event) => normalizeEvent(event, league));
}

function normalizeEvent(event, league) {
  return {
    id: event.idEvent,
    leagueSlug: league.slug,
    title: event.strEvent || `${event.strHomeTeam || "Home"} vs. ${event.strAwayTeam || "Away"}`,
    homeTeam: event.strHomeTeam || "",
    awayTeam: event.strAwayTeam || "",
    timestamp: event.strTimestamp || "",
    date: event.dateEvent || "",
    time: event.strTime || "",
    status: event.strStatus || "",
    venue: event.strVenue || "",
    defaultDurationMinutes: league.defaultDurationMinutes
  };
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`TheSportsDB request failed: ${response.status} ${response.statusText} (${url})`);
  }
  return response.json();
}

function assertApiKey(apiKey) {
  if (!apiKey) {
    throw new Error("Missing THESPORTSDB_API_KEY. Add it to your environment before generating the EPG.");
  }
}
