# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bangumi-data is a community-driven dataset of anime/bangumi metadata including broadcast schedules, site links, and multilingual titles. Raw data lives in `data/`, and `dist/data.json` is auto-generated. The npm package is `bangumi-data` (license: CC-BY-4.0).

## Commands

```bash
npm test              # Lint + validate (runs both below)
npm run lint          # ESLint on script/ directory
npm run validate      # Validate all data against Joi schemas
npm run build         # Generate dist/data.json from data/
npm run prettier      # Format script files
```

Node.js version: v22 (see `.nvmrc`).

## Data Architecture

### Directory Layout

- `data/items/YYYY/MM.json` — anime items organized by year/month (GMT+8). The `0000/` directory is ignored during build.
- `data/sites/info.json` — information sites (bangumi, tmdb, anidb, etc.)
- `data/sites/onair.json` — streaming/broadcast sites (bilibili, netflix, etc.)
- `data/sites/resource.json` — download/resource sites (dmhy, mikan, etc.)
- `dist/data.json` — built output: `{ siteMeta, items }` (~7MB, committed to repo)

### Item Schema

Each item requires: `title` (Japanese), `titleTranslate` (keyed by lang code: `ja`, `en`, `zh-Hans`, `zh-Hant`), `type` (`tv`|`web`|`movie`|`ova`), `lang`, `officialSite`, `begin`, `end`, and `sites[]`. Optional: `broadcast` (RFC format: `R/2020-01-01T13:00:00.000Z/P7D`), `comment`.

### Site References in Items

Three categories matching the files in `data/sites/`:
- **info** sites: require `site` + `id`
- **onair** sites: require `site` + `id` (or `url`), `begin`; optional `broadcast`, `end`, `comment`, `regions[]`
- **resource** sites: require `site` + `id`

### Validation Rules

- ISO 8601 timestamps must match JavaScript `.toISOString()` output exactly
- Broadcast format: `R/YYYY-MM-DDTHH:mm:ss.000Z/P[digits][D|M]`
- Item `end` must not be before `begin`
- Bangumi IDs must be unique per language (whitelist for exceptions in `validate.js`)
- Month filenames must be `01.json`–`12.json`
- No duplicate sites within a single item

## Build & Release

- Semantic-release on master: `feat` and `update` commits trigger patch releases
- CI runs `npm test` on push/PR; publish workflow builds and releases to npm
- Release commits `dist/**/*.json` automatically

## Editing Data

Only edit files in `data/`. The `dist/` directory is auto-generated. Run `npm run validate` before submitting changes to catch schema violations.
