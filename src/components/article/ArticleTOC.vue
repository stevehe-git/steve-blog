<script setup lang="ts">
import { useI18n } from 'vue-i18n'

type TocItem = {
  id: string
  text: string
  level: number
}

defineProps<{
  toc: TocItem[]
}>()

const { t } = useI18n()

/**
 * 处理目录项点击，滚动到对应位置并添加偏移量避免被导航栏遮挡
 */
const handleTocClick = (e: Event, itemId: string) => {
  e.preventDefault()
  const targetElement = document.getElementById(itemId)
  if (targetElement) {
    // 计算偏移量（导航栏高度 + 一些额外间距）
    const offset = 100
    const elementPosition = targetElement.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.pageYOffset - offset

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    })
    
    // 更新 URL hash（不触发滚动）
    history.replaceState(null, '', `#${itemId}`)
  }
}
</script>

<template>
  <aside v-if="toc.length" class="toc">
    <div class="toc-title">{{ t('toc.title') }}</div>
    <nav>
      <a
        v-for="item in toc"
        :key="item.id"
        class="toc-item"
        :style="{ paddingLeft: `${(item.level - 1) * 12}px` }"
        :href="`#${item.id}`"
        @click="handleTocClick($event, item.id)"
      >
        {{ item.text }}
      </a>
    </nav>
  </aside>
</template>

<style scoped>
.toc {
  position: sticky;
  top: 100px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.toc-title {
  font-weight: 700;
  color: var(--text-primary);
}

.toc-item {
  display: block;
  color: var(--text-muted);
  padding: 6px 4px;
  border-radius: 8px;
  transition: background 0.2s ease, color 0.2s ease;
  text-decoration: none;
}

.toc-item:hover {
  background: var(--surface-2);
  color: var(--text-primary);
}

@media (max-width: 1024px) {
  .toc {
    display: none;
  }
}
</style>

