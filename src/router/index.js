import { createRouter, createWebHistory } from 'vue-router'
import PasteQuiz from '../components/PasteQuiz.vue'
import QuizOverview from '../components/QuizOverview.vue'
import TakeQuiz from '../components/TakeQuiz.vue'
import QuizResults from '../components/QuizResults.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: PasteQuiz
  },
  {
    path: '/quiz/:id',
    name: 'QuizOverview',
    component: QuizOverview
  },
  {
    path: '/take/:code',
    name: 'TakeQuiz',
    component: TakeQuiz,
    props: true
  },
  {
    path: '/results/:code',
    name: 'QuizResults',
    component: QuizResults,
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
