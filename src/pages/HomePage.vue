<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import Section from '@/components/home/Section.vue'
import SkillCategory from '@/components/home/SkillCategory.vue'
import ProjectCard from '@/components/home/ProjectCard.vue'
import EducationCard from '@/components/home/EducationCard.vue'
import { articles, initializeArticles } from '@/data'
import { useCategories } from '@/composables/useCategories'

const { t } = useI18n()
const router = useRouter()

// 分类列表（不包含"全部"选项）
const { categories } = useCategories(false)

// 文章总数
const totalArticles = computed(() => articles.length)

// 分类总数
const totalCategories = computed(() => categories.value.length)

// 技能数据
const skills = {
  programming: [
    { name: 'C/C++', years: 6 },
    { name: 'Python', years: null },
    { name: 'QT/QML', years: null },
    { name: 'ROS', years: null },
    { name: 'Flutter', years: null },
    { name: 'HTML/JS', years: null },
    { name: 'yolo', years: null }
  ],
  protocols: ['Websocket', 'TCP/IP', 'HTTP', 'MQTT', 'RTSP', 'ROS'],
  tools: ['VSCode', 'GDB', 'Valgrind', 'CMake', 'Git', 'Docker', 'CI/CD']
}

// 动画状态
const isVisible = ref(false)
const typedText = ref('')
const isTyping = ref(true)
const mousePosition = ref({ x: 0, y: 0 })
const experienceCount = ref(0)

// 打字机效果
const fullName = computed(() => t('hero.name'))

/**
 * 跳转到文章列表页
 */
const goToArticles = () => {
  router.push({ name: 'articles' })
}

onMounted(async () => {
  // 确保文章已加载
  await initializeArticles()
  
  // Hero 渐入动画
  setTimeout(() => {
    isVisible.value = true
  }, 100)

  // 打字机效果
  let charIndex = 0
  const typeInterval = setInterval(() => {
    if (charIndex < fullName.value.length) {
      typedText.value = fullName.value.slice(0, charIndex + 1)
      charIndex++
    } else {
      clearInterval(typeInterval)
      isTyping.value = false
    }
  }, 150)

  // 经验数字计数动画
  const targetCount = 6
  const duration = 2000
  const steps = 60
  const increment = targetCount / steps
  const stepDuration = duration / steps
  let currentStep = 0
  const countInterval = setInterval(() => {
    currentStep++
    experienceCount.value = Math.min(Math.floor(increment * currentStep), targetCount)
    if (currentStep >= steps) {
      clearInterval(countInterval)
      experienceCount.value = targetCount
    }
  }, stepDuration)

  // 鼠标跟随效果
  const handleMouseMove = (e: MouseEvent) => {
    mousePosition.value = {
      x: (e.clientX / window.innerWidth) * 100,
      y: (e.clientY / window.innerHeight) * 100
    }
  }
  window.addEventListener('mousemove', handleMouseMove)

  // 滚动触发动画
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in')
      }
    })
  }, observerOptions)

  // 组件内部已处理动画，这里不再需要

  return () => {
    window.removeEventListener('mousemove', handleMouseMove)
    observer.disconnect()
  }
})
</script>

