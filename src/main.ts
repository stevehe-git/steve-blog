/**
 * 应用入口文件
 * 负责初始化 Vue 应用、路由、状态管理和国际化
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import i18n from './i18n'
import { initializeArticles } from './data'
import './style.css'
import App from './App.vue'

// 创建 Vue 应用实例
const app = createApp(App)

// 创建 Pinia 状态管理实例
const pinia = createPinia()

// 注册插件：状态管理、路由、国际化
app.use(pinia)
app.use(router)
app.use(i18n)

// 初始化文章系统（从 public/content 目录加载 Markdown 文件）
initializeArticles().catch((error) => {
  console.error('Failed to initialize articles:', error)
})

// 挂载应用到 DOM
app.mount('#app')
