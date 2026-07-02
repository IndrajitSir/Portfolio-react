# Indrajit Mandal — Personal Portfolio

A production-grade, fully typed React portfolio built with modern tooling and premium UX.

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
├── assets/           # Static assets (images, fonts, etc.)
├── components/
│   ├── ui/           # Primitive UI components (GlowCard, Tag, MagneticButton…)
│   ├── layout/       # Navbar, Footer
│   ├── animations/   # AnimatedText, RevealBlock
│   └── three/        # R3F canvas components (HeroCanvas, ParticleField…)
├── sections/
│   ├── Hero/
│   ├── About/
│   ├── Skills/
│   ├── Experience/
│   ├── Projects/
│   ├── Education/
│   ├── Certifications/
│   └── Contact/
├── hooks/            # useScrollReveal, useMouse, useLenis, useTheme
├── context/          # ThemeContext
├── constants/        # App-wide constants
├── utils/            # Animation variants, helpers
├── types/            # Shared TypeScript interfaces
└── data/             # All resume content (single source of truth)
```

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev

# 3. Build for production
npm run build

# 4. Preview production build
npm run preview
```

## Updating Content

All content lives in `src/data/`. Edit the relevant file:

- `personal.ts` — name, email, social links, tagline
- `skills.ts` — skill categories, tech stack chips
- `projects.ts` — project case studies
- `experience.ts` — work history
- `education.ts` — degrees and certifications

TypeScript types live in `src/types/index.ts`, ensuring data consistency.

## Deployment

The build output is a static site (`dist/`) that can be deployed to:

- **Vercel** — `vercel deploy`
- **Netlify** — drag & drop `dist/` folder or connect repo
- **GitHub Pages** — use `gh-pages` package

## Design System

- **Fonts**: Fraunces (display) · Space Grotesk (body) · JetBrains Mono (code)
- **Accent colours**: Teal `#5eead4` · Indigo `#818cf8` · Orange `#fb923c`
- **Dark mode** is default; light mode is fully supported via CSS variables
- All animations use Framer Motion with `viewport: { once: true }` for performance

## License

MIT — feel free to fork and adapt for your own portfolio.
