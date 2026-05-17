import { useState } from 'react';
import { MasterRow } from './MasterRow';
import type { Lens } from '@/types';

interface LensRowProps {
    lens: Lens;
    onUpdate: (patch: { name: string }) => void;
    onDelete: () => void;
}

export function LensRow({ lens, onUpdate, onDelete }: LensRowProps) {
    const [name, setName] = useState(lens.name);

    return (
        <MasterRow
            onDelete={onDelete}
            onSave={() => {
                if (!name.trim()) return false;
                onUpdate({ name: name.trim() });
                return true;
            }}
            viewContent={
                <span className="text-film-text font-mono text-sm">{lens.name}</span>
            }
            editFields={(handleSave) => (
                <input
                    className="flex-1 bg-film-bg border border-film-accent rounded px-2 py-1 text-film-text font-mono text-sm focus:outline-none"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                />
            )}
        />
    );
}
