import { nextTick, type Ref } from 'vue'

/**
 * 代码复制功能 Composable
 * 为代码块添加复制按钮并处理复制逻辑
 */
export const useCodeCopy = (contentRef: Ref<HTMLElement | undefined>) => {
  /**
   * 复制文本到剪贴板
   */
  const copyToClipboard = async (text: string, button: HTMLElement): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text)
      showCopySuccess(button)
    } catch (err) {
      console.error('复制失败:', err)
      // 降级方案：使用传统的复制方法
      fallbackCopy(text, button)
    }
  }

  /**
   * 显示复制成功反馈
   */
  const showCopySuccess = (button: HTMLElement): void => {
    const originalText = button.textContent
    button.textContent = '已复制!'
    button.classList.add('copied')
    
    setTimeout(() => {
      button.textContent = originalText
      button.classList.remove('copied')
    }, 2000)
  }

  /**
   * 降级复制方案（使用 document.execCommand）
   */
  const fallbackCopy = (text: string, button: HTMLElement): void => {
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.opacity = '0'
    document.body.appendChild(textArea)
    textArea.select()
    
    try {
      document.execCommand('copy')
      showCopySuccess(button)
    } catch (fallbackErr) {
      console.error('降级复制也失败:', fallbackErr)
    } finally {
      document.body.removeChild(textArea)
    }
  }

  /**
   * 创建复制按钮
   */
  const createCopyButton = (codeText: string): HTMLButtonElement => {
    const copyButton = document.createElement('button')
    copyButton.className = 'copy-code-btn'
    copyButton.textContent = '复制'
    copyButton.type = 'button'
    copyButton.setAttribute('aria-label', '复制代码')
    
    copyButton.addEventListener('click', () => {
      copyToClipboard(codeText, copyButton)
    })
    
    return copyButton
  }

  /**
   * 为所有代码块添加复制按钮
   */
  const addCopyButtons = (): void => {
    nextTick(() => {
      if (!contentRef.value) return
      
      const codeBlocks = contentRef.value.querySelectorAll('pre.hljs')
      
      codeBlocks.forEach((pre) => {
        // 如果已经添加过复制按钮，跳过
        if (pre.querySelector('.copy-code-btn')) return
        
        const codeElement = pre.querySelector('code')
        if (!codeElement) return
        
        // 获取代码文本（去除 HTML 标签）
        const codeText = codeElement.textContent || codeElement.innerText || ''
        
        // 创建并添加复制按钮
        const copyButton = createCopyButton(codeText)
        pre.appendChild(copyButton)
      })
    })
  }

  return {
    addCopyButtons
  }
}

