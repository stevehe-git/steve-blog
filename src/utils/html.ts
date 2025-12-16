/**
 * HTML 转义工具函数
 * 用于防止 XSS 攻击，将特殊字符转换为 HTML 实体
 */
export const escapeHtml = (text: string): string =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')

