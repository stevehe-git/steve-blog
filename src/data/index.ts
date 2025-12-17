/**
 * 文章数据统一导出
 * 合并数据文章和内容文章，提供统一的访问接口
 */

import type { Article } from './types'
import { dataArticles, createArticle, updateArticle, deleteArticle, reloadDataArticles, setDataArticlesChangedCallback } from './dataArticles'
import { contentArticles, initializeContentArticles } from './contentArticles'

// 导出类型
export type { Article }

// 导出数据文章相关函数
export { createArticle, updateArticle, deleteArticle, reloadDataArticles }

// 导出内容文章初始化函数
export { initializeContentArticles }

/**
 * 合并后的文章列表
 * 内容文章（Markdown）在前，数据文章（localStorage/默认）在后
 * 按日期排序（最新的在前）
 */
export const articles: Article[] = []

/**
 * 更新合并后的文章列表
 * 将内容文章和数据文章合并，并按日期排序
 */
function updateMergedArticles() {
  articles.length = 0
  
  // 合并所有文章（内容文章在前）
  articles.push(...contentArticles, ...dataArticles)
  
  // 按日期排序（最新的在前）
  articles.sort((a, b) => {
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    return dateB - dateA
  })
}

/**
 * 初始化文章系统
 * 加载内容文章并更新合并列表
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
export const getArticleById = (id: number): Article | undefined => {
  return articles.find((item) => item.id === id)
}

/**
 * 重新加载所有文章
 * 重新加载数据文章和内容文章，并更新合并列表
 */
export async function reloadArticles(): Promise<void> {
  reloadDataArticles()
  await initializeContentArticles()
  updateMergedArticles()
}

// 初始化合并列表
updateMergedArticles()

// 设置数据文章变化回调，自动更新合并列表
setDataArticlesChangedCallback(updateMergedArticles)

