import { nextTick, type Ref } from 'vue'
import flowchart from 'flowchart.js'
import { escapeHtml } from '@/utils/html'

/**
 * Flowchart.js 流程图渲染 Composable
 * 负责初始化和渲染 Flowchart 图表
 */
export const useFlowchartRenderer = (contentRef: Ref<HTMLElement | undefined>) => {
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
  const renderFlowchartElement = (element: Element): void => {
    const id = element.id || 'flowchart-' + Math.random().toString(36).substr(2, 9)
    const code = element.textContent || ''
    
    if (!code.trim()) return
    
    // 标记为已渲染，避免重复渲染
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
  const initFlowchart = (): void => {
    nextTick(() => {
      if (!contentRef.value) return
      
      // 查找所有未渲染的 flowchart 图表
      const flowchartElements = contentRef.value.querySelectorAll('pre.flowchart:not(.flowchart-rendered)')
      
      flowchartElements.forEach((element) => {
        renderFlowchartElement(element)
      })
    })
  }

  return {
    initFlowchart
  }
}

