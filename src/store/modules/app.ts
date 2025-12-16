import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    isDark: false
  }),
  actions: {
    toggleTheme() {
      this.isDark = !this.isDark
      document.documentElement.classList.toggle('dark', this.isDark)
    }
  }
})

