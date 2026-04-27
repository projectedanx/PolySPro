
export interface CharacterSet {
  id: string;
  name: string;
  characters: string[];
  isCustom?: boolean;
}

export interface AssistantResponse {
  character: string;
  description: string;
  usage: string;
}

export interface SymbolMetadata {
  description: string;
  usage: string;
}

export interface PaletteAction {
  type: 'CREATE' | 'DELETE' | 'ADD_CHAR' | 'REMOVE_CHAR';
  payload: any;
}

export interface TopologyNode {
  domain: string;
  context: string;
}

export interface PluriversalKnowledgeCapsule {
  latent_bridge: string;
  nodes: TopologyNode[];
}
