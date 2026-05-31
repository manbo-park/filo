import { type ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { lockBodyScroll, unlockBodyScroll } from '@/lib/scrollLock';
import { DebugViewport } from '@/components/ui/DebugViewport';

interface PageLayoutProps {
    title: ReactNode;
    children: ReactNode;
    showBack?: boolean;
    onBack?: () => void;
    rightAction?: ReactNode;
    className?: string;
    noScroll?: boolean;
}

export function PageLayout({
    title,
    children,
    showBack,
    onBack,
    rightAction,
    className = '',
    noScroll = false,
}: PageLayoutProps) {
    const navigate = useNavigate();

    useEffect(() => {
        if (!noScroll) return;
        lockBodyScroll();
        return () => {
            unlockBodyScroll();
        };
    }, [noScroll]);

    const header = (
        <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
                {showBack && (
                    <button
                        onClick={() => (onBack ? onBack() : navigate(-1))}
                        className="text-film-muted hover:text-film-text transition-colors p-1 -ml-1"
                    >
                        <ArrowLeft size={20} />
                    </button>
                )}
                <h1 className="text-film-text font-mono font-semibold tracking-wider text-sm uppercase">
                    {title}
                </h1>
            </div>
            <div className="flex items-center gap-2">{rightAction}</div>
        </div>
    );

    // 촬영 화면처럼 스크롤이 없는 페이지는 상단 고정 + 100lvh 루트로 구성한다.
    // dvh/innerHeight는 재진입 시 마운트 순간 큰 값으로 잡혔다가 수축해 콘텐츠가
    // 튀고, svh(작은 뷰포트)는 안정적이지만 상단 인셋만큼 짧아 바닥에 공백이
    // 남는다. lvh(큰 뷰포트=전체 화면 높이)는 콜드 스타트·재진입 모두에서 항상
    // 동일한 값으로 안정적이며 화면을 꽉 채운다. 상단은 pt-safe-top, 하단은
    // pb-safe-bottom이 각각 인셋을 처리한다.
    if (noScroll) {
        return (
            <div className="fixed inset-x-0 top-0 h-lvh flex flex-col overflow-hidden bg-film-bg">
                <DebugViewport />
                <header className="shrink-0 bg-film-bg border-b border-film-border px-4 pt-safe-top">
                    {header}
                </header>
                <main className={`flex-1 min-h-0 overflow-hidden ${className}`}>{children}</main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-film-bg">
            {/* Header — fixed so it stays put in PWA standalone mode */}
            <header className="fixed top-0 inset-x-0 z-10 bg-film-bg border-b border-film-border px-4 pt-safe-top">
                {header}
            </header>
            {/* Content — pt-header pushes content below the fixed header */}
            <main className={`pt-header ${className}`}>{children}</main>
        </div>
    );
}
