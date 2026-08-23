# The Reader’s World Atlas

A public, single-page interactive map showing books read by each author’s country.

## Features

- Zoomable and pannable Robinson-projection world map
- Adaptive forest-green shading based on book totals
- Hover details on desktop and a dismissible bottom sheet on mobile
- Country flag, total, and alphabetical title/author list
- Countries with no books remain parchment-coloured and show `0 books`
- Live Google Sheet refresh on page load and every five minutes
- Bundled snapshot fallback containing the current reading list
- Antique cartography styling and a book-dragon logo, favicon and sea sprite

## Data source

The site reads spreadsheet `1vA4ALaNS7Zzmreb69lO7c04d4bb8k2chWaQFKOx5eUU`, tab `gid=0`. Keep the first five columns as:

`Title | Author | Genre | Gender | Country`

## Publish with GitHub Pages

This is a static site and is ready to publish directly from the repository:

1. Open **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
3. Choose **main** and **/(root)**, then click **Save**.

The public project address will be:

`https://threeescooops.github.io/readers-world-atlas/`
