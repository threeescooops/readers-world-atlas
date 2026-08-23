# The Reader’s World Atlas

An interactive, zoomable world map showing books read by each author’s country, powered by a public Google Sheet.

The site uses a Robinson-style projection, adaptive forest-green shading, antique cartography styling, country flags, alphabetical book lists, desktop hover details and mobile tap panels. Countries without recorded books remain parchment-coloured but can still be explored.

## Data refresh

The atlas reads the public spreadsheet whenever the site opens and checks it again every five minutes while the page is active. The first five spreadsheet columns are expected to remain:

`Title | Author | Genre | Gender | Country`

## Publishing

This repository is ready for GitHub Pages. In **Settings → Pages**, select **Deploy from a branch**, then choose `main` and `/(root)`.

The resulting project-site address will be:

`https://threeescooops.github.io/readers-world-atlas/`
