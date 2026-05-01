import sys

def patch_app():
    with open('src/App.tsx', 'r') as f:
        content = f.read()

    # 1. Add import for StudyMode
    if "import StudyMode" not in content:
        content = content.replace(
            "import PaletteModal from './components/PaletteModal';",
            "import PaletteModal from './components/PaletteModal';\nimport StudyMode from './components/StudyMode';"
        )

    # 2. Add isStudyMode state
    if "const [isStudyMode, setIsStudyMode] = useState(false);" not in content:
        content = content.replace(
            "const [isAddingMode, setIsAddingMode] = useState(false);",
            "const [isAddingMode, setIsAddingMode] = useState(false);\n  const [isStudyMode, setIsStudyMode] = useState(false);"
        )

    # 3. Add Study Mode toggle button
    study_mode_button = """                    <button
                      onClick={() => setIsStudyMode(true)}
                      className="text-[10px] font-bold text-amber-500 hover:text-amber-700 uppercase tracking-widest transition-colors flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                      Study Mode
                    </button>"""

    if "Study Mode" not in content:
        content = content.replace(
            '<div className="flex gap-2 items-center">',
            f'<div className="flex gap-2 items-center">\n{study_mode_button}'
        )

    # 4. Conditionally render StudyMode or CharacterGrid
    study_mode_render = """              {isStudyMode ? (
                <StudyMode
                  palette={selectedSet}
                  metadataCache={metadataCache}
                  onHoverChar={fetchCharMetadata}
                  onExit={() => setIsStudyMode(false)}
                />
              ) : ("""

    if "<StudyMode" not in content:
        content = content.replace(
            "<CharacterGrid ",
            study_mode_render + "\n              <CharacterGrid "
        )
        # Close the ternary operator right after CharacterGrid
        content = content.replace(
            "onHoverChar={fetchCharMetadata}\n              />",
            "onHoverChar={fetchCharMetadata}\n              />\n              )}"
        )

    with open('src/App.tsx', 'w') as f:
        f.write(content)

if __name__ == "__main__":
    patch_app()
    print("App.tsx patched.")
