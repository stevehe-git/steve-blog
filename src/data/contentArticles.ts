/**
 * 内容文章管理模块
 * 处理从 content 目录加载的 Markdown 文件
 */

import type { Article } from './types'
import { loadMarkdownArticles } from '@/utils/markdownLoader'

// 内容文章数组（从 Markdown 文件加载）
export const contentArticles: Article[] = []

// 是否已加载 Markdown 文件
let markdownArticlesLoaded = false

/**
 * 初始化并加载 Markdown 文件
 * 将 content 目录下的 .md 文件加载到内容文章列表中
 */
export async function initializeContentArticles(): Promise<void> {
  if (markdownArticlesLoaded) {
    return
  }

  try {
    const markdownArticles = await loadMarkdownArticles()

    if (markdownArticles.length > 0) {
      // 清空现有内容并加载新文章
      contentArticles.length = 0
      contentArticles.push(...markdownArticles)

      // 按日期排序（最新的在前）
      contentArticles.sort((a, b) => {
        const dateA = new Date(a.date).getTime()
        const dateB = new Date(b.date).getTime()
        return dateB - dateA
      })

      console.log(`Loaded ${markdownArticles.length} markdown articles from content`)
    }

    markdownArticlesLoaded = true
  } catch (error) {
    console.error('Failed to initialize content articles:', error)
  }
}

/**
 * 重新加载内容文章
 * 重新从 Markdown 文件加载
 */
export async function reloadContentArticles(): Promise<void> {
  markdownArticlesLoaded = false
  await initializeContentArticles()
}

