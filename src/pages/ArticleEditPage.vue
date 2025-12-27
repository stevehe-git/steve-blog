<script setup lang="ts">
/**
 * 文章编辑页
 * 功能：创建新文章或编辑已有文章，支持表单验证、封面预设等
 */

import { onMounted, computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { getArticleById } from '@/data'
import { useArticleEditor, type ValidationError } from '@/composables/useArticleEditor'
import { useCategories } from '@/composables/useCategories'

// 封面图片预览
const coverImagePreview = ref<string | null>(null)
const coverFileInput = ref<HTMLInputElement>()

/**
 * 处理封面图片选择
 */
const handleCoverImageSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      alert(t('article.coverImageError'))
      return
    }
    
    // 验证文件大小（限制为 5MB）
    if (file.size > 5 * 1024 * 1024) {
      alert(t('article.coverImageSizeError'))
      return
    }
    
    // 读取文件并转换为 base64
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      if (result) {
        coverImagePreview.value = result
        form.cover = result
      }
    }
    reader.onerror = () => {
      alert(t('article.coverImageError'))
    }
    reader.readAsDataURL(file)
  }
}

/**
 * 清除封面图片
 */
const clearCoverImage = () => {
  coverImagePreview.value = null
  if (coverFileInput.value) {
    coverFileInput.value.value = ''
  }
  form.cover = ''
}

/**
 * 获取封面预览 URL
 */
const coverPreviewUrl = computed(() => {
  // 优先使用预览值
  if (coverImagePreview.value) {
    return coverImagePreview.value
  }
  // 如果表单中的封面是图片格式，也显示预览
  if (form.cover) {
    const cover = form.cover.trim()
    if (cover.startsWith('http://') || 
        cover.startsWith('https://') || 
        cover.startsWith('data:image/')) {
      return cover
    }
  }
  return null
})

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

// 是否为编辑模式（根据路由参数判断）
const isEditMode = computed(() => !!route.params.id)
// 文章 ID（编辑模式下使用）
const articleId = computed(() => {
  const id = route.params.id
  return id ? (id as string) : null
})

// 文章编辑器（表单管理、提交等）
const { 
  form, 
  isSubmitting, 
  isSavingFile,
  loadArticle, 
  validateForm, 
  resetForm,
  handlePublish,
  handleUpdate
} = useArticleEditor()

// 验证错误信息
const validationErrors = ref<ValidationError[]>([])
// 是否显示错误提示
const showErrors = ref(false)

// 分类选项列表（从国际化配置动态获取，不包含"全部"选项）
const { categories } = useCategories(false)

