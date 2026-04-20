
import React, { useState, useReducer, useRef } from 'react';
import { CHARACTER_SETS } from './constants/charSets';
import CharacterGrid from './components/CharacterGrid';
import CategorySelector from './components/CategorySelector';
import PaletteModal from './components/PaletteModal';
import { findSymbol, getSymbolMetadata } from './services/gemini';
import { AssistantResponse, CharacterSet, SymbolMetadata } from './types';

/**
 * SIC 2.1 Compliance: Using useReducer for complex UI state instead of localStorage.
 * This keeps data purely in memory, preventing potential XSS vectors and 
 * blocking synchronous storage API calls during rendering.
 */
type State = {
  palettes: CharacterSet[];
};

type Action = 
  | { type: 'CREATE_PALETTE'; name: string }
  | { type: 'DELETE_PALETTE'; id: string }
  | { type: 'ADD_TO_PALETTE'; paletteId: string; char: string }
  | { type: 'REMOVE_FROM_PALETTE'; paletteId: string; char: string }
  | { type: 'REORDER_PALETTE'; paletteId: string; startIndex: number; endIndex: number };

function paletteReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'CREATE_PALETTE':
      return {
        ...state,
        palettes: [
          ...state.palettes,
          { id: `custom-${Date.now()}`, name: action.name, characters: [], isCustom: true }
        ]
      };
    case 'ADD_TO_PALETTE':
      return {
        ...state,
        palettes: state.palettes.map(p => 
          p.id === action.paletteId && !p.characters.includes(action.char)
            ? { ...p, characters: [...p.characters, action.char] }
            : p
        )
      };
    case 'REMOVE_FROM_PALETTE':
      return {
        ...state,
        palettes: state.palettes.map(p => 
          p.id === action.paletteId
            ? { ...p, characters: p.characters.filter(c => c !== action.char) }
            : p
        )
      };
    case 'REORDER_PALETTE':
      return {
        ...state,
        palettes: state.palettes.map(p => {
          if (p.id !== action.paletteId) return p;
          const result = [...p.characters];
          const [removed] = result.splice(action.startIndex, 1);
          result.splice(action.endIndex, 0, removed);
          return { ...p, characters: result };
        })
      };
    case 'DELETE_PALETTE':
      return {
        ...state,
        palettes: state.palettes.filter(p => p.id !== action.id)
      };
    default:
      return state;
  }
}

