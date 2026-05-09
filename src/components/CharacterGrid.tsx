
import React, { useState, useRef, useEffect } from 'react';
import { SymbolMetadata } from '../types';

/**
 * Props for the CharacterGrid component.
 */
interface CharacterGridProps {
  /** The list of characters to display in the grid. */
  characters: string[];
  /** Callback fired when a character is selected (clicked). */
  onSelect: (char: string) => void;
  /** Indicates if the grid is rendering a user-defined custom palette. */
  isCustomPalette?: boolean;
  /** Callback to remove a character from the custom palette. */
  onRemove?: (char: string) => void;
  /** Callback fired when a character is dragged and dropped to a new position. */
  onReorder?: (startIndex: number, endIndex: number) => void;
  /** Indicates if the grid is in "adding mode" (selecting characters to add to a custom palette). */
  isAddingMode?: boolean;
  /** Callback fired when a character is clicked in adding mode. */
  onAddToActive?: (char: string) => void;
  /** Cache containing fetched metadata for characters to display in tooltips. */
  metadataCache: Record<string, SymbolMetadata>;
  /** Callback to trigger a metadata fetch for a hovered character. */
  onHoverChar: (char: string) => void;
}

/**
 * Renders a grid of characters, supporting drag-and-drop reordering for custom palettes,
 * selection, and hover tooltips providing AI-fetched metadata.
 *
 * @param {CharacterGridProps} props - The component props.
 * @returns {React.ReactElement} The rendered component.
 */
const CharacterGrid: React.FC<CharacterGridProps> = ({ 
  characters, 
  onSelect, 
  isCustomPalette, 
  onRemove,
  onReorder,
  isAddingMode,
  onAddToActive,
  metadataCache,
  onHoverChar
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [hoveredChar, setHoveredChar] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  
  const hoverTimeoutRef = useRef<number | null>(null);

  /**
   * Initializes drag operation.
   * @param {React.DragEvent} e - The drag event.
   * @param {number} index - The index of the item being dragged.
   */
  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (!isCustomPalette) return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  /**
   * Handles drag over event to indicate valid drop targets.
   * @param {React.DragEvent} e - The drag event.
   * @param {number} index - The index of the current target item.
   */
  const handleDragOver = (e: React.DragEvent, index: number) => {
    if (!isCustomPalette || draggedIndex === null) return;
    e.preventDefault();
    setDragOverIndex(index);
  };

  /**
   * Finalizes the drag operation and triggers reordering.
   * @param {React.DragEvent} e - The drag event.
   * @param {number} index - The index where the item is dropped.
   */
  const handleDrop = (e: React.DragEvent, index: number) => {
    if (!isCustomPalette || draggedIndex === null || !onReorder) return;
    e.preventDefault();
    if (draggedIndex !== index) {
      onReorder(draggedIndex, index);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  /**
   * Sets hover state, calculates tooltip position, and initiates metadata fetch after a delay.
   * @param {string} char - The hovered character.
   * @param {React.MouseEvent} e - The mouse event.
   */
  const handleMouseEnter = (char: string, e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({ 
      x: rect.left + rect.width / 2, 
      y: rect.top - 8 
    });
    
    setHoveredChar(char);
    
    // Trigger metadata fetch after 300ms pause
    if (hoverTimeoutRef.current) window.clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = window.setTimeout(() => {
      onHoverChar(char);
    }, 300);
  };

  /**
   * Clears hover state and cancels any pending metadata fetch timeout.
   */
  const handleMouseLeave = () => {
    setHoveredChar(null);
    if (hoverTimeoutRef.current) window.clearTimeout(hoverTimeoutRef.current);
  };

  return (
    <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2 p-4 bg-white rounded-xl shadow-inner border border-slate-200 h-[400px] overflow-y-auto relative">
      {characters.map((char, index) => (
        <div 
          key={`${char}-${index}`} 
          className={`relative group transition-all duration-200 ${
            draggedIndex === index ? 'opacity-40 grayscale' : 'opacity-100'
          } ${
            dragOverIndex === index ? 'scale-110 z-10' : ''
          }`}
          onDragOver={(e) => handleDragOver(e, index)}
          onDrop={(e) => handleDrop(e, index)}
          onDragLeave={() => setDragOverIndex(null)}
          onMouseEnter={(e) => handleMouseEnter(char, e)}
          onMouseLeave={handleMouseLeave}
        >
          <button
            draggable={isCustomPalette && !isAddingMode}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragEnd={() => setDraggedIndex(null)}
            onClick={() => isAddingMode && onAddToActive ? onAddToActive(char) : onSelect(char)}
            className={`w-full aspect-square flex items-center justify-center text-xl font-medium rounded-lg transition-all border border-transparent symbol-font active:scale-95 ${
              isAddingMode 
                ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200 animate-pulse' 
                : isCustomPalette 
                  ? 'bg-slate-50 border-slate-100 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 cursor-move'
                  : 'hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 cursor-pointer'
            } ${
              dragOverIndex === index ? 'border-amber-400 bg-amber-100' : ''
            }`}
          >
            {char}
          </button>
          
          {isCustomPalette && onRemove && !isAddingMode && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(char);
              }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-20"
              title="Remove from palette"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {isAddingMode && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-white rounded-full flex items-center justify-center pointer-events-none">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
              </svg>
            </div>
          )}
        </div>
      ))}

      {/* Portal-like Tooltip */}
      {hoveredChar && (
        <div 
          className="fixed z-[100] pointer-events-none transition-opacity duration-200"
          style={{ 
            left: `${tooltipPos.x}px`, 
            top: `${tooltipPos.y}px`,
            transform: 'translate(-50%, -100%)' 
          }}
        >
          <div className="bg-slate-900 text-white p-3 rounded-xl shadow-2xl border border-slate-700 w-48 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-3xl font-bold mb-2 text-indigo-400 symbol-font">{hoveredChar}</div>
            {metadataCache[hoveredChar] ? (
              <>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                  {metadataCache[hoveredChar].description}
                </div>
                <div className="text-[11px] text-slate-300 leading-tight italic">
                  {metadataCache[hoveredChar].usage}
                </div>
              </>
            ) : (
              <div className="space-y-2 py-1">
                <div className="h-2 bg-slate-700 rounded-full w-3/4 animate-pulse"></div>
                <div className="h-2 bg-slate-700 rounded-full w-full animate-pulse"></div>
              </div>
            )}
            {/* Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
          </div>
        </div>
      )}
      
      {characters.length === 0 && (
        <div className="col-span-full flex flex-col items-center justify-center text-slate-400 py-20 gap-4">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <span className="italic">This palette is currently empty.</span>
        </div>
      )}
    </div>
  );
};

export default CharacterGrid;
