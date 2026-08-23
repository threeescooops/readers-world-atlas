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

## GitHub Pages

A Pages deployment workflow is included at `.github/workflows/pages.yml`. In **Settings → Pages**, set **Source** to **GitHub Actions**, then run the **Publish Reader’s World Atlas** workflow if it does not start automatically.

The public project address is:

`https://threeescooops.github.io/readers-world-atlas/`
