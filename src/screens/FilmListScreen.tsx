import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, Download, Film } from 'lucide-react'
import { PageLayout } from '@/components/ui/PageLayout'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { RollCard } from '@/components/roll/RollCard'
import { useRollStore } from '@/store/rollStore'
import { useMasterDataStore } from '@/store/masterDataStore'
import type { ExportData } from '@/types'

const FRAME_COUNT_OPTIONS = [
    { value: '24', label: '24컷' },
    { value: '36', label: '36컷' },
    { value: '48', label: '48컷' },
    { value: '72', label: '72컷' },
]

export function FilmListScreen() {
    const navigate = useNavigate()
    const { rolls, startRoll, importRolls } = useRollStore()
    const { films, cameras, importMasterData } = useMasterDataStore()

    const [showNewRoll, setShowNewRoll] = useState(false)
    const [filmId, setFilmId] = useState('')
    const [cameraId, setCameraId] = useState('')
    const [maxFrames, setMaxFrames] = useState('36')
    const [errors, setErrors] = useState<Record<string, string>>({})

    const sortedRolls = [...rolls].sort(
        (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    )

    function validateAndStart() {
        const newErrors: Record<string, string> = {}
        if (!filmId) newErrors.film = '필름을 선택하세요'
        if (!cameraId) newErrors.camera = '카메라를 선택하세요'
        if (Object.keys(newErrors).length) {
            setErrors(newErrors)
            return
        }
        startRoll({ filmId, cameraId, maxFrames: parseInt(maxFrames) })
        setShowNewRoll(false)
        navigate('/shoot', { replace: true })
    }

    function handleExport() {
        const masterData = useMasterDataStore.getState()
        const rollState = useRollStore.getState()
        const data: ExportData = {
            version: 1,
            exportedAt: new Date().toISOString(),
            masterData: {
                films: masterData.films,
                cameras: masterData.cameras,
                lenses: masterData.lenses,
            },
            rolls: rollState.rolls,
            activeRollId: rollState.activeRollId,
        }
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `flog-export-${new Date().toISOString().split('T')[0]}.json`
        a.click()
        URL.revokeObjectURL(url)
    }

    function handleImport() {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.json'
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0]
            if (!file) return
            const reader = new FileReader()
            reader.onload = (ev) => {
                try {
                    const data = JSON.parse(ev.target?.result as string) as ExportData
                    if (data.version !== 1) throw new Error('Unknown version')
                    importMasterData(data.masterData)
                    importRolls(data.rolls, data.activeRollId)
                    alert('데이터를 성공적으로 가져왔습니다.')
                } catch {
                    alert('유효하지 않은 내보내기 파일입니다.')
                }
            }
            reader.readAsText(file)
        }
        input.click()
    }

    return (
        <PageLayout
            title="flog"
            rightAction={
                <div className="flex items-center gap-1">
                    <button
                        onClick={handleImport}
                        className="p-2 text-film-muted hover:text-film-text transition-colors"
                        title="가져오기"
                    >
                        <Upload size={16} />
                    </button>
                    <button
                        onClick={handleExport}
                        className="p-2 text-film-muted hover:text-film-text transition-colors"
                        title="내보내기"
                    >
                        <Download size={16} />
                    </button>
                </div>
            }
        >
            <div className="px-4 py-4 flex flex-col gap-3">
                {/* Start New Roll CTA */}
                <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={() => {
                        setErrors({})
                        setFilmId('')
                        setCameraId('')
                        setMaxFrames('36')
                        setShowNewRoll(true)
                    }}
                >
                    + 새 롤 시작
                </Button>

                {/* Roll list */}
                {sortedRolls.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Film size={40} className="text-film-border" />
                        <div className="text-center">
                            <p className="text-film-muted font-mono text-sm">롤이 없습니다</p>
                            <p className="text-film-border font-mono text-xs mt-1">
                                첫 번째 롤을 시작하세요!
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2 mt-1">
                        {sortedRolls.map((roll) => (
                            <RollCard key={roll.id} roll={roll} />
                        ))}
                    </div>
                )}
            </div>

            {/* New Roll Modal */}
            <Modal isOpen={showNewRoll} onClose={() => setShowNewRoll(false)} title="새 롤">
                <div className="flex flex-col gap-4">
                    {films.length === 0 || cameras.length === 0 ? (
                        <div className="text-center py-4">
                            <p className="text-film-muted font-mono text-sm">
                                필름과 카메라를 각각 하나 이상 먼저 등록해야 합니다.
                            </p>
                            <Button
                                variant="primary"
                                size="sm"
                                className="mt-4"
                                onClick={() => {
                                    setShowNewRoll(false)
                                    navigate('/master')
                                }}
                            >
                                기본 데이터 등록하기
                            </Button>
                        </div>
                    ) : (
                        <>
                            <Select
                                label="필름"
                                placeholder="필름 선택..."
                                value={filmId}
                                onChange={(e) => {
                                    setFilmId(e.target.value)
                                    setErrors((p) => ({ ...p, film: '' }))
                                }}
                                options={films.map((f) => ({
                                    value: f.id,
                                    label: `${f.name} (ISO ${f.iso})`,
                                }))}
                                error={errors.film}
                            />
                            <Select
                                label="카메라"
                                placeholder="카메라 선택..."
                                value={cameraId}
                                onChange={(e) => {
                                    setCameraId(e.target.value)
                                    setErrors((p) => ({ ...p, camera: '' }))
                                }}
                                options={cameras.map((c) => ({ value: c.id, label: c.name }))}
                                error={errors.camera}
                            />
                            <Select
                                label="최대 컷 수"
                                value={maxFrames}
                                onChange={(e) => setMaxFrames(e.target.value)}
                                options={FRAME_COUNT_OPTIONS}
                            />

                            <Button
                                variant="primary"
                                size="lg"
                                fullWidth
                                onClick={validateAndStart}
                            >
                                롤 장전 →
                            </Button>
                        </>
                    )}
                </div>
            </Modal>
        </PageLayout>
    )
}
