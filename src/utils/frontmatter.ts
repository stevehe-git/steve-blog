/**
 * Frontmatter 解析工具
 * 用于从 Markdown 文件中提取 YAML frontmatter
 */

export interface Frontmatter {
  title?: string
  description?: string
  categoryKey?: string
  tag?: string
  badge?: string
  date?: string
  platform?: string
  cover?: string
  [key: string]: any
}

/**
 * 解析 YAML frontmatter
 * @param content Markdown 文件内容
 * @returns 包含 frontmatter 和 body 的对象
 */
export function parseFrontmatter(content: string): {
  frontmatter: Frontmatter
  body: string
} {
  const frontmatter: Frontmatter = {}
  let body = content

  // 检查是否有 frontmatter（以 --- 开头）
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/
  const match = content.match(frontmatterRegex)

  if (match && match[1] && match[2]) {
    const frontmatterText = match[1]
    body = match[2]

    // 简单的 YAML 解析（支持基本的 key: value 格式）
    const lines = frontmatterText.split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue

      const colonIndex = trimmed.indexOf(':')
      if (colonIndex > 0) {
        const key = trimmed.substring(0, colonIndex).trim()
        let value = trimmed.substring(colonIndex + 1).trim()

        // 移除引号
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1)
        }

        frontmatter[key] = value
      }
    }
  }

  return { frontmatter, body }
}

/**
 * 从文件名提取日期和标题
 * 支持格式：YYYY-MM-DD-title.md 或 title.md
 * @param filename 文件名
 * @returns 包含 date 和 title 的对象
 */
export function extractInfoFromFilename(filename: string): {
  date?: string
  title?: string
} {
  const nameWithoutExt = filename.replace(/\.md$/, '')
  const dateMatch = nameWithoutExt.match(/^(\d{4}-\d{2}-\d{2})-(.+)$/)

  if (dateMatch && dateMatch[1] && dateMatch[2]) {
    return {
      date: dateMatch[1],
      title: dateMatch[2].replace(/-/g, ' ')
    }
  }

  return {
    title: nameWithoutExt.replace(/-/g, ' ')
  }
}

/**
 * 从 Markdown 内容提取第一段作为描述
 * @param content Markdown 内容
 * @returns 描述文本
 */
export function extractDescription(content: string): string {
  // 移除 frontmatter
  const { body } = parseFrontmatter(content)

  // 移除标题（# 开头）
  const withoutHeaders = body.replace(/^#+\s+.*$/gm, '')

  // 提取第一段非空文本
  const paragraphs = withoutHeaders
    .split('\n\n')
    .map((p) => p.trim())
    .filter((p) => p.length > 0 && !p.startsWith('```'))

  if (paragraphs.length > 0 && paragraphs[0]) {
    // 移除 Markdown 格式标记
    return paragraphs[0]
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // 链接
      .replace(/\*\*([^\*]+)\*\*/g, '$1') // 粗体
      .replace(/\*([^\*]+)\*/g, '$1') // 斜体
      .replace(/`([^`]+)`/g, '$1') // 代码
      .trim()
      .substring(0, 150) // 限制长度
  }

  return ''
}

