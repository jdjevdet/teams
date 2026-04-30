export const config = {
  apiKey: process.env.THESPORTSDB_API_KEY,
  timezone: process.env.EPG_TIMEZONE || "America/Toronto",
  port: Number(process.env.PORT || 3000),
  refreshHour: Number(process.env.REFRESH_HOUR || 7),
  refreshMinute: Number(process.env.REFRESH_MINUTE || 0),
  upcomingLeadHours: Number(process.env.UPCOMING_LEAD_HOURS || 6),
  refreshToken: process.env.REFRESH_TOKEN || "",
  outputPath: process.env.EPG_OUTPUT_PATH || "data/epg.xml",
  noEventTitle: process.env.NO_EVENT_TITLE || "No Event Scheduled",
  sourceInfoName: "Teams EPG",
  sourceInfoUrl: "https://www.thesportsdb.com/"
};

export const leagues = [
  {
    slug: "mlb",
    id: "4424",
    scheduleName: "MLB",
    displayName: "MLB",
    defaultDurationMinutes: 180
  },
  {
    slug: "milb-pcl",
    channelSlug: "milb",
    id: "5065",
    scheduleName: "Pacific Coast League",
    displayName: "MiLB Pacific Coast League",
    defaultDurationMinutes: 180
  },
  {
    slug: "milb-il",
    channelSlug: "milb",
    id: "5085",
    scheduleName: "International League",
    displayName: "MiLB International League",
    defaultDurationMinutes: 180
  },
  {
    slug: "milb-nwl",
    channelSlug: "milb",
    id: "5752",
    scheduleName: "Northwest League",
    displayName: "MiLB Northwest League",
    defaultDurationMinutes: 180
  },
  {
    slug: "nfl",
    id: "4391",
    scheduleName: "NFL",
    displayName: "NFL",
    defaultDurationMinutes: 210
  },
  {
    slug: "mls",
    id: "4346",
    scheduleName: "American Major League Soccer",
    displayName: "MLS",
    defaultDurationMinutes: 120
  },
  {
    slug: "nhl",
    id: "4380",
    scheduleName: "NHL",
    displayName: "NHL",
    defaultDurationMinutes: 150
  },
  {
    slug: "nba",
    id: "4387",
    scheduleName: "NBA",
    displayName: "NBA",
    defaultDurationMinutes: 150
  }
];
