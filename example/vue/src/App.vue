<template>
  <img alt="Vue logo" src="./assets/logo.png">
  <TranslationShowCase />
</template>

<script>
import { loadMessagesPromise, handleMissing } from './i18n'
import TranslationShowCase from './components/TranslationShowCase.vue'
import { useI18n } from 'vue-i18n'

export default {
  name: 'App',
  components: {
    TranslationShowCase
  },
  // used in combination with Suspense.
  // useful when translations are not in-memory...
  async setup() {
    useI18n().setMissingHandler(handleMissing);
    await loadMessagesPromise;
    return {};
  }
}
</script>

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
