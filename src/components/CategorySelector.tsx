
import React from 'react';
import { CHARACTER_SETS } from '../constants/charSets';
import { CharacterSet } from '../types';

interface CategorySelectorProps {
  selectedId: string;
  onSelect: (id: string) => void;
  customPalettes: CharacterSet[];
  onCreateClick: () => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({ 
  selectedId, 
  onSelect, 
  customPalettes, 
  onCreateClick 
}) => {
  return (
    <div className="flex flex-col gap-1 pr-4 overflow-y-auto h-full scrollbar-hide">
      <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Library</div>
      {CHARACTER_SETS.map((set) => (
        <button
          key={set.id}
          onClick={() => onSelect(set.id)}
          className={`px-4 py-2 text-sm font-medium rounded-lg text-left transition-all ${
            selectedId === set.id
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-200 hover:text-indigo-600'
          }`}
        >
          {set.name}
        </button>
      ))}

      <div className="mt-6 px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
        Your Palettes
        <button 
          onClick={onCreateClick}
          className="text-indigo-600 hover:text-indigo-800 p-1 rounded-full hover:bg-indigo-50 transition-colors"
          title="Create New Palette"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
      
      {customPalettes.length === 0 ? (
        <div className="px-4 py-3 text-xs text-slate-400 italic border border-dashed border-slate-200 rounded-lg mx-2">
          No custom palettes created.
        </div>
      ) : (
        customPalettes.map((set) => (
          <button
            key={set.id}
            onClick={() => onSelect(set.id)}
            className={`px-4 py-2 text-sm font-medium rounded-lg text-left transition-all flex items-center justify-between group ${
              selectedId === set.id
                ? 'bg-amber-500 text-white shadow-md'
                : 'text-slate-600 hover:bg-amber-50 hover:text-amber-700'
            }`}
          >
            <span className="truncate">{set.name}</span>
            <span className="text-[10px] opacity-60 font-mono">{set.characters.length}</span>
          </button>
        ))
      )}
    </div>
  );
};

export default CategorySelector;
