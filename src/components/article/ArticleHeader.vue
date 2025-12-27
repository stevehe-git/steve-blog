<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { Article } from '@/data/types'

defineProps<{
  article: Article | null
}>()

const emit = defineEmits<{
  goBack: []
  edit: []
}>()

const { t } = useI18n()
</script>

<template>
  <section class="hero detail-hero">
    <div class="header-actions">
      <button class="back-btn" type="button" @click="emit('goBack')">← {{ t('article.back') }}</button>
      <button v-if="article" class="edit-btn" type="button" @click="emit('edit')">✎ {{ t('article.edit') }}</button>
    </div>
    <div class="title-area" v-if="article">
      <span class="badge" v-if="article.badge">{{ article.badge }}</span>
      <h1>{{ article.title }}</h1>
      <p class="meta">
        <span>{{ t('article.created') }}: {{ article.date }}</span>
        <template v-if="article.updatedDate">
          <span class="dot">·</span>
          <span>{{ t('article.updated') }}: {{ article.updatedDate }}</span>
        </template>
        <span class="dot">·</span>
        <span>{{ article.platform }}</span>
        <span class="dot">·</span>
        <span>{{ article.tag }}</span>
      </p>
    </div>
    <div v-else class="title-area">
      <h1>{{ t('article.notFound') }}</h1>
      <p class="meta">{{ t('article.notFoundDesc') }}</p>
    </div>
  </section>
</template>

<style scoped>
.detail-hero {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.back-btn,
.edit-btn {
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
}

.back-btn:hover,
.edit-btn:hover {
  border-color: color-mix(in srgb, var(--border), transparent 20%);
  background: var(--surface-2);
  color: var(--text-primary);
}

.edit-btn {
  color: var(--brand);
}

.edit-btn:hover {
  border-color: var(--brand);
  background: color-mix(in srgb, var(--brand), transparent 90%);
}

.title-area h1 {
  margin: 4px 0 2px;
  font-size: clamp(32px, 4vw, 44px);
}

.meta {
  margin: 0;
  color: var(--text-subtle);
}

.dot {
  padding: 0 6px;
  opacity: 0.7;
}

.badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--tag-bg);
  color: var(--tag-text);
  font-size: 12px;
  font-weight: 700;
}
</style>

