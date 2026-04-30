import assert from "node:assert/strict";
import { channelId } from "../src/labels.js";
import { buildXmltv } from "../src/xmltv.js";

assert.equal(channelId("Dallas Stars", "nhl"), "DallasStars.nhl");
assert.equal(channelId("CF Montréal", "mls"), "CFMontreal.mls");
assert.equal(channelId("Philadelphia 76ers", "nba"), "Philadelphia76ers.nba");

const league = {
  slug: "mlb",
  displayName: "MLB",
  defaultDurationMinutes: 180
};

const xml = buildXmltv({
  leagues: [league],
  teamsByLeague: new Map([
    ["mlb", [{ name: "Toronto Blue Jays", badge: "" }, { name: "Minnesota Twins", badge: "" }]]
  ]),
  eventsByLeague: new Map([
    [
      "mlb",
      [
        {
          title: "Toronto Blue Jays vs. Minnesota Twins",
          homeTeam: "Toronto Blue Jays",
          awayTeam: "Minnesota Twins",
          timestamp: "2026-04-30T23:00:00Z",
          defaultDurationMinutes: 180
        }
      ]
    ]
  ]),
  dateKey: "2026-04-30",
  timezone: "America/Toronto",
  upcomingLeadHours: 6,
  noEventTitle: "No Event Scheduled",
  sourceInfoName: "Teams EPG",
  sourceInfoUrl: "https://www.thesportsdb.com/"
});

assert.match(xml, /<channel id="TorontoBlueJays\.mlb">/);
assert.match(xml, /Upcoming Event: Toronto Blue Jays vs\. Minnesota Twins/);
assert.match(xml, /LIVE: Toronto Blue Jays vs\. Minnesota Twins/);
assert.match(xml, /Event Ended/);

console.log("All tests passed.");
