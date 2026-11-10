# IT Field Notes — editorial and publishing workflow

## Publishing policy

- Cadence: one planned article per month.
- Style: balanced technical explanation and practical enterprise IT context.
- Publication gate: explicit human editorial and technical approval.
- Automation: GitHub Actions opens a monthly editorial checklist issue. It does not write, approve or publish articles.

## Article lifecycle

1. **Proposed** — topic selected in the monthly issue.
2. **Draft** — write Markdown under `field-notes/drafts/`.
3. **Review** — validate technical details, links, accessibility, grammar and security/privacy.
4. **Approved** — owner explicitly approves the final version.
5. **Published** — create the public article page, add it to `data/field-notes.json` with `"status": "published"` and a valid relative `"url"`, then merge the reviewed change.

Do not mark an article as published merely because a draft exists.

## Catalogue schema

Each entry in `data/field-notes.json` supports:

- `id`: stable unique slug.
- `title`: display title.
- `category`: `field_notes`, `how_to` or `opinion`.
- `categoryLabel`: concise display label.
- `description`: short summary.
- `icon`: decorative text glyph.
- `status`: `review`, `upcoming` or `published`.
- `readingTime`: optional display text.
- `tags`: search terms.
- `url`: required when status is `published`.

## Review checklist

- [ ] Technical claims and commands are correct for the stated product/version.
- [ ] Current official vendor documentation is linked where appropriate.
- [ ] Examples are reproducible and clearly identify prerequisites and limitations.
- [ ] No employer/customer/site names, internal topology, IPs, hostnames, ticket IDs, asset IDs, credentials or other identifying information.
- [ ] No payment-card data or security-sensitive information.
- [ ] Screenshots and diagrams are original, licensed or appropriately attributed and sanitised.
- [ ] Article is readable on mobile and accessible by keyboard.
- [ ] Metadata, title, description and internal links are correct.
- [ ] Owner has explicitly approved publication.

## Monthly automation

The workflow at `.github/workflows/monthly-field-notes.yml` opens an editorial checklist on the first day of each month (22:00 UTC) and can also be run manually from GitHub Actions. GitHub schedule times are UTC, not Sydney local time.
