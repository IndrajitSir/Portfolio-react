import { GrapifyCanvas, TryOnixCanvas, BubbleGameCanvas } from '@/components/ui'
import type { ProjectVisual, SideProject } from '@/types'

// Kept separate from MissionCard so the featured briefing can mount the same
// live canvas without duplicating the registry.
const visuals: Partial<Record<ProjectVisual, () => JSX.Element>> = {
  grapify: GrapifyCanvas,
  tryonix: TryOnixCanvas,
  bubble: BubbleGameCanvas,
}

export default function MissionPreview({ project }: { project: SideProject }) {
  const Visual = visuals[project.visual]
  if (!Visual) return null
  return <Visual />
}
