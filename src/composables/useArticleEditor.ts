/**
 * 文章编辑 Composable
 * 提供文章创建、编辑、表单验证和提交功能
 */

import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import type { Article } from '@/data/types'
import { createArticle, updateArticle } from '@/data'

/**
 * 验证错误信息类型
 */
export type ValidationError = {
  field: string // 字段名称（用于国际化）
  message: string // 错误消息
}

/**
 * 文章编辑器 Composable
 * @returns 表单数据、提交状态和处理函数
 */
export const useArticleEditor = () => {
  const router = useRouter()
  // 提交状态：是否正在提交
  const isSubmitting = ref(false)

  // 表单数据（响应式对象）
  const form = reactive<Partial<Article>>({
    title: '',
    description: '',
    content: '',
    categoryKey: 'dit',
    tag: '',
    badge: '',
    date: new Date().toISOString().split('T')[0],
    platform: 'Wechat',
    cover: 'linear-gradient(135deg, #0a0f26 0%, #0c1a4d 35%, #032c5f 65%, #0c1a4d 100%)'
  })

  /**
   * 重置表单为初始状态
   */
  const resetForm = () => {
    form.title = ''
    form.description = ''
    form.content = ''
    form.categoryKey = 'dit'
    form.tag = ''
    form.badge = ''
    form.date = new Date().toISOString().split('T')[0]
    form.platform = 'Wechat'
    form.cover = 'linear-gradient(135deg, #0a0f26 0%, #0c1a4d 35%, #032c5f 65%, #0c1a4d 100%)'
  }

  /**
   * 加载文章数据到表单
   * @param article 要加载的文章对象
   */
  const loadArticle = (article: Article) => {
    form.id = article.id
    form.title = article.title
    form.description = article.description
    form.content = article.content
    form.categoryKey = article.categoryKey
    form.tag = article.tag
    form.badge = article.badge
    form.date = article.date
    form.platform = article.platform
    form.cover = article.cover
  }

  /**
   * 验证表单数据
   * @returns 验证错误数组，如果验证通过则返回空数组
   */
  const validateForm = (): ValidationError[] => {
    const errors: ValidationError[] = []
    
    if (!form.title?.trim()) {
      errors.push({ field: 'title', message: 'title' })
    }
    if (!form.description?.trim()) {
      errors.push({ field: 'description', message: 'description' })
    }
    if (!form.content?.trim()) {
      errors.push({ field: 'content', message: 'content' })
    }
    if (!form.categoryKey) {
      errors.push({ field: 'category', message: 'category' })
    }
    if (!form.tag?.trim()) {
      errors.push({ field: 'tag', message: 'tag' })
    }
    if (!form.date) {
      errors.push({ field: 'date', message: 'date' })
    }
    if (!form.platform?.trim()) {
      errors.push({ field: 'platform', message: 'platform' })
    }
    if (!form.cover?.trim()) {
      errors.push({ field: 'cover', message: 'cover' })
    }
    
    return errors
  }

  /**
   * 提交表单（创建或更新文章）
   * @returns 保存的文章对象，如果验证失败则返回 null
   */
  const handleSubmit = async (): Promise<Article | null> => {
    const errors = validateForm()
    if (errors.length > 0) {
      return null
    }

    isSubmitting.value = true
    try {
      let savedArticle: Article
      if (form.id) {
        // 编辑模式
        savedArticle = updateArticle(form.id, form as Article)
      } else {
        // 新建模式
        savedArticle = createArticle(form as Omit<Article, 'id'>)
      }
      return savedArticle
    } finally {
      isSubmitting.value = false
    }
  }

  /**
   * 提交表单并重定向到文章详情页
   */
  const handleSubmitAndRedirect = async () => {
    const article = await handleSubmit()
    if (article) {
      router.push({ name: 'articleDetail', params: { id: article.id } })
    }
  }

  return {
    form,
    isSubmitting,
    resetForm,
    loadArticle,
    validateForm,
    handleSubmit,
    handleSubmitAndRedirect
  }
}

