import { ref } from 'vue'

export type CommentItem = {
  id: number
  author: string
  content: string
  createdAt: string
}

export const useArticleComments = (storageKey = 'article-comments') => {
  const commentsMap = ref<Record<number, CommentItem[]>>({})

  const loadComments = () => {
    try {
      const saved = localStorage.getItem(storageKey)
      commentsMap.value = saved ? JSON.parse(saved) : {}
    } catch (_e) {
      commentsMap.value = {}
    }
  }

  const persistComments = () => {
    localStorage.setItem(storageKey, JSON.stringify(commentsMap.value))
  }

  const getComments = (articleId: number) => commentsMap.value[articleId] ?? []

  const addComment = (articleId: number, payload: { author?: string; content: string }) => {
    const content = payload.content.trim()
    if (!content) return
    const author = payload.author?.trim() || '匿名'
    const list = commentsMap.value[articleId] ?? []
    const next: CommentItem = {
      id: Date.now(),
      author,
      content,
      createdAt: new Date().toISOString()
    }

    commentsMap.value = {
      ...commentsMap.value,
      [articleId]: [...list, next]
    }
    persistComments()
    return next
  }

  return {
    commentsMap,
    loadComments,
    getComments,
    addComment
  }
}

