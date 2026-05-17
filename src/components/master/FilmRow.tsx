import { useState } from 'react';
import { MasterRow } from './MasterRow';
import type { Film } from '@/types';

interface FilmRowProps {
    film: Film;
    onUpdate: (patch: Partial<Omit<Film, 'id'>>) => void;
    onDelete: () => void;
}

export function FilmRow({ film, onUpdate, onDelete }: FilmRowProps) {
    const [name, setName] = useState(film.name);
    const [iso, setIso] = useState(String(film.iso));

    return (
        <MasterRow
            onDelete={onDelete}
            onSave={() => {
                if (!name.trim()) return false;
                onUpdate({ name: name.trim(), iso: parseInt(iso) || film.iso });
                return true;
            }}
            viewContent={
                <>
                    <span className="text-film-text font-mono text-sm">{film.name}</span>
                    <span className="text-film-muted font-mono text-xs ml-2">ISO {film.iso}</span>
                </>
            }
            editFields={() => (
                <>
                    <input
                        className="flex-1 bg-film-bg border border-film-accent rounded px-2 py-1 text-film-text font-mono text-sm focus:outline-none"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoFocus
                    />
                    <input
                        className="w-16 bg-film-bg border border-film-border rounded px-2 py-1 text-film-text font-mono text-sm focus:outline-none text-right"
                        value={iso}
                        onChange={(e) => setIso(e.target.value)}
                        type="number"
                        placeholder="ISO"
                    />
                </>
            )}
        />
    );
}
