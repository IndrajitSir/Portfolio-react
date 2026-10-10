import { useEffect, useState } from 'react'
import SystemsConstellation from '@/components/ui/SystemsConstellation'
import { setCompanionInspecting } from '@/utils/companionFocus'

/**
 * The operator and the system it watches, held in one small component so the
 * inspected-node state travels the shortest possible distance.
 *
 * Keeping this out of `Hero` matters: the hero is an expensive subtree (identity
 * entrance, code panel, metrics), and letting a node hover re-render all of it
 * would spend far more than the interaction is worth. Only this wrapper responds
 * to the pointer — it reports the inspected node to the docked companion, and
 * nothing else on the page moves.
 */
export default function HeroTopology() {
  const [inspected, setInspected] = useState<string | null>(null)

  // No Strobi is mounted here any more: the companion is docked to the viewport,
  // so this only tells it which node the reader is inspecting. Cleared on unmount
  // so a stale inspection never outlives the topology.
  useEffect(() => {
    setCompanionInspecting(inspected !== null)
  }, [inspected])
  useEffect(() => () => setCompanionInspecting(false), [])

  return <SystemsConstellation onActiveChange={setInspected} />
}
