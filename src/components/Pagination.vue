<script setup lang="ts">
/**
 * 分页组件
 * 提供上一页、下一页、页码跳转等功能
 */

import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface Props {
  currentPage: number // 当前页码
  totalPages: number // 总页数
}

const props = withDefaults(defineProps<Props>(), {
  currentPage: 1,
  totalPages: 1
})

const emit = defineEmits<{
  'update:currentPage': [page: number]
  'page-change': [page: number]
}>()

/**
 * 页码列表（用于显示页码按钮）
 */
const pageNumbers = computed(() => {
  const pages: (number | string)[] = []
  const total = props.totalPages
  const current = props.currentPage
  
  if (total <= 7) {
    // 如果总页数少于等于7，显示所有页码
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    // 否则显示省略号
    if (current <= 3) {
      // 前3页
      for (let i = 1; i <= 4; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 2) {
      // 后3页
      pages.push(1)
      pages.push('...')
      for (let i = total - 3; i <= total; i++) {
        pages.push(i)
      }
    } else {
      // 中间页
      pages.push(1)
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    }
  }
  
  return pages
})

/**
 * 切换到指定页码
 */
const goToPage = (page: number | string) => {
  if (typeof page === 'number' && page >= 1 && page <= props.totalPages) {
    emit('update:currentPage', page)
    emit('page-change', page)
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

/**
 * 上一页
 */
const prevPage = () => {
  if (props.currentPage > 1) {
    const newPage = props.currentPage - 1
    emit('update:currentPage', newPage)
    emit('page-change', newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

/**
 * 下一页
 */
const nextPage = () => {
  if (props.currentPage < props.totalPages) {
    const newPage = props.currentPage + 1
    emit('update:currentPage', newPage)
    emit('page-change', newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}
</script>

<template>
  <div v-if="totalPages > 1" class="pagination">
    <button
      class="page-btn"
      :class="{ disabled: currentPage === 1 }"
      :disabled="currentPage === 1"
      @click="prevPage"
    >
      {{ t('pagination.prev') }}
    </button>
    
    <div class="page-numbers">
      <button
        v-for="page in pageNumbers"
        :key="page"
        class="page-number"
        :class="{ 
          active: page === currentPage,
          ellipsis: page === '...'
        }"
        :disabled="page === '...'"
        @click="goToPage(page)"
      >
        {{ page }}
      </button>
    </div>
    
    <button
      class="page-btn"
      :class="{ disabled: currentPage === totalPages }"
      :disabled="currentPage === totalPages"
      @click="nextPage"
    >
      {{ t('pagination.next') }}
    </button>
  </div>
</template>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 32px;
  padding: 20px 0;
}

.page-btn {
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-btn:hover:not(.disabled) {
  border-color: var(--brand);
  background: var(--surface-2);
  color: var(--brand);
}

.page-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: 4px;
}

.page-number {
  min-width: 36px;
  height: 36px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-number:hover:not(.ellipsis):not(.active) {
  border-color: var(--brand);
  background: var(--surface-2);
  color: var(--brand);
}

.page-number.active {
  background: var(--brand);
  color: var(--bg);
  border-color: var(--brand);
  font-weight: 600;
}

.page-number.ellipsis {
  border: none;
  background: transparent;
  cursor: default;
  min-width: auto;
  padding: 0 4px;
}

.page-number.ellipsis:hover {
  background: transparent;
}

@media (max-width: 1024px) {
  .pagination {
    flex-wrap: wrap;
  }

  .page-numbers {
    flex-wrap: wrap;
  }
}
</style>

