import { EditorState, Compartment } from '@codemirror/state';
import {
  EditorView, keymap, lineNumbers, drawSelection, highlightActiveLine,
  highlightActiveLineGutter, placeholder,
} from '@codemirror/view';
import { MySQL } from '@codemirror/lang-sql';
import { syntaxHighlighting, bracketMatching, HighlightStyle } from '@codemirror/language';
import { tags } from '@lezer/highlight';
import { history, historyKeymap, defaultKeymap, indentWithTab } from '@codemirror/commands';
import { autocompletion, completionKeymap, startCompletion } from '@codemirror/autocomplete';
import {
  splitStatements, statementAt, completionTarget, aliasMap, quoteIdent, isRunnable, cteNames,
} from '../server/sql-script.js';

const KEYWORDS = [
  'SELECT', 'DISTINCT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'IN', 'IS', 'NULL',
  'LIKE', 'BETWEEN', 'EXISTS', 'AS', 'ON', 'USING', 'JOIN', 'INNER JOIN', 'LEFT JOIN',
  'RIGHT JOIN', 'CROSS JOIN', 'GROUP BY', 'HAVING', 'ORDER BY', 'ASC', 'DESC',
  'LIMIT', 'OFFSET', 'UNION', 'UNION ALL', 'WITH', 'CASE', 'WHEN', 'THEN', 'ELSE',
  'END', 'CAST', 'INTERVAL', 'TRUE', 'FALSE', 'SHOW', 'DESCRIBE', 'EXPLAIN',
];

const FUNCTIONS = [
  'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'ROUND', 'COALESCE', 'IFNULL', 'NULLIF',
  'CONCAT', 'SUBSTRING', 'DATE_FORMAT', 'YEAR', 'MONTH', 'DAY', 'NOW', 'CURDATE',
];

let view = null;
let tables = [];
let columnsFor = async () => [];
const themeCompartment = new Compartment();

function colors(dark) {
  return HighlightStyle.define([
    { tag: tags.keyword, color: dark ? '#c586c0' : '#7a3e9d' },
    { tag: tags.string, color: dark ? '#ce9178' : '#a31515' },
    { tag: tags.number, color: dark ? '#b5cea8' : '#098658' },
    { tag: tags.comment, color: dark ? '#6a9955' : '#008000', fontStyle: 'italic' },
    { tag: tags.operator, color: dark ? '#d4d4d4' : '#333333' },
    { tag: [tags.name, tags.propertyName], color: dark ? '#9cdcfe' : '#0b6280' },
    { tag: tags.typeName, color: dark ? '#4ec9b0' : '#267f99' },
    { tag: tags.function(tags.variableName), color: dark ? '#dcdcaa' : '#795e26' },
  ]);
}

