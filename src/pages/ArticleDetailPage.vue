<script setup lang="ts">
/**
 * 文章详情页
 * 功能：文章内容展示、Markdown 渲染、目录导航、评论、上一篇/下一篇导航
 */

import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
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

// 组件挂载时加载评论数据
onMounted(() => {
  loadComments()
})
</script>

<template>
  <main class="layout detail-layout">
    <ArticleHeader :article="article" @go-back="goBack" @edit="goEdit" />

    <section class="article-area">
      <div class="detail-grid" v-if="article">
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

@media (max-width: 1024px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>

