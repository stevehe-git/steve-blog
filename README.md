# 项目介绍
这是一个个人博客网站，技术栈使用 Vue 3 + TypeScript + Vite，支持多语言国际化、Markdown 文章渲染、评论功能、主题切换等特性，旨在为个人提供简洁、高效的博客展示平台。

# 核心特性
✨ 多语言国际化 - 支持中英文等多语言切换，适配全球用户使用场景，可灵活扩展更多语种
📝 Markdown 文章 - 支持 Markdown 格式文章渲染，包括标题、列表、代码块、引用、图片等
💬 评论功能 - 支持文章评论，评论数据本地存储，可扩展后端接口
📱 响应式设计 - 适配桌面端 / 移动端多终端使用，保证不同设备下的操作流畅度
🌓 主题切换 - 支持深色/浅色主题切换，自动保存用户偏好
🚀 高性能 - 基于 Vite 构建，按需加载，极致渲染性能
📚 文章分类 - 支持文章分类筛选和排序功能
🔗 目录导航 - 文章详情页自动生成目录，支持锚点跳转

# 技术栈
|技术|版本|说明|
|:--------|:-------------|:---------------------|
|Vue|3.4+|核心前端框架，基于 Composition API 构建|
|TypeScript|5.0+|类型安全开发，提升代码可维护性与可读性|
|Vite|5.0+|下一代构建工具，实现快速热更新与优化构建|
|Pinia|2.1+|Vue 官方状态管理库，替代 Vuex，简化状态管理|
|Vue Router|4.2+|路由管理，支持动态路由、路由守卫与权限控制|
|vue-i18n|9.8+|国际化解决方案，支持语言切换、占位符插值、复数处理|
|markdown-it|14.1+|Markdown 解析器，支持插件扩展，用于文章内容渲染|
|highlight.js|11.10+|代码语法高亮库，支持多种编程语言，集成到 markdown-it 中|
|katex|latest|LaTeX 数学公式渲染库，快速、轻量级，支持行内和块级公式|
|mermaid|latest|图表和流程图渲染库，支持流程图、时序图、类图等多种图表类型|

# 快速开始
## 环境要求
 - Node.js ≥ 18.0.0（推荐 18.16.0 LTS）
 - npm/yarn/pnpm（推荐 pnpm，提升依赖安装速度）
 - 浏览器支持：Chrome 90+、Firefox 88+、Edge 90+、Safari 15+

## 安装依赖
```bash
# 克隆项目
git clone https://github.com/your-username/my-blog.git

# 进入项目目录
cd my-blog

# 安装依赖（pnpm优先）
pnpm install
# 若使用npm
npm install
# 若使用yarn
yarn install
```

## 本地开发
```bash
# 启动开发服务器（自动打开浏览器，支持热更新）
pnpm dev

# 访问地址（默认端口5173，若被占用自动切换）
http://localhost:5173
```

## 构建生产
```bash
# 构建生产包（自动优化代码、压缩资源、按需拆分）
pnpm build

# 预览生产构建（验证构建结果）
pnpm preview
```

# 核心功能使用
## 国际化配置
项目基于 vue-i18n 实现多语言支持，默认支持中英双语，可扩展日语、韩语等更多语种：
- 语言切换即时生效，自动缓存用户偏好到本地存储
- 支持模板插值、复数形式、日期 / 数字格式化
- 支持组件内、全局、工具函数中多场景使用

扩展新语言：
- 在 `src/locales/` 目录下新增语言文件（如 `ja.json` 日语）
- 在 `src/i18n.ts` 中注册新语言

## 文章管理
文章数据存储在 `src/data/articles.ts` 中，支持以下字段：
- `id`: 文章唯一标识
- `title`: 文章标题
- `description`: 文章描述
- `content`: Markdown 格式的文章内容
- `categoryKey`: 文章分类
- `tag`: 文章标签
- `date`: 发布日期
- `platform`: 发布平台
- `cover`: 封面背景（支持渐变或图片）
- `badge`: 可选徽章

## Markdown 渲染
项目使用 markdown-it 插件进行 Markdown 解析，支持以下语法：
- 标题（H1-H6，自动生成锚点 ID）
- 无序列表和有序列表
- 引用块
- 代码块（支持语言标识，使用 highlight.js 进行语法高亮，支持一键复制）
- 行内代码
- 粗体、斜体文本
- 图片
- 链接（自动识别 URL）
- HTML 标签（可选）
- 删除线、高亮标记（`==标记文本==`）
- 表格（带边框样式）
- **Mermaid 图表**（流程图、时序图、类图、状态图、ER图、甘特图、饼图等）
- **LaTeX 数学公式**（使用 KaTeX 渲染，支持行内公式和块级公式）

### LaTeX 数学公式支持
项目使用 KaTeX 渲染 LaTeX 数学公式，支持行内公式和块级公式：

**行内公式**（使用单个 `$` 包裹）：
```markdown
这是一个行内公式：$E = mc^2$
```

**块级公式**（使用双 `$$` 包裹）：
```markdown
$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$
```

