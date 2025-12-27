import { nextTick, type Ref } from 'vue'
import flowchart from 'flowchart.js'
import { escapeHtml } from '@/utils/html'

/**
 * Flowchart.js 流程图渲染 Composable
 * 负责初始化和渲染 Flowchart 图表
 */
export const useFlowchartRenderer = (contentRef: Ref<HTMLElement | undefined>) => {
  /**
   * 存储原始代码，用于重新渲染
   * 使用容器元素作为键，因为容器是稳定的
   */
  const flowchartCodeMap = new WeakMap<Element, string>()

  /**
   * 获取主题颜色配置
   */
  const getThemeColors = () => {
    const isDark = document.documentElement.classList.contains('dark')
    return {
      textColor: isDark ? '#e0e0e0' : '#000000',
      lineColor: isDark ? '#e0e0e0' : '#000000',
      fillColor: isDark ? '#2a2a2a' : '#ffffff',
      isDark
    }
  }

  /**
   * 获取 Flowchart 配置选项
   */
  const getFlowchartOptions = () => {
    const { textColor, lineColor, fillColor, isDark } = getThemeColors()
    
    return {
      'line-width': 2,
      'line-length': 50,
      'text-margin': 10,
      'font-size': 14,
      'font-color': textColor,
      'line-color': lineColor,
      'element-color': textColor,
      'fill': fillColor,
      'yes-text': 'yes',
      'no-text': 'no',
      'arrow-end': 'block',
      'scale': 1,
      'flowstate': {
        'past': { 'fill': isDark ? '#444444' : '#CCCCCC', 'font-size': 12 },
        'current': { 
          'fill': isDark ? '#4a4a00' : 'yellow', 
          'font-color': isDark ? '#ff6b6b' : 'red', 
          'font-weight': 'bold' 
        },
        'future': { 'fill': isDark ? '#666600' : '#FFFF99' },
        'request': { 'fill': isDark ? '#003366' : 'blue' },
        'invalid': { 'fill': isDark ? '#222222' : '#444444' },
        'approved': { 'fill': '#58C4A3', 'font-size': 12, 'yes-text': 'APPROVED', 'no-text': 'n/a' },
        'rejected': { 'fill': '#C45879', 'font-size': 12, 'yes-text': 'n/a', 'no-text': 'REJECTED' }
      }
    }
  }

  /**
   * 创建 SVG 容器
   */
  const createSvgContainer = (id: string): HTMLDivElement => {
    const svgContainer = document.createElement('div')
    svgContainer.className = 'flowchart-svg-container'
    svgContainer.id = id + '-svg'
    return svgContainer
  }

  /**
   * 渲染单个 Flowchart 图表
   */
  const renderFlowchartElement = (element: Element, forceRerender = false): void => {
    const id = element.id || 'flowchart-' + Math.random().toString(36).substr(2, 9)
    const container = element.parentElement?.classList.contains('flowchart-container') 
      ? element.parentElement 
      : null
    let code = ''
    
    // 获取原始代码
    code = element.textContent || ''
    
    // 如果代码为空，尝试从存储中获取（用于重新渲染）
    if (!code.trim() && forceRerender && container && flowchartCodeMap.has(container)) {
      code = flowchartCodeMap.get(container) || ''
    }
    
    // 保存原始代码（使用容器作为键）
    if (code.trim() && container && !flowchartCodeMap.has(container)) {
      flowchartCodeMap.set(container, code)
    }
    
    if (!code.trim()) return
    
    // 如果已经渲染过且不是强制重新渲染，跳过
    if (element.classList.contains('flowchart-rendered') && !forceRerender) {
      return
    }
    
    // 标记为已渲染
    element.classList.add('flowchart-rendered')
    
    try {
      // 解析流程图代码
      const diagram = flowchart.parse(code)
      
      // 创建 SVG 容器
      const svgContainer = createSvgContainer(id)
      
      // 替换原始 pre 元素
      const container = element.parentElement
      if (container && container.classList.contains('flowchart-container')) {
        container.innerHTML = ''
        container.appendChild(svgContainer)
        
        // 渲染流程图
        const options = getFlowchartOptions()
        diagram.drawSVG(id + '-svg', options)
      }
    } catch (err) {
      console.error('Flowchart 渲染失败:', err)
      // 渲染失败时显示原始代码
      handleFlowchartError(element, code)
    }
  }

  /**
   * 处理 Flowchart 渲染错误
   */
  const handleFlowchartError = (element: Element, code: string): void => {
    const container = element.parentElement
    if (container && container.classList.contains('flowchart-container')) {
      container.innerHTML = '<pre class="flowchart-error">' + escapeHtml(code) + '</pre>'
    }
  }

  /**
   * 初始化并渲染所有 Flowchart 图表
   */
  const initFlowchart = (forceRerender = false): void => {
    nextTick(() => {
      if (!contentRef.value) return
      
      // 查找所有 Flowchart 容器
      const containerSelector = '.flowchart-container'
      const containers = contentRef.value.querySelectorAll(containerSelector)
      
      // 先恢复所有容器的原始代码（如果需要重新渲染）
      if (forceRerender) {
        containers.forEach((container) => {
          // 强制重新渲染：查找容器内的 SVG，恢复为 pre 元素
          const svgContainer = container.querySelector('.flowchart-svg-container')
          if (svgContainer && flowchartCodeMap.has(container)) {
            // 从存储中获取原始代码
            const code = flowchartCodeMap.get(container) || ''
            const preId = 'flowchart-' + Math.random().toString(36).substr(2, 9)
            if (code) {
              container.innerHTML = `<pre class="flowchart" id="${preId}">${code}</pre>`
            }
          }
        })
      }
      
      // 等待 DOM 更新后，再查找并渲染所有 pre.flowchart 元素
      const renderDelay = forceRerender ? 50 : 0
      setTimeout(() => {
        if (!contentRef.value) return
        
        // 重新查找容器（因为可能已经恢复为 pre 元素）
        const containerSelector = '.flowchart-container'
        const currentContainers = contentRef.value.querySelectorAll(containerSelector)
        
        currentContainers.forEach((container) => {
          // 查找容器内的 pre.flowchart 元素
          const preElement = container.querySelector('pre.flowchart')
          if (preElement) {
            renderFlowchartElement(preElement, forceRerender)
          }
        })
      }, renderDelay)
    })
  }

  /**
   * 重新渲染所有 Flowchart 图表（用于主题切换）
   */
  const rerenderFlowchart = (): void => {
    initFlowchart(true)
  }

  return {
    initFlowchart,
    rerenderFlowchart
  }
}

