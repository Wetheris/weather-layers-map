# Project Plan – Weather Layers Map

## Goal
Build a global, interactive weather map web app with layered weather visualization,
animated radar playback, and clean, extensible controls, using only free and
open-source mapping tools.

The project prioritizes clarity, performance, and honest UX over attempting to
perfectly synchronize all weather data sources.

## Core Features (v1)
- Global interactive map
- Weather layers:
  - Radar / precipitation (animated timeline)
  - Cloud cover (current conditions)
- Layer controls:
  - Toggle layers on and off
  - Per-layer opacity adjustment
- Time controls:
  - Radar timeline scrubber
  - Relative time indicators (for example, "5 minutes ago")
- Clean layer registry architecture for future expansion

## Planned Features (v2)
- Wind visualization (current modeled wind)
- Temperature heatmap
- Optional radar animation playback (play/pause)
- Basic location inspection (click map for contextual weather info)

## Non-Goals (v1)
- User accounts or authentication
- Perfect time synchronization across all weather layers
- Long-term historical weather archives
- Custom radar or satellite data processing
- Full mobile-first optimization

## Tech Stack
- Frontend: Next.js (App Router), TypeScript
- Mapping: MapLibre GL JS
- Styling: Tailwind CSS
- Data sources:
  - RainViewer (radar tiles)
  - OpenWeatherMap (cloud cover tiles)
- Backend: Next.js API routes (proxying and caching only)
- Hosting: Vercel

## Architecture Principles
- No paid mapping services or vendor lock-in
- All third-party APIs proxied server-side
- No API keys exposed to the client
- Data-driven UI and layer configuration
- Minimal backend logic focused on reliability and caching

## Risks and Considerations
- API rate limits from third-party data providers
- Visual clutter with multiple active layers
- Performance impact at higher zoom levels
- Managing scope creep as additional layers are added
