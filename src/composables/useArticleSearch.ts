/**
 * 文章搜索 Composable
 * 提供文章全文搜索、结果高亮等功能
 */

import { computed, ref } from 'vue'
import type { Article } from '@/data/types'

/**
 * 文章搜索 Composable
 * @param articles 文章数组
 * @returns 搜索查询、搜索结果、高亮结果和清除搜索函数
 */
export const useArticleSearch = (articles: Article[]) => {
  // 搜索关键词（响应式）
  const searchQuery = ref('')

  /**
   * 高亮文本中的搜索关键词
   * @param text 原始文本
   * @param query 搜索关键词
   * @returns 高亮后的 HTML 文本
   */
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text
    const regex = new RegExp(`(${query})`, 'gi')
    return text.replace(regex, '<mark>$1</mark>')
  }

  /**
   * 搜索结果（计算属性）
   * 根据搜索关键词过滤文章，搜索范围包括标题、描述、内容、标签和分类
   */
  const searchResults = computed(() => {
    const query = searchQuery.value.trim().toLowerCase()
    if (!query) return articles

    return articles.filter((article) => {
      const searchFields = [
        article.title,
        article.description,
        article.content,
        article.tag,
        article.categoryKey
      ].join(' ').toLowerCase()

      return searchFields.includes(query)
    })
  })

  /**
   * 带高亮的搜索结果（计算属性）
   * 在标题和描述中高亮显示搜索关键词
   */
  const highlightedResults = computed(() => {
    const query = searchQuery.value.trim()
    if (!query) return []

    return searchResults.value.map((article) => ({
      ...article,
      highlightedTitle: highlightText(article.title, query),
      highlightedDescription: highlightText(article.description, query)
    }))
  })

  /**
   * 清除搜索关键词
   */
  const clearSearch = () => {
    searchQuery.value = ''
  }

  return {
    searchQuery,
    searchResults,
    highlightedResults,
    clearSearch
  }
}

