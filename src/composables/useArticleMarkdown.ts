import { computed, type Ref } from 'vue'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
// @ts-ignore - markdown-it-mark 没有类型定义
import markdownItMark from 'markdown-it-mark'
// @ts-ignore - markdown-it-katex 没有类型定义
import markdownItKatex from 'markdown-it-katex'
import { escapeHtml } from '@/utils/html'
// @ts-ignore - markdown-it-task-lists 没有类型定义
import markdownItTaskLists from 'markdown-it-task-lists'

export type TocItem = {
  id: string
  text: string
  level: number
}

export type RenderResult = {
  html: string
  toc: TocItem[]
}

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')

// 初始化 markdown-it 实例
const md = new MarkdownIt({
  html: true, // 启用 HTML 标签
  linkify: true, // 自动将 URL 转换为链接
  typographer: true, // 启用一些语言中性的替换 + 引号美化
  breaks: true, // 转换换行符为 <br>
  highlight: function (str, lang) {
    // 支持 flowchart.js 流程图
    if (lang === 'flowchart' || lang === 'flow') {
      // 生成唯一的 ID
      const id = 'flowchart-' + Math.random().toString(36).substr(2, 9)
      return (
        '<div class="flowchart-container">' +
        '<pre class="flowchart" id="' + id + '">' +
        escapeHtml(str) +
        '</pre>' +
        '</div>'
      )
    }
    
    // 支持 Mermaid 图表（不包括 flowchart 和 graph）
    if (lang === 'mermaid' || lang === 'sequenceDiagram' || lang === 'classDiagram' || lang === 'stateDiagram' || lang === 'erDiagram' || lang === 'journey' || lang === 'gantt' || lang === 'pie' || lang === 'requirement' || lang === 'gitgraph' || lang === 'mindmap' || lang === 'timeline') {
      // 生成唯一的 ID
      const id = 'mermaid-' + Math.random().toString(36).substr(2, 9)
      return (
        '<div class="mermaid-container">' +
        '<pre class="mermaid" id="' + id + '">' +
        escapeHtml(str) +
        '</pre>' +
        '</div>'
      )
    }
    
    // 支持其他代码高亮
    if (lang && hljs.getLanguage(lang)) {
      try {
        return (
          '<pre class="hljs"><code class="language-' +
          escapeHtml(lang) +
          '">' +
          hljs.highlight(str, { language: lang }).value +
          '</code></pre>'
        )
      } catch (__) {
        // 如果高亮失败，返回未高亮的代码
      }
    }
    // 如果没有指定语言或语言不支持，使用默认转义
    return (
      '<pre class="hljs"><code>' +
      escapeHtml(str) +
      '</code></pre>'
    )
  }
})

// 使用 markdown-it-mark 插件支持 ==标记文本==
md.use(markdownItMark)

// 使用 markdown-it-katex 插件支持 LaTeX 数学公式
md.use(markdownItKatex)

// 使用 markdown-it-task-lists 插件支持任务列表（checkbox）
md.use(markdownItTaskLists, { enabled: true, label: true, labelAfter: true })

// 从 inline tokens 中提取纯文本
const extractTextFromTokens = (tokens: any[] | null | undefined): string => {
  if (!tokens || !Array.isArray(tokens)) {
    return ''
  }
  let text = ''
  for (const token of tokens) {
    if (token?.type === 'text' && token.content) {
      text += token.content
    } else if (token?.type === 'code_inline' && token.content) {
      text += token.content
    } else if (token?.children) {
      text += extractTextFromTokens(token.children)
    }
  }
  return text
}

// 配置 markdown-it 插件：为标题添加 id 属性
md.use(function (md) {
  const originalHeadingOpen = md.renderer.rules.heading_open || function (tokens, idx, options, _env, self) {
    return self.renderToken(tokens, idx, options)
  }

  md.renderer.rules.heading_open = function (tokens, idx, options, env, self) {
    const token = tokens[idx]
    if (!token) {
      return originalHeadingOpen(tokens, idx, options, env, self)
    }
    
    const level = parseInt(token.tag.slice(1))
    
    // 获取标题文本
    let text = ''
    let i = idx + 1
    while (i < tokens.length && tokens[i]?.type !== 'heading_close') {
      const currentToken = tokens[i]
      if (currentToken?.type === 'inline') {
        // 从 inline token 的 children 中提取纯文本
        if (currentToken.children) {
          text = extractTextFromTokens(currentToken.children)
        } else {
          text = currentToken.content || ''
        }
        break
      }
      i++
    }
    
    // 生成 id
    const baseId = slugify(text)
    const headingCount = env.headingCount || {}
    const count = headingCount[baseId] || 0
    headingCount[baseId] = count + 1
    const id = count ? `${baseId}-${count}` : baseId
    
    // 保存到环境变量中，供后续提取 TOC 使用
    if (!env.toc) {
      env.toc = []
    }
    env.toc.push({ id, text, level })
    
    // 添加 id 属性
    token.attrSet('id', id)
    
    return originalHeadingOpen(tokens, idx, options, env, self)
  }
})

export const parseMarkdown = (mdContent: string): RenderResult => {
  const env: any = {
    toc: [],
    headingCount: {}
  }
  
  const html = md.render(mdContent, env)
  
  return {
    html,
    toc: env.toc || []
  }
}

export const useArticleMarkdown = (content: Ref<string>) =>
  computed<RenderResult>(() => parseMarkdown(content.value || ''))

