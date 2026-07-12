const defaultCodes = {
  strict: `// Strict mode tokenizes specified words and operators.
// Non-specified characters like @ or # generate errors.
int x = 42;
while (x <= 50) {
  if (x == 45) {
    return x;
  }
  x = x + 1;
}
@ # $`,
  cpp: `#include <iostream>
using namespace std;

int main() {
    // This C++ comment will be skipped
    int calcTotal = 42;
    double version = 3.14;

    if (calcTotal != 10) {
        cout << "Success!" << endl;
    }
    return 0;
}`,
  python: `# This is a Python comment that will be skipped
def calc_total(x):
    version = 3.14
    if x <= 10:
        return x * 2
    else:
        return None

calc_total(42)`,
  javascript: `// Modern Javascript Mode
const calcTotal = 42;
let version = 3.14;

/* Block comment
   will also be skipped */
function getRatio(x) {
    if (x === 0) {
        return null;
    }
    return calcTotal / x;
}`,
  java: `package main;

public class Main {
    // This is a Java comment
    public static void main(String[] args) {
        int x = 42;
        double pi = 3.14;
        if (x != 0) {
            System.out.println("Lexer Working!");
        }
    }
}`
};

const modeLabels = {
  strict: 'Strict Assignment Mode',
  cpp: 'C / C++',
  python: 'Python',
  javascript: 'JavaScript',
  java: 'Java'
};

const keywordsByMode = {
  strict: ['if', 'while', 'int', 'return', 'for'],
  cpp: [
    'alignas', 'alignof', 'and', 'and_eq', 'asm', 'atomic_cancel', 'atomic_commit', 'atomic_noexcept',
    'auto', 'bitand', 'bitor', 'bool', 'break', 'case', 'catch', 'char', 'char8_t', 'char16_t',
    'char32_t', 'class', 'compl', 'concept', 'const', 'consteval', 'constexpr', 'constinit', 'const_cast',
    'continue', 'co_await', 'co_return', 'co_yield', 'decltype', 'default', 'delete', 'do', 'double',
    'dynamic_cast', 'else', 'enum', 'explicit', 'export', 'extern', 'false', 'float', 'for', 'friend',
    'goto', 'if', 'inline', 'int', 'long', 'mutable', 'namespace', 'new', 'noexcept', 'not', 'not_eq',
    'nullptr', 'operator', 'or', 'or_eq', 'private', 'protected', 'public', 'reflexpr', 'register',
    'reinterpret_cast', 'requires', 'return', 'short', 'signed', 'sizeof', 'static', 'static_assert',
    'static_cast', 'struct', 'switch', 'synchronized', 'template', 'this', 'thread_local', 'throw',
    'true', 'try', 'typedef', 'typeid', 'typename', 'union', 'unsigned', 'using', 'virtual', 'void',
    'volatile', 'wchar_t', 'while', 'xor', 'xor_eq'
  ],
  python: [
    'False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await', 'break', 'class',
    'continue', 'def', 'del', 'elif', 'else', 'except', 'finally', 'for', 'from', 'global',
    'if', 'import', 'in', 'is', 'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return',
    'try', 'while', 'with', 'yield'
  ],
  javascript: [
    'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default', 'delete',
    'do', 'else', 'export', 'extends', 'false', 'finally', 'for', 'function', 'if', 'import',
    'in', 'instanceof', 'new', 'null', 'return', 'super', 'switch', 'this', 'throw', 'true',
    'try', 'typeof', 'var', 'void', 'while', 'with', 'yield', 'let', 'static', 'enum',
    'await', 'implements', 'package', 'protected', 'interface', 'private', 'public'
  ],
  java: [
    'abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class', 'const',
    'continue', 'default', 'do', 'double', 'else', 'enum', 'extends', 'final', 'finally', 'float',
    'for', 'goto', 'if', 'implements', 'import', 'instanceof', 'int', 'interface', 'long', 'native',
    'new', 'package', 'private', 'protected', 'public', 'return', 'short', 'static', 'strictfp',
    'super', 'switch', 'synchronized', 'this', 'throw', 'throws', 'transient', 'try', 'void',
    'volatile', 'while', 'true', 'false', 'null'
  ]
};

const operatorsByMode = {
  strict: ['==', '!=', '<=', '>=', '+', '-', '*', '/', '='],
  default: ['===', '!==', '==', '!=', '<=', '>=', '+=', '-=', '*=', '/=', '%=', '&&', '||', '++', '--', '<<', '>>', '->', '+', '-', '*', '/', '=', '<', '>', '%', '&', '|', '^', '!', '~', '?']
};

const delimitersByMode = {
  strict: [';', ',', '{', '}', '(', ')'],
  default: [';', ',', '{', '}', '(', ')', '[', ']', '.', ':', '?']
};

const codeInput = document.getElementById('code-input');
const highlightLayer = document.getElementById('highlight-layer');
const modeSelect = document.getElementById('mode-select');
const editorLabel = document.getElementById('editor-label');
const runButton = document.getElementById('run-btn');
const fileField = document.getElementById('file-field');
const fileStatus = document.getElementById('file-status');
const errorBox = document.getElementById('error-box');
const tableSearch = document.getElementById('table-search');
const tableBody = document.getElementById('tokens-table-body');
const resultsSummary = document.getElementById('results-summary');

