<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAppStore } from './store/modules/app'

const { locale, t } = useI18n()
const route = useRoute()
const appStore = useAppStore()

const navLinks = [
  { key: 'home', path: '/home' },
  { key: 'articles', path: '/articles' },
  { key: 'contact', path: '/contact' }
]

const localeLabel = computed(() => locale.value.toUpperCase())
const isActive = (path: string) => route.path === path

const toggleLocale = () => {
  locale.value = locale.value === 'zh' ? 'en' : 'zh'
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
  </div>
</template>
