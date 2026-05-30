import type { State, Action, CustomPalette } from '../types';

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

export { paletteReducer };