let currentMode = modeSelect.value;
let currentTokens = [];
let currentCode = defaultCodes[currentMode];

function setEditorMode(mode) {
  currentMode = mode;
  editorLabel.textContent = `${modeLabels[mode]} Editor`;
  if (!currentCode || currentCode === '') {
    currentCode = defaultCodes[mode];
  }
  codeInput.value = currentCode;
  updateEditorHighlight();
}

function renderStats(tokens) {
  document.getElementById('total-tokens').textContent = tokens.length;
  const uniqueLexemes = new Set(tokens.map((token) => token.lexeme));
  document.getElementById('unique-lexemes').textContent = uniqueLexemes.size;
  const lineCount = currentCode ? currentCode.split(/\n/).length : 1;
  document.getElementById('line-count').textContent = lineCount;
  const errorCount = tokens.filter((token) => token.type === 'ERROR').length;
  document.getElementById('error-count').textContent = errorCount;
}

function renderSummary(tokens) {
  const counts = tokens.reduce((acc, token) => {
    acc[token.type] = (acc[token.type] || 0) + 1;
    return acc;
  }, {});

  const chips = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => `
      <div class="summary-chip">
        <span>${escapeHtml(type)}</span>
        <strong>${count}</strong>
      </div>
    `)
    .join('');

  resultsSummary.innerHTML = `
    <div class="summary-heading">Analysis snapshot</div>
    <div class="summary-grid">${chips}</div>
  `;
}

