/**
 * Markdown 文件加载器
 * 从 content 目录加载所有 .md 文件并转换为文章格式
 */

import { nanoid } from 'nanoid'
import type { Article } from '@/data/types'
import {
  parseFrontmatter,
  extractInfoFromFilename,
  extractDescription
} from './frontmatter'

/**
 * 从 Markdown 文件内容转换为 Article
 * @param filename 文件名
 * @param content 文件内容
 * @returns Article 对象
 */
export function markdownToArticle(
  filename: string,
  content: string
): Article {
  const { frontmatter, body } = parseFrontmatter(content)
  const fileInfo = extractInfoFromFilename(filename)

  // 合并 frontmatter 和文件名信息
  const title = frontmatter.title || fileInfo.title || filename.replace(/\.md$/, '')
  // 确保 date 始终是字符串
  const getDate = (): string => {
    if (frontmatter.date && typeof frontmatter.date === 'string') {
      return frontmatter.date
    }
    if (fileInfo.date && typeof fileInfo.date === 'string') {
      return fileInfo.date
    }
    return new Date().toISOString().split('T')[0] as string
  }
  const date: string = getDate()
  const description =
    frontmatter.description || extractDescription(content) || ''
  const categoryKey = frontmatter.categoryKey || 'dit'
  const tag = frontmatter.tag || ''
  const badge = frontmatter.badge
  const platform = frontmatter.platform || 'Wechat'
  const cover =
    frontmatter.cover ||
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'

  return {
    id: nanoid(),
    title,
    description,
    content: body.trim(),
    categoryKey,
    tag,
    badge,
    date,
    platform,
    cover
  }
}

/**
 * 加载所有 Markdown 文件
 * 使用 import.meta.glob 从 content 目录读取
 */
export async function loadMarkdownArticles(): Promise<Article[]> {
  const articles: Article[] = []

  try {
    // 使用 import.meta.glob 从 content 目录读取
    const markdownModules = import.meta.glob('/content/*.md', {
      query: '?raw',
      import: 'default',
      eager: false
    })

    if (Object.keys(markdownModules).length > 0) {
      const loadPromises = Object.entries(markdownModules).map(
        async ([path, moduleLoader]) => {
          try {
            const content = await moduleLoader()
            const filename = path.split('/').pop() || 'unknown.md'
            const article = markdownToArticle(
              filename,
              content as string
            )
            return article
          } catch (error) {
            console.warn(`Failed to load markdown file: ${path}`, error)
            return null
          }
        }
      )

      const loadedArticles = await Promise.all(loadPromises)
      articles.push(
        ...loadedArticles.filter((a): a is Article => a !== null)
      )
    }

    // 按日期排序（最新的在前）
    articles.sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return dateB - dateA
    })
  } catch (error) {
    console.error('Failed to load markdown articles:', error)
  }

  return articles
}

