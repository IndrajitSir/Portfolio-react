import type { SideProject } from '@/types'

// Smaller experiments that live beside the main portfolio projects.
// Each entry is grounded in the app's real, verifiable behaviour and carries an
// honest qualifier where functionality has boundaries.
export const sideProjects: SideProject[] = [
  {
    id: 'grapify',
    number: 'S1',
    title: 'GrapiFy',
    tagline: 'Graph data structure, visualised',
    description:
      'An interactive canvas for building graph structures by hand — add nodes, drag them around, and delete them. Edges and traversal algorithms are on the roadmap.',
    technologies: ['React', 'React Flow', 'JavaScript'],
    liveUrl: 'https://grapi-fy.vercel.app/',
    githubUrl: 'https://github.com/IndrajitSir/GrapiFy',
    accent: 'indigo',
    visual: 'grapify',
    interaction: 'Click the canvas to add a node · click a node to remove it',
    note: 'Node creation and deletion are live; edges and BFS/DFS are planned, not shipped.',
  },
  {
    id: 'tryonix',
    number: 'S2',
    title: 'TryOnix AI',
    tagline: 'Virtual try-on pipeline',
    description:
      'A full-stack virtual try-on app: upload a person photo and a garment, watch the generation pipeline run, and keep a history of past results. Accounts support email/password and Google OAuth, with a 3-per-day free tier.',
    technologies: ['React', 'Tailwind', 'Node.js', 'MongoDB', 'Cloudinary', 'Python'],
    liveUrl: 'https://try-onix-ai.vercel.app/',
    githubUrl: 'https://github.com/IndrajitSir/TryOnix-AI',
    accent: 'violet',
    visual: 'tryonix',
    interaction: 'Preview · upload → generate → result',
    note: 'AI generation needs the configured service keys; the preview is an illustrative pipeline, not a fabricated result.',
  },
  {
    id: 'bubble-game',
    number: 'S3',
    title: 'Bubble Game',
    tagline: 'Sixty seconds, one target number',
    description:
      'A small browser game: pop the bubbles that match the hit target before the 60-second timer runs out, and stack the highest score you can.',
    technologies: ['HTML', 'CSS', 'JavaScript'],
    liveUrl: 'https://bubble-game-six-sigma.vercel.app/',
    githubUrl: 'https://github.com/IndrajitSir/Bubble-Game',
    accent: 'teal',
    visual: 'bubble',
    interaction: 'Tap the bubbles to pop them',
    layout: 'wide',
  },
]
