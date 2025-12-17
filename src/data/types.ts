/**
 * 文章类型定义
 */

export type Article = {
  id: number // 文章唯一标识
  title: string // 文章标题
  description: string // 文章描述
  content: string // Markdown 格式的文章内容
  categoryKey: string // 文章分类键（dit, luna, note, art, travel）
  tag: string // 文章标签
  badge?: string // 可选徽章（如 "Beta", "New" 等）
  date: string // 发布日期（YYYY-MM-DD 格式）
  platform: string // 发布平台
  cover: string // 封面背景（CSS 渐变或图片 URL）
}

