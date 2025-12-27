<script setup lang="ts">
/**
 * 根组件 App.vue
 * 负责应用的整体布局，包括导航栏、路由视图、语言切换和主题切换
 */

import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAppStore } from './store/modules/app'
import FloatingActionButtons from './components/FloatingActionButtons.vue'

// 国际化相关
const { locale, t } = useI18n()
// 路由相关
const route = useRoute()
// 应用状态管理
const appStore = useAppStore()

// 导航链接配置
const navLinks = [
  { key: 'home', path: '/home' },
  { key: 'articles', path: '/articles' },
  { key: 'contact', path: '/contact' }
]

// 计算属性：当前语言标签（大写显示）
const localeLabel = computed(() => locale.value.toUpperCase())

// 判断路由是否激活
const isActive = (path: string) => route.path === path

// 切换语言（中英文）
const toggleLocale = () => {
  locale.value = locale.value === 'zh' ? 'en' : 'zh'
  // 保存语言偏好到本地存储
  localStorage.setItem('lang', locale.value)
}
</script>

<template>
  <div class="page">
    <header class="top-nav">
      <div class="brand">BLOG</div>
      <div class="nav-actions">
        <nav class="nav-links">
          <RouterLink
            v-for="link in navLinks"
            :key="link.path"
            :to="link.path"
            class="nav-link"
            :class="{ active: isActive(link.path) }"
          >
            {{ t(`nav.${link.key}`) }}
          </RouterLink>
        </nav>
        <div class="icon-actions">
          <button class="icon-btn" type="button" aria-label="language toggle" @click="toggleLocale">
            {{ localeLabel }}
          </button>
          <button class="icon-btn" type="button" aria-label="theme toggle" @click="appStore.toggleTheme()">
            {{ appStore.isDark ? '☀' : '☾' }}
          </button>
        </div>
      </div>
    </header>

    <RouterView />

    <!-- 悬浮操作按钮 -->
    <FloatingActionButtons />
  </div>
</template>
