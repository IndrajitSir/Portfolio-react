export const terminalData = {
  name: 'Indrajit Mandal',
  handle: 'IndrajitSir',
  role: 'Junior Software Developer',
  company: 'Distronix',
  location: 'West Bengal, India',
  bio: [
    'Junior software developer focused on backend databases and API development.',
    'Started my tech journey through SAP S/4HANA (SD module) and transitioned into building full-stack web apps.',
    'I care about maintainable architecture, clean data flow, and polished UI — this portfolio is proof of that.',
  ],
  skills: {
    Frontend: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Framer Motion', 'GSAP', 'Three.js'],
    Backend: ['Node.js', 'Express', 'REST APIs'],
    Database: ['MySQL'],
    Enterprise: ['SAP S/4HANA (SD)'],
  } as Record<string, string[]>,
  experience: [
    {
      role: 'Junior Software Developer',
      company: 'Distronix',
      period: 'May 2026 – Present',
      points: [
        'Backend database design and optimisation',
        'REST API development and integration',
      ],
    },
    {
      role: 'SAP Officer Trainee',
      company: 'Jai Balaji Industries',
      period: '2025 – 2026',
      points: ['Worked in the SAP S/4HANA SD module — order-to-cash processes and master data management'],
    },
  ],
  education: [
    { degree: 'BCA', school: 'RICIS Institution', affiliation: 'Kazi Nazrul University' },
  ],
  projects: [
    {
      name: 'Campus Placement Recruitment System',
      stack: 'Node.js · Express · MySQL',
      desc: 'Full-stack placement management platform to streamline campus recruitment — student profiles, job postings, and application tracking.',
      link: 'https://github.com/IndrajitSir/Frontend-Campus-Placement-Portal-',
    },
    {
      name: 'WhatsApp Smart Alert App',
      stack: 'Node.js · WhatsApp Cloud API',
      desc: 'Automated smart alert system that delivers real-time notifications and updates over WhatsApp.',
      link: 'https://github.com/IndrajitSir/WhatsAlarm-clean',
    },
    {
      name: 'This Portfolio',
      stack: 'React · TypeScript · Vite · Tailwind · R3F · Framer Motion',
      desc: 'The interactive portfolio site you are exploring right now — 3D scenes, physics, and a working terminal.',
      link: 'https://github.com/IndrajitSir/Portfolio-react',
    },
  ],
  contact: {
    email: 'indrajitmandal779@gmail.com',
    github: 'https://github.com/IndrajitSir',
    linkedin: 'https://www.linkedin.com/in/indrajit-mandal-34a9842a5/',
  },
};