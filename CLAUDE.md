# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Olmos Bebidas is a beverage store catalog built with Next.js. Users browse products, select quantities, and submit orders via WhatsApp. Product data is fetched server-side from a Google Sheet using a service account.

## Commands

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run lint` — run ESLint (flat config, `eslint.config.mjs`)
- No test framework is configured

## Required Environment Variables

Set in `.env.local` (never commit):

- `GOOGLE_SERVICE_ACCOUNT_EMAIL` — Google service account email
- `GOOGLE_PRIVATE_KEY` — PEM private key (newlines escaped as `\n`)
- `GOOGLE_SHEET_ID` — spreadsheet ID
- `GOOGLE_SHEET_RANGE` — sheet range (defaults to `"Hoja1"`)
- `NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER` — store's WhatsApp number (used client-side)

## Architecture

**Data flow:** Server Component (`page.tsx`) calls `getProducts()` which authenticates via Google JWT and reads the spreadsheet. The page passes the `Product[]` array to `ProductGrid` (client component) which manages cart state and renders the UI.

**Google Sheets column mapping** (in `src/lib/sheets.ts`): nombre | precio | disponibilidad ("si"/"no") | imagen (URL) | descripcion | cantidadMaxima. Only rows with `disponibilidad === "si"`, a non-empty name, and price > 0 are returned.

**Cart & ordering:** `ProductGrid` holds a `Map<string, number>` (product name -> quantity) in React state. `CartSummary` appears as a fixed bottom bar when items are in the cart. Clicking "send order" opens a `wa.me` link with the order formatted as a WhatsApp message (`src/lib/whatsapp.ts`).

**Revalidation:** The home page uses ISR with `revalidate = 300` (5 minutes).

**Images:** `next.config.ts` allows remote images from any hostname (`hostname: "**"`).

## Tech Stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS v4 (via `@tailwindcss/postcss`)
- `googleapis` for Google Sheets API
- Path alias: `@/*` maps to `./src/*`
- Language/locale: Spanish (Argentina) — UI text is in Spanish, prices formatted with `es-AR`
