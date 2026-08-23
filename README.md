# The Reader’s World Atlas

An interactive, zoomable world map showing books read by each author’s country, powered by a public Google Sheet.

The site uses a Robinson-style projection, adaptive forest-green shading, antique cartography styling, country flags, alphabetical book lists, desktop hover details and mobile tap panels.

## Data refresh

The atlas checks the public reading spreadsheet when the page opens and every five minutes. A bundled snapshot is shown immediately and remains available if the live spreadsheet cannot be reached.

## Publishing

This repository is designed for GitHub Pages. Publish the `main` branch from `/(root)` in **Settings → Pages**.
