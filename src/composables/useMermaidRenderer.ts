import { nextTick, type Ref } from 'vue'
import mermaid from 'mermaid'
import { escapeHtml } from '@/utils/html'

/**
 * Mermaid 图表渲染 Composable
 * 负责初始化和渲染 Mermaid 图表
 */
export const useMermaidRenderer = (contentRef: Ref<HTMLElement | undefined>) => {
  let mermaidInitialized = false
  let currentTheme: 'default' | 'dark' = 'default'

  /**
   * 获取当前主题
   */
  const getCurrentTheme = (): 'default' | 'dark' => {
    const isDark = document.documentElement.classList.contains('dark')
    return isDark ? 'dark' : 'default'
  }

  /**
   * 初始化或重新初始化 Mermaid 配置
   */
  const initializeMermaid = (forceReinit = false): void => {
    const newTheme = getCurrentTheme()
    
    // 如果主题改变了，需要重新初始化
    if (forceReinit || !mermaidInitialized || currentTheme !== newTheme) {
      mermaid.initialize({
        startOnLoad: false,
        theme: newTheme,
        securityLevel: 'loose',
        themeVariables: newTheme === 'dark' ? {
          primaryColor: '#2a2a2a',
          primaryTextColor: '#e0e0e0',
          primaryBorderColor: '#e0e0e0',
          lineColor: '#e0e0e0',
          secondaryColor: '#1a1a1a',
          tertiaryColor: '#333',
          background: '#1e1e1e',
          mainBkg: '#2a2a2a',
          secondBkg: '#1a1a1a',
          textColor: '#e0e0e0',
          border1: '#e0e0e0',
          border2: '#9ca3af',
          noteBkgColor: '#2a2a2a',
          noteTextColor: '#e0e0e0',
          noteBorderColor: '#e0e0e0',
          actorBorder: '#e0e0e0',
          actorBkg: '#2a2a2a',
          actorTextColor: '#e0e0e0',
          actorLineColor: '#e0e0e0',
          labelBoxBkgColor: '#2a2a2a',
          labelBoxBorderColor: '#e0e0e0',
          labelTextColor: '#e0e0e0',
          loopTextColor: '#e0e0e0',
          activationBorderColor: '#e0e0e0',
          activationBkgColor: '#1a1a1a',
          sequenceNumberColor: '#e0e0e0',
          sectionBkgColor: '#2a2a2a',
          altBkgColor: '#1a1a1a',
          clusterBkg: '#2a2a2a',
          clusterBorder: '#e0e0e0',
          defaultLinkColor: '#e0e0e0',
          titleColor: '#e0e0e0',
          edgeLabelBackground: '#2a2a2a',
          compositeBackground: '#2a2a2a',
          compositeTitleBackground: '#1a1a1a',
          compositeBorder: '#e0e0e0',
          stateLabelColor: '#e0e0e0',
          stateBkg: '#2a2a2a',
          labelBorderColor: '#e0e0e0',
          errorBkgColor: '#4a1a1a',
          errorTextColor: '#ff6b6b'
        } : undefined
      })
      mermaidInitialized = true
      currentTheme = newTheme
    }
  }

  /**
   * 存储原始代码，用于重新渲染
   * 使用容器元素作为键，因为容器是稳定的
   */
  const mermaidCodeMap = new WeakMap<Element, string>()

  /**
   * 渲染单个 Mermaid 图表
   */
  const renderMermaidElement = (element: Element, forceRerender = false): void => {
    const id = element.id || 'mermaid-' + Math.random().toString(36).substr(2, 9)
    const container = element.parentElement?.classList.contains('mermaid-container') 
      ? element.parentElement 
      : null
    let code = ''
    
    // 获取原始代码
    code = element.textContent || ''
    
    // 如果代码为空，尝试从存储中获取（用于重新渲染）
    if (!code.trim() && forceRerender && container && mermaidCodeMap.has(container)) {
      code = mermaidCodeMap.get(container) || ''
    }
    
    // 保存原始代码（使用容器作为键，只在首次保存）
    if (code.trim() && container && !mermaidCodeMap.has(container)) {
      mermaidCodeMap.set(container, code)
    }
    
    if (!code.trim()) return
    
    // 如果已经渲染过且不是强制重新渲染，跳过
    if (element.classList.contains('mermaid-rendered') && !forceRerender) {
      return
    }
    
    // 标记为已渲染
    element.classList.add('mermaid-rendered')
    
    // 使用 Mermaid 渲染
    const renderId = id + '-svg'
    mermaid.render(renderId, code)
      .then((result) => {
        // 创建新的容器来显示 SVG
        const container = element.parentElement
        if (container && container.classList.contains('mermaid-container')) {
          container.innerHTML = result.svg
        } else {
          element.innerHTML = result.svg
        }
      })
      .catch((err) => {
        console.error('Mermaid 渲染失败:', err)
        // 渲染失败时显示原始代码
        handleMermaidError(element, code)
      })
  }

  /**
   * 处理 Mermaid 渲染错误
   */
  const handleMermaidError = (element: Element, code: string): void => {
    const container = element.parentElement
    if (container && container.classList.contains('mermaid-container')) {
      container.innerHTML = '<pre class="mermaid-error">' + escapeHtml(code) + '</pre>'
    }
  }

  /**
   * 初始化并渲染所有 Mermaid 图表
   */
  const initMermaid = (forceRerender = false): void => {
    nextTick(() => {
      if (!contentRef.value) return
      
      // 如果主题改变了，需要重新初始化
      const newTheme = getCurrentTheme()
      if (forceRerender || currentTheme !== newTheme) {
        initializeMermaid(true)
      } else {
        initializeMermaid()
      }
      
      // 查找所有 Mermaid 容器
      const containerSelector = '.mermaid-container'
      const containers = contentRef.value.querySelectorAll(containerSelector)
      
      // 先恢复所有容器的原始代码（如果需要重新渲染）
      if (forceRerender) {
        containers.forEach((container) => {
          // 强制重新渲染：查找容器内的 SVG，恢复为 pre 元素
          const svg = container.querySelector('svg')
          if (svg && mermaidCodeMap.has(container)) {
            // 从存储中获取原始代码
            const code = mermaidCodeMap.get(container) || ''
            const preId = 'mermaid-' + Math.random().toString(36).substr(2, 9)
            if (code) {
              container.innerHTML = `<pre class="mermaid" id="${preId}">${code}</pre>`
            }
          }
        })
      }
      
      // 等待 DOM 更新后，再查找并渲染所有 pre.mermaid 元素
      const renderDelay = forceRerender ? 50 : 0
      setTimeout(() => {
        if (!contentRef.value) return
        
        // 重新查找容器（因为可能已经恢复为 pre 元素）
        const currentContainers = contentRef.value.querySelectorAll(containerSelector)
        
        currentContainers.forEach((container) => {
          // 查找容器内的 pre.mermaid 元素
          const preElement = container.querySelector('pre.mermaid')
          if (preElement) {
            renderMermaidElement(preElement, forceRerender)
          }
        })
        
        // 也查找不在容器内的 mermaid 元素（兼容旧格式）
        const standaloneSelector = forceRerender 
          ? 'pre.mermaid' 
          : 'pre.mermaid:not(.mermaid-rendered)'
        const standaloneElements = contentRef.value.querySelectorAll(standaloneSelector)
        standaloneElements.forEach((element) => {
          // 确保不在容器内的元素也被渲染
          if (!element.closest('.mermaid-container')) {
            renderMermaidElement(element, forceRerender)
          }
        })
      }, renderDelay)
    })
  }

  /**
   * 重新渲染所有 Mermaid 图表（用于主题切换）
   */
  const rerenderMermaid = (): void => {
    initMermaid(true)
  }

  return {
    initMermaid,
    rerenderMermaid
  }
}

