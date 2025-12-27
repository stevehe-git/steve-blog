/**
 * 应用状态管理模块
 * 管理全局应用状态，如主题切换等
 */

import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  // 状态定义
  state: () => ({
    // 是否为深色主题
    isDark: false,
    // 文章视图模式：'list' 列表视图，'timeline' 时间轴视图
    articleViewMode: (() => {
      try {
        const stored = localStorage.getItem('articleViewMode')
        if (stored === 'list' || stored === 'timeline') {
          return stored
        }
      } catch (error) {
        console.warn('Failed to read view mode from localStorage:', error)
      }
      return 'list'
    })(),
    // 文章列表布局：'single' 单栏，'double' 双栏
    articleLayout: (() => {
      try {
        const stored = localStorage.getItem('articleLayout')
        if (stored === 'single' || stored === 'double') {
          return stored
        }
      } catch (error) {
        console.warn('Failed to read layout from localStorage:', error)
      }
      return 'single'
    })(),
    // 阅读模式：是否启用阅读模式
    readingMode: false
  }),
  // 操作方法
  actions: {
    /**
     * 切换主题（深色/浅色）
     * 切换 isDark 状态并更新 DOM 类名
     */
    toggleTheme() {
      this.isDark = !this.isDark
      // 在根元素上切换 'dark' 类名，用于 CSS 主题切换
      document.documentElement.classList.toggle('dark', this.isDark)
    },
    /**
     * 切换文章视图模式（列表/时间轴）
     */
    toggleArticleViewMode() {
      this.articleViewMode = this.articleViewMode === 'list' ? 'timeline' : 'list'
      try {
        localStorage.setItem('articleViewMode', this.articleViewMode)
      } catch (error) {
        console.warn('Failed to save view mode to localStorage:', error)
      }
    },
    /**
     * 切换文章布局（单栏/双栏）
     */
    toggleArticleLayout() {
      this.articleLayout = this.articleLayout === 'single' ? 'double' : 'single'
      try {
        localStorage.setItem('articleLayout', this.articleLayout)
      } catch (error) {
        console.warn('Failed to save layout to localStorage:', error)
      }
    },
    /**
     * 切换阅读模式
     */
    toggleReadingMode() {
      this.readingMode = !this.readingMode
      if (this.readingMode) {
        document.body.classList.add('reading-mode')
      } else {
        document.body.classList.remove('reading-mode')
      }
    }
  }
})

