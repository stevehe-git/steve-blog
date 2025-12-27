<script setup lang="ts">
/**
 * 文章列表页
 * 功能：文章列表展示、分类筛选、搜索、排序、新建文章
 */

import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { articles } from '@/data'
import { useArticleSearch } from '@/composables/useArticleSearch'
import { useCategories } from '@/composables/useCategories'
import { getCoverStyle } from '@/utils/coverStyle'
import Pagination from '@/components/Pagination.vue'

const { t } = useI18n()
const router = useRouter()

// 分类列表（从国际化配置动态获取，包含"全部"选项）
const { categories } = useCategories(true)

// 当前选中的分类（默认为"全部"）
const selectedCategory = ref('all')

/**
 * 计算每个分类下的文章数量
 */
const categoryCounts = computed(() => {
  const counts: Record<string, number> = {}
  
  // 计算"全部"分类的数量
  counts.all = articles.length
  
  // 计算每个分类的数量
  categories.value.forEach((category) => {
    if (category.key !== 'all') {
      counts[category.key] = articles.filter(
        (article) => article.categoryKey === category.key
      ).length
    }
  })
  
  return counts
})
// 排序方向（true: 降序，false: 升序）
const sortDesc = ref(true)

// 搜索功能
const { searchQuery, searchResults, highlightedResults } = useArticleSearch(articles)

// 分页功能
const itemsPerPage = ref(5) // 每页显示的文章数量，默认5个
const currentPage = ref(1) // 当前页码

// 视图模式：'list' 列表视图，'timeline' 时间轴视图
const viewMode = ref<'list' | 'timeline'>('list')

/**
 * 跳转到文章详情页
 * @param id 文章 ID
 */
const goDetail = (id: string) => {
  router.push({ name: 'articleDetail', params: { id } })
}

/**
 * 跳转到新建文章页
 */
const goNewArticle = () => {
  router.push({ name: 'articleNew' })
}

/**
 * 过滤后的文章列表（结合搜索和分类筛选）
 * 先应用搜索，再应用分类筛选，最后排序
 */
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

/**
 * 显示用的文章列表（带高亮）
 * 如果有关键词搜索，则使用高亮结果；否则使用普通结果
 */
const displayArticles = computed(() => {
  const query = searchQuery.value.trim()
  let articles = filteredArticles.value
  
  if (query) {
    articles = articles.map((article) => {
      const highlighted = highlightedResults.value.find((item) => item.id === article.id)
      return highlighted
        ? {
            ...article,
            highlightedTitle: highlighted.highlightedTitle,
            highlightedDescription: highlighted.highlightedDescription
          }
        : article
    })
  }
  
  return articles
})

/**
 * 分页后的文章列表
 */
const paginatedArticles = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return displayArticles.value.slice(start, end)
})

/**
 * 总页数
 */
const totalPages = computed(() => {
  return Math.ceil(displayArticles.value.length / itemsPerPage.value)
})


// 当筛选条件改变时，重置到第一页
const resetPage = () => {
  currentPage.value = 1
}

// 监听搜索条件变化，重置到第一页
watch([searchQuery, selectedCategory, sortDesc], () => {
  resetPage()
})

/**
 * 切换排序方向（升序/降序）
 */
const toggleSort = () => {
  sortDesc.value = !sortDesc.value
  resetPage()
}

/**
 * 切换视图模式
 */
const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'list' ? 'timeline' : 'list'
  resetPage()
}

/**
 * 按年份分组的文章列表（用于时间轴视图）
 */
const articlesByYear = computed(() => {
  const grouped: Record<string, typeof filteredArticles.value> = {}
  
  filteredArticles.value.forEach((article) => {
    const year = new Date(article.date).getFullYear().toString()
    if (!grouped[year]) {
      grouped[year] = []
    }
    grouped[year].push(article)
  })
  
  // 按年份降序排序
  const sortedYears = Object.keys(grouped).sort((a, b) => Number(b) - Number(a))
  
  return sortedYears.map((year) => ({
    year,
    articles: grouped[year]
  }))
})
</script>