**常用数学符号示例**：
- 分数：`$\frac{a}{b}$` → $\frac{a}{b}$
- 根号：`$\sqrt{x}$` → $\sqrt{x}$
- 上标和下标：`$x^2$`、`$x_i$` → $x^2$、$x_i$
- 求和：`$\sum_{i=1}^{n} x_i$` → $\sum_{i=1}^{n} x_i$
- 积分：`$\int_{a}^{b} f(x) dx$` → $\int_{a}^{b} f(x) dx$
- 矩阵：`$\begin{pmatrix} a & b \\ c & d \end{pmatrix}$`

更多语法请参考 [KaTeX 官方文档](https://katex.org/docs/supported.html)。

### Mermaid 图表支持
项目支持 Mermaid 图表渲染，可以在 Markdown 中使用以下代码块语法：

\`\`\`mermaid
sequenceDiagram
    participant A
    participant B
    A->>B: 消息
    B-->>A: 回复
\`\`\`

支持的图表类型：
- `mermaid` - 通用 Mermaid 图表
- `sequenceDiagram` - 时序图
- `classDiagram` - 类图
- `stateDiagram` - 状态图
- `erDiagram` - ER图
- `journey` - 用户旅程图
- `gantt` - 甘特图
- `pie` - 饼图
- `requirement` - 需求图
- `gitgraph` - Git 图
- `mindmap` - 思维导图
- `timeline` - 时间线

文章详情页会自动生成目录（TOC），支持锚点跳转。代码块使用 highlight.js 进行语法高亮，支持多种编程语言，并提供一键复制功能。

## 评论功能
评论功能使用本地存储（localStorage）保存数据，可按文章 ID 分组管理。支持：
- 添加评论（昵称可选）
- 查看评论列表
- 评论时间显示

可扩展为后端 API 接口，只需修改 `src/composables/useArticleComments.ts` 中的实现。

## 主题切换
项目支持深色/浅色主题切换，主题状态通过 Pinia 管理，自动保存到本地存储。

# 目录结构
```
my-blog/
├── public/              # 静态资源（不会被Vite处理）
│   └── favicon.ico      # 网站图标
├── src/
│   ├── assets/          # 静态资源（图片、样式、字体等，会被Vite处理）
│   ├── components/      # 通用组件
│   │   └── article/     # 文章相关组件
│   │       ├── ArticleHeader.vue      # 文章头部
│   │       ├── ArticleContent.vue     # 文章内容
│   │       ├── ArticleTOC.vue         # 目录导航
│   │       └── CommentSection.vue      # 评论区域
│   ├── composables/     # 组合式函数（逻辑复用）
│   │   ├── useArticleMarkdown.ts      # Markdown 解析逻辑
│   │   └── useArticleComments.ts       # 评论管理逻辑
│   ├── data/            # 数据文件
│   │   └── articles.ts  # 文章数据
│   ├── locales/         # 国际化语言文件
│   │   ├── zh.json      # 中文语言包
│   │   └── en.json      # 英文语言包
│   ├── pages/           # 页面组件
│   │   ├── HomePage.vue         # 首页
│   │   ├── ArticlesPage.vue    # 文章列表页
│   │   ├── ArticleDetailPage.vue # 文章详情页
│   │   └── ContactPage.vue      # 联系页
│   ├── router/          # 路由配置
│   │   └── index.ts     # 路由定义
│   ├── store/           # Pinia状态管理
│   │   ├── modules/     # 模块状态
│   │   │   └── app.ts   # 应用状态（主题等）
│   │   └── index.ts     # Pinia实例创建
│   ├── App.vue          # 根组件
│   ├── main.ts          # 入口文件（初始化Vue、路由、Pinia等）
│   ├── i18n.ts          # 国际化配置
│   └── style.css        # 全局样式
├── .eslintrc.js         # ESLint配置（代码规范）
├── .prettierrc.js       # Prettier配置（代码格式化）
├── tsconfig.json        # TypeScript配置
├── vite.config.ts       # Vite配置（插件、代理、构建优化等）
├── package.json         # 依赖配置与脚本命令
└── README.md            # 项目说明文档（本文档）
```

# 页面路由
- `/` - 重定向到 `/articles`
- `/home` - 首页
- `/articles` - 文章列表页
- `/articles/:id` - 文章详情页
- `/contact` - 联系页

# 开发规范
- 代码风格：遵循 ESLint + Prettier 配置，提交前自动格式化
- TypeScript：强制使用类型定义，避免 any 类型（特殊情况需注释说明）
- 组件开发：通用组件需编写文档注释，支持 Props 类型校验与默认值
- 国际化：所有用户可见文本必须通过 `$t()` 函数，禁止硬编码
- 组件拆分：保持组件职责单一，复杂页面拆分为多个子组件

# 扩展功能建议
- [ ] 文章搜索功能
- [ ] RSS 订阅
- [ ] 文章标签云
- [ ] 文章归档（按年月）
- [ ] 评论回复功能
- [ ] 文章点赞/收藏
- [x] 代码语法高亮（highlight.js）
- [x] 代码块一键复制功能
- [x] Mermaid 图表支持（流程图、时序图、类图等）
- [ ] 文章分享功能
- [ ] 阅读进度显示
- [ ] 文章阅读时长统计
