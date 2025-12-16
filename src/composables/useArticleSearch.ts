import { computed, ref } from 'vue'
import type { Article } from '@/data/articles'

export const useArticleSearch = (articles: Article[]) => {
  const searchQuery = ref('')

  // 高亮文本函数
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text
    const regex = new RegExp(`(${query})`, 'gi')
    return text.replace(regex, '<mark>$1</mark>')
  }

  // 搜索逻辑
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

  // 带高亮的搜索结果
  const highlightedResults = computed(() => {
    const query = searchQuery.value.trim()
    if (!query) return []

    return searchResults.value.map((article) => ({
      ...article,
      highlightedTitle: highlightText(article.title, query),
      highlightedDescription: highlightText(article.description, query)
    }))
  })

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

