import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { config, leagues } from "./config.js";
import { fetchLeagueEventsForDate, fetchLeagueTeams } from "./thesportsdb.js";
import { zonedDateKey } from "./time.js";
import { buildXmltv } from "./xmltv.js";

export async function generateEpg({ date = new Date(), outputPath = config.outputPath } = {}) {
  const dateKey = zonedDateKey(date, config.timezone);
  const teamsByLeague = new Map();
  const eventsByLeague = new Map();

  for (const league of leagues) {
    const [teams, events] = await Promise.all([
      fetchLeagueTeams(config.apiKey, league),
      fetchLeagueEventsForDate(config.apiKey, league, dateKey)
    ]);

    teamsByLeague.set(league.slug, teams);
    eventsByLeague.set(league.slug, events);
  }

  const xml = buildXmltv({
    leagues,
    teamsByLeague,
    eventsByLeague,
    dateKey,
    timezone: config.timezone,
    upcomingLeadHours: config.upcomingLeadHours,
    noEventTitle: config.noEventTitle,
    sourceInfoName: config.sourceInfoName,
    sourceInfoUrl: config.sourceInfoUrl
  });

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, xml, "utf8");

  return {
    dateKey,
    outputPath,
    teamCount: [...teamsByLeague.values()].reduce((sum, teams) => sum + teams.length, 0),
    eventCount: [...eventsByLeague.values()].reduce((sum, events) => sum + events.length, 0),
    xml
  };
}
