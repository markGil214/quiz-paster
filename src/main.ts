import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'

try {
  const app = createApp(App)
  app.use(router)
  app.mount('#app')
} catch (error) {
  console.error('Error mounting Vue app:', error)
}
