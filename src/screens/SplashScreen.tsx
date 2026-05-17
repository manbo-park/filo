import { useEffect, useSyncExternalStore } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRollStore } from '@/store/rollStore';
import { useMasterDataStore } from '@/store/masterDataStore';

interface PersistApi {
    hasHydrated: () => boolean;
    onFinishHydration: (fn: () => void) => () => void;
}

// 스토어의 persist hydration 완료 여부를 외부 스토어로 구독한다.
// useSyncExternalStore가 구독 등록 시점에 스냅샷을 재확인하므로,
// 렌더와 구독 사이에 hydration이 끝나는 race를 별도 처리 없이 안전하게 다룬다.
function useHydrated(persist: PersistApi) {
    return useSyncExternalStore(
        (onStoreChange) => persist.onFinishHydration(onStoreChange),
        () => persist.hasHydrated(),
    );
}

export function SplashScreen() {
    const navigate = useNavigate();

    const rollsHydrated = useHydrated(useRollStore.persist);
    const masterHydrated = useHydrated(useMasterDataStore.persist);

    const activeRollId = useRollStore((s) => s.activeRollId);
    const rolls = useRollStore((s) => s.rolls);

    useEffect(() => {
        if (!rollsHydrated || !masterHydrated) return;

        const activeRoll = rolls.find((r) => r.id === activeRollId && r.status === 'active');

        const timer = setTimeout(() => {
            navigate(activeRoll ? '/shoot' : '/rolls', { replace: true });
        }, 1200);

        return () => clearTimeout(timer);
    }, [rollsHydrated, masterHydrated, activeRollId, rolls, navigate]);

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
    );
}
