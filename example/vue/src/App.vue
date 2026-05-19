<script setup>
import { useI18n } from 'vue-i18n'
import TranslationShowCase from './components/TranslationShowCase.vue'
import { loadMessagesPromise, handleMissing } from './i18n.js'

// Register the missing-translation handler so newly-referenced keys can
// be pushed back to Locize (when apiKey is set in i18n.js).
useI18n().setMissingHandler(handleMissing)

// Wait for translations to load before rendering. Pairs with the
// <Suspense> in Suspenser.vue.
await loadMessagesPromise
</script>

<template>
  <img alt="Vue logo" src="./assets/logo.png" />
  <TranslationShowCase />
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
