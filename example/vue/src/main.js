import { createApp } from 'vue'
import { i18n } from './i18n.js'
import Suspenser from './Suspenser.vue'

createApp(Suspenser).use(i18n).mount('#app')
