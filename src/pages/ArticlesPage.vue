<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { articles } from '@/data/articles'
import { useArticleSearch } from '@/composables/useArticleSearch'

const { t } = useI18n()
const router = useRouter()

type CategoryOption = {
  key: string
  label: string
}

const categories = computed<CategoryOption[]>(() => [
  { key: 'all', label: t('categories.all') },
  { key: 'dit', label: t('categories.dit') },
  { key: 'luna', label: t('categories.luna') },
  { key: 'note', label: t('categories.note') },
  { key: 'art', label: t('categories.art') },
  { key: 'travel', label: t('categories.travel') }
])

const selectedCategory = ref('all')
const sortDesc = ref(true)

// 搜索功能
const { searchQuery, searchResults, highlightedResults } = useArticleSearch(articles)

const goDetail = (id: number) => {
  router.push({ name: 'articleDetail', params: { id } })
}

const goNewArticle = () => {
  router.push({ name: 'articleNew' })
}

// 结合搜索和分类筛选
const filteredArticles = computed(() => {
  // 先应用搜索
  let matched = searchResults.value

  // 再应用分类筛选
  if (selectedCategory.value !== 'all') {
    matched = matched.filter((item) => item.categoryKey === selectedCategory.value)
  }

  // 排序
  return matched.slice().sort((a, b) => {
    const diff = new Date(a.date).getTime() - new Date(b.date).getTime()
    return sortDesc.value ? -diff : diff
  })
})

// 获取高亮后的文章（用于显示）
const displayArticles = computed(() => {
  const query = searchQuery.value.trim()
  if (!query) return filteredArticles.value

  return filteredArticles.value.map((article) => {
    const highlighted = highlightedResults.value.find((item) => item.id === article.id)
    return highlighted
      ? {
          ...article,
          highlightedTitle: highlighted.highlightedTitle,
          highlightedDescription: highlighted.highlightedDescription
        }
      : article
  })
})

const toggleSort = () => {
  sortDesc.value = !sortDesc.value
}
</script>

<template>
  <main class="layout">
    <section class="hero">
      <h1>{{ t('hero.articlesTitle') }}</h1>
      <p>{{ t('hero.articlesDesc') }}</p>
    </section>

    <section class="content">
      <aside class="sidebar">
        <div class="filter-title">
          <span class="filter-icon">⌘</span>
          <span>{{ t('filter.category') }}</span>
        </div>
        <div class="category-list">
          <button
            v-for="category in categories"
            :key="category.key"
            class="category-item"
            :class="{ active: selectedCategory === category.key }"
            type="button"
            @click="selectedCategory = category.key"
          >
            {{ category.label }}
          </button>
        </div>
      </aside>

      <section class="article-area">
        <div class="search-section">
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input
              v-model="searchQuery"
              type="text"
              class="search-input"
              :placeholder="t('search.placeholder')"
            />
            <button
              v-if="searchQuery"
              class="clear-btn"
              type="button"
              @click="searchQuery = ''"
            >
              ×
            </button>
          </div>
        </div>

        <div class="list-header">
          <div class="article-count">
            {{ t('articles.count', { count: filteredArticles.length }) }}
            <span v-if="searchQuery" class="search-hint">
              {{ t('search.results', { query: searchQuery }) }}
            </span>
          </div>
          <div class="header-actions">
            <button class="new-article-btn" type="button" @click="goNewArticle">
              + {{ t('article.new') }}
            </button>
            <button class="sort-btn" type="button" @click="toggleSort">
              {{ t('actions.sortByTime') }}
              <span class="arrow" :class="{ rotated: !sortDesc }">⌄</span>
            </button>
          </div>
        </div>

        <div class="articles">
          <article
            v-for="item in displayArticles"
            :key="item.id"
            class="article-card"
            role="button"
            tabindex="0"
            @click="goDetail(item.id)"
            @keyup.enter="goDetail(item.id)"
          >
            <div class="card-cover" :style="{ background: item.cover }">
              <span v-if="item.badge" class="badge">{{ item.badge }}</span>
            </div>
            <div class="card-body">
              <div class="tag-row">
                <span class="tag">{{ item.tag }}</span>
              </div>
              <span
                class="title"
                v-html="(item as any).highlightedTitle || item.title"
              ></span>
              <p
                class="description"
                v-html="(item as any).highlightedDescription || item.description"
              ></p>
              <div class="meta">
                <span>{{ item.date }}</span>
                <span class="dot">·</span>
                <span>{{ item.platform }}</span>
              </div>
            </div>
          </article>
          <div v-if="filteredArticles.length === 0" class="empty-state">
            <p>{{ t('search.noResults') }}</p>
          </div>
        </div>
      </section>
    </section>
  </main>
