<script setup lang="ts">
import { onMounted, watch, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Article } from '@/data/types'
// 导入样式
import 'highlight.js/styles/github.css'
import 'katex/dist/katex.min.css'
// 导入 composables
import { useCodeCopy } from '@/composables/useCodeCopy'
import { useMermaidRenderer } from '@/composables/useMermaidRenderer'
import { useFlowchartRenderer } from '@/composables/useFlowchartRenderer'
// 导入工具函数
import { getCoverStyle } from '@/utils/coverStyle'

const { t } = useI18n()

const props = defineProps<{
  article: Article
  htmlContent: string
  prevArticle: Article | null
  nextArticle: Article | null
}>()

const emit = defineEmits<{
  goPrev: []
  goNext: []
}>()

// 内容容器引用
const contentBlockRef = ref<HTMLElement>()

// 使用 composables
const { addCopyButtons } = useCodeCopy(contentBlockRef, (key: string) => {
  const translations: Record<string, string> = {
    'copy': t('code.copy'),
    'copied': t('code.copied'),
    'copyFailed': t('code.copyFailed'),
    'copyCode': t('code.copyCode')
  }
  return translations[key] || key
})
const { initMermaid } = useMermaidRenderer(contentBlockRef)
const { initFlowchart } = useFlowchartRenderer(contentBlockRef)

/**
 * 初始化所有内容渲染功能
 */
const initializeContent = () => {
  addCopyButtons()
  initMermaid()
  initFlowchart()
}

// 组件挂载时初始化
onMounted(() => {
  initializeContent()
})

// 内容变化时重新初始化
watch(() => props.htmlContent, () => {
  initializeContent()
})
</script>

<template>
  <article class="article-card detail-card">
    <div class="card-cover" :style="getCoverStyle(article.cover)">
      <span v-if="article.badge" class="badge">{{ article.badge }}</span>
    </div>
    <div class="card-body">
      <div class="tag-row">
        <span class="tag">{{ article.tag }}</span>
      </div>
      <h2 class="title">{{ article.title }}</h2>
      <p class="description">{{ article.description }}</p>
      <div class="meta">
        <span>{{ article.date }}</span>
        <span class="dot">·</span>
        <span>{{ article.platform }}</span>
        <span class="dot">·</span>
        <span>{{ article.tag }}</span>
      </div>
      <div class="nav-row">
        <button class="ghost-btn" type="button" :disabled="!prevArticle" @click="emit('goPrev')">
          ← {{ t('article.prevArticle') }}
        </button>
        <button class="ghost-btn" type="button" :disabled="!nextArticle" @click="emit('goNext')">
          {{ t('article.nextArticle') }} →
        </button>
      </div>
      <div ref="contentBlockRef" class="content-block" v-html="htmlContent"></div>
    </div>
  </article>
</template>

<style scoped>
.detail-card {
  display: grid;
  grid-template-columns: 1fr;
  gap: 18px;
  border: 1px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
  background: var(--surface);
  box-shadow: var(--shadow);
  position: relative;
}

.detail-card .card-body {
  padding: 20px;
}

.detail-card .card-cover {
  position: relative;
  min-height: 150px;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  overflow: hidden;
  z-index: 1;
}

.detail-card .badge {
  margin: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--surface), #ffffff 40%);
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.3px;
  z-index: 2;
  position: relative;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.detail-card .tag-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-card .tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  background: var(--tag-bg);
  color: var(--tag-text);
  font-weight: 600;
}

.detail-card .title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.3;
}

.detail-card .description {
  margin: 0;
  color: var(--text-muted);
  font-size: 14px;
}

.detail-card .meta {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-subtle);
  font-size: 13px;
}

.detail-card .dot {
  color: var(--text-subtle);
}

.content-block {
  padding: 16px;
  border: 1px dashed var(--border);
  border-radius: 12px;
  background: var(--surface-2);
  line-height: 1.7;
  color: var(--text-primary);
}

.content-block p {
  margin: 0;
}

.content-block h1,
.content-block h2,
.content-block h3,
.content-block h4,
.content-block h5,
.content-block h6 {
  margin: 12px 0 8px;
  line-height: 1.4;
  /* 添加滚动偏移，避免被导航栏遮挡 */
  scroll-margin-top: 100px;
}

.content-block h1 {
  font-size: 2em;
  margin-block: 0.67em;
}

.content-block h2 {
  font-size: 1.5em;
  margin-block: 0.75em;
}

.content-block h3 {
  font-size: 1.17em;
  margin-block: 0.83em;
}

.content-block h4 {
  font-size: 1em;
  margin-block: 1em;
}

.content-block h5 {
  font-size: 0.83em;
  margin-block: 1.17em;
}

.content-block h6 {
  font-size: 0.67em;
  margin-block: 1.33em;
}

.content-block ul {
  padding-left: 18px;
  margin: 8px 0 12px;
  color: var(--text-primary);
}