const App: React.FC = () => {
  const [text, setText] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(CHARACTER_SETS[0].id);
  const [paletteState, dispatch] = useReducer(paletteReducer, { palettes: [] });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [assistantQuery, setAssistantQuery] = useState('');
  const [assistantResult, setAssistantResult] = useState<AssistantResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [metadataCache, setMetadataCache] = useState<Record<string, SymbolMetadata>>({});
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const selectedSet = CHARACTER_SETS.find(s => s.id === selectedCategoryId) || 
                    paletteState.palettes.find(s => s.id === selectedCategoryId) || 
                    CHARACTER_SETS[0];

  const handleCharSelect = (char: string) => {
    setText(prev => prev + char);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => setText('');
  const handleBackspace = () => setText(prev => prev.slice(0, -1));

  const runAssistant = async () => {
    if (!assistantQuery.trim()) return;
    setAssistantLoading(true);
    setAssistantResult(null);
    try {
      const res = await findSymbol(assistantQuery);
      setAssistantResult(res);
      // Automatically cache results from assistant
      if (res) {
        setMetadataCache(prev => ({
          ...prev,
          [res.character]: { description: res.description, usage: res.usage }
        }));
      }
    } finally {
      setAssistantLoading(false);
    }
  };

  const fetchCharMetadata = async (char: string) => {
    if (metadataCache[char]) return;
    const res = await getSymbolMetadata(char);
    if (res) {
      setMetadataCache(prev => ({
        ...prev,
        [char]: res
      }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <PaletteModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onCreate={(name) => {
          dispatch({ type: 'CREATE_PALETTE', name });
        }}
      />

      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">Ω</span>
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">PolySymbol Pro</h1>
          </div>
          <div className="flex items-center gap-4">
             <button 
              onClick={() => setIsAddingMode(!isAddingMode)}
              className={`text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full transition-all border-2 ${
                isAddingMode 
                  ? 'bg-amber-100 text-amber-700 border-amber-300' 
                  : 'text-slate-400 border-transparent hover:border-slate-200'
              }`}
             >
               {isAddingMode ? '✨ Adding Mode ON' : 'Palette Mode'}
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="relative group">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Start typing or select characters below..."
              className="w-full h-48 p-6 text-2xl symbol-font bg-white border-2 border-slate-200 rounded-2xl shadow-sm focus:border-indigo-500 focus:ring-0 transition-all resize-none"
            />
            <div className="absolute bottom-4 right-4 flex items-center gap-2">
               <button 
                onClick={handleBackspace}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm font-medium transition-colors"
                title="Backspace"
              >
                ← Back
              </button>
              <button 
                onClick={handleClear}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-sm font-medium transition-colors"
              >
                Clear
              </button>
              <button 
                onClick={handleCopy}
                className={`px-6 py-1.5 rounded-lg text-sm font-bold transition-all ${
                  copied 
                    ? 'bg-emerald-500 text-white shadow-emerald-200' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
                } shadow-lg`}
              >
                {copied ? 'COPIED!' : 'COPY'}
              </button>
            </div>
          </div>

          <div className="bg-slate-100/50 rounded-2xl p-2 border border-slate-200 flex flex-col md:flex-row gap-4 h-[500px]">
            <div className="w-full md:w-56 overflow-y-auto">
              <CategorySelector 
                selectedId={selectedCategoryId} 
                onSelect={(id) => {
                  setSelectedCategoryId(id);
                  if (id.startsWith('custom-')) setIsAddingMode(false);
                }}
                customPalettes={paletteState.palettes}
                onCreateClick={() => setIsModalOpen(true)}
              />
            </div>
            <div className="flex-1 flex flex-col gap-2">
              {isAddingMode && (
                <div className="px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs font-bold text-amber-700 flex items-center gap-2 animate-pulse">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Click any symbol to add it to your active custom palette.
                </div>
              )}
              <CharacterGrid 
                characters={selectedSet.characters} 
                onSelect={handleCharSelect} 
                isCustomPalette={!!selectedSet.isCustom}
                onRemove={(char) => dispatch({ type: 'REMOVE_FROM_PALETTE', paletteId: selectedSet.id, char })}
                onReorder={(start, end) => dispatch({ type: 'REORDER_PALETTE', paletteId: selectedSet.id, startIndex: start, endIndex: end })}
                isAddingMode={isAddingMode && !selectedSet.isCustom}
                onAddToActive={(char) => {
                  const activeCustom = paletteState.palettes.find(p => p.id === selectedCategoryId);
                  if (activeCustom) {
                    dispatch({ type: 'ADD_TO_PALETTE', paletteId: activeCustom.id, char });
                  } else if (paletteState.palettes.length > 0) {
                    dispatch({ type: 'ADD_TO_PALETTE', paletteId: paletteState.palettes[0].id, char });
                  } else {
                    setIsModalOpen(true);
                  }
                }}
                metadataCache={metadataCache}
                onHoverChar={fetchCharMetadata}
              />
              {selectedSet.isCustom && (
                <div className="mt-auto p-4 flex justify-between items-center bg-white rounded-xl border border-slate-200">
                  <div className="text-xs text-slate-400 font-medium">
                    {selectedSet.characters.length} symbols • Drag to reorder
                  </div>
                  <button 
                    onClick={() => {
                      if (confirm('Delete this palette?')) {
                        dispatch({ type: 'DELETE_PALETTE', id: selectedSet.id });
                        setSelectedCategoryId(CHARACTER_SETS[0].id);
                      }
                    }}
                    className="text-[10px] font-bold text-rose-400 hover:text-rose-600 uppercase tracking-widest transition-colors"
                  >
                    Delete Palette
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-indigo-100 rounded flex items-center justify-center text-indigo-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="font-bold text-slate-800">Smart Finder</h2>
            </div>
            <div className="flex gap-2 mb-4">
              <input 
                type="text"
                placeholder="e.g. partial derivative..."
                value={assistantQuery}
                onChange={(e) => setAssistantQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && runAssistant()}
                className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
              <button
                disabled={assistantLoading}
                onClick={runAssistant}
                className="bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-900 disabled:opacity-50 transition-all"
              >
                {assistantLoading ? '...' : 'Find'}
              </button>
            </div>

            {assistantResult && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-4xl symbol-font font-bold text-indigo-700">{assistantResult.character}</span>
                  <div className="flex flex-col gap-1">
                    <button 
                      onClick={() => handleCharSelect(assistantResult.character)}
                      className="text-[10px] bg-indigo-600 text-white px-3 py-1 rounded-full hover:bg-indigo-700 font-bold"
                    >
                      INSERT
                    </button>
                    {paletteState.palettes.length > 0 && (
                      <button 
                        onClick={() => {
                          const target = paletteState.palettes.find(p => p.id === selectedCategoryId) || paletteState.palettes[0];
                          dispatch({ type: 'ADD_TO_PALETTE', paletteId: target.id, char: assistantResult.character });
                        }}
                        className="text-[10px] bg-amber-500 text-white px-3 py-1 rounded-full hover:bg-amber-600 font-bold"
                      >
                        PIN
                      </button>
                    )}
                  </div>
                </div>
                <div className="text-xs font-bold text-indigo-900 mb-1 uppercase tracking-tight">{assistantResult.description}</div>
                <div className="text-xs text-indigo-700/80 leading-relaxed italic">{assistantResult.usage}</div>
              </div>
            )}
          </div>

          <div className="bg-slate-800 rounded-2xl shadow-xl p-6 text-white">
            <h3 className="font-bold mb-4 text-amber-400">Custom Palettes</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="text-amber-500 font-mono">A.</span>
                <span className="text-slate-300">Hover over any symbol for 300ms to see its definition and usage.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-amber-500 font-mono">B.</span>
                <span className="text-slate-300">Drag symbols within your custom palette to reorder them exactly how you like.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-amber-500 font-mono">C.</span>
                <span className="text-slate-300">Toggle <span className="text-white font-bold">Palette Mode</span> to add from standard libraries.</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
