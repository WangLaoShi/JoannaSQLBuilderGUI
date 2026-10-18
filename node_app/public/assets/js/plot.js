'use strict';

/**
 * plot.js — Plot namespace: validates query result data and draws charts
 * onto an HTML5 Canvas element.
 *
 * Public API:
 *   Plot.types → [{ id, label }]
 *   Plot.validateAndExtract(rows, cols) → { xLabels, yValues, series, xColName, yColName }
 *   Plot.draw(canvas, rows, cols, title, type) → void
 */
const Plot = (() => {

    // Visual constants
    const BAR_FILL    = 'rgba(66, 133, 244, 0.82)';
    const BAR_STROKE  = 'rgba(40,  100, 200, 1)';
    const SERIES_COLORS = [
        [BAR_FILL, BAR_STROKE],
        ['rgba(52, 168, 83, 0.85)',  'rgba(24, 128, 56, 1)'],
        ['rgba(251, 188, 4, 0.92)',  'rgba(183, 134, 0, 1)'],
        ['rgba(234, 67, 53, 0.85)',  'rgba(176, 38, 28, 1)'],
        ['rgba(156, 39, 176, 0.85)', 'rgba(106, 27, 122, 1)'],
        ['rgba(0, 172, 193, 0.85)',  'rgba(0, 121, 140, 1)'],
    ];
    const GRID_COLOR  = '#dde2ea';
    const AXIS_COLOR  = '#444';
    const TEXT_COLOR  = '#222';
    const _FONT       = '"PingFang SC","Hiragino Sans GB","Microsoft YaHei","Noto Sans SC",sans-serif';
    const BG_OUTER    = '#f0f2f5';
    const BG_PLOT     = '#ffffff';
    const CHART_TYPES = [
        { id: 'line',      label: 'Line chart' },
        { id: 'column',    label: 'Column chart' },
        { id: 'rank',      label: 'Ranking chart' },
        { id: 'bar',       label: 'Bar chart' },
        { id: 'box',       label: 'Box plot' },
        { id: 'histogram', label: 'Histogram' },
        { id: 'pie',       label: 'Pie chart' },
        { id: 'radar',     label: 'Radar chart' },
        { id: 'bubble',    label: 'Bubble chart' },
        { id: 'funnel',    label: 'Funnel chart' },
    ];

    // Layout margins inside the 640×480 canvas
    const ML = 72;   // left   (room for Y-axis labels)
    const MR = 24;   // right
    const MT = 48;   // top    (room for title)
    const MB = 80;   // bottom (room for X-axis labels + axis name)

    // -------------------------------------------------------------------------
    // validateAndExtract
    // -------------------------------------------------------------------------
    /**
     * Text columns become axis labels. Numeric columns become bar heights.
     * Column order does not matter: avg_price beside product_type still plots.
     * Several numeric columns become side-by-side series on the same categories.
     * When every column is numeric and there are two or more, the first column
     * stays the axis (a year, an id) and the rest are series.
     *
     * Returns { xLabels, yValues, series, xColName, yColName }.
     */
    function validateAndExtract(rows, cols) {
        if (!rows || rows.length === 0) {
            throw new Error(_plotMsg(
                'The query returned no rows — nothing to plot.',
                '查询没有返回行，没有可以画的数据。'
            ));
        }
        if (!cols || cols.length === 0) {
            throw new Error(_plotMsg(
                'The query returned no columns — nothing to plot.',
                '查询没有返回列，没有可以画的数据。'
            ));
        }

        const kinds = cols.map((_, ci) => _columnKind(rows, ci));
        const mixedAt = kinds.findIndex(kind => kind === 'mixed');
        if (mixedAt !== -1) {
            const name = cols[mixedAt];
            throw new Error(_plotMsg(
                `Column "${name}" mixes numbers and text, so it cannot be plotted.`,
                `列「${name}」里既有数字又有文字，没法画成图。`
            ));
        }

        const numIdx = [];
        const catIdx = [];
        kinds.forEach((kind, i) => (kind === 'number' ? numIdx : catIdx).push(i));

        if (!numIdx.length) {
            throw new Error(_plotMsg(
                'Plotting needs at least one numeric column, such as SUM or AVG. Text columns are used as the category axis.',
                '绘图至少需要一列数字，例如 SUM 或 AVG 的结果。文字列会当作分类轴。'
            ));
        }

        // No text column: a lone number uses the row number as the axis.
        // Two or more number columns keep the first as the axis.
        let categoryIndexes = catIdx;
        let measureIndexes = numIdx;
        if (!catIdx.length && numIdx.length >= 2) {
            categoryIndexes = [numIdx[0]];
            measureIndexes = numIdx.slice(1);
        }

        const xLabels = categoryIndexes.length
            ? rows.map(row => categoryIndexes.map(ci => _catLabel(row[ci])).join(' / '))
            : rows.map((_, i) => String(i + 1));
        const xColName = categoryIndexes.length
            ? categoryIndexes.map(ci => cols[ci]).join(' / ')
            : 'Index';

        const series = measureIndexes.map((ci, i) => {
            const [fill, stroke] = SERIES_COLORS[i % SERIES_COLORS.length];
            return {
                name: cols[ci],
                values: rows.map(row => _measure(row[ci])),
                fill,
                stroke,
            };
        });
        const yColName = series.length === 1
            ? series[0].name
            : series.map(item => item.name).join(', ');

        return {
            xLabels,
            yValues: series[0].values.map(v => (v == null ? 0 : v)),
            series,
            xColName,
            yColName,
        };
    }

    function _plotMsg(en, zh) {
        try {
            if (localStorage.getItem('sqljoiner.lang') === 'en') return en;
        } catch { /* private mode: keep Chinese, the default language */ }
        return zh;
    }

    function _blank(val) {
        return val === null || val === undefined || String(val).trim() === '';
    }

    function _numeric(val) {
        if (typeof val === 'boolean') return false;
        if (typeof val === 'number') return Number.isFinite(val);
        const s = String(val).trim();
        if (!/^[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?$/.test(s)) return false;
        return Number.isFinite(Number(s));
    }

    function _columnKind(rows, ci) {
        let numbers = 0;
        let texts = 0;
        for (let ri = 0; ri < rows.length; ri++) {
            const val = rows[ri][ci];
            if (_blank(val)) continue;
            if (_numeric(val)) numbers++;
            else texts++;
        }
        if (texts && numbers) return 'mixed';
        if (numbers) return 'number';
        return 'category';
    }

    function _measure(val) {
        if (_blank(val) || !_numeric(val)) return null;
        return Number(typeof val === 'number' ? val : String(val).trim());
    }

    function _catLabel(val) {
        return _blank(val) ? 'NULL' : String(val);
    }

    function _extent(series) {
        let lo = 0;
        let hi = 0;
        for (const item of series) {
            for (const val of item.values) {
                if (val == null || !Number.isFinite(val)) continue;
                if (val < lo) lo = val;
                if (val > hi) hi = val;
            }
        }
        const span = (hi - lo) || 1;
        const pad = span * 0.10;
        return {
            yMin: lo < 0 ? lo - pad : 0,
            yMax: hi + pad,
        };
    }

    // -------------------------------------------------------------------------
    // draw
    // -------------------------------------------------------------------------
    /**
     * Draws a bar chart onto canvas.
     * @param {HTMLCanvasElement} canvas
     * @param {Array<Array>}      rows     2-D result rows
     * @param {string[]}          cols     Column names
     * @param {string}            title    Chart title
     */
    function draw(canvas, rows, cols, title, type) {
        const kind = _chartType(type);
        const data = validateAndExtract(rows, cols);
        _paint(kind, canvas, data, title);
    }

    function _chartType(type) {
        const id = String(type || 'column');
        return CHART_TYPES.some(item => item.id === id) ? id : 'column';
    }

    function _paint(kind, canvas, data, title) {
        if (kind === 'bar')       return _drawHorizontalFromData(canvas, data, title);
        if (kind === 'line')      return _drawLine(canvas, data, title);
        if (kind === 'rank')      return _drawRank(canvas, data, title);
        if (kind === 'box')       return _drawBox(canvas, data, title);
        if (kind === 'histogram') return _drawHistogram(canvas, data, title);
        if (kind === 'pie')       return _drawPie(canvas, data, title);
        if (kind === 'radar')     return _drawRadar(canvas, data, title);
        if (kind === 'bubble')    return _drawBubble(canvas, data, title);
        if (kind === 'funnel')    return _drawFunnel(canvas, data, title);
        return _drawFromData(canvas, data, title);
    }

    function _drawFromData(canvas, data, title) {
        const { xLabels, series, xColName, yColName } = data;
        const ctx = canvas.getContext('2d');
        const W   = canvas.width;
        const H   = canvas.height;
        const legendH = series.length > 1 ? 18 : 0;
        const top = MT + legendH;

        const plotW = W - ML - MR;
        const plotH = H - top - MB;

        ctx.fillStyle = BG_OUTER;
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = BG_PLOT;
        ctx.fillRect(ML, top, plotW, plotH);

        ctx.fillStyle    = TEXT_COLOR;
        ctx.font         = `bold 14px ${_FONT}`;
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(_truncate(title, 70), W / 2, MT / 2);
        if (legendH) _drawLegend(ctx, series, ML, MT + 4, plotW);

        const { yMin, yMax } = _extent(series);
        const ySpan = yMax - yMin || 1;

        const n      = xLabels.length;
        const slotW  = plotW / n;
        const barPad = Math.max(0.1, Math.min(0.35, 2 / n));
        const groupW = slotW * (1 - barPad);
        const barW   = groupW / series.length;

        const MAX_LABELS = 10;
        const xLabelStep = n <= MAX_LABELS ? 1 : Math.ceil(n / MAX_LABELS);
        const yTicks = MAX_LABELS;

        ctx.font         = `10px ${_FONT}`;
        ctx.textAlign    = 'right';
        ctx.textBaseline = 'middle';

        for (let i = 0; i <= yTicks; i++) {
            const val = yMin + (ySpan / yTicks) * i;
            const y   = top + plotH - plotH * (val - yMin) / ySpan;

            ctx.strokeStyle = GRID_COLOR;
            ctx.lineWidth   = 1;
            ctx.beginPath();
            ctx.moveTo(ML, y);
            ctx.lineTo(ML + plotW, y);
            ctx.stroke();

            ctx.fillStyle = TEXT_COLOR;
            ctx.fillText(_fmtNum(val), ML - 5, y);
        }

        xLabels.forEach((label, i) => {
            const groupX = ML + i * slotW + slotW * barPad / 2;
            series.forEach((item, si) => {
                const val = item.values[i];
                if (val == null || !Number.isFinite(val)) return;
                const yZero = top + plotH - plotH * (0 - yMin) / ySpan;
                const yVal  = top + plotH - plotH * (val - yMin) / ySpan;
                const bx    = groupX + si * barW;
                const by    = Math.min(yZero, yVal);
                const barH  = Math.max(Math.abs(yVal - yZero), 0);

                ctx.fillStyle   = item.fill;
                ctx.strokeStyle = item.stroke;
                ctx.lineWidth   = 1;
                ctx.beginPath();
                ctx.rect(bx, by, Math.max(barW - 1, 1), barH);
                ctx.fill();
                ctx.stroke();
            });

            if (i % xLabelStep === 0) {
                ctx.save();
                ctx.font         = `10px ${_FONT}`;
                ctx.fillStyle    = TEXT_COLOR;
                ctx.textAlign    = 'right';
                ctx.textBaseline = 'middle';
                ctx.translate(groupX + groupW / 2, top + plotH + 8);
                ctx.rotate(-Math.PI / 4);
                ctx.fillText(_truncate(String(label), 18), 0, 0);
                ctx.restore();
            }
        });

        ctx.strokeStyle = AXIS_COLOR;
        ctx.lineWidth   = 2;
        ctx.beginPath();
        ctx.moveTo(ML, top);
        ctx.lineTo(ML, top + plotH);
        ctx.lineTo(ML + plotW, top + plotH);
        ctx.stroke();

        ctx.fillStyle    = TEXT_COLOR;
        ctx.font         = `12px ${_FONT}`;
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(_truncate(xColName, 40), ML + plotW / 2, H - 10);
        ctx.save();
        ctx.translate(14, top + plotH / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(_truncate(series.length === 1 ? yColName : '', 40), 0, 0);
        ctx.restore();
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------
    function _fmtNum(n) {
        if (Math.abs(n) >= 1e6)  return (n / 1e6).toFixed(1) + 'M';
        if (Math.abs(n) >= 1e3)  return (n / 1e3).toFixed(1) + 'K';
        if (Number.isInteger(n)) return n.toString();
        return parseFloat(n.toFixed(2)).toString();
    }

    function _truncate(str, max) {
        if (!str) return '';
        return str.length > max ? str.slice(0, max - 1) + '…' : str;
    }

    // -------------------------------------------------------------------------
    // drawHorizontal
    // -------------------------------------------------------------------------
    /**
     * Draws a horizontal bar chart (bars grow left→right).
     * Same validation as draw(); axes are swapped.
     */
    function drawHorizontal(canvas, rows, cols, title) {
        const data = validateAndExtract(rows, cols);
        _drawHorizontalFromData(canvas, data, title);
    }

    function _drawHorizontalFromData(canvas, data, title) {
        const { xLabels, series, xColName, yColName } = data;
        const ctx = canvas.getContext('2d');
        const W   = canvas.width;
        const H   = canvas.height;

        const HML = 110;
        const HMR = 24;
        const legendH = series.length > 1 ? 18 : 0;
        const HMT = 48 + legendH;
        const HMB = 60;

        const plotW = W - HML - HMR;
        const plotH = H - HMT - HMB;

        ctx.fillStyle = BG_OUTER;
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = BG_PLOT;
        ctx.fillRect(HML, HMT, plotW, plotH);

        ctx.fillStyle    = TEXT_COLOR;
        ctx.font         = `bold 14px ${_FONT}`;
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(_truncate(title, 70), W / 2, 24);
        if (legendH) _drawLegend(ctx, series, HML, 36, plotW);

        const { yMin, yMax } = _extent(series);
        const ySpan = yMax - yMin || 1;

        const n      = xLabels.length;
        const slotH  = plotH / n;
        const barPad = Math.max(0.1, Math.min(0.35, 2 / n));
        const groupH = slotH * (1 - barPad);
        const barH   = groupH / series.length;

        const MAX_LABELS = 10;
        const yLabelStep = n <= MAX_LABELS ? 1 : Math.ceil(n / MAX_LABELS);
        const xTicks     = MAX_LABELS;

        ctx.font         = `10px ${_FONT}`;
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'top';

        for (let i = 0; i <= xTicks; i++) {
            const val = yMin + (ySpan / xTicks) * i;
            const x   = HML + plotW * (val - yMin) / ySpan;

            ctx.strokeStyle = GRID_COLOR;
            ctx.lineWidth   = 1;
            ctx.beginPath();
            ctx.moveTo(x, HMT);
            ctx.lineTo(x, HMT + plotH);
            ctx.stroke();

            ctx.fillStyle    = TEXT_COLOR;
            ctx.textBaseline = 'top';
            ctx.fillText(_fmtNum(val), x, HMT + plotH + 5);
        }

        xLabels.forEach((label, i) => {
            const groupY = HMT + i * slotH + slotH * barPad / 2;
            series.forEach((item, si) => {
                const val = item.values[i];
                if (val == null || !Number.isFinite(val)) return;
                const xZero = HML + plotW * (0 - yMin) / ySpan;
                const xVal  = HML + plotW * (val - yMin) / ySpan;
                const bx    = Math.min(xZero, xVal);
                const by    = groupY + si * barH;
                const barW  = Math.max(Math.abs(xVal - xZero), 0);

                ctx.fillStyle   = item.fill;
                ctx.strokeStyle = item.stroke;
                ctx.lineWidth   = 1;
                ctx.beginPath();
                ctx.rect(bx, by, barW, Math.max(barH - 1, 1));
                ctx.fill();
                ctx.stroke();
            });

            if (i % yLabelStep === 0) {
                ctx.font         = `10px ${_FONT}`;
                ctx.fillStyle    = TEXT_COLOR;
                ctx.textAlign    = 'right';
                ctx.textBaseline = 'middle';
                ctx.fillText(_truncate(String(label), 14), HML - 5, groupY + groupH / 2);
            }
        });

        ctx.strokeStyle = AXIS_COLOR;
        ctx.lineWidth   = 2;
        ctx.beginPath();
        ctx.moveTo(HML, HMT);
        ctx.lineTo(HML, HMT + plotH);
        ctx.lineTo(HML + plotW, HMT + plotH);
        ctx.stroke();

        ctx.fillStyle    = TEXT_COLOR;
        ctx.font         = `12px ${_FONT}`;
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(_truncate(series.length === 1 ? yColName : '', 40), HML + plotW / 2, H - 10);
        ctx.save();
        ctx.translate(14, HMT + plotH / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(_truncate(xColName, 40), 0, 0);
        ctx.restore();
    }

    function _drawLegend(ctx, series, x, y, width) {
        ctx.save();
        ctx.font = `11px ${_FONT}`;
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'left';
        let cursor = x;
        const maxX = x + width;
        for (const item of series) {
            const name = _truncate(item.name, 18);
            const w = 14 + ctx.measureText(name).width + 12;
            if (cursor + w > maxX) break;
            ctx.fillStyle = item.fill;
            ctx.fillRect(cursor, y, 10, 10);
            ctx.fillStyle = TEXT_COLOR;
            ctx.fillText(name, cursor + 14, y + 5);
            cursor += w;
        }
        ctx.restore();
    }

    function _frame(canvas, title, opts = {}) {
        const ctx = canvas.getContext('2d');
        const W = canvas.width;
        const H = canvas.height;
        const legend = opts.legend || [];
        const legendH = legend.length > 1 ? 18 : 0;
        const ml = opts.ml ?? ML;
        const mr = opts.mr ?? MR;
        const mt = (opts.mt ?? MT) + legendH;
        const mb = opts.mb ?? MB;
        const plotW = Math.max(W - ml - mr, 1);
        const plotH = Math.max(H - mt - mb, 1);
        ctx.fillStyle = BG_OUTER;
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = BG_PLOT;
        ctx.fillRect(ml, mt, plotW, plotH);
        ctx.fillStyle = TEXT_COLOR;
        ctx.font = `bold 14px ${_FONT}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(_truncate(title, 70), W / 2, 18);
        if (legendH) _drawLegend(ctx, legend, ml, 34, plotW);
        return { ctx, W, H, ml, mr, mt, mb, plotW, plotH };
    }

    function _yAt(frame, value, yMin, ySpan) {
        return frame.mt + frame.plotH - frame.plotH * (value - yMin) / ySpan;
    }

    function _yGrid(ctx, frame, yMin, yMax) {
        const ySpan = yMax - yMin || 1;
        const ticks = 5;
        ctx.font = `10px ${_FONT}`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.lineWidth = 1;
        for (let i = 0; i <= ticks; i++) {
            const val = yMin + (ySpan / ticks) * i;
            const y = _yAt(frame, val, yMin, ySpan);
            ctx.strokeStyle = GRID_COLOR;
            ctx.beginPath();
            ctx.moveTo(frame.ml, y);
            ctx.lineTo(frame.ml + frame.plotW, y);
            ctx.stroke();
            ctx.fillStyle = TEXT_COLOR;
            ctx.fillText(_fmtNum(val), frame.ml - 5, y);
        }
        return ySpan;
    }

    function _xTickLabels(ctx, frame, labels) {
        const n = labels.length || 1;
        const step = n <= 10 ? 1 : Math.ceil(n / 10);
        const slot = frame.plotW / n;
        labels.forEach((label, i) => {
            if (i % step !== 0) return;
            ctx.save();
            ctx.font = `10px ${_FONT}`;
            ctx.fillStyle = TEXT_COLOR;
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.translate(frame.ml + i * slot + slot / 2, frame.mt + frame.plotH + 8);
            ctx.rotate(-Math.PI / 4);
            ctx.fillText(_truncate(String(label), 18), 0, 0);
            ctx.restore();
        });
    }

    function _axisBox(ctx, frame) {
        ctx.strokeStyle = AXIS_COLOR;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(frame.ml, frame.mt);
        ctx.lineTo(frame.ml, frame.mt + frame.plotH);
        ctx.lineTo(frame.ml + frame.plotW, frame.mt + frame.plotH);
        ctx.stroke();
        ctx.lineWidth = 1;
    }

    function _axisNames(ctx, frame, xName, yName) {
        ctx.fillStyle = TEXT_COLOR;
        ctx.font = `12px ${_FONT}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if (xName) ctx.fillText(_truncate(xName, 40), frame.ml + frame.plotW / 2, frame.H - 12);
        if (yName) {
            ctx.save();
            ctx.translate(14, frame.mt + frame.plotH / 2);
            ctx.rotate(-Math.PI / 2);
            ctx.fillText(_truncate(yName, 40), 0, 0);
            ctx.restore();
        }
    }

    function _finite(values) {
        return values.filter(v => v != null && Number.isFinite(v));
    }

    function _drawLine(canvas, data, title) {
        const { xLabels, series, xColName, yColName } = data;
        const frame = _frame(canvas, title, { legend: series });
        const { ctx } = frame;
        const { yMin, yMax } = _extent(series);
        const ySpan = _yGrid(ctx, frame, yMin, yMax);
        const n = Math.max(xLabels.length, 1);
        const slot = frame.plotW / n;
        series.forEach(item => {
            ctx.beginPath();
            ctx.strokeStyle = item.stroke;
            ctx.lineWidth = 2;
            let started = false;
            item.values.forEach((val, i) => {
                if (val == null || !Number.isFinite(val)) {
                    started = false;
                    return;
                }
                const x = frame.ml + i * slot + slot / 2;
                const y = _yAt(frame, val, yMin, ySpan);
                if (!started) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
                started = true;
            });
            ctx.stroke();
            item.values.forEach((val, i) => {
                if (val == null || !Number.isFinite(val)) return;
                ctx.beginPath();
                ctx.fillStyle = item.stroke;
                ctx.arc(frame.ml + i * slot + slot / 2, _yAt(frame, val, yMin, ySpan), 3.5, 0, Math.PI * 2);
                ctx.fill();
            });
        });
        ctx.lineWidth = 1;
        _xTickLabels(ctx, frame, xLabels);
        _axisBox(ctx, frame);
        _axisNames(ctx, frame, xColName, series.length === 1 ? yColName : '');
    }

    function _drawRank(canvas, data, title) {
        const order = data.xLabels.map((_, i) => i);
        const key = data.series[0].values;
        order.sort((a, b) => (key[b] ?? -Infinity) - (key[a] ?? -Infinity));
        _drawHorizontalFromData(canvas, {
            xLabels: order.map((idx, rank) => `${rank + 1}. ${data.xLabels[idx]}`),
            series: data.series.map(item => ({
                ...item,
                values: order.map(idx => item.values[idx]),
            })),
            xColName: data.xColName,
            yColName: data.yColName,
        }, title);
    }

    function _quantile(sorted, p) {
        const idx = (sorted.length - 1) * p;
        const lo = Math.floor(idx);
        const hi = Math.ceil(idx);
        if (lo === hi) return sorted[lo];
        return sorted[lo] * (hi - idx) + sorted[hi] * (idx - lo);
    }

    function _boxStats(values) {
        const sorted = values.slice().sort((a, b) => a - b);
        const q1 = _quantile(sorted, 0.25);
        const q2 = _quantile(sorted, 0.5);
        const q3 = _quantile(sorted, 0.75);
        const iqr = q3 - q1;
        const low = q1 - 1.5 * iqr;
        const high = q3 + 1.5 * iqr;
        const inside = sorted.filter(v => v >= low && v <= high);
        return {
            q1, q2, q3,
            whiskerLo: inside.length ? inside[0] : sorted[0],
            whiskerHi: inside.length ? inside[inside.length - 1] : sorted[sorted.length - 1],
            outliers: sorted.filter(v => v < low || v > high),
        };
    }

    function _boxGroups(data) {
        const values = data.series[0].values;
        const labels = data.xLabels;
        const counts = new Map();
        labels.forEach(label => counts.set(label, (counts.get(label) || 0) + 1));
        const repeated = [...counts.values()].some(n => n > 1);
        if (!repeated) {
            const nums = _finite(values);
            if (nums.length < 2) {
                throw new Error(_plotMsg(
                    'A box plot needs at least two numeric values.',
                    '箱型图至少需要两个数字。'
                ));
            }
            return [{ label: data.series[0].name, stats: _boxStats(nums) }];
        }
        const grouped = new Map();
        labels.forEach((label, i) => {
            const val = values[i];
            if (val == null || !Number.isFinite(val)) return;
            if (!grouped.has(label)) grouped.set(label, []);
            grouped.get(label).push(val);
        });
        return [...grouped.entries()].map(([label, nums]) => ({ label, stats: _boxStats(nums) }));
    }

    function _drawBox(canvas, data, title) {
        const groups = _boxGroups(data);
        let lo = Infinity;
        let hi = -Infinity;
        groups.forEach(group => {
            const stats = group.stats;
            [stats.whiskerLo, stats.whiskerHi, ...stats.outliers].forEach(val => {
                if (val < lo) lo = val;
                if (val > hi) hi = val;
            });
        });
        if (lo === hi) { lo -= 1; hi += 1; }
        const span = hi - lo;
        const positive = lo >= 0;
        const yMin = positive ? Math.max(0, lo - span * 0.08) : lo - span * 0.1;
        const yMax = hi + span * 0.1;
        const frame = _frame(canvas, title);
        const { ctx } = frame;
        const ySpan = _yGrid(ctx, frame, yMin, yMax);
        const slot = frame.plotW / groups.length;
        groups.forEach((group, i) => {
            const stats = group.stats;
            const cx = frame.ml + i * slot + slot / 2;
            const boxW = Math.max(8, Math.min(slot * 0.46, 56));
            const y = val => _yAt(frame, val, yMin, ySpan);
            ctx.strokeStyle = BAR_STROKE;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(cx, y(stats.whiskerHi));
            ctx.lineTo(cx, y(stats.whiskerLo));
            ctx.moveTo(cx - boxW * 0.28, y(stats.whiskerHi));
            ctx.lineTo(cx + boxW * 0.28, y(stats.whiskerHi));
            ctx.moveTo(cx - boxW * 0.28, y(stats.whiskerLo));
            ctx.lineTo(cx + boxW * 0.28, y(stats.whiskerLo));
            ctx.stroke();
            const top = y(stats.q3);
            const height = Math.max(y(stats.q1) - top, 2);
            ctx.fillStyle = BAR_FILL;
            ctx.fillRect(cx - boxW / 2, top, boxW, height);
            ctx.strokeRect(cx - boxW / 2, top, boxW, height);
            ctx.beginPath();
            ctx.moveTo(cx - boxW / 2, y(stats.q2));
            ctx.lineTo(cx + boxW / 2, y(stats.q2));
            ctx.stroke();
            ctx.fillStyle = '#c5221f';
            stats.outliers.forEach(val => {
                ctx.beginPath();
                ctx.arc(cx, y(val), 3, 0, Math.PI * 2);
                ctx.fill();
            });
        });
        ctx.lineWidth = 1;
        _xTickLabels(ctx, frame, groups.map(group => group.label));
        _axisBox(ctx, frame);
        _axisNames(ctx, frame, data.xColName, data.series[0].name);
    }

    function _drawHistogram(canvas, data, title) {
        const nums = _finite(data.series[0].values);
        if (!nums.length) {
            throw new Error(_plotMsg(
                'A histogram needs at least one numeric value.',
                '直方图至少需要一个数字。'
            ));
        }
        const min = Math.min(...nums);
        const max = Math.max(...nums);
        let bins = Math.max(1, Math.min(12, Math.ceil(Math.log2(nums.length) + 1)));
        if (min === max) bins = 1;
        const width = bins === 1 ? 1 : (max - min) / bins;
        const counts = Array(bins).fill(0);
        const labels = [];
        for (let i = 0; i < bins; i++) {
            const start = min + i * width;
            const end = i === bins - 1 ? max : min + (i + 1) * width;
            labels.push(bins === 1 ? _fmtNum(min) : `${_fmtNum(start)}–${_fmtNum(end)}`);
        }
        if (bins === 1) counts[0] = nums.length;
        else {
            nums.forEach(val => {
                let idx = Math.floor((val - min) / width);
                if (idx < 0) idx = 0;
                if (idx >= bins) idx = bins - 1;
                counts[idx] += 1;
            });
        }
        const hi = Math.max(...counts, 1) * 1.1;
        const frame = _frame(canvas, title);
        const { ctx } = frame;
        const ySpan = _yGrid(ctx, frame, 0, hi);
        const slot = frame.plotW / bins;
        const barW = slot * 0.84;
        counts.forEach((count, i) => {
            const barH = frame.plotH * count / ySpan;
            const x = frame.ml + i * slot + (slot - barW) / 2;
            const y = frame.mt + frame.plotH - barH;
            ctx.fillStyle = BAR_FILL;
            ctx.strokeStyle = BAR_STROKE;
            ctx.fillRect(x, y, barW, barH);
            ctx.strokeRect(x, y, barW, barH);
        });
        _xTickLabels(ctx, frame, labels);
        _axisBox(ctx, frame);
        _axisNames(ctx, frame, data.series[0].name, _plotMsg('Count', '次数'));
    }

    function _drawPie(canvas, data, title) {
        const slices = data.xLabels.map((label, i) => ({
            label,
            value: data.series[0].values[i] > 0 ? data.series[0].values[i] : 0,
            color: SERIES_COLORS[i % SERIES_COLORS.length][0],
        })).filter(slice => slice.value > 0);
        const total = slices.reduce((sum, slice) => sum + slice.value, 0);
        if (total <= 0) {
            throw new Error(_plotMsg(
                'A pie chart needs at least one positive number.',
                '饼图至少需要一个大于 0 的数字。'
            ));
        }
        const frame = _frame(canvas, title, { ml: 28, mr: 190, mb: 28, mt: 52 });
        const { ctx } = frame;
        const cx = frame.ml + frame.plotW / 2;
        const cy = frame.mt + frame.plotH / 2;
        const radius = Math.max(20, Math.min(frame.plotW, frame.plotH) / 2 - 8);
        let angle = -Math.PI / 2;
        slices.forEach(slice => {
            const sweep = slice.value / total * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, radius, angle, angle + sweep);
            ctx.closePath();
            ctx.fillStyle = slice.color;
            ctx.fill();
            angle += sweep;
        });
        ctx.font = `11px ${_FONT}`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        slices.forEach((slice, i) => {
            const y = frame.mt + i * 18;
            if (y > frame.H - 16) return;
            const pct = Math.round(slice.value / total * 1000) / 10;
            ctx.fillStyle = slice.color;
            ctx.fillRect(frame.ml + frame.plotW + 18, y, 10, 10);
            ctx.fillStyle = TEXT_COLOR;
            ctx.fillText(_truncate(`${slice.label} ${pct}%`, 18), frame.ml + frame.plotW + 32, y + 5);
        });
    }

    function _drawRadar(canvas, data, title) {
        if (data.xLabels.length < 3) {
            throw new Error(_plotMsg(
                'A radar chart needs at least 3 categories.',
                '雷达图至少需要 3 个分类。'
            ));
        }
        const frame = _frame(canvas, title, { legend: data.series, ml: 48, mr: 36, mb: 28, mt: 56 });
        const { ctx } = frame;
        const cx = frame.ml + frame.plotW / 2;
        const cy = frame.mt + frame.plotH / 2;
        const radius = Math.max(30, Math.min(frame.plotW, frame.plotH) / 2 - 36);
        const axes = data.xLabels.length;
        const { yMin, yMax } = _extent(data.series);
        const span = yMax - yMin || 1;
        const angleAt = i => -Math.PI / 2 + (Math.PI * 2 * i) / axes;
        ctx.strokeStyle = GRID_COLOR;
        ctx.lineWidth = 1;
        for (let ring = 1; ring <= 4; ring++) {
            ctx.beginPath();
            for (let i = 0; i <= axes; i++) {
                const angle = angleAt(i % axes);
                const r = radius * ring / 4;
                const x = cx + Math.cos(angle) * r;
                const y = cy + Math.sin(angle) * r;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
        ctx.font = `11px ${_FONT}`;
        ctx.fillStyle = TEXT_COLOR;
        data.xLabels.forEach((label, i) => {
            const angle = angleAt(i);
            ctx.strokeStyle = GRID_COLOR;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
            ctx.stroke();
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            ctx.textAlign = cos > 0.25 ? 'left' : cos < -0.25 ? 'right' : 'center';
            ctx.textBaseline = sin > 0.25 ? 'top' : sin < -0.25 ? 'bottom' : 'middle';
            ctx.fillText(_truncate(String(label), 12), cx + cos * (radius + 14), cy + sin * (radius + 14));
        });
        data.series.forEach(item => {
            ctx.beginPath();
            item.values.forEach((val, i) => {
                const t = Math.max(0, Math.min(1, ((val ?? yMin) - yMin) / span));
                const angle = angleAt(i);
                const x = cx + Math.cos(angle) * radius * t;
                const y = cy + Math.sin(angle) * radius * t;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.closePath();
            ctx.fillStyle = item.fill;
            ctx.globalAlpha = 0.35;
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.strokeStyle = item.stroke;
            ctx.lineWidth = 2;
            ctx.stroke();
        });
        ctx.lineWidth = 1;
        ctx.globalAlpha = 1;
    }

    function _drawBubble(canvas, data, title) {
        const series = data.series;
        const n = data.xLabels.length;
        const xs = series.length >= 2 ? series[0].values : data.xLabels.map((_, i) => i + 1);
        const ys = series.length >= 2 ? series[1].values : series[0].values;
        const zs = series.length >= 3 ? series[2].values : ys;
        const xName = series.length >= 2 ? series[0].name : 'Index';
        const yName = series.length >= 2 ? series[1].name : series[0].name;
        const points = [];
        for (let i = 0; i < n; i++) {
            if (xs[i] == null || ys[i] == null || !Number.isFinite(xs[i]) || !Number.isFinite(ys[i])) continue;
            const size = zs[i] == null || !Number.isFinite(zs[i]) ? 1 : Math.abs(zs[i]);
            points.push({ x: xs[i], y: ys[i], z: size, label: data.xLabels[i] });
        }
        if (!points.length) {
            throw new Error(_plotMsg(
                'A bubble chart needs at least one numeric point.',
                '气泡图至少需要一个数字点。'
            ));
        }
        let xMin = Math.min(...points.map(point => point.x));
        let xMax = Math.max(...points.map(point => point.x));
        const rawYMin = Math.min(...points.map(point => point.y));
        let yMin = Math.min(0, rawYMin);
        let yMax = Math.max(...points.map(point => point.y));
        if (xMin === xMax) { xMin -= 1; xMax += 1; }
        if (yMin === yMax) { yMin -= 1; yMax += 1; }
        const xPad = (xMax - xMin) * 0.12;
        const yPad = (yMax - yMin) * 0.12;
        xMin -= xPad;
        xMax += xPad;
        yMin = rawYMin >= 0 ? Math.max(0, yMin - yPad) : yMin - yPad;
        yMax += yPad;
        const zMin = Math.min(...points.map(point => point.z));
        const zMax = Math.max(...points.map(point => point.z));
        const frame = _frame(canvas, title);
        const { ctx } = frame;
        const ySpan = _yGrid(ctx, frame, yMin, yMax);
        const xSpan = xMax - xMin || 1;
        const X = val => frame.ml + frame.plotW * (val - xMin) / xSpan;
        points.forEach((point, i) => {
            const t = zMax === zMin ? 0.55 : (point.z - zMin) / (zMax - zMin);
            const r = 7 + t * 26;
            const color = SERIES_COLORS[i % SERIES_COLORS.length];
            ctx.beginPath();
            ctx.fillStyle = color[0];
            ctx.strokeStyle = color[1];
            ctx.arc(X(point.x), _yAt(frame, point.y, yMin, ySpan), r, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            if (points.length <= 14) {
                ctx.fillStyle = TEXT_COLOR;
                ctx.font = `10px ${_FONT}`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.fillText(_truncate(String(point.label), 12), X(point.x), _yAt(frame, point.y, yMin, ySpan) - r - 2);
            }
        });
        _axisBox(ctx, frame);
        _axisNames(ctx, frame, xName, yName);
    }

    function _drawFunnel(canvas, data, title) {
        const items = data.xLabels.map((label, i) => ({
            label,
            value: data.series[0].values[i],
        })).filter(item => item.value != null && item.value > 0);
        items.sort((a, b) => b.value - a.value);
        if (!items.length) {
            throw new Error(_plotMsg(
                'A funnel chart needs at least one positive number.',
                '漏斗图至少需要一个大于 0 的数字。'
            ));
        }
        const frame = _frame(canvas, title, { ml: 150, mr: 28, mb: 24, mt: 48 });
        const { ctx } = frame;
        const max = items[0].value;
        const slot = frame.plotH / items.length;
        const height = Math.max(slot - 8, 4);
        ctx.font = `12px ${_FONT}`;
        ctx.textBaseline = 'middle';
        items.forEach((item, i) => {
            const next = items[i + 1] ? items[i + 1].value : item.value * 0.72;
            const topW = frame.plotW * (item.value / max);
            const botW = frame.plotW * (next / max);
            const y = frame.mt + i * slot + 4;
            const x1 = frame.ml + (frame.plotW - topW) / 2;
            const x2 = frame.ml + (frame.plotW - botW) / 2;
            ctx.beginPath();
            ctx.moveTo(x1, y);
            ctx.lineTo(x1 + topW, y);
            ctx.lineTo(x2 + botW, y + height);
            ctx.lineTo(x2, y + height);
            ctx.closePath();
            ctx.fillStyle = SERIES_COLORS[i % SERIES_COLORS.length][0];
            ctx.fill();
            ctx.fillStyle = TEXT_COLOR;
            ctx.textAlign = 'right';
            ctx.fillText(_truncate(`${item.label}  ${_fmtNum(item.value)}`, 18), frame.ml - 8, y + height / 2);
        });
    }

    // -------------------------------------------------------------------------
    return { draw, drawHorizontal, validateAndExtract, types: CHART_TYPES };

})();
