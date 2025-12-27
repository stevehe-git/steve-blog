<script setup lang="ts">
/**
 * 文章详情页
 * 功能：文章内容展示、Markdown 渲染、目录导航、评论、上一篇/下一篇导航
 */

import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/store/modules/app'
import { articles, getArticleById } from '@/data'
import { useArticleMarkdown } from '@/composables/useArticleMarkdown'
import { useArticleComments } from '@/composables/useArticleComments'
import ArticleHeader from '@/components/article/ArticleHeader.vue'
import ArticleContent from '@/components/article/ArticleContent.vue'
import ArticleTOC from '@/components/article/ArticleTOC.vue'
import CommentSection from '@/components/article/CommentSection.vue'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const appStore = useAppStore()

// 评论管理
const { loadComments, getComments, addComment } = useArticleComments()

/**
 * 当前文章（根据路由参数获取）
 */
const article = computed(() => {
  const id = route.params.id as string
  return id ? getArticleById(id) ?? null : null
})

// 文章内容（Markdown 格式）
const content = computed(() => article.value?.content ?? '')
// Markdown 渲染结果（HTML + 目录）
const rendered = useArticleMarkdown(content)

/**
 * 当前文章在列表中的索引
 */
const currentIndex = computed(() => {
  if (!article.value) return -1
  return articles.findIndex((item) => item.id === article.value?.id)
})

/**
 * 上一篇文章
 */
const prevArticle = computed(() =>
  currentIndex.value > 0 ? articles[currentIndex.value - 1] : null
)
/**
 * 下一篇文章
 */
const nextArticle = computed(() =>
  currentIndex.value >= 0 && currentIndex.value < articles.length - 1
    ? articles[currentIndex.value + 1]
    : null
)

/**
 * 当前文章的评论列表
 */
const activeComments = computed(() => {
  const id = article.value?.id
  if (!id) return []
  return getComments(id)
})

/**
 * 返回上一页
 */
const goBack = () => {
  router.back()
}

/**
 * 跳转到上一篇文章
 */
const goPrev = () => {
  if (prevArticle.value) {
    router.push({ name: 'articleDetail', params: { id: prevArticle.value.id } })
  }
}

/**
 * 跳转到下一篇文章
 */
const goNext = () => {
  if (nextArticle.value) {
    router.push({ name: 'articleDetail', params: { id: nextArticle.value.id } })
  }
}

/**
 * 跳转到编辑页面
 */
const goEdit = () => {
  if (article.value) {
    router.push({ name: 'articleEdit', params: { id: article.value.id } })
  }
}

/**
 * 处理评论提交
 * @param form 评论表单数据
 */
const handleCommentSubmit = (form: { author: string; content: string }) => {
  if (!article.value) return
  addComment(article.value.id, form)
}

/**
 * 退出阅读模式
 */
const exitReadingMode = () => {
  appStore.toggleReadingMode()
}

// 组件挂载时加载评论数据
onMounted(() => {
  loadComments()
})
</script>

<template>
  <main class="layout detail-layout">
    <!-- 阅读模式退出按钮 -->
    <button
      v-if="appStore.readingMode"
      class="exit-reading-mode-btn"
      type="button"
      @click="exitReadingMode"
      :aria-label="t('article.exitReadingMode')"
    >
      <span class="exit-icon">✕</span>
      <span class="exit-text">{{ t('article.exitReadingMode') }}</span>
    </button>

    <ArticleHeader :article="article" @go-back="goBack" @edit="goEdit" />

    <section class="article-area">
      <div class="detail-grid" :class="`layout-${appStore.articleLayout}`" v-if="article">
        <div class="content-wrapper">
          <ArticleContent
            :article="article"
            :html-content="rendered.html"
            :prev-article="prevArticle ?? null"
            :next-article="nextArticle ?? null"
            @go-prev="goPrev"
            @go-next="goNext"
          />
          <CommentSection
            :comments="activeComments"
            :article-id="article.id"
            @submit="handleCommentSubmit"
          />
        </div>
        
        <!-- 文章目录 -->
        <ArticleTOC :toc="rendered.toc" />
      </div>

      <article v-else class="article-card detail-card empty-state">
        <div class="card-body">
          <h2 class="title">{{ t('article.notFound') }}</h2>
          <p class="description">{{ t('article.notFoundDesc') }}</p>
        </div>
      </article>
    </section>
  </main>
</template>

<style scoped>
.detail-layout {
  background: var(--bg);
  color: var(--text-primary);
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 240px;
  gap: 16px;
  align-items: start;
}

/* 单栏布局：隐藏 TOC */
.detail-grid.layout-single {
  grid-template-columns: 1fr;
}

.detail-grid.layout-single .toc {
  display: none;
}

/* 双栏布局：显示 TOC */
.detail-grid.layout-double {
  grid-template-columns: 1fr 240px;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.empty-state {
  background: var(--surface);
  justify-content: center;
  text-align: center;
}

.exit-reading-mode-btn {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1001;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 24px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.exit-reading-mode-btn:hover {
  background: var(--surface-2);
  border-color: var(--brand);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.exit-reading-mode-btn:active {
  transform: translateY(0);
}

.exit-icon {
  font-size: 18px;
  line-height: 1;
}

.exit-text {
  line-height: 1;
}

@media (max-width: 768px) {
  .exit-reading-mode-btn {
    top: 16px;
    right: 16px;
    padding: 8px 12px;
    font-size: 13px;
  }

  .exit-icon {
    font-size: 16px;
  }
}

@media (max-width: 1024px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }

  .detail-grid.layout-double {
    grid-template-columns: 1fr;
  }
}
</style>

