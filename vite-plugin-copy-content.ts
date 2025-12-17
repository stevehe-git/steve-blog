/**
 * Vite 插件：在构建时将 content 目录复制到 dist/content
 */

import { readdirSync, copyFileSync, mkdirSync, statSync } from 'fs'
import { join, resolve } from 'path'
import type { Plugin } from 'vite'

export function copyContentPlugin(): Plugin {
  return {
    name: 'copy-content',
    closeBundle() {
      const srcContentDir = resolve(process.cwd(), 'content')
      const distContentDir = resolve(process.cwd(), 'dist/content')

      try {
        // 检查源目录是否存在
        if (!statSync(srcContentDir).isDirectory()) {
          console.warn('content directory does not exist, skipping copy')
          return
        }

        // 创建目标目录
        mkdirSync(distContentDir, { recursive: true })

        // 复制所有文件
        const files = readdirSync(srcContentDir)
        let copiedCount = 0

        for (const file of files) {
          const srcPath = join(srcContentDir, file)
          const distPath = join(distContentDir, file)

          const stat = statSync(srcPath)
          if (stat.isFile()) {
            copyFileSync(srcPath, distPath)
            copiedCount++
          }
        }

        console.log(`✓ Copied ${copiedCount} file(s) from content to dist/content`)
      } catch (error) {
        console.error('Failed to copy content directory:', error)
      }
    }
  }
}

