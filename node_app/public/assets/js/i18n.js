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
    'Load a CSV file into the results table': '把 CSV 载入结果表',
    '📂 CSV': '📂 CSV',
    'Load an XLSX file into the results table': '把 XLSX 载入结果表',
    '📂 XLSX': '📂 XLSX',
    '⚙ Profiles': '⚙ 连接',
    '↯ Test Connection': '↯ 测试连接',
    '⌨ Shortcuts': '⌨ 快捷键',
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
    [/^Close (.+?)\?\n\nAll (\d+) tables? will be removed from the canvas\.$/, m =>
      `关闭${_name(m[1], 'this island', '这一组')}？\n\n画布上的 ${m[2]} 张表都会被移走。`],
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
    const phrase = match[2];
    const zh = phrase === src ? null : t(phrase);
    const translated = zh == null ? t(src) : (zh === phrase ? src : match[1] + zh + match[3]);
    return translated;
  }

  function skipText(parent) {
    return !!parent.closest('script,style,textarea,input,#results-table,#sql-preview-text,.toast');
  }

  function skipAttr(el) {
    return !!el.closest('script,style,#results-table,#sql-preview-text,.toast');
  }

  function apply(root) {
    root = root || document.body;
    if (!root || applying) return;
    if (root.nodeType !== 1) root = root.parentElement || document.body;
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
        const next = translateRaw(originals.get(node));
        if (node.nodeValue !== next) node.nodeValue = next;
      }
      root.querySelectorAll('[title],[placeholder],[aria-label]').forEach(el => {
        if (skipAttr(el)) return;
        for (const attr of ['title', 'placeholder', 'aria-label']) {
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
    } finally {
      applying = false;
      if (observer && document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
      }
    }
  }

  function schedule(root) {
    if (!schedule.target) schedule.target = root;
    else if (schedule.target !== root) schedule.target = document.body;
    if (scheduled || applying) return;
    scheduled = true;
    requestAnimationFrame(() => {
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
    apply(document.body);
    window.addEventListener('load', () => apply(document.body));
    observer = new MutationObserver(records => {
      if (applying) return;
      for (const record of records) {
        for (const node of record.addedNodes) {
          const el = node.nodeType === 1 ? node : node.parentElement;
          if (!el || el.id === 'btn-lang' || el.closest?.('#results-table,#sql-preview-text,script,style')) continue;
          schedule(el);
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  window.I18n = { t, apply, lang, dict: DICT };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
