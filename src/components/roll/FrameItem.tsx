import { Aperture, Clock, FileText, Edit3 } from 'lucide-react'
import type { Frame } from '@/types'
import { useMasterDataStore } from '@/store/masterDataStore'

interface FrameItemProps {
    frame: Frame
    onEdit: () => void
}

export function FrameItem({ frame, onEdit }: FrameItemProps) {
    const lens = useMasterDataStore((s) => s.lenses.find((l) => l.id === frame.lensId))
    const time = new Date(frame.timestamp)
    const timeStr = time.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    })
    const dateStr = time.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
    })

    const hasMetadata = frame.lensId || frame.aperture || frame.shutterSpeed || frame.memo
    const isUntagged = !hasMetadata

    return (
        <button
            onClick={onEdit}
            className="w-full flex items-start gap-4 py-3 border-b border-film-border last:border-b-0 text-left hover:bg-film-surface/50 rounded-lg px-1 -mx-1 transition-colors active:scale-[0.99]"
        >
            {/* Frame number */}
            <div className="shrink-0 w-8 text-center">
                <span className="text-film-accent font-mono font-bold text-base">
                    {String(frame.frameNumber).padStart(2, '0')}
                </span>
            </div>

            {/* Metadata */}
            <div className="flex-1 min-w-0">
                {/* Timestamp */}
                <div className="flex items-center gap-2 text-film-muted text-xs font-mono mb-1">
                    <Clock size={11} />
                    <span>
                        {dateStr} {timeStr}
                    </span>
                </div>

                {hasMetadata ? (
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                        {lens && (
                            <div className="flex items-center gap-1 text-film-text text-xs font-mono">
                                <span className="text-film-muted">lens</span>
                                <span>{lens.name}</span>
                            </div>
                        )}
                        {frame.aperture && (
                            <div className="flex items-center gap-1 text-film-text text-xs font-mono">
                                <Aperture size={11} className="text-film-accent" />
                                <span>{frame.aperture}</span>
                            </div>
                        )}
                        {frame.shutterSpeed && (
                            <div className="flex items-center gap-1 text-film-text text-xs font-mono">
                                <span className="text-film-muted">ss</span>
                                <span>{frame.shutterSpeed}</span>
                            </div>
                        )}
                        {frame.memo && (
                            <div className="flex items-center gap-1 text-film-muted text-xs font-mono max-w-full">
                                <FileText size={11} />
                                <span className="truncate">{frame.memo}</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <span className="text-film-border text-xs font-mono italic">
                        탭하여 메모 추가
                    </span>
                )}
            </div>

            {/* Edit indicator */}
            <div
                className={`shrink-0 mt-0.5 ${isUntagged ? 'text-film-border' : 'text-film-muted'}`}
            >
                <Edit3 size={14} />
            </div>
        </button>
    )
}
