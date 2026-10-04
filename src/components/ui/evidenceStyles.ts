import type { SkillEvidence } from '@/types'

/**
 * Glyph and colour for each kind of evidence, shared by the capability map and
 * the technology rail so "project / role / credential / learning" reads the same
 * everywhere. Lives in its own module rather than beside a component so the
 * component files stay component-only (fast refresh).
 */
export const EVIDENCE_STYLE: Record<SkillEvidence['kind'], { glyph: string; color: string }> = {
  project: { glyph: '▣', color: 'var(--accent-teal)' },
  role: { glyph: '◆', color: 'var(--accent-indigo)' },
  credential: { glyph: '✦', color: 'var(--accent-violet)' },
  learning: { glyph: '◇', color: 'var(--accent-orange)' },
}
