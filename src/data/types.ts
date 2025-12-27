/**
 * 文章类型定义
 */

export type Article = {
  id: string // 文章唯一标识（使用 UUID 生成）
  title: string // 文章标题
  description: string // 文章描述
  content: string // Markdown 格式的文章内容
  categoryKey: string // 文章分类键（c/c++, linux, ROS, 中间件, apollo）
  tag: string // 文章标签
  badge?: string // 可选徽章（如 "Beta", "New" 等）
  date: string // 创建日期（YYYY-MM-DD 格式）
  updatedDate?: string // 更新日期（YYYY-MM-DD 格式，可选）
  platform: string // 发布平台
  cover: string // 封面背景（CSS 渐变或图片 URL）
}

