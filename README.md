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
│   ├── About/        # About.tsx + AboutDepth.tsx + RevealWords.tsx
│   ├── Journey/      # Stage-and-column narrative; stages/ holds the 8 drawings
│   ├── Skills/
│   ├── Experience/
│   ├── Projects/
│   ├── SideMissions/ # Separate destination (/#/side-missions)
│   ├── Education/
│   ├── Certifications/
│   └── Contact/
├── hooks/            # useScrollReveal, useMouse, useLenis, useTheme, useCanvasScene, useMediaQuery
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

## The Journey section

Eight chapters, one **stage**. On a wide screen the stage is pinned beside the
text and changes as you read; below `lg` each chapter carries its own stage inline
instead, because a pinned viewport is the wrong tool for a thumb. There is no
autoplay and nothing that must be clicked to read the story.

```
src/sections/Journey/
├── Journey.tsx          section shell, measurement, sticky composition
├── JourneyCompass.tsx   persistent 8-station progress rail + milestone tally
├── JourneyStage.tsx     dispatcher: one treatment mounted at a time
├── JourneyChapter.tsx   the editorial column for one chapter
├── stages/
│   ├── stageKit.tsx     shared frame, spine, ticks, controls, counters
│   ├── stageData.ts     short labels — always derived from journey.ts
│   ├── StageLearn … StagePublish   the eight drawings
```

**The eight treatments are deliberately different pictures, not one template:**
a seed and its first four proofs · four task windows assembling · a spotlight,
two beacons and a crowd · the browser/server boundary · three roles on one
lifecycle · a class diagram becoming a sequence diagram · three services and a
150-cell index · the Chapter I seed inside a published package.

They stay one system because `StageCanvas` gives every chapter the same frame, the
same travel spine and eight ticks that light one per chapter passed.

### Two things worth knowing before editing it

**Scroll position is measured, not observed.** One `useScroll` spans the chapter
column with `offset: ['start center', 'end center']`, and a single measurement
pass records each chapter's top and height. From those:

```
localProgress(i) = (progress × columnHeight − chapterTop(i)) / chapterHeight(i)
```

Both offsets use the viewport centre, which is what makes that exact — the reading
line cancels out. It costs one scroll listener and no layout reads while scrolling.

**`overflow: hidden` on the section would break both sticky elements.** The
backdrop is wrapped in its own clipping `div` so the section itself stays
`overflow: visible`. If you add a sticky element here, keep it that way.

### Rules the stages follow

- Stage artwork never carries a fact on its own; the chapter text and milestone
  links are always present underneath it.
- Interactive stages put their controls in **real buttons below the canvas** —
  never shapes trapped inside an `aria-hidden` SVG.
- Text inside `stages/stageData.ts` must be an abbreviation of something already
  in `src/data/journey.ts`; nothing there is a new claim.
- Reduced motion pins the progress value at 1, so a stage renders its finished
  state and needs no second code path.

## Strobi, the companion

Strobi is the portfolio's runtime companion — one avatar
(`src/assets/strobi.avatar.json`, built once through `createAvatar`) docked to the
bottom-right of the viewport, following the reader down the page so the expression
it wears is actually visible while scrolling. Below `sm` it drops its label and is
just the avatar, so it never covers the text it sits beside.

Its expression is resolved most specific first: a node being inspected in the hero
topology → `thinking`, the pointer resting on the companion → `working`, the active
journey chapter or career role → that chapter/role's own mood, and finally the
section the reader is standing in.

The chapter and role moods are **not** re-derived from scroll position. `Journey`
and `Experience` already measure which chapter or role the reader has reached, and
they publish it to `src/utils/companionFocus.ts`. That module is deliberately a tiny
external store rather than a context: a context value changing on every chapter
would re-render the provider's whole subtree — the entire page — whereas only the
companion subscribes. It reads the store with `useSyncExternalStore`
(`useCompanionState`), so a scroll that does not cross a chapter or role boundary
re-renders nothing. Threads are kept in per-section slots, so a stale value in one
section can never shadow the other.

## Scroll behaviour

Lenis owns the scroll position, so programmatic scrolls must go *through* it —
a plain `scrollIntoView` is undone on the next frame. `src/utils/lenisRef.ts`
publishes the instance and `scrollToSection()` drives it.

`useLenis` also runs a `ResizeObserver` on `document.body`: sections are lazy
loaded, so the document keeps growing after Lenis caches its maximum scroll
offset. Without the resize, links to lower sections silently fail to travel.

## Accessibility & motion

- Semantic landmarks, headings and lists throughout; the journey is an ordered list.
- The credential archive and the journey compass are both roving-tabindex rails
  with arrow-key navigation, so each is a single tab stop.
- Visible focus indicators come from the global `:focus-visible` rule.
- `prefers-reduced-motion` is respected in JS (`useReducedMotion`) and CSS. The
  journey pins its stage progress at 1 so every picture renders finished; About
  drops its depth planes to zero travel and returns its paragraphs to plain text.
- Canvas scenes pause when off-screen or when the tab is hidden.
- About's biography is revealed word by word through a mask (`RevealWords`), which
  clones existing markup rather than flattening it — `<strong>` and wording survive.

## Deployment

The build output is a static site (`dist/`) deployable to Vercel, Netlify or
GitHub Pages.

> `public/LinkedIn/` holds ~28 MB of scanned certificates used as evidence in the
> Credentials section. Consider compressing or converting them to WebP before a
> production deploy.

## License

MIT — feel free to fork and adapt for your own portfolio.