// 封面预设（CSS 渐变背景）
const coverPresets = [
  'linear-gradient(135deg, #0a0f26 0%, #0c1a4d 35%, #032c5f 65%, #0c1a4d 100%)',
  'linear-gradient(135deg, #0d121f 0%, #132642 50%, #243c5a 100%)',
  'linear-gradient(135deg, #101820 0%, #1f1f2f 50%, #2c2c3b 100%)',
  'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  'linear-gradient(135deg, #2d1b69 0%, #11998e 100%)',
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
]

// 组件挂载时：编辑模式加载文章数据，新建模式重置表单
onMounted(() => {
  if (isEditMode.value && articleId.value) {
    const article = getArticleById(articleId.value)
    if (article) {
      loadArticle(article)
      // 如果封面是图片，设置预览
      if (article.cover && (article.cover.startsWith('http://') || article.cover.startsWith('https://') || article.cover.startsWith('data:image/'))) {
        coverImagePreview.value = article.cover
      }
    } else {
      // 文章不存在，跳转到列表页
      router.push({ name: 'articles' })
    }
  } else {
    // 新建模式，重置表单
    resetForm()
  }
})

// 监听表单字段变化，自动清除对应字段的错误提示
watch(
  () => [form.title, form.description, form.content, form.categoryKey, form.tag, form.date, form.platform, form.cover],
  () => {
    if (showErrors.value && validationErrors.value.length > 0) {
      // 重新验证，只保留仍然存在的错误
      const errors = validateForm()
      validationErrors.value = errors
      // 如果所有错误都已修复，隐藏错误提示
      if (errors.length === 0) {
        showErrors.value = false
      }
    }
  }
)

// 监听封面变化，更新预览
watch(
  () => form.cover,
  (newCover) => {
    if (newCover && (newCover.startsWith('http://') || newCover.startsWith('https://') || newCover.startsWith('data:image/'))) {
      // 如果是图片格式，更新预览
      if (!coverImagePreview.value || coverImagePreview.value !== newCover) {
        coverImagePreview.value = newCover
      }
    } else if (!newCover) {
      // 如果封面被清空，清除预览
      coverImagePreview.value = null
    }
  }
)

/**
 * 取消编辑，返回上一页或文章详情页
 */
const handleCancel = () => {
  if (isEditMode.value && articleId.value) {
    router.push({ name: 'articleDetail', params: { id: articleId.value } })
  } else {
    router.push({ name: 'articles' })
  }
}

/**
 * 处理表单提交（带验证提示）
 */
const handleSubmit = async () => {
  // 验证表单
  const errors = validateForm()
  
  if (errors.length > 0) {
    // 有验证错误，显示错误提示
    validationErrors.value = errors
    showErrors.value = true
    
    // 滚动到第一个错误字段
    setTimeout(() => {
      const firstErrorField = document.querySelector('.form-error')
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 100)
    
    return
  }
  
  // 验证通过，清除错误提示
  validationErrors.value = []
  showErrors.value = false
  
  // 根据模式执行不同的操作
  if (isEditMode.value && articleId.value) {
    // 编辑模式：更新 Markdown 文件
    const success = await handleUpdate()
    if (success) {
      // 更新成功，重新加载文章列表以确保数据同步
      const { reloadArticles } = await import('@/data')
      await reloadArticles()
      // 跳转到文章列表页
      router.push({ name: 'articles' })
    }
  } else {
    // 新建模式：发布 Markdown 文件
    const success = await handlePublish()
    if (success) {
      // 发布成功，跳转到文章列表页
      router.push({ name: 'articles' })
    }
  }
}
</script>

<template>
  <main class="layout edit-layout">
    <section class="hero">
      <h1>{{ isEditMode ? t('article.editTitle') : t('article.createTitle') }}</h1>
      <p>{{ isEditMode ? t('article.editDesc') : t('article.createDesc') }}</p>
    </section>

    <section class="edit-content">
      <!-- 验证错误提示 -->
      <div v-if="showErrors && validationErrors.length > 0" class="validation-errors">
        <div class="error-header">
          <span class="error-icon">⚠️</span>
          <span class="error-title">{{ t('article.validationError') }}</span>
        </div>
        <ul class="error-list">
          <li v-for="(error, index) in validationErrors" :key="index" class="error-item">
            {{ t(`article.${error.message}Required`) }}
          </li>
        </ul>
      </div>

      <form class="article-form" @submit.prevent="handleSubmit">
        <div class="form-section">
          <label class="form-label" :class="{ 'has-error': showErrors && validationErrors.some((e: ValidationError) => e.field === 'title') }">
            {{ t('article.title') }}
            <input 
              v-model="form.title" 
              type="text" 
              :placeholder="t('article.titlePlaceholder')"
              :class="{ 'form-error': showErrors && validationErrors.some((e: ValidationError) => e.field === 'title') }"
            />
          </label>
        </div>

        <div class="form-section">
          <label class="form-label" :class="{ 'has-error': showErrors && validationErrors.some((e: ValidationError) => e.field === 'description') }">
            {{ t('article.description') }}
            <textarea
              v-model="form.description"
              rows="3"
              :placeholder="t('article.descriptionPlaceholder')"
              :class="{ 'form-error': showErrors && validationErrors.some((e: ValidationError) => e.field === 'description') }"
            ></textarea>
          </label>
        </div>

        <div class="form-row">
          <div class="form-section">
            <label class="form-label" :class="{ 'has-error': showErrors && validationErrors.some((e: ValidationError) => e.field === 'category') }">
              {{ t('article.category') }}
              <select 
                v-model="form.categoryKey"
                :class="{ 'form-error': showErrors && validationErrors.some((e: ValidationError) => e.field === 'category') }"
              >
                <option v-for="cat in categories" :key="cat.key" :value="cat.key">
                  {{ cat.label }}
                </option>
              </select>
            </label>
          </div>

          <div class="form-section">
            <label class="form-label" :class="{ 'has-error': showErrors && validationErrors.some((e: ValidationError) => e.field === 'tag') }">
              {{ t('article.tag') }}
              <input 
                v-model="form.tag" 
                type="text" 
                :placeholder="t('article.tagPlaceholder')"
                :class="{ 'form-error': showErrors && validationErrors.some((e: ValidationError) => e.field === 'tag') }"
              />
            </label>
          </div>
        </div>

        <div class="form-row">
          <div class="form-section">
            <label class="form-label" :class="{ 'has-error': showErrors && validationErrors.some((e: ValidationError) => e.field === 'date') }">
              {{ t('article.date') }}
              <input 
                v-model="form.date" 
                type="date"
                :class="{ 'form-error': showErrors && validationErrors.some((e: ValidationError) => e.field === 'date') }"
              />
            </label>
          </div>

          <div class="form-section">
            <label class="form-label" :class="{ 'has-error': showErrors && validationErrors.some((e: ValidationError) => e.field === 'platform') }">
              {{ t('article.platform') }}
              <input 
                v-model="form.platform" 
                type="text" 
                :placeholder="t('article.platformPlaceholder')"
                :class="{ 'form-error': showErrors && validationErrors.some((e: ValidationError) => e.field === 'platform') }"
              />
            </label>
          </div>
        </div>

        <div class="form-row">
          <div class="form-section">
            <label class="form-label">
              {{ t('article.badge') }}
              <input v-model="form.badge" type="text" :placeholder="t('article.badgePlaceholder')" />
            </label>
          </div>

          <div class="form-section">
            <label class="form-label" :class="{ 'has-error': showErrors && validationErrors.some((e: ValidationError) => e.field === 'cover') }">
              {{ t('article.cover') }}
              <div class="cover-input-group">
                <input 
                  v-model="form.cover" 
                  type="text" 
                  :placeholder="t('article.coverPlaceholder')"
                  :class="{ 'form-error': showErrors && validationErrors.some((e: ValidationError) => e.field === 'cover') }"
                />
                <div class="cover-actions">
                  <button
                    type="button"
                    class="cover-upload-btn"
                    @click="coverFileInput?.click()"
                  >
                    {{ t('article.uploadImage') }}
                  </button>
                  <input
                    ref="coverFileInput"
                    type="file"
                    accept="image/*"
                    style="display: none"
                    @change="handleCoverImageSelect"
                  />
                  <button
                    v-if="coverPreviewUrl"
                    type="button"
                    class="cover-clear-btn"
                    @click="clearCoverImage"
                  >
                    {{ t('article.clearImage') }}
                  </button>
                </div>
              </div>
              <!-- 封面预览 -->
              <div v-if="coverPreviewUrl" class="cover-preview">
                <img 
                  :src="coverPreviewUrl" 
                  alt="Cover preview"
                  @error="coverImagePreview = null"
                />
              </div>
            </label>
          </div>
        </div>

        <div class="form-section">
          <label class="form-label">
            {{ t('article.coverPresets') }}
            <div class="cover-presets">
              <button
                v-for="(preset, index) in coverPresets"
                :key="index"
                type="button"
                class="cover-preset"
                :style="{ background: preset }"
                @click="form.cover = preset"
              ></button>
            </div>
          </label>
        </div>

        <div class="form-section">
          <label class="form-label" :class="{ 'has-error': showErrors && validationErrors.some((e: ValidationError) => e.field === 'content') }">
            {{ t('article.content') }}
            <textarea
              v-model="form.content"
              rows="20"
              :placeholder="t('article.contentPlaceholder')"
              class="content-textarea"
              :class="{ 'form-error': showErrors && validationErrors.some((e: ValidationError) => e.field === 'content') }"
            ></textarea>
          </label>
          <p class="form-hint">{{ t('article.contentHint') }}</p>
        </div>

        <div class="form-actions">
          <button type="button" class="cancel-btn" @click="handleCancel">
            {{ t('article.cancel') }}
          </button>
          <button type="submit" class="submit-btn" :disabled="isSubmitting || isSavingFile">
            {{ isSavingFile ? t('article.saving') : isSubmitting ? t('article.saving') : isEditMode ? t('article.update') : t('article.publish') }}
          </button>
        </div>
      </form>
    </section>
  </main>
</template>

<style scoped>
.edit-layout {
  background: var(--bg);
  color: var(--text-primary);
}

.edit-layout .hero {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  box-sizing: border-box;
}

.edit-content {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  box-sizing: border-box;
}

.article-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 18px;
  font-weight: 500;
  color: var(--text-primary);
}

.form-label input,
.form-label textarea,
.form-label select {
  padding: 12px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-primary);
  font-size: 16px;
  font-family: inherit;
  transition: border-color 0.2s ease;
  width: 100%;
  box-sizing: border-box;
}

