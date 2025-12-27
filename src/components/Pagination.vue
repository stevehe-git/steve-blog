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
  totalItems?: number // 总条数
  itemsPerPage?: number // 每页显示数量
  itemsPerPageOptions?: number[] // 每页数量选项
}

const props = withDefaults(defineProps<Props>(), {
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  itemsPerPage: 5,
  itemsPerPageOptions: () => [5, 10, 20, 50]
})

const emit = defineEmits<{
  'update:currentPage': [page: number]
  'update:itemsPerPage': [items: number]
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

/**
 * 改变每页显示数量
 */
const handleItemsPerPageChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const newItemsPerPage = parseInt(target.value, 10)
  emit('update:itemsPerPage', newItemsPerPage)
  // 重置到第一页
  emit('update:currentPage', 1)
  emit('page-change', 1)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <div class="pagination">
    <!-- 分页控件 -->
    <div class="pagination-controls">
      <!-- 总条数显示 -->
      <div v-if="totalItems > 0" class="total-items">
        共 {{ totalItems }} 条
      </div>
      
      <div v-if="totalPages > 1" class="pagination-buttons">
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
      
      <!-- 每页显示数量选择器 -->
      <div class="items-per-page">
        <select
          :value="itemsPerPage"
          class="items-per-page-select"
          @change="handleItemsPerPageChange"
        >
          <option
            v-for="option in itemsPerPageOptions"
            :key="option"
            :value="option"
          >
            {{ option }} / page
          </option>
        </select>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 32px;
  padding: 20px 0;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
}

.total-items {
  font-size: 14px;
  color: var(--text-muted);
  white-space: nowrap;
}

.pagination-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.items-per-page {
  display: flex;
  align-items: center;
}

.items-per-page-select {
  padding: 6px 12px;
  padding-right: 28px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 12px;
}

.items-per-page-select:hover {
  border-color: var(--brand);
}

.items-per-page-select:focus {
  border-color: var(--brand);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand) 10%, transparent);
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
  .pagination-controls {
    gap: 12px;
  }

  .page-numbers {
    flex-wrap: wrap;
  }
}
</style>

