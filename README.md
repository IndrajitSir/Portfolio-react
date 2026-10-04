# Indrajit Mandal — Personal Portfolio

A production-grade, fully typed React portfolio built with modern tooling and premium UX.

The portfolio is structured as a **narrative journey** rather than a résumé: eight
chapters, each built only from documented milestones, linked to a public source.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build tool | Vite 5 |
| Styling | Tailwind CSS 3 |
| Animation | Framer Motion + GSAP |
| 3D | React Three Fiber + Three.js |
| Smooth scroll | Lenis |
| Icons | React Icons |

## Project Structure

```
src/
├── components/
│   ├── ui/           # Primitives (GlowCard, Tag, ThreadTrack, SkillConstellation…)
│   ├── layout/       # Navbar, Footer
│   ├── animations/   # AnimatedText, RevealBlock
│   └── three/        # R3F canvas components
├── sections/
│   ├── Hero/
│   ├── About/
│   ├── Journey/      # The eight-chapter narrative spine
│   ├── Skills/
│   ├── Experience/
│   ├── Projects/
│   ├── SideMissions/ # Separate destination (/#/side-missions)
│   ├── Education/
│   ├── Certifications/
│   └── Contact/
├── hooks/            # useScrollReveal, useMouse, useLenis, useTheme, useCanvasScene
├── context/          # ThemeContext, RouteContext
├── utils/            # Motion language, scroll helpers, lenisRef
├── types/            # Shared TypeScript interfaces
└── data/             # All professional content (single source of truth)
```

## Quick Start

```bash
npm install
npm run dev
npm run build
npm run preview
```

> If `npm install` fails with an `ERESOLVE` peer-dependency error, the repo's
> existing eslint 9 / `eslint-plugin-react-hooks` 4 combination needs
> `--legacy-peer-deps`. This is pre-existing and unrelated to the app.

## Content Architecture

Every professional fact lives in `src/data/`, never inside a component.

| File | Holds |
|---|---|
| `personal.ts` | Name, contact, social links |
| `journey.ts` | The eight narrative chapters and their milestones |
| `credentials.ts` | Certificates, badges, workshops, bootcamps, competitions |
| `experience.ts` | Roles and internships, newest first |
| `skills.ts` | Domains and technologies, each with its evidence |
| `education.ts` | Academic record |
| `sources.ts` | The verification index behind the claims above |

### Integrity rules

These are enforced in the data layer, not just documented:

- **No invented proficiency scores.** Skills carry *evidence* (a project, role or
  credential), never a self-assigned 0–100 number.
- **Credentials are typed by kind.** A Microsoft Learn badge, a certificate, a
  workshop you attended and a quiz you entered are four different claims, and the
  UI labels each one accordingly.
- **Internships are never presented as employment.** `Experience.type` keeps them
  distinct, and the timeline shows it.
- **Unverified entries are marked.** A `Credential` with `status: 'needs-review'`
  is shown as provisional rather than stated as fact.
- **Claims link to sources.** Where a public post or issuer page exists, it is
  attached, so a visitor can check rather than take the portfolio's word.

### Adding a skill

Do not add a percentage. Ship something, then link it:

```ts
// src/data/skills.ts
{
  name: 'Redis',
  evidence: [{ kind: 'role', label: 'Caching layer at Distronix', href: '#experience' }],
}
```

## The Journey motif

`ThreadTrack` (`src/components/ui/`) is the shared motif: a rail that draws itself
as you scroll. It is decorative — the same facts are always in the markup — so the
section still reads correctly with animation disabled. Under
`prefers-reduced-motion` the rail renders fully drawn rather than animating.

Note the rail is a **fixed-width SVG stretched only vertically**. A full-bleed
`viewBox` squashes the curve on narrow screens; markers are DOM rather than SVG so
text is never distorted.

## Scroll behaviour

Lenis owns the scroll position, so programmatic scrolls must go *through* it —
a plain `scrollIntoView` is undone on the next frame. `src/utils/lenisRef.ts`
publishes the instance and `scrollToSection()` drives it.

`useLenis` also runs a `ResizeObserver` on `document.body`: sections are lazy
loaded, so the document keeps growing after Lenis caches its maximum scroll
offset. Without the resize, links to lower sections silently fail to travel.

## Accessibility & motion

- Semantic landmarks, headings and lists throughout; the journey is an ordered list.
- The credential archive is a roving-tabindex listbox with arrow-key navigation.
- Visible focus indicators come from the global `:focus-visible` rule.
- `prefers-reduced-motion` is respected in JS (`useReducedMotion`) and CSS.
- Canvas scenes pause when off-screen or when the tab is hidden.

## Deployment

The build output is a static site (`dist/`) deployable to Vercel, Netlify or
GitHub Pages.

> `public/LinkedIn/` holds ~28 MB of scanned certificates used as evidence in the
> Credentials section. Consider compressing or converting them to WebP before a
> production deploy.

## License

MIT — feel free to fork and adapt for your own portfolio.