function renderTable() {
  const query = tableSearch.value.trim().toLowerCase();
  const filtered = currentTokens.filter((token) => {
    if (!query) return true;
    return `${token.lexeme} ${token.type}`.toLowerCase().includes(query);
  });

  if (!filtered.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="4" class="empty-row">
          No tokens match the current filter.
        </td>
      </tr>`;
    return;
  }

  tableBody.innerHTML = filtered.map((token) => `
    <tr>
      <td><span class="lexeme-text">${escapeHtml(token.lexeme)}</span></td>
      <td><span class="token-badge badge-${token.type.toLowerCase()}">${token.type}</span></td>
      <td class="coord-cell">${token.line}</td>
      <td class="coord-cell">${token.column}</td>
    </tr>
  `).join('');
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function updateEditorHighlight() {
  const code = codeInput.value;
  const tokens = tokenize(code, currentMode);
  let html = '';
  let cursor = 0;

  tokens.forEach((token) => {
    const start = token.startIndex;
    const end = token.endIndex;
    if (start > cursor) {
      html += escapeHtml(code.slice(cursor, start));
    }
    const className = `token-${token.type.toLowerCase()}`;
    html += `<span class="${className}">${escapeHtml(token.lexeme)}</span>`;
    cursor = end;
  });

  if (cursor < code.length) {
    html += escapeHtml(code.slice(cursor));
  }

  highlightLayer.innerHTML = html || '<span class="token-comment">// Start typing your code…</span>';
}

function tokenize(code, mode) {
  const tokens = [];
  const keywords = keywordsByMode[mode] || keywordsByMode.strict;
  const operators = [...(mode === 'strict' ? operatorsByMode.strict : operatorsByMode.default)].sort((a, b) => b.length - a.length);
  const delimiters = mode === 'strict' ? delimitersByMode.strict : delimitersByMode.default;

  let index = 0;
  let line = 1;
  let column = 1;
  const length = code.length;

  while (index < length) {
    const char = code[index];
    const startIndex = index;
    const startColumn = column;
    const startLine = line;

    if (mode !== 'strict') {
      if (char === '/' && code[index + 1] === '/') {
        const commentStart = index;
        index += 2;
        column += 2;
        while (index < length && code[index] !== '\n' && code[index] !== '\r') {
          index++;
          column++;
        }
        tokens.push({
          lexeme: code.slice(commentStart, index),
          type: 'COMMENT',
          line: startLine,
          column: startColumn,
          startIndex: commentStart,
          endIndex: index
        });
        continue;
      }

      if (char === '/' && code[index + 1] === '*') {
        const commentStart = index;
        index += 2;
        column += 2;
        while (index < length) {
          if (code[index] === '*' && code[index + 1] === '/') {
            index += 2;
            column += 2;
            break;
          }
          if (code[index] === '\n') {
            line++;
            column = 1;
          } else if (code[index] === '\r') {
            if (code[index + 1] === '\n') {
              index++;
            }
            line++;
            column = 1;
          } else {
            column++;
          }
          index++;
        }
        tokens.push({
          lexeme: code.slice(commentStart, index),
          type: 'COMMENT',
          line: startLine,
          column: startColumn,
          startIndex: commentStart,
          endIndex: index
        });
        continue;
      }

      if (mode === 'python' && char === '#') {
        const commentStart = index;
        index++;
        column++;
        while (index < length && code[index] !== '\n' && code[index] !== '\r') {
          index++;
          column++;
        }
        tokens.push({
          lexeme: code.slice(commentStart, index),
          type: 'COMMENT',
          line: startLine,
          column: startColumn,
          startIndex: commentStart,
          endIndex: index
        });
        continue;
      }
    }

    if (char === '\n') {
      line++;
      column = 1;
      index++;
      continue;
    }

    if (char === '\r') {
      if (code[index + 1] === '\n') {
        index++;
      }
      line++;
      column = 1;
      index++;
      continue;
    }

    if (char === ' ' || char === '\t') {
      column += char === '\t' ? 4 : 1;
      index++;
      continue;
    }

    if (/\s/.test(char)) {
      column++;
      index++;
      continue;
    }

    if ((char === '"' || char === "'") && !/\s/.test(char)) {
      const quote = char;
      let escaped = false;
      let value = quote;
      index++;
      column++;
      while (index < length) {
        const current = code[index];
        value += current;
        if (escaped) {
          escaped = false;
        } else if (current === '\\') {
          escaped = true;
        } else if (current === quote) {
          index++;
          column++;
          break;
        }
        index++;
        column++;
      }
      const tokenType = quote === "'" && value.length === 3 ? 'CHARACTER' : 'STRING';
      tokens.push({
        lexeme: value,
        type: tokenType,
        line: startLine,
        column: startColumn,
        startIndex: startIndex,
        endIndex: index
      });
      continue;
    }

    const remainingText = code.slice(index);
    let matched = false;

    for (const op of operators) {
      if (remainingText.startsWith(op)) {
        tokens.push({
          lexeme: op,
          type: 'OPERATOR',
          line: startLine,
          column: startColumn,
          startIndex: startIndex,
          endIndex: index + op.length
        });
        index += op.length;
        column += op.length;
        matched = true;
        break;
      }
    }
    if (matched) continue;

    for (const delimiter of delimiters) {
      if (remainingText.startsWith(delimiter)) {
        tokens.push({
          lexeme: delimiter,
          type: 'DELIMITER',
          line: startLine,
          column: startColumn,
          startIndex: startIndex,
          endIndex: index + delimiter.length
        });
        index += delimiter.length;
        column += delimiter.length;
        matched = true;
        break;
      }
    }
    if (matched) continue;

    const numberMatch = remainingText.match(/^\d+(\.\d+)?([eE][+-]?\d+)?/);
    if (numberMatch) {
      const lexeme = numberMatch[0];
      tokens.push({
        lexeme,
        type: 'NUMBER',
        line: startLine,
        column: startColumn,
        startIndex: startIndex,
        endIndex: index + lexeme.length
      });
      index += lexeme.length;
      column += lexeme.length;
      continue;
    }

    const identifierMatch = remainingText.match(/^[a-zA-Z_][a-zA-Z0-9_]*/);
    if (identifierMatch) {
      const lexeme = identifierMatch[0];
      const type = keywords.includes(lexeme) ? 'KEYWORD' : 'IDENTIFIER';
      tokens.push({
        lexeme,
        type,
        line: startLine,
        column: startColumn,
        startIndex: startIndex,
        endIndex: index + lexeme.length
      });
      index += lexeme.length;
      column += lexeme.length;
      continue;
    }

    tokens.push({
      lexeme: char,
      type: 'ERROR',
      line: startLine,
      column: startColumn,
      startIndex: startIndex,
      endIndex: index + 1
    });
    index++;
    column++;
  }

  return tokens;
}

function analyzeCode() {
  currentCode = codeInput.value;
  errorBox.style.display = 'none';
  try {
    currentTokens = tokenize(currentCode, currentMode);
    renderStats(currentTokens);
    renderSummary(currentTokens);
    renderTable();
    updateEditorHighlight();
  } catch (error) {
    errorBox.textContent = `Lexical analysis error: ${error.message}`;
    errorBox.style.display = 'flex';
  }
}

function updateFileStatus(name) {
  if (!name) {
    fileStatus.style.display = 'none';
    return;
  }
  fileStatus.innerHTML = `
    <div class="file-info">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
      </svg>
      <span>${escapeHtml(name)}</span>
    </div>`;
  fileStatus.style.display = 'flex';
}

modeSelect.addEventListener('change', () => {
  currentMode = modeSelect.value;
  currentCode = defaultCodes[currentMode];
  codeInput.value = currentCode;
  setEditorMode(currentMode);
  analyzeCode();
});

runButton.addEventListener('click', analyzeCode);
codeInput.addEventListener('input', analyzeCode);

tableSearch.addEventListener('input', renderTable);

fileField.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) return;
  updateFileStatus(file.name);
  const reader = new FileReader();
  reader.onload = () => {
    codeInput.value = reader.result;
    currentCode = reader.result;
    analyzeCode();
  };
  reader.onerror = () => {
    errorBox.textContent = 'Unable to read the selected file.';
    errorBox.style.display = 'flex';
  };
  reader.readAsText(file);
});

setEditorMode(currentMode);
analyzeCode();
