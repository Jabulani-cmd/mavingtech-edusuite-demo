---
name: MavingTech EduSuite
description: A dry-stone school wall in the Great Zimbabwe tradition. Coursed granite, a chevron band at the crown, and gateways you walk through.
colors:
  sunlit-granite: "#e7e6e4"
  stone-lit: "#f6f5f4"
  stone-card: "#f3f3f1"
  stone-muted: "#dbdad6"
  stone-hover: "#d4d2ce"
  joint-line: "#bbb9b4"
  joint-input: "#adaaa4"
  shadow-ink: "#171a21"
  stone-text-soft: "#464a53"
  shadow-stone: "#15181e"
  shadow-stone-soft: "#23272f"
  logo-blue: "#0047a3"
  logo-navy: "#0d1f4a"
  lichen-ochre: "#ca9121"
  lichen-ochre-soft: "#ebd6ad"
  kiln-red: "#af2b1d"
typography:
  display:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "4.5rem"
    fontWeight: 800
    lineHeight: 1.04
    letterSpacing: "-0.015em"
  headline:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "3rem"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    letterSpacing: "0.025em"
rounded:
  none: "0px"
  lg: "2px"
spacing:
  joint: "5px"
  sm: "8px"
  md: "16px"
  lg: "32px"
  section: "80px"
  section-lg: "112px"
components:
  button-primary:
    backgroundColor: "{colors.logo-blue}"
    textColor: "#ffffff"
    rounded: "{rounded.none}"
    padding: "8px 16px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.logo-navy}"
  button-primary-lg:
    backgroundColor: "{colors.logo-blue}"
    textColor: "#ffffff"
    rounded: "{rounded.none}"
    padding: "8px 32px"
    height: "48px"
  button-secondary:
    backgroundColor: "{colors.logo-navy}"
    textColor: "{colors.stone-lit}"
    rounded: "{rounded.none}"
    padding: "8px 16px"
    height: "40px"
  button-secondary-hover:
    backgroundColor: "{colors.logo-blue}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.shadow-ink}"
    rounded: "{rounded.none}"
    padding: "8px 16px"
    height: "40px"
  button-outline-hover:
    backgroundColor: "{colors.shadow-ink}"
    textColor: "{colors.sunlit-granite}"
  gateway-primary:
    backgroundColor: "{colors.logo-blue}"
    textColor: "#ffffff"
    typography: "{typography.title}"
    rounded: "{rounded.none}"
    padding: "20px 24px"
    height: "112px"
  gateway-stone:
    backgroundColor: "{colors.stone-lit}"
    textColor: "{colors.shadow-ink}"
    typography: "{typography.title}"
    rounded: "{rounded.none}"
    padding: "20px 24px"
    height: "112px"
  gateway-stone-hover:
    backgroundColor: "{colors.lichen-ochre-soft}"
  lintel:
    backgroundColor: "{colors.logo-navy}"
    textColor: "{colors.stone-lit}"
    typography: "{typography.display}"
    rounded: "{rounded.none}"
    padding: "40px 48px"
  slab:
    backgroundColor: "{colors.stone-lit}"
    textColor: "{colors.shadow-ink}"
    rounded: "{rounded.none}"
    padding: "16px 20px"
---

# Design System: MavingTech EduSuite

## Overview

**Creative North Star: "The Dry-Stone Wall"**

The school is built the way Great Zimbabwe is built: coursed granite laid without mortar, a band of slanted blocks crowning the wall, and openings you walk through. Everything in the system is either stone, a joint between stones, or a gateway cut into the wall. Sunlit granite (a warm low-chroma grey) is the ground, shadow granite (a blue-black charcoal) is the ink and the dark courses, and the only saturated colours are the logo blue and navy, which carry action, and one lichen ochre, which is the only marker.

Structure comes from masonry, not from boxes. Sections are separated by chevron bands and by courses of blocks set 5px apart; the gap between blocks is the joint and is drawn in shadow stone. Corners are square. Depth is honest: slabs sit on the wall with a hairline top light and a real offset drop shadow, and nothing glows, blurs or fades into a gradient. The home page puts the real classroom photograph through irregular seeded courses of stone, names the school on a navy lintel, and offers four gateways (Apply, Visit Us, Pay fees, Portal) along the foot, one for each audience.

The system is built and verified on the public home page and the login screen. The rest of the app inherits its tokens only (see Components, "Not yet carried").

