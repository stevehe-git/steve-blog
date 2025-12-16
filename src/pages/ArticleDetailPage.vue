<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { articles, getArticleById } from '@/data/articles'
import { useArticleMarkdown } from '@/composables/useArticleMarkdown'
import { useArticleComments } from '@/composables/useArticleComments'
import ArticleHeader from '@/components/article/ArticleHeader.vue'
import ArticleContent from '@/components/article/ArticleContent.vue'
import ArticleTOC from '@/components/article/ArticleTOC.vue'
import CommentSection from '@/components/article/CommentSection.vue'

const route = useRoute()
const router = useRouter()

const { loadComments, getComments, addComment } = useArticleComments()

const article = computed(() => {
  const id = Number(route.params.id)
  return Number.isFinite(id) ? getArticleById(id) ?? null : null
})

const content = computed(() => article.value?.content ?? '')
const rendered = useArticleMarkdown(content)

const currentIndex = computed(() => {
  if (!article.value) return -1
  return articles.findIndex((item) => item.id === article.value?.id)
})

const prevArticle = computed(() =>
  currentIndex.value > 0 ? articles[currentIndex.value - 1] : null
)
const nextArticle = computed(() =>
  currentIndex.value >= 0 && currentIndex.value < articles.length - 1
    ? articles[currentIndex.value + 1]
    : null
)

const activeComments = computed(() => {
  const id = article.value?.id
  if (!id) return []
  return getComments(id)
})

const goBack = () => {
  router.back()
}

const goPrev = () => {
  if (prevArticle.value) {
    router.push({ name: 'articleDetail', params: { id: prevArticle.value.id } })
  }
}

const goNext = () => {
  if (nextArticle.value) {
    router.push({ name: 'articleDetail', params: { id: nextArticle.value.id } })
  }
}

const goEdit = () => {
  if (article.value) {
    router.push({ name: 'articleEdit', params: { id: article.value.id } })
  }
}

const handleCommentSubmit = (form: { author: string; content: string }) => {
  if (!article.value) return
  addComment(article.value.id, form)
}

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

        <ArticleTOC :toc="rendered.toc" />
      </div>

      <article v-else class="article-card detail-card empty-state">
        <div class="card-body">
          <h2 class="title">未找到该文章</h2>
          <p class="description">请返回列表重试</p>
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

