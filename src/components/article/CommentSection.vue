<script setup lang="ts">
import { reactive } from 'vue'
import type { CommentItem } from '@/composables/useArticleComments'

type CommentForm = {
  author: string
  content: string
}

const props = defineProps<{
  comments: CommentItem[]
  articleId: number
}>()

const emit = defineEmits<{
  submit: [form: CommentForm]
}>()

const form = reactive<CommentForm>({
  author: '',
  content: ''
})

const handleSubmit = () => {
  const contentVal = form.content.trim()
  if (!contentVal) return
  emit('submit', {
    author: form.author,
    content: contentVal
  })
  form.author = ''
  form.content = ''
}
</script>

<template>
  <section class="comments">
    <header class="comments__header">
      <h3>评论</h3>
      <span class="comments__count">{{ comments.length }} 条</span>
    </header>
    <ul v-if="comments.length" class="comments__list">
      <li v-for="item in comments" :key="item.id" class="comment">
        <div class="comment__header">
          <span class="comment__author">{{ item.author }}</span>
          <span class="comment__time">
            {{ new Date(item.createdAt).toLocaleString() }}
          </span>
        </div>
        <p class="comment__content">{{ item.content }}</p>
      </li>
    </ul>
    <p v-else class="comments__empty">暂无评论，快来写第一条吧。</p>

    <form class="comment-form" @submit.prevent="handleSubmit">
      <div class="form-row">
        <label>
          昵称（可选）
          <input v-model="form.author" placeholder="你的昵称" />
        </label>
      </div>
      <div class="form-row">
        <label>
          评论内容
          <textarea
            v-model="form.content"
            rows="4"
            required
            placeholder="写下你的想法..."
          ></textarea>
        </label>
      </div>
      <button class="submit-btn" type="submit">发布评论</button>
    </form>
  </section>
</template>

<style scoped>
.comments {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--border);
}

.comments__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.comments__header h3 {
  margin: 0;
  font-size: 18px;
  color: var(--text-primary);
}

.comments__count {
  color: var(--text-muted);
  font-size: 14px;
}

.comments__list {
  list-style: none;
  padding: 0;
  margin: 0 0 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment {
  padding: 12px;
  background: var(--surface-2);
  border-radius: 10px;
  border: 1px solid var(--border);
}

.comment__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.comment__author {
  font-weight: 600;
  color: var(--text-primary);
}

.comment__time {
  font-size: 12px;
  color: var(--text-subtle);
}

.comment__content {
  margin: 0;
  color: var(--text-primary);
  line-height: 1.6;
}

.comments__empty {
  margin: 0 0 24px;
  padding: 16px;
  text-align: center;
  color: var(--text-muted);
  background: var(--surface-2);
  border-radius: 10px;
}

.comment-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-row label {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
}

.form-row input,
.form-row textarea {
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-primary);
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.form-row input:focus,
.form-row textarea:focus {
  outline: none;
  border-color: var(--brand);
}

.form-row textarea {
  resize: vertical;
  font-family: inherit;
  width: 100%;
}

.submit-btn {
  align-self: flex-start;
  padding: 10px 20px;
  border-radius: 10px;
  border: none;
  background: var(--brand);
  color: var(--bg);
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.submit-btn:hover {
  opacity: 0.9;
}
</style>

