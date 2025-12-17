/**
 * 文章编辑 Composable
 * 提供文章创建、编辑、表单验证和提交功能
 */

import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { nanoid } from 'nanoid'
import type { Article } from '@/data/types'
import { contentArticles } from '@/data/contentArticles'
import { articleToMarkdown, generateFilename } from '@/utils/markdownExporter'

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
// File System Access API 类型定义
interface FileSystemFileHandle {
  createWritable: () => Promise<FileSystemWritableFileStream>
}

interface FileSystemWritableFileStream extends WritableStream {
  write: (data: string | Blob) => Promise<void>
  close: () => Promise<void>
}

// 存储文件句柄的映射（articleId -> fileHandle）
const fileHandleMap = new Map<string, FileSystemFileHandle>()


// 保存文件句柄映射到 localStorage
function saveFileHandle(articleId: string, filename: string) {
  try {
    const stored = localStorage.getItem('article-file-handles') || '{}'
    const parsed = JSON.parse(stored)
    parsed[articleId] = filename
    localStorage.setItem('article-file-handles', JSON.stringify(parsed))
  } catch (error) {
    console.error('Failed to save file handle:', error)
  }
}

// 获取文件句柄对应的文件名
function getFileHandleName(articleId: string): string | null {
  try {
    const stored = localStorage.getItem('article-file-handles')
    if (stored) {
      const parsed = JSON.parse(stored)
      return parsed[articleId] || null
    }
  } catch (error) {
    console.error('Failed to get file handle name:', error)
  }
  return null
}

export const useArticleEditor = () => {
  const router = useRouter()
  // 提交状态：是否正在提交
  const isSubmitting = ref(false)
  // 文件保存状态
  const isSavingFile = ref(false)

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
   * 检查文章是否来自 content 目录（Markdown 文件）
   * @param articleId 文章 ID
   * @returns 是否来自 content 目录
   */
  const isArticleFromContent = (articleId: string): boolean => {
    return contentArticles.some((article: Article) => article.id === articleId)
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
   * @deprecated 此函数已废弃，请使用 handlePublish 或 handleUpdate
   */
  const handleSubmit = async (): Promise<Article | null> => {
    const errors = validateForm()
    if (errors.length > 0) {
      return null
    }

    // 返回表单数据作为文章对象（不保存到内存）
    const article: Article = {
      id: form.id || nanoid(),
      title: form.title || '',
      description: form.description || '',
      content: form.content || '',
      categoryKey: form.categoryKey || 'dit',
      tag: form.tag || '',
      badge: form.badge,
      date: (form.date || new Date().toISOString().split('T')[0]) as string,
      platform: (form.platform || 'Wechat') as string,
      cover: form.cover || ''
    }
    return article
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

  /**
   * 发布文章：选择目录保存 Markdown 文件
   * @returns 是否保存成功
   */
  const handlePublish = async (): Promise<boolean> => {
    const errors = validateForm()
    if (errors.length > 0) {
      return false
    }

    // 检查浏览器是否支持 File System Access API
    if (!('showDirectoryPicker' in window)) {
      alert('您的浏览器不支持文件系统访问 API，请使用 Chrome、Edge 或 Opera 浏览器')
      return false
    }

    isSavingFile.value = true
    try {
      const article: Article = {
        id: form.id || nanoid(),
        title: form.title || '',
        description: form.description || '',
        content: form.content || '',
        categoryKey: form.categoryKey || 'dit',
        tag: form.tag || '',
        badge: form.badge,
        date: (form.date || new Date().toISOString().split('T')[0]) as string,
        platform: (form.platform || 'Wechat') as string,
        cover: form.cover || ''
      }

      // 转换为 Markdown
      const markdown = articleToMarkdown(article)
      const filename = generateFilename(article) + '.md'

      // 选择目录
      const directoryHandle = await (window as any).showDirectoryPicker()
      
      // 创建或获取文件句柄
      const fileHandle = await directoryHandle.getFileHandle(filename, { create: true })
      
      // 写入文件
      const writable = await fileHandle.createWritable()
      await writable.write(markdown)
      await writable.close()

      // 如果文章已存在，保存文件句柄映射
      if (article.id) {
        fileHandleMap.set(article.id, fileHandle)
        saveFileHandle(article.id, filename)
      }

      return true
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Failed to save file:', error)
        alert('保存文件失败：' + (error.message || '未知错误'))
      }
      return false
    } finally {
      isSavingFile.value = false
    }
  }

  /**
   * 更新文章：直接更新对应的 Markdown 文件（无感触发）
   * @returns 是否更新成功
   */
  const handleUpdate = async (): Promise<boolean> => {
    const errors = validateForm()
    if (errors.length > 0) {
      return false
    }

    if (!form.id) {
      return false
    }

    // 检查浏览器是否支持 File System Access API
    if (!('showSaveFilePicker' in window)) {
      alert('您的浏览器不支持文件系统访问 API，请使用 Chrome、Edge 或 Opera 浏览器')
      return false
    }

    isSavingFile.value = true
    try {
      const article: Article = {
        id: form.id,
        title: form.title || '',
        description: form.description || '',
        content: form.content || '',
        categoryKey: form.categoryKey || 'dit',
        tag: form.tag || '',
        badge: form.badge,
        date: (form.date || new Date().toISOString().split('T')[0]) as string,
        platform: (form.platform || 'Wechat') as string,
        cover: form.cover || ''
      }

      // 转换为 Markdown
      const markdown = articleToMarkdown(article)
      const filename = generateFilename(article) + '.md'

      // 尝试使用已保存的文件句柄（无感触发）
      let fileHandle: FileSystemFileHandle | undefined = fileHandleMap.get(form.id)

      // 如果没有文件句柄，提示用户选择要更新的文件
      if (!fileHandle) {
        const savedFilename = getFileHandleName(form.id)
        try {
          // 使用 showOpenFilePicker 让用户选择要更新的文件
          const fileHandles = await (window as any).showOpenFilePicker({
            types: [{
              description: 'Markdown files',
              accept: { 'text/markdown': ['.md'] }
            }],
            multiple: false
          })
          fileHandle = fileHandles[0] as FileSystemFileHandle
          fileHandleMap.set(form.id, fileHandle)
          // 保存文件名映射
          if (savedFilename) {
            saveFileHandle(form.id, savedFilename)
          } else {
            saveFileHandle(form.id, filename)
          }
        } catch (error: any) {
          if (error.name !== 'AbortError') {
            throw error
          }
          return false
        }
      }

      // 写入文件
      if (fileHandle) {
        const writable = await fileHandle.createWritable()
        await writable.write(markdown)
        await writable.close()
      } else {
        throw new Error('无法获取文件句柄')
      }

      // 文件已更新，无需更新内存中的数据

      return true
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Failed to update file:', error)
        alert('更新文件失败：' + (error.message || '未知错误'))
      }
      return false
    } finally {
      isSavingFile.value = false
    }
  }

  return {
    form,
    isSubmitting,
    isSavingFile,
    resetForm,
    loadArticle,
    validateForm,
    handleSubmit,
    handleSubmitAndRedirect,
    handlePublish,
    handleUpdate,
    isArticleFromContent
  }
}

