/**
 * 文章数据统一导出
 * 提供统一的访问接口
 */

import type { Article } from './types'
import { contentArticles, initializeContentArticles } from './contentArticles'

// 导出类型
export type { Article }

// 导出内容文章初始化函数
export { initializeContentArticles }

/**
 * 文章列表
 * 按日期排序（最新的在前）
 */
export const articles: Article[] = []

/**
 * 更新文章列表
 * 加载内容文章并按日期排序
 */
function updateMergedArticles() {
  articles.length = 0
  
  // 添加所有内容文章
  articles.push(...contentArticles)
  
  // 按日期排序（最新的在前）
  articles.sort((a, b) => {
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    return dateB - dateA
  })
}

/**
 * 初始化文章系统
 * 加载内容文章并更新列表
 */
export async function initializeArticles(): Promise<void> {
  await initializeContentArticles()
  updateMergedArticles()
}

/**
 * 根据 ID 获取文章
 * @param id 文章 ID
 * @returns 文章对象，如果不存在则返回 undefined
 */
export const getArticleById = (id: string): Article | undefined => {
  return articles.find((item) => item.id === id)
}

/**
 * 重新加载所有文章
 * 重新加载内容文章，并更新列表
 */
export async function reloadArticles(): Promise<void> {
  await initializeContentArticles()
  updateMergedArticles()
}

// 初始化列表
updateMergedArticles()

