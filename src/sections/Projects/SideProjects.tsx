import { motion } from 'framer-motion'
import { staggerContainer, fadeInUp } from '@/utils/animations'
import { sideProjects } from '@/data'
import SideProjectCard from './SideProjectCard'

/**
 * Side Projects — smaller experiments kept visually connected to the main
 * portfolio but presented more compactly. The grid is intentionally asymmetric:
 * two cards share the first row and the playable Bubble Game spans the second,
 * so the layout still reads well as more side projects are added.
 */
export default function SideProjects() {
  return (
    <div id="side-projects" className="mt-20">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <span className="block h-px w-6" style={{ background: 'var(--accent-indigo)' }} />
            <span className="font-mono-code text-xs uppercase tracking-widest" style={{ color: 'var(--accent-indigo)' }}>
              Side Projects
            </span>
          </div>
          <h3
            className="font-display text-[clamp(1.4rem,2.6vw,2rem)] font-light leading-tight tracking-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            The{' '}
            <em className="not-italic" style={{ color: 'var(--accent-indigo)' }}>
              side lab
            </em>
          </h3>
          <p className="mt-2 max-w-xl text-sm leading-[1.7]" style={{ color: 'var(--text-secondary)' }}>
            Smaller experiments — a graph canvas, a virtual try-on pipeline, and a game. Hover or tap the
            previews to explore them.
          </p>
        </div>
        <span className="font-mono-code text-[0.68rem]" style={{ color: 'var(--text-muted)' }}>
          {String(sideProjects.length).padStart(2, '0')} projects
        </span>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        className="grid grid-cols-1 gap-5 lg:grid-cols-12"
      >
        {sideProjects.map((project, i) => {
          const wide = project.layout === 'wide'
          return (
            <motion.div
              key={project.id}
              variants={fadeInUp}
              transition={{ delay: i * 0.08 }}
              className={
                wide
                  ? 'lg:col-span-12'
                  : i % 2 === 0
                    ? 'lg:col-span-5'
                    : 'lg:col-span-7'
              }
            >
              <SideProjectCard project={project} />
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
