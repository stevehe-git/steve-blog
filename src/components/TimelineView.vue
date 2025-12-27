<script setup lang="ts">
/**
 * 时间轴视图组件
 * 按年份分组显示文章
 */

import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import type { Article } from '@/data/types'
import { getCoverStyle } from '@/utils/coverStyle'

interface Props {
  articles: Article[]
  sortDesc: boolean
  currentPage: number
  itemsPerPage: number
}

const props = defineProps<Props>()

const { t } = useI18n()
const router = useRouter()

/**
 * 跳转到文章详情页
 */
const goDetail = (id: string) => {
  router.push({ name: 'articleDetail', params: { id } })
}

/**
 * 按年份分组的文章列表
 */
const articlesByYear = computed(() => {
  const grouped: Record<string, Article[]> = {}
  
  // 文章已经根据 sortDesc 排序了，所以直接分组即可
  props.articles.forEach((article) => {
    const year = new Date(article.date).getFullYear().toString()
    if (!grouped[year]) {
      grouped[year] = []
    }
    grouped[year].push(article)
  })
  
  // 根据排序方向对年份进行排序
  // sortDesc 为 true（降序）：最新的年份在前（2025 → 2024 → 2023...）
  // sortDesc 为 false（升序）：最早的年份在前（2023 → 2024 → 2025...）
  const sortedYears = Object.keys(grouped).sort((a, b) => {
    return props.sortDesc ? Number(b) - Number(a) : Number(a) - Number(b)
  })
  
  return sortedYears.map((year) => ({
    year,
    articles: grouped[year] // 文章顺序已经由传入的 articles 的排序决定
  }))
})

/**
 * 时间轴视图分页后的文章列表
 * 将所有年份的文章展平，然后进行分页
 */
const paginatedArticlesByYear = computed(() => {
  // 将所有年份的文章展平
  const allArticles = articlesByYear.value.flatMap((yearGroup) =>
    (yearGroup.articles || []).map((article) => ({
      ...article,
      year: yearGroup.year
    }))
  )
  
  // 应用分页
  const start = (props.currentPage - 1) * props.itemsPerPage
  const end = start + props.itemsPerPage
  const paginated = allArticles.slice(start, end)
  
  // 重新按年份分组
  const grouped: Record<string, typeof paginated> = {}
  paginated.forEach((article) => {
    const year = (article as any).year
    if (!grouped[year]) {
      grouped[year] = []
    }
    grouped[year].push(article)
  })
  
  // 根据排序方向对年份进行排序
  // sortDesc 为 true（降序）：最新的年份在前
  // sortDesc 为 false（升序）：最早的年份在前
  const sortedYears = Object.keys(grouped).sort((a, b) => {
    return props.sortDesc ? Number(b) - Number(a) : Number(a) - Number(b)
  })
  
  return sortedYears.map((year) => ({
    year,
    articles: grouped[year] || []
  }))
})
</script>

<template>
  <div class="timeline-view">
    <div class="timeline-container">
      <div class="timeline-line"></div>
      <div
        v-for="yearGroup in paginatedArticlesByYear"
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
    <div v-if="articles.length === 0" class="empty-state">
      <p>{{ t('search.noResults') }}</p>
    </div>
  </div>
</template>

<style scoped>
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

.empty-state {
  padding: 48px 24px;
  text-align: center;
  color: var(--text-muted);
}

.empty-state p {
  margin: 0;
  font-size: 16px;
}

@media (max-width: 1024px) {
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