<template>
  <main class="home-page">
    <!-- Hero Section -->
    <section class="hero-section" :class="{ visible: isVisible }">
      <div class="hero-content">
        <div class="greeting" :class="{ visible: isVisible }">{{ t('hero.greeting') }}</div>
        <h1 class="name">
          <span class="typed-text">{{ typedText }}</span>
          <span v-if="isTyping" class="cursor">|</span>
        </h1>
        <div class="title" :class="{ visible: isVisible && !isTyping }">{{ t('hero.title') }}</div>
        <p class="subtitle" :class="{ visible: isVisible && !isTyping }">{{ t('hero.subtitle') }}</p>
        <div class="contact-links">
          <a href="tel:13628661135" class="contact-link">
            <span class="icon">📱</span>
            <span>13628661135</span>
          </a>
          <a href="mailto:hejiaxiong94@foxmail.com" class="contact-link">
            <span class="icon">✉️</span>
            <span>hejiaxiong94@foxmail.com</span>
          </a>
        </div>
        <div class="stats-info" :class="{ visible: isVisible && !isTyping }">
          <div class="stat-item" role="button" tabindex="0" @click="goToArticles" @keyup.enter="goToArticles">
            <div class="stat-icon">📝</div>
            <div class="stat-content">
              <span class="stat-value">{{ totalArticles }}</span>
              <span class="stat-label">{{ t('home.stats.articles') }}</span>
            </div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item" role="button" tabindex="0" @click="goToArticles" @keyup.enter="goToArticles">
            <div class="stat-icon">🏷️</div>
            <div class="stat-content">
              <span class="stat-value">{{ totalCategories }}</span>
              <span class="stat-label">{{ t('home.stats.categories') }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="hero-decoration">
        <div class="gradient-orb orb-1"></div>
        <div class="gradient-orb orb-2"></div>
        <div class="gradient-orb orb-3"></div>
        <!-- 粒子背景 -->
        <div class="particles">
          <div v-for="i in 50" :key="i" class="particle" :style="{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${5 + Math.random() * 10}s`
          }"></div>
        </div>
        <!-- 鼠标跟随光效 -->
        <div 
          class="mouse-glow" 
          :style="{
            left: `${mousePosition.x}%`,
            top: `${mousePosition.y}%`
          }"
        ></div>
      </div>
    </section>

    <!-- Skills Section -->
    <Section :title="t('home.skills')" :delay="200">
      <template #default>
        <div class="skills-grid">
          <SkillCategory
            :title="t('home.programming')"
            :skills="skills.programming"
            :experience-count="experienceCount"
            :experience-label="t('home.experience')"
          />
          <SkillCategory
            :title="t('home.protocols')"
            :skills="skills.protocols.map((name: string) => ({ name }))"
          />
          <SkillCategory
            :title="t('home.tools')"
            :skills="skills.tools.map((name: string) => ({ name }))"
          />
        </div>
      </template>
    </Section>

    <!-- Projects Section -->
    <Section :title="t('home.projects')" :delay="400">
      <template #default>
        <div class="projects-grid">
          <ProjectCard
            :name="t('home.project1.name')"
            :period="t('home.project1.period')"
            :role="`${t('home.projectRole')}: ${t('home.project1.role')}`"
            :desc="t('home.project1.desc')"
          />
          <ProjectCard
            :name="t('home.project2.name')"
            :period="t('home.project2.period')"
            :role="`${t('home.projectRole')}: ${t('home.project2.role')}`"
            :desc="t('home.project2.desc')"
          />
          <ProjectCard
            :name="t('home.project3.name')"
            :period="t('home.project3.period')"
            :role="`${t('home.projectRole')}: ${t('home.project3.role')}`"
            :desc="t('home.project3.desc')"
          />
        </div>
      </template>
    </Section>

    <!-- Education Section -->
    <Section :title="t('home.education')" :delay="600">
      <template #default>
        <div class="education-list">
          <EducationCard
            :degree="t('home.master')"
            :school="t('home.university1')"
            :major="t('home.majorName')"
          />
          <EducationCard
            :degree="t('home.bachelor')"
            :school="t('home.university2')"
            :major="t('home.majorName')"
          />
        </div>
      </template>
    </Section>
  </main>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  padding: 0;
}

/* Hero Section */
.hero-section {
  position: relative;
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 28px;
  overflow: hidden;
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}

.hero-section.visible {
  opacity: 1;
  transform: translateY(0);
}

.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
  max-width: 800px;
}

.greeting {
  font-size: 18px;
  color: var(--text-muted);
  margin-bottom: 12px;
  letter-spacing: 1px;
  opacity: 0;
  transform: translateY(-20px);
  transition: opacity 0.6s ease 0.3s, transform 0.6s ease 0.3s;
}

.greeting.visible {
  opacity: 1;
  transform: translateY(0);
}

