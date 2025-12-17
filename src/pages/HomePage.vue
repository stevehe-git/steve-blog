<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { onMounted, ref, computed } from 'vue'

const { t } = useI18n()

// 技能数据
const skills = {
  programming: [
    { name: 'C/C++', years: 6 },
    { name: 'Python', years: null },
    { name: 'QT/QML', years: null },
    { name: 'ROS', years: null },
    { name: 'Flutter', years: null },
    { name: 'HTML/JS', years: null }
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

onMounted(() => {
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

  // 观察所有需要动画的元素
  setTimeout(() => {
    document.querySelectorAll('.skill-tag, .project-card, .education-item').forEach((el) => {
      observer.observe(el)
    })
  }, 500)

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
    <section class="skills-section" :class="{ visible: isVisible }">
      <h2 class="section-title">{{ t('home.skills') }}</h2>
      
      <div class="skills-grid">
        <div class="skill-category">
          <h3 class="category-title">{{ t('home.programming') }}</h3>
          <div class="skill-tags">
            <span
              v-for="(skill, index) in skills.programming"
              :key="skill.name"
              class="skill-tag"
              :style="{ animationDelay: `${index * 0.1}s` }"
            >
              {{ skill.name }}
              <span v-if="skill.years" class="years">{{ experienceCount }}{{ t('home.experience') }}</span>
            </span>
          </div>
        </div>

        <div class="skill-category">
          <h3 class="category-title">{{ t('home.protocols') }}</h3>
          <div class="skill-tags">
            <span
              v-for="protocol in skills.protocols"
              :key="protocol"
              class="skill-tag"
            >
              {{ protocol }}
            </span>
          </div>
        </div>

        <div class="skill-category">
          <h3 class="category-title">{{ t('home.tools') }}</h3>
          <div class="skill-tags">
            <span
              v-for="tool in skills.tools"
              :key="tool"
              class="skill-tag"
            >
              {{ tool }}
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- Projects Section -->
    <section class="projects-section" :class="{ visible: isVisible }">
      <h2 class="section-title">{{ t('home.projects') }}</h2>
      
      <div class="projects-grid">
        <div class="project-card">
          <div class="project-header">
            <h3 class="project-name">{{ t('home.project1.name') }}</h3>
            <span class="project-period">{{ t('home.project1.period') }}</span>
          </div>
          <!-- <div class="project-company">{{ t('home.project1.company') }}</div> -->
          <div class="project-role">{{ t('home.projectRole') }}: {{ t('home.project1.role') }}</div>
          <p class="project-desc">{{ t('home.project1.desc') }}</p>
        </div>

        <div class="project-card">
          <div class="project-header">
            <h3 class="project-name">{{ t('home.project2.name') }}</h3>
            <span class="project-period">{{ t('home.project2.period') }}</span>
          </div>
          <!-- <div class="project-company">{{ t('home.project2.company') }}</div> -->
          <div class="project-role">{{ t('home.projectRole') }}: {{ t('home.project2.role') }}</div>
          <p class="project-desc">{{ t('home.project2.desc') }}</p>
        </div>

        <div class="project-card">
          <div class="project-header">
            <h3 class="project-name">{{ t('home.project3.name') }}</h3>
            <span class="project-period">{{ t('home.project3.period') }}</span>
          </div>
          <!-- <div class="project-company">{{ t('home.project3.company') }}</div> -->
          <div class="project-role">{{ t('home.projectRole') }}: {{ t('home.project3.role') }}</div>
          <p class="project-desc">{{ t('home.project3.desc') }}</p>
        </div>
      </div>
    </section>

    <!-- Education Section -->
    <section class="education-section" :class="{ visible: isVisible }">
      <h2 class="section-title">{{ t('home.education') }}</h2>
      
      <div class="education-list">
        <div class="education-item">
          <div class="education-degree">{{ t('home.master') }}</div>
          <div class="education-school">{{ t('home.university1') }}</div>
          <div class="education-major">{{ t('home.majorName') }}</div>
        </div>
        <div class="education-item">
          <div class="education-degree">{{ t('home.bachelor') }}</div>
          <div class="education-school">{{ t('home.university2') }}</div>
          <div class="education-major">{{ t('home.majorName') }}</div>
        </div>
      </div>
    </section>
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

/* Section Styles */
.skills-section,
.projects-section,
.education-section {
  padding: 60px 28px;
  max-width: 1200px;
  margin: 0 auto;
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}

.skills-section.visible {
  opacity: 1;
  transform: translateY(0);
  transition-delay: 0.2s;
}

.projects-section.visible {
  opacity: 1;
  transform: translateY(0);
  transition-delay: 0.4s;
}

.education-section.visible {
  opacity: 1;
  transform: translateY(0);
  transition-delay: 0.6s;
}

.section-title {
  font-size: clamp(28px, 4vw, 40px);
  font-weight: 700;
  margin-bottom: 40px;
  text-align: center;
  color: var(--text-primary);
  letter-spacing: 1px;
  position: relative;
  display: inline-block;
  width: 100%;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 4px;
  background: linear-gradient(90deg, transparent, var(--brand), transparent);
  border-radius: 2px;
  animation: line-expand 1s ease forwards;
}

@keyframes line-expand {
  from {
    width: 0;
  }
  to {
    width: 60px;
  }
}

/* Skills Grid */
.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 32px;
}

.skill-category {
  padding: 24px;
  background: var(--surface-2);
  border-radius: 16px;
  border: 1px solid var(--border);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
}

.skill-category::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(79, 70, 229, 0.1), transparent);
  transition: left 0.5s ease;
}

.skill-category:hover::before {
  left: 100%;
}

.skill-category:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
  border-color: var(--brand);
}

