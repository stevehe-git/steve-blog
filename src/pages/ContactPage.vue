<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { onMounted, ref, computed } from 'vue'

const { t } = useI18n()

// 动画状态
const isVisible = ref(false)
const mousePosition = ref({ x: 0, y: 0 })

// 联系方式数据（使用 computed 使其响应语言切换）
const contactMethods = computed(() => [
  {
    id: 'phone',
    icon: '📱',
    label: t('contact.phone'),
    value: t('contact.phoneNumber'),
    link: t('contact.phoneLink'),
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    id: 'email',
    icon: '✉️',
    label: t('contact.email'),
    value: t('contact.emailAddress'),
    link: t('contact.emailLink'),
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    id: 'github',
    icon: '💻',
    label: t('contact.github'),
    value: t('contact.githubLabel'),
    link: t('contact.githubUrl'),
    color: 'linear-gradient(135deg, #24292e 0%, #586069 100%)',
    external: true
  },
  {
    id: 'wechat',
    icon: '💬',
    label: t('contact.wechat'),
    value: t('contact.wechatAccount'),
    link: t('contact.wechatUrl'),
    color: 'linear-gradient(135deg, #07c160 0%, #06ad56 100%)',
    external: true
  }
])

onMounted(() => {
  // 渐入动画
  setTimeout(() => {
    isVisible.value = true
  }, 100)

  // 鼠标跟随效果
  const handleMouseMove = (e: MouseEvent) => {
    mousePosition.value = {
      x: (e.clientX / window.innerWidth) * 100,
      y: (e.clientY / window.innerHeight) * 100
    }
  }
  window.addEventListener('mousemove', handleMouseMove)

  return () => {
    window.removeEventListener('mousemove', handleMouseMove)
  }
})
</script>

<template>
  <main class="contact-page">
    <!-- Hero Section -->
    <section class="hero-section" :class="{ visible: isVisible }">
      <div class="hero-content">
        <h1 class="title">{{ t('hero.contactTitle') }}</h1>
        <p class="subtitle">{{ t('hero.contactDesc') }}</p>
      </div>
      <div class="hero-decoration">
        <div class="gradient-orb orb-1"></div>
        <div class="gradient-orb orb-2"></div>
        <div class="gradient-orb orb-3"></div>
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

    <!-- Contact Cards -->
    <section class="contact-section" :class="{ visible: isVisible }">
      <div class="contact-grid">
        <a
          v-for="(method, index) in contactMethods"
          :key="method.id"
          :href="method.link"
          :target="method.external ? '_blank' : undefined"
          :rel="method.external ? 'noopener noreferrer' : undefined"
          class="contact-card"
          :style="{ 
            animationDelay: `${index * 0.2}s`,
            '--card-color': method.color
          }"
        >
          <div class="card-icon" :style="{ background: method.color }">
            <span class="icon-emoji">{{ method.icon }}</span>
          </div>
          <div class="card-content">
            <h3 class="card-label">{{ method.label }}</h3>
            <p class="card-value">{{ method.value }}</p>
          </div>
          <div class="card-arrow">→</div>
        </a>
      </div>
    </section>

    <!-- Additional Info -->
    <section class="info-section" :class="{ visible: isVisible }">
      <div class="info-card">
        <div class="info-icon">💬</div>
        <h3 class="info-title">{{ t('contact.available') }}</h3>
        <p class="info-desc">{{ t('contact.availableDesc') }}</p>
      </div>
    </section>
  </main>
</template>

<style scoped>
.contact-page {
  min-height: 100vh;
  padding: 0;
  position: relative;
  overflow-x: hidden;
}

/* Hero Section */
.hero-section {
  position: relative;
  min-height: 50vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 100px 28px 60px;
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
  max-width: 700px;
}

.title {
  font-size: clamp(40px, 6vw, 72px);
  font-weight: 800;
  margin: 0 0 20px;
  background: linear-gradient(135deg, var(--brand) 0%, var(--text-muted) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 1px;
}

.subtitle {
  font-size: 18px;
  color: var(--text-muted);
  line-height: 1.6;
  margin: 0;
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

/* Contact Section */
.contact-section {
  padding: 60px 28px;
  max-width: 1000px;
  margin: 0 auto;
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s;
}

.contact-section.visible {
  opacity: 1;
  transform: translateY(0);
}

.contact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.contact-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 32px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 20px;
  text-decoration: none;
  color: var(--text-primary);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  overflow: hidden;
  opacity: 0;
  transform: translateY(20px) scale(0.95);
  animation: card-pop-in 0.6s ease forwards;
}

@keyframes card-pop-in {
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.contact-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(79, 70, 229, 0.1), transparent);
  transition: left 0.5s ease;
}

.contact-card:hover::before {
  left: 100%;
}

.contact-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  border-color: var(--brand);
}

.card-icon {
  flex-shrink: 0;
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.contact-card:hover .card-icon {
  transform: scale(1.1) rotate(5deg);
}

.icon-emoji {
  display: block;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.card-content {
  flex: 1;
  min-width: 0;
}

.card-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-muted);
  margin: 0 0 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-value {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  word-break: break-all;
}

.card-arrow {
  flex-shrink: 0;
  font-size: 24px;
  color: var(--text-subtle);
  transition: transform 0.3s ease;
}

.contact-card:hover .card-arrow {
  transform: translateX(8px);
  color: var(--brand);
}

/* Info Section */
.info-section {
  padding: 60px 28px;
  max-width: 1000px;
  margin: 0 auto;
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s ease 0.4s, transform 0.8s ease 0.4s;
}

.info-section.visible {
  opacity: 1;
  transform: translateY(0);
}

.info-card {
  text-align: center;
  padding: 40px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 20px;
  transition: all 0.3s ease;
}

.info-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow);
  border-color: var(--brand);
}

.info-icon {
  font-size: 48px;
  margin-bottom: 16px;
  display: inline-block;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.info-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 12px;
  color: var(--text-primary);
}

.info-desc {
  font-size: 16px;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.6;
}

/* Responsive */
@media (max-width: 768px) {
  .hero-section {
    min-height: 40vh;
    padding: 80px 20px 40px;
  }

  .contact-grid {
    grid-template-columns: 1fr;
  }

  .contact-card {
    padding: 24px;
  }

  .card-icon {
    width: 56px;
    height: 56px;
    font-size: 28px;
  }

  .info-card {
    padding: 32px 24px;
  }
}

@media (max-width: 480px) {
  .contact-section,
  .info-section {
    padding: 40px 20px;
  }

  .title {
    font-size: 36px;
  }

  .subtitle {
    font-size: 16px;
  }
}
</style>
