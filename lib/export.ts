import { supabase } from '@/lib/supabase/client'

export async function exportDataAsJson() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Fetch all user data in parallel
    const [
      { data: profile },
      { data: accounts },
      { data: categories },
      { data: transactions },
      { data: budgets }
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('accounts').select('*').eq('user_id', user.id),
      supabase.from('categories').select('*').eq('user_id', user.id),
      supabase.from('transactions').select('*').eq('user_id', user.id),
      supabase.from('budgets').select('*').eq('user_id', user.id)
    ])

    const exportData = {
      export_version: '1.0',
      export_date: new Date().toISOString(),
      user_id: user.id,
      data: {
        profile,
        accounts: accounts || [],
        categories: categories || [],
        transactions: transactions || [],
        budgets: budgets || []
      }
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    
    const timestamp = new Date().toISOString().split('T')[0]
    link.href = url
    link.download = `clavi_backup_${timestamp}.json`
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    return true
  } catch (error) {
    console.error('Export failed:', error)
    return false
  }
}
