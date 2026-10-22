/**
 * Chrome translations. The page source stays English (same as the PHP app).
 * Chinese is applied by exact phrase, so result cells and SQL are left alone
 * unless the whole text is one of these labels.
 */
(function () {
  const DICT = {
    '— Select Connection —': '— 选择连接 —',
    'More options': '更多',
    'Save as a new context': '另存为新的查询场景',
    '+ New': '+ 新建',
    '+ New context': '+ 新建场景',
    'Clear the canvas and start a new context': '清空画布，开始一个新场景',
    'Load a CSV file into the results table': '把 CSV 载入结果表',
    '📂 CSV': '📂 CSV',
    'Load an XLSX file into the results table': '把 XLSX 载入结果表',
    '📂 XLSX': '📂 XLSX',
    '⚙ Profiles': '⚙ 连接',
    '⚙ New connection': '⚙ 新建连接',
    'Add a database connection': '新建一个数据库连接',
    'Test the current connection': '测试当前连接',
    '↯ Test Connection': '↯ 测试连接',
    '⌨ Shortcuts': '⌨ 快捷键',
    'Keyboard shortcuts': '快捷键',
    '(: About': '(: 关于',
    'Save/Load previously copied context': '保存或打开以前的查询场景',
    '🗂 Contexts': '🗂 场景',
    'Open notes': '打开笔记',
    '✎ Notes': '✎ 笔记',
    'Timestamp converter': '时间戳转换',
    'Center view on tables': '把视图对准数据表',
    'Overview zoom — shrink canvas only (toggle; recenters on tables)': '总览缩放',
    'Enter full screen (F11 / Cmd+Alt+F)': '全屏',
    'Enter full screen': '全屏',
    'Undo (Ctrl+Z)': '撤销 (Ctrl+Z)',
    'Redo (Ctrl+Shift+Z)': '重做 (Ctrl+Shift+Z)',
    'Find…': '查找…',
    'All': '全部',
    'Tables': '数据表',
    'Aliases': '别名',
    'Join labels': '连接标签',
    'Island labels': '分组标签',
    'Results column': '结果列',
    'Import an external SQL query to canvas tables and conditions': '把一条 SQL 导入到画布',
    '⇄ Import': '⇄ 导入',
    'Add a subquery table to the canvas': '在画布上添加子查询',
    '+ SubQuery': '+ 子查询',
    'Load a .sql or .csv file into a new red sub-query': '从 .sql 或 .csv 新建子查询',
    'Load file': '载入文件',
    'Copy visual filters to raw SQL': '把可视化条件复制成 SQL',
    '↳ Raw': '↳ SQL',
    'Build WHERE clause from a JSON object': '用 JSON 生成 WHERE',
    '↑ JSON': '↑ JSON',
    'Visual': '可视化',
    'Raw': 'SQL',
    'Drag a column here': '把字段拖到这里',
    'Copy visual GROUP BY columns to raw SQL': '把分组字段复制成 SQL',
    'Copy visual HAVING conditions to raw SQL': '把 HAVING 条件复制成 SQL',
    'Copy visual ORDER BY columns to raw SQL': '把排序字段复制成 SQL',
    'Copy visual select columns to raw SQL': '把选择字段复制成 SQL',
    'Generate SELECT + CREATE TABLE definitions for all tables (Ctrl/Cmd+K)': '生成表结构说明',
    'AI Knowledge': '表结构说明',
    'Plot the current results-table data as a bar chart': '把当前结果画成图',
    '📊 Plot': '📊 图表',
    'Run EXPLAIN on the current query (Alt+E)': '查看执行计划',
    '⚙ Explain': '⚙ 执行计划',
    'Run a custom SQL query': '运行手写 SQL',
    '▶ Run Custom Query': '▶ 运行手写 SQL',
    'Kill the running query on the server': '停止正在运行的查询',
    '✕ Cancel Query': '✕ 停止查询',
    '▶ Run Query': '▶ 运行查询',
    'Generated SQL query': '生成的 SQL',
    '-- Add tables to the canvas to begin': '-- 把数据表拖到画布上开始',
    '-- Multiple disconnected table groups found.\n-- Select one group to query.': '-- 有多组互不相连的表。\n-- 请先选定一组再查询。',
    '⊙± Diff cols': '⊙± 比较列',
    'Set-diff chosen columns against the next query or a CSV (array_diff / intersect / union)': '用选中的列和下一次查询或一份 CSV 做差集、交集、并集',
    'Sort A→Z': '按名称排序',
    'Sort SELECT columns alphabetically by column name in the query (UI order unchanged)': '查询里的字段按名称排序，右侧列表的顺序不变',
    'Table delimiter': '表间分隔',
    'Rec': '记录',
    '⊶ TL': '⊶ 时间线',
    'Query Recordings — left-click to open, right-click to toggle recording': '查询记录：左键打开，右键开始或停止记录',
    "Insert '|||' between each table's columns in the SELECT list": "在每张表的字段之间插入 '|||'",
    'DB Table Name': '显示表名',
    'Show the real table origin (db.table) below each result column header': '在结果列表头下方显示库名和表名',
    'DB Schema Alias': '显示别名',
    'Show table alias prefix in result column headers (e.g. u.id → checked, id → unchecked)': '结果列表头带上表别名。勾选后是 u.id，取消后只显示 id',
    'DISTINCT': '去重',
    'Cell': '单元格',
    'Header': '表头',
    'Compare cell values': '比较单元格',
    '⊜ Compare': '⊜ 比较',
    'Highlight duplicate cell values': '标出重复值',
    '⧉ Duplicates': '⧉ 重复值',
    'Hide repeated values row-to-row (Trace)': '隐藏连续重复值',
    '⋮ Trace': '⋮ 追踪',
    'Dim unhighlighted cells': '淡化未高亮的单元格',
    '☾ Dim': '☾ 淡化',
    'Run a query first to enable Calculus mode': '先运行查询，才能使用计算',
    '∑ Calculus': '∑ 计算',
    'Diff the current result against a CSV': '和 CSV 比较结果',
    '⇌ Diff CSV': '⇌ 比较 CSV',
    'Exit CSV diff': '退出 CSV 比较',
    '✕ Exit Diff CSV': '✕ 退出 CSV 比较',
    'Capture the current result, then re-run the query to diff against it': '记下当前结果，再运行一次做比较',
    '⊙ Diff Query': '⊙ 比较查询',
    'Exit query diff': '退出查询比较',
    '✕ Exit Diff Query': '✕ 退出查询比较',
    'Exit columns diff': '退出列比较',
    '✕ Exit Diff cols': '✕ 退出列比较',
    'Toggle EXPLAIN graph view': '切换执行计划图',
    '⎇ Explain Graph': '⎇ 执行计划图',
    'Toggle column search inputs': '显示列搜索',
    '⌕ Search': '⌕ 搜索',
    '↓ CSV': '↓ CSV',
    '↓ Heidi JSON': '↓ Heidi JSON',
    'Copy results as SQL SELECT … UNION ALL (wrapped in parentheses)': '把结果复制成 SELECT',
    '↓ SQL SELECT': '↓ SQL SELECT',
    'Map': '地图',
    'Connection Profiles': '数据库连接',
    'Close': '关闭',
    'Add Profile': '添加连接',
    'Name': '名称',
    'My Production DB': '例如：学校数据库',
    'Type': '类型',
    'Host': '主机',
    'Port': '端口',
    'Database': '数据库',
    'my_database': '数据库名',
    'Username': '用户名',
    'Password': '密码',
    '(leave blank if none)': '没有密码就留空',
    'File path': '文件路径',
    '/path/to/database.db': '数据库文件路径',
    'Save Profile': '保存连接',
    'Test Connection': '测试连接',
    'Clear': '清空',
    'Contexts': '场景',
    'Clear everything and start fresh': '清空画布，重新开始',
    'Search…': '搜索…',
    '📂 Load JSON': '📂 载入 JSON',
    'Loading…': '正在加载…',
    'Save As': '另存为',
    'e.g. Users by region': '例如：按班级统计人数',
    'Save': '保存',
    'Edit profile': '编辑连接',
    'Delete profile': '删除连接',
    'No profiles yet. Add one below.': '还没有连接。在下面添加一个。',
    'New tab': '新标签',
    'New tab (Ctrl+Alt+T)': '新标签',
    'Reopen closed tab (Ctrl+Alt+Shift+T)': '重新打开刚关闭的标签',
    'Close tab (Ctrl+Alt+W)': '关闭标签',
    'Duplicate tab': '复制标签',
    'Rename…': '重命名…',
    'Close tab': '关闭标签',
    'Close other tabs': '关闭其他标签',
    'Reopen closed tab': '重新打开',
    'Tabs': '标签',
    'Paste a JSON object. Each key→value pair becomes a key = value condition.': '粘贴一个 JSON。每个键值会变成一条条件。',
    'Shift+Enter to apply': 'Shift+Enter 应用',
    'Logical operator between conditions': '条件之间的逻辑关系',
    'Apply': '应用',
    'Delete': '删除',
    'WHERE': 'WHERE 筛选',
    'GROUP BY': 'GROUP BY 分组',
    'HAVING': 'HAVING 分组后筛选',
    'ORDER BY': 'ORDER BY 排序',
    'LIMIT': 'LIMIT 行数',
    'SELECT': 'SELECT 字段',
    'Search schemas…': '搜索库…',
    'Search tables…': '搜索表…',
    'Select a connection above': '请先在上面选择一个连接',
    'Columns appear here once tables are on the canvas.': '把数据表放到画布上之后，字段会出现在这里。',
    'e.g. o.total > 100 AND u.active = 1': '例如 c_name LIKE \'猴%\'',
    'e.g. u.id, o.status': '例如 s.s_sex',
    'e.g. COUNT(o.id) > 5': '例如 COUNT(*) > 1',
    'e.g. o.created_at DESC, u.name ASC': '例如 s_name ASC',
  };

  const extra = window.SQLJ_ZH || { exact: {}, prefix: [] };
  Object.assign(DICT, extra.exact || {});
  const PREFIXES = (extra.prefix || []).slice().sort((a, b) => b[0].length - a[0].length);

  const KEY = 'sqljoiner.lang';
  const originals = new WeakMap();
  let applying = false;
  let observer = null;
  let scheduled = false;

  function lang() {
    return localStorage.getItem(KEY) === 'en' ? 'en' : 'zh';
  }

  function _name(value, fallback, zhFallback) {
    return value === fallback ? zhFallback : value;
  }

  const PATTERNS = [
    [/^Close (.+?)\?\n\nAll (\d+) tables? will be removed from the canvas\.$/, m => {
      const name = m[1] === 'this island' ? '这一组' : `「${m[1]}」`;
      return `关闭${name}？\n\n其中的 ${m[2]} 张表将从画布上移除。`;
    }],
    [/^The CSV contains ([\d,]+) rows\. Load anyway\?$/, m =>
      `这份 CSV 有 ${m[1]} 行。仍然载入吗？`],
    [/^A saved context named "([\s\S]+)" already exists\.\n\nDo you want to overwrite it with the current state\?$/, m =>
      `已经有名为「${m[1]}」的场景。\n\n要用当前内容覆盖它吗？`],
    [/^Delete profile "([\s\S]+)"\?\n\nThis cannot be undone\.$/, m =>
      `删除连接「${m[1]}」？\n\n删除后无法恢复。`],
    [/^Alias "([\s\S]+)" already exists on the canvas\.\nPlease choose a different alias\.$/, m =>
      `画布上已经有别名「${m[1]}」。\n请换一个别名。`],
    [/^Alias "([\s\S]+)" is already used by another table\.$/, m =>
      `别名「${m[1]}」已经被另一张表使用。`],
    [/^Remove all (\d+) timeline entries and start a new timeline\?$/, m =>
      `清掉全部 ${m[1]} 条时间线记录，并新建一条时间线吗？`],
    [/^Replace the (\d+) current entries with "([\s\S]+)"\?$/, m =>
      `用「${m[2]}」替换当前的 ${m[1]} 条记录吗？`],
    [/^Delete group "([\s\S]+)" and its (\d+) timeline\(s\)\?$/, m =>
      `删除分组「${_name(m[1], 'this group', '这个分组')}」以及里面的 ${m[2]} 条时间线吗？`],
    [/^Delete empty group "([\s\S]+)"\?$/, m =>
      `删除空分组「${m[1]}」吗？`],
    [/^Replace "([\s\S]+)" with the current result\?\n\nThe label will be kept\.$/, m =>
      `用当前结果替换「${m[1]}」？\n\n名称会保留。`],
    [/^Delete group "([\s\S]+)"\? Its (\d+) recordings? will also be deleted\.$/, m =>
      `删除分组「${_name(m[1], 'this group', '这个分组')}」？里面的 ${m[2]} 条记录也会一起删除。`],
    [/^Delete group "([\s\S]+)"\?$/, m =>
      `删除分组「${_name(m[1], 'this group', '这个分组')}」吗？`],
    [/^Delete (\d+) selected recordings?\?$/, m =>
      `删除选中的 ${m[1]} 条记录吗？`],
    [/^Cannot parse expression:\n([\s\S]+)$/, m =>
      `表达式无法解析：\n${m[1]}`],
    [/^Column\(s\) not found in the results table:\n  (.+)\n\nAvailable columns:\n  ([\s\S]+)$/, m =>
      `结果表里没有这些列：\n  ${m[1]}\n\n可用的列：\n  ${m[2]}`],
    [/^"([\s\S]+)" is already on the canvas\.$/, m =>
      `「${m[1]}」已经在画布上。`],
    [/^(\d+) tables? could not be fetched: ([\s\S]+)$/, m =>
      `${m[1]} 张表没有取到：${m[2]}`],
    [/^(\d+) table names? saved to file\.$/, m =>
      `已把 ${m[1]} 个表名保存到文件。`],
    [/^(\d+) table names? copied to clipboard\.$/, m =>
      `已复制 ${m[1]} 个表名。`],
    [/^(\d+) SELECTs? saved to file\.$/, m =>
      `已把 ${m[1]} 条 SELECT 保存到文件。`],
    [/^(\d+) SELECTs? copied to clipboard\.$/, m =>
      `已复制 ${m[1]} 条 SELECT。`],
    [/^(\d+) CREATE TABLEs? saved to file\.$/, m =>
      `已把 ${m[1]} 条 CREATE TABLE 保存到文件。`],
    [/^(\d+) CREATE TABLEs? copied to clipboard\.$/, m =>
      `已复制 ${m[1]} 条 CREATE TABLE。`],
    [/^Could not load CSV: ([\s\S]+)$/, m =>
      `无法载入 CSV：${m[1]}`],
    [/^Loaded: ([\s\S]+)$/, m =>
      `已载入：${m[1]}`],
    [/^Context "([\s\S]+)" loaded and saved\.$/, m =>
      `场景「${m[1]}」已载入并保存。`],
    [/^Duplicated as "([\s\S]+)"\.$/, m =>
      `已复制为「${m[1]}」。`],
    [/^Tab limit reached \((\d+)\)\.$/, m =>
      `标签数量已到上限（${m[1]}）。`],
    [/^"([\s\S]+)" added to ([A-Z]+)$/, m =>
      `「${m[1]}」已加入 ${m[2]}。`],
    [/^Added ([\s\S]+) to WHERE$/, m =>
      `已把 ${m[1]} 加入 WHERE。`],
    [/^([\s\S]+) was already in Custom Expressions$/, m =>
      `${m[1]} 已经在自定义表达式里。`],
    [/^Added ([\s\S]+) to Custom Expressions$/, m =>
      `已把 ${m[1]} 加入自定义表达式。`],
    [/^"([\s\S]+)" set as join anchor$/, m =>
      `已把「${m[1]}」设为连接起点。`],
    [/^Copied ([\s\S]+)$/, m =>
      `已复制 ${m[1]}`],
    [/^"([\s\S]+)" replaced with current result\.$/, m =>
      `已用当前结果替换「${m[1]}」。`],
    [/^Already on timeline: ([\s\S]+)$/, m =>
      `时间线上已经有：${m[1]}`],
    [/^Timeline "([\s\S]+)" saved\.$/, m =>
      `时间线「${m[1]}」已保存。`],
    [/^This will ADD a new island to the canvas with the imported query\.\n\nTables found: (.+)\nJoins found: (\d+)\n\nContinue\?$/, m =>
      `这会在画布上新增一组，放进导入的查询。\n\n找到的表：${m[1] === 'none' ? '没有' : m[1]}\n找到的连接：${m[2]}\n\n继续吗？`],
    [/^This will CLEAR all current canvas tables, joins, and query conditions, then apply the imported query\.\n\nTables found: (.+)\nJoins found: (\d+)\n\nContinue\?$/, m =>
      `这会清空画布上现有的表、连接和查询条件，再放进导入的查询。\n\n找到的表：${m[1] === 'none' ? '没有' : m[1]}\n找到的连接：${m[2]}\n\n继续吗？`],
  ];

  function t(text) {
    if (text == null) return text;
    if (lang() !== 'zh') return text;
    const s = String(text);
    if (Object.prototype.hasOwnProperty.call(DICT, s)) return DICT[s];
    for (const [en, zh] of PREFIXES) {
      if (en && s.startsWith(en)) return zh + s.slice(en.length);
    }
    for (const [re, fn] of PATTERNS) {
      const match = s.match(re);
      if (match) return fn(match);
    }
    return s;
  }

  function translateRaw(src) {
    if (lang() !== 'zh') return src;
    const match = src.match(/^(\s*)([\s\S]*?)(\s*)$/);
    if (!match) return src;
    const lead = match[1];
    const phrase = match[2];
    const tail = match[3];
    const zh = t(phrase);
    if (zh !== phrase) return lead + zh + tail;
    // A key that itself has surrounding spaces still matches the raw node.
    if (phrase !== src) {
      const whole = t(src);
      if (whole !== src) return whole;
    }
    return src;
  }

  const PREVIEW_PHRASES = [
    '-- Add tables to the canvas to begin',
    '-- Multiple disconnected table groups found.\n-- Select one group to query.',
  ];

  function previewZh(source) {
    return Object.prototype.hasOwnProperty.call(DICT, source) ? DICT[source] : source;
  }

  // The SQL bar is skipped so a query is never rewritten. These two messages
  // are the whole text of that bar, so they can still be translated.
  function translatePreview() {
    const el = document.getElementById('sql-preview-text');
    if (!el) return;
    const current = el.textContent;
    const marked = el.getAttribute('data-i18n-preview');
    let source = null;
    if (PREVIEW_PHRASES.includes(current)) source = current;
    else if (marked && PREVIEW_PHRASES.includes(marked) && (current === marked || current === previewZh(marked))) source = marked;
    if (!source) {
      el.removeAttribute('data-i18n-preview');
      return;
    }
    el.setAttribute('data-i18n-preview', source);
    const next = lang() === 'zh' ? previewZh(source) : source;
    if (el.textContent !== next) el.textContent = next;
  }

  let previewScheduled = false;
  let again = false;
  function schedulePreview() {
    if (previewScheduled || applying) return;
    previewScheduled = true;
    requestAnimationFrame(() => {
      previewScheduled = false;
      translatePreview();
    });
  }

  function skipText(parent) {
    if (parent.id === 'btn-theme' || parent.id === 'btn-lang') return true;
    return !!parent.closest('script,style,textarea,input,[contenteditable="true"],#results-table,#sql-preview-text,.toast');
  }

  function paintThemeButton() {
    const btn = document.getElementById('btn-theme');
    if (!btn) return;
    const light = document.documentElement.dataset.theme === 'light';
    const label = light ? 'Dark' : 'Light';
    const title = light ? 'Switch to dark theme' : 'Switch to light theme';
    const text = t(label);
    const tip = t(title);
    if (btn.textContent !== text) btn.textContent = text;
    if (btn.title !== tip) btn.title = tip;
  }

  function applyTheme(mode, persist) {
    const light = mode === 'light';
    document.documentElement.dataset.theme = light ? 'light' : 'dark';
    if (persist) {
      try { localStorage.setItem('sqlj-theme', light ? 'light' : 'dark'); } catch (e) {}
    }
    paintThemeButton();
  }

  function skipAttr(el) {
    return !!el.closest('script,style,#results-table,#sql-preview-text,.toast');
  }

  function apply(root) {
    root = root || document.body;
    if (!root) return;
    if (applying) { again = true; return; }
    if (root.nodeType !== 1) root = root.parentElement || document.body;
    if (root !== document.body && !root.isConnected) root = document.body;
    applying = true;
    observer?.disconnect();
    try {
      document.documentElement.lang = lang() === 'zh' ? 'zh-CN' : 'en';
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      for (const node of nodes) {
        const parent = node.parentElement;
        if (!parent || skipText(parent)) continue;
        if (!originals.has(node)) originals.set(node, node.nodeValue);
        const phrase = String(originals.get(node)).trim();
        // A <code>SELECT</code> is the keyword. The same word on a panel label is "SELECT 字段".
        if (parent.closest('code') && /^(SELECT|UNION ALL|NULL|AND|OR|FROM|WHERE|JOIN|AS|ON|DISTINCT)$/.test(phrase)) continue;
        const next = translateRaw(originals.get(node));
        if (node.nodeValue !== next) node.nodeValue = next;
      }
      root.querySelectorAll('[title],[placeholder],[aria-label]').forEach(el => {
        if (skipAttr(el)) return;
        for (const attr of ['title', 'placeholder', 'aria-label', 'alt']) {
          if (!el.hasAttribute(attr)) continue;
          const store = `data-i18n-${attr}`;
          if (!el.hasAttribute(store)) el.setAttribute(store, el.getAttribute(attr));
          const next = t(el.getAttribute(store));
          if (el.getAttribute(attr) !== next) el.setAttribute(attr, next);
        }
      });
      const btn = document.getElementById('btn-lang');
      const label = lang() === 'zh' ? '中文' : 'EN';
      if (btn && btn.textContent !== label) btn.textContent = label;
      paintThemeButton();
      translatePreview();
    } finally {
      applying = false;
      if (observer && document.body) {
        observer.observe(document.body, {
          childList: true,
          subtree: true,
          characterData: true,
          attributes: true,
          attributeFilter: ['placeholder', 'title', 'aria-label', 'alt'],
        });
      }
      if (again) {
        again = false;
        schedule(document.body);
      }
    }
  }

  function schedule(root) {
    if (root && root.nodeType !== 1) root = root.parentElement;
    if (!root || (root !== document.body && !root.isConnected)) root = document.body;
    if (!schedule.target) schedule.target = root;
    else if (schedule.target !== root) schedule.target = document.body;
    if (applying) { again = true; return; }
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(() => {
      scheduled = false;
      const target = schedule.target || document.body;
      schedule.target = null;
      apply(target);
    });
  }

  function mount() {
    const host = document.getElementById('profile-switcher') || document.getElementById('tabbar');
    if (host && !document.getElementById('btn-lang')) {
      const btn = document.createElement('button');
      btn.id = 'btn-lang';
      btn.type = 'button';
      btn.title = '中文 / English';
      btn.style.cssText = 'margin-left:8px;font-size:12px;padding:2px 8px;cursor:pointer;';
      btn.addEventListener('click', () => {
        localStorage.setItem(KEY, lang() === 'zh' ? 'en' : 'zh');
        apply(document.body);
      });
      host.appendChild(btn);
    }
    if (host && !document.getElementById('btn-theme')) {
      const themeBtn = document.createElement('button');
      themeBtn.id = 'btn-theme';
      themeBtn.type = 'button';
      themeBtn.style.cssText = 'margin-left:4px;font-size:12px;padding:2px 8px;cursor:pointer;';
      themeBtn.addEventListener('click', () => {
        const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
        applyTheme(next, true);
      });
      host.appendChild(themeBtn);
    }
    applyTheme(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark', false);
    window.addEventListener('storage', (e) => {
      if (e.key !== 'sqlj-theme') return;
      applyTheme(e.newValue === 'light' ? 'light' : 'dark', false);
    });
    apply(document.body);
    window.addEventListener('load', () => apply(document.body));
    observer = new MutationObserver(records => {
      if (applying) { again = true; return; }
      for (const record of records) {
        if (record.type === 'characterData' || record.type === 'attributes') {
          const el = record.target.nodeType === 1 ? record.target : record.target.parentElement;
          if (!el || el.id === 'btn-lang' || el.id === 'btn-theme' || el.closest?.('#results-table,script,style,.toast,[contenteditable="true"]')) continue;
          if (el.id === 'sql-preview-text' || el.closest?.('#sql-preview-text')) {
            schedulePreview();
            continue;
          }
          schedule(el);
          continue;
        }
        for (const node of record.addedNodes) {
          const el = node.nodeType === 1 ? node : node.parentElement;
          if (!el || el.id === 'btn-lang' || el.id === 'btn-theme' || el.closest?.('#results-table,script,style,[contenteditable="true"]')) continue;
          if (el.id === 'sql-preview-text' || el.closest?.('#sql-preview-text')) {
            schedulePreview();
            continue;
          }
          schedule(el);
        }
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['placeholder', 'title', 'aria-label', 'alt'],
    });
  }

  window.I18n = { t, apply, lang, dict: DICT };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
