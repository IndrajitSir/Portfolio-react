import { useState } from 'react'
import SystemsConstellation from '@/components/ui/SystemsConstellation'
import StrobiAssistant from '@/components/ui/StrobiAssistant'

/**
 * The operator and the system it watches, held in one small component so the
 * inspected-node state travels the shortest possible distance.
 *
 * Keeping this out of `Hero` matters: the hero is an expensive subtree (identity
 * entrance, code panel, metrics), and letting a node hover re-render all of it
 * would spend far more than the interaction is worth. Only this wrapper responds
 * to the pointer — Strobi changes expression, and nothing else on the page moves.
 */
export default function HeroTopology() {
  const [inspected, setInspected] = useState<string | null>(null)

  return (
    <>
      <StrobiAssistant className="mb-3" inspected={inspected} />
      <SystemsConstellation onActiveChange={setInspected} />
    </>
  )
}
