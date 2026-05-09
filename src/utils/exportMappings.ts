/**
 * A dictionary mapping special Unicode symbols to their LaTeX equivalents.
 *
 * @constant
 * @type {Record<string, string>}
 */
export const latexMapping: Record<string, string> = {
  '∑': '\\sum', '∏': '\\prod', '∂': '\\partial', '√': '\\sqrt{}', '∞': '\\infty', '∫': '\\int',
  '≈': '\\approx', '≠': '\\neq', '≤': '\\leq', '≥': '\\geq', '±': '\\pm', '×': '\\times', '÷': '\\div',
  '∈': '\\in', '∉': '\\notin', '⊆': '\\subseteq', '⊂': '\\subset', '∩': '\\cap', '∪': '\\cup',
  '∇': '\\nabla', '∆': '\\Delta', '∀': '\\forall', '∃': '\\exists', '∴': '\\therefore', '∵': '\\because',
  '⊕': '\\oplus', '⊗': '\\otimes', '⊥': '\\perp', '∥': '\\parallel', '∠': '\\angle', '≡': '\\equiv',
  '∝': '\\propto', 'α': '\\alpha', 'β': '\\beta', 'γ': '\\gamma', 'δ': '\\delta', 'ε': '\\epsilon',
  'θ': '\\theta', 'λ': '\\lambda', 'μ': '\\mu', 'π': '\\pi', 'σ': '\\sigma', 'τ': '\\tau', 'φ': '\\phi',
  'ψ': '\\psi', 'ω': '\\omega', 'Δ': '\\Delta', 'Ω': '\\Omega'
};

/**
 * Converts special symbols within a given text string into their LaTeX representations.
 *
 * It iterates over the predefined `latexMapping` and replaces any found symbols.
 * Multiple spaces are cleaned up in the final output.
 *
 * @param {string} text - The input string containing potential symbols.
 * @returns {string} The formatted string with LaTeX syntax inserted.
 */
export const convertToLatex = (text: string): string => {
  let result = text;
  Object.keys(latexMapping).forEach((char) => {
    // Escape special regex characters if needed, though most single chars are fine.
    const regex = new RegExp(`\\${char}`, 'g');
    result = result.replace(regex, ` ${latexMapping[char]} `);
  });
  // Clean up excessive spaces
  return result.replace(/\s+/g, ' ').trim();
};

/**
 * Converts non-ASCII characters within a given text string to their corresponding HTML entities.
 *
 * @param {string} text - The input string to be converted.
 * @returns {string} The resulting string with HTML entities (e.g., `&#123;`).
 */
export const convertToHtmlEntities = (text: string): string => {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    // Convert anything above standard ASCII to HTML entity
    if (code > 127) {
      result += `&#${code};`;
    } else {
      result += text[i];
    }
  }
  return result;
};
