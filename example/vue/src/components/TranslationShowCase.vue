<script setup>
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()
</script>

<template>
  <div class="hello">
    <h1>{{ t('welcome') }}</h1>
    <p>
      <i18n-t keypath="descr" tag="label" for="doc">
        <a href="https://vuejs.org/" target="_blank">{{ t('doc') }}</a>
      </i18n-t>
    </p>
    <div>
      <span>{{ t('end') }}</span> <i>{{ t('end') }}</i>
    </div>
    <hr />
    <div>
      <a v-if="locale !== 'de'" @click="locale = 'de'">DE</a>
      <strong v-if="locale === 'de'">DE</strong>
      &nbsp;|&nbsp;
      <a v-if="locale !== 'en'" @click="locale = 'en'">EN</a>
      <strong v-if="locale === 'en'">EN</strong>
    </div>
  </div>
</template>

<style scoped>
h3 {
  margin: 40px 0 0;
}
a {
  color: #42b983;
  cursor: pointer;
}
</style>
