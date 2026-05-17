import { useState } from 'react';
import { MasterRow } from './MasterRow';
import type { Camera } from '@/types';

interface CameraRowProps {
    camera: Camera;
    onUpdate: (patch: Partial<Omit<Camera, 'id'>>) => void;
    onDelete: () => void;
}

export function CameraRow({ camera, onUpdate, onDelete }: CameraRowProps) {
    const [name, setName] = useState(camera.name);
    const [brand, setBrand] = useState(camera.brand ?? '');

    return (
        <MasterRow
            onDelete={onDelete}
            onSave={() => {
                if (!name.trim()) return false;
                onUpdate({ name: name.trim(), brand: brand.trim() || undefined });
                return true;
            }}
            viewContent={
                <>
                    <span className="text-film-text font-mono text-sm">{camera.name}</span>
                    {camera.brand && (
                        <span className="text-film-muted font-mono text-xs ml-2">
                            {camera.brand}
                        </span>
                    )}
                </>
            }
            editFields={(handleSave) => (
                <div className="flex-1 flex flex-col gap-1">
                    <input
                        className="w-full bg-film-bg border border-film-accent rounded px-2 py-1 text-film-text font-mono text-sm focus:outline-none"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                        placeholder="카메라 이름"
                    />
                    <input
                        className="w-full bg-film-bg border border-film-border rounded px-2 py-1 text-film-text font-mono text-xs focus:outline-none focus:border-film-accent"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                        placeholder="제조사 (선택)"
                    />
                </div>
            )}
        />
    );
}
