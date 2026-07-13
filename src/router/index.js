import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue'),
  },
  {
    path: '/exam',
    name: 'Exam',
    component: () => import('@/views/ExamView.vue'),
  },
  {
    path: '/result',
    name: 'Result',
    component: () => import('@/views/ResultView.vue'),
  },
  {
    path: '/mistakes',
    name: 'Mistakes',
    component: () => import('@/views/MistakeBookView.vue'),
  },
  {
    path: '/study',
    name: 'Study',
    component: () => import('@/views/StudyView.vue'),
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
