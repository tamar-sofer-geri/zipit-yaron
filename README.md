# 🧳 Zip It!

A packing checklist that scales quantities by trip length and trip type. No build step — plain HTML/CSS/JavaScript hosted on GitHub Pages, with data kept in the browser's local storage (no account, no sign-in, no server).

## Live app

**<https://tamar-sofer-geri.github.io/zipit-yaron/>**

This is a standalone copy of [Zip It!](https://tamar-sofer-geri.github.io/zipit/) seeded with a blank base list (no preset quantities, no preset destinations) and its own local-storage key, so it never shares data with the original.

On your phone, open the link and use your browser's **Add to Home Screen** to install it like an app.

## How it works

- **Trips** — set an optional **start date** and trip length, pick a **destination** (single-select — Israel, Hawaii, New Orleans, or "New…" to add one), and check off whichever **trip types** apply (City, Hot, Fancy, and so on — any combination). An item shows up if at least one of its tags matches the destination *or* any checked trip type, at the quantity or per-day/per-week rate you set for it in Base List. Untagged items stay hidden — add them ad hoc with the "+ Add" button in the "not needed for this trip" row. Check items off as you pack, or nudge any quantity up/down by hand. Drag the ⠿ handle on the right of any item to reorder it within its category — this reorders the shared Base List too, so the new order sticks for every future trip. "+ New trip" starts a fresh working trip. A trip-only "Extra items" card at the bottom lets you add one-off things (a dress for a wedding, say) that live only in this trip, without cluttering the shared Base List — tap an extra item's name to edit or delete it, drag its ⠿ handle to reorder it, or tap "−" at a quantity of 1 to remove it outright. Long-press a category name to collapse or expand it. Check off the very last item and confetti drops with a "You did it! Have a great trip!" send-off.
- **Base List** — every item, grouped by category. Tap one to edit its Category, Destination tags, Trip type tags, Mode (**fixed** quantity, **per day** rate, or **per week** rate — e.g. 1/week rounds up to 2 for a 10-day trip), Qty/rate, and Notes. Each tag group has its own "Select all" — useful for things you always need (passport, toothbrush) regardless of destination or trip type. "Delete item" asks you to confirm first. Long-press a category name to collapse or expand it.
- **Saved Trips** — save the current start date + trip length + destination + checked trip types + checked-off items + quantity tweaks + extra items as a named trip, so you can plan two trips at once without one overwriting the other. Trips with a start date are listed soonest-first; trips without one sort to the bottom, most-recently-edited first. Tap anywhere on a saved trip's card to load it and jump to Trips; the ✎ and ✕ in the corner rename or delete it without loading. Once a trip is named ("Save trip…" the first time, or loaded from Saved Trips), every change to it autosaves — a "✓ Autosaved" note next to its name confirms this, and there's no separate save step to remember. "Save as new…" forks the current state into a second, independently-autosaving trip.

Everything you edit saves automatically to that device's local storage. "Reset for new trip" on the Trips tab clears checked-off items and manual quantity tweaks without touching your base list or saved trips; "Reset base list to defaults" on the Base List tab restores the original seeded items (your saved trips and their tags are untouched).

### Weather & packing tips

Once a trip has both a start date and a destination, a "🌦️ Weather & packing tips" popup opens automatically (and stays reachable afterward via a button right under Trip type) — a real forecast if the trip starts within about two weeks, or typical conditions for those dates based on the last few years if it's further out. Alongside the temperature range, rain chance, and wind, it surfaces a couple of plain-language tips (an umbrella for a rainy outlook, a warm jacket for cold lows, and so on), each with a one-tap "+ Add" to drop it straight into that trip's Extra items. Weather lookups use [Open-Meteo](https://open-meteo.com) — free, no account or API key, matching the rest of the app. Israel, Hawaii, and New Orleans use fixed coordinates for a representative city (Open-Meteo's place search doesn't index "Hawaii" as the US state, so a live lookup was landing on an unrelated village in Guatemala); a destination you add yourself geocodes live, biased toward the best-known place with that name.

### Shared sync

Disabled in this copy — `config.js` has no Supabase credentials, so the **🔗 Connect shared list** button never appears. This is intentional: the original app's cloud sync is a single shared row reused across other "sister apps," and this copy is meant to stay fully independent.

### Demo mode

`?demo=1` still works but has no special seeded content here — it just loads the same blank default on its own local-storage key.

## Deploying changes

Any push to `main` is served directly by GitHub Pages — just edit `index.html` / `app.js` / `styles.css` and push. Bump the `?v=` query strings in `index.html` (and in `manifest.webmanifest`'s icon entries, if icons change) so phones and browsers pick up the new files instead of a cached copy.