**Key Characteristics:**
- Two granite states: sunlit ground for reading, shadow stone for the hero wall, principal section and footer.
- Square corners everywhere; 5px dry joints between blocks; hairline borders in joint-line grey.
- One signature ornament: the chevron band, a mask-painted course of slanted blocks that can take any fill.
- Logo blue and navy for every action; ochre for markers only (active nav underline, gateway top edge, text-link underline, selection, footer headings).
- Archivo 800 for headings at large sizes, Public Sans for text.
- One motion: the hero wall laid course by course.

## Colors

Warm-grey stone ground, charcoal ink, two logo blues for action, one ochre marker. Values below are the token hex; the build defines them as HSL custom properties in `src/index.css`.

### Primary
- **Logo Blue** (#0047a3, `--primary`): default button fill, text links, the Apply gateway, focus ring and caret. Taken from the supplied MavingTech logo. In dark mode it lifts to #529dff.
- **Logo Navy** (#0d1f4a, `--secondary`, `--navy`): the lintel behind the school name, the Portal gateway, the closing doorway section, button hover. Also from the logo.

### Secondary
- **Lichen Ochre** (#ca9121, `--ochre`): the only marker colour. Active nav underline (3px), the 6px top edge on gateways and the login slab, text-link underline, chevron band fill, `::selection`, and footer headings and icons on shadow stone.
- **Pale Ochre** (#ebd6ad, `--ochre-soft`): hover fill for light gateways and the light button on navy.

### Neutral
- **Sunlit Granite** (#e7e6e4, `--background`): page ground.
- **Stone Lit** (#f6f5f4, `--stone-lit`): slabs, nav bar, gateway faces, light blocks on dark.
- **Stone Card** (#f3f3f1, `--card`) and **Stone Muted** (#dbdad6, `--muted`): quiet panels such as the demo-note box on login.
- **Stone Hover** (#d4d2ce, `--accent`): hover and selected rows. Hover is stone, never a loud colour.
- **Joint Line** (#bbb9b4, `--border`) and **Joint Input** (#adaaa4, `--input`): hairline borders and field strokes.
- **Shadow Ink** (#171a21, `--foreground`): body and heading text. **Stone Text Soft** (#464a53, `--muted-foreground`): secondary text.
- **Shadow Stone** (#15181e, `--shadow-stone`) and **Shadow Stone Soft** (#23272f): hero wall, principal section, footer, joints between blocks, dark chevron band.
- **Kiln Red** (#af2b1d, `--destructive`): errors and destructive actions only.

### Named Rules
**The One Marker Rule.** Ochre is the only marker colour. It marks a place (where you are, where a gateway opens, which link is a link); it never fills a surface, never carries body text on light ground, and never appears with a second accent.

**The Logo Carries Action Rule.** Every control that does something is logo blue or navy. Stone, ochre and charcoal never stand in for a primary action.

**The Contrast Floor Rule.** Ochre text appears only on shadow stone or navy (footer headings, the hero location line). On sunlit ground ochre is a line, not letters.

## Typography

**Display and Heading Font:** Archivo (variable, 100 to 900, self-hosted in `public/fonts`, Latin and Latin-ext subsets; fallback system-ui, sans-serif)
**Body Font:** Public Sans (variable, same hosting; fallback system-ui, sans-serif)

**Character:** Archivo is wide, firm and slightly industrial, used heavy so headings read like cut letters on a lintel. Public Sans is plain and open, built for long Shona, Ndebele and English strings on small phone screens.

### Hierarchy
- **Display** (800, 2.1rem on phones up to 4.5rem at xl, line-height 1.04): the school name on the lintel; the intro heading uses 4.5rem at lg with line-height 1.02.
- **Headline** (800, 1.875rem up to 3rem, line-height 1.05): section headings (Academics, School Life, News).
- **Title** (700, 1.125rem up to 2rem, line-height 1.1): gateway labels (1.125rem to 1.5rem), block names on slabs (1.125rem to 1.25rem), the principal quote (600, 1.5rem to 2.25rem, line-height 1.25).
- **Body** (400, 1rem to 1.25rem, line-height 1.625): intro copy, capped at `max-w-prose`. Secondary copy sits in Stone Text Soft.
- **Label** (600 to 700, 0.875rem, letter-spacing 0.025em, sentence case): buttons, nav links, text links, the hero location line. Table and numeric columns use tabular figures.

Headings use `text-wrap: balance`, body uses `text-wrap: pretty`, headings carry -0.015em tracking.

### Named Rules
**The Cut Letter Rule.** Archivo is set at 700 or 800 only. A light or regular heading looks like paper, not stone.

**The No Kicker Rule.** There is no small uppercase line above a heading, no numbered section tags, no tracked-out caps label. A heading stands alone.

## Layout

The page is a wall of horizontal courses. Full-bleed courses (hero wall, gateways, block grids, principal, doorway) alternate with contained reading courses on a centered container (padding 2rem, max 1400px at 2xl). Reading courses use a 12-column grid with deliberate asymmetry: a 6-column heading and stats list against a 5-column text column offset to column 8.

The unit of rhythm is the 5px joint. Block grids (`grid gap-[5px] p-[5px]` on shadow stone) set pictures and gateways edge to edge with the joint showing between them; spans vary per row (5/4/3 then 3/4/5 of 12; 7/5 then 5/7) so vertical joints never stack. Sections breathe at 80px (py-20) on phones and 112px (py-28) from md. Gateways are 2-up on phones, 4-up at lg, minimum 76px tall (112px at lg), so touch targets stay generous.

Crowning bands separate courses: a 24px chevron band under the gateways, a 16px band at the top of the doorway section, an 8px band under the nav, and a shadow-toned band after the principal section.

## Elevation & Depth

Depth is physical, not atmospheric. A surface is either flat on the wall, or a slab set on it. Slabs carry three layers: a 1px inner top light (white at 70%), a tight drop shadow (`0 2px 3px` at 20% shadow stone) and a long offset shadow (`0 18px 32px -18px` at 50%). Buttons carry a lighter version. The nav carries a hairline and a soft downward shadow so it reads as a sill under the sticky bar.

Photography is shown through stone: the `StoneWall` overlay darkens or lightens each block and draws recessed joints with a sun-catch highlight on the top and left edges. Shadow-stone grounds carry a fine fixed noise grain (`.granite`) so flat charcoal has a surface.

### Shadow Vocabulary
- **Slab** (`box-shadow: inset 0 1px 0 hsl(0 0% 100% / 0.7), 0 2px 3px hsl(220 25% 8% / 0.2), 0 18px 32px -18px hsl(220 25% 8% / 0.5)`): dropdown panel, block captions, news slabs, login panel, principal signature.
- **Button** (`0 1px 2px hsl(220 25% 8% / 0.3), 0 8px 16px -8px hsl(220 25% 8% / 0.45)`): default button only.
- **Nav sill** (`0 1px 0 var(--border), 0 10px 24px -18px hsl(220 25% 8% / 0.5)`): sticky nav.
- **Lintel cast** (`0 -18px 40px -20px hsl(220 25% 6% / 0.7)`): the navy lintel against the wall.

### Named Rules
**The Real Shadow Rule.** Shadows are offset downward with a tight core and a long soft tail, as if cast by sun from above. No centered glows, no coloured shadows, no blur used as decoration.

**The No Gradient Rule.** Surfaces are flat fills. The legacy `bg-maroon-gradient` and `text-gradient-maroon` utilities are kept for old markup but render as solid shadow stone and solid blue.

## Shapes

Square. `--radius` is 0.125rem (2px) and the Tailwind steps derive from it, so `rounded-lg` is 2px, `rounded-md` is 0 and `rounded-sm`, which buttons use, resolves to 0. Block faces in `StoneWall` carry a 0.35% rx, visually square. Borders are hairlines in joint-line grey (1px) except for two deliberate weights: the 6px ochre top edge on gateways and the login slab, and the 3px ochre underline on the active nav item. Photographs inside a frame sit in a thick light stone border on three sides (10 to 14px, open at the top), like a stone set in a lintel.

The chevron is the recurring silhouette: two courses of slanted blocks in a 10 by 16px tile, painted with a mask so it takes any fill (ochre by default, `chevron-band-stone`, `chevron-band-shadow`). Sizes are 8px (sm), 16px (default) and 24px (lg).

## Components

### Buttons
Square, firm, semibold, 14px label with 0.025em tracking, 150ms transition on colour and shadow, 1px press-down on active, 2px focus ring in logo blue with offset.
- **Default (primary):** logo blue fill, white text, 40px high, 16px side padding (48px high, 32px padding at lg). Hover turns navy.
- **Secondary:** navy fill, stone-lit text; hover turns logo blue.
- **Outline:** 2px charcoal border at 70%, transparent; hover inverts to a solid charcoal fill with ground-coloured text.
- **Ghost and link:** stone-hover fill, or logo blue text with underline on hover.
- **On navy:** the light variant is a stone-lit fill with navy text and no shadow; hover is pale ochre.

### Gateways
The four entrances along the foot of the hero: Apply (logo blue), Visit Us and Pay fees (stone-lit, hover pale ochre), Portal (navy, hover logo blue). Each is a square slab with a 6px ochre top edge, a bold Archivo title in the lower left, and an arrow in the lower right that nudges up and right on hover. They sit in a 5px-joint grid, 2-up on phones and 4-up at lg. This is the primary navigation pattern for audiences, not a card grid.

### Lintel
The navy panel that carries the school name over the hero wall: display-size Archivo 800 in stone-lit, a 85% stone-lit subtitle, and the ochre location line. It is anchored bottom-left over the wall at sm and above, and sits below the wall as a full-width course on phones. The login screen reuses it for the page title.

### Slab
A stone-lit block with the slab shadow. Used for dropdown panels (with a 3px ochre top edge), the caption on each picture block, the login panel (with a 6px ochre top edge), the principal's signature, and the news announcements.

### StoneWall
The signature component (`src/components/masonry/StoneWall.tsx`). One photograph is sliced into horizontal courses, each course divided into blocks of 16 to 36% width. Courses start mid-block so vertical joints never align. An SVG overlay gives each block a warm, cool or light tone, a sun-catch edge on top and left, and a recessed joint in near-black. The coursing is seeded (`mulberry32`), so it is identical on every render. Each page passes its own seed and course heights (home: seed 7, five courses; login: seed 19). It exposes desktop and phone focal points for the photograph.

### Picture block
A photograph filling a grid cell on shadow stone, captioned by a slab at its lower left, with a slow 700ms zoom to 1.04 on hover (disabled under reduced motion). Heights are 240 to 256px on phones, 304 to 384px at lg.

### Navigation
A sticky stone-lit bar with the MavingTech mark and wordmark at left, centered links from xl up, language select and a Portal login button at right, and an 8px chevron band along its lower edge. Links are 14px semibold; the active page gets a 3px ochre underline. Dropdowns are slabs with a 3px ochre top edge and stone-hover rows. Below xl it collapses to a menu button opening an accordion with 44px-plus touch rows.

### Footer
Shadow stone with granite grain. A row of three light affiliation slabs (Ministry coat of arms, ZIMSEC, Cambridge) sits in a 5px-joint course, then a 24px chevron band, then four columns with ochre headings, ochre icons and ochre link hover. Social and install controls are 44px square with a hairline border.

### Inputs and fields
Inherited from the base `Input`, `Select` and `Label` components, which pick up the stone tokens (joint-input stroke, square corners, logo-blue focus ring). Login shows them on a slab with a 44px-wide password reveal. Not individually redesigned.

### Portals (Operate)
Every portal (student, parent, teacher, finance, principal, deputy principal, HOD, registration, admin, admin supervisor) and the admin tools carry the world through four things only: palette, type, density and one signature move. Layout, navigation and controls stay the standard ones. The signature move is the chevron trim: every portal header uses `.portal-header`, a stone-lit bar with an 8px ochre chevron band hanging from its lower edge. Other portal rules:
- **Tabs:** the active tab sits on a card with a 3px ochre underline (an inset shadow), the same marker as the public nav.
- **Cards:** square, hairline border, a soft two-layer shadow. Card titles are bold Archivo, not semibold.
- **Tables:** a stone-muted head row, bold small headers and a 2px rule under it. Numerals are tabular everywhere.
- **Badges and chips:** square, not pills.
- **Colour jobs:** logo blue and navy for action and selection; green, amber and red remain for status only (paid, due, overdue, alerts); ochre never carries status. The former teal, purple, pink and indigo accents and every gradient in portal markup were replaced with these tokens.
- **Printed documents:** report cards, receipts, invoices and the finance print window keep their own print palette and fonts on purpose and are outside this system.

### Public pages
Every public page shares the home page's opener. `PageHero` lays the page photograph through the stone wall with the title on a navy lintel and a 24px chevron band below. Pages that had no photograph use a flat navy lintel band and the same chevron. Section labels above headings, the short accent bars, centred section heads, soft ringed cards, circular photo and icon chips, scroll-triggered entrances and gradient panels were removed. Cards are flat bordered tiles with no lift on hover. The About stats are a left-aligned ledger with a top rule, not centred icon tiles.

### Dark mode
Dark mode is defined in `src/index.css` under `.dark` and was reviewed on the home page, About, login and the admin, finance and parent portals at desktop and phone width. The app has no switch that sets the `dark` class, so users cannot reach it today; it is ready for one. Rules that make it work:
- `--raised` is the surface that flips with the theme (nav, mobile menu, slabs, portal headers, gateway tiles): stone-lit in light mode, a raised dark stone in dark mode. `--stone-lit` and `text-lit` never flip; use them for fixed light things such as text on navy or shadow bands, the logo plaque and the affiliation tiles.
- The supplied logos are dark on transparent, so in dark mode every `mavingtech-logo` image sits on a light plaque.
- Status colours carry a dark variant: text 600 to 800 gets `dark:text-*-300`, tinted fills 50 or 100 get `dark:bg-*-950/40`.
- Legacy tint tokens (`maroon-light`, `silver-light`, `gold-light`, `ochre-soft`) have dark values.
- A contrast probe over visible text found no failures on the reviewed pages after these fixes. Printed documents and the QR code stay light on purpose.

### Not yet carried
Page bodies keep their earlier layouts (tile grids, tab strips, forms) and were re-skinned, not recomposed into courses. Legacy token names (`maroon`, `gold`, `silver`) still exist and are remapped to blue, ochre and stone; new work should use the stone, shadow, navy and ochre names.

## Motion

There is one authored motion: **course-lay**. On load, each hero course rises 18px, fades in and unmasks from the top (`opacity`, `translateY`, `clip-path: inset`) over 760ms with `cubic-bezier(0.16, 1, 0.3, 1)`, delayed 110ms per course and staggered from the ground up, so the wall is laid from the bottom course to the top. Under `prefers-reduced-motion: reduce` the animation is removed and the wall appears whole. Other movement is functional only: 150ms colour transitions, the 1px button press, the gateway arrow nudge, the picture-block zoom (also removed under reduced motion), and dropdown and accordion reveals of 150 to 200ms. Do not add scroll-triggered entrances or decorative loops.

## Do's and Don'ts

### Do:
- **Do** build structure from courses: full-width bands of blocks with a 5px shadow-stone joint, varying spans row to row so joints never stack.
- **Do** end a section with a chevron band (8px under the nav, 16px or 24px between courses) and tone it for its ground (ochre on light, shadow on dark).
- **Do** keep every corner square and every border a hairline, except the 6px ochre gateway top edge and the 3px active-nav underline.
- **Do** give raised things a real offset shadow (the slab recipe) and keep everything else flat.
- **Do** use logo blue or navy for every action and ochre only as a marker.
- **Do** set headings in Archivo at 700 or 800 and text in Public Sans, and keep lines to `max-w-prose`.
- **Do** give each audience its own gateway on the home page and keep touch targets at 44px or larger.
- **Do** keep the school crest, MavingTech mark, Ministry, ZIMSEC and Cambridge logos and the real photography unaltered; photographs go through `StoneWall` or sit in a thick stone frame.
- **Do** keep layouts tolerant of longer Shona and Ndebele strings (line-clamped captions, wrapping buttons).

### Don't:
- **Don't** put a kicker, eyebrow or small tracked-caps label above a heading.
- **Don't** use a coloured side stripe (`border-left` or `border-right` accent) on any block, callout or row. The ochre edge belongs only on the top of a gateway or slab and under the active nav item.
- **Don't** use gradients on surfaces or text, gradient text, or glassy blur.
- **Don't** use cards as the structure of a page. Do not build repeated rounded, shadowed, equal-sized card grids with icon, title and text; use masonry blocks, rows, rules and gateways instead.
- **Don't** round corners, add pill shapes, or use soft glow shadows.
- **Don't** fill a surface with ochre or set ochre body text on light ground.
- **Don't** add a second accent colour, or revive maroon and gold.
- **Don't** add a hero carousel, a quick-link icon bar, or a floating stat-card strip.
- **Don't** add motion beyond course-lay; no scroll reveals, parallax or looping animation.
- **Don't** invent figures. The home stats (800+, 45+, 24+, 30+) exist in code with undocumented sources and are not to be extended; do not fabricate results, fees, term dates or testimonials.
