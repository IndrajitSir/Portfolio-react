import { useRef } from 'react'
import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import { clamp } from '@/utils'

/**
 * One small sketch per role, drawn by the scroll.
 *
 * The npm publication scene established a drawing language for this portfolio:
 * thin cyan strokes, a contained wash behind the thing being explained, mono
 * micro-labels, one indigo or orange accent where something branches or is
 * refused, and nothing that is not carried by the stroke. These four sketches
 * are drawn in that language, but they are *scroll*-drawn rather than
 * time-driven: every stroke is a `pathLength` fed from the role's own scroll
 * progress, the same number that lights the stage ribbon below it.
 *
 * So the two layers agree: the ribbon is the trace (what happens, in order), the
 * sketch is the shape (what the work was built out of). Neither repeats the
 * other, and neither needs a timer, an intersection observer of its own, or a
 * line of JavaScript per frame — the derived motion values are written straight
 * to stroke geometry by the compositor.
 *
 * Every sketch states only what the role documents: four shipped interfaces for
 * the internship, three roles on one placement system, the SAP order-to-cash
 * cycle, and the three systems the current role is responsible for. Nothing is
 * drawn that the data does not say.
 *
 * The drawing is only *mounted* while its role is near the viewport. The box
 * that holds it carries the drawing's aspect ratio instead, so mounting and
 * unmounting cannot shift the text underneath it. Reduced motion pins the
 * progress at 1: the finished sketch, still, with every stroke in place.
 */

interface CareerDiagramProps {
  /** Which role's sketch to draw. */
  roleId: string
  /** Role accent; the whole sketch inherits it as `currentColor`. */
  accent: string
  /** This role's scroll progress, 0-1. */
  progress: MotionValue<number>
}

/** The drawing space every sketch is authored in. */
const VB_W = 320
const VB_H = 96

/** Margin outside the box in which the drawing may be mounted. */
const NEAR = '600px 0px 600px 0px'

/**
 * How much of a stroke is drawn at progress `v`: a hard 0 before `from`, a hard
 * 1 after `to`, and a linear fill between. A plain function, so each sketch
 * calls `useTransform` itself and the hook order in the component is plain to
 * read.
 */
const amount = (v: number, from: number, to: number) => clamp((v - from) / (to - from), 0, 1)

export default function CareerDiagram({ roleId, accent, progress }: CareerDiagramProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()
  // Not `once`: the drawing is released again once it is well clear of the
  // viewport, so at most a role or two is ever mounted.
  const near = useInView(ref, { margin: NEAR })
  // Reduced motion is the finished drawing, still.
  const finished = useMotionValue(1)
  const value = reduceMotion ? finished : progress

  // The box carries the drawing's aspect ratio and is capped at the width the
  // drawing was made for, so mounting and unmounting cannot shift the text and
  // a full-width column below the two-column breakpoint cannot stretch it.
  return (
    <div
      ref={ref}
      className="mt-2.5 w-full max-w-[24rem]"
      style={{ aspectRatio: `${VB_W} / ${VB_H}` }}
    >
      {near && (
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="career-sketch h-full w-full"
          style={{ color: accent }}
          aria-hidden="true"
          focusable="false"
        >
          {roleId === 'distronix' && <AuthorizationSystems value={value} />}
          {roleId === 'ardent-computech' && <PlacementRoles value={value} />}
          {roleId === 'jai-balaji' && <OrderToCash value={value} />}
          {roleId === 'systemtron' && <FourTasks value={value} />}
        </svg>
      )}
    </div>
  )
}

/**
 * Junior Software Developer — the three systems the role is responsible for, as
 * three frames: an authorized request, a scanned upload, an indexed read.
 */