.content-block ol {
  padding-left: 18px;
  margin: 8px 0 12px;
  color: var(--text-primary);
}

/* 任务列表样式 - 使用 :deep() 确保 v-html 插入的内容也能应用样式 */
:deep(.content-block ul.contains-task-list) {
  list-style: none;
  padding-left: 0;
}

:deep(.content-block ul.contains-task-list li.task-list-item) {
  list-style: none;
  padding-left: 0;
  margin: 6px 0;
  display: flex;
  align-items: flex-start;
  line-height: 1.6;
}

:deep(.content-block ul.contains-task-list li.task-list-item::marker) {
  display: none;
}

:deep(.content-block ul.contains-task-list li.task-list-item::before) {
  display: none;
}

:deep(.content-block ul.contains-task-list li.task-list-item input[type="checkbox"]) {
  margin-right: 10px;
  margin-top: 2px;
  cursor: pointer;
  width: 18px;
  height: 18px;
  accent-color: var(--brand);
  flex-shrink: 0;
  appearance: checkbox;
  -webkit-appearance: checkbox;
  -moz-appearance: checkbox;
}

:deep(.content-block ul.contains-task-list li.task-list-item label) {
  cursor: pointer;
  display: inline;
  user-select: none;
  flex: 1;
  color: var(--text-primary);
}

:deep(.content-block ul.contains-task-list li.task-list-item input[type="checkbox"]:checked + label) {
  text-decoration: line-through;
  opacity: 0.7;
  color: var(--text-muted);
}

/* 引用块样式 - 使用 :deep() 确保 v-html 插入的内容也能应用样式 */
:deep(.content-block blockquote) {
  margin: 10px 0 !important;
  padding: 10px 12px !important;
  border-left: 3px solid var(--border) !important;
  background: var(--surface) !important;
  color: var(--text-primary) !important;
  display: block !important;
}

:deep(.content-block blockquote p) {
  margin: 0 !important;
}

:deep(.content-block blockquote p + p) {
  margin-top: 8px !important;
}

/* 表格样式 - 使用 :deep() 确保样式生效 */
:deep(.content-block table) {
  width: 100% !important;
  border-collapse: collapse !important;
  margin: 12px 0 !important;
  border: 1px solid var(--border) !important;
  border-radius: 8px;
  overflow: hidden;
  display: table !important;
}

:deep(.content-block table th),
:deep(.content-block table td) {
  padding: 12px !important;
  border: 1px solid var(--border) !important;
  text-align: left;
  display: table-cell !important;
}

:deep(.content-block table th) {
  background: var(--surface) !important;
  font-weight: 600 !important;
  color: var(--text-primary) !important;
}

:deep(.content-block table td) {
  background: var(--surface-2) !important;
  color: var(--text-primary) !important;
}

:deep(.content-block table tr:nth-child(even) td) {
  background: var(--surface) !important;
}

:deep(.content-block table tr:hover td) {
  background: var(--surface-2) !important;
}

/* Highlight.js 语法高亮样式 */
:deep(.content-block pre.hljs) {
  margin: 12px 0;
  padding: 16px;
  padding-top: 40px; /* 为复制按钮留出空间 */
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow-x: auto;
  font-size: 14px;
  line-height: 1.6;
  position: relative;
  background: #f6f8fa !important;
}

.dark :deep(.content-block pre.hljs) {
  background: #1e1e1e !important;
  border-color: #333 !important;
}

:deep(.content-block pre.hljs code) {
  padding: 0;
  background: transparent !important;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    'Liberation Mono', 'Courier New', monospace;
  display: block;
  white-space: pre;
  color: inherit;
}

.dark :deep(.content-block pre.hljs code) {
  color: #d4d4d4 !important;
}

/* 暗色主题下的代码高亮关键字颜色 */
.dark :deep(.content-block pre.hljs .hljs-keyword),
.dark :deep(.content-block pre.hljs .hljs-selector-tag),
.dark :deep(.content-block pre.hljs .hljs-literal),
.dark :deep(.content-block pre.hljs .hljs-title),
.dark :deep(.content-block pre.hljs .hljs-section),
.dark :deep(.content-block pre.hljs .hljs-doctag),
.dark :deep(.content-block pre.hljs .hljs-type),
.dark :deep(.content-block pre.hljs .hljs-name),
.dark :deep(.content-block pre.hljs .hljs-strong) {
  color: #569cd6 !important;
}

.dark :deep(.content-block pre.hljs .hljs-string),
.dark :deep(.content-block pre.hljs .hljs-title),
.dark :deep(.content-block pre.hljs .hljs-section),
.dark :deep(.content-block pre.hljs .hljs-built_in),
.dark :deep(.content-block pre.hljs .hljs-builtin-name),
.dark :deep(.content-block pre.hljs .hljs-selector-id),
.dark :deep(.content-block pre.hljs .hljs-selector-attr),
.dark :deep(.content-block pre.hljs .hljs-selector-pseudo),
.dark :deep(.content-block pre.hljs .hljs-addition),
.dark :deep(.content-block pre.hljs .hljs-variable),
.dark :deep(.content-block pre.hljs .hljs-template-variable),
.dark :deep(.content-block pre.hljs .hljs-attribute),
.dark :deep(.content-block pre.hljs .hljs-link) {
  color: #ce9178 !important;
}

