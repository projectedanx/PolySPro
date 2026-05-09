
import React, { useState, useReducer, useRef } from 'react';
import { AgenticIntervention } from './types';
import { convertToLatex, convertToHtmlEntities } from './utils/exportMappings';
import { CHARACTER_SETS } from './constants/charSets';
import CharacterGrid from './components/CharacterGrid';
import CategorySelector from './components/CategorySelector';
import PaletteModal from './components/PaletteModal';
import StudyMode from './components/StudyMode';
import { findSymbol, getSymbolMetadata, mineTopology, predictNextSymbol } from './services/gemini';
import { evaluateEpistemicEscrow } from './services/agentic/epistemicEscrow';
import { checkPlausibility } from './services/agentic/plausibilityOracle';
import { PluriversalKnowledgeCapsule } from './types';
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

/**
 * The root application component for PolySymbol Pro.
 *
 * Manages the global state for active character sets, custom user palettes,
 * Study Mode transitions, and integration with advanced Agentic components
 * like the Plausibility Oracle and Epistemic Escrow.
 *
 * @returns {React.ReactElement} The rendered application.
 */
const App: React.FC = () => {
  const [text, setText] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(CHARACTER_SETS[0].id);
  const [paletteState, dispatch] = useReducer(paletteReducer, { palettes: [] });
  /** State controlling the visibility of the "Create Custom Palette" modal. */
  const [isModalOpen, setIsModalOpen] = useState(false);
  /** State indicating if the UI is in a mode allowing users to select symbols to add to a custom palette. */
  const [isAddingMode, setIsAddingMode] = useState(false);
  /** State indicating if the full-screen Study Mode (quiz interface) is active. */
  const [isStudyMode, setIsStudyMode] = useState(false);
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [assistantQuery, setAssistantQuery] = useState('');
  const [assistantResult, setAssistantResult] = useState<AssistantResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  /** State cache storing previously fetched symbol metadata from the Gemini API to reduce network calls. */
  const [metadataCache, setMetadataCache] = useState<Record<string, SymbolMetadata>>({});
  const [suggestion, setSuggestion] = useState<string | null>(null);

  /** State bound to the input field for querying the Lexical Topology Miner (RAG). */
  const [topologyQuery, setTopologyQuery] = useState('');
  /** State tracking loading status during Lexical Topology queries. */
  const [topologyLoading, setTopologyLoading] = useState(false);
  const [topologyResult, setTopologyResult] = useState<any | null>(null);

  // Agentic Inversion State
  /** State holding current intervention messages from the Plausibility Oracle or Epistemic Escrow. */
  const [agenticIntervention, setAgenticIntervention] = useState<AgenticIntervention | null>(null);

  const autocompleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const selectedSet = CHARACTER_SETS.find(s => s.id === selectedCategoryId) || 
                    paletteState.palettes.find(s => s.id === selectedCategoryId) || 
                    CHARACTER_SETS[0];


  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    setSuggestion(null);

    if (autocompleteTimeoutRef.current) {
      clearTimeout(autocompleteTimeoutRef.current);
    }

    if (newText.trim().length > 0) {
      autocompleteTimeoutRef.current = setTimeout(async () => {
        const next = await predictNextSymbol(newText);
        if (next) {
          setSuggestion(next);
        }
      }, 300);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab' && suggestion) {
      e.preventDefault();
      setText(prev => prev + suggestion);
      setSuggestion(null);
    } else if (e.key !== 'Shift' && e.key !== 'Control' && e.key !== 'Alt' && e.key !== 'Meta') {
        // If they type something else, clear suggestion immediately
        if (suggestion && e.key.length === 1 && suggestion.startsWith(e.key)) {
            // allow typing over the suggestion partially, but for simplicity we can just clear it and let the debounce fetch a new one
            setSuggestion(null);
        } else {
            setSuggestion(null);
        }
    }
  };

  const handleCharSelect = (char: string) => {
    setText(prev => prev + char);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleExport = async (format: 'plain' | 'latex' | 'html') => {
    if (!text) return;

    let exportText = text;
    if (format === 'latex') {
      exportText = convertToLatex(text);
    } else if (format === 'html') {
      exportText = convertToHtmlEntities(text);
    }

    try {
      await navigator.clipboard.writeText(exportText);
      setCopied(true);
      setExportMenuOpen(false);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  const handleExportPalette = (palette: CharacterSet) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(palette, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", palette.name + ".json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleClear = () => setText('');
  const handleBackspace = () => setText(prev => prev.slice(0, -1));

  const runAssistant = async () => {
    if (!assistantQuery.trim()) return;
    setAssistantLoading(true);
    setAssistantResult(null);
    setAgenticIntervention(null);
    try {
      // Epistemic Escrow Check
      const escrowCheck = await evaluateEpistemicEscrow(assistantQuery);
      if (escrowCheck && escrowCheck.is_escrowed) {
        setAgenticIntervention({
          type: 'ESCROW',
          message: "Epistemic Escrow Triggered: Interpretive Fracture Detected.",
          details: escrowCheck
        });
        return;
      }

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

  /**
   * Executes a query against the Lexical Topology Miner.
   * Intercepts the query with the Epistemic Escrow first to prevent ambiguous execution.
   */
  const runTopologyMiner = async () => {
    if (!topologyQuery.trim()) return;
    setTopologyLoading(true);
    setTopologyResult(null);
    setAgenticIntervention(null);
    try {
      // Plausibility Oracle Check
      const constraints = [
        "Must not invoke server-side specific language or APIs",
        "Must be purely conceptual or client-side abstract",
        "Must not request direct database manipulation"
      ];
      const plausibilityCheck = await checkPlausibility(topologyQuery, constraints);

      if (plausibilityCheck && !plausibilityCheck.is_valid) {
        setAgenticIntervention({
          type: 'ORACLE_REJECTION',
          message: "Plausibility Oracle: Structural Constraint Violation.",
          details: plausibilityCheck
        });
        return;
      }

      const res = await mineTopology(topologyQuery);
      setTopologyResult(res);
    } finally {
      setTopologyLoading(false);
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

      {agenticIntervention && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border-2 border-rose-500">
            <h2 className="text-xl font-bold text-rose-600 mb-2">{agenticIntervention.message}</h2>
            <div className="text-sm text-slate-700 mb-6 space-y-2">
              {agenticIntervention.type === 'ESCROW' && (
                <>
                  <p><span className="font-bold">Ambiguity Source:</span> {(agenticIntervention.details as any).ambiguity_source}</p>
                  <p className="bg-amber-50 p-3 rounded border border-amber-200 text-amber-900 font-medium">
                    {(agenticIntervention.details as any).clarifying_question}
                  </p>
                </>
              )}
              {agenticIntervention.type === 'ORACLE_REJECTION' && (
                <>
                  <p><span className="font-bold">Violated Constraint:</span> {(agenticIntervention.details as any).violated_constraint}</p>
                  <p><span className="font-bold text-slate-900">Justification:</span> {(agenticIntervention.details as any).justification}</p>
                  <p className="bg-rose-50 p-3 rounded border border-rose-200 text-rose-900 font-medium">
                    {(agenticIntervention.details as any).required_action}
                  </p>
                </>
              )}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setAgenticIntervention(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 font-bold text-sm"
              >
                Acknowledge & Revise
              </button>
            </div>
          </div>
        </div>
      )}

        <div className="lg:col-span-8 flex flex-col gap-6">

          <div className="relative group">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder="Start typing or select characters below..."
              className="w-full h-48 p-6 text-2xl symbol-font bg-transparent border-2 border-slate-200 rounded-2xl shadow-sm focus:border-indigo-500 focus:ring-0 transition-all resize-none relative z-10"
              style={{ caretColor: 'black' }}
            />
            {suggestion && (
              <div
                className="absolute top-0 left-0 w-full h-48 p-6 text-2xl symbol-font pointer-events-none z-0 text-slate-400 whitespace-pre-wrap break-words"
                aria-hidden="true"
              >
                <span className="invisible">{text}</span>
                <span className="text-slate-300 bg-slate-100 rounded px-1">{suggestion}</span>
              </div>
            )}

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
              <div className="relative">
                <button
                  onClick={() => setExportMenuOpen(!exportMenuOpen)}
                  className={`px-6 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                    copied
                      ? 'bg-emerald-500 text-white shadow-emerald-200'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
                  } shadow-lg`}
                >
                  {copied ? 'COPIED!' : 'EXPORT'}
                  <svg className={`w-4 h-4 transition-transform ${exportMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </button>

                {exportMenuOpen && (
                  <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <button onClick={() => handleExport('plain')} className="w-full text-left px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 border-b border-slate-100 transition-colors">Copy Plain Text</button>
                    <button onClick={() => handleExport('latex')} className="w-full text-left px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 border-b border-slate-100 transition-colors flex items-center justify-between">Copy as LaTeX <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold">Pro</span></button>
                    <button onClick={() => handleExport('html')} className="w-full text-left px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors flex items-center justify-between">Copy HTML Entities <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold">Pro</span></button>
                  </div>
                )}
              </div>
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
                            {isStudyMode ? (
                <StudyMode
                  palette={selectedSet}
                  metadataCache={metadataCache}
                  onHoverChar={fetchCharMetadata}
                  onExit={() => setIsStudyMode(false)}
                />
              ) : (
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
              )}
              {selectedSet.isCustom && (
                <div className="mt-auto p-4 flex justify-between items-center bg-white rounded-xl border border-slate-200">
                  <div className="text-xs text-slate-400 font-medium">
                    {selectedSet.characters.length} symbols • Drag to reorder
                  </div>
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={() => setIsStudyMode(true)}
                      className="text-[10px] font-bold text-amber-500 hover:text-amber-700 uppercase tracking-widest transition-colors flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                      Study Mode
                    </button>
                    <button
                      onClick={() => handleExportPalette(selectedSet)}
                      className="text-[10px] font-bold text-indigo-500 hover:text-indigo-700 uppercase tracking-widest transition-colors flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      Export
                    </button>
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

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-emerald-100 rounded flex items-center justify-center text-emerald-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h2 className="font-bold text-slate-800">Lexical Topology Miner</h2>
            </div>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Extract isomorphisms across domains..."
                value={topologyQuery}
                onChange={(e) => setTopologyQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && runTopologyMiner()}
                className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
              <button
                disabled={topologyLoading}
                onClick={runTopologyMiner}
                className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 disabled:opacity-50 transition-all"
              >
                {topologyLoading ? 'Mining...' : 'Mine'}
              </button>
            </div>

            {topologyResult && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                <h3 className="text-xs font-bold text-emerald-900 mb-2 uppercase tracking-widest border-b border-emerald-200 pb-1">Latent Bridge</h3>
                <p className="text-sm text-emerald-800 mb-4">{topologyResult.latent_bridge}</p>
                <h3 className="text-xs font-bold text-emerald-900 mb-2 uppercase tracking-widest border-b border-emerald-200 pb-1">Topology Nodes</h3>
                <div className="space-y-2">
                  {topologyResult.nodes.map((node, i) => (
                    <div key={i} className="bg-white/60 p-2 rounded-lg border border-emerald-100">
                      <span className="text-xs font-bold text-emerald-700 block mb-1">{node.domain}</span>
                      <span className="text-xs text-slate-600 leading-relaxed block">{node.context}</span>
                    </div>
                  ))}
                </div>
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
