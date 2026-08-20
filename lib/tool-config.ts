export const TOOL_KEYS = [
  'pdfconverter',
  'charactercounter',
  'jsonformatter',
  'smartimageresizer',
  'businesscard',
  'aiworkspace',
  'daw',
  'regexexplainer',
  'sportanalytics',
  'practiceexams',
  'examgenerator',
  'resumebuilder',
  'sipswp',
  'uktaxcalculator',
  'areamap',
  'homedecor',
  'satbara',
  'passportphoto',
] as const
export type ToolKey = (typeof TOOL_KEYS)[number]

export interface ToolConfig {
  key: ToolKey
  name: string
  href: string
}

export const TOOL_CONFIG: ToolConfig[] = [
  { key: 'pdfconverter', name: 'PDF Converter', href: '/tools/pdf-converter' },
  { key: 'charactercounter', name: 'Character Counter', href: '/tools/character-counter' },
  { key: 'jsonformatter', name: 'JSON Formatter', href: '/tools/json-formatter' },
  { key: 'smartimageresizer', name: 'Smart Image Toolkit', href: '/tools/smart-image-resizer' },
  { key: 'businesscard', name: 'Business Card', href: '/tools/business-card' },
  { key: 'aiworkspace', name: 'AI Code Workspace', href: '/tools/ai-workspace' },
  { key: 'daw', name: 'DAW', href: '/tools/daw' },
  { key: 'regexexplainer', name: 'RegExplain', href: '/tools/regex-explainer' },
  { key: 'sportanalytics', name: 'Sports Analytics', href: '/sports' },
  { key: 'practiceexams', name: 'Practice Exams', href: '/practice' },
  { key: 'examgenerator', name: 'Exam Question Generator', href: '/exam-generator' },
  { key: 'resumebuilder', name: 'CV / Resume Builder', href: '/resume-builder' },
  { key: 'sipswp', name: 'SIP / SWP Calculator', href: '/tools/sip-swp' },
  { key: 'uktaxcalculator', name: 'UK Tax Calculator', href: '/uk-tax-calculator' },
  { key: 'areamap', name: 'PlotMeasure', href: '/area-map' },
  { key: 'homedecor', name: 'RoomScale', href: '/home-decor' },
  { key: 'satbara', name: 'Satbara', href: '/satbara' },
  { key: 'passportphoto', name: 'PhotoSpec', href: '/passport-photo' },
]