<template>
  <main class="layout">
    <section class="content">
      <aside class="sidebar">
        <div class="filter-title">
          <span class="filter-icon">⌘</span>
          <span>{{ t('filter.category') }}</span>
        </div>

        <!-- 左侧分类列表按钮 -->
        <div class="category-list">
          <button
            v-for="category in categories"
            :key="category.key"
            class="category-item"
            :class="{ active: selectedCategory === category.key }"
            type="button"
            @click="selectedCategory = category.key; resetPage()"
          >
            <span class="category-label">{{ category.label }}</span>
            <span class="category-count">({{ categoryCounts[category.key] || 0 }})</span>
          </button>
        </div>
      </aside>

      <section class="article-area">
        <!-- 文章搜索框 -->
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
            <button class="view-toggle-btn" type="button" @click="toggleViewMode" :title="viewMode === 'list' ? t('actions.timelineView') : t('actions.listView')">
              <span v-if="viewMode === 'list'">📅</span>
              <span v-else>📋</span>
            </button>
            <button class="new-article-btn" type="button" @click="goNewArticle">
              + {{ t('article.new') }}
            </button>
            <button class="sort-btn" type="button" @click="toggleSort">
              {{ t('actions.sortByTime') }}
              <span class="arrow" :class="{ rotated: !sortDesc }">⌄</span>
            </button>
          </div>
        </div>
        
        <!-- 文章列表视图 -->
        <div v-if="viewMode === 'list'" class="articles">
          <article
            v-for="item in paginatedArticles"
            :key="item.id"
            class="article-card"
            role="button"
            tabindex="0"
            @click="goDetail(item.id)"
            @keyup.enter="goDetail(item.id)"
          >
            <!-- 文章徽章 -->
            <div 
              class="card-cover" 
              :style="getCoverStyle(item.cover)"
            >
              <span v-if="item.badge" class="badge">{{ item.badge }}</span>
            </div>

            <div class="card-body">
              <!-- 文章标签 -->
              <div class="tag-row">
                <span class="tag">{{ item.tag }}</span>
              </div>
              <!-- 文章标题 -->
              <span
                class="title"
                v-html="(item as any).highlightedTitle || item.title"
              ></span>
              <!-- 文章描述 -->
              <p
                class="description"
                v-html="(item as any).highlightedDescription || item.description"
              ></p>
              <!-- 文章元信息 -->
              <div class="meta">
                <!-- 创建日期 -->
                <span>{{ t('article.created') }}: {{ item.date }}</span>
                <!-- 更新时间（如果存在） -->
                <template v-if="item.updatedDate">
                  <span class="dot">·</span>
                  <span>{{ t('article.updated') }}: {{ item.updatedDate }}</span>
                </template>
                <!-- 点分隔符 -->
                <span class="dot">·</span>
                <!-- 文章平台 -->
                <span>{{ item.platform }}</span>
              </div>
            </div>
          </article>
          <div v-if="filteredArticles.length === 0" class="empty-state">
            <p>{{ t('search.noResults') }}</p>
          </div>
        </div>

        <!-- 时间轴视图 -->
        <div v-else class="timeline-view">
          <div class="timeline-container">
            <div class="timeline-line"></div>
            <div
              v-for="yearGroup in articlesByYear"
              :key="yearGroup.year"
              class="timeline-year-group"
            >
              <!-- 年份节点 -->
              <div class="timeline-year-node">
                <div class="year-circle">{{ yearGroup.year }}</div>
              </div>
              <!-- 该年份的文章列表 -->
              <div class="timeline-articles">
                <article
                  v-for="item in yearGroup.articles"
                  :key="item.id"
                  class="timeline-article"
                  role="button"
                  tabindex="0"
                  @click="goDetail(item.id)"
                  @keyup.enter="goDetail(item.id)"
                >
                  <div class="timeline-dot"></div>
                  <div class="timeline-content">
                    <div class="timeline-thumbnail" :style="getCoverStyle(item.cover)">
                      <span v-if="item.badge" class="timeline-badge">{{ item.badge }}</span>
                    </div>
                    <div class="timeline-info">
                      <div class="timeline-date">
                        <span class="date-icon">📅</span>
                        <span>{{ item.date }}</span>
                        <template v-if="item.updatedDate && item.updatedDate !== item.date">
                          <span class="date-separator">·</span>
                          <span class="updated-date">{{ t('article.updated') }}: {{ item.updatedDate }}</span>
                        </template>
                      </div>
                      <h3
                        class="timeline-title"
                        v-html="(item as any).highlightedTitle || item.title"
                      ></h3>
                      <p
                        v-if="item.description"
                        class="timeline-description"
                        v-html="(item as any).highlightedDescription || item.description"
                      ></p>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </div>
          <div v-if="filteredArticles.length === 0" class="empty-state">
            <p>{{ t('search.noResults') }}</p>
          </div>
        </div>

        <!-- 分页控件（仅列表视图显示） -->
        <Pagination
          v-if="viewMode === 'list'"
          v-model:current-page="currentPage"
          v-model:items-per-page="itemsPerPage"
          :total-pages="totalPages"
          :total-items="displayArticles.length"
          :items-per-page-options="[5, 10, 20, 50]"
        />
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

