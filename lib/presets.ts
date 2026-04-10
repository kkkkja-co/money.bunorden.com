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
    label: 'Freelancer / Self-employed',
    icon: '🧑‍💼',
    description: 'Track projects, income, and deductible expenses',
    categories: [
      // Expenses
      { name: 'Software/Tools', icon: '💻', type: 'expense' },
      { name: 'Office', icon: '📦', type: 'expense' },
      { name: 'Travel', icon: '✈️', type: 'expense' },
      { name: 'Marketing', icon: '📣', type: 'expense' },
      { name: 'Client Meals', icon: '🍽️', type: 'expense' },
      { name: 'Learning', icon: '📚', type: 'expense' },
      // Income
      { name: 'Project Payment', icon: '💼', type: 'income' },
      { name: 'Retainer', icon: '🔄', type: 'income' },
      { name: 'Consulting', icon: '💡', type: 'income' },
      { name: 'Other Income', icon: '💰', type: 'income' },
    ],
  },
  {
    id: 'household',
    label: 'Household budgeting',
    icon: '🏠',
    description: 'Manage family finances and daily expenses',
    categories: [
      // Expenses
      { name: 'Rent/Mortgage', icon: '🏠', type: 'expense' },
      { name: 'Groceries', icon: '🛒', type: 'expense' },
      { name: 'Utilities', icon: '⚡', type: 'expense' },
      { name: 'Transport', icon: '🚗', type: 'expense' },
      { name: 'Dining', icon: '🍽️', type: 'expense' },
      { name: 'Healthcare', icon: '🏥', type: 'expense' },
      { name: 'Entertainment', icon: '🎬', type: 'expense' },
      { name: 'Clothing', icon: '👕', type: 'expense' },
      // Income
      { name: 'Salary', icon: '💰', type: 'income' },
      { name: 'Benefits', icon: '💳', type: 'income' },
      { name: 'Gifts', icon: '🎁', type: 'income' },
    ],
  },
  {
    id: 'student',
    label: 'Student',
    icon: '🎓',
    description: 'Budget for tuition, living costs, and part-time work',
    categories: [
      // Expenses
      { name: 'Tuition', icon: '🎓', type: 'expense' },
      { name: 'Books/Supplies', icon: '📚', type: 'expense' },
      { name: 'Accommodation', icon: '🏠', type: 'expense' },
      { name: 'Food', icon: '🍜', type: 'expense' },
      { name: 'Transport', icon: '🚌', type: 'expense' },
      { name: 'Entertainment', icon: '🎮', type: 'expense' },
      { name: 'Utilities', icon: '⚡', type: 'expense' },
      // Income
      { name: 'Part-time Work', icon: '💼', type: 'income' },
      { name: 'Allowance', icon: '💳', type: 'income' },
      { name: 'Grants/Scholarships', icon: '🎁', type: 'income' },
    ],
  },
  {
    id: 'traveller',
    label: 'Traveller',
    icon: '✈️',
    description: 'Track travel expenses and budgets',
    categories: [
      // Expenses
      { name: 'Flights', icon: '✈️', type: 'expense' },
      { name: 'Accommodation', icon: '🏨', type: 'expense' },
      { name: 'Dining', icon: '🍜', type: 'expense' },
      { name: 'Activities', icon: '🎫', type: 'expense' },
      { name: 'Transport', icon: '🚕', type: 'expense' },
      { name: 'Shopping', icon: '🛍️', type: 'expense' },
      { name: 'Other', icon: '📌', type: 'expense' },
      // Income
      { name: 'Travel Budget', icon: '💰', type: 'income' },
      { name: 'Work Abroad', icon: '💼', type: 'income' },
    ],
  },
  {
    id: 'business',
    label: 'Small business owner',
    icon: '💼',
    description: 'Manage business revenue and operating costs',
    categories: [
      // Expenses
      { name: 'Inventory', icon: '📦', type: 'expense' },
      { name: 'Rent/Premises', icon: '🏢', type: 'expense' },
      { name: 'Payroll', icon: '💶', type: 'expense' },
      { name: 'Marketing', icon: '📢', type: 'expense' },
      { name: 'Utilities', icon: '⚡', type: 'expense' },
      { name: 'Supplies', icon: '🖊️', type: 'expense' },
      { name: 'Equipment', icon: '🔧', type: 'expense' },
      { name: 'Professional Services', icon: '👔', type: 'expense' },
      // Income
      { name: 'Sales', icon: '💳', type: 'income' },
      { name: 'Services', icon: '⚙️', type: 'income' },
      { name: 'Grants', icon: '🎁', type: 'income' },
    ],
  },
  {
    id: 'custom',
    label: 'Custom — I\'ll set up manually',
    icon: '🏗️',
    description: 'Create your own categories from scratch',
    categories: [
      { name: 'Expense', icon: '💸', type: 'expense' },
      { name: 'Income', icon: '💰', type: 'income' },
    ],
  },
]
