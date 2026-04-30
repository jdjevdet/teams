import { channelId } from "./labels.js";
import { addMinutes, startOfZonedDay, xmltvTime } from "./time.js";

export function buildXmltv({ leagues, teamsByLeague, eventsByLeague, dateKey, timezone, upcomingLeadHours, noEventTitle, sourceInfoName, sourceInfoUrl }) {
  const channels = leagues.flatMap((league) =>
    (teamsByLeague.get(league.slug) || []).map((team) => ({
      id: channelId(team.name, channelSlug(league)),
      name: `${team.name} ${league.displayName}`,
      icon: team.badge || ""
    }))
  );

  const dayStart = startOfZonedDay(dateKey, timezone);
  const dayEnd = addMinutes(dayStart, 24 * 60);
  const programmes = [];

  for (const league of leagues) {
    const teams = teamsByLeague.get(league.slug) || [];
    const events = eventsByLeague.get(league.slug) || [];

    for (const team of teams) {
      const teamEvents = events
        .filter((event) => event.homeTeam === team.name || event.awayTeam === team.name)
        .map((event) => withEventTimes(event))
        .filter((event) => event.start && event.end)
        .sort((a, b) => a.start - b.start);

      const channel = channelId(team.name, channelSlug(league));
      let cursor = dayStart;

      if (teamEvents.length === 0) {
        programmes.push(programme(channel, dayStart, dayEnd, noEventTitle, `${team.name} has no ${league.displayName} event scheduled today.`));
        continue;
      }

      for (const event of teamEvents) {
        const upcomingStart = clampDate(addMinutes(event.start, -upcomingLeadHours * 60), dayStart, dayEnd);
        const liveStart = clampDate(event.start, dayStart, dayEnd);
        const liveEnd = clampDate(event.end, dayStart, dayEnd);

        if (cursor < upcomingStart) {
          programmes.push(programme(channel, cursor, upcomingStart, noEventTitle, `${team.name} has no ${league.displayName} event scheduled during this period.`));
        }

        if (upcomingStart < liveStart) {
          programmes.push(programme(channel, upcomingStart, liveStart, `Upcoming Event: ${event.title}`, eventDescription(event, league)));
        }

        if (liveStart < liveEnd) {
          programmes.push(programme(channel, liveStart, liveEnd, `LIVE: ${event.title}`, eventDescription(event, league)));
        }

        cursor = maxDate(cursor, liveEnd);
      }

      if (cursor < dayEnd) {
        programmes.push(programme(channel, cursor, dayEnd, "Event Ended", `${team.name}'s latest ${league.displayName} event has ended.`));
      }
    }
  }

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<tv generator-info-name="${escapeXml(sourceInfoName)}" generator-info-url="${escapeXml(sourceInfoUrl)}">`,
    ...channels.map(channelXml),
    ...programmes.map(programmeXml),
    "</tv>",
    ""
  ].join("\n");
}

function withEventTimes(event) {
  const start = parseEventStart(event);
  const end = start ? addMinutes(start, event.defaultDurationMinutes) : null;
  return { ...event, start, end };
}

function parseEventStart(event) {
  if (event.timestamp) {
    const parsed = new Date(event.timestamp);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  if (event.date && event.time) {
    const time = event.time.endsWith("Z") ? event.time : `${event.time}Z`;
    const parsed = new Date(`${event.date}T${time}`);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  return null;
}

function programme(channel, start, stop, title, description) {
  return { channel, start, stop, title, description };
}

function channelXml(channel) {
  const icon = channel.icon ? `\n    <icon src="${escapeXml(channel.icon)}" />` : "";
  return `  <channel id="${escapeXml(channel.id)}">\n    <display-name>${escapeXml(channel.name)}</display-name>${icon}\n  </channel>`;
}

function programmeXml(item) {
  return `  <programme start="${xmltvTime(item.start)}" stop="${xmltvTime(item.stop)}" channel="${escapeXml(item.channel)}">\n    <title>${escapeXml(item.title)}</title>\n    <desc>${escapeXml(item.description)}</desc>\n  </programme>`;
}

function eventDescription(event, league) {
  const parts = [league.displayName, event.venue].filter(Boolean);
  return parts.length ? `${event.title} (${parts.join(", ")})` : event.title;
}

function clampDate(date, min, max) {
  return maxDate(min, minDate(date, max));
}

function minDate(a, b) {
  return a < b ? a : b;
}

function maxDate(a, b) {
  return a > b ? a : b;
}

function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function channelSlug(league) {
  return league.channelSlug || league.slug;
}
