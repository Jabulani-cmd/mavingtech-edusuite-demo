## Goal
Adopt the visual layout and styling of the Astra "school-02" template (https://websitedemos.net/school-02/) across the whole site, including portals, using the template's placeholder content as the starting point. Existing page names and routes are kept.

## Template visual signature (what we're matching)
- Clean white background, generous whitespace.
- Headings in a serif display face (template uses "Caladea" / similar serif). Body in a humanist sans (template uses "Jost").
- Accent color: indigo/violet (~`#5e35f2`). Text: near-black for headings, slate gray for body.
- Header: white, slim, logo left + horizontal nav center + social icons right, sticky.
- Hero: full-bleed photo with dark gradient, large serif headline, short rule mark, single accent button.
- Section pattern: two-column "image + text" alternating, stat counters strip, curriculum grid (3-col cards with photo + title + blurb), testimonial / headmaster quote, activities grid, news cards, CTA banner, footer with 3–4 columns + accent line.
- Buttons: solid indigo with white text, rounded-md, slight shadow.
- Cards: white, subtle 1px border or low-z shadow, square-ish photos top, title, short text.
- Footer: dark indigo on white-on-dark, columns for About / Quick Links / Contact / Social.

## Phased approach (each phase = one or two messages)

### Phase 1 — Design system + chrome (this PR)
1. Update `src/index.css` design tokens:
   - `--primary` → indigo `262 86% 58%` (template accent).
   - `--secondary` → soft indigo tint.
   - `--background` white, `--foreground` near-black, body text muted slate.
   - Add gradient + shadow tokens used by hero/cards.
2. Update `tailwind.config.ts` font families: `heading` → "Caladea", `body` → "Jost"; load via `index.html` Google Fonts link.
3. Rebuild `src/components/layout/Navbar.tsx`:
   - White background, dark text, indigo active state.
   - Logo left (smaller — undo recent oversize for new compact header), nav center, social icons + Portal Login button right.
4. Rebuild `src/components/layout/Footer.tsx`:
   - Indigo-dark background, four-column layout matching template (About blurb, Quick Links, Programs, Contact + socials).
   - Keep affiliations strip but restyle to match.
5. Rebuild `src/pages/Index.tsx` (homepage) section-by-section to mirror template:
   - Hero, "Learning Begins With Us", Stats counters, Curriculum 3-col, Director's quote (keep Mr F.J. Moyo content from earlier), Activities grid, News cards, CTA, footer.
   - Use template placeholder copy as starting text.

### Phase 2 — Public subpages
About, Academics, Admissions, Boarding, Sports & Culture, Staff, Alumni, Contact, News, Awards, Facilities, School Projects, Vacancies, Fees, Downloads, School Life — each restyled with the template's section primitives (image+text rows, card grids, CTA banners).

### Phase 3 — Auth pages
Login, Register, Forgot/Reset/Force-Change Password — adopt template's white-card-on-soft-background layout with indigo accent and the new logo size.

### Phase 4 — Portal dashboards
Apply template typography, button, and card styles to Admin / Teacher / Student / Parent / Finance / HOD / Registration / Principal / DeputyPrincipal / AdminSupervisor / ParentTeacher dashboards. Layout structure of dashboards remains functional (sidebar + content) but colors, fonts, cards, tabs, and tables get the template treatment.

## Out of scope
- No backend/data changes.
- No new features, routes, or auth flows.
- Logo asset stays as-is (current MBS logo); only its sizing is normalized to the template's compact header.

## Technical notes (for engineers)
- All colors via HSL semantic tokens in `index.css`; never hard-code in components.
- Build a small set of reusable primitives in `src/components/template/`: `SectionHeading`, `StatCounter`, `FeatureCard`, `ImageTextRow`, `CTASection` — reuse across pages so Phase 2 is mostly composition.
- Animations via existing framer-motion; keep minimal (fade/slide on section enter).
- Verify each phase visually with browser screenshots before moving to the next.

## What I'll do right now if you approve
Phase 1 only: design tokens + fonts + Navbar + Footer + homepage. I'll stop after that, share screenshots, and we decide on Phase 2.