function chrome(dark) {
  const line = dark ? '#38383f' : '#d5d8de';
  return EditorView.theme({
    '&': {
      height: '100%',
      backgroundColor: dark ? '#161618' : '#ffffff',
      color: dark ? '#e2e2e6' : '#1c1d21',
    },
    '.cm-scroller': { fontFamily: 'var(--font-mono)', fontSize: '13px', lineHeight: '1.55' },
    '.cm-gutters': {
      backgroundColor: dark ? '#1f1f23' : '#f3f4f6',
      color: dark ? '#818190' : '#5c6370',
      borderRight: `1px solid ${line}`,
    },
    '.cm-activeLine': { backgroundColor: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' },
    '.cm-activeLineGutter': { backgroundColor: 'transparent' },
    '&.cm-focused': { outline: 'none' },
    '.cm-tooltip-autocomplete': {
      backgroundColor: dark ? '#28282e' : '#ffffff',
      color: dark ? '#e2e2e6' : '#1c1d21',
      border: `1px solid ${dark ? '#46464f' : '#c3c7d0'}`,
    },
    '.cm-tooltip-autocomplete ul li[aria-selected]': { backgroundColor: dark ? '#1e8fb3' : '#0b7ea0', color: '#fff' },
    '.cm-completionDetail': { marginLeft: '12px', fontStyle: 'normal', opacity: '0.75' },
  }, { dark });
}

function themeExt(dark) {
  return [chrome(dark), syntaxHighlighting(colors(dark))];
}

function applyPlain(view, completion, from, to) {
  const insert = completion.label;
  view.dispatch({ changes: { from, to, insert }, selection: { anchor: from + insert.length } });
}

function applyIdent(view, completion, from, to) {
  let start = from;
  let end = to;
  if (view.state.doc.sliceString(start - 1, start) === '`') start -= 1;
  if (view.state.doc.sliceString(end, end + 1) === '`') end += 1;
  const insert = quoteIdent(completion.label);
  view.dispatch({ changes: { from: start, to: end, insert }, selection: { anchor: start + insert.length } });
}

async function complete(context) {
  const doc = context.state.doc.toString();
  const pos = context.pos;
  const stmt = statementAt(doc, pos) || { start: 0, end: doc.length, text: doc };
  const raw = doc.slice(stmt.start, stmt.end);
  const target = completionTarget(raw, pos - stmt.start);
  if (!target) return null;
  if (target.kind === 'mixed' && !target.prefix && !context.explicit) return null;

  const options = [];
  if (target.kind !== 'columns') {
    for (const word of KEYWORDS) options.push({ label: word, type: 'keyword', apply: applyPlain });
    for (const word of FUNCTIONS) options.push({ label: word, type: 'function', apply: applyPlain });
  }
  if (target.kind === 'tables' || target.kind === 'mixed') {
    for (const name of tables) {
      options.push({
        label: name,
        type: 'type',
        detail: 'table',
        boost: target.kind === 'tables' ? 2 : 0,
        apply: applyIdent,
      });
    }
  }
  if (target.kind === 'columns' || (target.kind === 'mixed' && target.prefix)) {
    const map = aliasMap(raw);
    const names = [];
    if (target.kind === 'columns' && target.name) names.push(map.get(target.name.toLowerCase()) || target.name);
    else for (const table of new Set(map.values())) names.push(table);
    const seen = new Set();
    for (const table of names) {
      let cols = [];
      try { cols = await columnsFor(table); } catch { cols = []; }
      for (const col of cols) {
        const key = String(col.name).toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        options.push({
          label: col.name,
          type: 'property',
          detail: col.type || 'column',
          boost: 3,
          apply: applyIdent,
        });
      }
    }
  }
  if (!options.length) return null;
  return { from: stmt.start + target.from, options, validFor: /^[\w$]*$/ };
}

function formatScript(doc, formatOne) {
  const parts = splitStatements(doc);
  if (!parts.length) return doc;
  const body = parts.map(part => {
    if (!isRunnable(part.text)) return part.text.trim();
    try {
      return String(formatOne(part.text) || part.text).trim().replace(/;+\s*$/, '');
    } catch {
      return part.text.trim().replace(/;+\s*$/, '');
    }
  }).filter(Boolean).join(';\n\n');
  return body ? body + ';\n' : doc;
}

function mount(parent, opts = {}) {
  if (view) view.destroy();
  const dark = !!opts.dark;
  const hint = opts.placeholder || 'Write several SELECT statements. Completions appear as you type.';
  view = new EditorView({
    parent,
    state: EditorState.create({
      doc: opts.doc || '',
      extensions: [
        lineNumbers(),
        highlightActiveLine(),
        highlightActiveLineGutter(),
        drawSelection(),
        history(),
        bracketMatching(),
        keymap.of([
          { key: 'Mod-Enter', run: () => { opts.onRun?.('primary'); return true; } },
          { key: 'Mod-Shift-Enter', run: () => { opts.onRun?.('all'); return true; } },
          indentWithTab,
          ...completionKeymap,
          ...defaultKeymap,
          ...historyKeymap,
        ]),
        MySQL.language,
        autocompletion({ override: [complete] }),
        placeholder(hint),
        EditorView.updateListener.of(update => {
          if (update.docChanged) opts.onChange?.(update.state.doc.toString());
          if (update.selectionSet) opts.onSelection?.(update.state.selection.main.empty);
          if (!update.docChanged || !update.view.hasFocus) return;
          let inserted = '';
          update.changes.iterChanges((_a, _b, _c, _d, ins) => { inserted += ins.toString(); });
          if (inserted !== '.' && inserted !== ' ') return;
          const pos = update.state.selection.main.head;
          const line = update.state.doc.lineAt(pos);
          const before = line.text.slice(0, pos - line.from);
          if (inserted === '.' || /\b(?:FROM|JOIN)\s+$/i.test(before)) startCompletion(update.view);
        }),
        themeCompartment.of(themeExt(dark)),
      ],
    }),
  });
  return view;
}

function runPlan(mode) {
  if (!view) return [];
  const doc = view.state.doc.toString();
  const sel = view.state.selection.main;
  const which = mode === 'primary' ? (sel.empty ? 'current' : 'selection') : mode;
  if (which === 'selection') {
    return splitStatements(view.state.sliceDoc(sel.from, sel.to)).map(part => part.text).filter(isRunnable);
  }
  if (which === 'all') return splitStatements(doc).map(part => part.text).filter(isRunnable);
  const stmt = statementAt(doc, sel.head);
  return stmt && isRunnable(stmt.text) ? [stmt.text] : [];
}

globalThis.SqlEditor = {
  mount,
  setTables(names) { tables = Array.isArray(names) ? names : []; },
  setColumnsFor(fn) { columnsFor = typeof fn === 'function' ? fn : async () => []; },
  getDoc() { return view ? view.state.doc.toString() : ''; },
  setDoc(text) {
    if (!view) return;
    const next = String(text ?? '');
    if (next === view.state.doc.toString()) return;
    view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: next } });
  },
  format(formatOne) {
    if (!view) return;
    const sel = view.state.selection.main;
    if (!sel.empty) {
      const next = formatScript(view.state.sliceDoc(sel.from, sel.to), formatOne);
      view.dispatch({
        changes: { from: sel.from, to: sel.to, insert: next },
        selection: { anchor: sel.from, head: sel.from + next.length },
      });
      return;
    }
    const next = formatScript(view.state.doc.toString(), formatOne);
    view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: next } });
  },
  runPlan,
  selectionEmpty() { return !view || view.state.selection.main.empty; },
  setDark(dark) {
    if (!view) return;
    view.dispatch({ effects: themeCompartment.reconfigure(themeExt(!!dark)) });
  },
  focus() { view?.focus(); },
  cteNames,
};
