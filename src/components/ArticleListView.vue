<script setup lang="ts">
/**
 * 文章列表视图组件
 * 以卡片形式展示文章列表
 */

import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import type { Article } from '@/data/types'
import { getCoverStyle } from '@/utils/coverStyle'

interface Props {
  articles: Article[]
  empty?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  empty: false
})

const { t } = useI18n()
const router = useRouter()

/**
 * 跳转到文章详情页
 */
const goDetail = (id: string) => {
  router.push({ name: 'articleDetail', params: { id } })
}
</script>

<template>
  <div class="articles">
    <article
      v-for="item in articles"
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
    <div v-if="empty" class="empty-state">
      <p>{{ t('search.noResults') }}</p>
    </div>
  </div>
</template>

<style scoped>
.articles {
  display: flex;
  flex-direction: column;
  gap: 18px;
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

@media (max-width: 1024px) {
  .article-card {
    grid-template-columns: 1fr;
  }

  .article-card .card-body {
    padding: 18px 20px 20px;
  }
}
</style>

