# Project Plan – Weather Layers Map

## Goal
Build a global, interactive weather map web app with multiple weather layers,
timeline controls, and per-layer opacity adjustments.

## Core Features (v1)
- Global interactive map
- Weather layers:
  - Radar / precipitation
  - Cloud cover
  - Temperature heatmap
  - Wind
- Layer controls:
  - Toggle on/off
  - Opacity slider
- Time controls:
  - Timeline scrubber
  - Play/pause animation
- Click map to view basic weather data for a location

## Non-Goals (v1)
- User accounts or authentication
- Long-term historical archives
- Custom radar processing
- Mobile-first optimization

## Tech Stack
- Frontend: Next.js, TypeScript
- Mapping: Mapbox GL JS
- Backend: Next.js API routes (minimal)
- Hosting: Vercel

## Risks
- API rate limits
- Performance with multiple active layers
- Scope creep
