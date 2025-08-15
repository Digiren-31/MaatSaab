import type { TargetExamination, EducationLevel } from './types';

export const EDUCATION_LEVELS: { value: EducationLevel; label: string }[] = [
  { value: 'primary', label: 'Primary (1-5)' },
  { value: 'junior-high', label: 'Junior High School (6-8)' },
  { value: 'high-school', label: 'High School (9-10)' },
  { value: 'intermediate', label: 'Intermediate (11-12)' },
  { value: 'graduation', label: 'Graduation' },
  { value: 'post-graduation', label: 'Post Graduation' },
];

export const TARGET_EXAMINATIONS: TargetExamination[] = [
  // Primary Level
  {
    id: 'nso-primary',
    name: 'NSO (Primary)',
    description: 'National Science Olympiad for Primary students',
    educationLevels: ['primary']
  },
  {
    id: 'nmo-primary',
    name: 'NMO (Primary)',
    description: 'National Mathematics Olympiad for Primary students',
    educationLevels: ['primary']
  },
  {
    id: 'imo-primary',
    name: 'IMO (Primary)',
    description: 'International Mathematics Olympiad for Primary students',
    educationLevels: ['primary']
  },
  
  // Junior High School Level
  {
    id: 'ntse',
    name: 'NTSE',
    description: 'National Talent Search Examination',
    educationLevels: ['junior-high']
  },
  {
    id: 'nso-junior',
    name: 'NSO (Junior)',
    description: 'National Science Olympiad for Junior High students',
    educationLevels: ['junior-high']
  },
  {
    id: 'nmo-junior',
    name: 'NMO (Junior)',
    description: 'National Mathematics Olympiad for Junior High students',
    educationLevels: ['junior-high']
  },
  {
    id: 'ijso',
    name: 'IJSO',
    description: 'International Junior Science Olympiad',
    educationLevels: ['junior-high']
  },
  
  // High School Level
  {
    id: 'kvpy',
    name: 'KVPY',
    description: 'Kishore Vaigyanik Protsahan Yojana',
    educationLevels: ['high-school', 'intermediate']
  },
  {
    id: 'nso-high',
    name: 'NSO (High School)',
    description: 'National Science Olympiad for High School students',
    educationLevels: ['high-school']
  },
  {
    id: 'nmo-high',
    name: 'NMO (High School)',
    description: 'National Mathematics Olympiad for High School students',
    educationLevels: ['high-school']
  },
  {
    id: 'prmo',
    name: 'PRMO',
    description: 'Pre-Regional Mathematical Olympiad',
    educationLevels: ['high-school', 'intermediate']
  },
  {
    id: 'ioqm',
    name: 'IOQM',
    description: 'Indian Olympiad Qualifier in Mathematics',
    educationLevels: ['high-school', 'intermediate']
  },
  
  // Intermediate Level
  {
    id: 'jee-main',
    name: 'JEE Main',
    description: 'Joint Entrance Examination (Main)',
    educationLevels: ['intermediate']
  },
  {
    id: 'jee-advanced',
    name: 'JEE Advanced',
    description: 'Joint Entrance Examination (Advanced)',
    educationLevels: ['intermediate']
  },
  {
    id: 'neet',
    name: 'NEET',
    description: 'National Eligibility Cum Entrance Test',
    educationLevels: ['intermediate']
  },
  {
    id: 'bitsat',
    name: 'BITSAT',
    description: 'Birla Institute of Technology and Science Admission Test',
    educationLevels: ['intermediate']
  },
  {
    id: 'viteee',
    name: 'VITEEE',
    description: 'VIT Engineering Entrance Examination',
    educationLevels: ['intermediate']
  },
  {
    id: 'comedk',
    name: 'COMEDK UGET',
    description: 'Consortium of Medical Engineering and Dental Colleges',
    educationLevels: ['intermediate']
  },
  {
    id: 'kcet',
    name: 'KCET',
    description: 'Karnataka Common Entrance Test',
    educationLevels: ['intermediate']
  },
  {
    id: 'mhtcet',
    name: 'MHT CET',
    description: 'Maharashtra Common Entrance Test',
    educationLevels: ['intermediate']
  },
  {
    id: 'inmo',
    name: 'INMO',
    description: 'Indian National Mathematical Olympiad',
    educationLevels: ['intermediate']
  },
  
  // Graduation Level
  {
    id: 'gate',
    name: 'GATE',
    description: 'Graduate Aptitude Test in Engineering',
    educationLevels: ['graduation']
  },
  {
    id: 'cat',
    name: 'CAT',
    description: 'Common Admission Test (MBA)',
    educationLevels: ['graduation']
  },
  {
    id: 'upsc-cse',
    name: 'UPSC CSE',
    description: 'Union Public Service Commission Civil Services Examination',
    educationLevels: ['graduation']
  },
  {
    id: 'banking-po',
    name: 'Banking PO',
    description: 'Banking Probationary Officer Examinations',
    educationLevels: ['graduation']
  },
  {
    id: 'ssc-cgl',
    name: 'SSC CGL',
    description: 'Staff Selection Commission Combined Graduate Level',
    educationLevels: ['graduation']
  },
  {
    id: 'net-jrf',
    name: 'NET/JRF',
    description: 'National Eligibility Test / Junior Research Fellowship',
    educationLevels: ['graduation', 'post-graduation']
  },
  {
    id: 'nda',
    name: 'NDA',
    description: 'National Defence Academy',
    educationLevels: ['graduation']
  },
  {
    id: 'cds',
    name: 'CDS',
    description: 'Combined Defence Services',
    educationLevels: ['graduation']
  },
  {
    id: 'afcat',
    name: 'AFCAT',
    description: 'Air Force Common Admission Test',
    educationLevels: ['graduation']
  },
  
  // Post Graduation Level
  {
    id: 'jam',
    name: 'JAM',
    description: 'Joint Admission Test for M.Sc.',
    educationLevels: ['graduation']
  },
  {
    id: 'csir-net',
    name: 'CSIR NET',
    description: 'Council of Scientific and Industrial Research National Eligibility Test',
    educationLevels: ['post-graduation']
  },
  {
    id: 'set',
    name: 'SET',
    description: 'State Eligibility Test',
    educationLevels: ['post-graduation']
  },
  {
    id: 'gmat',
    name: 'GMAT',
    description: 'Graduate Management Admission Test',
    educationLevels: ['graduation', 'post-graduation']
  },
  {
    id: 'gre',
    name: 'GRE',
    description: 'Graduate Record Examinations',
    educationLevels: ['graduation', 'post-graduation']
  },
];

export function getExaminationsForEducationLevel(educationLevel: EducationLevel): TargetExamination[] {
  return TARGET_EXAMINATIONS.filter(exam => 
    exam.educationLevels.includes(educationLevel)
  );
}

export function getEducationLevelLabel(educationLevel: EducationLevel): string {
  const level = EDUCATION_LEVELS.find(level => level.value === educationLevel);
  return level?.label || educationLevel;
}

export function getExaminationById(id: string): TargetExamination | undefined {
  return TARGET_EXAMINATIONS.find(exam => exam.id === id);
}
