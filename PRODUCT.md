# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Parents and prospective families (Harare, Zimbabwe):** judge the school and enquire or apply on the public site; once enrolled, use the parent portal for fees, payments, timetables and progress. Many arrive on a phone. (Inferred from routes and copy; confirm mobile share.)
- **Staff and students:** teachers, HODs, deputy principal, principal, finance, registration, admin supervisors and admins work in role-specific portals; students use a student portal and timetable. (From the routes in `src/App.tsx`.)
- **School decision-makers evaluating the suite:** because the project doubles as a showcase, other schools look at it to judge whether to buy EduSuite. Confirmed by the owner: the product is both a live school's system and the vendor's showcase.

## Product Purpose

EduSuite is MavingTech's school-management suite. MavingTech High School (Harare) is its live school and its showcase. One codebase serves a public school website (about 18 pages: about, academics, admissions, fees, pay online, boarding, school life, news, staff, vacancies, downloads, alumni, contact) and authenticated portals for student, parent, teacher, finance, principal, deputy principal, HOD, registration, admin and admin-supervisor roles, with admin tools for students, staff, finance, boarding, inventory, communication, audit logs, EMIS reports and data migration, plus AI-assisted marking and timetable generation. Success: families can find what they need and act (apply, pay, visit), staff can complete daily school work, and prospective buyer schools can see a credible, complete product.

## Positioning

An end-to-end suite built for Zimbabwean schools: ZIMSEC and Cambridge curricula, Form 1 to A-Level, EMIS reporting, boarding, and Shona and Ndebele language support alongside English. (Derived from code and copy; the owner has not confirmed the competitive claim.)

## Operating Context

Zimbabwean secondary school: Forms 1 to 6, O-Level and A-Level, terms and fees, boarding, PTFA. Parents and staff use the portals on a mix of phones and desktops. The public site is multilingual (English, Shona, Ndebele).

## Capabilities and Constraints

- Existing React, Vite, TypeScript and Tailwind app on Supabase (migrations, edge functions, auth), with shadcn-style UI components (`components.json`).
- Binding constraints confirmed by the owner for the redesign: keep logos and school identity (school crest, MavingTech mark, Ministry of Education, ZIMSEC, Cambridge logos), keep the real photography in `src/assets`, keep all routes, copy and i18n strings and portal behaviour, and make no backend or data changes. The redesign is a visual layer only.
- Scope confirmed: the whole app under one design system, staged, starting with the public home page and login, then rolling out to the portals.
- Undecided: the exact relationship between the MavingTech vendor brand and the school brand on shared surfaces such as the nav and footer. The school's official colours are not specified.

## Brand Commitments

Existing logos and school identity are binding and must not be altered: `src/assets/school-logo.png`, `mavingtech-logo.png`, `ministry-of-education-logo.png`, `zimsec-logo.png`, `cambridge-logo.png`.

## Evidence on Hand

Real photography in `src/assets` (hero-students-1 to 5, classroom, sports, activity and curriculum images, `principal-moyo.jpg`). The stats on the home page (for example student and staff counts) exist in code; their sources are not documented, so future work must not invent or extend them. No testimonials, exam results, fees figures or term dates were supplied for this work; do not fabricate them.

## Product Principles

1. A visitor in a moment of decision (a parent choosing a school, a bursar closing the month) finds the next action without hunting.
2. The suite is judged by its completeness and its credibility; every screen should look like it belongs to the same system.
3. Local and specific beats generic: Harare, Zimbabwean curricula and the school's own people and photography are the material.
4. Visual change never changes behaviour, routes, copy or data.

## Accessibility & Inclusion

Three languages (English, Shona, Ndebele), so layouts must tolerate longer strings. Phone-first use on the parent side; touch targets and contrast must hold on small screens. No formal standard was stated; WCAG 2.2 AA is the working target. (Working assumption, not owner-confirmed.)
