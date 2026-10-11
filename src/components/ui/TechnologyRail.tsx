import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { IconType } from "react-icons";
import {
  FiArrowUpRight,
  FiChevronLeft,
  FiChevronRight,
  FiCode,
  FiGrid,
} from "react-icons/fi";
import type { SkillEvidence } from "@/types";
import { DURATION, EASE_OUT_EXPO, REVEAL_VIEWPORT } from "@/utils/motion";
import { noiseDataUrl } from "@/utils/noise";
import { CATEGORY_ICONS, DOMAIN_ACCENT, iconFor } from "@/data/skillIcons";
import { TiltLayer, TiltSurface } from "@/components/ui/TiltSurface";
import { EVIDENCE_STYLE } from "./evidenceStyles";
import type { SkillDomain } from "./SkillConstellation";

/**
 * Every technology, and where it is demonstrated, as a rail of tilt cards.
 *
 * Rules this keeps:
 *  - Nothing autoplays, loops or animates on a timer. Motion is a one-time
 *    entrance, the hover tilt, and a scroll-linked "focus" (scale + brightness
 *    by distance from the centre).
 *  - The focus, counter, progress bar and glow colour are all written straight
 *    to the DOM from one rAF-throttled scroll handler. Cards never re-render
 *    while scrolling; the edge buttons only re-render when their state flips.
 *  - Horizontal scrolling never fights the page: the rail carries
 *    `data-lenis-prevent`, and vertical swipes still scroll the page.
 *  - Cards share one noise bitmap instead of 50 SVG filters, and their depth
 *    layers stay flat until hovered (see the CSS), so ~50 cards stay cheap.
 */

interface TechnologyRailProps {
  domains: SkillDomain[];
}

interface TechCard {
  name: string;
  domainId: string;
  domainTitle: string;
  Icon: IconType;
  DomainIcon: IconType;
  accent: string;
  evidence: SkillEvidence[];
}

/** Flatten the domains into one card per technology, preserving the data order. */
function buildCards(domains: SkillDomain[]): TechCard[] {
  return domains.flatMap((domain) =>
    domain.items.map((item) => ({
      name: item.name,
      domainId: domain.id,
      domainTitle: domain.title,
      Icon: iconFor(item.name),
      DomainIcon: CATEGORY_ICONS[domain.id] ?? FiCode,
      accent: DOMAIN_ACCENT[domain.id] ?? "var(--accent-teal)",
      evidence: item.evidence,
    })),
  );
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.reveal, ease: EASE_OUT_EXPO },
  },
};

const pad = (n: number) => String(n).padStart(2, "0");

/** How far from the rail's centre (as a fraction of its width) a card still counts as focused. */
const FOCUS_RANGE = 0.62;

