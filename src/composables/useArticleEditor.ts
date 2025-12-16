import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import type { Article } from '@/data/articles'
import { createArticle, updateArticle } from '@/data/articles'

export const useArticleEditor = () => {
  const router = useRouter()
  const isSubmitting = ref(false)

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

  const validateForm = (): boolean => {
    if (!form.title?.trim()) return false
    if (!form.description?.trim()) return false
    if (!form.content?.trim()) return false
    if (!form.categoryKey) return false
    if (!form.tag?.trim()) return false
    if (!form.date) return false
    if (!form.platform?.trim()) return false
    if (!form.cover?.trim()) return false
    return true
  }

  const handleSubmit = async (): Promise<Article | null> => {
    if (!validateForm()) {
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