function AuthorizationSystems({ value }: { value: MotionValue<number> }) {
  const frames = useTransform(value, (v) => amount(v, 0.02, 0.12))
  const auth = useTransform(value, (v) => amount(v, 0.05, 0.3))
  const scan = useTransform(value, (v) => amount(v, 0.35, 0.6))
  const query = useTransform(value, (v) => amount(v, 0.65, 0.9))

  return (
    <>
      {[4, 110, 216].map((x) => (
        <motion.rect
          key={x}
          className="career-sketch__frame"
          x={x}
          y={10}
          width={100}
          height={64}
          rx={7}
          style={{ opacity: frames }}
        />
      ))}

      {/* ── Authorization: request → gate → core, with the refusal path ── */}
      <motion.g style={{ opacity: auth }}>
        <motion.circle className="career-sketch__dot" cx={14} cy={34} r={3} />
        <motion.path
          className="career-sketch__edge"
          d="M19 34 H26"
          pathLength={auth}
          style={{ pathLength: auth }}
        />
        <motion.path className="career-sketch__edge" d="M26 26 V42 M32 26 V42" pathLength={auth} style={{ pathLength: auth }} />
        <motion.rect className="career-sketch__node" x={38} y={28} width={34} height={12} rx={3} />
        <text className="career-sketch__label career-sketch__label--strong" x={55} y={37} textAnchor="middle">
          RBAC
        </text>
        <motion.path
          className="career-sketch__edge"
          d="M74 34 H84"
          pathLength={auth}
          style={{ pathLength: auth }}
        />
        {/* the branch that does not pass */}
        <motion.path
          className="career-sketch__edge career-sketch__edge--warn"
          d="M29 26 V18 H40 M36 14 L40 18 L36 22"
          pathLength={auth}
          style={{ pathLength: auth }}
        />
        <text className="career-sketch__label" x={16} y={86} textAnchor="middle">
          Authorization
        </text>
      </motion.g>

      {/* ── File scan: document → filter → clean document ──────────────── */}
      <motion.g style={{ opacity: scan }}>
        <motion.rect className="career-sketch__node" x={120} y={28} width={13} height={16} rx={2} />
        <motion.path
          className="career-sketch__edge"
          d="M136 36 H146"
          pathLength={scan}
          style={{ pathLength: scan }}
        />
        <motion.path
          className="career-sketch__node"
          d="M150 27 H170 L166 41 H154 Z"
          style={{ opacity: scan }}
        />
        <motion.path
          className="career-sketch__edge"
          d="M172 36 H182"
          pathLength={scan}
          style={{ pathLength: scan }}
        />
        <motion.rect className="career-sketch__node" x={186} y={28} width={13} height={16} rx={2} />
        <motion.path
          className="career-sketch__edge"
          d="M190 38 L193 41 L199 33"
          pathLength={scan}
          style={{ pathLength: scan }}
        />
        <text className="career-sketch__label" x={160} y={86} textAnchor="middle">
          File scanning
        </text>
      </motion.g>

      {/* ── Query: a table, and the key that makes the read cheap ───────── */}
      <motion.g style={{ opacity: query }}>
        <motion.rect className="career-sketch__node" x={226} y={26} width={34} height={22} rx={3} />
        <motion.path
          className="career-sketch__edge"
          d="M226 33 H260 M226 40 H260"
          pathLength={query}
          style={{ pathLength: query }}
        />
        <motion.rect className="career-sketch__dot" x={230} y={30} width={5} height={3} />
        <motion.path
          className="career-sketch__edge"
          d="M268 37 H276"
          pathLength={query}
          style={{ pathLength: query }}
        />
        <motion.circle className="career-sketch__node" cx={283} cy={37} r={5} />
        <text className="career-sketch__label" x={260} y={86} textAnchor="middle">
          Indexing
        </text>
      </motion.g>
    </>
  )
}

/**
 * Industrial internship — three roles on one placement system: students,
 * companies and the administrator who schedules between them.
 */
