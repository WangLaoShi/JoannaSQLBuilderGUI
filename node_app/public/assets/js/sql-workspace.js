/**
 * SQL workspace: one script of many statements, with completion and run modes.
 * The editor bundle is sql-editor.js (CodeMirror). This file is the page glue.
 */
const SqlWorkspace = (() => {
    const storeKey = id => 'sqlj-sql-script:' + (id || 'none');

    let key = null;
    let ready = false;
    let saveTimer = null;
    let running = null;
    const columnCache = new Map();

    function darkNow() {
        return document.documentElement.dataset.theme !== 'light';
    }

    function persist() {
        if (!key || !ready || !window.SqlEditor) return;
        try { localStorage.setItem(key, SqlEditor.getDoc()); } catch { /* private mode */ }
    }

    function prepareSql(sql) {
        const schema = State.activeDatabase || '';
        let next = String(sql ?? '').replace(
            /\b(FROM|JOIN)\s+([a-zA-Z_]\w*)\.([a-zA-Z_]\w*)(?!\s*\.)/gi,
            (_, kw, db, tbl) => `${kw} \`${db}\`.\`${tbl}\``
        );
        if (!schema) return next;
        const ctes = new Set((window.SqlEditor?.cteNames(next) || []).map(name => name.toLowerCase()));
        return next.replace(
            /\b(FROM|JOIN)\s+(`[^`]+`|[a-zA-Z_]\w*)(?!\s*\.)/gi,
            (_, kw, ref) => {
                const name = ref.startsWith('`') ? ref.slice(1, -1) : ref;
                if (ctes.has(name.toLowerCase())) return `${kw} ${ref}`;
                return `${kw} \`${schema}\`.\`${name}\``;
            }
        );
    }

    function setStatus(text) {
        const el = document.getElementById('sqlws-status');
        if (el) el.textContent = text || '';
    }

    function paintRunButton() {
        const btn = document.getElementById('sqlws-run');
        const item = document.querySelector('#sqlws-run-pop [data-run="selection"]');
        if (!btn || !window.SqlEditor) return;
        const empty = SqlEditor.selectionEmpty();
        btn.textContent = empty ? 'Run Current' : 'Run Selection';
        if (item) item.disabled = empty;
    }

    function closeMenu() {
        document.getElementById('sqlws-run-pop')?.classList.add('hidden');
    }

    async function columnsFor(table) {
        const profileId = State.activeProfileId;
        const database = State.activeDatabase || '';
        if (!profileId || !table) return [];
        const cacheKey = profileId + '\0' + database + '\0' + String(table).toLowerCase();
        if (columnCache.has(cacheKey)) return columnCache.get(cacheKey);
        const cols = await API.schema.columns(profileId, table, database);
        const mapped = (cols || []).map(col => ({ name: col.name, type: col.shortType || col.type || '' }));
        columnCache.set(cacheKey, mapped);
        return mapped;
    }

    async function refreshSchema() {
        const gen = (refreshSchema.gen = (refreshSchema.gen || 0) + 1);
        const profileId = State.activeProfileId;
        const database = State.activeDatabase || '';
        if (!profileId || !window.SqlEditor) {
            window.SqlEditor?.setTables([]);
            return;
        }
        try {
            const list = await API.schema.tables(profileId, database);
            if (gen !== refreshSchema.gen) return;
            SqlEditor.setTables((list || []).map(table => table.name));
        } catch {
            if (gen === refreshSchema.gen) SqlEditor.setTables([]);
        }
    }

    function rememberProfile(profileId) {
        const next = storeKey(profileId);
        if (next === key) return;
        persist();
        key = next;
        if (!ready || !window.SqlEditor) return;
        SqlEditor.setDoc(localStorage.getItem(key) || '');
        paintRunButton();
    }

    function boot() {
        const parent = document.getElementById('sqlws-editor');
        if (!parent || !window.SqlEditor || ready) return;
        if (!key) key = storeKey(State.activeProfileId);
        const saved = localStorage.getItem(key) || '';
        const hint = window.I18n
            ? I18n.t('Write several SELECT statements. Completions appear as you type.')
            : 'Write several SELECT statements. Completions appear as you type.';
        SqlEditor.setColumnsFor(columnsFor);
        SqlEditor.mount(parent, {
            doc: saved,
            dark: darkNow(),
            placeholder: hint,
            onChange() {
                clearTimeout(saveTimer);
                saveTimer = setTimeout(persist, 300);
            },
            onSelection() { paintRunButton(); },
            onRun(mode) { run(mode); },
        });
        ready = true;
        paintRunButton();
        refreshSchema();

        document.getElementById('sqlws-format')?.addEventListener('click', () => {
            if (typeof _formatBackdropSQL !== 'function') return;
            SqlEditor.format(_formatBackdropSQL);
            SqlEditor.focus();
        });
        document.getElementById('sqlws-from-canvas')?.addEventListener('click', insertFromCanvas);
        document.getElementById('sqlws-run')?.addEventListener('click', () => run('primary'));
        document.getElementById('sqlws-run-menu')?.addEventListener('click', event => {
            event.stopPropagation();
            document.getElementById('sqlws-run-pop')?.classList.toggle('hidden');
        });
        document.getElementById('sqlws-run-pop')?.addEventListener('click', event => {
            const btn = event.target.closest('[data-run]');
            if (!btn || btn.disabled) return;
            closeMenu();
            run(btn.dataset.run);
        });
        document.addEventListener('click', event => {
            if (!event.target.closest('.sqlws-run')) closeMenu();
        });
        document.getElementById('btn-cancel-query')?.addEventListener('click', () => {
            running?.abort();
        });
        document.getElementById('btn-sql-workspace')?.addEventListener('click', toggle);
        new MutationObserver(() => SqlEditor.setDark(darkNow()))
            .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    }

    function open() {
        const stage = document.getElementById('canvas-stage');
        const panel = document.getElementById('sql-workspace');
        const btn = document.getElementById('btn-sql-workspace');
        stage?.classList.add('is-sql');
        panel?.classList.remove('hidden');
        btn?.classList.add('is-on');
        btn?.setAttribute('aria-pressed', 'true');
        SqlEditor?.focus();
        refreshSchema();
    }

    function close() {
        document.getElementById('canvas-stage')?.classList.remove('is-sql');
        document.getElementById('sql-workspace')?.classList.add('hidden');
        const btn = document.getElementById('btn-sql-workspace');
        btn?.classList.remove('is-on');
        btn?.setAttribute('aria-pressed', 'false');
        closeMenu();
        persist();
    }

    function toggle() {
        const panel = document.getElementById('sql-workspace');
        if (!panel) return;
        if (panel.classList.contains('hidden')) open();
        else close();
    }

    function insertFromCanvas() {
        const preview = document.getElementById('sql-preview-text')?.textContent?.trim() || '';
        if (!preview || preview.startsWith('--')) {
            App.notify('Add tables to the canvas before inserting SQL.', 'warn');
            return;
        }
        const doc = SqlEditor.getDoc();
        const gap = doc.trim() ? '\n\n' : '';
        SqlEditor.setDoc(doc.replace(/\s*$/, '') + gap + preview.replace(/;+\s*$/, '') + ';\n');
        SqlEditor.focus();
    }

    async function run(mode) {
        if (!window.SqlEditor) return;
        if (!State.activeProfileId) {
            App.notify('No connection profile selected.', 'error');
            return;
        }
        const parts = SqlEditor.runPlan(mode);
        if (!parts.length) {
            App.notify(mode === 'selection' ? 'Select the SQL to run.' : 'No SQL statement at the cursor.', 'warn');
            return;
        }
        running?.abort();
        const abort = new AbortController();
        running = abort;
        const cancel = document.getElementById('btn-cancel-query');
        cancel?.classList.remove('hidden');
        document.getElementById('sqlws-run').disabled = true;
        try {
            let last = null;
            let cut = 0;
            for (let i = 0; i < parts.length; i++) {
                if (abort.signal.aborted) return;
                setStatus(`Running ${i + 1} of ${parts.length}…`);
                try {
                    last = await API.query.executeRaw(State.activeProfileId, prepareSql(parts[i]), abort.signal);
                } catch (err) {
                    if (err.name === 'AbortError') {
                        App.notify('Query cancelled.', 'warn');
                        return;
                    }
                    Results.renderError(err.message);
                    App.notify(`Statement ${i + 1} of ${parts.length} failed.`, 'error');
                    return;
                }
                Results.render(last);
                if (last?.truncated) cut = last.count;
            }
            const done = parts.length === 1 ? 'Query finished.' : `Ran ${parts.length} statements.`;
            if (cut) {
                const meta = document.getElementById('results-meta');
                if (meta && parts.length === 1) meta.textContent = `${Number(cut).toLocaleString()} rows, more were not loaded`;
                App.notify(`${done} Showing the first ${cut} rows. This statement has more.`, 'warn');
            } else {
                App.notify(done, 'success');
            }
        } finally {
            if (running === abort) running = null;
            cancel?.classList.add('hidden');
            document.getElementById('sqlws-run').disabled = false;
            setStatus('');
            paintRunButton();
        }
    }

    document.addEventListener('DOMContentLoaded', boot);

    return { refreshSchema, rememberProfile, toggle, open, close };
})();