.form-label input:focus,
.form-label textarea:focus,
.form-label select:focus {
  outline: none;
  border-color: var(--brand);
}

.form-label textarea {
  resize: vertical;
}

/* 验证错误提示样式 */
.validation-errors {
  margin-bottom: 24px;
  padding: 16px;
  border-radius: 10px;
  background: #fff5f5;
  border: 1px solid #feb2b2;
}

.dark .validation-errors {
  background: #4a1a1a;
  border-color: #c53030;
}

.error-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-weight: 600;
  color: #c53030;
}

.dark .error-header {
  color: #ff6b6b;
}

.error-icon {
  font-size: 20px;
}

.error-title {
  font-size: 16px;
}

.error-list {
  margin: 0;
  padding-left: 24px;
  list-style: disc;
}

.error-item {
  margin: 6px 0;
  color: #c53030;
  font-size: 14px;
}

.dark .error-item {
  color: #ff6b6b;
}

/* 表单字段错误样式 */
.form-label.has-error {
  color: #c53030;
}

.dark .form-label.has-error {
  color: #ff6b6b;
}

.form-label input.form-error,
.form-label textarea.form-error,
.form-label select.form-error {
  border-color: #c53030;
  background: #fff5f5;
}

.dark .form-label input.form-error,
.dark .form-label textarea.form-error,
.dark .form-label select.form-error {
  border-color: #c53030;
  background: #4a1a1a;
}

