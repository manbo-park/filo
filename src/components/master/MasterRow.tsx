import { useState, type ReactNode } from 'react';
import { Edit3, Trash2, Check, X } from 'lucide-react';

interface MasterRowProps {
    onDelete: () => void;
    onSave: () => boolean;
    viewContent: ReactNode;
    editFields: (handleSave: () => void) => ReactNode;
}

export function MasterRow({ onDelete, onSave, viewContent, editFields }: MasterRowProps) {
    const [editing, setEditing] = useState(false);

    function handleSave() {
        if (onSave()) setEditing(false);
    }

    if (editing) {
        return (
            <div className="flex items-center gap-2 py-2 border-b border-film-border last:border-b-0">
                {editFields(handleSave)}
                <button onClick={handleSave} className="text-film-accent hover:text-yellow-400 p-1">
                    <Check size={16} />
                </button>
                <button
                    onClick={() => setEditing(false)}
                    className="text-film-muted hover:text-film-text p-1"
                >
                    <X size={14} />
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 py-2.5 border-b border-film-border last:border-b-0">
            <div className="flex-1 min-w-0">{viewContent}</div>
            <button
                onClick={() => setEditing(true)}
                className="text-film-muted hover:text-film-text p-1"
            >
                <Edit3 size={14} />
            </button>
            <button onClick={onDelete} className="text-film-muted hover:text-film-danger p-1">
                <Trash2 size={14} />
            </button>
        </div>
    );
}