.view-toggle-btn {
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-primary);
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
}

.view-toggle-btn:hover {
  background: var(--surface-2);
  border-color: var(--brand);
  transform: scale(1.05);
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
  width: 100%;
}

/* 悬浮效果 */
.article-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.15),
    0 0 0 1px color-mix(in srgb, var(--brand) 20%, transparent),
    0 0 30px color-mix(in srgb, var(--brand) 10%, transparent);
  border-color: color-mix(in srgb, var(--brand) 30%, transparent);
}

/* 点击效果 */
.article-card:active {
  transform: translateY(-2px) scale(1.01);
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
  padding: 18px 20px 20px 20px;
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

/* 时间轴视图样式 */
.timeline-view {
  position: relative;
  padding: 20px 0;
}

.timeline-container {
  position: relative;
  padding-left: 40px;
}

.timeline-line {
  position: absolute;
  left: 20px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--border);
  z-index: 0;
}

.timeline-year-group {
  position: relative;
  margin-bottom: 40px;
}

.timeline-year-node {
  position: absolute;
  left: -40px;
  top: 0;
  z-index: 2;
}

.year-circle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: var(--brand);
  color: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 3px solid var(--bg);
}

.timeline-articles {
  margin-left: 20px;
  padding-top: 10px;
}

.timeline-article {
  position: relative;
  margin-bottom: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.timeline-article:hover {
  transform: translateX(8px);
}

.timeline-dot {
  position: absolute;
  left: -30px;
  top: 20px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--brand);
  border: 2px solid var(--bg);
  z-index: 1;
  transition: all 0.3s ease;
}

.timeline-article:hover .timeline-dot {
  transform: scale(1.3);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--brand) 20%, transparent);
}

.timeline-content {
  display: flex;
  gap: 16px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
  transition: all 0.3s ease;
}

.timeline-article:hover .timeline-content {
  border-color: var(--brand);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.timeline-thumbnail {
  width: 80px;
  height: 80px;
  min-width: 80px;
  border-radius: 8px;
  background-size: cover;
  background-position: center;
  position: relative;
  overflow: hidden;
}

.timeline-badge {
  position: absolute;
  top: 6px;
  left: 6px;
  padding: 2px 8px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--surface), #ffffff 40%);
  color: var(--text-primary);
  font-size: 10px;
  font-weight: 700;
  backdrop-filter: blur(10px);
}

.timeline-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.timeline-date {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-subtle);
  font-size: 13px;
}

.date-icon {
  font-size: 14px;
}

.date-separator {
  margin: 0 4px;
  color: var(--text-subtle);
}

.updated-date {
  color: var(--brand);
}

.timeline-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.4;
  transition: color 0.3s ease;
}

.timeline-article:hover .timeline-title {
  color: var(--brand);
}

.timeline-description {
  margin: 0;
  color: var(--text-muted);
  font-size: 14px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@media (max-width: 1024px) {
  .article-card {
    grid-template-columns: 1fr;
  }

  .article-card .card-body {
    padding: 18px 20px 20px;
  }

  .timeline-container {
    padding-left: 30px;
  }

  .timeline-year-node {
    left: -30px;
  }

  .year-circle {
    width: 40px;
    height: 40px;
    font-size: 14px;
  }

  .timeline-dot {
    left: -22px;
    width: 10px;
    height: 10px;
  }

  .timeline-thumbnail {
    width: 60px;
    height: 60px;
    min-width: 60px;
  }
}
</style>

