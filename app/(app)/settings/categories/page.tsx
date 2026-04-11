'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { BunordenFooter } from '@/components/layout/BunordenFooter'
import { useTranslation } from '@/app/providers'
import { 
  ArrowLeft, Plus, Edit2, Trash2, GripVertical, X, 
  ChevronRight, ArrowDownCircle, ArrowUpCircle
} from 'lucide-react'
import Link from 'next/link'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Category {
  id: string
  name: string
  icon: string
  colour: string
  type: 'expense' | 'income'
  sort_order: number
}

const ICONS = ['📁', '🍽️', '🚗', '🛍️', '🏠', '🎮', '🍎', '🍺', '💊', '🎓', '🎁', '💰', '💸', '🏦', '💹', '🎭', '✈️', '🐶', '🍕', '💻']
const COLOURS = ['#FF3B30', '#34C759', '#007AFF', '#FF9500', '#AF52DE', '#5AC8FA', '#FFCC00', '#636366']

function SortableItem({ category, onEdit, onDelete }: { category: Category, onEdit: (c: Category) => void, onDelete: (id: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: category.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
    position: 'relative' as const,
    opacity: isDragging ? 0.6 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`surface-elevated flex items-center gap-3 p-4 group transition-shadow ${isDragging ? 'shadow-2xl' : ''}`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 -ml-1 hover:bg-white/5 rounded-lg"
        style={{ color: 'var(--text-tertiary)' }}
      >
        <GripVertical size={18} />
      </button>
      
      <div 
        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
        style={{ background: 'var(--overlay)', border: `1px solid ${category.colour}30` }}
      >
        {category.icon}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{category.name}</p>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={() => onEdit(category)}
          className="p-2 rounded-lg hover:bg-white/5" 
          style={{ color: 'var(--text-tertiary)' }}
        >
          <Edit2 size={16} />
        </button>
        <button 
          onClick={() => onDelete(category.id)}
          className="p-2 rounded-lg hover:bg-danger/10" 
          style={{ color: 'var(--danger)' }}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  )
}

export default function CategoriesPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [type, setType] = useState<'expense' | 'income'>('expense')
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  
  // Form states
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('📁')
  const [colour, setColour] = useState('#636366')
  const [processing, setProcessing] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const fetchData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .eq('archived', false)
        .order('sort_order', { ascending: true })

      setCategories(data || [])
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => { fetchData() }, [fetchData])

  const filteredCategories = useMemo(() => {
    return categories.filter(c => c.type === type)
  }, [categories, type])

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = categories.findIndex(c => c.id === active.id)
    const newIndex = categories.findIndex(c => c.id === over.id)

    const newArray = arrayMove(categories, oldIndex, newIndex)
    setCategories(newArray)

    // Update sort_order in DB (throttled/debounced would be better but simple update for now)
    const updates = newArray.map((c, i) => ({
      id: c.id,
      sort_order: i
    }))

    // We only update the ids that changed but sending all is simpler for consistency
    for (const u of updates) {
       await supabase.from('categories').update({ sort_order: u.sort_order }).eq('id', u.id)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setProcessing(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update({ name: name.trim(), icon, colour })
          .eq('id', editingCategory.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('categories')
          .insert({
            user_id: user.id,
            name: name.trim(),
            icon,
            colour,
            type,
            sort_order: categories.length
          })
        if (error) throw error
      }

      setShowModal(false)
      fetchData()
      setName('')
      setEditingCategory(null)
    } catch (err: any) {
      alert(err.message || 'Error saving category')
    } finally {
      setProcessing(false)
    }
  }

  const handleDelete = async (id: string) => {
    setProcessing(true)
    try {
      // Archive instead of delete to preserve transaction history
      const { error } = await supabase.from('categories').update({ archived: true }).eq('id', id)
      if (error) throw error
      setShowDeleteModal(null)
      fetchData()
    } catch (err: any) {
      alert(err.message || 'Error deleting category')
    } finally {
      setProcessing(false)
    }
  }

  const openEdit = (c: Category) => {
    setEditingCategory(c)
    setName(c.name)
    setIcon(c.icon)
    setColour(c.colour)
    setShowModal(true)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 px-4 lg:px-8 py-6 lg:py-8 max-w-2xl mx-auto w-full">
        <header className="flex items-center gap-4 mb-8 animate-fade-up">
          <Link href="/settings" className="p-2 -ml-2 rounded-full hover:bg-white/5 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {t('settings.categories')}
          </h1>
        </header>

        {/* Type Toggle */}
        <div className="surface-elevated p-1.5 flex gap-1 mb-6 animate-fade-up delay-1">
          <button
            onClick={() => setType('expense')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all ${type === 'expense' ? 'bg-danger/10 text-danger shadow-sm' : 'text-tertiary'}`}
            style={{ 
              background: type === 'expense' ? 'var(--danger-bg)' : 'transparent',
              color: type === 'expense' ? 'var(--danger)' : 'var(--text-tertiary)',
              border: type === 'expense' ? '1px solid rgba(255,59,48,0.2)' : '1px solid transparent'
            }}
          >
            <ArrowDownCircle size={18} /> {t('dashboard.expenses')}
          </button>
          <button
            onClick={() => setType('income')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all ${type === 'income' ? 'bg-success/10 text-success shadow-sm' : 'text-tertiary'}`}
            style={{ 
              background: type === 'income' ? 'var(--success-bg)' : 'transparent',
              color: type === 'income' ? 'var(--success)' : 'var(--text-tertiary)',
              border: type === 'income' ? '1px solid rgba(52,199,89,0.2)' : '1px solid transparent'
            }}
          >
            <ArrowUpCircle size={18} /> {t('dashboard.income')}
          </button>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton h-16 rounded-2xl" />)}
          </div>
        ) : (
          <div className="space-y-2 animate-fade-up delay-2">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={filteredCategories.map(c => c.id)}
                strategy={verticalListSortingStrategy}
              >
                {filteredCategories.map((cat) => (
                  <SortableItem 
                    key={cat.id} 
                    category={cat} 
                    onEdit={openEdit} 
                    onDelete={setShowDeleteModal} 
                  />
                ))}
              </SortableContext>
            </DndContext>

            <button
              onClick={() => { setEditingCategory(null); setName(''); setShowModal(true); }}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-white/10 hover:border-accent-primary/50 hover:bg-accent-primary/5 transition-all text-sm font-bold mt-4 group"
              style={{ color: 'var(--text-tertiary)' }}
            >
               <Plus size={18} className="group-hover:text-accent-primary transition-colors" /> {t('settings.categories_add')}
            </button>
          </div>
        )}
      </div>

      <BunordenFooter />

      {/* Category Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              {editingCategory ? t('settings.categories_edit') : t('settings.categories_new')}
            </h3>
            
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-tertiary)' }}>
                  {t('settings.categories_name')}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={t('settings.categories_name_placeholder')}
                  className="input-minimal w-full"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-tertiary)' }}>
                  {t('settings.categories_icon')}
                </label>
                <div className="grid grid-cols-5 gap-2 h-40 overflow-y-auto pr-1 custom-scrollbar">
                  {['☕', '🍔', '🛒', '🚕', '🏠', '💡', '🎮', '💊', '💰', '💼', '🎁', '🔌', '🎥', '🏋️', '✈️', '🧴'].map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setIcon(emoji)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all hover:scale-110 active:scale-95"
                      style={{ 
                        background: icon === emoji ? 'var(--accent-primary)' : 'var(--overlay)',
                        color: icon === emoji ? 'white' : 'inherit',
                        border: icon === emoji ? 'none' : '1px solid var(--border)'
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-tertiary)' }}>
                  {t('settings.categories_colour')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLOURS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColour(c)}
                      className={`w-8 h-8 rounded-full transition-all ${colour === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-black' : 'opacity-60'}`}
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="list-item justify-center bg-primary/5 text-primary border border-border rounded-xl flex-1 py-3 font-bold"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={processing || !name.trim()}
                  className="btn-apple-primary flex-1 py-3 font-bold"
                >
                  {processing ? t('common.loading') : t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(null)}>
          <div className="modal-content p-6 max-w-xs" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-danger-bg flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} style={{ color: 'var(--danger)' }} />
              </div>
              <h3 className="text-lg font-bold mb-2">{t('settings.categories_delete_confirm')}</h3>
              <p className="text-sm mb-8" style={{ color: 'var(--text-tertiary)' }}>
                {t('settings.categories_delete_warning')}
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteModal(null)} className="list-item justify-center bg-primary/5 text-primary border border-border rounded-xl flex-1 py-3 font-bold">{t('common.cancel')}</button>
                <button 
                  onClick={() => handleDelete(showDeleteModal)} 
                  disabled={processing}
                  className="btn-danger-glass flex-1 py-3 font-bold"
                >
                  {t('common.delete')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