.form-label input.form-error:focus,
.form-label textarea.form-error:focus,
.form-label select.form-error:focus {
  border-color: #c53030;
  outline: 2px solid rgba(197, 48, 48, 0.2);
}

.content-textarea {
  font-family: ui-monospace, 'Courier New', monospace;
  line-height: 1.6;
}

.form-hint {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--text-subtle);
}

.cover-input-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cover-actions {
  display: flex;
  gap: 8px;
}

.cover-upload-btn,
.cover-clear-btn {
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cover-upload-btn:hover {
  background: var(--surface-2);
  border-color: var(--brand);
}

.cover-clear-btn:hover {
  background: #fee2e2;
  border-color: #ef4444;
  color: #dc2626;
}

.dark .cover-clear-btn:hover {
  background: #7f1d1d;
  border-color: #dc2626;
  color: #fca5a5;
}

.cover-preview {
  margin-top: 12px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border);
  background: var(--surface-2);
  max-width: 100%;
}

.cover-preview img {
  width: 100%;
  height: auto;
  max-height: 300px;
  object-fit: cover;
  display: block;
}

.cover-presets {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 8px;
}

.cover-preset {
  width: 100%;
  height: 60px;
  border: 2px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cover-preset:hover {
  border-color: var(--brand);
  transform: scale(1.05);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}

.cancel-btn {
  padding: 10px 20px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-primary);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  border-color: var(--text-muted);
  background: var(--surface-2);
}

.submit-btn {
  padding: 10px 24px;
  border-radius: 10px;
  border: none;
  background: var(--brand);
  color: var(--bg);
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.submit-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 大屏设备 (1400px 及以上) */
@media (min-width: 1400px) {
  .edit-layout .hero {
    max-width: 1400px;
    padding: 0 32px;
  }

  .edit-content {
    max-width: 1400px;
    padding: 0 32px;
  }
}

/* 平板设备 (1024px 及以下) */
@media (max-width: 1024px) {
  .edit-layout .hero {
    max-width: 100%;
    padding: 0 20px;
  }

  .edit-content {
    max-width: 100%;
    padding: 0 20px;
  }
}

/* 平板设备 (768px 及以下) */
@media (max-width: 768px) {
  .edit-layout .hero {
    padding: 0 16px;
  }

  .edit-content {
    padding: 0 16px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .cover-presets {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 小屏手机 (640px 及以下) */
@media (max-width: 640px) {
  .edit-layout .hero {
    padding: 0 12px;
  }

  .edit-content {
    padding: 0 12px;
  }

  .cover-presets {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
}

/* 超小屏手机 (480px 及以下) */
@media (max-width: 480px) {
  .edit-layout .hero {
    padding: 0 10px;
  }

  .edit-content {
    padding: 0 10px;
  }

  .cover-presets {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .cancel-btn,
  .submit-btn {
    width: 100%;
  }
}
</style>

