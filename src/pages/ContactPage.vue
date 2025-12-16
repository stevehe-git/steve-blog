<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <main class="layout">
    <section class="hero">
      <h1>{{ t('hero.contactTitle') }}</h1>
      <p>{{ t('hero.contactDesc') }}</p>
    </section>
  </main>
</template>

