/**
 * 国际化配置
 * 使用 vue-i18n 实现多语言支持，默认支持中英文
 */

import { createI18n } from 'vue-i18n'
import zh from './locales/zh.json'
import en from './locales/en.json'

// 创建 i18n 实例
const i18n = createI18n({
  // 使用 Composition API 模式（非 legacy 模式）
  legacy: false,
  // 默认语言：从本地存储读取，如果没有则使用中文
  locale: localStorage.getItem('lang') || 'zh',
  // 回退语言：如果当前语言没有翻译，使用英文
  fallbackLocale: 'en',
  // 语言包
  messages: {
    zh,
    en
  },
  // 禁用链接格式解析，避免 mailto: 和 tel: 格式错误
  warnHtmlMessage: false
})

export default i18n

