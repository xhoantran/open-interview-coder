import { useState } from 'react';
import { useSyncedStore } from '../../lib/store';

export function APIKeyUpdate() {
  const { apiKey, setApiKey } = useSyncedStore();
  const [isEditing, setIsEditing] = useState(false);

  const trimmedApiKey = (key: string) => {
    if (key.length > 6) {
      return `${key.slice(0, 3)}...${key.slice(-3)}`;
    }
    return key;
  };

  return (
    <div className="mb-3 px-2 space-y-1">
      <div className="flex items-center justify-between text-[13px] font-medium text-white/90">
        <span className="text-nowrap">API Key</span>
        {isEditing ? (
          <input
            id="api-key"
            name="apiKey"
            type="password"
            defaultValue={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your API key"
            className="ml-4 block w-full rounded px-2 py-1 text-sm outline-none border border-white/10 focus:border-white/20"
          />
        ) : (
          <button
            type="button"
            className="bg-white/10 rounded px-2 py-1 text-sm outline-none border border-white/10 focus:border-white/20"
            onClick={() => setIsEditing(true)}
          >
            {apiKey.length > 0 ? trimmedApiKey(apiKey) : 'Add API Key'}
          </button>
        )}
      </div>
      {isEditing && (
        <div className="flex items-center justify-between mt-2">
          <button
            type="button"
            className="bg-emerald-600/80 hover:bg-emerald-500/90 text-white rounded px-2 py-1 text-sm"
            onClick={() => setIsEditing(false)}
          >
            Save
          </button>
          <button
            type="button"
            className="bg-neutral-700/80 hover:bg-neutral-600/90 text-white/80 rounded px-2 py-1 text-sm ml-2"
            onClick={() => {
              // Handle cancel action
              setIsEditing(false);
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
