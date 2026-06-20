import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Tool from '../views/Tool.vue'

const routes = [
  { path: '/', name: 'Home', component: Home, meta: { title: '真题资源' } },
  { path: '/tool', name: 'Tool', component: Tool, meta: { title: '排版工具' } },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
