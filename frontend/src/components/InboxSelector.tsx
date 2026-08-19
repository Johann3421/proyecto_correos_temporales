import React, { useState } from 'react';
import { Plus, Check, Pencil, Inbox, ChevronDown, Trash2 } from 'lucide-react';
import { InboxData } from '../services/api';

interface InboxSelectorProps {
  inboxes: InboxData[];
  activeInbox: InboxData | null;
  onSelectInbox: (inbox: InboxData) => void;
  onNewInbox: () => void;
  onRenameInbox: (token: string, newLabel: string) => void;
  onDeleteInbox: (token: string) => void;
  isLoading: boolean;
}

export const InboxSelector: React.FC<InboxSelectorProps> = ({
  inboxes,
  activeInbox,
  onSelectInbox,
  onNewInbox,
  onRenameInbox,
  onDeleteInbox,
  isLoading,
}) => {
  const [editingToken, setEditingToken] = useState<string | null>(null);
  const [tempLabel, setTempLabel] = useState('');

  const startRename = (e: React.MouseEvent, inbox: InboxData) => {
    e.stopPropagation();
    setEditingToken(inbox.access_token);
    setTempLabel(inbox.label || inbox.email_address.split('@')[0]);
  };

  const saveRename = (e: React.MouseEvent | React.FormEvent, token: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (tempLabel.trim()) {
      onRenameInbox(token, tempLabel.trim());
    }
    setEditingToken(null);
  };

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
      {inboxes.map((inbox) => {
        const isActive = activeInbox?.id === inbox.id;
        const isEditing = editingToken === inbox.access_token;
        const displayLabel = inbox.label || inbox.email_address.split('@')[0];

        return (
          <div
            key={inbox.id}
            onClick={() => onSelectInbox(inbox)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-all shrink-0 ${
              isActive
                ? 'border-accent-600/50 bg-accent-50 dark:bg-accent-950/40 text-accent-700 dark:text-accent-300 shadow-sm'
                : 'border-surface-200 dark:border-surface-800 bg-surface-0 dark:bg-surface-900 text-surface-600 dark:text-surface-400 hover:border-surface-300'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? 'bg-accent-600' : 'bg-surface-400'}`} />

              {isEditing ? (
                <form onSubmit={(e) => saveRename(e, inbox.access_token)} className="flex items-center gap-1">
                  <input
                    type="text"
                    value={tempLabel}
                    onChange={(e) => setTempLabel(e.target.value)}
                    autoFocus
                    className="w-24 px-1 py-0.5 text-xs bg-surface-0 dark:bg-surface-800 border border-accent-600 rounded text-surface-900 dark:text-surface-100 focus:outline-none"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button
                    type="button"
                    onClick={(e) => saveRename(e, inbox.access_token)}
                    className="p-0.5 text-ok-DEFAULT hover:bg-surface-200 dark:hover:bg-surface-800 rounded"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                </form>
              ) : (
                <span className="font-semibold truncate max-w-[130px]">
                  {displayLabel}
                </span>
              )}
            </div>

            {inbox.unread_count && inbox.unread_count > 0 ? (
              <span className="px-1.5 py-0.2 rounded-full bg-accent-600 text-white font-mono text-2xs">
                {inbox.unread_count}
              </span>
            ) : null}

            {isActive && !isEditing && (
              <button
                onClick={(e) => startRename(e, inbox)}
                className="p-0.5 text-surface-400 hover:text-surface-900 dark:hover:text-surface-100 rounded"
                title="Renombrar buzón"
              >
                <Pencil className="w-3 h-3" />
              </button>
            )}
          </div>
        );
      })}

      <button
        onClick={onNewInbox}
        disabled={isLoading}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-dashed border-surface-300 dark:border-surface-700 text-xs font-semibold text-accent-700 dark:text-accent-400 hover:bg-accent-50 dark:hover:bg-accent-950/30 transition-all shrink-0"
        title="Crear un buzón adicional"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Nuevo buzón</span>
      </button>
    </div>
  );
};
