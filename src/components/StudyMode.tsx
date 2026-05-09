import React, { useState, useEffect } from 'react';
import { CharacterSet, QuizQuestion, StudyModeState, SymbolMetadata } from '../types';
import { generateQuizDistractors, getSymbolMetadata } from '../services/gemini';

/**
 * Props for the StudyMode component.
 */
interface StudyModeProps {
  /** The character set to use as the source material for the quiz. */
  palette: CharacterSet;
  /** Cached metadata definitions used to generate correct answers. */
  metadataCache: Record<string, SymbolMetadata>;
  /** Callback to trigger a fetch for missing metadata. */
  onHoverChar: (char: string) => void;
  /** Callback fired to exit Study Mode and return to the main interface. */
  onExit: () => void;
}

/**
 * Implements an interactive "Study Mode" featuring dynamically generated multiple-choice quizzes
 * based on a given character set, utilizing the AI to generate plausible distractors.
 *
 * @param {StudyModeProps} props - The component props.
 * @returns {React.ReactElement} The rendered component representing a specific phase of the quiz lifecycle.
 */
const StudyMode: React.FC<StudyModeProps> = ({ palette, metadataCache, onHoverChar, onExit }) => {
  const [state, setState] = useState<StudyModeState>('idle');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [loadingMsg, setLoadingMsg] = useState('Initializing Study Mode...');

  // [∇] Uncertainty: The API calls might fail or timeout. We handle this with a fallback,
  // but the user experience during a 10+ second wait (for large palettes) might be poor.
  /**
   * Initializes the quiz process by selecting symbols, ensuring their metadata is cached,
   * and generating plausible distractors using the AI. Updates component state through the loading phase.
   */
  const startQuiz = async () => {
    setState('loading');
    const newQuestions: QuizQuestion[] = [];

    // We only take up to 10 symbols to prevent excessive API load initially
    const symbolsToQuiz = [...palette.characters].sort(() => 0.5 - Math.random()).slice(0, 10);

    for (let i = 0; i < symbolsToQuiz.length; i++) {
      const char = symbolsToQuiz[i];
      setLoadingMsg(`Generating question ${i + 1} of ${symbolsToQuiz.length}...`);

      // Ensure we have metadata
      let meta = metadataCache[char];
      if (!meta) {
        meta = await getSymbolMetadata(char) || { description: 'Unknown Symbol', usage: '' };
        onHoverChar(char); // update cache in parent implicitly
      }

      const distractors = await generateQuizDistractors(char, meta.description);

      const options = distractors && distractors.length === 3
        ? [...distractors, meta.description]
        : [meta.description, 'Alternative A', 'Alternative B', 'Alternative C']; // Fallback

      // Shuffle options
      newQuestions.push({
        symbol: char,
        correctAnswer: meta.description,
        options: options.sort(() => 0.5 - Math.random())
      });
    }

    setQuestions(newQuestions);
    setCurrentIndex(0);
    setScore(0);
    setState('active');
  };

  /**
   * Evaluates the selected answer against the correct description, updates the score,
   * and advances to the next question or finishes the quiz.
   *
   * @param {string} selectedOption - The user's chosen answer.
   */
  const handleAnswer = (selectedOption: string) => {
    const currentQ = questions[currentIndex];
    if (selectedOption === currentQ.correctAnswer) {
      setScore(s => s + 1);
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      setState('finished');
    }
  };

  if (state === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-inner border border-slate-200 h-[400px]">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Study Mode: {palette.name}</h2>
        <p className="text-slate-600 mb-8 text-center max-w-md">
          Test your knowledge of the symbols in this palette. We'll generate a multiple-choice quiz using AI-generated distractors.
        </p>
        <button
          onClick={startQuiz}
          disabled={palette.characters.length === 0}
          className="px-6 py-3 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 disabled:opacity-50 transition-colors shadow-sm"
        >
          {palette.characters.length === 0 ? 'Palette is empty' : 'Start Quiz'}
        </button>
      </div>
    );
  }

  if (state === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-inner border border-slate-200 h-[400px]">
        <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-600 font-medium">{loadingMsg}</p>
        <p className="text-xs text-slate-400 mt-2 text-center max-w-xs">
          (This creates Semantic Parallax Zones by generating plausible alternatives based on domain context)
        </p>
      </div>
    );
  }

  if (state === 'finished') {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-inner border border-slate-200 h-[400px]">
        <h2 className="text-3xl font-black text-slate-800 mb-2">Quiz Complete!</h2>
        <div className="text-6xl font-bold text-amber-500 mb-6">
          {Math.round((score / questions.length) * 100)}%
        </div>
        <p className="text-slate-600 font-medium mb-8">
          You got {score} out of {questions.length} correct.
        </p>
        <div className="flex gap-4">
          <button
            onClick={startQuiz}
            className="px-6 py-2 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-colors"
          >
            Retake
          </button>
          <button
            onClick={onExit}
            className="px-6 py-2 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300 transition-colors"
          >
            Exit Study Mode
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="flex flex-col p-6 bg-white rounded-xl shadow-inner border border-slate-200 h-[400px]">
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">
          Question {currentIndex + 1} of {questions.length}
        </div>
        <div className="text-sm font-bold text-amber-500">
          Score: {score}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        <div className="text-8xl font-black symbol-font text-indigo-700 select-none">
          {currentQ.symbol}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
          {currentQ.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(opt)}
              className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-all text-left"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudyMode;
