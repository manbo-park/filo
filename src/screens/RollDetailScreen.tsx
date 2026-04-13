import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Trash2, Play } from 'lucide-react'
import { PageLayout } from '@/components/ui/PageLayout'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { FrameItem } from '@/components/roll/FrameItem'
import { useRollStore } from '@/store/rollStore'
import { useMasterDataStore } from '@/store/masterDataStore'
import type { Frame } from '@/types'

const APERTURE_OPTIONS = [
    'f/1.0',
    'f/1.2',
    'f/1.4',
    'f/1.8',
    'f/2',
    'f/2.8',
    'f/4',
    'f/5.6',
    'f/8',
    'f/11',
    'f/16',
    'f/22',
    'f/32',
].map((v) => ({ value: v, label: v }))

const SHUTTER_OPTIONS = [
    '1',
    '1/2',
    '1/4',
    '1/8',
    '1/15',
    '1/30',
    '1/60',
    '1/125',
    '1/250',
    '1/500',
    '1/1000',
    '1/2000',
    '1/4000',
    'B',
].map((v) => ({ value: v, label: v }))

export function RollDetailScreen() {
    const { rollId } = useParams<{ rollId: string }>()
    const navigate = useNavigate()
    const { rolls, deleteRoll, updateFrame, deleteFrame } = useRollStore()
    const { films, cameras, lenses } = useMasterDataStore()

    const roll = rolls.find((r) => r.id === rollId)

    const [editingFrame, setEditingFrame] = useState<Frame | null>(null)
    const [lensId, setLensId] = useState('')
    const [aperture, setAperture] = useState('')
    const [shutterSpeed, setShutterSpeed] = useState('')
    const [memo, setMemo] = useState('')
    const [timestamp, setTimestamp] = useState('')
    const [showDeleteRoll, setShowDeleteRoll] = useState(false)

    if (!roll) {
        return (
            <PageLayout title="롤" showBack>
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                    <p className="text-film-muted font-mono text-sm">롤을 찾을 수 없습니다.</p>
                    <Button onClick={() => navigate('/rolls')}>롤 목록으로</Button>
                </div>
            </PageLayout>
        )
    }

    const film = films.find((f) => f.id === roll.filmId)
    const camera = cameras.find((c) => c.id === roll.cameraId)

    const isActive = roll.status === 'active'
    const fmt = (iso: string) =>
        new Date(iso).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    const startStr = fmt(roll.startedAt)
    const endStr = roll.finishedAt ? fmt(roll.finishedAt) : null
    const dateStr = isActive
        ? `${startStr} ~`
        : endStr && endStr !== startStr
          ? `${startStr} ~ ${endStr}`
          : startStr

    // ISO → datetime-local 입력값 (YYYY-MM-DDTHH:mm)
    function toLocalInput(iso: string) {
        const d = new Date(iso)
        const pad = (n: number) => String(n).padStart(2, '0')
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
    }

    function openEditFrame(frame: Frame) {
        setEditingFrame(frame)
        setLensId(frame.lensId ?? '')
        setAperture(frame.aperture ?? '')
        setShutterSpeed(frame.shutterSpeed ?? '')
        setMemo(frame.memo ?? '')
        setTimestamp(toLocalInput(frame.timestamp))
    }

    const prevFrameTimestamp = editingFrame
        ? (roll.frames[editingFrame.frameNumber - 2]?.timestamp ?? null)
        : null

    function saveFrame() {
        if (!editingFrame || !roll) return
        const newTs = new Date(timestamp).toISOString()
        if (prevFrameTimestamp && newTs < prevFrameTimestamp) return
        updateFrame(roll.id, editingFrame.id, {
            lensId: lensId || undefined,
            aperture: aperture || undefined,
            shutterSpeed: shutterSpeed || undefined,
            memo: memo || undefined,
            timestamp: newTs,
        })
        setEditingFrame(null)
    }

    function handleDeleteFrame() {
        if (!editingFrame || !roll) return
        deleteFrame(roll.id, editingFrame.id)
        setEditingFrame(null)
    }

    function handleDeleteRoll() {
        deleteRoll(roll!.id)
        navigate('/rolls', { replace: true })
    }

    return (
        <PageLayout
            title={film?.name ?? 'Roll'}
            showBack
            rightAction={
                <button
                    onClick={() => setShowDeleteRoll(true)}
                    className="p-2 text-film-muted hover:text-film-danger transition-colors"
                    title="롤 삭제"
                >
                    <Trash2 size={16} />
                </button>
            }
        >
            <div className="px-4 py-4">
                {/* Roll meta */}
                <div className="bg-film-surface border border-film-border rounded-xl p-4 mb-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            {isActive && (
                                <>
                                    <span className="w-1.5 h-1.5 rounded-full bg-film-accent animate-pulse" />
                                    <span className="text-film-accent font-mono text-xs uppercase tracking-widest">
                                        촬영 중
                                    </span>
                                </>
                            )}
                            {!isActive && (
                                <span className="text-film-muted font-mono text-xs uppercase tracking-widest">
                                    완료
                                </span>
                            )}
                        </div>
                        <span className="text-film-muted font-mono text-xs">{dateStr}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-center">
                        <div>
                            <div className="text-film-text font-mono font-bold text-lg">
                                {roll.frames.length}
                            </div>
                            <div className="text-film-muted font-mono text-xs">촬영됨</div>
                        </div>
                        <div>
                            <div className="text-film-text font-mono font-bold text-lg">
                                {roll.maxFrames}
                            </div>
                            <div className="text-film-muted font-mono text-xs">전체</div>
                        </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-film-border text-film-muted font-mono text-xs">
                        {camera?.name ?? '—'}
                    </div>
                </div>

                {/* Go to shoot (if active) */}
                {isActive && (
                    <Button
                        variant="primary"
                        size="md"
                        fullWidth
                        className="mb-4"
                        onClick={() => navigate('/shoot')}
                    >
                        <span className="flex items-center justify-center gap-2">
                            <Play size={14} />
                            촬영 계속하기
                        </span>
                    </Button>
                )}

                {/* Frames list */}
                {roll.frames.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-film-border font-mono text-sm">기록된 컷이 없습니다.</p>
                    </div>
                ) : (
                    <div className="bg-film-surface border border-film-border rounded-xl px-4">
                        {roll.frames.map((frame) => (
                            <FrameItem
                                key={frame.id}
                                frame={frame}
                                onEdit={() => openEditFrame(frame)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Edit frame modal */}
            <Modal
                isOpen={!!editingFrame}
                onClose={() => setEditingFrame(null)}
                title={`${editingFrame?.frameNumber ?? ''}번 컷`}
            >
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="font-mono text-xs text-film-muted">촬영 시간</label>
                        <input
                            type="datetime-local"
                            value={timestamp}
                            min={prevFrameTimestamp ? toLocalInput(prevFrameTimestamp) : undefined}
                            onChange={(e) => setTimestamp(e.target.value)}
                            className="w-full bg-film-surface border border-film-border rounded-lg px-3 py-2 font-mono text-sm text-film-text focus:outline-none focus:border-film-accent"
                        />
                        {prevFrameTimestamp && timestamp && new Date(timestamp).toISOString() < prevFrameTimestamp && (
                            <p className="font-mono text-xs text-film-danger">
                                이전 컷({toLocalInput(prevFrameTimestamp).replace('T', ' ')})보다 이른 시간은 설정할 수 없습니다.
                            </p>
                        )}
                    </div>
                    <Select
                        label="렌즈"
                        value={lensId}
                        onChange={(e) => setLensId(e.target.value)}
                        options={lenses.map((l) => ({ value: l.id, label: l.name }))}
                        placeholder="렌즈 선택..."
                    />
                    <Select
                        label="조리개"
                        value={aperture}
                        onChange={(e) => setAperture(e.target.value)}
                        options={APERTURE_OPTIONS}
                        placeholder="조리개 선택..."
                    />
                    <Select
                        label="셔터 속도"
                        value={shutterSpeed}
                        onChange={(e) => setShutterSpeed(e.target.value)}
                        options={SHUTTER_OPTIONS}
                        placeholder="셔터 속도 선택..."
                    />
                    <Input
                        label="메모"
                        value={memo}
                        onChange={(e) => setMemo(e.target.value)}
                        placeholder="이 컷에 대한 메모..."
                    />

                    <div className="flex gap-3 mt-1">
                        <Button variant="danger" size="md" fullWidth onClick={handleDeleteFrame}>
                            삭제
                        </Button>
                        <Button variant="primary" size="md" fullWidth onClick={saveFrame}>
                            저장
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Delete roll confirmation */}
            <Modal
                isOpen={showDeleteRoll}
                onClose={() => setShowDeleteRoll(false)}
                title="롤을 삭제할까요?"
            >
                <div className="flex flex-col gap-4">
                    <p className="text-film-muted font-mono text-sm">
                        이 롤과 기록된 {roll.frames.length}컷을 영구적으로 삭제합니다. 이 작업은
                        되돌릴 수 없습니다.
                    </p>
                    <div className="flex gap-3">
                        <Button
                            variant="secondary"
                            fullWidth
                            onClick={() => setShowDeleteRoll(false)}
                        >
                            취소
                        </Button>
                        <Button variant="danger" fullWidth onClick={handleDeleteRoll}>
                            삭제
                        </Button>
                    </div>
                </div>
            </Modal>
        </PageLayout>
    )
}