function PlacementRoles({ value }: { value: MotionValue<number> }) {
  const boundary = useTransform(value, (v) => amount(v, 0.02, 0.16))
  const centre = useTransform(value, (v) => amount(v, 0.18, 0.32))
  const student = useTransform(value, (v) => amount(v, 0.34, 0.5))
  const company = useTransform(value, (v) => amount(v, 0.52, 0.68))
  const admin = useTransform(value, (v) => amount(v, 0.7, 0.86))

  return (
    <>
      <motion.path
        className="career-sketch__edge career-sketch__edge--boundary"
        d="M8 6 H312 V90 H8 Z"
        pathLength={boundary}
        style={{ pathLength: boundary }}
      />

      <motion.g style={{ opacity: centre }}>
        <motion.rect className="career-sketch__node career-sketch__node--core" x={118} y={32} width={84} height={34} rx={5} />
        <text className="career-sketch__label career-sketch__label--strong" x={160} y={47} textAnchor="middle">
          Placement
        </text>
        <text className="career-sketch__label" x={160} y={57} textAnchor="middle">
          system
        </text>
      </motion.g>

      <motion.g style={{ opacity: student }}>
        <motion.path className="career-sketch__edge" d="M40 30 V24 H118" pathLength={student} style={{ pathLength: student }} />
        <motion.rect className="career-sketch__node" x={16} y={10} width={64} height={16} rx={4} />
        <text className="career-sketch__label" x={48} y={21} textAnchor="middle">Student</text>
      </motion.g>

      <motion.g style={{ opacity: company }}>
        <motion.path className="career-sketch__edge" d="M202 24 H280 V30" pathLength={company} style={{ pathLength: company }} />
        <motion.rect className="career-sketch__node" x={240} y={10} width={64} height={16} rx={4} />
        <text className="career-sketch__label" x={272} y={21} textAnchor="middle">Company</text>
      </motion.g>

      <motion.g style={{ opacity: admin }}>
        <motion.path className="career-sketch__edge" d="M160 66 V72" pathLength={admin} style={{ pathLength: admin }} />
        <motion.rect className="career-sketch__node" x={128} y={72} width={64} height={16} rx={4} />
        <text className="career-sketch__label" x={160} y={83} textAnchor="middle">Administrator</text>
      </motion.g>
    </>
  )
}

/**
 * SAP Officer Trainee — the order-to-cash cycle as a closed loop of documents,
 * which is what the role actually worked inside.
 */
function OrderToCash({ value }: { value: MotionValue<number> }) {
  const loop = useTransform(value, (v) => amount(v, 0.02, 0.3))
  const doc1 = useTransform(value, (v) => amount(v, 0.28, 0.4))
  const doc2 = useTransform(value, (v) => amount(v, 0.38, 0.5))
  const doc3 = useTransform(value, (v) => amount(v, 0.48, 0.6))
  const doc4 = useTransform(value, (v) => amount(v, 0.58, 0.7))
  const doc5 = useTransform(value, (v) => amount(v, 0.68, 0.8))
  const doc6 = useTransform(value, (v) => amount(v, 0.78, 0.9))
  const centre = useTransform(value, (v) => amount(v, 0.86, 1))
  const docs = [doc1, doc2, doc3, doc4, doc5, doc6]

  // Six documents posted around the loop. The ribbon underneath names every one
  // of them, so the sketch only has to say what shape the work had.
  const docs_ = [
    { x: 70, y: 20 },
    { x: 140, y: 20 },
    { x: 210, y: 20 },
    { x: 210, y: 62 },
    { x: 140, y: 62 },
    { x: 70, y: 62 },
  ]

  return (
    <>
      <motion.path
        className="career-sketch__edge"
        d="M60 14 H260 A8 8 0 0 1 268 22 V74 A8 8 0 0 1 260 82 H60 A8 8 0 0 1 52 74 V22 A8 8 0 0 1 60 14 Z"
        pathLength={loop}
        style={{ pathLength: loop }}
      />
      {/* the cycle closing back on itself */}
      <motion.path
        className="career-sketch__edge"
        d="M52 52 V40 M48 44 L52 40 L56 44"
        pathLength={loop}
        style={{ pathLength: loop }}
      />

      {docs_.map((doc, i) => (
        <motion.g key={doc.x + '-' + doc.y} style={{ opacity: docs[i] }}>
          <motion.rect
            className="career-sketch__node"
            x={doc.x}
            y={doc.y}
            width={30}
            height={14}
            rx={3}
            style={{ opacity: docs[i] }}
          />
          <motion.path
            className="career-sketch__edge"
            d={`M${doc.x + 5} ${doc.y + 5} H${doc.x + 25} M${doc.x + 5} ${doc.y + 9} H${doc.x + 20}`}
            pathLength={docs[i]}
            style={{ pathLength: docs[i] }}
          />
        </motion.g>
      ))}

      <motion.text
        className="career-sketch__label career-sketch__label--strong"
        x={160}
        y={46}
        textAnchor="middle"
        style={{ opacity: centre }}
      >
        SAP S/4HANA
      </motion.text>
      <motion.text
        className="career-sketch__label"
        x={160}
        y={57}
        textAnchor="middle"
        style={{ opacity: centre }}
      >
        order to cash
      </motion.text>
    </>
  )
}