export default function TechnologyRail({ domains }: TechnologyRailProps) {
  const reduceMotion = useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLUListElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const rafRef = useRef(0);
  const lastFocus = useRef(-1);
  const drag = useRef({ down: false, moved: false, startX: 0, startLeft: 0 });
  const suppressClick = useRef(false);

  const [filter, setFilter] = useState<string>("all");
  const [edges, setEdges] = useState<{ start: boolean; end: boolean }>({
    start: true,
    end: false,
  });

  const noise = useMemo(() => noiseDataUrl(), []);
  const cards = useMemo(() => buildCards(domains), [domains]);
  const visible = useMemo(
    () =>
      filter === "all" ? cards : cards.filter((c) => c.domainId === filter),
    [cards, filter],
  );

  const filters = useMemo<{ id: string; label: string; Icon: IconType }[]>(
    () => [
      { id: "all", label: "All", Icon: FiGrid },
      ...domains.map((d) => ({
        id: d.id,
        label: d.short,
        Icon: CATEGORY_ICONS[d.id] ?? FiCode,
      })),
    ],
    [domains],
  );

  const activeDomain =
    filter === "all" ? null : (domains.find((d) => d.id === filter) ?? null);

  /** Read the rail once; write focus, counter, glow and progress to the DOM, not state. */
  const sync = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;

    const max = rail.scrollWidth - rail.clientWidth;
    const progress = max > 0 ? rail.scrollLeft / max : 0;
    if (fillRef.current)
      fillRef.current.style.transform = `scaleX(${Math.max(progress, 0.02)})`;

    const start = rail.scrollLeft <= 4;
    const end = max <= 4 || rail.scrollLeft >= max - 4;
    setEdges((prev) =>
      prev.start === start && prev.end === end ? prev : { start, end },
    );

    // Focus: distance of every card from the rail's centre.
    const items = rail.querySelectorAll<HTMLElement>("[data-card]");
    if (!items.length) return;
    const mid = rail.scrollLeft + rail.clientWidth / 2;
    const span = rail.clientWidth * FOCUS_RANGE;
    let best = 0;
    let bestF = -1;
    items.forEach((el, i) => {
      const d = Math.abs(el.offsetLeft + el.offsetWidth / 2 - mid);
      const f = Math.max(0, 1 - d / span);
      el.style.setProperty("--f", f.toFixed(3));
      if (f > bestF) {
        bestF = f;
        best = i;
      }
    });

    if (best !== lastFocus.current) {
      lastFocus.current = best;
      if (counterRef.current)
        counterRef.current.textContent = `${pad(best + 1)} / ${pad(items.length)}`;
      const accent = items[best].dataset.accent;
      if (accent) stageRef.current?.style.setProperty("--rail-accent", accent);
    }
  }, []);

  const onScroll = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      sync();
    });
  }, [sync]);

  // Re-measure when the card set changes and when the rail is resized.
  useEffect(() => {
    lastFocus.current = -1;
    sync();
  }, [visible, sync]);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const ro = new ResizeObserver(sync);
    ro.observe(rail);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, [sync]);

  /** Move by roughly one card. Snapping does the rest. */
  const nudge = useCallback(
    (dir: 1 | -1) => {
      const rail = railRef.current;
      if (!rail) return;
      const card = rail.querySelector<HTMLElement>("[data-card]");
      const amount = card ? card.offsetWidth + 20 : rail.clientWidth * 0.8;
      rail.scrollBy({
        left: amount * dir,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    },
    [reduceMotion],
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLUListElement>) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        nudge(1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        nudge(-1);
      }
    },
    [nudge],
  );

  const onFilter = (id: string) => {
    setFilter(id);
    requestAnimationFrame(() =>
      railRef.current?.scrollTo({ left: 0, behavior: "auto" }),
    );
  };

  /* ── Drag to scroll (mouse only; touch and trackpad scroll natively) ──
     Pointer capture starts only after a 6px move, so a plain click on an
     evidence link is never swallowed. Snap is switched off while dragging
     (CSS) and re-engages on release. */
  const onPointerDown = (e: ReactPointerEvent<HTMLUListElement>) => {
    if (e.pointerType !== "mouse" || e.button !== 0 || !railRef.current) return;
    drag.current = {
      down: true,
      moved: false,
      startX: e.clientX,
      startLeft: railRef.current.scrollLeft,
    };
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLUListElement>) => {
    const d = drag.current;
    const rail = railRef.current;
    if (!d.down || !rail) return;
    const dx = e.clientX - d.startX;
    if (!d.moved) {
      if (Math.abs(dx) < 6) return;
      d.moved = true;
      rail.dataset.dragging = "true";
      rail.setPointerCapture(e.pointerId);
    }
    rail.scrollLeft = d.startLeft - dx;
  };
  const endDrag = (e: ReactPointerEvent<HTMLUListElement>) => {
    const d = drag.current;
    const rail = railRef.current;
    if (!d.down) return;
    d.down = false;
    if (d.moved && rail) {
      suppressClick.current = true;
      window.setTimeout(() => {
        suppressClick.current = false;
      }, 0);
      delete rail.dataset.dragging;
      if (rail.hasPointerCapture(e.pointerId))
        rail.releasePointerCapture(e.pointerId);
    }
  };
  const onClickCapture = (e: ReactMouseEvent) => {
    if (suppressClick.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const btn =
    "flex h-9 w-9 items-center justify-center rounded-full border transition-colors duration-200 disabled:opacity-30 enabled:hover:border-[var(--accent-teal)] enabled:hover:text-[var(--accent-teal)]";

  return (
    <div>
      {/* ── Toolbar ─────────────────────────────────────────────── */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div
          role="group"
          aria-label="Filter technologies by domain"
          className="flex flex-wrap gap-1.5"
        >
          {filters.map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                aria-pressed={active}
                onClick={() => onFilter(f.id)}
                className="relative flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono-code text-[0.62rem] uppercase tracking-wide transition-colors duration-200"
                style={{
                  borderColor: active ? "transparent" : "var(--border)",
                  background: active ? "transparent" : "var(--surface)",
                  color: active
                    ? "var(--accent-teal)"
                    : "var(--text-secondary)",
                }}
              >
                {active && (
                  <motion.span
                    layoutId="tr-filter-pill"
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full border"
                    style={{
                      background: "var(--glow-teal)",
                      borderColor: "var(--accent-teal)",
                    }}
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 420, damping: 34 }
                    }
                  />
                )}
                <f.Icon size={12} aria-hidden="true" className="relative" />
                <span className="relative">{f.label}</span>
              </button>
            );
          })}
        </div>

        <div className="ml-auto flex items-center gap-3">
          <span
            className="hidden font-mono-code text-[0.62rem] sm:inline"
            style={{ color: "var(--text-muted)" }}
          >
            <span
              ref={counterRef}
              className="tabular-nums"
              style={{ color: "var(--accent-teal)" }}
            />{" "}
            · drag or scroll
          </span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => nudge(-1)}
              disabled={edges.start}
              aria-label="Previous technologies"
              className={btn}
              style={{
                borderColor: "var(--border)",
                background: "var(--surface)",
                color: "var(--text-secondary)",
              }}
            >
              <FiChevronLeft size={15} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => nudge(1)}
              disabled={edges.end}
              aria-label="More technologies"
              className={btn}
              style={{
                borderColor: "var(--border)",
                background: "var(--surface)",
                color: "var(--text-secondary)",
              }}
            >
              <FiChevronRight size={15} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <p
        className="mb-2 max-w-[70ch] text-[0.78rem] leading-[1.6]"
        style={{ color: "var(--text-muted)" }}
      >
        {activeDomain?.summary ??
          "Each technology sits under the domain it serves, with the project, role or credential that demonstrates it. Pick a domain to filter, or scroll the rail."}
      </p>

      {/* ── The rail ──────────────────────────────────────────────── */}
      <div
        ref={stageRef}
        className="tr-stage relative"
        style={{ "--tc-noise": noise } as CSSProperties}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 transition-opacity duration-300"
          style={{
            background:
              "linear-gradient(to left, var(--bg-primary), transparent)",
            opacity: edges.end ? 0 : 1,
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 transition-opacity duration-300"
          style={{
            background:
              "linear-gradient(to right, var(--bg-primary), transparent)",
            opacity: edges.start ? 0 : 1,
          }}
        />

        <ul
          ref={railRef}
          data-lenis-prevent
          tabIndex={0}
          onScroll={onScroll}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onPointerLeave={endDrag}
          onClickCapture={onClickCapture}
          aria-label="Technology cards"
          className="tr-rail no-scrollbar relative flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-8 pt-5"
          // First and last card can rest in the centre, where the focus effect lives.
          style={{
            paddingInline: "calc(50% - min(40vw, 155px))",
            scrollbarGutter: "stable",
          }}
        >
          {visible.map((card, i) => (
            <TechnologyCard
              key={`${card.domainId}-${card.name}`}
              card={card}
              index={i}
              reduceMotion={!!reduceMotion}
            />
          ))}
        </ul>

        <div
          className="mx-auto mt-1 h-0.5 w-full max-w-[420px] overflow-hidden rounded-full"
          style={{ background: "var(--border)" }}
        >
          <span
            ref={fillRef}
            className="block h-full origin-left rounded-full"
            style={{
              background: "var(--accent-teal)",
              transform: "scaleX(0.02)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * One technology card. Memoised: a filter change re-renders the rail, and the
 * cards that survive have identical props, so they skip entirely.
 */
const TechnologyCard = memo(function TechnologyCard({
  card,
  index,
  reduceMotion,
}: {
  card: TechCard;
  index: number;
  reduceMotion: boolean;
}) {
  const { Icon, DomainIcon, accent } = card;
  const places = card.evidence.length;

  return (
    <motion.li
      data-card
      data-accent={accent}
      variants={reduceMotion ? undefined : cardVariants}
      initial={reduceMotion ? false : "hidden"}
      whileInView={reduceMotion ? undefined : "visible"}
      viewport={{ ...REVEAL_VIEWPORT, margin: "0px 0px -40px 0px" }}
      transition={
        reduceMotion ? undefined : { delay: Math.min(index, 6) * 0.03 }
      }
      className="w-[min(80vw,310px)] shrink-0 snap-center"
    >
      {/* --f (0–1) is written onto the <li> by the rail's scroll handler. */}
      <div className="tr-focus">
        <TiltSurface
          accent={accent}
          maxTilt={7}
          grain="bitmap"
          cardClassName="flex h-[410px] flex-col p-5"
        >
          {/* Watermark: clipped to the card, flat at the back */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl"
          >
            <Icon
              size={210}
              className="absolute -bottom-10 -right-10"
              style={{ color: "var(--tc-accent)", opacity: 0.06 }}
            />
          </div>

          {/* Domain + index */}
          <TiltLayer z={30}>
            <div className="flex items-center justify-between">
              <span
                className="flex items-center gap-1.5 font-mono-code text-[0.58rem] uppercase tracking-widest"
                style={{ color: "var(--tc-accent)" }}
              >
                <DomainIcon size={12} aria-hidden="true" />
                {card.domainTitle}
              </span>
              <span
                className="font-mono-code text-[0.6rem] tabular-nums"
                style={{ color: "var(--text-muted)" }}
              >
                {pad(index + 1)}
              </span>
            </div>
          </TiltLayer>

          {/* Icon badge (closest to you) + name */}
          <div className="tc-3d mt-5 flex items-center gap-4">
            <TiltLayer z={86} className="shrink-0">
              <span className="tc-badge flex h-16 w-16 items-center justify-center rounded-2xl">
                <Icon size={28} aria-hidden="true" />
              </span>
            </TiltLayer>
            <TiltLayer z={52} className="min-w-0">
              <h3
                className="font-display text-xl font-light leading-tight"
                style={{ color: "var(--text-primary)" }}
              >
                {card.name}
              </h3>
              <p
                className="mt-1.5 flex items-center gap-1.5 font-mono-code text-[0.56rem] uppercase tracking-widest"
                style={{ color: "var(--text-muted)" }}
              >
                <span aria-hidden="true" className="flex gap-0.5">
                  {card.evidence.map((_, i) => (
                    <span
                      key={i}
                      className="h-1 w-1 rounded-full"
                      style={{ background: "var(--tc-accent)" }}
                    />
                  ))}
                </span>
                {places} place{places === 1 ? "" : "s"}
              </p>
            </TiltLayer>
          </div>

          <TiltLayer z={20} className="mt-5">
            <div className="flex items-center gap-2">
              <span
                className="font-mono-code text-[0.54rem] uppercase tracking-widest"
                style={{ color: "var(--text-muted)" }}
              >
                Demonstrated in
              </span>
              <span
                className="h-px flex-1"
                style={{ background: "var(--border)" }}
              />
            </div>
          </TiltLayer>

          {/* Evidence: the layer ignores the pointer, the list opts back in */}
          <TiltLayer z={26} className="mt-2.5 flex min-h-0 flex-1 flex-col">
            <ul className="tr-live flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overscroll-contain pr-1">
              {card.evidence.map((evidence, i) => (
                <li key={`${evidence.label}-${i}`}>
                  <EvidenceLink evidence={evidence} />
                </li>
              ))}
            </ul>
          </TiltLayer>
        </TiltSurface>
      </div>
    </motion.li>
  );
});

/** One piece of evidence, as a full-width, always-visible row. */
function EvidenceLink({ evidence }: { evidence: SkillEvidence }) {
  const style = EVIDENCE_STYLE[evidence.kind];
  const external = evidence.href ? !evidence.href.startsWith("#") : false;
  const hasHref = !!evidence.href;

  const inner: ReactNode = (
    <>
      <span style={{ color: style.color }} aria-hidden="true">
        {style.glyph}
      </span>
      <span
        className="flex-1 text-[0.76rem] leading-snug"
        style={{ color: "var(--text-secondary)" }}
      >
        {evidence.label}
      </span>
      {hasHref && (
        <FiArrowUpRight
          size={12}
          aria-hidden="true"
          className="mt-0.5 shrink-0 opacity-60"
        />
      )}
    </>
  );

  const className =
    "tr-ev flex items-start gap-2 rounded-lg border px-2.5 py-1.5";

  if (!hasHref) {
    return (
      <span className={className} style={{ borderColor: "var(--border)" }}>
        {inner}
      </span>
    );
  }

  return (
    <a
      href={evidence.href}
      draggable={false}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={className}
      style={{ borderColor: "var(--border)" }}
    >
      {inner}
      <span className="sr-only">
        {evidence.kind} {external ? "(opens in a new tab)" : ""}
      </span>
    </a>
  );
}
