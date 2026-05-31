# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Olmos Bebidas is a beverage store catalog built with Next.js. Users browse products, select quantities, and submit orders via WhatsApp. Product data is fetched server-side from a Google Sheet using a service account.

## Commands

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run lint` — run ESLint (flat config, `eslint.config.mjs`)
- `npm run test:e2e` — run Playwright smoke tests against the local Next.js app
- `npm run test:e2e:ui` — open the Playwright UI runner for interactive browser debugging

## Required Environment Variables

Set in `.env.local` (never commit):

- `GOOGLE_SERVICE_ACCOUNT_EMAIL` — Google service account email
- `GOOGLE_PRIVATE_KEY` — PEM private key (newlines escaped as `\n`)
- `GOOGLE_SHEET_ID` — spreadsheet ID
- `GOOGLE_SHEET_RANGE` — sheet range (defaults to `"Productos"`)
- `NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER` — store's WhatsApp number (used client-side)

## Architecture

**Data flow:** Server Component (`page.tsx`) calls `getProducts()` which authenticates via Google JWT and reads the spreadsheet. The page passes the `Product[]` array to `ProductGrid` (client component) which manages cart state and renders the UI.

**Google Sheets column mapping** (in `src/lib/sheets.ts` via `src/lib/product-row.ts`): SKU (internal stable id, not shown) | Producto | Precio | Visibilidad ("si"/"no" — "no" hides the product completely) | imagen (URL) | categoria | Stock (0 = shown as out of stock) | Tipo Descuento ("porcentaje"/"monto") | Descuento | Destacado. Data starts at row 3 (row 1 = headers, row 2 = subheaders). Only rows with a non-empty name, price > 0, and visibilidad = "si" are returned.

**Cart & ordering:** The cart holds a `Map<string, number>` (product id/SKU -> quantity) in React state and localStorage (`olmos-cart-v2`). Product names remain the visible label in the UI and WhatsApp message. The fixed bottom cart bar appears when items are in the cart. Clicking "send order" opens a `wa.me` link with the order formatted as a WhatsApp message (`src/lib/whatsapp.ts`).

**Revalidation:** The home page uses ISR with `revalidate = 300` (5 minutes).

**Images:** `next.config.ts` allows remote images from any hostname (`hostname: "**"`).

## Tech Stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS v4 (via `@tailwindcss/postcss`)
- `googleapis` for Google Sheets API
- Path alias: `@/*` maps to `./src/*`
- Language/locale: Spanish (Argentina) — UI text is in Spanish, prices formatted with `es-AR`
