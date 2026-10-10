import { FiTerminal } from "react-icons/fi";
import type { Ref } from "react";

const drips = [
  { left: "16%", size: 8, delay: "0s" },
  { left: "46%", size: 9, delay: "0.35s" },
  { left: "72%", size: 8, delay: "0.15s" },
];

interface Props {
  onClick: () => void;
  onPointerEnter?: () => void;
  buttonRef?: Ref<HTMLButtonElement>;
}

export default function TerminalGoo({
  onClick,
  onPointerEnter,
  buttonRef,
}: Props) {
  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onClick}
      onPointerEnter={onPointerEnter}
      aria-label="Open interactive terminal"
      title="Open terminal"
      className="tg-root relative ml-auto h-[50px] w-[50px] shrink-0 cursor-pointer rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
      style={{ outlineColor: "var(--accent-teal)" }}
    >
      <div
        className="tg-root relative ml-auto h-[50px] w-[50px] shrink-0"
        aria-hidden="true"
      >
        {/* Goo filter: blur, then crush the alpha so touching shapes fuse */}
        <svg width="0" height="0" className="absolute cursor-pointer">
          <defs>
            <filter id="tg-goo" x="-30%" y="-30%" width="160%" height="190%">
              <feGaussianBlur
                in="SourceGraphic"
                stdDeviation="3.2"
                result="blur"
              />
              <feColorMatrix
                in="blur"
                mode="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10"
                result="goo"
              />
              <feComposite in="SourceGraphic" in2="goo" operator="atop" />
            </filter>
          </defs>
        </svg>

        {/* Tile border (not filtered, so it stays crisp) */}
        <span
          className="absolute inset-0 rounded-xl border-2"
          style={{
            borderColor: "var(--accent-teal)",
            boxShadow: "0 0 18px var(--glow-teal)",
          }}
        />

        {/* Gooey layer: liquid body + drips */}
        <div className="absolute inset-0" style={{ filter: "url(#tg-goo)" }}>
          <div className="absolute inset-0 overflow-hidden rounded-xl">
            <div className="tg-level absolute inset-x-0 top-0 h-full">
              {/* wave crest */}
              <div className="tg-wave-clip absolute inset-x-0 -top-[11px] h-[12px] overflow-hidden">
                <svg
                  className="tg-wave h-full w-[200%]"
                  viewBox="0 0 120 12"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0 6 Q15 0 30 6 T60 6 T90 6 T120 6 V12 H0Z"
                    fill="var(--accent-teal)"
                  />
                </svg>
              </div>
              <div
                className="h-full w-full"
                style={{ background: "var(--accent-teal)" }}
              />
            </div>
          </div>

          {drips.map((d, i) => (
            <span
              key={i}
              className="tg-drip absolute rounded-full"
              style={{
                left: d.left,
                top: "calc(100% - 10px)",
                width: d.size,
                height: d.size,
                animationDelay: d.delay,
                background: "var(--accent-teal)",
              }}
            />
          ))}
        </div>

        {/* Icon sits on top and flips colour as the liquid covers it */}
        <span className="tg-icon absolute inset-0 flex items-center justify-center cursor-pointer">
          <FiTerminal size={28} />
        </span>
      </div>
    </button>
  );
}