.category-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--text-primary);
}

.skill-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.skill-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  font-size: 14px;
  color: var(--text-primary);
  transition: all 0.3s ease;
  opacity: 0;
  transform: translateY(20px) scale(0.8);
  animation: tag-pop-in 0.5s ease forwards;
}

.skill-tag.animate-in {
  opacity: 1;
  transform: translateY(0) scale(1);
}

@keyframes tag-pop-in {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.skill-tag:hover {
  background: var(--brand);
  color: var(--bg);
  transform: scale(1.1) rotate(2deg);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}

.years {
  font-size: 12px;
  opacity: 0.7;
  margin-left: 4px;
}

/* Projects Grid */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
}

.project-card {
  padding: 28px;
  background: var(--surface-2);
  border-radius: 16px;
  border: 1px solid var(--border);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  opacity: 0;
  transform: translateY(30px) rotateX(10deg);
  perspective: 1000px;
}

.project-card.animate-in {
  opacity: 1;
  transform: translateY(0) rotateX(0deg);
  animation: card-flip-in 0.6s ease forwards;
}

@keyframes card-flip-in {
  from {
    opacity: 0;
    transform: translateY(30px) rotateX(10deg);
  }
  to {
    opacity: 1;
    transform: translateY(0) rotateX(0deg);
  }
}

.project-card:hover {
  transform: translateY(-8px) rotateX(-2deg) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  border-color: var(--brand);
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  gap: 16px;
}

.project-name {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
  flex: 1;
}

.project-period {
  font-size: 14px;
  color: var(--text-muted);
  white-space: nowrap;
}

.project-company {
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 8px;
}

.project-role {
  font-size: 14px;
  color: var(--text-subtle);
  margin-bottom: 16px;
}

.project-desc {
  font-size: 15px;
  line-height: 1.6;
  color: var(--text-muted);
  margin: 0;
}

/* Education Section */
.education-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.education-item {
  padding: 24px;
  background: var(--surface-2);
  border-radius: 16px;
  border: 1px solid var(--border);
  text-align: center;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  opacity: 0;
  transform: scale(0.9);
}

.education-item.animate-in {
  opacity: 1;
  transform: scale(1);
  animation: scale-in 0.5s ease forwards;
}

@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.education-item:hover {
  transform: translateY(-6px) scale(1.05);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  border-color: var(--brand);
}

.education-degree {
  font-size: 16px;
  font-weight: 600;
  color: var(--brand);
  margin-bottom: 8px;
}

.education-school {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.education-major {
  font-size: 14px;
  color: var(--text-muted);
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

  .project-header {
    flex-direction: column;
    gap: 8px;
  }

  .project-period {
    align-self: flex-start;
  }
}

@media (max-width: 480px) {
  .skills-section,
  .projects-section,
  .education-section {
    padding: 40px 20px;
  }
}
</style>
