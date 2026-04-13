import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, List, Film, Camera, RefreshCw } from 'lucide-react'
import { PageLayout } from '@/components/ui/PageLayout'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useRollStore } from '@/store/rollStore'
import { useMasterDataStore } from '@/store/masterDataStore'

export function ShootingScreen() {
    const navigate = useNavigate()
    const { rolls, activeRollId, recordFrame, finishRoll, setCurrentLens } = useRollStore()
    const { films, cameras, lenses } = useMasterDataStore()
    const [showFinishConfirm, setShowFinishConfirm] = useState(false)
    const [showLensSwap, setShowLensSwap] = useState(false)
    const [justRecorded, setJustRecorded] = useState(false)

    const activeRoll = rolls.find((r) => r.id === activeRollId && r.status === 'active')

    if (!activeRoll) {
        return (
            <PageLayout title="촬영">
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                    <p className="text-film-muted font-mono text-sm">촬영 중인 롤이 없습니다.</p>
                    <Button variant="primary" onClick={() => navigate('/rolls', { replace: true })}>
                        롤 목록으로
                    </Button>
                </div>
            </PageLayout>
        )
    }

    const film = films.find((f) => f.id === activeRoll.filmId)
    const camera = cameras.find((c) => c.id === activeRoll.cameraId)
    const currentLens = lenses.find((l) => l.id === activeRoll.currentLensId)

    const frameCount = activeRoll.frames.length
    const maxFrames = activeRoll.maxFrames
    const isRollFull = frameCount >= maxFrames
    const nextFrame = frameCount + 1
    const progressPct = Math.min((frameCount / maxFrames) * 100, 100)

    function handleRecord() {
        if (isRollFull) return
        recordFrame(activeRoll!.id)
        setJustRecorded(true)
        setTimeout(() => setJustRecorded(false), 600)
    }

    function handleFinish() {
        finishRoll(activeRoll!.id)
        setShowFinishConfirm(false)
        navigate('/rolls', { replace: true })
    }

    return (
        <PageLayout
            title="촬영"
            showBack
            onBack={() => navigate('/rolls')}
            rightAction={
                <button
                    onClick={() => navigate(`/rolls/${activeRoll.id}`)}
                    className="p-2 text-film-muted hover:text-film-text transition-colors"
                    title="컷 목록 보기"
                >
                    <List size={18} />
                </button>
            }
        >
            <div className="flex flex-col h-content px-4 py-4">
                {/* Roll info card */}
                <div className="bg-film-surface border border-film-border rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="w-2 h-2 rounded-full bg-film-accent animate-pulse" />
                        <span className="text-film-accent font-mono text-xs uppercase tracking-widest">
                            현재 롤
                        </span>
                    </div>

                    <div className="flex items-center gap-2 mb-1">
                        <Film size={14} className="text-film-accent" />
                        <span className="text-film-text font-mono font-semibold text-sm">
                            {film?.name ?? '—'}
                        </span>
                        {film?.iso && (
                            <span className="text-film-muted font-mono text-xs">
                                ISO {film.iso}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Camera size={14} className="text-film-muted" />
                            <span className="text-film-muted font-mono text-xs">
                                {camera?.name ?? '—'}
                            </span>
                        </div>
                        <button
                            onClick={() => setShowLensSwap(true)}
                            className="flex items-center gap-1.5 text-film-muted hover:text-film-text transition-colors"
                        >
                            <RefreshCw size={11} />
                            <span className="font-mono text-xs">
                                {currentLens ? currentLens.name : '렌즈 없음'}
                            </span>
                        </button>
                    </div>

                    {/* Progress */}
                    <div className="mt-4">
                        <div className="flex justify-between text-xs font-mono mb-1.5">
                            <span className="text-film-muted">{frameCount}컷 촬영</span>
                            <span className={isRollFull ? 'text-film-accent' : 'text-film-muted'}>
                                {maxFrames - frameCount}컷 남음
                            </span>
                        </div>
                        <div className="h-1 bg-film-border rounded-full overflow-hidden">
                            <div
                                className="h-full accent-gradient-bg transition-all duration-300"
                                style={{ width: `${progressPct}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Frame counter — big display */}
                <div className="flex-1 flex flex-col items-center justify-center gap-2">
                    <span className="text-film-muted font-mono text-xs uppercase tracking-widest">
                        {isRollFull ? '롤 완료' : '다음 컷'}
                    </span>
                    <div
                        className={[
                            'text-[9rem] font-mono font-bold leading-none tabular-nums transition-all duration-150',
                            justRecorded ? 'text-film-accent scale-110' : 'text-film-text',
                            isRollFull ? 'text-film-muted' : '',
                        ]
                            .filter(Boolean)
                            .join(' ')}
                    >
                        {isRollFull
                            ? String(maxFrames).padStart(2, '0')
                            : String(nextFrame).padStart(2, '0')}
                    </div>
                    <span className="text-film-border font-mono text-sm">
                        / {String(maxFrames).padStart(2, '0')}
                    </span>
                </div>

                {/* RECORD button */}
                <div className="flex flex-col gap-3 pb-safe-bottom">
                    {isRollFull ? (
                        <div className="text-center">
                            <p className="text-film-accent font-mono text-sm mb-4">
                                롤이 꽉 찼습니다. 마무리할 시간이에요!
                            </p>
                        </div>
                    ) : (
                        <button
                            onClick={handleRecord}
                            className={[
                                'w-full py-6 rounded-2xl font-mono font-bold text-xl tracking-widest uppercase transition-all duration-150 active:scale-[0.97]',
                                justRecorded
                                    ? 'accent-gradient-bg text-film-bg'
                                    : 'accent-gradient-border text-film-text',
                            ]
                                .filter(Boolean)
                                .join(' ')}
                        >
                            {justRecorded ? '✓ 기록됨' : '⬤  촬영'}
                        </button>
                    )}

                    <Button
                        variant={isRollFull ? 'primary' : 'ghost'}
                        size="md"
                        fullWidth
                        onClick={() => setShowFinishConfirm(true)}
                    >
                        <span className="flex items-center justify-center gap-2">
                            <CheckCircle size={16} />롤 마무리
                        </span>
                    </Button>
                </div>
            </div>

            {/* Finish confirmation */}
            <Modal
                isOpen={showFinishConfirm}
                onClose={() => setShowFinishConfirm(false)}
                title="롤을 마무리할까요?"
            >
                <div className="flex flex-col gap-4">
                    <p className="text-film-muted font-mono text-sm">
                        <span className="text-film-text font-bold">{frameCount}</span> /{' '}
                        <span className="text-film-text font-bold">{maxFrames}</span>컷을
                        촬영했습니다. 마무리하면 이 롤은 읽기 전용이 됩니다.
                    </p>
                    <div className="flex gap-3">
                        <Button
                            variant="secondary"
                            fullWidth
                            onClick={() => setShowFinishConfirm(false)}
                        >
                            취소
                        </Button>
                        <Button variant="primary" fullWidth onClick={handleFinish}>
                            마무리
                        </Button>
                    </div>
                </div>
            </Modal>
            {/* Lens swap modal */}
            <Modal isOpen={showLensSwap} onClose={() => setShowLensSwap(false)} title="렌즈 교환">
                <div className="flex flex-col gap-1">
                    {lenses.length === 0 ? (
                        <p className="text-film-muted font-mono text-sm text-center py-4">
                            등록된 렌즈가 없습니다.
                        </p>
                    ) : (
                        <>
                            {lenses.map((lens) => {
                                const isSelected = lens.id === activeRoll.currentLensId
                                return (
                                    <button
                                        key={lens.id}
                                        onClick={() => {
                                            setCurrentLens(activeRoll.id, lens.id)
                                            setShowLensSwap(false)
                                        }}
                                        className={[
                                            'w-full text-left px-4 py-3 rounded-lg font-mono text-sm transition-colors',
                                            isSelected
                                                ? 'bg-film-accent/15 text-film-accent'
                                                : 'text-film-text hover:bg-film-surface',
                                        ].join(' ')}
                                    >
                                        {lens.name}
                                        {isSelected && (
                                            <span className="ml-2 text-xs text-film-accent">✓</span>
                                        )}
                                    </button>
                                )
                            })}
                            <div className="border-t border-film-border mt-1 pt-1">
                                <button
                                    onClick={() => {
                                        setCurrentLens(activeRoll.id, undefined)
                                        setShowLensSwap(false)
                                    }}
                                    className="w-full text-left px-4 py-3 rounded-lg font-mono text-sm text-film-muted hover:bg-film-surface transition-colors"
                                >
                                    렌즈 없음
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </Modal>
        </PageLayout>
    )
}