.dark :deep(.content-block pre.hljs .hljs-comment),
.dark :deep(.content-block pre.hljs .hljs-quote),
.dark :deep(.content-block pre.hljs .hljs-deletion),
.dark :deep(.content-block pre.hljs .hljs-meta) {
  color: #6a9955 !important;
}

.dark :deep(.content-block pre.hljs .hljs-number),
.dark :deep(.content-block pre.hljs .hljs-regexp),
.dark :deep(.content-block pre.hljs .hljs-symbol),
.dark :deep(.content-block pre.hljs .hljs-variable),
.dark :deep(.content-block pre.hljs .hljs-template-variable),
.dark :deep(.content-block pre.hljs .hljs-link),
.dark :deep(.content-block pre.hljs .hljs-selector-attr),
.dark :deep(.content-block pre.hljs .hljs-selector-pseudo) {
  color: #b5cea8 !important;
}

.dark :deep(.content-block pre.hljs .hljs-function),
.dark :deep(.content-block pre.hljs .hljs-title.function_) {
  color: #dcdcaa !important;
}

/* 复制按钮样式 */
:deep(.content-block pre.hljs .copy-code-btn) {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 6px 12px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 10;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

:deep(.content-block pre.hljs .copy-code-btn:hover) {
  background: var(--surface-2);
  border-color: var(--brand);
  color: var(--brand);
}

:deep(.content-block pre.hljs .copy-code-btn.copied) {
  background: var(--brand);
  border-color: var(--brand);
  color: var(--bg);
}

:deep(.content-block pre.hljs .copy-code-btn:active) {
  transform: scale(0.95);
}

/* Mermaid 图表样式 */
:deep(.content-block .mermaid-container) {
  margin: 16px 0;
  padding: 16px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow-x: auto;
  text-align: center;
}

:deep(.content-block pre.mermaid) {
  margin: 0;
  padding: 0;
  background: transparent;
  border: none;
  font-family: inherit;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* LaTeX 数学公式样式 */
:deep(.content-block .katex) {
  font-size: 1.1em;
}

:deep(.content-block .katex-display) {
  margin: 1.5em 0;
  overflow-x: auto;
  overflow-y: hidden;
  text-align: center;
}

:deep(.content-block .katex-display > .katex) {
  display: inline-block;
  text-align: initial;
}

/* 行内数学公式 */
:deep(.content-block .katex:not(.katex-display)) {
  margin: 0 0.2em;
}

:deep(.content-block pre.mermaid svg) {
  max-width: 100%;
  height: auto;
}

/* Flowchart.js 流程图样式 */
:deep(.content-block .flowchart-container) {
  margin: 16px 0;
  padding: 16px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow-x: auto;
  text-align: center;
}

:deep(.content-block pre.flowchart) {
  margin: 0;
  padding: 0;
  background: transparent;
  border: none;
  font-family: inherit;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}

:deep(.content-block .flowchart-svg-container) {
  display: inline-block;
  margin: 0 auto;
}

:deep(.content-block .flowchart-svg-container svg) {
  max-width: 100%;
  height: auto;
}

:deep(.content-block pre.flowchart-error) {
  margin: 0;
  padding: 16px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-primary);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    'Liberation Mono', 'Courier New', monospace;
}

/* 内联代码样式 - 红色背景高亮 */
.content-block code:not(pre code) {
  background: #fff5f5;
  color: #c7254e;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    'Liberation Mono', 'Courier New', monospace;
  font-size: 0.9em;
}

.dark .content-block code:not(pre code) {
  background: #4a1a1a;
  color: #ff6b6b;
}

.content-block img {
  max-width: 100%;
  border-radius: 12px;
  display: block;
  margin: 12px 0;
}

.content-block em {
  font-style: italic;
  color: var(--text-primary);
}

.content-block strong {
  font-weight: 700;
  color: var(--text-primary);
}

.content-block strong em,
.content-block em strong {
  font-weight: 700;
  font-style: italic;
}

.content-block del {
  text-decoration: line-through;
  color: var(--text-muted);
  opacity: 0.7;
}

.content-block mark {
  background: var(--brand);
  color: var(--bg);
  padding: 2px 4px;
  border-radius: 3px;
  font-weight: 500;
}

.nav-row {
  display: flex;
  gap: 12px;
  margin: 16px 0;
}

.ghost-btn {
  padding: 8px 16px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.ghost-btn:hover:not(:disabled) {
  border-color: color-mix(in srgb, var(--border), transparent 20%);
  background: var(--surface-2);
}

.ghost-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>

