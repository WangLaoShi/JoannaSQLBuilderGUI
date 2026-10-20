/**
 * unions.js — UNION / UNION ALL between subquery cards.
 *
 * A ∪ handle on the card header drags to another subquery. The line is not a
 * JOIN: assembleQuery wraps the two SELECT texts and applies the right-hand
 * filters to the combined result.
 *
 * Depends on: State, App, Islands, Joins, Canvas. Load after joins.js.
 */

const Unions = (() => {
    const drag = { active: false, fromId: null, line: null };

    function scale() {
        return (typeof Canvas !== 'undefined' && Canvas.getContentScale) ? Canvas.getContentScale() : 1;
    }

    function pointOf(el) {
        const rect = el.getBoundingClientRect();
        const canvas = document.getElementById('canvas').getBoundingClientRect();
        const s = scale();
        return {
            x: (rect.left + rect.width / 2 - canvas.left) / s,
            y: (rect.top + rect.height / 2 - canvas.top) / s,
        };
    }

    function handleFor(tableId) {
        return document.querySelector(`.table-card[data-table-id="${CSS.escape(tableId)}"] .sq-union-handle`);
    }

    function notify(msg) {
        if (typeof App !== 'undefined' && App.notify) App.notify(msg, 'warn');
    }

    function wouldCycle(fromId, toId) {
        const adj = {};
        (State.unions || []).forEach(u => {
            if (u.enabled === false) return;
            (adj[u.fromTableId] ||= []).push(u.toTableId);
            (adj[u.toTableId] ||= []).push(u.fromTableId);
        });
        const seen = new Set();
        const queue = [toId];
        while (queue.length) {
            const id = queue.shift();
            if (id === fromId) return true;
            if (seen.has(id)) continue;
            seen.add(id);
            (adj[id] || []).forEach(n => queue.push(n));
        }
        return false;
    }

    function addLink(fromId, toId) {
        if (!State.unions) State.unions = [];
        if (fromId === toId) return;
        const from = State.tables.find(t => t.id === fromId);
        const to = State.tables.find(t => t.id === toId);
        if (!from?.isSubquery || !to?.isSubquery) {
            notify('Drop onto another subquery card.');
            return;
        }
        if (State.unions.some(u =>
            (u.fromTableId === fromId && u.toTableId === toId) ||
            (u.fromTableId === toId && u.toTableId === fromId)
        )) {
            notify('A union already connects these subqueries.');
            return;
        }
        if (State.unions.some(u => u.enabled !== false && u.fromTableId === fromId)) {
            notify('Each subquery can have only one outgoing union.');
            return;
        }
        if (State.unions.some(u => u.enabled !== false && u.toTableId === toId)) {
            notify('Each subquery can have only one incoming union.');
            return;
        }
        if (wouldCycle(fromId, toId)) {
            notify('Union links must form one chain, without a fork or a cycle.');
            return;
        }
        if (typeof UndoRedo !== 'undefined') UndoRedo.snapshot();
        State.unions.push({
            id: 'u_' + Date.now(),
            fromTableId: fromId,
            toTableId: toId,
            op: 'UNION ALL',
            enabled: true,
        });
        redraw();
        if (typeof Islands !== 'undefined') {
            Islands.recompute();
            const enabled = State.joins.filter(j => j.enabled !== false);
            const island = App.computeIslands(State.tables, enabled).find(g => g.includes(fromId));
            if (island) Islands.selectIsland([...island].sort().join('|'));
        } else if (typeof App !== 'undefined') {
            App.updateSQLPreview?.();
        }
    }

    function redraw() {
        const svg = document.getElementById('join-lines');
        if (!svg) return;
        svg.querySelectorAll('.union-line, .union-label, .union-delete').forEach(el => el.remove());
        (State.unions || []).forEach(link => {
            if (link.enabled === false) return;
            const a = handleFor(link.fromTableId);
            const b = handleFor(link.toTableId);
            if (!a || !b) return;
            const p1 = pointOf(a);
            const p2 = pointOf(b);
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const midX = (p1.x + p2.x) / 2;
            path.setAttribute('d', `M ${p1.x} ${p1.y} C ${midX} ${p1.y}, ${midX} ${p2.y}, ${p2.x} ${p2.y}`);
            path.setAttribute('class', 'union-line');
            path.dataset.unionId = link.id;
            svg.appendChild(path);

            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('class', 'union-label');
            label.setAttribute('x', String(midX));
            label.setAttribute('y', String((p1.y + p2.y) / 2 - 6));
            label.setAttribute('text-anchor', 'middle');
            label.textContent = link.op || 'UNION ALL';
            label.dataset.unionId = link.id;
            const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
            title.textContent = 'Toggle UNION or UNION ALL';
            label.appendChild(title);
            label.addEventListener('click', e => {
                e.stopPropagation();
                if (typeof UndoRedo !== 'undefined') UndoRedo.snapshot();
                link.op = link.op === 'UNION' ? 'UNION ALL' : 'UNION';
                redraw();
                App.updateSQLPreview?.();
            });
            svg.appendChild(label);

            const del = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            del.setAttribute('class', 'union-delete');
            del.setAttribute('x', String(midX + 54));
            del.setAttribute('y', String((p1.y + p2.y) / 2 - 6));
            del.textContent = '×';
            const delTitle = document.createElementNS('http://www.w3.org/2000/svg', 'title');
            delTitle.textContent = 'Remove union';
            del.appendChild(delTitle);
            del.addEventListener('click', e => {
                e.stopPropagation();
                if (typeof UndoRedo !== 'undefined') UndoRedo.snapshot();
                State.unions = State.unions.filter(u => u.id !== link.id);
                redraw();
                if (typeof Islands !== 'undefined') Islands.recompute();
                App.updateSQLPreview?.();
            });
            svg.appendChild(del);
        });
    }

    function onDown(e) {
        const handle = e.target.closest?.('.sq-union-handle');
        if (!handle || e.button !== 0) return;
        e.preventDefault();
        e.stopPropagation();
        const card = handle.closest('.table-card');
        drag.active = true;
        drag.fromId = card?.dataset.tableId || null;
        const svg = document.getElementById('join-lines');
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('class', 'union-line union-drag');
        const p = pointOf(handle);
        line.setAttribute('x1', p.x);
        line.setAttribute('y1', p.y);
        line.setAttribute('x2', p.x);
        line.setAttribute('y2', p.y);
        svg.appendChild(line);
        drag.line = line;
    }

    function onMove(e) {
        if (!drag.active || !drag.line) return;
        const canvas = document.getElementById('canvas').getBoundingClientRect();
        const s = scale();
        drag.line.setAttribute('x2', (e.clientX - canvas.left) / s);
        drag.line.setAttribute('y2', (e.clientY - canvas.top) / s);
        document.querySelectorAll('.sq-union-handle.is-union-target').forEach(el => el.classList.remove('is-union-target'));
        const hit = e.target.closest?.('.sq-union-handle');
        const card = hit?.closest('.table-card');
        if (card && card.dataset.tableId !== drag.fromId) hit.classList.add('is-union-target');
    }

    function onUp(e) {
        if (!drag.active) return;
        drag.line?.remove();
        drag.line = null;
        drag.active = false;
        document.querySelectorAll('.sq-union-handle.is-union-target').forEach(el => el.classList.remove('is-union-target'));
        const hit = document.elementFromPoint(e.clientX, e.clientY)?.closest?.('.sq-union-handle');
        const toId = hit?.closest('.table-card')?.dataset.tableId;
        if (drag.fromId && toId) addLink(drag.fromId, toId);
        drag.fromId = null;
    }

    function init() {
        const canvas = document.getElementById('canvas');
        if (!canvas) return;
        canvas.addEventListener('mousedown', onDown);
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
        if (typeof Joins !== 'undefined' && Joins.redrawForTable) {
            const redrawJoins = Joins.redrawForTable;
            Joins.redrawForTable = (id) => { redrawJoins(id); redraw(); };
        }
    }

    return { init, redraw };
})();

document.addEventListener('DOMContentLoaded', () => Unions.init());
