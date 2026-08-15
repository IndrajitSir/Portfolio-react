import type { PersonalInfo, Language } from '@/types'

export const personalInfo: PersonalInfo = {
  name: 'Indrajit Mandal',
  title: 'Junior Software Developer',
  tagline: 'Backend engineer crafting high-performance APIs and optimizing complex database systems.',
  email: 'indrajitmandal779@gmail.com',
  phone: '+91 83910 15655',
  location: 'West Bengal, India',
  github: 'https://github.com/IndrajitSir',
  resumeUrl: 'https://drive.google.com/uc?export=download&id=1OY4IPF4XNAmpu0SH2cgLxl9mOcGqrK2U',
  available: true,
}

export const languages: Language[] = [
  { name: 'English', level: 'B2 Upper-Intermediate', flag: '🇬🇧' },
  { name: 'Bengali', level: 'Native', flag: '🇧🇩' },
  { name: 'Hindi', level: 'Fluent', flag: '🇮🇳' },
]