/**
 * Web development internship — four shipped interfaces, as four windows on one
 * line: the first time the work was something a person could open and use.
 */
function FourTasks({ value }: { value: MotionValue<number> }) {
  const w1 = useTransform(value, (v) => amount(v, 0.06, 0.26))
  const w2 = useTransform(value, (v) => amount(v, 0.26, 0.46))
  const w3 = useTransform(value, (v) => amount(v, 0.46, 0.66))
  const w4 = useTransform(value, (v) => amount(v, 0.66, 0.86))
  const rail = useTransform(value, (v) => amount(v, 0.86, 1))
  const windows = [w1, w2, w3, w4]

  const tasks = ['Calculator', 'Netflix', 'To-do', 'Connect four']

  return (
    <>
      {tasks.map((label, i) => {
        const x = 8 + i * 78
        return (
          <motion.g key={label} style={{ opacity: windows[i] }}>
            <motion.rect
              className="career-sketch__frame"
              x={x}
              y={14}
              width={58}
              height={44}
              rx={5}
              style={{ opacity: windows[i] }}
            />
            <motion.path
              className="career-sketch__edge"
              d={`M${x} 24 H${x + 58}`}
              pathLength={windows[i]}
              style={{ pathLength: windows[i] }}
            />
            {[0, 1, 2].map((d) => (
              <motion.circle
                key={d}
                className="career-sketch__dot"
                cx={x + 7 + d * 5}
                cy={19}
                r={1.3}
                style={{ opacity: windows[i] }}
              />
            ))}

            {i === 0 &&
              [0, 1, 2, 3].map((k) => (
                <motion.rect
                  key={k}
                  className="career-sketch__node"
                  x={x + 10 + (k % 2) * 13}
                  y={30 + Math.floor(k / 2) * 11}
                  width={10}
                  height={8}
                  rx={2}
                  style={{ opacity: windows[i] }}
                />
              ))}
            {i === 1 &&
              [0, 1, 2].map((k) => (
                <motion.rect
                  key={k}
                  className="career-sketch__node"
                  x={x + 8 + k * 15}
                  y={30}
                  width={11}
                  height={18}
                  rx={2}
                  style={{ opacity: windows[i] }}
                />
              ))}
            {i === 2 && (
              <>
                <motion.path
                  className="career-sketch__edge"
                  d={`M${x + 9} 33 H${x + 47} M${x + 9} 42 H${x + 38}`}
                  pathLength={windows[i]}
                  style={{ pathLength: windows[i] }}
                />
                <motion.path
                  className="career-sketch__edge"
                  d={`M${x + 9} 51 L${x + 13} 55 L${x + 22} 44`}
                  pathLength={windows[i]}
                  style={{ pathLength: windows[i] }}
                />
              </>
            )}
            {i === 3 &&
              [0, 1, 2, 3].map((k) => (
                <circle
                  key={k}
                  className={k === 1 ? 'career-sketch__dot' : 'career-sketch__edge'}
                  cx={x + 17 + (k % 2) * 20}
                  cy={34 + Math.floor(k / 2) * 16}
                  r={6}
                />
              ))}

            <motion.text
              className="career-sketch__label"
              x={x + 29}
              y={74}
              textAnchor="middle"
              style={{ opacity: windows[i] }}
            >
              {label}
            </motion.text>
          </motion.g>
        )
      })}

      {/* the line the four were shipped along */}
      <motion.path
        className="career-sketch__edge"
        d="M37 82 H283"
        pathLength={rail}
        style={{ pathLength: rail }}
      />
    </>
  )
}