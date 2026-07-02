import { SectionLabel } from '@/components/ui'
import { projects } from '@/data'
import ProjectCard from './ProjectCard'

export default function Projects() {
  return (
    <section
      id="projects"
      aria-label="Projects section"
      style={{ background: 'var(--bg-primary)' }}
    >
      <div className="max-container section-padding">
        <SectionLabel
          index="04"
          label="Work"
          title="Featured"
          titleAccent="projects"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
          {projects.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
