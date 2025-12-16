import { nextTick, type Ref } from 'vue'
import mermaid from 'mermaid'
import { escapeHtml } from '@/utils/html'

/**
 * Mermaid 图表渲染 Composable
 * 负责初始化和渲染 Mermaid 图表
 */
export const useMermaidRenderer = (contentRef: Ref<HTMLElement | undefined>) => {
  let mermaidInitialized = false

  /**
   * 初始化 Mermaid 配置（只初始化一次）
   */
  const initializeMermaid = (): void => {
    if (!mermaidInitialized) {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose'
      })
      mermaidInitialized = true
    }
  }

  /**
   * 渲染单个 Mermaid 图表
   */
  const renderMermaidElement = (element: Element): void => {
    const id = element.id || 'mermaid-' + Math.random().toString(36).substr(2, 9)
    const code = element.textContent || ''
    
    if (!code.trim()) return
    
    // 标记为已渲染，避免重复渲染
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
  const initMermaid = (): void => {
    nextTick(() => {
      if (!contentRef.value) return
      
      initializeMermaid()
      
      // 查找所有未渲染的 Mermaid 图表
      const mermaidElements = contentRef.value.querySelectorAll('pre.mermaid:not(.mermaid-rendered)')
      
      mermaidElements.forEach((element) => {
        renderMermaidElement(element)
      })
    })
  }

  return {
    initMermaid
  }
}

