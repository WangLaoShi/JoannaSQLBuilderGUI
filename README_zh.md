# SQL Joiner 中文说明

这是 SQL Joiner 的 Node 版本，放在 `node_app/`。学生不需要安装 PHP。本机起一个服务，浏览器或安装包打开同一套拖拽画布，用它连接 MySQL，把 SELECT 查询搭出来再运行。

原来的 PHP 版本仍在 `app/`，说明见根目录的 `README.md`。

## 运行

需要 Node.js 20 或更新版本。

```bash
cd node_app
npm install
npm start
```

浏览器打开 `http://127.0.0.1:4173`。服务只监听本机。连接、场景写在 `node_app/storage/`，这个目录不会进入 Git。

桌面窗口：

```bash
cd node_app
npm run desktop
```

安装包自己带服务，数据放在系统的用户目录里，不和浏览器版的 `storage/` 混用。

## 安装包

在 Apple 芯片的 Mac 上可以同时打出 Mac 和 Windows 的包。包没有签名。

```bash
cd node_app
npm run pack:mac
npm run pack:win
```

`npm run pack` 会两个都打。成品在 `node_app/dist/`：

| 文件 | 给谁用 |
|---|---|
| `SQL Joiner-1.0.0-arm64.dmg` | Apple 芯片的 Mac |
| `SQL Joiner-1.0.0.dmg` | Intel Mac |
| `SQL Joiner Setup 1.0.0.exe` | Windows 安装程序 |
| `SQL Joiner-1.0.0-win.zip` | Windows 解压后直接运行 |

Mac 第一次打开：在 Finder 里按住 Control 再点应用，选择「打开」。Windows 若出现 SmartScreen，选择「仍要运行」。

## 界面怎么用

右上角可以在中文和 English 之间切换。SQL 关键字、表名、字段名和查询结果保持原样。

1. 点「场景」，新建一条 MySQL 连接，填写主机、端口、库名、账号和密码，测试通过后保存。SQLite 可以填一个本机数据库文件路径。
2. 在左侧选中连接，把表拖到画布上。表和表之间拖字段连线，选择 INNER、LEFT、RIGHT、FULL 或 CROSS。
3. 右侧勾选要查询的字段。每一组表是一个「岛」，可以命名、收起、改颜色。
4. 底部看生成的 SQL。点「运行查询」。结果出现在下方表格里。正在跑的查询可以停止。

LIMIT 最大 5000 行。WHERE 里写下的值会原样进入 SQL，字符串要自己加引号，例如 `'衣服'`。

## 聚合和 HAVING

求和、计数不要把字段直接拖进 SELECT。在 SELECT 底部的自定义表达式里新增一条：

- 左侧选聚合函数，右侧点字段，拼出 `SUM(p.sale_price)`。
- 别名写成 `SUM_PRICE` 这种不含空格的名字。
- 纳入方式选「和字段一起」或「只要表达式」。停在「不写入 SQL」时，这条表达式不会出现在查询里。
- GROUP BY 拖入分组字段，例如 `p.product_type`。

HAVING 是分组之后的筛选：

- 点 HAVING 下面出现的 `SUM_PRICE`，填 `> 600`。生成的是 `HAVING SUM_PRICE > 600`，表示这一类的合计大于 600。
- 要按类别名称筛选，把已经放进 GROUP BY 的字段拖进 HAVING，例如 `p.product_type = '衣服'`。
- `p.sale_price > 600` 不能放在 HAVING 里。分组之后没有单独的单价。想先丢掉便宜的行，把这个条件放进 WHERE。

也可以把 HAVING 切到原始 SQL，直接写 `SUM(p.sale_price) > 600`。

运算字段用表达式编辑器左侧的「运算」：点字段和 `+ − * /`，例如 `sale_price * 数量`。

## 图表

查询有结果后点「图表」。文字列当分类，数字列当数值。列的左右顺序都可以。

可选线图、柱图、排行榜图、条形图、箱型图、直方图、饼图、雷达图、气泡图、漏斗图。选好一种后点「加入画板」，再换一种继续加入。点「图表画板」把这些图放在一起看。

箱型图和直方图看的是数字列的分布。雷达图至少要 3 个分类。饼图和漏斗图使用大于 0 的数字。气泡图有两列数字时，分别作为横轴和纵轴；有第三列数字时，用它决定气泡大小。

## 测试

```bash
cd node_app
npm test
```

测试对照的是查询拼接结果，不连接外部 MySQL。

## 不要把它当成公开网站

现在没有登录。一台机器上的连接和已保存场景是共用的，数据库密码以明文写在本机的 `profiles.json` 里。适合老师或学生在自己的电脑上用。不要把这个服务放到公网上给不同的人一起访问。
