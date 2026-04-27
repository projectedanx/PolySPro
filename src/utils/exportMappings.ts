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
