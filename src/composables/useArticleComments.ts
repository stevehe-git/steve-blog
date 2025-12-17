/**
 * 文章评论 Composable
 * 提供评论的增删改查功能，使用 localStorage 进行数据持久化
 */

import { ref } from 'vue'

/**
 * 评论项类型
 */
export type CommentItem = {
  id: number // 评论唯一标识（时间戳）
  author: string // 评论作者（默认为"匿名"）
  content: string // 评论内容
  createdAt: string // 创建时间（ISO 格式）
}

/**
 * 文章评论管理 Composable
 * @param storageKey localStorage 存储键名，默认为 'article-comments'
 * @returns 评论映射、加载评论、获取评论、添加评论等函数
 */
export const useArticleComments = (storageKey = 'article-comments') => {
  // 评论映射：文章 ID -> 评论列表
  const commentsMap = ref<Record<string, CommentItem[]>>({})

  /**
   * 从 localStorage 加载评论数据
   */
  const loadComments = () => {
    try {
      const saved = localStorage.getItem(storageKey)
      commentsMap.value = saved ? JSON.parse(saved) : {}
    } catch (_e) {
      commentsMap.value = {}
    }
  }

  /**
   * 持久化评论数据到 localStorage
   */
  const persistComments = () => {
    localStorage.setItem(storageKey, JSON.stringify(commentsMap.value))
  }

  /**
   * 获取指定文章的评论列表
   * @param articleId 文章 ID
   * @returns 评论列表，如果文章没有评论则返回空数组
   */
  const getComments = (articleId: string) => commentsMap.value[articleId] ?? []

  /**
   * 为指定文章添加评论
   * @param articleId 文章 ID
   * @param payload 评论数据（作者可选，内容必填）
   * @returns 新创建的评论对象
   */
  // 完整函数
  const addComment = (articleId: string, payload: { author?: string; content: string }) => {
    // 1. 内容校验：去除首尾空格，空内容直接返回
    const content = payload.content.trim()
    if (!content) return

    // 2. 作者处理：去除空格，无作者则设为「匿名」
    const author = payload.author?.trim() || '匿名'

    // 3. 获取该文章现有评论列表：无则初始化空数组
    const list = commentsMap.value[articleId] ?? []

    // 4. 构造新评论对象（符合 CommentItem 类型）
    const next: CommentItem = {
      id: Date.now(), // 用时间戳作为唯一ID
      author,         // 处理后的作者名
      content,        // 处理后的评论内容
      createdAt: new Date().toISOString() // 评论创建时间（ISO格式）
    }

    // 5. 响应式更新评论映射表（核心）
    commentsMap.value = {
      ...commentsMap.value, // 解构原有所有键值对（保留其他文章的评论）
      [articleId]: [...list, next] // 追加新评论到当前文章的评论列表
    }

    // 6. 持久化评论数据（如存localStorage/调用接口）
    persistComments()

    // 7. 返回新增的评论对象
    return next
  }

  return {
    commentsMap,
    loadComments,
    getComments,
    addComment
  }
}

