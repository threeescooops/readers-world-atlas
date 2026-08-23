# The Reader’s World Atlas

A public, single-page reading map showing books by each author’s country.

## Features

- Zoomable Robinson-projection world map
- Adaptive forest-green shading based on book totals
- Desktop hover details and mobile tap panels
- Flag emoji, totals and alphabetical book/author lists
- Antique parchment styling and an illustrated book dragon
- Live Google Sheet data on page load and every five minutes

## Data source

The site reads the public Google Sheet with ID `1vA4ALaNS7Zzmreb69lO7c04d4bb8k2chWaQFKOx5eUU`. Each populated row is counted once using the value in its `Country` column.

## Hosting

The project is designed for GitHub Pages. Publish the `main` branch from the repository root.

## Map data

Country geometry is supplied by `world-atlas`, derived from Natural Earth data. Flag metadata is supplied by `world-countries`.
