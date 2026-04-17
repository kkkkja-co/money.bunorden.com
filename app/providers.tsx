'use client'

import { useEffect, useState, createContext, useContext, useCallback, useMemo } from 'react'
import { Language, translations } from '@/lib/i18n/translations'
import { supabase } from '@/lib/supabase/client'

type Theme = 'dark' | 'light'
export type AccentColor = 'violet' | 'ocean' | 'emerald' | 'sunset' | 'rose' | 'slate'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  accent: AccentColor
  setAccent: (color: AccentColor) => void
}

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (path: string, params?: Record<string, string>) => string
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
  accent: 'violet',
  setAccent: () => {},
})

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (path: string) => path,
})

export const useTheme = () => useContext(ThemeContext)
export const useLanguage = () => useContext(LanguageContext)

export const useTranslation = () => {
  const { t, language } = useLanguage()
  return { t, language }
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')
  const [accent, setAccentState] = useState<AccentColor>('violet')
  const [language, setLanguageState] = useState<Language>('en')
  const [mounted, setMounted] = useState(false)

  // Initialization
  useEffect(() => {
    // Theme
    const storedTheme = localStorage.getItem('clavi-theme') as Theme | null
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const initialTheme = storedTheme || (prefersDark ? 'dark' : 'light')
    setTheme(initialTheme)
    document.documentElement.setAttribute('data-theme', initialTheme)

    // Accent color
    const storedAccent = localStorage.getItem('clavi-accent') as AccentColor | null
    const initialAccent = storedAccent || 'violet'
    setAccentState(initialAccent)
    document.documentElement.setAttribute('data-accent', initialAccent)

    // Language
    const storedLang = localStorage.getItem('clavi-lang') as Language | null
    if (storedLang) {
      setLanguageState(storedLang)
    } else {
      // Auto-detect based on location (Timezone) and browser settings
      try {
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
        const browserLang = navigator.language
        
        const isChineseRegion = 
          timeZone.includes('Shanghai') || 
          timeZone.includes('Taipei') || 
          timeZone.includes('Hong_Kong') ||
          timeZone.includes('Macau') ||
          timeZone.includes('Urumqi') ||
          browserLang.toLowerCase().includes('zh')

        const detectedLang: Language = isChineseRegion ? 'zh-TW' : 'en'
        setLanguageState(detectedLang)
        // We don't save to localStorage yet to allow user to override easily
      } catch (e) {
        setLanguageState('en') // Fallback
      }
    }

    setMounted(true)
  }, [])

  // Sync language with Supabase for logged in users
  useEffect(() => {
    if (!mounted) return

    const syncLang = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('language')
          .eq('id', user.id)
          .single()
        
        if (data?.language && data.language !== language) {
          setLanguageState(data.language as Language)
          localStorage.setItem('clavi-lang', data.language)
        }
      }
    }
    syncLang()
  }, [mounted])

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark'
      document.documentElement.setAttribute('data-theme', next)
      localStorage.setItem('clavi-theme', next)
      return next
    })
  }, [])

  const setAccent = useCallback((color: AccentColor) => {
    setAccentState(color)
    document.documentElement.setAttribute('data-accent', color)
    localStorage.setItem('clavi-accent', color)
  }, [])

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('clavi-lang', lang)
    
    // Attempt to sync to Supabase if logged in
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from('profiles').update({ language: lang }).eq('id', user.id).then()
      }
    })
  }, [])

  const t = useCallback((path: string, params?: Record<string, string>) => {
    const keys = path.split('.')
    let result: any = translations[language]
    
    for (const key of keys) {
      if (result && result[key]) {
        result = result[key]
      } else {
        return path
      }
    }

    if (typeof result === 'string' && params) {
      let templated = result
      Object.entries(params).forEach(([key, value]) => {
        templated = templated.replace(`{${key}}`, value)
      })
      return templated
    }

    return typeof result === 'string' ? result : path
  }, [language])

  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, accent, setAccent }}>
      <LanguageContext.Provider value={{ language, setLanguage, t }}>
        {children}
      </LanguageContext.Provider>
    </ThemeContext.Provider>
  )
}
