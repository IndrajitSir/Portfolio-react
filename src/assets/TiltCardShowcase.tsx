import { FiBriefcase, FiBell, FiTerminal } from "react-icons/fi";
import {
  SiReact,
  SiNodedotjs,
  SiExpress,
  SiMysql,
  SiTypescript,
  SiWhatsapp,
  SiVite,
  SiTailwindcss,
  SiFramer,
} from "react-icons/si";
import TiltCard from "./TiltCard";

export default function TiltCardShowcase() {
  return (
    <div className="flex flex-nowrap justify-center gap-8 pb-8 pt-4 mr-4 ml-4 overflow-x-auto lg:justify-start lg:mr-0 lg:ml-0 lg:overflow-x-visible">
      <TiltCard
        title="Campus Placement"
        status="Full-stack"
        icon={FiBriefcase}
        orbit={[SiNodedotjs, SiExpress, SiMysql, SiReact, SiTypescript]}
        footer="Node · Express · MySQL"
      />
      <TiltCard
        title="Smart Alerts"
        status="Mobile"
        icon={FiBell}
        accent="var(--accent-orange)"
        orbit={[SiWhatsapp, SiNodedotjs, SiMysql, SiExpress]}
        footer="WhatsApp alert app"
      />
      <TiltCard
        title="This Portfolio"
        status="Live"
        icon={FiTerminal}
        accent="var(--accent-indigo)"
        orbit={[SiReact, SiTypescript, SiVite, SiTailwindcss, SiFramer]}
        footer="React · Vite · Framer Motion"
        href="https://github.com/IndrajitSir"
      />
    </div>
  );
}
