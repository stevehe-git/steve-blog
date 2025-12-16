<script setup lang="ts">
type TocItem = {
  id: string
  text: string
  level: number
}

defineProps<{
  toc: TocItem[]
}>()
</script>

<template>
  <aside v-if="toc.length" class="toc">
    <div class="toc-title">目录</div>
    <nav>
      <a
        v-for="item in toc"
        :key="item.id"
        class="toc-item"
        :style="{ paddingLeft: `${(item.level - 1) * 12}px` }"
        :href="`#${item.id}`"
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

