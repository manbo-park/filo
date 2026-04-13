import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Database } from 'lucide-react'

interface PageLayoutProps {
    title: ReactNode
    children: ReactNode
    showBack?: boolean
    onBack?: () => void
    rightAction?: ReactNode
    className?: string
}

export function PageLayout({
    title,
    children,
    showBack,
    onBack,
    rightAction,
    className = '',
}: PageLayoutProps) {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-film-bg">
            {/* Header — fixed so it stays put in PWA standalone mode */}
            <header className="fixed top-0 inset-x-0 z-10 bg-film-bg border-b border-film-border px-4 pt-safe-top">
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
                    <div className="flex items-center gap-2">
                        {rightAction}
                        {!showBack && (
                            <button
                                onClick={() => navigate('/master')}
                                className="text-film-muted hover:text-film-text transition-colors p-1"
                                title="기본 데이터"
                            >
                                <Database size={18} />
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Content — pt-header pushes content below the fixed header */}
            <main className={`pt-header ${className}`}>{children}</main>
        </div>
    )
}
