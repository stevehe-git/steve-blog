# Content 目录

此目录用于存放 Markdown 格式的文章文件。项目会自动读取此目录下的所有 `.md` 文件并转换为文章。

## 📖 使用方法

1. **创建文章文件**：将 Markdown 文件（`.md`）放入此目录
2. **添加 Frontmatter**（可选）：在文件开头添加 YAML frontmatter 来设置文章元数据
3. **自动加载**：文章会在应用启动时自动加载并显示在博客中

## 📝 Frontmatter 格式

在 Markdown 文件开头添加 YAML frontmatter（可选）：

```yaml
---
title: 文章标题
description: 文章描述
categoryKey: dit
tag: DiT
badge: Beta
date: 2025-12-12
platform: Wechat
cover: linear-gradient(135deg, #0a0f26 0%, #0c1a4d 35%, #032c5f 65%, #0c1a4d 100%)
---
```

## 📋 字段说明

| 字段 | 类型 | 必填 | 说明 |
|:-----|:-----|:-----|:-----|
| `title` | string | 否 | 文章标题（如果没有则从文件名提取） |
| `description` | string | 否 | 文章描述（如果没有则从内容第一段提取） |
| `categoryKey` | string | 否 | 分类键（dit, luna, note, art, travel），默认：dit |
| `tag` | string | 否 | 文章标签 |
| `badge` | string | 否 | 可选徽章（如 "Beta", "New" 等） |
| `date` | string | 否 | 发布日期（YYYY-MM-DD 格式，如果没有则从文件名提取或使用当前日期） |
| `platform` | string | 否 | 发布平台，默认：Wechat |
| `cover` | string | 否 | 封面背景（CSS 渐变或图片 URL） |

## 📁 文件名格式

文件名可以包含日期信息，格式：`YYYY-MM-DD-title.md`

**示例：**
- `2025-12-12-my-article.md` - 包含日期和标题
- `my-article.md` - 仅包含标题

## ✨ 功能特性

- ✅ 自动读取所有 `.md` 文件
- ✅ 支持 YAML frontmatter
- ✅ 从文件名自动提取日期和标题
- ✅ 自动提取文章描述（从内容第一段）
- ✅ 支持完整的 Markdown 语法
- ✅ 支持代码高亮、数学公式、图表等
- ✅ 按日期自动排序
- ✅ 与现有文章数据合并

## 📄 示例文件

查看 `example.md` 文件作为完整示例。

## ⚙️ 配置

如果需要禁用 Markdown 文件加载，可以在 `src/data/articles.ts` 中设置：

```typescript
const ENABLE_MARKDOWN_LOADER = false
```

## 🔄 热更新

在开发模式下，修改 Markdown 文件后刷新页面即可看到更新。

## 📦 构建和打包

**重要：** `content` 目录下的 Markdown 文件会在构建时自动打包到构建产物中。

- 使用 Vite 的 `import.meta.glob` 功能，构建时会扫描并打包所有 `.md` 文件
- 文件内容会被包含在构建产物中（如 `dist/assets/markdownArticles-*.js`）
- **无需额外配置**，构建后文件仍然可以正常使用
- 这意味着你不需要在部署时单独上传 `content` 目录

**验证方法：**
```bash
# 构建项目
npm run build

# 检查构建产物中是否包含 Markdown 内容
grep -r "你的文章标题" dist/
```

## 📌 注意事项

1. 文件必须使用 `.md` 扩展名
2. Frontmatter 是可选的，但建议至少包含 `title` 和 `date`
3. 如果没有 frontmatter，系统会尝试从文件名提取信息
4. 文章会按日期自动排序（最新的在前）
5. Markdown 文件中的文章优先级高于默认文章和 localStorage 中的文章
6. **构建时文件会被打包**：修改 Markdown 文件后需要重新构建才能看到更新
