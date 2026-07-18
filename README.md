# UrbanCare — Shopify Theme

Shopify theme based on **Beautify** v1.1.0 by [Clean Canvas](http://cleancanvas.co.uk/support/beautify/), with custom sections and templates added for this store.

- **Store:** `inobeauty.com.tr` (INO Beauty Turkey) — update if this theme is deployed elsewhere
- **Base theme:** Beautify 1.1.0
- **Customer accounts:** Uses Shopify's *new customer accounts*. There is intentionally no `templates/customers/` directory — those pages are hosted by Shopify.

## Requirements

- [Node.js](https://nodejs.org/) 20+
- [Shopify CLI](https://shopify.dev/docs/api/shopify-cli) 4.x — `npm install -g @shopify/cli`

## Getting started

```bash
# Authenticate and start a local dev server with hot reload
shopify theme dev --store inobeauty.com.tr
```

The dev server prints a preview URL. Edits to `.liquid`, `.css`, and `.js` files reload automatically.

## Everyday commands

| Task | Command |
| --- | --- |
| Local dev server | `shopify theme dev --store <store>` |
| Lint the theme | `shopify theme check` |
| List themes on the store | `shopify theme list --store <store>` |
| Pull live theme changes | `shopify theme pull --store <store> --theme <id>` |
| Push to an unpublished theme | `shopify theme push --store <store> --theme <id>` |
| Push to a brand-new theme | `shopify theme push --store <store> --unpublished` |

> **Never** run a bare `shopify theme push` against the live theme without `--theme`. Push to an unpublished theme and preview it first.

## Theme structure

```
assets/      Compiled CSS, JS, and images served from Shopify's CDN
config/      settings_schema.json (theme editor definition) + settings_data.json (saved values)
layout/      theme.liquid (main wrapper) and password.liquid
locales/     Storefront translations — en.default.json is the source of truth
sections/    Modular, editor-configurable page sections
snippets/    Reusable Liquid partials rendered via {% render %}
templates/   JSON page templates mapping routes to sections
```

### Custom work in this theme

Sections and templates added on top of stock Beautify:

- `sections/uc-fbt.liquid` — frequently-bought-together
- `sections/quiz.liquid` + `templates/page.quiz.json` — product quiz
- `sections/brands.liquid` + `templates/page.brands.json` — brand listing
- `sections/faq.liquid` + `templates/page.faq.json` — FAQ
- `templates/page.sac-testi.json` — hair test landing page
- `templates/collection.alternate.json`, `templates/product.preorder.json`, `templates/product.gift-wrap.json`

## Files Shopify overwrites

`config/settings_data.json`, `templates/*.json`, and `locales/*.json` are rewritten by the theme editor and carry an auto-generated header. They **are** tracked in git (they hold real store configuration), but expect conflicts if the same settings are edited in the admin and in code at once. Run `shopify theme pull` before editing them locally.

## Linting

`shopify theme check` runs against `.theme-check.yml`. The current baseline is **0 errors, 66 warnings**; CI fails on errors only.

All checks are enabled. Where stock Beautify trips a check, the specific files are listed under that check's `ignore:` rather than disabling it globally — so new and modified files are still fully checked.

### Known baseline

| Check | Files | Why it's ignored |
| --- | --- | --- |
| `LiquidHTMLSyntaxError` | 16 vendor files | Beautify renders dynamic tag names, e.g. `<{% if ... %}h1{% else %}h2{% endif %}>`. Shopify renders this fine; Theme Check's HTML parser can't represent Liquid in the tag-name position. |
| `ValidSchema` | 3 sections | Uses the deprecated `templates` schema attribute. |
| `ParserBlockingScript` | `layout/theme.liquid` | Vendor script loaded without `defer`/`async`. |

**Open migration TODO:** `sections/featured-product.liquid`, `sections/recently-viewed.liquid`, and `sections/uc-fbt.liquid` still use the `templates` schema attribute, which Shopify [deprecated in January 2023](https://shopify.dev/changelog/introducing-new-enabled_on-disabled_on-section-schema-attributes-deprecating-templates) in favour of `enabled_on` / `disabled_on`. It still works, but `uc-fbt.liquid` is our own code and should be migrated.

## Updating the base theme

Beautify is a commercial theme. When Clean Canvas ships an update, diff the new release against this repo rather than overwriting it — custom sections listed above and all of `config/`, `templates/`, and `locales/` carry store-specific changes.

## CI

`.github/workflows/theme-check.yml` runs Theme Check on every push and pull request to `main`, failing on errors only.
