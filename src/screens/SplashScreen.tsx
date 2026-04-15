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
        // 구독 등록 전에 이미 완료된 경우를 처리
        if (useRollStore.persist.hasHydrated()) setRollsHydrated(true)
        if (useMasterDataStore.persist.hasHydrated()) setMasterHydrated(true)
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
            <img src="/filo-logo-white-with-shadow.png" alt="filo" className="h-40" />

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
            ) : null}
        </div>
    )
}
