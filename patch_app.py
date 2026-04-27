import sys

def patch_file(filename):
    with open(filename, 'r') as f:
        content = f.read()

    # Import dependencies
    import_str = "import { findSymbol, getSymbolMetadata, mineTopology } from './services/gemini';\nimport { PluriversalKnowledgeCapsule } from './types';"
    content = content.replace("import { findSymbol, getSymbolMetadata } from './services/gemini';", import_str)

    # Add state variables
    state_str = """  const [metadataCache, setMetadataCache] = useState<Record<string, {description: string, usage: string}>>({});

  // Lexical Topology Miner State
  const [topologyQuery, setTopologyQuery] = useState('');
  const [topologyLoading, setTopologyLoading] = useState(false);
  const [topologyResult, setTopologyResult] = useState<PluriversalKnowledgeCapsule | null>(null);"""
    content = content.replace("  const [metadataCache, setMetadataCache] = useState<Record<string, {description: string, usage: string}>>({});", state_str)

    # Add runTopologyMiner function
    func_str = """  const fetchCharMetadata = async (char: string) => {
    if (metadataCache[char]) return;
    const res = await getSymbolMetadata(char);
    if (res) {
      setMetadataCache(prev => ({
        ...prev,
        [char]: res
      }));
    }
  };

  const runTopologyMiner = async () => {
    if (!topologyQuery.trim()) return;
    setTopologyLoading(true);
    setTopologyResult(null);
    try {
      const res = await mineTopology(topologyQuery);
      setTopologyResult(res);
    } finally {
      setTopologyLoading(false);
    }
  };"""
    content = content.replace("""  const fetchCharMetadata = async (char: string) => {
    if (metadataCache[char]) return;
    const res = await getSymbolMetadata(char);
    if (res) {
      setMetadataCache(prev => ({
        ...prev,
        [char]: res
      }));
    }
  };""", func_str)

    # Add UI
    ui_str = """            {assistantResult && (
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
          </div>"""

    content = content.replace("""            {assistantResult && (
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
          </div>""", ui_str)

    with open(filename, 'w') as f:
        f.write(content)

patch_file('src/App.tsx')
