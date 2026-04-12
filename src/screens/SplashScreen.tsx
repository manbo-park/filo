import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRollStore } from '@/store/rollStore'
import { useMasterDataStore } from '@/store/masterDataStore'

export function SplashScreen() {
    const navigate = useNavigate()

    // persist.hasHydrated()로 초기값 설정 — 이미 hydrated면 true로 시작
    const [rollsHydrated, setRollsHydrated] = useState(() => useRollStore.persist.hasHydrated())
    const [masterHydrated, setMasterHydrated] = useState(() =>
        useMasterDataStore.persist.hasHydrated()
    )

    // hydration이 완료될 때 state 업데이트 → re-render 발생
    useEffect(() => {
        const unsubRolls = useRollStore.persist.onFinishHydration(() => setRollsHydrated(true))
        const unsubMaster = useMasterDataStore.persist.onFinishHydration(() =>
            setMasterHydrated(true)
        )
        return () => {
            unsubRolls()
            unsubMaster()
        }
    }, [])

    const activeRollId = useRollStore((s) => s.activeRollId)
    const rolls = useRollStore((s) => s.rolls)

    useEffect(() => {
        if (!rollsHydrated || !masterHydrated) return

        const activeRoll = rolls.find((r) => r.id === activeRollId && r.status === 'active')

        const timer = setTimeout(() => {
            navigate(activeRoll ? '/shoot' : '/rolls', { replace: true })
        }, 1200)

        return () => clearTimeout(timer)
    }, [rollsHydrated, masterHydrated, activeRollId, rolls, navigate])

    return (
        <div className="fixed inset-0 bg-film-bg flex flex-col items-center justify-center gap-6 animate-fade-in">
            {/* Logo */}
            <div className="flex flex-col items-center gap-3">
                <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
                        <rect
                            x="8"
                            y="16"
                            width="48"
                            height="32"
                            rx="3"
                            fill="#1a1a1a"
                            stroke="#2a2a2a"
                            strokeWidth="1.5"
                        />
                        <rect x="12" y="20" width="6" height="5" rx="1" fill="#0a0a0a" />
                        <rect x="12" y="29" width="6" height="5" rx="1" fill="#0a0a0a" />
                        <rect x="12" y="38" width="6" height="5" rx="1" fill="#0a0a0a" />
                        <rect x="46" y="20" width="6" height="5" rx="1" fill="#0a0a0a" />
                        <rect x="46" y="29" width="6" height="5" rx="1" fill="#0a0a0a" />
                        <rect x="46" y="38" width="6" height="5" rx="1" fill="#0a0a0a" />
                        <rect x="22" y="20" width="20" height="24" rx="1" fill="#d4a853" opacity="0.15" />
                        <circle cx="32" cy="32" r="4" fill="#d4a853" />
                    </svg>
                </div>

                <div className="flex flex-col items-center gap-1">
                    <span className="text-film-text font-mono font-bold text-3xl tracking-[0.2em]">
                        flog
                    </span>
                    <span className="text-film-muted font-mono text-xs tracking-widest uppercase">
                        필름 로그북
                    </span>
                </div>
            </div>

            {/* Loading indicator */}
            {!rollsHydrated || !masterHydrated ? (
                <div className="flex gap-1.5 mt-4">
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className="w-1 h-1 rounded-full bg-film-muted animate-pulse"
                            style={{ animationDelay: `${i * 150}ms` }}
                        />
                    ))}
                </div>
            ) : (
                <div className="w-16 h-0.5 bg-film-border rounded-full mt-4 overflow-hidden">
                    <div className="h-full bg-film-accent" style={{ width: '100%' }} />
                </div>
            )}
        </div>
    )
}