</template>

<style scoped>
.search-section {
  margin-bottom: 16px;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 0 12px;
  transition: border-color 0.2s ease;
}

.search-box:focus-within {
  border-color: var(--brand);
}

.search-icon {
  font-size: 18px;
  margin-right: 8px;
  color: var(--text-muted);
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  color: var(--text-primary);
  font-size: 14px;
  padding: 12px 0;
  outline: none;
}

.search-input::placeholder {
  color: var(--text-subtle);
}

.clear-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  background: var(--surface-2);
  color: var(--text-primary);
}

.search-hint {
  margin-left: 8px;
  color: var(--text-subtle);
  font-size: 12px;
  font-weight: normal;
}

.empty-state {
  padding: 48px 24px;
  text-align: center;
  color: var(--text-muted);
}

.empty-state p {
  margin: 0;
  font-size: 16px;
}

.title :deep(mark),
.description :deep(mark) {
  background: var(--brand);
  color: var(--bg);
  padding: 2px 4px;
  border-radius: 4px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.new-article-btn {
  padding: 8px 16px;
  border-radius: 10px;
  border: 1px solid var(--brand);
  background: var(--brand);
  color: var(--bg);
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s ease;
  font-size: 14px;
}

.new-article-btn:hover {
  opacity: 0.9;
}

/* ArticlesPage 专用卡片样式 */
.article-card {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 18px;
  border: 1px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
  background: var(--surface);
  box-shadow: var(--shadow);
  cursor: pointer;
  position: relative;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateY(0) scale(1.05);
}

/* 悬浮效果 */
.article-card:hover {
  transform: translateY(-8px) scale(1.08);
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.15),
    0 0 0 1px color-mix(in srgb, var(--brand) 20%, transparent),
    0 0 30px color-mix(in srgb, var(--brand) 10%, transparent);
  border-color: color-mix(in srgb, var(--brand) 30%, transparent);
}

/* 点击效果 */
.article-card:active {
  transform: translateY(-4px) scale(1.06);
  transition: all 0.15s ease;
}

/* 光晕效果 */
.article-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 16px;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--brand) 5%, transparent) 0%,
    transparent 50%,
    color-mix(in srgb, var(--brand) 5%, transparent) 100%
  );
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
  z-index: 0;
}

.article-card:hover::before {
  opacity: 1;
}

.article-card .card-cover {
  position: relative;
  min-height: 150px;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  overflow: hidden;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;
}

/* 封面图片缩放效果 */
.article-card:hover .card-cover {
  transform: scale(1.1);
}

/* 封面渐变遮罩 */
.article-card .card-cover::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0.1) 100%
  );
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.article-card:hover .card-cover::after {
  opacity: 1;
}

.article-card .badge {
  margin: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--surface), #ffffff 40%);
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.3px;
  transition: all 0.3s ease;
  z-index: 2;
  position: relative;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 徽章悬浮效果 */
.article-card:hover .badge {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  background: color-mix(in srgb, var(--surface), #ffffff 60%);
}

.article-card .card-body {
  padding: 18px 20px 20px 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: relative;
  z-index: 1;
  transition: transform 0.3s ease;
}

/* 卡片内容微动画 */
.article-card:hover .card-body {
  transform: translateX(4px);
}

.article-card .tag-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.article-card .tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  background: var(--tag-bg);
  color: var(--tag-text);
  font-weight: 600;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

/* 标签悬浮效果 */
.article-card:hover .tag {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* 标签光效 */
.article-card .tag::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  transition: left 0.5s ease;
}

.article-card:hover .tag::before {
  left: 100%;
}

.article-card .title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.3;
  transition: all 0.3s ease;
  position: relative;
  display: inline-block;
}

/* 标题悬浮效果 */
.article-card:hover .title {
  color: var(--brand);
  transform: translateX(2px);
}

.article-card .description {
  margin: 0;
  color: var(--text-muted);
  font-size: 14px;
  transition: color 0.3s ease;
}

/* 描述悬浮效果 */
.article-card:hover .description {
  color: var(--text-primary);
}

.article-card .meta {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-subtle);
  font-size: 13px;
  transition: all 0.3s ease;
}

/* 元信息悬浮效果 */
.article-card:hover .meta {
  color: var(--text-muted);
  transform: translateX(2px);
}

.article-card .dot {
  color: var(--text-subtle);
}

@media (max-width: 1024px) {
  .article-card {
    grid-template-columns: 1fr;
  }

  .article-card .card-body {
    padding: 18px 20px 20px;
  }
}
</style>

