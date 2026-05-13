import {
  templateConfigToQuestionTemplate,
  type TemplateConfig,
} from '../template-config'
import { CLOUD_TEMPLATES } from './cloud'
import { CRYPTOGRAPHY_TEMPLATES } from './cryptography'
import { DATABASES_TEMPLATES } from './databases'
import { LEGAL_BCP_TEMPLATES } from './legal_bcp'
import { NETWORKING_TEMPLATES } from './networking'
import { OPERATING_SYSTEMS_TEMPLATES } from './operating_systems'
import type { QuestionTemplate } from '../types'

function asQuestions(configs: TemplateConfig[], domainPrefix: string): QuestionTemplate[] {
  return configs.map((c, idx) =>
    templateConfigToQuestionTemplate(c, `${domainPrefix}-${String(idx + 1).padStart(3, '0')}`)
  )
}

export const ALL_TEMPLATES: QuestionTemplate[] = [
  ...asQuestions(CLOUD_TEMPLATES, 'cloud'),
  ...asQuestions(NETWORKING_TEMPLATES, 'networking'),
  ...asQuestions(CRYPTOGRAPHY_TEMPLATES, 'cryptography'),
  ...asQuestions(DATABASES_TEMPLATES, 'databases'),
  ...asQuestions(OPERATING_SYSTEMS_TEMPLATES, 'operating_systems'),
  ...asQuestions(LEGAL_BCP_TEMPLATES, 'legal_bcp'),
]

export const TEMPLATE_COUNT = ALL_TEMPLATES.length
