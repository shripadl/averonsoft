export type ExamProvider = 'AWS' | 'Azure' | 'GCP' | 'Other'
export type QuestionDifficulty = 'easy' | 'medium' | 'hard'
export type SubscriptionStatus = 'active' | 'expired' | 'canceled'

export interface PracticeOption {
  id: string
  text: string
}

export interface Exam {
  id: string
  slug: string
  name: string
  provider: ExamProvider | string
  description: string
  total_questions: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ExamQuestion {
  id: string
  exam_id: string
  question_text: string
  options: PracticeOption[]
  correct_option_id: string
  explanation: string
  difficulty: QuestionDifficulty
  domain: string | null
  is_outdated: boolean
  last_reviewed_at: string | null
  created_at: string
  updated_at: string
}

export interface UserExamAttempt {
  id: string
  user_id: string
  exam_id: string
  score: number
  total_questions: number
  started_at: string
  completed_at: string | null
  attempt_number_for_exam: number
}

export interface UserExamResponse {
  id: string
  attempt_id: string
  question_id: string
  selected_option_id: string
  is_correct: boolean
}

export interface UserSubscription {
  id: string
  user_id: string
  exam_id: string | null
  provider: 'stripe' | 'razorpay' | string
  scope_type?: 'exam' | 'provider' | 'global'
  provider_name?: string | null
  status: SubscriptionStatus
  started_at: string
  expires_at: string | null
}

export interface SubmitAnswerInput {
  questionId: string
  selectedOptionId: string
}
