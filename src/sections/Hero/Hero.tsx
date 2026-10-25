import { lazy, Suspense, useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { FiArrowDown, FiArrowRight, FiArrowUpRight } from "react-icons/fi";
import { personalInfo, journeyChapters } from "@/data";
import { scrollToSection } from "@/utils";
import InteractiveBackground from "@/components/ui/InteractiveBackground";
import AnimatedMetrics from "@/components/ui/AnimatedMetrics";
// import CoreKernelPanel from "@/components/ui/CoreKernelPanel";
import ScrollIndicator from "@/components/ui/ScrollIndicator";
import MagneticButton from "@/components/ui/MagneticButton";
import HeroIdentity from "./HeroIdentity";
import HeroBackdrop from "./HeroBackdrop";

// The planet builds its own Three.js scene, so it is deferred rather than
// pulled into the entry chunk: the hero paints first, the planet arrives after.
const HeroSaturn = lazy(() => import("./HeroSaturn"));

const EASE = [0.22, 1, 0.36, 1] as const;

/** Slim system telemetry strip that frames the hero like a runtime dashboard. */
function TelemetryStrip() {
  // const reduceMotion = useReducedMotion();
  return (
    <></>
    // <motion.div
    //   initial={reduceMotion ? undefined : { opacity: 0 }}
    //   animate={{ opacity: 1 }}
    //   transition={{ duration: 0.7 }}
    //   className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-3 font-mono-code text-[0.6rem] uppercase tracking-[0.16em]"
    //   style={{ color: "var(--text-muted)" }}
    // >
    //   <span className="flex items-center gap-2">
    //     <span
    //       className="h-1.5 w-1.5 rounded-full"
    //       style={{ background: "var(--accent-teal)" }}
    //       aria-hidden="true"
    //     />
    //     Location: {personalInfo.location} // Remote-capable
    //   </span>
    //   <span className="hidden items-center gap-3 sm:flex">
    //     <span className="flex items-center gap-1.5">
    //       <span
    //         className="h-1.5 w-1.5 rounded-full"
    //         style={{ background: "var(--accent-indigo)" }}
    //         aria-hidden="true"
    //       />
    //       Runtime: v3.8.2-prod
    //     </span>
    //     <span style={{ color: "var(--border)" }} aria-hidden="true">
    //       |
    //     </span>
    //     <span>System state: nominal</span>
    //     <span style={{ color: "var(--border)" }} aria-hidden="true">
    //       |
    //     </span>
    //     <span>Latency: 14ms (p99)</span>
    //   </span>
    // </motion.div>
  );
}

export default function Hero() {
  const reduceMotion = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);

  // As the hero scrolls away, the backdrop recedes slightly — a gentle
  // hand-off into the About section rather than an abrupt cut.
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const backdropOpacity = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [1, 0.5, 0],
  );
  const backdropY = useTransform(scrollYProgress, [0, 1], [0, -60]);

  return (
    <section
      ref={heroRef}
      id="hero"
      className="relative flex min-h-[100svh] items-center overflow-hidden"
      style={{ background: "var(--bg-primary)" }}
      aria-label="Hero section"
    >
      {/* ── The photograph ─────────────────────────────────────── */}
      {/* The cinematic portrait is the hero's background, full-bleed. It sits
          under everything else and recedes with the scroll, so the section
          below starts from black rather than from a picture. */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-0"
        aria-hidden="true"
        style={
          reduceMotion ? undefined : { opacity: backdropOpacity, y: backdropY }
        }
      >
        <HeroBackdrop />
      </motion.div>

      {/* Interactive generative environment */}
      <InteractiveBackground opacity={0.5} />

      {/* Particle planet, anchored in the top-right corner behind the content */}
      <Suspense fallback={null}>
        <HeroSaturn />
      </Suspense>

      {/* Ambient glow fields that anchor the composition */}
      <div
        className="pointer-events-none absolute inset-0 z-[1] overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="absolute -left-40 -top-40 h-[560px] w-[560px] rounded-full opacity-[0.06] blur-[140px]"
          style={{ background: "var(--accent-teal)" }}
        />
        <div
          className="absolute -right-40 top-1/3 h-[520px] w-[520px] rounded-full opacity-[0.05] blur-[150px]"
          style={{ background: "var(--accent-indigo)" }}
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-6 py-24 md:px-12 xl:px-16">
        <TelemetryStrip />

        {/* ── Hero grid ─────────────────────────────────────────── */}
        {/* Two columns: the identity reads first, the instrument answers the
            question it raises. The photograph sits behind both. */}
        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)] lg:items-start lg:gap-12">
          {/* Left: identity, actions, metrics */}
          <div className="flex flex-col gap-4">
            <HeroIdentity />

            {/* Action cluster */}
            <motion.div
              initial={reduceMotion ? undefined : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1.05, ease: EASE }}
              className="flex flex-wrap items-center gap-2 sm:gap-3"
            >
              {/* Primary CTA */}
              <MagneticButton
                href="#projects"
                onClick={(e) => {
                  e?.preventDefault();
                  scrollToSection("projects");
                }}
                className="
                  group relative inline-flex items-center gap-2 overflow-hidden rounded-lg
                  bg-[linear-gradient(110deg,var(--accent-teal),var(--accent-indigo),var(--accent-teal))]
                  bg-[length:200%_100%] bg-left px-5 py-3
                  font-mono-code text-[0.72rem] font-semibold uppercase tracking-wider
                  text-[var(--bg-primary)] shadow-[0_0_24px_var(--glow-teal)]
                  transition-[background-position,transform,box-shadow] duration-500
                  hover:-translate-y-0.5 hover:bg-right hover:shadow-[0_0_36px_var(--glow-teal)]
                "
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg"
                >
                  <span className="absolute inset-y-0 w-1/3 -translate-x-[160%] -skew-x-12 bg-white/30 transition-transform duration-700 ease-out group-hover:translate-x-[420%]" />
                </span>
                <span className="relative z-10">Explore My Work</span>
                <FiArrowRight
                  size={15}
                  aria-hidden="true"
                  className="relative z-10 transition-transform duration-300 group-hover:translate-x-1"
                />
              </MagneticButton>

              {/* Secondary CTA */}
              {personalInfo.resumeUrl && (
                <MagneticButton
                  href={personalInfo.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Download resume PDF"
                  className="
                    group inline-flex items-center gap-2 rounded-lg border border-[var(--border)]
                    bg-[var(--surface)] px-4 py-3 font-mono-code text-[0.72rem] uppercase
                    tracking-wider text-[var(--text-primary)] backdrop-blur-md
                    transition-colors duration-200
                    hover:border-[var(--accent-teal)] hover:text-[var(--accent-teal)]
                  "
                >
                  <FiArrowDown
                    size={15}
                    aria-hidden="true"
                    className="transition-transform duration-200 group-hover:translate-y-0.5"
                  />
                  Resume
                  <span
                    className="text-[0.58rem]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    PDF
                  </span>
                </MagneticButton>
              )}

              {/* Tertiary action */}
              <MagneticButton
                href="#contact"
                strength={0.14}
                onClick={(e) => {
                  e?.preventDefault();
                  scrollToSection("contact");
                }}
                className="
                  group inline-flex items-center gap-1.5 shrink-0 px-2 py-2 font-mono-code text-[0.68rem]
                  uppercase tracking-wider text-[var(--text-secondary)]
                  transition-colors duration-200 hover:text-[var(--accent-teal)]
                "
              >
                <span style={{ color: "var(--text-muted)" }} aria-hidden="true">
                  01 //
                </span>
                <span className="relative">
                  Get in Touch
                  <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-[var(--accent-teal)] transition-all duration-300 group-hover:w-full" />
                </span>
                <FiArrowUpRight
                  size={13}
                  aria-hidden="true"
                  className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </MagneticButton>
            </motion.div>

            {/* ── Integrated engineering metrics ───────────────── */}
            <motion.div
              initial={reduceMotion ? undefined : { opacity: 0, y: 16 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.65, ease: EASE }}
              className="mt-3 space-y-1.5"
            >
              <AnimatedMetrics />
            </motion.div>
          </div>

          {/* Right — the core kernel readout */}
          {/* <motion.div
            initial={reduceMotion ? undefined : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.5, ease: EASE }}
            className="lg:sticky lg:top-28"
          >
            <CoreKernelPanel />
          </motion.div> */}
        </div>

        {/* ── Journey doorway ──────────────────────────────────────── */}
        {/* The hero's job is to point both audiences somewhere: recruiters get
            the CTAs above, first-time visitors get a way into the narrative. */}
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 18 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, ease: EASE }}
          className="mt-6"
        >
          <a
            href="#journey"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("journey");
            }}
            className="group flex w-full flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border px-4 py-3 transition-colors duration-300 hover:border-[var(--accent-teal)]"
            style={{
              borderColor: "var(--border)",
              background: "var(--surface)",
            }}
          >
            <span
              className="font-mono-code text-[0.62rem] uppercase tracking-widest"
              style={{ color: "var(--accent-teal)" }}
            >
              New here?
            </span>
            <span
              className="text-[0.85rem]"
              style={{ color: "var(--text-secondary)" }}
            >
              Start at Chapter I — {journeyChapters.length} documented chapters
              from the first Java badge to a package on npm.
            </span>
            <FiArrowDown
              size={14}
              aria-hidden="true"
              className="ml-auto transition-transform duration-300 group-hover:translate-y-0.5"
              style={{ color: "var(--text-muted)" }}
            />
          </a>
        </motion.div>
      </div>

      <ScrollIndicator targetId="whale" label="Scroll to assemble" />
    </section>
  );
}
