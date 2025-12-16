import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/articles'
    },
    {
      path: '/home',
      name: 'home',
      component: () => import('@/pages/HomePage.vue')
    },
    {
      path: '/articles',
      name: 'articles',
      component: () => import('@/pages/ArticlesPage.vue')
    },
    {
      path: '/articles/:id',
      name: 'articleDetail',
      component: () => import('@/pages/ArticleDetailPage.vue')
    },
    {
      path: '/articles/new',
      name: 'articleNew',
      component: () => import('@/pages/ArticleEditPage.vue')
    },
    {
      path: '/articles/:id/edit',
      name: 'articleEdit',
      component: () => import('@/pages/ArticleEditPage.vue')
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => import('@/pages/ContactPage.vue')
    }
  ],
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router

