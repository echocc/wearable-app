'use client';

import { useState } from 'react';

export default function SyncButton() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [message, setMessage] = useState('');

  const handleSync = async () => {
    setIsSyncing(true);
    setMessage('');

    try {
      const response = await fetch('/api/oura/sync', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to sync data');
      }

      const data = await response.json();
      setMessage(
        `Synced ${data.synced.sleep} sleep, ${data.synced.activity} activity, ${data.synced.readiness} readiness records`
      );

      // Reload the page to refresh data
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Error syncing:', error);
      setMessage('Failed to sync data. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleSync}
        disabled={isSyncing}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isSyncing ? 'Syncing...' : 'Sync Oura Data'}
      </button>
      {message && (
        <span className="text-sm text-gray-600">{message}</span>
      )}
    </div>
  );
}
