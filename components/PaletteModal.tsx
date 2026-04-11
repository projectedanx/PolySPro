
import React, { useState } from 'react';

interface PaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}

const PaletteModal: React.FC<PaletteModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">New Custom Palette</h2>
          <p className="text-sm text-slate-500 mt-1">Group your most used scientific symbols.</p>
        </div>
        <div className="p-6">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Palette Name</label>
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Quantum Physics Set"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
            onKeyDown={(e) => e.key === 'Enter' && name.trim() && (onCreate(name), setName(''), onClose())}
          />
        </div>
        <div className="p-6 bg-slate-50 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (name.trim()) {
                onCreate(name);
                setName('');
                onClose();
              }
            }}
            className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all"
          >
            Create Palette
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaletteModal;
