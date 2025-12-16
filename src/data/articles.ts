export type Article = {
  id: number
  title: string
  description: string
  content: string
  categoryKey: string
  tag: string
  badge?: string
  date: string
  platform: string
  cover: string
}

const STORAGE_KEY = 'blog-articles'

// 默认文章数据
const defaultArticles: Article[] = [
  {
    id: 1,
    title: 'Md2Design：更简单、更美观的图文卡片生成器',
    description: '轻量卡片设计工具，简化信息展示流程，适合日常分享与快速传递。',
    content: `# 背景
从 Markdown 到视觉卡片的一键转换，主打「无需设计基础」。

## 功能亮点
- 多模板与主题色，一键成图
- 自动排版与网格，适合社媒/总结/海报
- 导出高清图，支持多尺寸

## Roadmap
- 自定义模板与品牌色
- AI 文案润色 / 翻译
- 一键发布到社交平台`,
    categoryKey: 'dit',
    tag: 'DiT',
    badge: 'Beta',
    date: '2025-12-12',
    platform: 'Wechat',
    cover:
      'linear-gradient(135deg, #0a0f26 0%, #0c1a4d 35%, #032c5f 65%, #0c1a4d 100%)'
  },
  {
    id: 2,
    title: '个人网站已上线：感谢Gemini3，这是第一版个人网站',
    description: '第一版上线，用以记录思考与灵感，后续将持续完善功能与体验。',
    content: `# 上线笔记
第一版聚焦信息架构与阅读体验：导航、文章列表与深浅色。

## 当前能力
- 文章列表与详情
- 多语言切换
- 深浅色切换

## 下一步
- 作品集模块
- 评论与订阅
- 开发日志与设计迭代记录`,
    categoryKey: 'dit',
    tag: 'DiT',
    badge: '1.0',
    date: '2025-12-11',
    platform: 'Wechat',
    cover: 'linear-gradient(135deg, #0d121f 0%, #132642 50%, #243c5a 100%)'
  },
  {
    id: 3,
    title: '暗叽be叽：杂记与灵感收集',
    description: '关于创作与生活的片段记录，聚合了近期的灵感、思考与待办。',
    content: `# 写在前面
这是一份松散的创作备忘录，记录碎片化灵感与旅行思考。

## 最近在写
- 灵感收集：零散想法与素材
- 旅行路书：路线、拍照点与踩坑
- 创意试验：想尝试的小项目

## 计划
- 按主题拆分系列
- 增加配图与地图
- 更细的标签方便检索`,
    categoryKey: 'note',
    tag: '杂记',
    date: '2025-11-28',
    platform: 'Wechat',
    cover: 'linear-gradient(135deg, #101820 0%, #1f1f2f 50%, #2c2c3b 100%)'
  }
]

// 从 localStorage 加载文章数据
const loadArticlesFromStorage = (): Article[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      // 验证数据格式
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch (error) {
    console.error('Failed to load articles from storage:', error)
  }
  // 如果没有存储的数据，使用默认数据并保存
  saveArticlesToStorage(defaultArticles)
  return defaultArticles
}

// 保存文章数据到 localStorage
const saveArticlesToStorage = (articles: Article[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(articles))
  } catch (error) {
    console.error('Failed to save articles to storage:', error)
  }
}

// 初始化文章数组
export const articles: Article[] = loadArticlesFromStorage()

export const getArticleById = (id: number) => articles.find((item) => item.id === id)

export const createArticle = (articleData: Omit<Article, 'id'>): Article => {
  const newId = articles.length > 0 ? Math.max(...articles.map((a) => a.id)) + 1 : 1
  const newArticle: Article = {
    id: newId,
    ...articleData
  }
  articles.push(newArticle)
  // 保存到 localStorage
  saveArticlesToStorage(articles)
  return newArticle
}

export const updateArticle = (id: number, articleData: Partial<Article>): Article => {
  const index = articles.findIndex((item) => item.id === id)
  if (index === -1) {
    throw new Error(`Article with id ${id} not found`)
  }
  const updatedArticle: Article = {
    ...articles[index],
    ...articleData,
    id // 确保 ID 不被覆盖
  } as Article
  articles[index] = updatedArticle
  // 保存到 localStorage
  saveArticlesToStorage(articles)
  return updatedArticle
}

export const deleteArticle = (id: number): boolean => {
  const index = articles.findIndex((item) => item.id === id)
  if (index === -1) {
    return false
  }
  articles.splice(index, 1)
  // 保存到 localStorage
  saveArticlesToStorage(articles)
  return true
}

// 重新加载文章数据（用于从其他地方更新后同步）
export const reloadArticles = () => {
  const loaded = loadArticlesFromStorage()
  articles.length = 0
  articles.push(...loaded)
}

