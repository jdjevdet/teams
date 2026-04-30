# Teams EPG

Generates an XMLTV EPG file with one channel per team for MLB, MiLB, NFL, MLS, NHL, and NBA.

Example channel IDs:

- `DallasStars.nhl`
- `FloridaPanthers.nhl`
- `BostonCeltics.nba`
- `TorontoRaptors.nba`
- `ColoradoRockies.mlb`
- `BuffaloBisons.milb`

Each game day channel gets programme blocks like:

- `Upcoming Event: Toronto Blue Jays vs. Minnesota Twins`
- `LIVE: Toronto Blue Jays vs. Minnesota Twins`
- `Event Ended`

## Local Setup

```powershell
$env:THESPORTSDB_API_KEY="779830"
npm start
```

Then open:

- `http://localhost:3000/epg.xml`
- `http://localhost:3000/refresh`
- `http://localhost:3000/health`

To generate the XML once:

```powershell
$env:THESPORTSDB_API_KEY="779830"
npm run generate
```

The generated file is written to `data/epg.xml`.

## Render

This repo includes `render.yaml` for a Render web service. Set `THESPORTSDB_API_KEY` in Render using your premium key.

The app:

- refreshes the XML when it starts,
- refreshes every day at `7:00 AM` in `America/Toronto`,
- serves the XML at `/epg.xml`,
- exposes a protected manual refresh endpoint at `/refresh?token=YOUR_REFRESH_TOKEN`.

Use your deployed Render URL plus `/epg.xml` as the EPG URL in IPTVEditor.
