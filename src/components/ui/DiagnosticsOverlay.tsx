import React, { useState, useEffect } from 'react';
import { diagnostics, LogEntry } from '../../utils/diagnostics';
import { X, Copy, Trash2, Power } from 'lucide-react';

export const DiagnosticsOverlay: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [standbyDisabled, setStandbyDisabled] = useState(diagnostics.disableStandbyAudio);

  useEffect(() => {
    setLogs([...diagnostics.getLogs()]);
    const unsub = diagnostics.subscribe(() => {
      setLogs([...diagnostics.getLogs()]);
      setStandbyDisabled(diagnostics.disableStandbyAudio);
    });
    return unsub;
  }, []);

  const handleCopy = () => {
    const text = logs.map(l => `[${l.timestamp}] [${l.source}] ${l.message}\n${JSON.stringify(l.state, null, 2)}`).join('\n\n');
    navigator.clipboard.writeText(text).catch(console.error);
    alert('Logs copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
      <div className="bg-[#1C1B1B] w-full max-w-4xl h-[80vh] flex flex-col rounded-lg border border-[#282828] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#282828] bg-[#131313]">
          <h2 className="text-white font-bold tracking-widest uppercase text-sm">Media Session Diagnostics</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => diagnostics.toggleStandbyAudio()}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-colors ${
                standbyDisabled ? 'bg-[#FF3B00] text-white' : 'bg-[#282828] text-gray-300 hover:bg-[#333]'
              }`}
            >
              <Power className="w-4 h-4" />
              {standbyDisabled ? 'Preloader Disabled' : 'Disable Preloader'}
            </button>
            <button onClick={handleCopy} className="text-gray-400 hover:text-white p-2">
              <Copy className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-white p-2">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Log List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {logs.length === 0 ? (
            <div className="text-center text-gray-500 py-10 text-sm">No logs recorded yet.</div>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="bg-[#0A0A0A] border border-[#282828] rounded p-3 font-mono text-xs text-gray-300">
                <div className="flex items-center gap-2 mb-2 text-[#FF3B00]">
                  <span>[{log.timestamp}]</span>
                  <span className="font-bold">{log.source}</span>
                  <span className="text-white">{log.message}</span>
                </div>
                {log.state && Object.keys(log.state).length > 0 && (
                  <pre className="text-gray-500 overflow-x-auto">
                    {JSON.stringify(log.state, null, 2)}
                  </pre>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
