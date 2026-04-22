'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Plus, Trash2, ArrowLeft, Eye, Edit3, BookOpen, Search, X, Save } from 'lucide-react'
import { useTranslation } from '@/app/providers'
import { BunordenFooter } from '@/components/layout/BunordenFooter'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const STORAGE_KEY = 'clavi-notes-v1'

interface Note {
  id: string
  title: string
  content: string
  updatedAt: string
}

// ── Minimal markdown renderer (zero trackers / no external lib) ──
function renderMarkdown(raw: string): string {
  const escaped = raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  const lines = escaped.split('\n')
  const out: string[] = []
  let inList = false

  for (const line of lines) {
    const h3 = line.match(/^### (.+)$/)
    const h2 = line.match(/^## (.+)$/)
    const h1 = line.match(/^# (.+)$/)
    const li = line.match(/^[-*] (.+)$/)
    const hr = line.match(/^---$/)

    if (inList && !li) { out.push('</ul>'); inList = false }

    if (h3) { out.push(`<h3 class="md-h3">${inline(h3[1])}</h3>`); continue }
    if (h2) { out.push(`<h2 class="md-h2">${inline(h2[1])}</h2>`); continue }
    if (h1) { out.push(`<h1 class="md-h1">${inline(h1[1])}</h1>`); continue }
    if (hr)  { out.push('<hr class="md-hr" />'); continue }
    if (li)  {
      if (!inList) { out.push('<ul class="md-ul">'); inList = true }
      out.push(`<li class="md-li">${inline(li[1])}</li>`)
      continue
    }
    if (line.trim() === '') { out.push('<br>'); continue }
    out.push(`<p class="md-p">${inline(line)}</p>`)
  }
  if (inList) out.push('</ul>')
  return out.join('')
}

function inline(s: string): string {
  return s
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code class="md-code">$1</code>')
}

function extractTitle(content: string): string {
  const firstLine = content.split('\n')[0] || ''
  return firstLine.replace(/^#+\s*/, '').trim() || 'Untitled'
}

function loadNotes(): Note[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') }
  catch { return [] }
}
function saveNotes(notes: Note[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
}

export default function NotesPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [notes, setNotes] = useState<Note[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [mode, setMode] = useState<'edit' | 'preview'>('edit')
  const [search, setSearch] = useState('')
  const [dirty, setDirty] = useState(false)
  const [justSaved, setJustSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchNotes = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) throw error

      const mappedData = (data || []).map(n => ({
        id: n.id,
        title: n.title,
        content: n.content,
        updatedAt: n.updated_at
      }))

      setNotes(mappedData)
      saveNotes(mappedData)
    } catch (err) {
      console.error('Notes fetch error:', err)
      // Fallback to local
      setNotes(loadNotes())
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => { fetchNotes() }, [fetchNotes])

  const activeNote = notes.find(n => n.id === activeId) ?? null

  const filtered = useMemo(() =>
    notes.filter(n =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase())
    ).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [notes, search]
  )

  const createNote = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const newNote = {
        title: t('notes.untitled'),
        content: '',
        user_id: user.id
      }

      const { data, error } = await supabase
        .from('notes')
        .insert(newNote)
        .select()
        .single()

      if (error) throw error

      const note: Note = {
        id: data.id,
        title: data.title,
        content: data.content,
        updatedAt: data.updated_at,
      }
      const updated = [note, ...notes]
      setNotes(updated)
      saveNotes(updated)
      setActiveId(note.id)
      setMode('edit')
      setDirty(false)
    } catch (err) {
      console.error('Create note error:', err)
    }
  }

  const updateContent = async (content: string) => {
    const updatedAt = new Date().toISOString()
    setNotes(prev => {
      const updated = prev.map(n =>
        n.id === activeId
          ? { ...n, content, title: extractTitle(content), updatedAt }
          : n
      )
      saveNotes(updated)
      return updated
    })
    setDirty(true)
    
    // Sync to supabase in background
    if (activeId) {
      supabase.from('notes')
        .update({ content, title: extractTitle(content), updated_at: updatedAt })
        .eq('id', activeId)
        .then(({ error }) => {
          if (error) console.error('Sync note error:', error)
        })
    }
  }

  const saveNote = () => {
    setDirty(false)
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 2000)
  }

  const deleteNote = async (id: string) => {
    if (!confirm(t('notes.delete_confirm'))) return
    try {
      const { error } = await supabase.from('notes').delete().eq('id', id)
      if (error) throw error
      
      const updated = notes.filter(n => n.id !== id)
      setNotes(updated)
      saveNotes(updated)
      if (activeId === id) setActiveId(null)
    } catch (err) {
      console.error('Delete note error:', err)
    }
  }

  const back = () => {
    if (dirty) saveNote()
    setActiveId(null)
    setMode('edit')
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    if (diff < 60_000) return 'Just now'
    if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`
    if (diff < 86400_000) return `${Math.floor(diff / 3600_000)}h ago`
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }

  // ── DETAIL / EDITOR VIEW ──
  if (activeNote) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 md:py-8">
          {/* Header */}
          <header className="flex items-center gap-3 mb-6 animate-slide-up">
            <button
              onClick={back}
              className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center text-primary active:scale-95 transition-transform flex-shrink-0"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
                {t('notes.last_edited')} {formatDate(activeNote.updatedAt)}
              </p>
            </div>
            {/* Mode toggle */}
            <div className="flex items-center gap-1 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-1">
              <button
                onClick={() => setMode('edit')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === 'edit' ? 'bg-[var(--accent-primary)] text-white' : 'text-[var(--text-secondary)]'}`}
              >
                <Edit3 size={12} /> {t('notes.edit')}
              </button>
              <button
                onClick={() => setMode('preview')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === 'preview' ? 'bg-[var(--accent-primary)] text-white' : 'text-[var(--text-secondary)]'}`}
              >
                <Eye size={12} /> {t('notes.preview')}
              </button>
            </div>
            {/* Save indicator */}
            <button
              onClick={saveNote}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                justSaved
                  ? 'text-[var(--success)] bg-[var(--success)]/10'
                  : dirty
                    ? 'text-[var(--accent-primary)] bg-[var(--accent-primary)]/10'
                    : 'text-[var(--text-secondary)] opacity-40'
              }`}
            >
              <Save size={12} />
              {justSaved ? 'Saved' : dirty ? 'Save' : 'Saved'}
            </button>
          </header>

          {/* Editor / Preview */}
          <div className="animate-slide-up delay-1">
            {mode === 'edit' ? (
              <div className="space-y-3">
                <div
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] px-1 opacity-60"
                >
                  {t('notes.hint')}
                </div>
                <textarea
                  autoFocus
                  value={activeNote.content}
                  onChange={e => updateContent(e.target.value)}
                  placeholder={t('notes.placeholder')}
                  className="w-full min-h-[65vh] bg-[var(--bg-secondary)] border border-[var(--border)] rounded-3xl p-6 text-[var(--text-primary)] text-sm font-mono leading-relaxed resize-none focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)]/20 transition-all"
                  style={{ fontFamily: '"SF Mono", "Fira Code", monospace' }}
                  onBlur={saveNote}
                />
              </div>
            ) : (
              <div
                className="w-full min-h-[65vh] bg-[var(--bg-secondary)] border border-[var(--border)] rounded-3xl p-6"
                style={{ color: 'var(--text-primary)' }}
              >
                {activeNote.content ? (
                  <div
                    className="markdown-body"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(activeNote.content) }}
                  />
                ) : (
                  <p className="text-[var(--text-secondary)] text-sm italic">{t('notes.placeholder')}</p>
                )}
              </div>
            )}
          </div>

          {/* Delete */}
          <div className="mt-6 animate-slide-up delay-2">
            <button
              onClick={() => deleteNote(activeNote.id)}
              className="flex items-center gap-2 text-[var(--danger)] text-xs font-bold uppercase tracking-widest hover:bg-[var(--danger)]/5 px-3 py-2 rounded-xl transition-colors"
            >
              <Trash2 size={14} /> {t('common.delete')}
            </button>
          </div>
        </div>

        <style>{`
          .markdown-body .md-h1 { font-size: 1.4rem; font-weight: 900; margin: 1.2rem 0 0.4rem; letter-spacing: -0.03em; }
          .markdown-body .md-h2 { font-size: 1.15rem; font-weight: 800; margin: 1rem 0 0.3rem; letter-spacing: -0.02em; }
          .markdown-body .md-h3 { font-size: 1rem; font-weight: 700; margin: 0.8rem 0 0.25rem; }
          .markdown-body .md-p  { margin: 0.35rem 0; line-height: 1.7; font-size: 0.9rem; }
          .markdown-body .md-ul { margin: 0.5rem 0 0.5rem 1rem; list-style: none; padding: 0; }
          .markdown-body .md-li { display: flex; gap: 0.5rem; padding: 0.15rem 0; font-size: 0.9rem; }
          .markdown-body .md-li::before { content: '•'; color: var(--accent-primary); font-weight: 900; flex-shrink: 0; }
          .markdown-body .md-hr { border: none; border-top: 1px solid var(--border); margin: 1rem 0; }
          .markdown-body .md-code { background: var(--bg-elevated); border: 1px solid var(--border); padding: 0.1em 0.4em; border-radius: 6px; font-size: 0.82em; font-family: 'SF Mono', 'Fira Code', monospace; }
          .markdown-body strong { font-weight: 800; }
          .markdown-body em { font-style: italic; opacity: 0.85; }
        `}</style>
        <BunordenFooter />
      </div>
    )
  }

  // ── LIST VIEW ──
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 max-w-xl mx-auto w-full px-4 py-6 md:py-10">
        {/* Header */}
        <header className="mb-8 animate-slide-up">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-primary">{t('notes.title')}</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] mt-1">
                {t('notes.subtitle')}
              </p>
            </div>
            <button
              onClick={createNote}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[var(--accent-primary)] text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-[var(--accent-primary)]/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Plus size={14} strokeWidth={3} /> {t('notes.new_note')}
            </button>
          </div>
        </header>

        {/* Search */}
        {notes.length > 2 && (
          <div className="relative mb-6 animate-slide-up delay-1">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('notes.search_placeholder')}
              className="w-full pl-10 pr-10 py-3 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl text-sm text-primary placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent-primary)] transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">
                <X size={14} />
              </button>
            )}
          </div>
        )}

        {/* Notes Grid */}
        {notes.length === 0 ? (
          <div className="surface-elevated text-center py-20 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-[var(--accent-primary)]/10 flex items-center justify-center mx-auto mb-6">
              <BookOpen size={32} className="text-[var(--accent-primary)]" />
            </div>
            <h2 className="text-lg font-bold text-primary mb-2">{t('notes.no_notes')}</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-8 max-w-xs mx-auto">{t('notes.no_notes_desc')}</p>
            <button
              onClick={createNote}
              className="btn-apple-primary px-8 py-3 rounded-full text-sm font-bold"
            >
              {t('notes.new_note')}
            </button>
          </div>
        ) : (
          <div className="space-y-3 animate-slide-up delay-2">
            {filtered.length === 0 ? (
              <p className="text-center text-[var(--text-secondary)] text-sm py-12">{t('transactions.no_matches')}</p>
            ) : (
              filtered.map((note, i) => (
                <button
                  key={note.id}
                  onClick={() => { setActiveId(note.id); setMode('edit'); setDirty(false) }}
                  className="w-full text-left surface-elevated-interactive p-5 group relative overflow-hidden"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  {/* Accent glow */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--accent-primary)]/5 blur-2xl -mr-12 -mt-12 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-primary truncate mb-1">{note.title || t('notes.untitled')}</p>
                      <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                        {note.content.replace(/^#+\s*/gm, '').replace(/\*+/g, '').trim() || '…'}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-60 whitespace-nowrap">
                        {formatDate(note.updatedAt)}
                      </span>
                      <button
                        onClick={e => { e.stopPropagation(); deleteNote(note.id) }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-lg flex items-center justify-center text-[var(--danger)] hover:bg-[var(--danger)]/10"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>
      <BunordenFooter />
    </div>
  )
}