.name {
  font-size: clamp(48px, 8vw, 96px);
  font-weight: 800;
  margin: 0 0 16px;
  letter-spacing: 2px;
  min-height: 1.2em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.typed-text {
  background: linear-gradient(135deg, var(--brand) 0%, var(--text-muted) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: glow 2s ease-in-out infinite alternate;
}

.cursor {
  display: inline-block;
  width: 3px;
  height: 1em;
  background: var(--brand);
  animation: blink 1s infinite;
  margin-left: 2px;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

@keyframes glow {
  from {
    filter: drop-shadow(0 0 5px rgba(79, 70, 229, 0.5));
  }
  to {
    filter: drop-shadow(0 0 20px rgba(79, 70, 229, 0.8));
  }
}

.title {
  font-size: clamp(20px, 3vw, 28px);
  color: var(--text-primary);
  margin-bottom: 16px;
  font-weight: 600;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}

.title.visible {
  opacity: 1;
  transform: translateY(0);
}

.subtitle {
  font-size: 16px;
  color: var(--text-muted);
  line-height: 1.6;
  margin-bottom: 32px;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s;
}

.subtitle.visible {
  opacity: 1;
  transform: translateY(0);
}

.contact-links {
  display: flex;
  gap: 24px;
  justify-content: center;
  flex-wrap: wrap;
}

.contact-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 12px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  color: var(--text-primary);
  transition: all 0.3s ease;
  text-decoration: none;
}

.contact-link:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow);
  border-color: var(--brand);
}

.icon {
  font-size: 18px;
}

/* Stats Info */
.stats-info {
  display: flex;
  align-items: stretch;
  justify-content: center;
  gap: 0;
  margin-top: 40px;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.8s ease 0.4s, transform 0.8s ease 0.4s;
}

.stats-info.visible {
  opacity: 1;
  transform: translateY(0);
}

.stat-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 32px;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
}

.stat-item:hover {
  background: var(--surface-2);
  transform: translateY(-2px);
}

.stat-item:active {
  transform: translateY(0);
}

.stat-item:focus {
  outline: 2px solid var(--brand);
  outline-offset: -2px;
  border-radius: 20px;
}

.stat-item:first-child {
  border-radius: 20px 0 0 20px;
}

.stat-item:last-child {
  border-radius: 0 20px 20px 0;
}

.stat-icon {
  font-size: 32px;
  line-height: 1;
  opacity: 0.8;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
  letter-spacing: -0.5px;
}

.stat-label {
  font-size: 13px;
  color: var(--text-muted);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-divider {
  width: 1px;
  background: var(--border);
  margin: 16px 0;
}

/* 响应式 */
@media (max-width: 768px) {
  .stats-info {
    max-width: 100%;
    margin-top: 32px;
  }

  .stat-item {
    padding: 20px 24px;
    gap: 12px;
  }

  .stat-icon {
    font-size: 28px;
  }

  .stat-value {
    font-size: 28px;
  }

  .stat-label {
    font-size: 12px;
  }
}

/* Hero Decoration */
.hero-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  pointer-events: none;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.3;
  animation: float 20s ease-in-out infinite;
  will-change: transform;
}

.orb-1 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.orb-2 {
  width: 250px;
  height: 250px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  top: 60%;
  right: 15%;
  animation-delay: 5s;
}

.orb-3 {
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  bottom: 20%;
  left: 50%;
  animation-delay: 10s;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1) rotate(0deg);
  }
  33% {
    transform: translate(30px, -30px) scale(1.1) rotate(120deg);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9) rotate(240deg);
  }
}

/* 粒子背景 */
.particles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: var(--brand);
  border-radius: 50%;
  opacity: 0.6;
  animation: particle-float linear infinite;
  box-shadow: 0 0 6px currentColor;
}

@keyframes particle-float {
  0% {
    transform: translateY(0) translateX(0);
    opacity: 0;
  }
  10% {
    opacity: 0.6;
  }
  90% {
    opacity: 0.6;
  }
  100% {
    transform: translateY(-100vh) translateX(20px);
    opacity: 0;
  }
}

/* 鼠标跟随光效 */
.mouse-glow {
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(79, 70, 229, 0.15) 0%, transparent 70%);
  filter: blur(40px);
  transform: translate(-50%, -50%);
  pointer-events: none;
  transition: left 0.3s ease, top 0.3s ease;
  will-change: left, top;
}

/* Skills Grid */
.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 32px;
}

/* Projects Grid */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
}

/* Education List */
.education-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

/* Responsive */
@media (max-width: 768px) {
  .hero-section {
    min-height: 60vh;
    padding: 60px 20px;
  }

  .contact-links {
    flex-direction: column;
    align-items: stretch;
  }

  .contact-link {
    justify-content: center;
  }

  .skills-grid,
  .projects-grid,
  .education-list {
    grid-template-columns: 1fr;
  }
}
</style>
