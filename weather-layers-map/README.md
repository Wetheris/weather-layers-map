# Weather Layers Map

A modern, free, web-based weather visualization app built with MapLibre and Next.js.

This project focuses on interactive geospatial weather layers with a clean,
extensible architecture and no paid map services or surprise billing.

Built as a portfolio project to demonstrate modern frontend development,
map rendering, server-side proxying, and data-driven UI design.

## Features

### Animated radar timeline
- Scrub through recent precipitation history
- Relative time labels (for example, "5 minutes ago")

### Live cloud cover overlay
- Current global cloud data
- Adjustable opacity and toggleable layer

### Free map rendering
- Powered by MapLibre with no Mapbox dependency

### Layer registry architecture
- Clean, extensible system for adding future layers

### API keys protected
- All third-party data proxied server-side
- No keys exposed to the browser

## Tech Stack

- Next.js (App Router)
- TypeScript
- MapLibre GL JS
- Tailwind CSS
- RainViewer (radar tiles)
- OpenWeatherMap (cloud cover tiles, proxied)

## Architecture Highlights

Server-side API routes proxy external tile services to:
- avoid CORS issues
- protect API keys
- enable caching control

Weather layers are defined in a central registry, making it easy to:
- add new layers such as wind or temperature
- manage visibility and opacity consistently

UI controls are data-driven and decoupled from map implementation.

## Current Status

- Radar timeline implemented
- Cloud cover overlay implemented
- Wind and temperature layers planned

## Goals

- Demonstrate practical GIS and mapping skills
- Avoid paid mapping services and vendor lock-in
- Build a clean, extensible foundation for future weather layers
- Prioritize clarity, performance, and honest UX
