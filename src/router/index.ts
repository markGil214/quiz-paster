import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import PasteQuiz from '../components/PasteQuiz.vue'
import QuizOverview from '../components/QuizOverview.vue'
import TakeQuiz from '../components/TakeQuiz.vue'
import QuizResults from '../components/QuizResults.vue'

const routes: RouteRecordRaw[] = [
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
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: PasteQuiz
  }
]

const router = createRouter({
  history: createWebHistory('/'),
  routes
})

export default router
