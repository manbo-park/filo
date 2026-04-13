import { useState } from 'react'
import { PlusCircle, Trash2, Edit3, Check, X, AlertTriangle } from 'lucide-react'
import { PageLayout } from '@/components/ui/PageLayout'
import { Input } from '@/components/ui/Input'
import { useMasterDataStore } from '@/store/masterDataStore'
import type { Film, Camera, Lens } from '@/types'

type Tab = 'films' | 'cameras' | 'lenses'

// ── Inline item editor ───────────────────────────────────────────────────────

interface FilmRowProps {
    film: Film
    onUpdate: (patch: Partial<Omit<Film, 'id'>>) => void
    onDelete: () => void
}
function FilmRow({ film, onUpdate, onDelete }: FilmRowProps) {
    const [editing, setEditing] = useState(false)
    const [name, setName] = useState(film.name)
    const [iso, setIso] = useState(String(film.iso))

    function save() {
        if (!name.trim()) return
        onUpdate({ name: name.trim(), iso: parseInt(iso) || film.iso })
        setEditing(false)
    }

    if (editing) {
        return (
            <div className="flex items-center gap-2 py-2 border-b border-film-border last:border-b-0">
                <input
                    className="flex-1 bg-film-bg border border-film-accent rounded px-2 py-1 text-film-text font-mono text-sm focus:outline-none"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                />
                <input
                    className="w-16 bg-film-bg border border-film-border rounded px-2 py-1 text-film-text font-mono text-sm focus:outline-none text-right"
                    value={iso}
                    onChange={(e) => setIso(e.target.value)}
                    type="number"
                    placeholder="ISO"
                />
                <button onClick={save} className="text-film-accent hover:text-yellow-400 p-1">
                    <Check size={16} />
                </button>
                <button
                    onClick={() => setEditing(false)}
                    className="text-film-muted hover:text-film-text p-1"
                >
                    <X size={14} />
                </button>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-2 py-2.5 border-b border-film-border last:border-b-0">
            <div className="flex-1 min-w-0">
                <span className="text-film-text font-mono text-sm">{film.name}</span>
                <span className="text-film-muted font-mono text-xs ml-2">ISO {film.iso}</span>
            </div>
            <button
                onClick={() => setEditing(true)}
                className="text-film-muted hover:text-film-text p-1"
            >
                <Edit3 size={14} />
            </button>
            <button onClick={onDelete} className="text-film-muted hover:text-film-danger p-1">
                <Trash2 size={14} />
            </button>
        </div>
    )
}

interface SimpleRowProps {
    item: Camera | Lens
    onUpdate: (patch: { name: string }) => void
    onDelete: () => void
}
function SimpleRow({ item, onUpdate, onDelete }: SimpleRowProps) {
    const [editing, setEditing] = useState(false)
    const [name, setName] = useState(item.name)

    function save() {
        if (!name.trim()) return
        onUpdate({ name: name.trim() })
        setEditing(false)
    }

    if (editing) {
        return (
            <div className="flex items-center gap-2 py-2 border-b border-film-border last:border-b-0">
                <input
                    className="flex-1 bg-film-bg border border-film-accent rounded px-2 py-1 text-film-text font-mono text-sm focus:outline-none"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && save()}
                />
                <button onClick={save} className="text-film-accent hover:text-yellow-400 p-1">
                    <Check size={16} />
                </button>
                <button
                    onClick={() => setEditing(false)}
                    className="text-film-muted hover:text-film-text p-1"
                >
                    <X size={14} />
                </button>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-2 py-2.5 border-b border-film-border last:border-b-0">
            <span className="flex-1 text-film-text font-mono text-sm">{item.name}</span>
            <button
                onClick={() => setEditing(true)}
                className="text-film-muted hover:text-film-text p-1"
            >
                <Edit3 size={14} />
            </button>
            <button onClick={onDelete} className="text-film-muted hover:text-film-danger p-1">
                <Trash2 size={14} />
            </button>
        </div>
    )
}

// ── Main Screen ──────────────────────────────────────────────────────────────

export function MasterDataScreen() {
    const [tab, setTab] = useState<Tab>('films')
    const [confirmClear, setConfirmClear] = useState(false)
    const {
        films,
        cameras,
        lenses,
        addFilm,
        updateFilm,
        deleteFilm,
        addCamera,
        updateCamera,
        deleteCamera,
        addLens,
        updateLens,
        deleteLens,
        clearAll,
    } = useMasterDataStore()

    // Add form state
    const [newName, setNewName] = useState('')
    const [newIso, setNewIso] = useState('400')

    function handleAdd() {
        if (!newName.trim()) return
        if (tab === 'films') {
            addFilm({ name: newName.trim(), iso: parseInt(newIso) || 400 })
        } else if (tab === 'cameras') {
            addCamera({ name: newName.trim() })
        } else {
            addLens({ name: newName.trim() })
        }
        setNewName('')
        setNewIso('400')
    }

    const tabs: { key: Tab; label: string; count: number }[] = [
        { key: 'films', label: '필름', count: films.length },
        { key: 'cameras', label: '카메라', count: cameras.length },
        { key: 'lenses', label: '렌즈', count: lenses.length },
    ]

    return (
        <PageLayout
            title="기본 데이터"
            showBack
            rightAction={
                <button
                    onClick={() => setConfirmClear(true)}
                    className="p-2 text-film-muted hover:text-film-danger transition-colors"
                    title="전체 삭제"
                >
                    <Trash2 size={16} />
                </button>
            }
        >
            {/* Tab bar */}
            <div className="flex border-b border-film-border">
                {tabs.map(({ key, label, count }) => (
                    <button
                        key={key}
                        onClick={() => {
                            setTab(key)
                            setNewName('')
                            setNewIso('400')
                        }}
                        className={[
                            'flex-1 py-3 font-mono text-xs uppercase tracking-widest transition-colors',
                            tab === key
                                ? 'text-film-accent border-b-2 border-film-accent -mb-px'
                                : 'text-film-muted hover:text-film-text',
                        ].join(' ')}
                    >
                        {label}
                        <span
                            className={`ml-1.5 text-[10px] ${tab === key ? 'text-film-accent' : 'text-film-border'}`}
                        >
                            {count}
                        </span>
                    </button>
                ))}
            </div>

            {confirmClear && (
                <div className="mx-4 mt-4 flex items-center gap-3 bg-film-surface border border-film-danger rounded-xl px-4 py-3">
                    <AlertTriangle size={16} className="shrink-0 text-film-danger" />
                    <span className="flex-1 font-mono text-xs text-film-muted">
                        필름·카메라·렌즈를 모두 삭제합니다
                    </span>
                    <button
                        onClick={() => {
                            clearAll()
                            setConfirmClear(false)
                        }}
                        className="font-mono text-xs text-film-danger hover:text-red-400 transition-colors px-2 py-1"
                    >
                        삭제
                    </button>
                    <button
                        onClick={() => setConfirmClear(false)}
                        className="font-mono text-xs text-film-muted hover:text-film-text transition-colors px-2 py-1"
                    >
                        취소
                    </button>
                </div>
            )}

            <div className="px-4 py-4">
                {/* Add new form */}
                <div className="flex gap-2 mb-5">
                    <input
                        className="flex-1 bg-film-bg border border-film-border rounded-lg px-3 py-2.5 text-film-text font-mono text-sm placeholder-film-muted focus:outline-none focus:border-film-accent transition-colors"
                        placeholder={
                            tab === 'films'
                                ? '예: Kodak Gold 200'
                                : tab === 'cameras'
                                  ? '예: Leica M6'
                                  : '예: 35mm f/2'
                        }
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    />
                    {tab === 'films' && (
                        <Input
                            type="number"
                            placeholder="ISO"
                            value={newIso}
                            onChange={(e) => setNewIso(e.target.value)}
                            className="w-20"
                        />
                    )}
                    <button
                        onClick={handleAdd}
                        disabled={!newName.trim()}
                        className="shrink-0 text-film-accent hover:text-yellow-400 disabled:text-film-border disabled:pointer-events-none transition-colors"
                    >
                        <PlusCircle size={24} />
                    </button>
                </div>

                {/* List */}
                <div className="bg-film-surface border border-film-border rounded-xl px-4">
                    {tab === 'films' &&
                        (films.length === 0 ? (
                            <EmptyState label="등록된 필름이 없습니다" />
                        ) : (
                            films.map((film) => (
                                <FilmRow
                                    key={film.id}
                                    film={film}
                                    onUpdate={(p) => updateFilm(film.id, p)}
                                    onDelete={() => deleteFilm(film.id)}
                                />
                            ))
                        ))}
                    {tab === 'cameras' &&
                        (cameras.length === 0 ? (
                            <EmptyState label="등록된 카메라가 없습니다" />
                        ) : (
                            cameras.map((cam) => (
                                <SimpleRow
                                    key={cam.id}
                                    item={cam}
                                    onUpdate={(p) => updateCamera(cam.id, p)}
                                    onDelete={() => deleteCamera(cam.id)}
                                />
                            ))
                        ))}
                    {tab === 'lenses' &&
                        (lenses.length === 0 ? (
                            <EmptyState label="등록된 렌즈가 없습니다" />
                        ) : (
                            lenses.map((lens) => (
                                <SimpleRow
                                    key={lens.id}
                                    item={lens}
                                    onUpdate={(p) => updateLens(lens.id, p)}
                                    onDelete={() => deleteLens(lens.id)}
                                />
                            ))
                        ))}
                </div>
            </div>
        </PageLayout>
    )
}

function EmptyState({ label }: { label: string }) {
    return (
        <div className="py-8 text-center">
            <p className="text-film-border font-mono text-sm">{label}</p>
        </div>
    )
}
