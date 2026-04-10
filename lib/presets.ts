export type Persona = 'freelancer' | 'household' | 'student' | 'traveller' | 'business' | 'custom'

export interface CategoryPreset {
  name: string
  icon: string
  type: 'expense' | 'income'
}

export interface PersonaPreset {
  id: Persona
  label: string
  icon: string
  description: string
  categories: CategoryPreset[]
}

export const PERSONA_PRESETS: PersonaPreset[] = [
  {
    id: 'freelancer',
    label: 'personas.freelancer',
    icon: '🧑‍💼',
    description: 'personas.freelancer_desc',
    categories: [
      // Expenses
      { name: 'categories_preset.software', icon: '💻', type: 'expense' },
      { name: 'categories_preset.office', icon: '📦', type: 'expense' },
      { name: 'categories_preset.travel', icon: '✈️', type: 'expense' },
      { name: 'categories_preset.marketing', icon: '📣', type: 'expense' },
      { name: 'categories_preset.meals', icon: '🍽️', type: 'expense' },
      { name: 'categories_preset.learning', icon: '📚', type: 'expense' },
      // Income
      { name: 'categories_preset.project_payment', icon: '💼', type: 'income' },
      { name: 'categories_preset.retainer', icon: '🔄', type: 'income' },
      { name: 'categories_preset.consulting', icon: '💡', type: 'income' },
      { name: 'categories_preset.other_income', icon: '💰', type: 'income' },
    ],
  },
  {
    id: 'household',
    label: 'personas.household',
    icon: '🏠',
    description: 'personas.household_desc',
    categories: [
      // Expenses
      { name: 'categories_preset.rent', icon: '🏠', type: 'expense' },
      { name: 'categories_preset.groceries', icon: '🛒', type: 'expense' },
      { name: 'categories_preset.utilities', icon: '⚡', type: 'expense' },
      { name: 'categories_preset.transport', icon: '🚗', type: 'expense' },
      { name: 'categories_preset.dining', icon: '🍽️', type: 'expense' },
      { name: 'categories_preset.healthcare', icon: '🏥', type: 'expense' },
      { name: 'categories_preset.entertainment', icon: '🎬', type: 'expense' },
      { name: 'categories_preset.clothing', icon: '👕', type: 'expense' },
      // Income
      { name: 'categories_preset.salary', icon: '💰', type: 'income' },
      { name: 'categories_preset.benefits', icon: '💳', type: 'income' },
      { name: 'categories_preset.gifts', icon: '🎁', type: 'income' },
    ],
  },
  {
    id: 'student',
    label: 'personas.student',
    icon: '🎓',
    description: 'personas.student_desc',
    categories: [
      // Expenses
      { name: 'categories_preset.tuition', icon: '🎓', type: 'expense' },
      { name: 'categories_preset.books', icon: '📚', type: 'expense' },
      { name: 'categories_preset.accommodation', icon: '🏠', type: 'expense' },
      { name: 'categories_preset.food', icon: '🍜', type: 'expense' },
      { name: 'categories_preset.transport', icon: '🚌', type: 'expense' },
      { name: 'categories_preset.entertainment', icon: '🎮', type: 'expense' },
      { name: 'categories_preset.utilities', icon: '⚡', type: 'expense' },
      // Income
      { name: 'categories_preset.part_time', icon: '💼', type: 'income' },
      { name: 'categories_preset.allowance', icon: '💳', type: 'income' },
      { name: 'categories_preset.grants', icon: '🎁', type: 'income' },
    ],
  },
  {
    id: 'traveller',
    label: 'personas.traveller',
    icon: '✈️',
    description: 'personas.traveller_desc',
    categories: [
      // Expenses
      { name: 'categories_preset.flights', icon: '✈️', type: 'expense' },
      { name: 'categories_preset.accommodation', icon: '🏨', type: 'expense' },
      { name: 'categories_preset.food', icon: '🍜', type: 'expense' },
      { name: 'categories_preset.activities', icon: '🎫', type: 'expense' },
      { name: 'categories_preset.transport', icon: '🚕', type: 'expense' },
      { name: 'categories_preset.shopping', icon: '🛍️', type: 'expense' },
      { name: 'categories_preset.other', icon: '📌', type: 'expense' },
      // Income
      { name: 'categories_preset.travel_budget', icon: '💰', type: 'income' },
      { name: 'categories_preset.work_abroad', icon: '💼', type: 'income' },
    ],
  },
  {
    id: 'business',
    label: 'personas.business',
    icon: '💼',
    description: 'personas.business_desc',
    categories: [
      // Expenses
      { name: 'categories_preset.inventory', icon: '📦', type: 'expense' },
      { name: 'categories_preset.rent_premises', icon: '🏢', type: 'expense' },
      { name: 'categories_preset.payroll', icon: '💶', type: 'expense' },
      { name: 'categories_preset.marketing', icon: '📢', type: 'expense' },
      { name: 'categories_preset.utilities', icon: '⚡', type: 'expense' },
      { name: 'categories_preset.supplies', icon: '🖊️', type: 'expense' },
      { name: 'categories_preset.equipment', icon: '🔧', type: 'expense' },
      { name: 'categories_preset.professional', icon: '👔', type: 'expense' },
      // Income
      { name: 'categories_preset.sales', icon: '💳', type: 'income' },
      { name: 'categories_preset.services', icon: '⚙️', type: 'income' },
      { name: 'categories_preset.gifts', icon: '🎁', type: 'income' },
    ],
  },
  {
    id: 'custom',
    label: 'personas.custom',
    icon: '🏗️',
    description: 'personas.custom_desc',
    categories: [
      { name: 'common.expenses', icon: '💸', type: 'expense' },
      { name: 'common.income', icon: '💰', type: 'income' },
    ],
  },
]
