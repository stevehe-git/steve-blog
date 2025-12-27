/**
 * Markdown 导出工具
 * 将 Article 对象转换为 Markdown 格式（包含 frontmatter）
 */

import type { Article } from '@/data/types'

/**
 * 将 Article 转换为 Markdown 格式
 * @param article 文章对象
 * @returns Markdown 格式的字符串
 */
export function articleToMarkdown(article: Article): string {
  // 构建 frontmatter
  const frontmatter: string[] = []
  
  if (article.title) {
    frontmatter.push(`title: ${escapeYamlValue(article.title)}`)
  }
  
  if (article.description) {
    frontmatter.push(`description: ${escapeYamlValue(article.description)}`)
  }
  
  if (article.categoryKey) {
    frontmatter.push(`categoryKey: ${escapeYamlValue(article.categoryKey)}`)
  }
  
  if (article.tag) {
    frontmatter.push(`tag: ${escapeYamlValue(article.tag)}`)
  }
  
  if (article.badge) {
    frontmatter.push(`badge: ${escapeYamlValue(article.badge)}`)
  }
  
  if (article.date) {
    frontmatter.push(`date: ${escapeYamlValue(article.date)}`)
  }
  
  if (article.platform) {
    frontmatter.push(`platform: ${escapeYamlValue(article.platform)}`)
  }
  
  if (article.cover) {
    frontmatter.push(`cover: ${escapeYamlValue(article.cover)}`)
  }
  
  // 保存 articleId 到 frontmatter，用于删除时查找
  if (article.id) {
    frontmatter.push(`articleId: ${escapeYamlValue(article.id)}`)
  }
  
  // 组合 frontmatter 和内容
  const frontmatterBlock = frontmatter.length > 0
    ? `---\n${frontmatter.join('\n')}\n---\n\n`
    : ''
  
  return frontmatterBlock + (article.content || '').trim()
}

/**
 * 转义 YAML 值（如果需要引号）
 * @param value 要转义的值
 * @returns 转义后的值
 */
function escapeYamlValue(value: string): string {
  // 如果包含特殊字符或冒号，需要加引号
  if (
    value.includes(':') ||
    value.includes('#') ||
    value.includes('|') ||
    value.includes('&') ||
    value.includes('*') ||
    value.includes('!') ||
    value.includes('%') ||
    value.includes('@') ||
    value.includes('`') ||
    value.startsWith(' ') ||
    value.endsWith(' ') ||
    value.includes('\n')
  ) {
    // 转义双引号
    const escaped = value.replace(/"/g, '\\"')
    return `"${escaped}"`
  }
  return value
}

/**
 * 生成文件名（基于标题和日期）
 * @param article 文章对象
 * @returns 文件名（不含扩展名）
 */
export function generateFilename(article: Article): string {
  // 使用日期和标题生成文件名
  const date = article.date || new Date().toISOString().split('T')[0]
  const title = article.title || 'untitled'
  
  // 清理标题：移除特殊字符，替换空格为连字符
  const cleanTitle = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
  
  return `${date}-${cleanTitle}`
}

